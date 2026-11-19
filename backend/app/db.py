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
        # Entregas 6–8 (HU-24, HU-28): columnas nuevas del anclaje y la cadena.
        nuevas_lotes = {
            "anclaje_estado": "VARCHAR(20) NOT NULL DEFAULT 'pendiente'",
            "anclaje_error": "TEXT",
            "intentos_anclaje": "INTEGER NOT NULL DEFAULT 0",
            "ultimo_intento_at": "DATETIME",
            "oculto": "BOOLEAN NOT NULL DEFAULT 0",
        }
        for nombre, ddl in nuevas_lotes.items():
            if nombre not in columnas:
                conn.execute(text(f"ALTER TABLE lotes ADD COLUMN {nombre} {ddl}"))

        columnas_eventos = {
            c["name"] for c in inspect(conn).get_columns("eventos")
        }
        nuevas_eventos = {
            "hash_evento": "VARCHAR(64)",
            "hash_evento_anterior": "VARCHAR(64)",
        }
        for nombre, ddl in nuevas_eventos.items():
            if nombre not in columnas_eventos:
                conn.execute(
                    text(f"ALTER TABLE eventos ADD COLUMN {nombre} {ddl}")
                )


def asegurar_cadenas_eventos() -> None:
    """Rellena la cadena de custodia en el SQLite de desarrollo (HU-28).

    En Postgres lo hace la migración ``0004_cadena_eventos``. En local no se
    corre Alembic, así que los eventos anteriores a esta entrega tendrían
    ``hash_evento = NULL`` y la verificación los marcaría como alterados.
    Idempotente: solo toca filas sin hash.
    """
    from sqlalchemy import text

    if engine.url.get_backend_name() != "sqlite":
        return

    import hashlib
    import json

    def hash_eslabon(anterior: str, tipo: str, fecha: str, descripcion: str) -> str:
        payload = {
            "anterior": anterior,
            "tipo": tipo,
            "fecha": fecha,
            "descripcion": descripcion,
        }
        canonico = json.dumps(
            payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
        )
        return hashlib.sha256(canonico.encode("utf-8")).hexdigest()

    with engine.begin() as conn:
        lotes = conn.execute(text("SELECT id, hash_sha256 FROM lotes")).fetchall()
        for lote_id, hash_lote in lotes:
            eventos = conn.execute(
                text(
                    "SELECT id, tipo, fecha, descripcion, hash_evento "
                    "FROM eventos WHERE lote_id = :l ORDER BY id"
                ),
                {"l": lote_id},
            ).fetchall()
            anterior = hash_lote
            for ev_id, tipo, fecha, descripcion, guardado in eventos:
                if guardado:
                    anterior = guardado
                    continue
                nuevo = hash_eslabon(anterior, tipo, fecha, descripcion)
                conn.execute(
                    text(
                        "UPDATE eventos SET hash_evento = :h, "
                        "hash_evento_anterior = :a WHERE id = :i"
                    ),
                    {"h": nuevo, "a": anterior, "i": ev_id},
                )
                anterior = nuevo
