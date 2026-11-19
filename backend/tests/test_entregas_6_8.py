"""Pruebas de las entregas 6–8: anclaje, custodia, caché y paginación.

Siguen la regla del proyecto: nada toca la red. Stellar, R2 y Google se
sustituyen por dobles; la base es un SQLite en memoria por prueba.
"""

from __future__ import annotations

from sqlalchemy import select

from app.core.config import settings
from app.models.lote import Evento, Lote
from app.services import lotes as servicio
from app.services.sha256 import verificar_cadena
from app.services.stellar import StellarError
from tests.conftest import payload_lote

EVENTO = {
    "tipo": "empaque",
    "fecha": "2027-03-14T09:00:00-05:00",
    "descripcion": "10 cubetas en caja con etiqueta QR.",
}


def _crear(client, **kwargs) -> dict:
    res = client.post("/api/lotes", json=payload_lote(), **kwargs)
    assert res.status_code == 201, res.text
    return res.json()


# --- HU-24 / HU-25: anclaje asíncrono y reintentos ---------------------------

def test_ancla_en_segundo_plano_y_es_idempotente(client, db_session, monkeypatch):
    lote_json = _crear(client)
    assert lote_json["anclaje_estado"] == "pendiente"

    lote = db_session.scalar(select(Lote).where(Lote.codigo == lote_json["codigo"]))
    assert lote.stellar_tx_hash  # la tarea de fondo ya corrió
    assert lote.anclaje_estado == "anclado"
    assert lote.intentos_anclaje == 1

    llamadas: list[int] = []
    monkeypatch.setattr(
        "app.services.lotes.anchor_hash",
        lambda codigo, hash_hex: llamadas.append(1)
        or {"tx_hash": "tx-otra", "ledger": 1},
    )
    assert servicio.anclar_lote(db_session, lote) is True
    assert llamadas == []  # ya anclado: no genera otra transacción


def test_job_reancla_cuando_horizon_se_recupera(client, db_session, monkeypatch):
    def _caido(codigo, hash_hex):
        raise StellarError("Horizon inaccesible")

    monkeypatch.setattr("app.services.lotes.anchor_hash", _caido)
    codigo = _crear(client)["codigo"]

    lote = db_session.scalar(select(Lote).where(Lote.codigo == codigo))
    assert lote.anclaje_estado == "fallido"
    assert lote.intentos_anclaje == 1
    assert lote.anclaje_error

    monkeypatch.setattr(
        "app.services.lotes.anchor_hash",
        lambda c, h: {"tx_hash": "tx-recuperado", "ledger": 1234},
    )
    assert servicio.reintentar_pendientes(db_session) == 1
    db_session.refresh(lote)
    assert lote.anclaje_estado == "anclado"
    assert lote.anclaje_error is None


def test_job_marca_fallido_definitivo_tras_el_tope(client, db_session, monkeypatch):
    def _caido(codigo, hash_hex):
        raise StellarError("Horizon inaccesible")

    monkeypatch.setattr("app.services.lotes.anchor_hash", _caido)
    monkeypatch.setattr(settings, "anclaje_reintentos_max", 1)
    codigo = _crear(client)["codigo"]

    lote = db_session.scalar(select(Lote).where(Lote.codigo == codigo))
    assert lote.intentos_anclaje == 1

    assert servicio.reintentar_pendientes(db_session) == 0
    db_session.refresh(lote)
    assert lote.anclaje_estado == "fallido_definitivo"


# --- HU-27: solo el dueño escribe eventos ------------------------------------

def test_otro_productor_no_puede_escribir_eventos(sin_sesion, sesion, sesion_otro):
    codigo = sin_sesion.post(
        "/api/lotes", json=payload_lote(), headers=sesion
    ).json()["codigo"]

    ajeno = sin_sesion.post(
        f"/api/lotes/{codigo}/eventos", json=EVENTO, headers=sesion_otro
    )
    assert ajeno.status_code == 403
    assert sin_sesion.get(f"/api/lotes/{codigo}/eventos").json()[0]["tipo"] == "cosecha"


