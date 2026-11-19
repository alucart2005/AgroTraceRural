"""Estado del ancla on-chain (HU-24, HU-25)

Revision ID: 0003_anclaje
Revises: 0002_usuarios
Create Date: 2026-11-18

El lote se guarda con ``anclaje_estado = 'pendiente'`` y el ancla viaja en
segundo plano. Los lotes que ya tenían transacción quedan como ``anclado``.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003_anclaje"
down_revision = "0002_usuarios"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # batch_alter_table: SQLite no admite ALTER corriente en todos los casos.
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.add_column(
            sa.Column(
                "anclaje_estado",
                sa.String(length=20),
                nullable=False,
                server_default="pendiente",
            )
        )
        batch_op.add_column(sa.Column("anclaje_error", sa.Text(), nullable=True))
        batch_op.add_column(
            sa.Column(
                "intentos_anclaje",
                sa.Integer(),
                nullable=False,
                server_default="0",
            )
        )
        batch_op.add_column(
            sa.Column("ultimo_intento_at", sa.DateTime(timezone=True), nullable=True)
        )
        batch_op.create_index("ix_lotes_anclaje_estado", ["anclaje_estado"])

    # Los lotes anclados antes de esta entrega no deben reintentarse.
    op.execute(
        "UPDATE lotes SET anclaje_estado = 'anclado' "
        "WHERE stellar_tx_hash IS NOT NULL"
    )


def downgrade() -> None:
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.drop_index("ix_lotes_anclaje_estado")
        batch_op.drop_column("ultimo_intento_at")
        batch_op.drop_column("intentos_anclaje")
        batch_op.drop_column("anclaje_error")
        batch_op.drop_column("anclaje_estado")
