"""Entorno de pruebas: BD en memoria, R2 y Stellar simulados (sin red)."""

from __future__ import annotations

import os

# Debe fijarse ANTES de importar app.* (settings se instancia al importar).
os.environ.setdefault("DATABASE_URL", "sqlite://")

import base64  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.db import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

FOTO_DATA_URL = "data:image/png;base64," + base64.b64encode(b"png-de-prueba").decode()


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
def subidas() -> list:
    """Claves subidas a R2 durante la prueba (simulado)."""
    return []


@pytest.fixture()
def client(db_session, subidas, monkeypatch):
    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db

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