def test_lote_heredado_solo_admite_la_via_interna(
    sin_sesion, sesion, db_session, monkeypatch
):
    monkeypatch.setattr(settings, "api_key", "secreta-123")
    heredado = Lote(
        id="lote-heredado",
        codigo="HUE-2026-900",
        fecha_cosecha="2026-01-10",
        linea_productiva="Huevos Guarumo",
        cantidad=5,
        unidad="cubetas",
        finca="Finca Guarumo",
        municipio="Cáceres",
        fotos=[],
        evidencias=[],
        hash_sha256="a" * 64,
        usuario_id=None,
    )
    db_session.add(heredado)
    db_session.commit()

    # Con sesión no se puede: no es de nadie, pero tampoco suyo.
    assert (
        sin_sesion.post(
            "/api/lotes/HUE-2026-900/eventos", json=EVENTO, headers=sesion
        ).status_code
        == 403
    )
    # La X-API-Key sí, por ser un lote sin dueño.
    res = sin_sesion.post(
        "/api/lotes/HUE-2026-900/eventos/interno",
        json=EVENTO,
        headers={"X-API-Key": "secreta-123"},
    )
    assert res.status_code == 200
    assert [e["tipo"] for e in res.json()["eventos"]] == ["empaque"]

    # Y un lote con dueño rechaza esa misma vía interna.
    propio = _crear(sin_sesion, headers=sesion)
    duplicado = sin_sesion.post(
        f"/api/lotes/{propio['codigo']}/eventos/interno",
        json=EVENTO,
        headers={"X-API-Key": "secreta-123"},
    )
    assert duplicado.status_code == 409


# --- HU-28: cadena de custodia ------------------------------------------------

def test_cadena_valida_al_agregar_eventos(client):
    codigo = _crear(client)["codigo"]
    client.post(f"/api/lotes/{codigo}/eventos", json=EVENTO)

    v = client.get(f"/api/verify/{codigo}").json()
    assert v["cadena_valida"] is True
    assert v["eventos_verificados"] == 2
    assert v["indice_alterado"] is None
    assert v["verificado"] is True

    eventos = client.get(f"/api/lotes/{codigo}/eventos").json()
    assert eventos[0]["hash_evento_anterior"] == client.get(
        f"/api/lotes/{codigo}"
    ).json()["hash_sha256"]
    assert eventos[1]["hash_evento_anterior"] == eventos[0]["hash_evento"]


def test_cadena_detecta_descripcion_alterada(client, db_session):
    codigo = _crear(client)["codigo"]
    client.post(f"/api/lotes/{codigo}/eventos", json=EVENTO)

    evento = db_session.scalars(
        select(Evento).join(Lote).where(Lote.codigo == codigo).order_by(Evento.id)
    ).all()[1]
    evento.descripcion = "10 cubetas... (texto cambiado a mano)"
    db_session.commit()

    v = client.get(f"/api/verify/{codigo}").json()
    assert v["cadena_valida"] is False
    assert v["indice_alterado"] == 1
    assert v["verificado"] is False  # el hash del lote sigue intacto


def test_cadena_detecta_evento_borrado(client, db_session):
    codigo = _crear(client)["codigo"]
    client.post(f"/api/lotes/{codigo}/eventos", json=EVENTO)

    # Se borra el primer eslabón: el siguiente ya no encadena con el lote.
    primero = db_session.scalars(
        select(Evento).join(Lote).where(Lote.codigo == codigo).order_by(Evento.id)
    ).all()[0]
    db_session.delete(primero)
    db_session.commit()

    v = client.get(f"/api/verify/{codigo}").json()
    assert v["cadena_valida"] is False
    assert v["indice_alterado"] == 0


def test_verificar_cadena_vacia_es_valida():
    assert verificar_cadena([], "f" * 64) == (True, "f" * 64, None)


# --- HU-29: caché de la verificación -----------------------------------------

def test_verify_cachea_horizon_una_sola_vez(client, monkeypatch):
    llamadas: list[str] = []
    monkeypatch.setattr(
        "app.api.lotes.verify_anchor",
        lambda tx, h: llamadas.append(tx)
        or {"verified": True, "memo_match": True, "successful": True, "ledger": 999},
    )
    codigo = _crear(client)["codigo"]

    primera = client.get(f"/api/verify/{codigo}")
    segunda = client.get(f"/api/verify/{codigo}")

    assert len(llamadas) == 1
    assert primera.json()["cache"]["hit"] is False
    assert segunda.json()["cache"]["hit"] is True
    assert segunda.headers["cache-control"] == "public, max-age=60"


