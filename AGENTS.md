# AGENTS.md

AgroTrace Rural: trazabilidad de lotes de huevos de Finca Guarumo con SHA-256
anclado en Stellar Testnet y QR por cubeta. Dos apps independientes sin gestor
de paquetes común: `frontend/` (Next.js 14, App Router) y `backend/` (FastAPI +
SQLAlchemy). UI y términos de dominio en español (Colombia): *lote, cubeta,
finca*. Ejecuta los comandos dentro del subdirectorio correspondiente.

## Comandos

Frontend (`frontend/`):
- `npm install`
- `npm run dev` → http://localhost:3000
- `npm run lint`
- `npm run build` — también es la comprobación de tipos; no hay script `typecheck`. Luego `npm run start`.
- No hay ejecutor de tests: verificar con lint + build.

Backend (`backend/`, ejecutar desde ahí para que resuelvan los imports `app.*`):
- Setup: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- `.venv/bin/python -m pytest -q` — **68 tests**, todos con R2 y Stellar simulados (sin red, sin BD; el ID token de Google se simula)
- `uvicorn app.main:app --reload` — API en :8000
- `alembic upgrade head` — migra la base configurada en `DATABASE_URL`
- `python -m scripts.anchor_demo` — ancla y verifica de verdad en Testnet (necesita `STELLAR_SECRET_KEY`; crea una transacción real)
- `python -m scripts.migrar_sqlite_a_neon` — copia lotes del SQLite local a Neon y revalida los hashes
- `python -m scripts.stellar_account create|show`
- Requiere Python ≥3.10 (PEP 604 `X | None`); el Dockerfile usa 3.11.

## Base de datos

SQLAlchemy 2 + Alembic. **Producción: Neon Postgres** (proyecto `agrotrace`,
región `aws-us-west-2`). **Desarrollo local: SQLite** (`agrotrace_local.db`,
ignorado por git) cuando `DATABASE_URL` está vacía — ver `app/db.py`.

La URL de Neon vive en `backend/.env.neon` (ignorado por git), **no** en
`.env`: así el día a día sigue usando SQLite y no se ensucian los datos reales.
El backend no la carga sola; se pasa a mano cuando hace falta:

```bash
DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.neon)" alembic upgrade head
DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.neon)" python -m scripts.migrar_sqlite_a_neon
```

En Render `DATABASE_URL` se fija en el panel (Settings → Environment) con el
endpoint **pooler** de Neon, no el directo.

Modelos (`app/models/lote.py`): `Lote` (codigo único `HUE-YYYY-NNN`,
fecha_cosecha, fecha_postura, linea_productiva, cantidad, unidad, finca,
municipio, `fotos` JSON con URLs de R2, `evidencias` JSON `[{nombre,tamano}]`,
hash_sha256, stellar_tx_hash, stellar_ledger, `usuario_id` FK **nullable**
(fuera del hash), created_at) y `Evento`
(tipo/fecha/descripcion, clave foránea a lote con `ON DELETE CASCADE`).

Modelo `Usuario` (`app/models/usuario.py`, HU-06/HU-07): `google_sub` único,
email, nombre, foto_url y los 5 datos del primer ingreso (cedula, telefono,
finca, municipio); la propiedad `perfil_completo` marca si ya se diligenciaron.
Migración `0002_usuarios` (usa `batch_alter_table`: SQLite no admite ALTER de
constraints).

`lifespan` ejecuta `Base.metadata.create_all` y luego
`asegurar_columnas_sqlite()` (agrega a un SQLite ya existente las columnas que
`create_all` no añade a tablas viejas, p. ej. `lotes.usuario_id`); en Render las
tablas las define Alembic (`alembic upgrade head` en el CMD del Dockerfile) antes
de arrancar, así que `create_all` queda sin efecto.

## API (`app/api/`)

