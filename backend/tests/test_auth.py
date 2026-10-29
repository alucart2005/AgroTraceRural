"""Pruebas de autenticación con Google (HU-06), perfil (HU-07) y sesión (HU-08).

El ID token de Google se SIMULA siempre (monkeypatch de ``verificar_id_token``):
las pruebas nunca tocan la red. El JWT propio sí se firma y se valida de verdad.

El fixture ``client`` arranca con la sesión del productor de prueba (override de
``require_productor``); por eso aquí se usa ``sin_sesion``, que retira ese
override y deja que corra la dependencia REAL con los tokens que se envían.
"""

from __future__ import annotations

import time

import jwt

from app.core.config import settings
from app.services.auth import AuthError
from tests.conftest import GOOGLE_DE_PRUEBA, payload_lote


# --- HU-06: ingreso con Google -------------------------------------------------

def test_primer_ingreso_crea_al_productor(sin_sesion, db_session, monkeypatch):
    from app.models.usuario import Usuario

    monkeypatch.setattr(
        "app.services.auth.verificar_id_token",
        lambda token: dict(GOOGLE_DE_PRUEBA, sub="sub-nuevo"),
    )
    res = sin_sesion.post("/api/auth/google", json={"id_token": "tk-de-prueba-123456"})

    assert res.status_code == 200
    cuerpo = res.json()
    assert cuerpo["token"]
    usuario = cuerpo["usuario"]
    assert usuario["email"] == "productor@guarumo.co"
    assert usuario["nombre"] == "Rosa Productora"
    # HU-07: recién llegado, los 5 datos del primer ingreso están pendientes.
    assert usuario["perfil_completo"] is False

    guardado = db_session.get(Usuario, usuario["id"])
    assert guardado is not None
    assert guardado.google_sub == "sub-nuevo"


def test_segundo_ingreso_no_duplica_al_productor(sin_sesion, db_session, monkeypatch):
    from sqlalchemy import func, select

    from app.models.usuario import Usuario

    monkeypatch.setattr(
        "app.services.auth.verificar_id_token", lambda token: dict(GOOGLE_DE_PRUEBA)
    )
    url = "/api/auth/google"
    primero = sin_sesion.post(url, json={"id_token": "tk-de-prueba-123456"})
    segundo = sin_sesion.post(url, json={"id_token": "otro-token-pero-misma-cuenta"})

    assert primero.json()["usuario"]["id"] == segundo.json()["usuario"]["id"]
    total = db_session.scalar(select(func.count()).select_from(Usuario))
    assert total == 1  # solo el productor de prueba; el login no crea copias


def test_login_sin_google_configurado_responde_401(sin_sesion, monkeypatch):
    """Sin GOOGLE_CLIENT_ID no hay forma de validar el token → 401 claro."""
    monkeypatch.setattr(settings, "google_client_id", "")
    res = sin_sesion.post("/api/auth/google", json={"id_token": "tk-de-prueba-123456"})
    assert res.status_code == 401
    assert "GOOGLE_CLIENT_ID" in res.json()["detail"]


def test_login_rechaza_token_invalido(sin_sesion, monkeypatch):
    def _rechaza(token):
        raise AuthError("Token de Google inválido o expirado")

    monkeypatch.setattr("app.services.auth.verificar_id_token", _rechaza)
    res = sin_sesion.post("/api/auth/google", json={"id_token": "tk-de-prueba-123456"})
    assert res.status_code == 401
    assert "inválido" in res.json()["detail"]


# --- HU-06: sesión (GET /api/auth/me) -------------------------------------------

def test_me_requiere_sesion(sin_sesion):
    assert sin_sesion.get("/api/auth/me").status_code == 401
    assert (
        sin_sesion.get(
            "/api/auth/me", headers={"Authorization": "Bearer token-basura"}
        ).status_code
        == 401
    )


