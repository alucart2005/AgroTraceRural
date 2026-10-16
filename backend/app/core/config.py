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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
