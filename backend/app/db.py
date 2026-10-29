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


def asegurar_columnas_sqlite() -> None:
    """Añade al SQLite local las columnas que ``create_all`` no altera.

    ``Base.metadata.create_all`` crea tablas NUEVAS pero nunca modifica las ya
    existentes, y en desarrollo local no se corre Alembic. Sin este paso, un
    SQLite de antes de la autenticación carecería de ``lotes.usuario_id`` y el
    registro de lotes fallaría con ``OperationalError``. En Postgres (Neon) el
    esquema lo define Alembic, así que esto no aplica.
    """
    from sqlalchemy import inspect, text

    if engine.url.get_backend_name() != "sqlite":
        return
    with engine.begin() as conn:
        columnas = {c["name"] for c in inspect(conn).get_columns("lotes")}
        if "usuario_id" not in columnas:
            conn.execute(text("ALTER TABLE lotes ADD COLUMN usuario_id VARCHAR(36)"))
