"""Autenticación con Google y emisión de la sesión propia (HU-06).

Dos piezas:
1. ``verificar_id_token`` valida el ID token que Google entrega al navegador
   (firma, audiencia y expiración) usando la librería oficial ``google-auth``.
2. ``crear_jwt``/``verificar_jwt`` manejan el JWT propio (HS256) que el
   frontend guarda en localStorage y envía como ``Authorization: Bearer``.

Solo viaja el ``sub`` de Google y el id interno del usuario: ningún dato del
productor se firma ni se expone en el token.
"""

from __future__ import annotations

import time
from typing import Any

import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.core.config import settings

# Duración de la sesión en el navegador (~30 días).
DURACION_SEGUNDOS = 30 * 24 * 60 * 60

# Emisores válidos del ID token (documentación de Google Identity Services).
_EMISORES = ("accounts.google.com", "https://accounts.google.com")


class AuthError(Exception):
    """Token ausente, inválido, expirado o backend sin configurar."""


def verificar_id_token(token: str) -> dict[str, Any]:
    """Valida el ID token de Google y devuelve su payload (``sub``, ``email``…).

    ``verify_oauth2_token`` comprueba firma, ``aud`` (= client_id) y ``exp``.
    """
    if not settings.google_client_id:
        raise AuthError("Google OAuth no está configurado (falta GOOGLE_CLIENT_ID)")
    try:
        datos = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.google_client_id
        )
    except Exception as exc:  # GoogleAuthError, ValueError, red caída…
        raise AuthError("Token de Google inválido o expirado") from exc
    if datos.get("iss") not in _EMISORES:
        raise AuthError("Token de Google emitido por un origen desconocido")
    if not datos.get("sub"):
        raise AuthError("El token de Google no identifica una cuenta")
    return datos


def crear_jwt(usuario_id: str) -> str:
    """Firma el JWT de sesión del productor (HS256, exp ~30 días)."""
    if not settings.auth_secret:
        raise AuthError("AUTH_SECRET no está configurado en el backend")
    ahora = int(time.time())
    return jwt.encode(
        {"sub": usuario_id, "iat": ahora, "exp": ahora + DURACION_SEGUNDOS},
        settings.auth_secret,
        algorithm="HS256",
    )


def verificar_jwt(token: str) -> str:
    """Devuelve el ``id`` del usuario que firmó el token; lanza ``AuthError``."""
    if not settings.auth_secret:
        raise AuthError("AUTH_SECRET no está configurado en el backend")
    try:
        datos = jwt.decode(token, settings.auth_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise AuthError("Sesión expirada; vuelve a iniciar sesión") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError("Sesión inválida") from exc
    usuario_id = datos.get("sub")
    if not isinstance(usuario_id, str) or not usuario_id:
        raise AuthError("Sesión inválida")
    return usuario_id
