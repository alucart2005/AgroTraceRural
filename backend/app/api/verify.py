"""Verificación arbitraria de un ancla (p. ej. para auditar una tx suelta).

No lo usa el frontend: la ruta pública del consumidor es ``GET /api/verify/{codigo}``,
que recomputa el hash del lote y contrasta su propio ancla. Este endpoint acepta
cualquier par ``tx_hash``/``hash_hex`` y dispara una consulta a Horizon, así que
exige ``X-API-Key``: sin ella sería un proxy abierto al servicio de Stellar.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import require_api_key
from app.services.stellar import StellarError, verify_anchor

router = APIRouter()


class VerifyRequest(BaseModel):
    tx_hash: str = Field(min_length=1, max_length=64)
    hash_hex: str = Field(min_length=1, max_length=64)


@router.post("/api/verify", dependencies=[Depends(require_api_key)])
def verify(req: VerifyRequest):
    try:
        return verify_anchor(req.tx_hash, req.hash_hex)
    except StellarError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
