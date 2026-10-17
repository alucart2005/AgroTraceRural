"""Pruebas de la API de lotes (HU-01, HU-02, HU-03, HU-05) con todo simulado."""

from __future__ import annotations

from app.core.config import settings
from app.services.sha256 import hash_lote
from app.services.stellar import StellarError
from app.services.storage import StorageError
from tests.conftest import FOTO_DATA_URL, payload_lote


# --- HU-01: creación --------------------------------------------------------

def test_crear_lote_con_fotos_y_anclaje(client, subidas):
    res = client.post("/api/lotes", json=payload_lote())
    assert res.status_code == 201
    lote = res.json()

    assert lote["codigo"] == "HUE-2027-001"
    assert lote["finca"] == "Finca Guarumo"
    assert lote["municipio"] == "Cáceres, Antioquia"
    assert lote["fecha_postura"] == "2027-03-14"  # por defecto = cosecha
    assert lote["fotos"][0].startswith("https://cdn.example/evidencias/")
    assert lote["fotos"][0].endswith("/00_galpon.jpg")
    assert subidas and subidas[0]["key"].endswith("00_galpon.jpg")
    assert lote["evidencias"] == [{"nombre": "galpon.jpg", "tamano": 1234}]

    # hash = mismo cálculo que hace el navegador
    assert lote["hash_sha256"] == hash_lote(
        {
            "codigo": lote["codigo"],
            "fecha_cosecha": "2027-03-14",
            "linea_productiva": "Huevos Guarumo",
            "cantidad": 10,
            "unidad": "cubetas",
            "finca": "Finca Guarumo",
            "municipio": "Cáceres, Antioquia",
            "evidencias": [{"nombre": "galpon.jpg", "tamano": 1234}],
        }
    )

    # ancla on-chain simulada + evento inicial de cosecha
    assert lote["stellar_tx_hash"] == f"tx-{lote['hash_sha256'][:12]}"
    assert lote["stellar_ledger"] == 999
    assert lote["eventos"][0]["tipo"] == "cosecha"
    assert "demo" not in lote


def test_codigo_secuencial_por_anio(client):
    primero = client.post("/api/lotes", json=payload_lote()).json()
    segundo = client.post("/api/lotes", json=payload_lote()).json()
    otro_anio = client.post(
        "/api/lotes", json=payload_lote(fecha_cosecha="2028-01-05")
    ).json()

    assert primero["codigo"] == "HUE-2027-001"
    assert segundo["codigo"] == "HUE-2027-002"
    assert otro_anio["codigo"] == "HUE-2028-001"


def test_rechaza_fotos_sobre_el_limite(client):
    fotos = [
        {"dataUrl": FOTO_DATA_URL, "nombre": f"f{i}.jpg", "tamano": 1}
        for i in range(7)
    ]
    assert client.post("/api/lotes", json=payload_lote(fotos=fotos)).status_code == 422


def test_rechaza_foto_de_mas_de_10mb(client):
    foto = {"dataUrl": FOTO_DATA_URL, "nombre": "g.jpg", "tamano": 10_000_001}
    res = client.post("/api/lotes", json=payload_lote(fotos=[foto]))
    assert res.status_code == 422


def test_rechaza_data_url_invalido(client):
    foto = {"dataUrl": "no-es-un-data-url", "nombre": "g.jpg", "tamano": 10}
    res = client.post("/api/lotes", json=payload_lote(fotos=[foto]))
    assert res.status_code == 422


def test_falla_en_r2_no_deja_lote_a_medias(client, monkeypatch):
    def _explotar(key, fileobj, content_type="application/octet-stream"):
        raise StorageError("R2 caído")

    monkeypatch.setattr("app.services.lotes.storage.upload_evidence", _explotar)
    res = client.post("/api/lotes", json=payload_lote())

    assert res.status_code == 503
    assert client.get("/api/lotes").json() == []  # nada se persistió


