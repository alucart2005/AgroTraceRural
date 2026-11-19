from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Declaración moderna (Pydantic V2): la clase interna `Config` está
    # deprecada y emite PydanticDeprecatedSince20 en cada arranque.
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

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

    # Google OAuth (HU-06): verifica el ID token que entrega el botón de Google
    # en el navegador. El flujo popup NO usa el secret (solo el client_id), pero
    # se configura por si se añade el intercambio de código más adelante.
    google_client_id: str = ""
    google_client_secret: str = ""
    # Secreto con el que el backend firma sus propios JWT de sesión (HS256).
    # Generar con `openssl rand -hex 32`; vacío → el login responde 503.
    auth_secret: str = ""

    # --- Anclaje (HU-24, HU-25) -------------------------------------------
    # Reintentos máximos por lote antes de marcarlo ``fallido_definitivo``.
    anclaje_reintentos_max: int = 5
    # Cuántos lotes procesa cada pasada del job de reintento.
    anclaje_lote_por_pasada: int = 20

    # --- Verificación pública (HU-29) -------------------------------------
    # Segundos que se reutiliza el resultado de Horizon. 0 desactiva la caché.
    verify_cache_ttl: int = 300

    # --- Límites de abuso (HU-31) -----------------------------------------
    # Tope del cuerpo de una petición (las fotos llegan en base64 dentro del
    # JSON: 6 × 10 MB podrían bufferizar ~60 MB sin este límite).
    max_body_bytes: int = 8_000_000
    # False en tests; en producción se activa por variable de entorno.
    rate_limit_enabled: bool = True
    # Peticiones permitidas por ventana e IP.
    rate_limit_read: int = 60
    rate_limit_write: int = 10
    rate_limit_login: int = 5
    rate_limit_window: int = 60

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


settings = Settings()
