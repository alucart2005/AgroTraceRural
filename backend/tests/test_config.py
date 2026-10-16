"""Normalización de DATABASE_URL para Neon/Render.

Neon entrega ``postgres://`` (esquema eliminado en SQLAlchemy 2) y el driver
instalado es ``psycopg`` v3, no ``psycopg2``. Sin esta adaptación el servicio
moriría al arrancar en Render con la URL tal cual la genera Neon.
"""

from app.core.config import Settings


def _url_normalizada(url: str) -> str:
    return Settings(_env_file=None, database_url=url).database_url


def test_postgres_de_neon_se_adapta_a_psycopg():
    neon = "postgres://user:pass@ep-cool-shape-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
    assert _url_normalizada(neon) == (
        "postgresql+psycopg://user:pass@ep-cool-shape-123456.us-east-2.aws.neon.tech"
        "/neondb?sslmode=require"
    )


def test_postgresql_sin_driver_se_fuerza_a_psycopg():
    assert _url_normalizada("postgresql://u:p@db/app").startswith("postgresql+psycopg://")


def test_driver_psycopg2_se_reemplaza_por_psycopg():
    assert _url_normalizada("postgresql+psycopg2://u:p@db/app").startswith(
        "postgresql+psycopg://"
    )


def test_urls_con_driver_y_sqlite_no_se_tocan():
    assert _url_normalizada("postgresql+psycopg://u:p@db/app") == "postgresql+psycopg://u:p@db/app"
    assert (
        _url_normalizada("sqlite:///./agrotrace_local.db")
        == "sqlite:///./agrotrace_local.db"
    )
    assert _url_normalizada("") == ""
