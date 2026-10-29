"""Entorno de pruebas: BD en memoria, R2 y Stellar simulados (sin red)."""

from __future__ import annotations

import os

# Debe fijarse ANTES de importar app.* (settings se instancia al importar).
os.environ.setdefault("DATABASE_URL", "sqlite://")
# Secreto de los JWT de sesión: sin él el login respondería 503 en las pruebas.
# ≥32 bytes: PyJWT advierte si la clave HS256 es más corta (RFC 7518).
os.environ.setdefault("AUTH_SECRET", "agrotrace-secreto-de-prueba-0123456789abcdef")

import base64  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.api.deps import require_productor  # noqa: E402
from app.db import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.usuario import Usuario  # noqa: E402

FOTO_DATA_URL = "data:image/png;base64," + base64.b64encode(b"png-de-prueba").decode()

# Payload que "devuelve Google" cuando se simula el ID token.
GOOGLE_DE_PRUEBA = {
    "sub": "google-123",
    "email": "productor@guarumo.co",
    "name": "Rosa Productora",
    "picture": "https://example.test/foto.jpg",
}


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False
    )
    session = TestingSession()
    yield session
    session.close()


@pytest.fixture()
def usuario_prueba(db_session) -> Usuario:
    """Productor ya registrado que sirve de sesión en casi todas las pruebas."""
    usuario = Usuario(
        id="usuario-de-prueba",
        google_sub=GOOGLE_DE_PRUEBA["sub"],
        email=GOOGLE_DE_PRUEBA["email"],
        nombre=GOOGLE_DE_PRUEBA["name"],
        cedula="1000000001",
        telefono="3001234567",
        finca="Finca Guarumo",
        municipio="Cáceres",
    )
    db_session.add(usuario)
    db_session.commit()
    yield usuario


@pytest.fixture()
def subidas() -> list:
    """Claves subidas a R2 durante la prueba (simulado)."""
    return []


@pytest.fixture()
def client(db_session, subidas, usuario_prueba, monkeypatch):
    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db

    # Las pruebas arrancan "logueadas": require_productor devuelve un productor
    # real de la BD sin depender del flujo de Google. Quien necesite probar la
    # ausencia de sesión usa el fixture ``sin_sesion``.
    app.dependency_overrides[require_productor] = lambda: usuario_prueba

    # Fotos → R2 simulado (sin red, sin boto3).
    def _subir(key, fileobj, content_type="application/octet-stream"):
        subidas.append({"key": key, "content_type": content_type})
        return f"https://cdn.example/{key}"

    monkeypatch.setattr("app.services.lotes.storage.upload_evidence", _subir)

    # Stellar simulado (sin red).
    monkeypatch.setattr(
        "app.services.lotes.anchor_hash",
        lambda codigo, hash_hex: {
            "tx_hash": f"tx-{hash_hex[:12]}",
            "ledger": 999,
            "successful": True,
        },
    )
    monkeypatch.setattr(
        "app.api.lotes.verify_anchor",
        lambda tx_hash, hash_hex: {
            "verified": True,
            "memo_match": True,
            "successful": True,
            "ledger": 999,
        },
    )

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def sin_sesion(client):
    """Retira el override de sesión: las peticiones van SIN productor."""
    app.dependency_overrides.pop(require_productor, None)
    return client


@pytest.fixture()
def sesion(client, monkeypatch):
    """Login real contra ``POST /api/auth/google`` con Google simulado."""
    monkeypatch.setattr(
        "app.services.auth.verificar_id_token", lambda token: dict(GOOGLE_DE_PRUEBA)
    )
    res = client.post("/api/auth/google", json={"id_token": "id-token-de-prueba-123456"})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['token']}"}


def payload_lote(**extra) -> dict:
    base = {
        "fecha_cosecha": "2027-03-14",
        "linea_productiva": "Huevos Guarumo",
        "cantidad": 10,
        "unidad": "cubetas",
        "fotos": [
            {"dataUrl": FOTO_DATA_URL, "nombre": "galpon.jpg", "tamano": 1234}
        ],
    }
    base.update(extra)
    return base
