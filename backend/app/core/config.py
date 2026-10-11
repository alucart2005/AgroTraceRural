from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    stellar_network: str = "testnet"
    horizon_url: str = "https://horizon-testnet.stellar.org"
    stellar_public_key: str = ""
    stellar_secret_key: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
