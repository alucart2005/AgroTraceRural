"""esquema inicial: lotes y eventos

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-16

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "lotes",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "codigo", sa.String(length=16), nullable=False, unique=True, index=True
        ),
        sa.Column("fecha_cosecha", sa.String(length=10), nullable=False),
        sa.Column("fecha_postura", sa.String(length=10), nullable=True),
        sa.Column("linea_productiva", sa.String(length=80), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False),
        sa.Column("unidad", sa.String(length=32), nullable=False),
        sa.Column("finca", sa.String(length=80), nullable=False),
        sa.Column("municipio", sa.String(length=80), nullable=False),
        sa.Column("fotos", sa.JSON(), nullable=False),
        sa.Column("evidencias", sa.JSON(), nullable=False),
        sa.Column("hash_sha256", sa.String(length=64), nullable=False),
        sa.Column("stellar_tx_hash", sa.String(length=64), nullable=True),
        sa.Column("stellar_ledger", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_table(
        "eventos",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("lote_id", sa.String(length=36), nullable=False),
        sa.Column("tipo", sa.String(length=20), nullable=False),
        sa.Column("fecha", sa.String(length=40), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["lote_id"], ["lotes.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_eventos_lote_id", "eventos", ["lote_id"])


def downgrade() -> None:
    op.drop_index("ix_eventos_lote_id", table_name="eventos")
    op.drop_table("eventos")
    op.drop_table("lotes")