def test_falla_en_stellar_conserva_el_lote(client, monkeypatch):
    def _falla(codigo, hash_hex):
        raise StellarError("Horizon inaccesible")

    monkeypatch.setattr("app.services.lotes.anchor_hash", _falla)
    lote = client.post("/api/lotes", json=payload_lote()).json()

    assert lote["stellar_tx_hash"] is None
    assert len(client.get("/api/lotes").json()) == 1  # el registro NO se pierde

    # reintento de anclaje (endpoint dedicado)
    monkeypatch.setattr(
        "app.services.lotes.anchor_hash",
        lambda codigo, hash_hex: {"tx_hash": "tx-reintento", "ledger": 1000},
    )
    reanclado = client.post("/api/lotes/HUE-2027-001/anclar")
    assert reanclado.status_code == 200
    assert reanclado.json()["stellar_tx_hash"] == "tx-reintento"


# --- API key (solo escrituras) ----------------------------------------------

def test_escrituras_requieren_api_key(client, monkeypatch):
    monkeypatch.setattr(settings, "api_key", "secreta-123")

    assert client.post("/api/lotes", json=payload_lote()).status_code == 401
    assert (
        client.post(
            "/api/lotes",
            json=payload_lote(),
            headers={"X-API-Key": "incorrecta"},
        ).status_code
        == 401
    )
    ok = client.post(
        "/api/lotes",
        json=payload_lote(),
        headers={"X-API-Key": "secreta-123"},
    )
    assert ok.status_code == 201

    # lecturas siguen abiertas (el QR del consumidor no lleva credenciales)
    assert client.get("/api/lotes").status_code == 200
    assert client.get(f"/api/lotes/{ok.json()['codigo']}").status_code == 200


# --- HU-02 / HU-05: lecturas y eventos ---------------------------------------

def test_listar_y_obtener_lote(client):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    lista = client.get("/api/lotes")
    assert lista.status_code == 200
    assert [l["codigo"] for l in lista.json()] == [codigo]

    detalle = client.get(f"/api/lotes/{codigo}")
    assert detalle.status_code == 200
    assert detalle.json()["eventos"][0]["tipo"] == "cosecha"

    assert client.get("/api/lotes/HUE-1999-999").status_code == 404


def test_agregar_eventos_de_custodia(client):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    res = client.post(
        f"/api/lotes/{codigo}/eventos",
        json={
            "tipo": "empaque",
            "fecha": "2027-03-14T09:00:00-05:00",
            "descripcion": "10 cubetas en caja con etiqueta QR.",
        },
    )
    assert res.status_code == 200
    assert [e["tipo"] for e in res.json()["eventos"]] == ["cosecha", "empaque"]

    historial = client.get(f"/api/lotes/{codigo}/eventos")
    assert len(historial.json()) == 2
    assert historial.json()[0]["id"]  # id serializado como texto

    invalido = client.post(
        f"/api/lotes/{codigo}/eventos",
        json={"tipo": "volar", "fecha": "x", "descripcion": "y"},
    )
    assert invalido.status_code == 422


# --- HU-03: verificación -----------------------------------------------------

def test_verify_confirma_ancla_on_chain(client):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    res = client.get(f"/api/verify/{codigo}")
    assert res.status_code == 200
    v = res.json()
    assert v["verificado"] is True
    assert v["hash_calculado"] == v["hash_registrado"]
    assert v["tx_hash"].startswith("tx-")
    assert v["ledger"] == 999
    assert v["demo"] is False
    assert v["error"] is None


def test_verify_sin_anclar_lo_dice_explicitamente(client, monkeypatch):
    def _falla(codigo, hash_hex):
        raise StellarError("Horizon caído")

    monkeypatch.setattr("app.services.lotes.anchor_hash", _falla)
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    v = client.get(f"/api/verify/{codigo}").json()
    assert v["verificado"] is False
    assert "anclado" in v["error"]
    assert v["hash_calculado"] == v["hash_registrado"]  # huella local intacta


def test_verify_detecta_horizon_indisponible(client, monkeypatch):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    def _roto(tx_hash, hash_hex):
        raise StellarError("timeout con Horizon")

    monkeypatch.setattr("app.api.lotes.verify_anchor", _roto)
    v = client.get(f"/api/verify/{codigo}").json()
    assert v["verificado"] is False
    assert "Stellar no respondió" in v["error"]


