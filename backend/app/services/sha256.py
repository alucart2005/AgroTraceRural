import hashlib
import json


def hash_canonico(data: dict) -> str:
    """SHA-256 of a canonical JSON string (sorted keys, no whitespace)."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def hash_lote(datos_lote: dict, fotos: list[str] | None = None) -> str:
    """Compute the SHA-256 fingerprint for a batch.

    ``datos_lote`` holds the operational fields; ``fotos`` holds evidence
    references (R2 keys or URLs).  Only the hash is anchored on-chain —
    never the file bytes.
    """
    payload = dict(datos_lote)
    if fotos:
        payload["_fotos"] = sorted(fotos)
    return hash_canonico(payload)