def test_me_devuelve_el_productor_autenticado(sin_sesion, sesion):
    res = sin_sesion.get("/api/auth/me", headers=sesion)
    assert res.status_code == 200
    assert res.json()["email"] == "productor@guarumo.co"
    assert res.json()["perfil_completo"] is True  # usuario_prueba completo


def test_token_expirado_responde_401(sin_sesion, usuario_prueba):
    viejo = jwt.encode(
        {
            "sub": usuario_prueba.id,
            "iat": int(time.time()) - 7200,
            "exp": int(time.time()) - 3600,
        },
        settings.auth_secret,
        algorithm="HS256",
    )
    res = sin_sesion.get("/api/auth/me", headers={"Authorization": f"Bearer {viejo}"})
    assert res.status_code == 401
    assert "expirada" in res.json()["detail"]


def test_firma_con_otro_secreto_responde_401(sin_sesion, usuario_prueba):
    """Un JWT firmado con otro secreto (o fabricado) no abre la API."""
    ajeno = jwt.encode(
        {"sub": usuario_prueba.id, "exp": int(time.time()) + 3600},
        "secreto-de-otro-servicio-0123456789abcdef",
        algorithm="HS256",
    )
    res = sin_sesion.get("/api/auth/me", headers={"Authorization": f"Bearer {ajeno}"})
    assert res.status_code == 401


def test_sesion_de_un_usuario_borrado_responde_401(sin_sesion, db_session, usuario_prueba):
    """El JWT puede ser válido pero si el usuario ya no existe, no hay sesión."""
    token = jwt.encode(
        {"sub": usuario_prueba.id, "exp": int(time.time()) + 3600},
        settings.auth_secret,
        algorithm="HS256",
    )
    db_session.delete(usuario_prueba)
    db_session.commit()

    res = sin_sesion.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


# --- HU-07: datos del primer ingreso ---------------------------------------------

def test_primer_ingreso_pide_los_5_datos_y_los_guarda(
    sin_sesion, db_session, monkeypatch
):
    from app.models.usuario import Usuario

    monkeypatch.setattr(
        "app.services.auth.verificar_id_token",
        lambda token: dict(GOOGLE_DE_PRUEBA, sub="sub-perfil"),
    )
    login = sin_sesion.post(
        "/api/auth/google", json={"id_token": "tk-de-prueba-123456"}
    ).json()
    headers = {"Authorization": f"Bearer {login['token']}"}
    assert login["usuario"]["perfil_completo"] is False

    completo = {
        "nombre": "Rosa Productora",
        "cedula": "70123456",
        "telefono": "3015551234",
        "finca": "Finca Guarumo",
        "municipio": "Cáceres, Antioquia",
    }
    guardado = sin_sesion.put("/api/auth/me", json=completo, headers=headers)
    assert guardado.status_code == 200
    assert guardado.json()["perfil_completo"] is True

    # Persiste en la BD y ya no se vuelve a pedir en el siguiente ingreso.
    usuario = db_session.get(Usuario, login["usuario"]["id"])
    assert usuario.cedula == "70123456"
    assert usuario.perfil_completo is True
    assert sin_sesion.get("/api/auth/me", headers=headers).json()["perfil_completo"]


def test_perfil_rechaza_campos_vacios_o_largos(sin_sesion, monkeypatch):
    # Productor recién llegado: perfil incompleto (no sirve el de prueba).
    monkeypatch.setattr(
        "app.services.auth.verificar_id_token",
        lambda token: dict(GOOGLE_DE_PRUEBA, sub="sub-sin-perfil"),
    )
    login = sin_sesion.post(
        "/api/auth/google", json={"id_token": "tk-de-prueba-123456"}
    ).json()
    headers = {"Authorization": f"Bearer {login['token']}"}

    completo = {
        "nombre": "Rosa",
        "cedula": "70123456",
        "telefono": "3015551234",
        "finca": "Guarumo",
        "municipio": "Cáceres",
    }
    # campo vacío → 422 y NO se marca el perfil completo
    vacio = dict(completo, telefono="")
    assert sin_sesion.put("/api/auth/me", json=vacio, headers=headers).status_code == 422
    assert sin_sesion.get("/api/auth/me", headers=headers).json()["perfil_completo"] is False

    # más largo que su columna → 422 (no un 500 por DataError)
    largo = dict(completo, cedula="9" * 21)
    assert sin_sesion.put("/api/auth/me", json=largo, headers=headers).status_code == 422
    assert sin_sesion.get("/api/auth/me", headers=headers).json()["perfil_completo"] is False

    # los 5 campos correctos → 200 y perfil completo
    assert sin_sesion.put("/api/auth/me", json=completo, headers=headers).status_code == 200
    assert sin_sesion.get("/api/auth/me", headers=headers).json()["perfil_completo"] is True


