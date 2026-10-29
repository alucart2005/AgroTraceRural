from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, health, lotes, verify
from app.core.config import settings
from app.db import Base, asegurar_columnas_sqlite, engine
from app.models import Evento, Lote, Usuario  # noqa: F401 — registra las tablas

ORIGENES_PUBLICOS = (
    "https://frontend-2mx1.vercel.app",  # producción (Vercel)
    "http://localhost:3000",  # desarrollo del frontend
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # SQLite local: crea el esquema si no existe y agrega columnas que
    # create_all no añade a tablas ya existentes. En Render el esquema lo
    # define Alembic (``alembic upgrade head``) antes de arrancar.
    Base.metadata.create_all(bind=engine)
    asegurar_columnas_sqlite()
    yield


app = FastAPI(title="AgroTrace Rural API", lifespan=lifespan)

allow_origins = [o for o in dict.fromkeys([settings.frontend_url, *ORIGENES_PUBLICOS]) if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(verify.router)
app.include_router(lotes.router)
