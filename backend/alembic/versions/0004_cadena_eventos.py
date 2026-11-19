"""Cadena de custodia encadenada por hash (HU-28)

Revision ID: 0004_cadena_eventos
Revises: 0003_anclaje
Create Date: 2026-11-18

Cada evento encadena el hash del anterior; el primero encadena con
``lotes.hash_sha256``. El backfill recalcula los eventos existentes en orden
de ``id`` con el mismo payload canónico que ``app.services.sha256.hash_evento``.
El hash del lote NO cambia: la paridad con ``frontend/lib/hash.ts`` queda
intacta (siguen siendo 8 campos).
"""
from __future__ import annotations

import hashlib
import json

import sqlalchemy as sa
from alembic import op

revision = "0004_cadena_eventos"
down_revision = "0003_anclaje"
branch_labels = None
depends_on = None


def _hash_eslabon(anterior: str, tipo: str, fecha: str, descripcion: str) -> str:
    payload = {
        "anterior": anterior,
        "tipo": tipo,
        "fecha": fecha,
        "descripcion": descripcion,
    }
    canonico = json.dumps(
        payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )
    return hashlib.sha256(canonico.encode("utf-8")).hexdigest()


def upgrade() -> None:
    with op.batch_alter_table("eventos") as batch_op:
        batch_op.add_column(sa.Column("hash_evento", sa.String(length=64)))
        batch_op.add_column(sa.Column("hash_evento_anterior", sa.String(length=64)))

    bind = op.get_bind()
    lotes = bind.execute(sa.text("SELECT id, hash_sha256 FROM lotes")).fetchall()
    for lote_id, hash_lote in lotes:
        eventos = bind.execute(
            sa.text(
                "SELECT id, tipo, fecha, descripcion FROM eventos "
                "WHERE lote_id = :l ORDER BY id"
            ),
            {"l": lote_id},
        ).fetchall()
        anterior = hash_lote
        for ev_id, tipo, fecha, descripcion in eventos:
            nuevo = _hash_eslabon(anterior, tipo, fecha, descripcion)
            bind.execute(
                sa.text(
                    "UPDATE eventos SET hash_evento = :h, "
                    "hash_evento_anterior = :a WHERE id = :i"
                ),
                {"h": nuevo, "a": anterior, "i": ev_id},
            )
            anterior = nuevo


def downgrade() -> None:
    with op.batch_alter_table("eventos") as batch_op:
        batch_op.drop_column("hash_evento_anterior")
        batch_op.drop_column("hash_evento")
