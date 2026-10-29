"""Endpoints de autenticación con Google (HU-06) y perfil (HU-07).

- ``POST /api/auth/google``: valida el ID token de Google, crea (o recupera)
  al productor por su ``sub`` y devuelve el JWT de sesión de AgroTrace.
- ``GET  /api/auth/me``: perfil del productor autenticado.
- ``PUT  /api/auth/me``: completa los 5 datos del primer ingreso.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_productor
from app.db import get_db
from app.models.usuario import Usuario
from app.schemas import GoogleLoginIn, PerfilIn, SesionOut, UsuarioOut
from app.services import auth
from app.services.auth import AuthError

router = APIRouter()


@router.post("/api/auth/google", response_model=SesionOut)
def login_con_google(datos: GoogleLoginIn, db: Session = Depends(get_db)):
    """HU-06: intercambia el ID token de Google por la sesión de AgroTrace."""
    try:
        info = auth.verificar_id_token(datos.id_token)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    usuario = db.scalar(select(Usuario).where(Usuario.google_sub == info["sub"]))
    if usuario is None:
        # Primer ingreso: se crea el registro (HU-07 pedirá los datos después).
        usuario = Usuario(
            google_sub=info["sub"],
            email=info.get("email") or "",
            nombre=info.get("name") or "",
            foto_url=info.get("picture"),
        )
        db.add(usuario)
    else:
        # Email/foto pueden cambiar en Google: se refrescan en cada ingreso.
        usuario.email = info.get("email") or usuario.email
        usuario.foto_url = info.get("picture") or usuario.foto_url
    db.commit()
    db.refresh(usuario)

    try:
        token = auth.crear_jwt(usuario.id)
    except AuthError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return SesionOut(token=token, usuario=UsuarioOut.de(usuario))


@router.get("/api/auth/me", response_model=UsuarioOut)
def mi_perfil(usuario: Usuario = Depends(require_productor)):
    """HU-07: devuelve el perfil para decidir si falta completarlo."""
    return UsuarioOut.de(usuario)


@router.put("/api/auth/me", response_model=UsuarioOut)
def completar_perfil(
    datos: PerfilIn,
    usuario: Usuario = Depends(require_productor),
    db: Session = Depends(get_db),
):
    """HU-07: guarda los 5 datos del primer ingreso y marca el perfil completo."""
    for campo, valor in datos.model_dump().items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return UsuarioOut.de(usuario)
