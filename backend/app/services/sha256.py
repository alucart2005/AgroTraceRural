"""Huella SHA-256 del lote sobre JSON canónico.

PARIDAD OBLIGATORIA con ``frontend/lib/hash.ts`` (``payloadDeLote``/``hashLote``):
el backend es la fuente de verdad y el navegador debe poder reproducir el mismo
hash. Solo entran estos 8 campos; ``fecha_postura`` y el resto de metadatos quedan
FUERA a propósito (decidido con el producto: es un dato de presentación).
"""

from __future__ import annotations

import hashlib
import json

CAMPOS_LOTE = (
    "codigo",
    "fecha_cosecha",
    "linea_productiva",
    "cantidad",
    "unidad",
    "finca",
    "municipio",
    "evidencias",
)


def hash_canonico(data: dict) -> str:
    """SHA-256 de una representación canónica (claves ordenadas, sin espacios)."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def payload_lote(datos_lote: dict) -> dict:
    """Payload canónico de un lote, idéntico al del frontend.

    - Ignora campos extra (fecha_postura, eventos, hashes, URLs...).
    - Normaliza ``evidencias`` a ``{nombre, tamano}`` aunque lleguen con más
      claves (p.ej. la URL en R2).
    """
    evidencias = [
        {"nombre": e["nombre"], "tamano": e["tamano"]}
        for e in (datos_lote.get("evidencias") or [])
    ]
    return {
        "codigo": datos_lote["codigo"],
        "fecha_cosecha": datos_lote["fecha_cosecha"],
        "linea_productiva": datos_lote["linea_productiva"],
        "cantidad": datos_lote["cantidad"],
        "unidad": datos_lote["unidad"],
        "finca": datos_lote["finca"],
        "municipio": datos_lote["municipio"],
        "evidencias": evidencias,
    }


def hash_lote(datos_lote: dict) -> str:
    """SHA-256 de la huella del lote. En blockchain viaja SOLO este hash."""
    return hash_canonico(payload_lote(datos_lote))