def test_actualizar_perfil_requiere_sesion(sin_sesion):
    res = sin_sesion.put(
        "/api/auth/me",
        json={
            "nombre": "Rosa",
            "cedula": "1",
            "telefono": "2",
            "finca": "Guarumo",
            "municipio": "Cáceres",
        },
    )
    assert res.status_code == 401


# --- HU-08: registro de lotes con sesión -------------------------------------------

def test_crear_lote_sin_sesion_responde_401(sin_sesion):
    assert sin_sesion.post("/api/lotes", json=payload_lote()).status_code == 401


def test_lote_creado_queda_vinculado_al_productor(sin_sesion, sesion, db_session):
    from app.models.lote import Lote

    res = sin_sesion.post("/api/lotes", json=payload_lote(), headers=sesion)
    assert res.status_code == 201

    lote = db_session.query(Lote).filter_by(codigo=res.json()["codigo"]).one()
    assert lote.usuario_id == "usuario-de-prueba"

    # El hash canónico NO cambió: el usuario queda fuera de los 8 campos.
    assert set(lote.como_dict()) == {
        "codigo",
        "fecha_cosecha",
        "linea_productiva",
        "cantidad",
        "unidad",
        "finca",
        "municipio",
        "evidencias",
    }


def test_mis_lotes_solo_devuelve_los_del_productor(sin_sesion, sesion, monkeypatch):
    # Productor A (sesion) crea un lote.
    sin_sesion.post("/api/lotes", json=payload_lote(), headers=sesion)
    mios = sin_sesion.get("/api/lotes/mios", headers=sesion)
    assert mios.status_code == 200
    assert len(mios.json()) == 1

    # Productor B inicia sesión con OTRA cuenta de Google: no ve el de A.
    monkeypatch.setattr(
        "app.services.auth.verificar_id_token",
        lambda token: dict(GOOGLE_DE_PRUEBA, sub="sub-del-vecino"),
    )
    b = sin_sesion.post(
        "/api/auth/google", json={"id_token": "tk-de-prueba-123456"}
    ).json()
    headers_b = {"Authorization": f"Bearer {b['token']}"}

    assert sin_sesion.get("/api/lotes/mios", headers=headers_b).json() == []
    # El listado público (QR/buscador) sigue viendo todos.
    assert len(sin_sesion.get("/api/lotes").json()) == 1


def test_mis_lotes_requiere_sesion(sin_sesion):
    assert sin_sesion.get("/api/lotes/mios").status_code == 401


def test_los_lotes_previos_sin_dueño_siguen_visibles(sin_sesion, sesion, db_session):
    """Lotes antiguos (usuario_id NULL) no desaparecen de la lista pública."""
    from sqlalchemy import update

    from app.models.lote import Lote

    codigo = sin_sesion.post(
        "/api/lotes", json=payload_lote(), headers=sesion
    ).json()["codigo"]
    db_session.execute(update(Lote).values(usuario_id=None))
    db_session.commit()

    publicos = {l["codigo"] for l in sin_sesion.get("/api/lotes").json()}
    assert codigo in publicos
    assert sin_sesion.get("/api/lotes/mios", headers=sesion).json() == []
