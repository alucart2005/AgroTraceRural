"""Motor de base de datos y fábrica de sesiones.

- Producción (Render): ``DATABASE_URL`` apunta a Neon Postgres.
- Desarrollo local: si no hay ``DATABASE_URL``, se usa un archivo SQLite para
  poder ejecutar la API y las pruebas sin servicios externos.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def database_url() -> str:
    return settings.database_url or "sqlite:///./agrotrace_local.db"


def _connect_args(url: str) -> dict:
    return {"check_same_thread": False} if url.startswith("sqlite") else {}


_url = database_url()
# pool_pre_ping descarta conexiones colgadas de Neon/Render tras periodos de
# inactividad (free tier), evitando errores 500 en la primera petición.
engine = create_engine(
    _url,
    connect_args=_connect_args(_url),
    pool_pre_ping=not _url.startswith("sqlite"),
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base declarativa de SQLAlchemy para todos los modelos."""


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
