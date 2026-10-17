"""Cloudflare R2 (S3-compatible) storage for evidence files.

Las fotos, videos y archivos pesados NUNCA van en blockchain. Se guardan en un
bucket de R2 y solo se referencia su *key*; en Stellar viaja únicamente el hash
SHA-256. El cliente usa el endpoint S3-compatible de R2 y `boto3` se importa de
forma perezosa para no requerirlo solo por importar el módulo.
"""

from __future__ import annotations

from app.core.config import settings


class StorageError(Exception):
    pass


def r2_endpoint() -> str:
    return f"https://{settings.r2_account_id}.r2.cloudflarestorage.com"


def is_configured() -> bool:
    return bool(
        settings.r2_account_id
        and settings.r2_access_key_id
        and settings.r2_secret_access_key
        and settings.r2_bucket
    )


def get_s3_client():
    if not is_configured():
        raise StorageError(
            "R2 no configurado (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / "
            "R2_SECRET_ACCESS_KEY / R2_BUCKET)"
        )
    import boto3
    from botocore.client import Config

    return boto3.client(
        "s3",
        endpoint_url=r2_endpoint(),
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def evidence_key(lote_id: str, filename: str) -> str:
    """Build a stable R2 object key for a batch evidence file."""
    safe = filename.replace(" ", "_")
    return f"evidencias/{lote_id}/{safe}"


def public_url(key: str) -> str:
    base = settings.r2_public_url.rstrip("/")
    return f"{base}/{key}" if base else key


def upload_evidence(key: str, fileobj, content_type: str = "application/octet-stream") -> str:
    """Upload a file-like object to R2 and return its public URL."""
    client = get_s3_client()
    try:
        client.put_object(
            Bucket=settings.r2_bucket,
            Key=key,
            Body=fileobj,
            ContentType=content_type,
        )
    except Exception as exc:  # noqa: BLE001 — envolvemos cualquier fallo de S3
        raise StorageError(f"No se pudo subir {key} a R2: {exc}") from exc
    return public_url(key)


def delete_evidence(key: str) -> None:
    """Borra un objeto de R2. Mejor esfuerzo: nunca lanza.

    Se usa para retirar evidencia huérfana cuando el lote no llegó a
    persistirse. Un fallo aquí solo deja un archivo sin referenciar en el
    bucket; reventar la operación principal sería peor.
    """
    if not is_configured():
        return
    try:
        get_s3_client().delete_object(Bucket=settings.r2_bucket, Key=key)
    except Exception:  # noqa: BLE001 — limpieza best-effort
        pass