def test_verify_detecta_datos_alterados(client, db_session):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]

    # simula una manipulación posterior al anclaje
    from sqlalchemy import select

    from app.models.lote import Lote

    lote = db_session.scalar(select(Lote).where(Lote.codigo == codigo))
    lote.cantidad = 999
    db_session.commit()

    v = client.get(f"/api/verify/{codigo}").json()
    assert v["verificado"] is False
    assert v["hash_calculado"] != v["hash_registrado"]
    assert v["error"] is None  # sin error de infra → es alteración real


def test_verify_arbitrario_requiere_api_key(client, monkeypatch):
    """POST /api/verify dispara una consulta a Horizon: no puede ser un proxy abierto."""
    monkeypatch.setattr(settings, "api_key", "secreta-123")
    monkeypatch.setattr(
        "app.api.verify.verify_anchor",
        lambda tx_hash, hash_hex: {"verified": True, "ledger": 1},
    )
    body = {"tx_hash": "abc", "hash_hex": "0" * 64}

    assert client.post("/api/verify", json=body).status_code == 401
    assert (
        client.post("/api/verify", json=body, headers={"X-API-Key": "secreta-123"})
        .status_code
        == 200
    )


# --- validación de entrada (antes de tocar la base de datos) ------------------

def test_rechaza_fecha_con_formato_invalido(client):
    """La fecha viaja como texto en el payload canónico: se valida el formato."""
    assert (
        client.post("/api/lotes", json=payload_lote(fecha_cosecha="14/03/2027")).status_code
        == 422
    )
    assert (
        client.post("/api/lotes", json=payload_lote(fecha_cosecha="2027-13-45")).status_code
        == 422
    )
    assert (
        client.post(
            "/api/lotes", json=payload_lote(fecha_postura="no-es-una-fecha")
        ).status_code
        == 422
    )


def test_rechaza_campos_mas_largos_que_su_columna(client):
    """Sin esto el valor cruzaría Pydantic y estallaría como DataError → 500."""
    assert (
        client.post(
            "/api/lotes", json=payload_lote(linea_productiva="x" * 81)
        ).status_code
        == 422
    )
    assert client.post("/api/lotes", json=payload_lote(unidad="y" * 33)).status_code == 422
    assert (
        client.post("/api/lotes", json=payload_lote(linea_productiva="")).status_code == 422
    )


def test_rechaza_descripcion_de_evento_demasiado_larga(client):
    codigo = client.post("/api/lotes", json=payload_lote()).json()["codigo"]
    res = client.post(
        f"/api/lotes/{codigo}/eventos",
        json={
            "tipo": "empaque",
            "fecha": "2027-03-14T09:00:00-05:00",
            "descripcion": "z" * 2001,
        },
    )
    assert res.status_code == 422


# --- colisión concurrente de código -------------------------------------------

def test_reintenta_si_el_codigo_propuesto_ya_esta_ocupado(client, monkeypatch):
    """Dos peticiones simultáneas pueden proponer el mismo código secuencial."""
    from app.services import lotes as servicio

    assert client.post("/api/lotes", json=payload_lote()).json()["codigo"] == "HUE-2027-001"

    original = servicio.siguiente_codigo
    intentos = {"n": 0}

    def _colisiona_una_vez(db, fecha):
        intentos["n"] += 1
        return "HUE-2027-001" if intentos["n"] == 1 else original(db, fecha)

    monkeypatch.setattr(servicio, "siguiente_codigo", _colisiona_una_vez)

    res = client.post("/api/lotes", json=payload_lote())
    assert res.status_code == 201
    assert res.json()["codigo"] == "HUE-2027-002"
    assert intentos["n"] == 2


def test_colision_persistente_responde_409_y_no_deja_fotos_huerfanas(client, monkeypatch):
    from app.services import lotes as servicio

    borradas: list[str] = []
    monkeypatch.setattr(servicio.storage, "delete_evidence", borradas.append)
    # Siempre propone el mismo código: agota los reintentos.
    monkeypatch.setattr(servicio, "siguiente_codigo", lambda db, fecha: "HUE-2027-001")

    assert client.post("/api/lotes", json=payload_lote()).status_code == 201
    assert client.post("/api/lotes", json=payload_lote()).status_code == 409

    # La evidencia de la operación fallida se retira de R2 en lugar de quedar
    # huérfana sin ningún lote que la referencie.
    assert borradas
    assert all(k.startswith("evidencias/") for k in borradas)
