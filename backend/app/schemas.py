"""Esquemas Pydantic: contratos de la API.

Los nombres de campo replican exactamente los tipos de ``frontend/lib/types.ts``
(``Lote``, ``Evento``, ``Verificacion``) para que la UI los consuma sin cambios.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Máximos confirmados para evidencia (HU-01): 6 fotos de hasta 10 MB c/u.
MAX_FOTOS = 6
MAX_TAMANO_FOTO = 10_000_000

TipoEvento = Literal["cosecha", "clasificacion", "empaque", "despacho"]


class FotoIn(BaseModel):
    dataUrl: str = Field(min_length=16, description="data:<mime>;base64,...")
    nombre: str = Field(min_length=1, max_length=120)
    tamano: int = Field(ge=1, le=MAX_TAMANO_FOTO)


class LoteCreateIn(BaseModel):
    fecha_cosecha: str
    fecha_postura: str | None = None
    linea_productiva: str
    cantidad: int = Field(gt=0)
    unidad: str
    fotos: list[FotoIn] = Field(default_factory=list, max_length=MAX_FOTOS)


class EventoIn(BaseModel):
    tipo: TipoEvento
    fecha: str
    descripcion: str


class EvidenciaOut(BaseModel):
    nombre: str
    tamano: int

    model_config = {"from_attributes": True}


class EventoOut(BaseModel):
    id: str
    tipo: str
    fecha: str
    descripcion: str

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def _id_a_texto(cls, value: object) -> str:
        return str(value)


class LoteOut(BaseModel):
    id: str
    codigo: str
    fecha_cosecha: str
    fecha_postura: str | None = None
    linea_productiva: str
    cantidad: int
    unidad: str
    finca: str
    municipio: str
    fotos: list[str]
    evidencias: list[EvidenciaOut]
    hash_sha256: str
    stellar_tx_hash: str | None = None
    stellar_ledger: int | None = None
    eventos: list[EventoOut] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}


class VerificacionOut(BaseModel):
    verificado: bool
    hash_calculado: str
    hash_registrado: str | None
    tx_hash: str | None
    ledger: int | None
    demo: bool = False
    # Motivo por el que NO se pudo verificar (infraestructura), p.ej. Horizon
    # inaccesible o lote aún sin anclar. Si es ``None`` y ``verificado`` es
    # False, los datos fueron alterados.
    error: str | None = None
