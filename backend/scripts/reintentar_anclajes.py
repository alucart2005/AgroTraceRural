"""Reintenta los anclajes pendientes o fallidos (HU-25).

Pensado para un cron de Render cada 10 minutos:

    python -m scripts.reintentar_anclajes

Toma hasta ``ANCLAJE_LOTE_POR_PASADA`` lotes en estado ``pendiente`` o
``fallido``, intenta anclarlos y marca ``fallido_definitivo`` tras
``ANCLAJE_REINTENTOS_MAX`` intentos. Es idempotente: un lote ya anclado no
genera otra transacción.
"""

from __future__ import annotations

import logging

from app.core.config import settings
from app.db import SessionLocal
from app.services.lotes import reintentar_pendientes

log = logging.getLogger(__name__)


def main() -> int:
    db = SessionLocal()
    try:
        anclados = reintentar_pendientes(
            db, limite=settings.anclaje_lote_por_pasada
        )
    finally:
        db.close()
    print(
        "Reintento de anclajes: "
        f"{anclados} lote(s) anclado(s) en esta pasada"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
