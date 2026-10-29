"""Esquemas Pydantic: contratos de la API.

Los nombres de campo replican exactamente los tipos de ``frontend/lib/types.ts``
(``Lote``, ``Evento``, ``Verificacion``) para que la UI los consuma sin cambios.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Máximos confirmados para evidencia (HU-01): 6 fotos de hasta 10 MB c/u.
MAX_FOTOS = 6
MAX_TAMANO_FOTO = 10_000_000

# Los límites de longitud replican los de las columnas del modelo (String(80),
# String(32), String(40)). Sin ellos un valor más largo cruzaría la validación
# y estallaría en la base de datos como un DataError → 500 en vez de 422.
MAX_LINEA = 80
MAX_UNIDAD = 32
MAX_DESCRIPCION = 2_000
MAX_FECHA_EVENTO = 40

TipoEvento = Literal["cosecha", "clasificacion", "empaque", "despacho"]


class FotoIn(BaseModel):
    dataUrl: str = Field(min_length=16, description="data:<mime>;base64,...")
    nombre: str = Field(min_length=1, max_length=120)
    tamano: int = Field(ge=1, le=MAX_TAMANO_FOTO)


class LoteCreateIn(BaseModel):
    # ``pattern`` valida el formato ANTES de tocar la base de datos. La fecha se
    # guarda como texto (String(10)) porque entra en el payload canónico del
    # hash; sin el patrón un valor arbitrario se persistiría sin rechazo.
    fecha_cosecha: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$", max_length=10)
    fecha_postura: str | None = Field(
        default=None, pattern=r"^\d{4}-\d{2}-\d{2}$", max_length=10
    )
    linea_productiva: str = Field(min_length=1, max_length=MAX_LINEA)
    cantidad: int = Field(gt=0, le=2_147_483_647)
    unidad: str = Field(min_length=1, max_length=MAX_UNIDAD)
    fotos: list[FotoIn] = Field(default_factory=list, max_length=MAX_FOTOS)

    @field_validator("fecha_cosecha", "fecha_postura")
    @classmethod
    def _fecha_existe(cls, value: str | None) -> str | None:
        """Rechaza fechas imposibles (2027-13-45) manteniendo el formato texto."""
        if value is None:
            return value
        from datetime import date

        try:
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError(f"Fecha inválida: {value}") from exc
        return value


class EventoIn(BaseModel):
    tipo: TipoEvento
    fecha: str = Field(min_length=1, max_length=MAX_FECHA_EVENTO)
    descripcion: str = Field(min_length=1, max_length=MAX_DESCRIPCION)


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


# --- Autenticación con Google (HU-06, HU-07) --------------------------------

MAX_NOMBRE = 120
MAX_CEDULA = 20
MAX_TELEFONO = 32


class GoogleLoginIn(BaseModel):
    # ID token que entrega Google Identity Services en el navegador (popup).
    id_token: str = Field(min_length=16, max_length=8192)


class UsuarioOut(BaseModel):
    id: str
    email: str
    nombre: str
    foto_url: str | None = None
    cedula: str | None = None
    telefono: str | None = None
    finca: str | None = None
    municipio: str | None = None
    perfil_completo: bool = False

    @classmethod
    def de(cls, usuario) -> "UsuarioOut":
        """Parte de ``usuario.como_dict()`` (incluye la propiedad del perfil)."""
        return cls(**usuario.como_dict())


class SesionOut(BaseModel):
    token: str
    usuario: UsuarioOut


class PerfilIn(BaseModel):
    """Los 5 datos obligatorios del primer ingreso (HU-07).

    Los límites replican las columnas del modelo: sin ellos un valor más largo
    cruzaría Pydantic y estallaría en la base como DataError → 500 en vez de 422.
    """

    nombre: str = Field(min_length=1, max_length=MAX_NOMBRE)
    cedula: str = Field(min_length=1, max_length=MAX_CEDULA)
    telefono: str = Field(min_length=1, max_length=MAX_TELEFONO)
    finca: str = Field(min_length=1, max_length=80)
    municipio: str = Field(min_length=1, max_length=80)