| Método | Ruta | Auth | HU |
|---|---|---|---|
| `GET` | `/api/health` | — | — |
| `POST` | `/api/auth/google` | ID token de Google | HU-06 |
| `GET` | `/api/auth/me` | Bearer JWT | HU-07 |
| `PUT` | `/api/auth/me` | Bearer JWT | HU-07 |
| `POST` | `/api/lotes` | Bearer JWT | HU-01 · HU-08 |
| `GET` | `/api/lotes` | — | HU-05 |
| `GET` | `/api/lotes/mios` | Bearer JWT | HU-08 |
| `GET` | `/api/lotes/{codigo}` | — | HU-02 |
| `GET` | `/api/lotes/{codigo}/eventos` | — | HU-05 |
| `POST` | `/api/lotes/{codigo}/eventos` | `X-API-Key` | HU-05 |
| `POST` | `/api/lotes/{codigo}/anclar` | `X-API-Key` | reintento de ancla |
| `GET` | `/api/verify/{codigo}` | — | HU-03 |
| `POST` | `/api/verify` | `X-API-Key` | auditoría de una tx suelta |

Dos mecanismos (`app/api/deps.py`): `require_productor` valida el **JWT** que
emite `POST /api/auth/google` (flujo Google Identity Services + `google-auth`) y
es obligatorio para **crear lotes** y ver `/api/lotes/mios`; `require_api_key`
queda solo para las escrituras internas sin usuario detrás (eventos, anclaje,
`POST /api/verify`). La `X-API-Key` es **pública** (va en el bundle JS), por eso
ya NO abre el registro de lotes. Las lecturas quedan abiertas para que el QR
funcione sin credenciales; si `API_KEY` está vacía, esos endpoints internos
quedan abiertos (desarrollo local).

El QR **no** tiene endpoint propio: la etiqueta se genera en el navegador con
`qrcode.react` en `/lote/[id]/etiqueta` (HU-04).

### Paridad del hash (crítico)

`app/services/sha256.py` y `frontend/lib/hash.ts` deben producir el MISMO
SHA-256. El payload canónico son **exactamente 8 campos** (`CAMPOS_LOTE`):
`codigo`, `fecha_cosecha`, `linea_productiva`, `cantidad`, `unidad`, `finca`,
`municipio`, `evidencias`. `fecha_postura`, `fotos` (URLs de R2), hashes y
transacción quedan FUERA a propósito.

`tests/test_sha256.py` fija vectores calculados con el código real del navegador;
si ese test falla, la verificación HU-03 se rompe en producción. **Cambiar un
lado obliga a recalcular los vectores con el otro.**

`tamano` en `evidencias` es el tamaño del data URL comprimido que envía el
cliente, no el del archivo original: es lo que viaja en el hash.

## Stellar (`app/services/stellar.py`)

Solo los 32 bytes del SHA-256 viajan on-chain, como **Memo Hash** de un pago de
1 XLM a la misma cuenta. `anchor_hash` paga Friendbot si la cuenta no existe y
reintenta 3 veces ante `tx_too_late`/`tx_bad_seq`. `verify_anchor` decodifica el
memo (Horizon lo devuelve en base64) y lo compara; captura `NotFoundError` y
`BadRequestError` como `StellarError`, nunca como 500.

El ancla **no bloquea la existencia del registro**: si Horizon falla, el lote
queda guardado con `stellar_tx_hash = None` y se reintenta con
`POST /api/lotes/{codigo}/anclar`. Ten en cuenta que la llamada a Horizon sí
sincroniza dentro del handler de `POST /api/lotes`.

## Frontend

Rutas: `/` (landing + buscador HU-05), `/login` (HU-06, botón Google Identity
Services + modo demo), `/productor/completar` (HU-07, 5 datos del primer
ingreso), `/productor` (HU-05 · HU-08), `/productor/nuevo`
(HU-01 · HU-08), `/productor/lote/[codigo]/eventos` (HU-05), `/lote/[id]`
(HU-02), `/lote/[id]/etiqueta` (HU-04).

`components/ProtegerProductor.tsx` envuelve las rutas `/productor/*`: sin token
válido (o con perfil incompleto, `exigirPerfil`) redirige a `/login` o
`/productor/completar`. Se resuelve en el **cliente** porque la sesión vive en
`localStorage` (`lib/auth.ts`) y un `middleware.ts` de Next no puede leerla.
`Nav.tsx` muestra "Iniciar sesión" o el avatar + "Salir" según la sesión.

