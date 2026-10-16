"""Flujo de creación de un lote: fotos a R2, huella SHA-256 y ancla en Stellar.

Orden de operaciones (nunca se guarda un lote a medias):
1. Se decodifican y suben las fotos a Cloudflare R2 → si falla, NO se crea nada.
2. Se persiste el lote con su hash y el evento inicial de cosecha.
3. Se ancla el hash en Stellar Testnet (Memo Hash); si Horizon falla, el lote
   queda guardado con ``stellar_tx_hash = None`` y se reintenta con
   ``POST /api/lotes/{codigo}/anclar``.
"""

from __future__ import annotations

import base64
import binascii
import io
import logging
import os
import re
import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lote import Evento, Lote
from app.services import storage
from app.services.sha256 import hash_lote
from app.services.stellar import StellarError, anchor_hash

log = logging.getLogger(__name__)

FINCA = "Finca Guarumo"
MUNICIPIO = "Cáceres, Antioquia"

_DATA_URL = re.compile(
    r"^data:(?P<tipo>[a-zA-Z0-9/+.-]+);base64,(?P<datos>.+)$", re.DOTALL
)
_CODIGO = re.compile(r"^HUE-(\d{4})-(\d{3})$")


def decodificar_data_url(data_url: str) -> tuple[bytes, str]:
    """Extrae los bytes y el MIME de un data URL (``data:<mime>;base64,...``)."""
    match = _DATA_URL.match((data_url or "").strip())
    if not match:
        raise ValueError("foto.dataUrl inválida: se espera data:<tipo>;base64,...")
    try:
        crudo = base64.b64decode(match.group("datos"))
    except (binascii.Error, ValueError) as exc:
        raise ValueError("foto.dataUrl con contenido base64 inválido") from exc
    if not crudo:
        raise ValueError("La foto viene vacía")
    return crudo, match.group("tipo")


def siguiente_codigo(db: Session, fecha_cosecha: str) -> str:
    """Regla idéntica a ``nuevoCodigo`` del frontend: HUE-<año>-<seq 3 dígitos>."""
    anio = (fecha_cosecha or "")[:4] or str(datetime.now().year)
    existentes = db.scalars(
        select(Lote.codigo).where(Lote.codigo.like(f"HUE-{anio}-%"))
    ).all()
    maximo = 0
    for codigo in existentes:
        match = _CODIGO.match(codigo)
        if match and match.group(1) == anio:
            maximo = max(maximo, int(match.group(2)))
    return f"HUE-{anio}-{maximo + 1:03d}"


def _nombre_seguro(nombre: str) -> str:
    """Normaliza el nombre de archivo (sin rutas) para usarlo como clave R2."""
    base = os.path.basename((nombre or "foto").replace("\\", "/")).strip() or "foto"
    return base.replace(" ", "_")


def crear_lote(db: Session, datos) -> Lote:
    """Crea el lote completo. ``datos`` es un ``LoteCreateIn``."""
    codigo = siguiente_codigo(db, datos.fecha_cosecha)
    lote_id = str(uuid.uuid4())
    evidencias = [{"nombre": f.nombre, "tamano": f.tamano} for f in datos.fotos]

    # 1) fotos → R2 (solo viajan sus referencias al hash, nunca los bytes)
    fotos: list[str] = []
    for indice, foto in enumerate(datos.fotos):
        crudo, mime = decodificar_data_url(foto.dataUrl)
        clave = storage.evidence_key(lote_id, f"{indice:02d}_{_nombre_seguro(foto.nombre)}")
        fotos.append(storage.upload_evidence(clave, io.BytesIO(crudo), mime))

    # 2) hash canónico (mismo payload que calcula el navegador)
    hash_hex = hash_lote(
        {
            "codigo": codigo,
            "fecha_cosecha": datos.fecha_cosecha,
            "linea_productiva": datos.linea_productiva,
            "cantidad": datos.cantidad,
            "unidad": datos.unidad,
            "finca": FINCA,
            "municipio": MUNICIPIO,
            "evidencias": evidencias,
        }
    )

    lote = Lote(
        id=lote_id,
        codigo=codigo,
        fecha_cosecha=datos.fecha_cosecha,
        fecha_postura=datos.fecha_postura or datos.fecha_cosecha,
        linea_productiva=datos.linea_productiva,
        cantidad=datos.cantidad,
        unidad=datos.unidad,
        finca=FINCA,
        municipio=MUNICIPIO,
        fotos=fotos,
        evidencias=evidencias,
        hash_sha256=hash_hex,
    )
    lote.eventos.append(
        Evento(
            tipo="cosecha",
            fecha=f"{datos.fecha_cosecha}T07:00:00-05:00",
            descripcion=(
                f"Recolección de {datos.cantidad} {datos.unidad} "
                f"de {datos.linea_productiva}."
            ),
        )
    )
    db.add(lote)
    db.commit()
    db.refresh(lote)

    # 3) ancla on-chain (no bloqueante para la existencia del registro)
    anclar_lote(db, lote)
    return lote


def anclar_lote(db: Session, lote: Lote) -> bool:
    """Ancla el hash del lote en Stellar Testnet. Idempotente; False si falla."""
    if lote.stellar_tx_hash:
        return True
    try:
        respuesta = anchor_hash(lote.codigo, lote.hash_sha256)
    except StellarError as exc:
        log.warning("Anclaje pendiente para %s: %s", lote.codigo, exc)
        return False
    lote.stellar_tx_hash = respuesta.get("tx_hash")
    lote.stellar_ledger = respuesta.get("ledger")
    db.commit()
    db.refresh(lote)
    return True
