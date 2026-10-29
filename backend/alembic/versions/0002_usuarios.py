"""usuarios + lotes.usuario_id (autenticación con Google, HU-06..HU-08)

Revision ID: 0002_usuarios
Revises: 0001_initial
Create Date: 2026-10-29

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0002_usuarios"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("google_sub", sa.String(length=64), nullable=False, unique=True),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("foto_url", sa.String(length=512), nullable=True),
        sa.Column("cedula", sa.String(length=20), nullable=True),
        sa.Column("telefono", sa.String(length=32), nullable=True),
        sa.Column("finca", sa.String(length=80), nullable=True),
        sa.Column("municipio", sa.String(length=80), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    # Mismo nombre que produce SQLAlchemy para el índice del modelo.
    op.create_index("ix_usuarios_google_sub", "usuarios", ["google_sub"], unique=True)

    # Los lotes previos a la autenticación no tienen dueño → nullable.
    # ondelete="SET NULL": si se borra un usuario, sus lotes quedan huérfanos
    # pero intactos (la trazabilidad pública nunca se pierde).
    #
    # batch_alter_table: SQLite no admite ALTER de constraints; en modo lote la
    # tabla se recrea con copy-and-move solo allí, y en Postgres (Neon) emite un
    # ALTER TABLE corriente.
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.add_column(
            sa.Column("usuario_id", sa.String(length=36), nullable=True)
        )
        batch_op.create_index("ix_lotes_usuario_id", ["usuario_id"])
        batch_op.create_foreign_key(
            "fk_lotes_usuario_id",
            "usuarios",
            ["usuario_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("lotes") as batch_op:
        batch_op.drop_constraint("fk_lotes_usuario_id", type_="foreignkey")
        batch_op.drop_index("ix_lotes_usuario_id")
        batch_op.drop_column("usuario_id")
    op.drop_index("ix_usuarios_google_sub", table_name="usuarios")
    op.drop_table("usuarios")
