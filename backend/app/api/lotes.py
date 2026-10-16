"""Endpoints de lotes (HU-01, HU-02, HU-05) y verificación on-chain (HU-03).

Contrato con el frontend: los shapes responden ``frontend/lib/types.ts``.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_api_key
from app.db import get_db
from app.models.lote import Evento, Lote
from app.schemas import EventoIn, EventoOut, LoteCreateIn, LoteOut, VerificacionOut
from app.services import lotes as servicio
from app.services.sha256 import hash_lote
from app.services.stellar import StellarError, verify_anchor
from app.services.storage import StorageError

router = APIRouter()

ESCRITURA = [Depends(require_api_key)]


def _obtener(db: Session, codigo: str) -> Lote:
    lote = db.scalar(select(Lote).where(Lote.codigo == codigo))
    if lote is None:
        raise HTTPException(status_code=404, detail=f"Lote {codigo} no encontrado")
    return lote


@router.post(
    "/api/lotes", response_model=LoteOut, status_code=201, dependencies=ESCRITURA
)
def crear_lote(datos: LoteCreateIn, db: Session = Depends(get_db)):
    """HU-01: registrar lote con evidencia fotográfica y anclarlo en Stellar."""
    try:
        return servicio.crear_lote(db, datos)
    except StorageError as exc:
        raise HTTPException(status_code=503, detail=f"Almacenamiento: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/api/lotes", response_model=list[LoteOut])
def listar_lotes(db: Session = Depends(get_db)):
    """HU-05: listado para el buscador del productor."""
    return db.scalars(select(Lote).order_by(Lote.created_at.desc())).all()


@router.get("/api/lotes/{codigo}", response_model=LoteOut)
def obtener_lote(codigo: str, db: Session = Depends(get_db)):
    """HU-02: ficha pública del lote escaneado por QR."""
    return _obtener(db, codigo)


@router.get("/api/lotes/{codigo}/eventos", response_model=list[EventoOut])
def listar_eventos(codigo: str, db: Session = Depends(get_db)):
    """HU-05: historial de custodia."""
    return _obtener(db, codigo).eventos


@router.post(
    "/api/lotes/{codigo}/eventos",
    response_model=LoteOut,
    dependencies=ESCRITURA,
)
def agregar_evento(codigo: str, datos: EventoIn, db: Session = Depends(get_db)):
    """HU-05: registrar un evento de custodia (empaque, despacho, ...)."""
    lote = _obtener(db, codigo)
    lote.eventos.append(Evento(**datos.model_dump()))
    db.commit()
    db.refresh(lote)
    return lote


@router.post(
    "/api/lotes/{codigo}/anclar",
    response_model=LoteOut,
    dependencies=ESCRITURA,
)
def anclar(codigo: str, db: Session = Depends(get_db)):
    """Reintento de anclaje si Stellar falló al crear el lote."""
    lote = _obtener(db, codigo)
    if not servicio.anclar_lote(db, lote):
        raise HTTPException(
            status_code=502,
            detail="Stellar no confirmó el ancla; vuelve a intentarlo",
        )
    return lote


@router.get("/api/verify/{codigo}", response_model=VerificacionOut)
def verificar(codigo: str, db: Session = Depends(get_db)):
    """HU-03: recomputa el hash en el servidor y lo contrasta con Horizon."""
    lote = _obtener(db, codigo)
    hash_calculado = hash_lote(lote.como_dict())
    registrado = lote.hash_sha256

    if not lote.stellar_tx_hash:
        return VerificacionOut(
            verificado=False,
            hash_calculado=hash_calculado,
            hash_registrado=registrado,
            tx_hash=None,
            ledger=None,
            error="El lote aún no está anclado en Stellar.",
        )

    try:
        resultado = verify_anchor(lote.stellar_tx_hash, registrado)
    except StellarError as exc:
        return VerificacionOut(
            verificado=False,
            hash_calculado=hash_calculado,
            hash_registrado=registrado,
            tx_hash=lote.stellar_tx_hash,
            ledger=lote.stellar_ledger,
            error=f"Stellar no respondió: {exc}",
        )

    verificado = bool(resultado.get("verified")) and hash_calculado == registrado
    return VerificacionOut(
        verificado=verificado,
        hash_calculado=hash_calculado,
        hash_registrado=registrado,
        tx_hash=lote.stellar_tx_hash,
        ledger=resultado.get("ledger") or lote.stellar_ledger,
        error=None,
    )
