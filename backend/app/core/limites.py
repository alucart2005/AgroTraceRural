"""Middlewares de abuso para la API pública (HU-31).

Dos capas, sin dependencias nuevas:

- ``LimiteCuerpoMiddleware``: corta peticiones con cuerpo mayor a
  ``MAX_BODY_BYTES`` antes de que FastAPI parsee el JSON. Con 6 fotos en base64
  de hasta 10 MB el cuerpo podía llegar a ~60 MB y Render free no lo sostiene.
- ``RateLimitMiddleware``: ventana deslizante por IP y por tipo de ruta
  (lectura, escritura, login). Devuelve ``429`` con ``Retry-After``.

Ambos son ASGI puros. La ventana vive en memoria del proceso: con una sola
instancia (plan free de Render) es suficiente; con varias réplicas haría falta
un almacén compartido.
"""

from __future__ import annotations

import json
import threading
import time
from collections import deque

from app.core.config import settings


async def _responder(send, status: int, detalle: str, extra=()):
    cuerpo = json.dumps({"detail": detalle}).encode("utf-8")
    cabeceras = [
        (b"content-type", b"application/json"),
        (b"content-length", str(len(cuerpo)).encode("ascii")),
        *extra,
    ]
    await send(
        {"type": "http.response.start", "status": status, "headers": cabeceras}
    )
    await send({"type": "http.response.body", "body": cuerpo})


class _CuerpoExcedido(Exception):
    pass


class LimiteCuerpoMiddleware:
    """Rechaza cuerpos demasiado grandes (413) antes de parsearlos."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        maximo = settings.max_body_bytes
        cabeceras = dict(scope["headers"])
        declarado = cabeceras.get(b"content-length")
        if declarado and declarado.isdigit() and int(declarado) > maximo:
            return await _responder(
                send,
                413,
                f"El cuerpo supera el máximo de {maximo} bytes",
            )

        recibidos = 0
        iniciado = {"valor": False}

        async def receive_controlado():
            nonlocal recibidos
            mensaje = await receive()
            if mensaje["type"] == "http.request":
                recibidos += len(mensaje.get("body", b""))
                if recibidos > maximo:
                    raise _CuerpoExcedido()
            return mensaje

        async def send_controlado(mensaje):
            if mensaje["type"] == "http.response.start":
                iniciado["valor"] = True
            await send(mensaje)

        try:
            await self.app(scope, receive_controlado, send_controlado)
        except _CuerpoExcedido:
            # Solo se puede responder si la app no alcanzó a emitir cabeceras.
            if not iniciado["valor"]:
                await _responder(
                    send,
                    413,
                    f"El cuerpo supera el máximo de {maximo} bytes",
                )


class RateLimitMiddleware:
    """Ventana deslizante por IP y categoría de ruta (429 + Retry-After)."""

    _LIMPIEZA_CADA = 5_000  # claves acumuladas antes de podar

    def __init__(self, app):
        self.app = app
        self._marcas: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._altas = 0

    def _permitir(self, clave: str, limite: int, ventana: int) -> tuple[bool, int]:
        if limite <= 0:
            return True, 0
        ahora = time.monotonic()
        with self._lock:
            cola = self._marcas.setdefault(clave, deque())
            while cola and ahora - cola[0] >= ventana:
                cola.popleft()
            if len(cola) >= limite:
                return False, max(1, int(ventana - (ahora - cola[0])) + 1)
            cola.append(ahora)
            self._altas += 1
            if self._altas >= self._LIMPIEZA_CADA:
                self._podar(ahora, ventana)
                self._altas = 0
            return True, 0

    def _podar(self, ahora: float, ventana: int) -> None:
        """Elimina claves inactivas para que el diccionario no crezca sin fin."""
        for clave in list(self._marcas):
            cola = self._marcas[clave]
            if not cola or ahora - cola[-1] >= ventana:
                self._marcas.pop(clave, None)

    def _clasificar(self, ruta: str, metodo: str) -> tuple[str | None, int]:
        if ruta == "/api/health":
            return None, 0
        if metodo == "OPTIONS":  # preflight de CORS: nunca se limita
            return None, 0
        if metodo in ("POST", "PUT", "PATCH", "DELETE"):
            if ruta == "/api/auth/google":
                return "login", settings.rate_limit_login
            return "write", settings.rate_limit_write
        return "read", settings.rate_limit_read

    @staticmethod
    def _ip(scope) -> str:
        cabeceras = dict(scope.get("headers") or [])
        adelante = cabeceras.get(b"x-forwarded-for")
        if adelante:
            # Render añade la IP real al principio de la cadena.
            return adelante.split(b",")[0].strip().decode("latin-1", "ignore")
        cliente = scope.get("client")
        return cliente[0] if cliente else "desconocida"

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not settings.rate_limit_enabled:
            return await self.app(scope, receive, send)

        categoria, limite = self._clasificar(scope["path"], scope["method"])
        if categoria is None:
            return await self.app(scope, receive, send)

        clave = f"{self._ip(scope)}:{categoria}"
        permitido, reintento = self._permitir(
            clave, limite, settings.rate_limit_window
        )
        if not permitido:
            return await _responder(
                send,
                429,
                "Demasiadas solicitudes; intenta de nuevo en un minuto",
                extra=[(b"retry-after", str(reintento).encode("ascii"))],
            )
        await self.app(scope, receive, send)