def test_verify_no_cachea_errores_de_infraestructura(client, monkeypatch):
    def _caido(tx_hash, hash_hex):
        raise StellarError("Horizon caído")

    monkeypatch.setattr("app.api.lotes.verify_anchor", _caido)
    codigo = _crear(client)["codigo"]
    assert client.get(f"/api/verify/{codigo}").json()["error"]

    monkeypatch.setattr(
        "app.api.lotes.verify_anchor",
        lambda tx, h: {"verified": True, "successful": True, "ledger": 999},
    )
    assert client.get(f"/api/verify/{codigo}").json()["verificado"] is True


def test_anclar_invalida_la_cache(client, db_session, monkeypatch):
    monkeypatch.setattr(
        "app.api.lotes.verify_anchor",
        lambda tx, h: {"verified": True, "successful": True, "ledger": 999},
    )
    codigo = _crear(client)["codigo"]
    assert client.get(f"/api/verify/{codigo}").json()["cache"]["hit"] is False

    lote = db_session.scalar(select(Lote).where(Lote.codigo == codigo))
    from app.services import verify_cache

    verify_cache.invalidar(codigo)
    servicio.anclar_lote(db_session, lote)  # ya anclado: invalida igual
    assert client.get(f"/api/verify/{codigo}").json()["cache"]["hit"] is False


# --- HU-30: paginación --------------------------------------------------------

def test_paginacion_publica_con_total(client):
    for _ in range(3):
        _crear(client)

    primera = client.get("/api/lotes?limit=2&offset=0")
    segunda = client.get("/api/lotes?limit=2&offset=2")

    assert primera.status_code == 200
    assert len(primera.json()) == 2
    assert primera.headers["x-total-count"] == "3"
    assert len(segunda.json()) == 1
    assert segunda.headers["x-total-count"] == "3"
    # Sin repetidos entre páginas.
    codigos = {l["codigo"] for l in primera.json()} | {
        l["codigo"] for l in segunda.json()
    }
    assert len(codigos) == 3


def test_paginacion_rechaza_limites_invalidos(client):
    assert client.get("/api/lotes?limit=0").status_code == 422
    assert client.get("/api/lotes?limit=51").status_code == 422
    assert client.get("/api/lotes?offset=-1").status_code == 422


def test_paginacion_de_mis_lotes_cuenta_solo_los_mios(sin_sesion, sesion):
    for _ in range(2):
        sin_sesion.post("/api/lotes", json=payload_lote(), headers=sesion)

    res = sin_sesion.get("/api/lotes/mios?limit=1", headers=sesion)
    assert len(res.json()) == 1
    assert res.headers["x-total-count"] == "2"


# --- HU-31: límites de abuso ---------------------------------------------------

def test_rechaza_cuerpos_demasiado_grandes(client, monkeypatch):
    monkeypatch.setattr(settings, "max_body_bytes", 512)
    res = client.post(
        "/api/lotes",
        content=b'{"x":"' + b"a" * 2000 + b'"}',
        headers={"Content-Type": "application/json"},
    )
    assert res.status_code == 413
    assert "máximo" in res.json()["detail"]


def test_rate_limit_responde_429_con_retry_after(client, monkeypatch):
    monkeypatch.setattr(settings, "rate_limit_enabled", True)
    monkeypatch.setattr(settings, "rate_limit_read", 2)
    ip = {"X-Forwarded-For": "203.0.113.77"}

    assert client.get("/api/lotes", headers=ip).status_code == 200
    assert client.get("/api/lotes", headers=ip).status_code == 200
    bloqueada = client.get("/api/lotes", headers=ip)
    assert bloqueada.status_code == 429
    assert int(bloqueada.headers["retry-after"]) >= 1

    # Otra IP no queda afectada por el cubo de la primera.
    assert (
        client.get("/api/lotes", headers={"X-Forwarded-For": "203.0.113.78"})
        .status_code
        == 200
    )
