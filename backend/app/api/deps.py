"""Control de acceso de la API: API key compartida en headers.

Los endpoints de escritura exigen ``X-API-Key``. Las lecturas quedan abiertas
para que el QR del consumidor funcione sin credenciales. Si ``API_KEY`` no está
configurada (desarrollo local), la API queda abierta.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException

from app.core.config import settings


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    esperada = settings.api_key
    if not esperada:
        return
    if not x_api_key or not secrets.compare_digest(x_api_key, esperada):
        raise HTTPException(
            status_code=401, detail="X-API-Key ausente o inválida"
        )
