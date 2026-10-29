"""Modelo ORM: productor autenticado con Google (HU-06, HU-07)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

# Los 5 datos que el productor debe diligenciar en su PRIMER ingreso (HU-07).
CAMPOS_PERFIL = ("nombre", "cedula", "telefono", "finca", "municipio")


def _uuid4() -> str:
    return str(uuid.uuid4())


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid4)
    # "sub" de Google: identificador estable e inmutable de la cuenta.
    google_sub: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120))
    # Nombre de la cuenta Google (solo referencia; el productor confirma el
    # suyo completo en /productor/completar).
    nombre: Mapped[str] = mapped_column(String(120), default="")
    foto_url: Mapped[str | None] = mapped_column(String(512))

    # Datos del primer ingreso (HU-07) — fuera del hash canónico.
    cedula: Mapped[str | None] = mapped_column(String(20))
    telefono: Mapped[str | None] = mapped_column(String(32))
    finca: Mapped[str | None] = mapped_column(String(80))
    municipio: Mapped[str | None] = mapped_column(String(80))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_ahora, server_default=func.now()
    )

    @property
    def perfil_completo(self) -> bool:
        """True cuando los 5 campos del primer ingreso están diligenciados."""
        return all(bool(getattr(self, campo)) for campo in CAMPOS_PERFIL)

    def como_dict(self) -> dict:
        """Shape exacto de ``frontend/lib/types.ts::Usuario``."""
        return {
            "id": self.id,
            "email": self.email,
            "nombre": self.nombre,
            "foto_url": self.foto_url,
            "cedula": self.cedula,
            "telefono": self.telefono,
            "finca": self.finca,
            "municipio": self.municipio,
            "perfil_completo": self.perfil_completo,
        }
