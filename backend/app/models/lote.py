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
    # Estado del ancla (HU-24/HU-25): ``pendiente|anclado|fallido|fallido_definitivo``.
    # El lote existe desde el primer commit; el ancla viaja en segundo plano.
    anclaje_estado: Mapped[str] = mapped_column(
        String(20), default="pendiente", server_default="pendiente", index=True
    )
    anclaje_error: Mapped[str | None] = mapped_column(Text)
    intentos_anclaje: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    ultimo_intento_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
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
    # Cadena de custodia (HU-28): cada evento encadena el hash del anterior.
    # El primer eslabón encadena con ``Lote.hash_sha256``.
    hash_evento: Mapped[str | None] = mapped_column(String(64))
    hash_evento_anterior: Mapped[str | None] = mapped_column(String(64))

    lote: Mapped[Lote] = relationship(back_populates="eventos")
