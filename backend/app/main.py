from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, lotes, verify
from app.core.config import settings
from app.db import Base, engine
from app.models import Evento, Lote  # noqa: F401 — registra las tablas en Base.metadata

ORIGENES_PUBLICOS = (
    "https://frontend-2mx1.vercel.app",  # producción (Vercel)
    "http://localhost:3000",  # desarrollo del frontend
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # SQLite local: crea el esquema si no existe. En Render el esquema lo
    # define Alembic (``alembic upgrade head``) antes de arrancar.
    Base.metadata.create_all(bind=engine)
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
app.include_router(verify.router)
app.include_router(lotes.router)
