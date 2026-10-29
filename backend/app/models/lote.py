"""Modelos ORM: lote (batch de huevos) y sus eventos de custodia."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid4() -> str:
    return str(uuid.uuid4())


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class Lote(Base):
    __tablename__ = "lotes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid4)
    codigo: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    fecha_cosecha: Mapped[str] = mapped_column(String(10))
    fecha_postura: Mapped[str | None] = mapped_column(String(10))
    linea_productiva: Mapped[str] = mapped_column(String(80))
    cantidad: Mapped[int] = mapped_column(Integer)
    unidad: Mapped[str] = mapped_column(String(32))
    finca: Mapped[str] = mapped_column(String(80))
    municipio: Mapped[str] = mapped_column(String(80))
    # URLs públicas de R2 (una por foto). Las fotos NUNCA van a la blockchain.
    fotos: Mapped[list] = mapped_column(JSON, default=list)
    # [{nombre, tamano}, ...] — es lo que entra en el hash canónico.
    evidencias: Mapped[list] = mapped_column(JSON, default=list)
    hash_sha256: Mapped[str] = mapped_column(String(64))
    stellar_tx_hash: Mapped[str | None] = mapped_column(String(64))
    stellar_ledger: Mapped[int | None] = mapped_column(Integer)
    # Productor que lo registró (HU-08). Queda FUERA del hash canónico y es
    # nullable: los lotes previos a la autenticación no tienen dueño.
    usuario_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("usuarios.id", ondelete="SET NULL"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_ahora, server_default=func.now()
    )

    eventos: Mapped[list[Evento]] = relationship(  # noqa: F821
        back_populates="lote",
        cascade="all, delete-orphan",
        order_by="Evento.id",
    )

    def como_dict(self) -> dict:
        """Dict con los campos del payload canónico (paridad con el frontend)."""
        return {
            "codigo": self.codigo,
            "fecha_cosecha": self.fecha_cosecha,
            "linea_productiva": self.linea_productiva,
            "cantidad": self.cantidad,
            "unidad": self.unidad,
            "finca": self.finca,
            "municipio": self.municipio,
            "evidencias": self.evidencias or [],
        }


class Evento(Base):
    __tablename__ = "eventos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lote_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lotes.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(20))
    fecha: Mapped[str] = mapped_column(String(40))
    descripcion: Mapped[str] = mapped_column(Text)

    lote: Mapped[Lote] = relationship(back_populates="eventos")
