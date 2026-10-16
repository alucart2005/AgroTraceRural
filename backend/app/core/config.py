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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
