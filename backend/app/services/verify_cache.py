"""Caché en memoria del resultado de Horizon para la verificación pública (HU-29).

El QR se imprime en cada cubeta: un mismo ``codigo`` se escanea muchas veces en
pocas horas y el resultado on-chain no cambia. Se cachea **solo** la respuesta
de Horizon (no el hash recalculado ni la cadena), porque esos se recomputan en
cada petición y son la parte que detecta alteraciones.

Limitación conocida: es memoria del proceso. El plan free de Render corre una
sola instancia; con varias réplicas haría falta Redis o una tabla compartida.
"""

from __future__ import annotations

import threading
import time

# codigo -> (instante_monotono, resultado de verify_anchor)
_CACHE: dict[str, tuple[float, dict]] = {}
_LOCK = threading.Lock()


def obtener(codigo: str, ttl: int) -> tuple[dict, int] | None:
    """Devuelve ``(resultado, edad_segundos)`` o ``None`` si no hay/expiró."""
    if ttl <= 0:
        return None
    with _LOCK:
        entrada = _CACHE.get(codigo)
        if entrada is None:
            return None
        guardado_en, valor = entrada
        edad = int(time.monotonic() - guardado_en)
        if edad > ttl:
            _CACHE.pop(codigo, None)
            return None
        return valor, edad


def guardar(codigo: str, valor: dict) -> None:
    with _LOCK:
        _CACHE[codigo] = (time.monotonic(), valor)


def invalidar(codigo: str) -> None:
    with _LOCK:
        _CACHE.pop(codigo, None)


def limpiar() -> None:
    """Vacía la caché (tests y reinicios controlados)."""
    with _LOCK:
        _CACHE.clear()
