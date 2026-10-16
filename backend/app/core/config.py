from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    stellar_network: str = "testnet"
    horizon_url: str = "https://horizon-testnet.stellar.org"
    stellar_public_key: str = ""
    stellar_secret_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # Cloudflare R2 (S3-compatible) — evidencia fuera de la blockchain
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = "agrotrace-evidence"
    r2_public_url: str = ""

    # Base de datos: Neon Postgres en producción (Render).
    # Vacío → SQLite local (agrotrace_local.db) para desarrollo sin servicios.
    database_url: str = ""

    # API key de escritura (header X-API-Key). Vacío → API abierta (dev local).
    api_key: str = ""

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalizar_postgres(cls, valor: str) -> str:
        """Adapta la URL de Neon/Render al driver instalado.

        Neon entrega ``postgres://`` (eliminado en SQLAlchemy 2) y el paquete
        ``psycopg`` de ``requirements.txt`` es la versión 3, no ``psycopg2``.
        Cualquier URL postgres sin driver explícito se fuerza a ``+psycopg``.
        """
        if not valor:
            return valor
        if valor.startswith("postgres://"):
            valor = "postgresql://" + valor[len("postgres://") :]
        if valor.startswith("postgresql+psycopg2://"):
            return "postgresql+psycopg://" + valor[len("postgresql+psycopg2://") :]
        if valor.startswith("postgresql://"):
            return "postgresql+psycopg://" + valor[len("postgresql://") :]
        return valor

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
