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


# --- Cadena de custodia (HU-28) ---------------------------------------------

CAMPOS_EVENTO = ("anterior", "tipo", "fecha", "descripcion")


def hash_evento(
    hash_anterior: str, tipo: str, fecha: str, descripcion: str
) -> str:
    """SHA-256 de un eslabón de la cadena de custodia.

    El payload es deliberadamente corto y estable: el hash del eslabón previo
    (o el del lote en el primero) + los tres campos del evento. Cambiar una
    coma, la fecha o la descripción rompe la cadena y la verificación lo nota.
    """
    return hash_canonico(
        {
            "anterior": hash_anterior,
            "tipo": tipo,
            "fecha": fecha,
            "descripcion": descripcion,
        }
    )


def verificar_cadena(eventos, hash_inicial: str) -> tuple[bool, str, int | None]:
    """Recalcula la cadena de eventos desde el hash del lote.

    Devuelve ``(valida, hash_final, indice_alterado)``. Un evento sin hash
    (dato anterior a HU-28 que no se pudo backfillear) invalida la cadena: es
    mejor decir "no verificable" que afirmar integridad.
    """
    anterior = hash_inicial
    for indice, evento in enumerate(eventos):
        if (
            not evento.hash_evento
            or evento.hash_evento_anterior != anterior
        ):
            return False, anterior, indice
        esperado = hash_evento(
            anterior, evento.tipo, evento.fecha, evento.descripcion
        )
        if esperado != evento.hash_evento:
            return False, anterior, indice
        anterior = evento.hash_evento
    return True, anterior, None
