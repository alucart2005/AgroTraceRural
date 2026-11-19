"""Endpoints de lotes (HU-01, HU-02, HU-05), verificación (HU-03) y hardening.

Contrato con el frontend: los shapes responden ``frontend/lib/types.ts``.

Cambios de las entregas 6–8:
- HU-24: el ancla se encola en segundo plano; el 201 no espera a Horizon.
- HU-25: el estado del ancla viaja en ``anclaje_estado``.
- HU-27: los eventos exigen sesión del productor dueño.
- HU-28: la verificación recalcula la cadena de custodia.
- HU-29: el resultado de Horizon se cachea por ``codigo`` con TTL.
- HU-30: listados paginados con ``X-Total-Count``.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_api_key, require_productor
from app.core.config import settings
from app.db import get_db
from app.models.lote import Evento, Lote
from app.models.usuario import Usuario
from app.schemas import (
    CacheInfoOut,
    EventoIn,
    EventoOut,
    LoteCreateIn,
    LoteOut,
    VerificacionOut,
)
from app.services import lotes as servicio
from app.services import verify_cache
from app.services.lotes import CodigoNoDisponible
from app.services.sha256 import hash_lote, verificar_cadena
from app.services.stellar import StellarError, verify_anchor
from app.services.storage import StorageError

router = APIRouter()
log = logging.getLogger(__name__)

LIMITE_DEFECTO = 50
LIMITE_MAXIMO = 50

# Escrituras internas sin usuario detrás (auditoría de una tx suelta). El
# registro de lotes y los eventos de un lote con dueño ya NO están aquí: la
# X-API-Key es pública (va en el bundle JS).
ESCRITURA = [Depends(require_api_key)]


def _obtener(db: Session, codigo: str) -> Lote:
    """Lote por código, excluyendo los ocultos (moderación suave).

    Un lote oculto responde 404 igual que uno inexistente: así deja de resolver
    el QR y no se puede escribir sobre él. Reversible con ``oculto = false``.
    """
    lote = db.scalar(
        select(Lote).where(Lote.codigo == codigo, Lote.oculto.is_(False))
    )
    if lote is None:
        raise HTTPException(status_code=404, detail=f"Lote {codigo} no encontrado")
    return lote


def _exigir_dueno(lote: Lote, usuario: Usuario) -> None:
    """HU-27: solo el productor que registró el lote puede escribir en él."""
    if lote.usuario_id != usuario.id:
        raise HTTPException(
            status_code=403,
            detail="Este lote pertenece a otro productor",
        )


def _paginar(
    db: Session,
    consulta,
    total_query,
    limite: int,
    offset: int,
    response: Response,
):
    """HU-30: aplica ``limit``/``offset`` y publica el total en una cabecera."""
    total = db.scalar(total_query) or 0
    response.headers["X-Total-Count"] = str(total)
    return db.scalars(consulta.offset(offset).limit(limite)).all()


@router.post(
    "/api/lotes",
    response_model=LoteOut,
    status_code=201,
)
def crear_lote(
    datos: LoteCreateIn,
    tareas: BackgroundTasks,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_productor),
):
    """HU-01/HU-08/HU-24: registra el lote y encola el ancla on-chain."""
    try:
        lote = servicio.crear_lote(db, datos, usuario_id=usuario.id)
    except CodigoNoDisponible as exc:
        # Colisión concurrente del código secuencial: se pide reintentar.
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except StorageError as exc:
        raise HTTPException(status_code=503, detail=f"Almacenamiento: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # HU-24: Horizon no bloquea la respuesta. La tarea abre su propia sesión
    # porque la del request se cierra al terminar.
    tareas.add_task(servicio.anclar_por_id, lote.id)
    return lote


@router.get("/api/lotes", response_model=list[LoteOut])
def listar_lotes(
    response: Response,
    db: Session = Depends(get_db),
    limit: int = Query(LIMITE_DEFECTO, ge=1, le=LIMITE_MAXIMO),
    offset: int = Query(0, ge=0),
):
    """HU-05/HU-30: listado público paginado (incluye lotes de todos)."""
    return _paginar(
        db,
        select(Lote)
        .where(Lote.oculto.is_(False))
        .order_by(Lote.created_at.desc(), Lote.id.desc()),
        select(func.count()).select_from(Lote).where(Lote.oculto.is_(False)),
        limit,
        offset,
        response,
    )


@router.get(
    "/api/lotes/mios",
    response_model=list[LoteOut],
)
def listar_mis_lotes(
    response: Response,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_productor),
    limit: int = Query(LIMITE_DEFECTO, ge=1, le=LIMITE_MAXIMO),
    offset: int = Query(0, ge=0),
):
    """HU-08/HU-30: "Mis lotes" paginado, solo los del productor."""
    return _paginar(
        db,
        select(Lote)
        .where(Lote.usuario_id == usuario.id, Lote.oculto.is_(False))
        .order_by(Lote.created_at.desc(), Lote.id.desc()),
        select(func.count())
        .select_from(Lote)
        .where(Lote.usuario_id == usuario.id, Lote.oculto.is_(False)),
        limit,
        offset,
        response,
    )


# IMPORTANTE: /api/lotes/mios debe declararse ANTES de /api/lotes/{codigo},
# o "mios" se capturaría como si fuera el código de un lote (404).


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
)
def agregar_evento(
    codigo: str,
    datos: EventoIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_productor),
):
    """HU-05/HU-27: el dueño registra un evento de custodia encadenado."""
    lote = _obtener(db, codigo)
    _exigir_dueno(lote, usuario)
    servicio.agregar_evento(db, lote, datos)
    return lote


@router.post(
    "/api/lotes/{codigo}/eventos/interno",
    response_model=LoteOut,
    dependencies=ESCRITURA,
)
def agregar_evento_interno(
    codigo: str,
    datos: EventoIn,
    db: Session = Depends(get_db),
):
    """HU-27: vía interna solo para lotes heredados (sin dueño).

    Un lote con dueño no se puede tocar con la X-API-Key, que es pública: si
    lo estuviera, cualquiera podría inyectar un despacho falso.
    """
    lote = _obtener(db, codigo)
    if lote.usuario_id is not None:
        raise HTTPException(
            status_code=409,
            detail="El lote tiene dueño: usa la sesión del productor",
        )
    servicio.agregar_evento(db, lote, datos)
    # Log de auditoría (HU-27): esta vía es excepcional (lotes heredados sin
    # dueño) y merece dejar rastro en los logs de Render.
    log.info(
        "Evento interno %s (%s) agregado al lote heredado %s",
        datos.tipo, datos.fecha, codigo,
    )
    return lote


@router.post(
    "/api/lotes/{codigo}/anclar",
    response_model=LoteOut,
)
def anclar(
    codigo: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_productor),
):
    """Reintento manual del ancla (HU-25), solo para el dueño del lote."""
    lote = _obtener(db, codigo)
    _exigir_dueno(lote, usuario)
    if not servicio.anclar_lote(db, lote):
        raise HTTPException(
            status_code=502,
            detail="Stellar no confirmó el ancla; vuelve a intentarlo",
        )
    return lote


@router.get("/api/verify/{codigo}", response_model=VerificacionOut)
def verificar(codigo: str, response: Response, db: Session = Depends(get_db)):
    """HU-03/HU-28/HU-29: hash del lote, ancla y cadena de custodia."""
    lote = _obtener(db, codigo)
    hash_calculado = hash_lote(lote.como_dict())
    registrado = lote.hash_sha256
    cadena_valida, hash_cadena, indice_alterado = verificar_cadena(
        lote.eventos, registrado
    )
    base = {
        "hash_calculado": hash_calculado,
        "hash_registrado": registrado,
        "cadena_valida": cadena_valida,
        "eventos_verificados": len(lote.eventos),
        "hash_cadena": hash_cadena,
        "indice_alterado": indice_alterado,
    }

    if not lote.stellar_tx_hash:
        return VerificacionOut(
            verificado=False,
            tx_hash=None,
            ledger=None,
            error="El lote aún no está anclado en Stellar.",
            cache=CacheInfoOut(hit=False),
            **base,
        )

    cacheado = verify_cache.obtener(codigo, settings.verify_cache_ttl)
    if cacheado is not None:
        resultado, edad = cacheado
        info = CacheInfoOut(hit=True, edad=edad)
    else:
        try:
            resultado = verify_anchor(lote.stellar_tx_hash, registrado)
        except StellarError as exc:
            # Un error de infraestructura NO se cachea: el siguiente escaneo
            # debe poder recuperarse solo.
            return VerificacionOut(
                verificado=False,
                tx_hash=lote.stellar_tx_hash,
                ledger=lote.stellar_ledger,
                error=f"Stellar no respondió: {exc}",
                cache=CacheInfoOut(hit=False),
                **base,
            )
        verify_cache.guardar(codigo, resultado)
        info = CacheInfoOut(hit=False)

    verificado = (
        bool(resultado.get("verified"))
        and hash_calculado == registrado
        and cadena_valida
    )
    response.headers["Cache-Control"] = "public, max-age=60"
    return VerificacionOut(
        verificado=verificado,
        tx_hash=lote.stellar_tx_hash,
        ledger=resultado.get("ledger") or lote.stellar_ledger,
        error=None,
        cache=info,
        **base,
    )
