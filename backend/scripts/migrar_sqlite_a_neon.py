"""Migra los lotes del SQLite de desarrollo a Postgres (Neon).

Uso (desde ``backend/``):

    DATABASE_URL=postgresql://... python -m scripts.migrar_sqlite_a_neon
    DATABASE_URL=postgresql://... python -m scripts.migrar_sqlite_a_neon --forzar

Qué hace:
1. Copia ``lotes`` y ``eventos`` conservando identificadores, hashes SHA-256 y
   la referencia de la transacción de Stellar. NADA se recalcula: el hash que
   viaja en la blockchain debe ser exactamente el mismo de siempre.
2. Recalcula cada hash tras copiar y lo compara con el guardado, para detectar
   cualquier corrupción durante la transferencia.
3. Sincroniza las secuencias de ``eventos.id`` con el máximo copiado; sin esto
   el siguiente evento INSERT chocaría con una clave ya ocupada.
4. Es idempotente: los códigos ya presentes se omiten (``--forzar`` los pisa).

El origen por defecto es el SQLite local ``agrotrace_local.db``.
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone

SQLITE_LOCAL = "agrotrace_local.db"

# Orden en que se copian las tablas: primero el padre por su clave foránea.
TABLAS = ("lotes", "eventos")


def _abrir_sqlite(ruta: str) -> sqlite3.Connection:
    if not os.path.exists(ruta):
        raise SystemExit(f"No existe la base de origen: {ruta}")
    con = sqlite3.connect(ruta)
    con.row_factory = sqlite3.Row
    return con


def _normalizar_fila(fila: sqlite3.Row) -> dict:
    """Convierte una fila de SQLite al formato que espera Postgres."""
    datos = dict(fila)
    # ``fotos`` y ``evidencias`` son columnas JSON: hay que pasar objetos, no el
    # texto que guarda SQLite.
    for columna in ("fotos", "evidencias"):
        if columna in datos and isinstance(datos[columna], str):
            datos[columna] = json.loads(datos[columna])
    # SQLite no tiene tipos temporales nativos: guardó el texto SIN huso horario.
    # Los valores nacieron de ``datetime.now(timezone.utc)``, así que se les
    # devuelve UTC para no desplazar la hora al pasarlas a Postgres.
    if datos.get("created_at") and isinstance(datos["created_at"], str):
        datos["created_at"] = datetime.fromisoformat(datos["created_at"]).replace(
            tzinfo=timezone.utc
        )
    return datos


def _verificar_hashes(session, lotes_origen: list[dict]) -> list[str]:
    """Recalcula el SHA-256 de cada lote copiado y lo contrasta con el guardado."""
    from sqlalchemy import select

    from app.models.lote import Lote
    from app.services.sha256 import hash_lote

    problemas: list[str] = []
    for original in lotes_origen:
        lote = session.scalar(select(Lote).where(Lote.codigo == original["codigo"]))
        if lote is None:
            problemas.append(f"{original['codigo']}: no llegó a copiarse")
            continue
        recalculado = hash_lote(lote.como_dict())
        if recalculado != lote.hash_sha256:
            problemas.append(
                f"{original['codigo']}: el hash cambió "
                f"({lote.hash_sha256[:16]}… → {recalculado[:16]}…)"
            )
    return problemas


def _sincronizar_secuencias(session) -> None:
    """Deja la secuencia de ``eventos.id`` por encima del último id copiado."""
    from sqlalchemy import text

    session.execute(
        text(
            "SELECT setval("
            "  pg_get_serial_sequence('eventos', 'id'),"
            "  COALESCE((SELECT MAX(id) FROM eventos), 0) + 1,"
            "  false)"
        )
    )
    session.commit()


def migrar(ruta_sqlite: str, forzar: bool) -> int:
    from sqlalchemy import select

    from app.core.config import settings
    from app.db import SessionLocal
    from app.models.lote import Evento, Lote

    con = _abrir_sqlite(ruta_sqlite)
    try:
        lotes = [
            _normalizar_fila(f)
            for f in con.execute("SELECT * FROM lotes ORDER BY created_at").fetchall()
        ]
        eventos = [
            _normalizar_fila(f)
            for f in con.execute("SELECT * FROM eventos ORDER BY id").fetchall()
        ]
    finally:
        con.close()

    if not lotes:
        print(f"El origen {ruta_sqlite} no tiene lotes. Nada que migrar.")
        return 0

    destino = "Postgres (Neon)" if settings.database_url else "SQLite local (¡revisa DATABASE_URL!)"
    print(f"Origen : {ruta_sqlite}")
    print(f"Destino: {destino}")
    print(f"Lotes en el origen: {len(lotes)} · eventos: {len(eventos)}")
    print()

    session = SessionLocal()
    copiados = omitidos = 0
    try:
        for datos in lotes:
            existente = session.scalar(select(Lote).where(Lote.codigo == datos["codigo"]))
            if existente is not None and not forzar:
                print(f"  omitido  {datos['codigo']} (ya existe en el destino)")
                omitidos += 1
                continue

            if existente is not None:
                # Se repite el lote: se borra en cascada y se vuelve a insertar.
                session.delete(existente)
                session.flush()

            eventos_del_lote = [
                e for e in eventos if e["lote_id"] == datos["id"]
            ]
            # ``id`` de evento lo fija la secuencia de Postgres; no se copia.
            for e in eventos_del_lote:
                e.pop("id", None)

            session.add(
                Lote(
                    id=datos["id"],
                    codigo=datos["codigo"],
                    fecha_cosecha=datos["fecha_cosecha"],
                    fecha_postura=datos["fecha_postura"],
                    linea_productiva=datos["linea_productiva"],
                    cantidad=datos["cantidad"],
                    unidad=datos["unidad"],
                    finca=datos["finca"],
                    municipio=datos["municipio"],
                    fotos=datos["fotos"] or [],
                    evidencias=datos["evidencias"] or [],
                    hash_sha256=datos["hash_sha256"],
                    stellar_tx_hash=datos["stellar_tx_hash"],
                    stellar_ledger=datos["stellar_ledger"],
                    created_at=datos["created_at"],
                    eventos=[
                        Evento(
                            tipo=e["tipo"],
                            fecha=e["fecha"],
                            descripcion=e["descripcion"],
                        )
                        for e in eventos_del_lote
                    ],
                )
            )
            session.flush()
            print(
                f"  copiado  {datos['codigo']} "
                f"({len(datos['fotos'] or [])} fotos, {len(eventos_del_lote)} eventos)"
            )
            copiados += 1

        session.commit()
        _sincronizar_secuencias(session)

        problemas = _verificar_hashes(session, lotes)
    finally:
        session.close()

    print()
    print(f"Copiados: {copiados} · omitidos: {omitidos}")
    if problemas:
        print("\n⚠️  LA VERIFICACIÓN DE HASH FALLÓ:")
        for p in problemas:
            print(f"  - {p}")
        return 1

    print("✔ Hash SHA-256 de los 8 lotes verificado: idénticos a los del origen.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--origen", default=SQLITE_LOCAL, help=f"SQLite de origen (defecto: {SQLITE_LOCAL})"
    )
    parser.add_argument(
        "--forzar", action="store_true", help="Repite los lotes ya presentes en el destino"
    )
    args = parser.parse_args()
    return migrar(args.origen, args.forzar)


if __name__ == "__main__":
    sys.exit(main())
