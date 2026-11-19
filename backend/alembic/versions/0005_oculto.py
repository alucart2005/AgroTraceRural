"""Moderación suave: lotes ocultos (no aparecen en listados, ficha ni QR)

Revision ID: 0005_oculto
Revises: 0004_cadena_eventos
Create Date: 2026-11-19

Ocultar un lote NO lo borra ni altera su hash: la transacción on-chain queda
intacta y la operación es reversible con ``oculto = false``. ``oculto`` queda
fuera del payload canónico (8 campos), así que la verificación no cambia.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0005_oculto"
down_revision = "0004_cadena_eventos"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # batch_alter_table: SQLite no admite ALTER corriente en todos los casos.
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.add_column(
            sa.Column(
                "oculto",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.drop_column("oculto")