`lib/api.ts` habla con el backend cuando `NEXT_PUBLIC_API_URL` está definida; si
no, o si el backend no responde, cae al **modo demo** (`lib/demoStore.ts`,
localStorage). Las lecturas silencian el fallo pero lo dejan marcado con
`modoDemoActivo()`, y las pantallas lo anuncian con `components/AvisoModoDemo`:
sin ese aviso, un backend caído se veía como datos reales. Las **escrituras NO**
tienen fallback demo: el error se muestra y no se crea ningún lote fantasma.

Un `404` del backend se trata como "el lote no existe" y NO busca en el
almacén local, para que un QR falso no parezca auténtico.

## Variables de entorno

`backend/.env` (gitignored; plantilla `backend/.env.example`): `STELLAR_NETWORK`,
`HORIZON_URL`, `STELLAR_PUBLIC_KEY`, `STELLAR_SECRET_KEY`, `FRONTEND_URL`
(CORS), `R2_*`, `API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`AUTH_SECRET` (secreto con el que se firman los JWT: `openssl rand -hex 32`;
vacío → el login responde 503), y `DATABASE_URL` **vacío** para que el desarrollo
local use SQLite. `backend/.env.neon` guarda la URL de producción (también
gitignored); ver la sección de base de datos.

`frontend/.env.local` (plantilla `frontend/.env.example`): `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
(mismo Client ID que el backend, pero solo la parte pública: el popup de Google
no lleva secreto; vacío → `/login` muestra el aviso de no configurado y ofrece
el modo demo).

**`NEXT_PUBLIC_API_URL` va SIN sufijo `/api`** (`http://localhost:8000`,
`https://agrotrace-backend.onrender.com`). `lib/api.ts` concatena rutas que ya
empiezan por `/api/`; un sufijo produce `/api/api/lotes` → 404 y el frontend
cae en modo demo sin avisar.

Todo lo prefijado con `NEXT_PUBLIC_` se embebido en el JavaScript servido al
navegador: `NEXT_PUBLIC_API_KEY` es **pública**, no un secreto.

## Despliegue

- **Backend → Render** (Web Service + Docker, `render.yaml`). NO Vercel: las
  funciones de Vercel se cortan a los 10 s y su filesystem es efímero.
  Servicio `agrotrace-backend-z3q1` (`srv-db9d6r67bikc73fjqe80`), región
  Oregon, plan free → `https://agrotrace-backend-z3q1.onrender.com`.
  Render despliega desde `main`; el CMD del Dockerfile migra antes de servir.
  `backend/.env.rendered` (gitignored) guarda el service id y el `API_KEY`
  generado en el panel.
- **Frontend → Vercel**, proyecto `frontend-2mx1`, Root Directory `frontend`.
  Variables de producción: `NEXT_PUBLIC_API_URL` (la de Render, **sin** sufijo
  `/api`) y `NEXT_PUBLIC_API_KEY`. Cambiarlas obliga a **redeploy**: Next
  las inlina en el bundle durante el build.
- El frontend llama al backend **directamente** con `NEXT_PUBLIC_API_URL` y el
  backend permite el origen con `FRONTEND_URL`. **No hay `vercel.json`**: Vercel
  no interpola variables de entorno dentro de ese fichero, así que un rewrite
  con `${BACKEND_URL}` nunca funcionó y solo duplicaba la URL en dos sitios.

## Convenciones

- Commits cortos y prefijados (`feat:`, `fix:`, `docs:`, `chore:`); hacer push
  **solo bajo petición explícita**.
- Documentación trilingüe (ES / EN / PT) siguiendo el patrón de
  `docs/semana2/KanbanBacklog.md`.
- Producto piloto: huevos de Finca Guarumo, Cáceres (Antioquia). Código de
  lote `HUE-YYYY-NNN`, secuencial por año.
- Las 8 historias viven en `docs/backlog/IssuesListos.md` (HU-01..HU-05) y en
  `docs/backlog/BacklogAuthGoogle.md` (HU-06..HU-08, trilingüe), y en
  GitHub Issues #1..#8.
