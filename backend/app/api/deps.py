"""Control de acceso de la API.

Dos mecanismos distintos:

- ``require_api_key``: clave compartida en ``X-API-Key`` para las escrituras
  internas que no tiene un usuario detrás (eventos de custodia, anclaje y
  auditoría de una tx suelta). Si ``API_KEY`` está vacía (desarrollo local),
  esos endpoints quedan abiertos.
- ``require_productor``: sesión real del productor (``Authorization: Bearer``
  con el JWT que emitió ``POST /api/auth/google``). Exige para crear lotes
  (HU-08): la X-API-Key es pública (vive en el bundle JS), así que ya no sirve
  como puerta de entrada al registro.

Las lecturas quedan abiertas para que el QR del consumidor funcione sin
credenciales.
"""

from __future__ import annotations

import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models.usuario import Usuario
from app.services import auth
from app.services.auth import AuthError


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    esperada = settings.api_key
    if not esperada:
        return
    if not x_api_key or not secrets.compare_digest(x_api_key, esperada):
        raise HTTPException(
            status_code=401, detail="X-API-Key ausente o inválida"
        )


def _token_de_bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail="Sesión de productor requerida; inicia sesión con Google",
        )
    return authorization.split(" ", 1)[1].strip()


async def require_productor(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    """Valida el JWT de sesión y devuelve el productor autenticado."""
    token = _token_de_bearer(authorization)
    try:
        usuario_id = auth.verificar_jwt(token)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        # El usuario fue borrado de la BD: la sesión ya no representa a nadie.
        raise HTTPException(status_code=401, detail="Sesión inválida")
    return usuario
