# 📋 Backlog: Infraestructura de producción — AgroTrace Rural

> **Feature:** Datos, almacenamiento y despliegue de producción (Neon Postgres · Cloudflare R2 · Render · robustez) · **Continúa:** HU-01..HU-08
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#9](https://github.com/alucart2005/AgroTraceRural/issues/9), [#10](https://github.com/alucart2005/AgroTraceRural/issues/10), [#11](https://github.com/alucart2005/AgroTraceRural/issues/11), [#12](https://github.com/alucart2005/AgroTraceRural/issues/12) y [#13](https://github.com/alucart2005/AgroTraceRural/issues/13) (formato `docs/backlog/IssuesListos.md`)

> ✅ **Estado (2026-11-10):** HU-09 a HU-13 **implementadas, desplegadas y verificadas en producción** (backend en Render + Neon Postgres, frontend en Vercel); las cinco historias figuran como `Done` en el [tablero del proyecto #14](https://github.com/users/alucart2005/projects/14) con `Priority=P0/P1` y `Size=M/M/S/S/M`, dentro del milestone **Entrega 2 — Producción y robustez** (2026-10-18).
> 🇺🇸 **Status (2026-11-10):** HU-09 through HU-13 are **implemented, deployed and verified in production** (backend on Render + Neon Postgres, frontend on Vercel); all five stories are tracked as `Done` on [project board #14](https://github.com/users/alucart2005/projects/14) with `Priority=P0/P1` and `Size=M/M/S/S/M`, under the **Entrega 2 — Producción y robustez** milestone (2026-10-18).
> 🇧🇷 **Status (2026-11-10):** HU-09 a HU-13 estão **implementadas, implantadas e verificadas em produção** (backend no Render + Neon Postgres, frontend na Vercel); as cinco histórias constam como `Done` no [quadro do projeto #14](https://github.com/users/alucart2005/projects/14) com `Priority=P0/P1` e `Size=M/M/S/S/M`, dentro do milestone **Entrega 2 — Producción y robustez** (2026-10-18).

> 🗺️ **Roadmap** · [Board #14](https://github.com/users/alucart2005/projects/14)
>
> | Entrega · Delivery · Entrega | Fecha · Date · Data | Historias · Stories · Histórias |
> |---|---|---|
> | 1 · MVP verificable | 2026-10-16 | HU-01..05 |
> | **2 · Producción y robustez ◀** | **2026-10-18** | **HU-09..13 (este backlog)** |
> | 3 · Autenticación con Google | 2026-10-30 | HU-06..08 |
> | 4 · Estabilidad del backend | 2026-11-08 | HU-14..15 |
> | 5 · Rediseño visual y ayuda | 2026-11-10 | HU-16..23 |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-09 Neon](#-hu-09-persistencia-de-producción-en-neon-postgres) · [HU-10 R2](#-hu-10-evidencias-fotográficas-en-cloudflare-r2) · [HU-11 Render](#-hu-11-despliegue-del-backend-en-render-con-migraciones-automáticas) · [HU-12 modo demo](#-hu-12-aviso-de-modo-demo-cuando-el-backend-no-responde) · [HU-13 hardening](#-hu-13-hardening-de-entradas-códigos-y-evidencias) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-09: Persistencia de producción en Neon Postgres

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Administrador del sistema · 🆕 **Nueva**

> **Como** administrador del sistema, **quiero** que los lotes y usuarios persistan en Neon Postgres, compartido por todas las instancias del backend, **para** que la producción no dependa del archivo de una sola máquina y sobreviva a reinicios y despliegues.

#### 🧪 Criterios de aceptación (HU-09) — Dado / Cuando / Entonces

- **Escenario 1: Esquema en producción.**
  - **Dado** que la base de Neon está vacía,
  - **Cuando** se ejecuta `alembic upgrade head` con la `DATABASE_URL` de `.env.neon`,
  - **Entonces** se crean las tablas `lotes`, `eventos`, `usuarios` y `alembic_version` con todas las columnas, incluida `lotes.usuario_id`.
- **Escenario 2: Desarrollo local aislado.**
  - **Dado** que `DATABASE_URL` está vacía en `backend/.env`,
  - **Cuando** arranca el backend en local,
  - **Entonces** usa SQLite (`agrotrace_local.db`) sin tocar Neon, y `asegurar_columnas_sqlite` añade a tablas viejas las columnas nuevas.
- **Escenario 3: URL de Neon aceptada.**
  - **Dado** que Neon entrega el endpoint pooler con esquema `postgres://`,
  - **Cuando** el backend lee la URL,
  - **Entonces** la normaliza y fuerza el driver psycopg v3.
- **Escenario 4: Migración de datos con revalidación.**
  - **Dado** que hay lotes en el SQLite local,
  - **Cuando** se ejecuta `python -m scripts.migrar_sqlite_a_neon`,
  - **Entonces** los lotes se copian a Neon y el script revalida el SHA-256 de cada uno antes de dar por buena la copia.
- **Escenario 5: El secreto fuera del repositorio.**
  - **Dado** que la URL de producción es un dato sensible,
  - **Cuando** se versiona el backend,
  - **Entonces** la URL vive en `.env.neon` (ignorado por git) y no en `.env`.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-10: Evidencias fotográficas en Cloudflare R2

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor, **quiero** que las fotos de evidencia suban a Cloudflare R2 y queden con URL pública estable, **para** que quien escanee el QR pueda verlas mucho después de la cosecha, sin depender de mi equipo.

#### 🧪 Criterios de aceptación (HU-10) — Dado / Cuando / Entonces

- **Escenario 1: Subida junto con el lote.**
  - **Dado** que adjunto fotos al registrar un lote,
  - **Cuando** guardo el formulario,
  - **Entonces** cada foto comprimida sube a R2 con una clave única y el lote guarda sus URLs públicas en el campo `fotos`.
- **Escenario 2: Las URLs quedan fuera del hash.**
  - **Dado** que las URLs de almacenamiento pueden cambiar,
  - **Cuando** se calcula el SHA-256 canónico del lote,
  - **Entonces** solo entran los 8 campos de `CAMPOS_LOTE` y `fotos` queda fuera, igual en backend y frontend.
- **Escenario 3: Error de almacenamiento visible.**
  - **Dado** que R2 rechaza la subida,
  - **Cuando** envío el formulario,
  - **Entonces** el error se muestra en pantalla y no queda ningún lote a medias.
- **Escenario 4: Tamaño honesto en el hash.**
  - **Dado** que el cliente comprime la foto antes de enviarla,
  - **Cuando** se registra `tamano` en `evidencias`,
  - **Entonces** es el tamaño del data URL comprimido que viaja — el mismo que entra al hash, no el del archivo original.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-11: Despliegue del backend en Render con migraciones automáticas

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Administrador del sistema · 🆕 **Nueva**

> **Como** administrador, **quiero** que cada push a `main` despliegue el backend en Render sin pasos manuales, **para** llegar a producción en minutos y sin riesgo de olvidar una migración.

#### 🧪 Criterios de aceptación (HU-11) — Dado / Cuando / Entonces

- **Escenario 1: Migrar antes de servir.**
  - **Dado** que Render construye el Dockerfile,
  - **Cuando** arranca el contenedor,
  - **Entonces** el CMD ejecuta `alembic upgrade head` antes de levantar uvicorn, así el esquema siempre llega al día.
- **Escenario 2: Blueprint del servicio.**
  - **Dado** que existe `render.yaml`,
  - **Cuando** se sincroniza con Render,
  - **Entonces** el servicio queda definido con región, plan y variables, reproducible desde el repositorio.
- **Escenario 3: CORS con el frontend.**
  - **Dado** que `FRONTEND_URL` está configurada en el panel,
  - **Cuando** el frontend de Vercel llama a la API,
  - **Entonces** el origen está permitido y la petición pasa.
- **Escenario 4: Plataforma adecuada.**
  - **Dado** que las funciones de Vercel se cortan a los 10 s y su filesystem es efímero,
  - **Cuando** se eligió dónde correr el backend,
  - **Entonces** quedó en Render y la decisión quedó documentada en `AGENTS.md`.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-12: Aviso de modo demo cuando el backend no responde

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Usuario final (visitante) · 🆕 **Nueva**

> **Como** visitante, **quiero** que la app me avise claramente cuando estoy viendo datos de demostración, **para** no confundir datos de prueba con lotes reales.

#### 🧪 Criterios de aceptación (HU-12) — Dado / Cuando / Entonces

- **Escenario 1: Lecturas con fallback avisado.**
  - **Dado** que el backend no responde,
  - **Cuando** abro una pantalla que lee lotes,
  - **Entonces** el frontend cae al almacén local y muestra el `AvisoModoDemo` en esa pantalla.
- **Escenario 2: Escrituras sin fallback.**
  - **Dado** que el modo demo está activo,
  - **Cuando** intento crear un lote,
  - **Entonces** el error se muestra y no se crea ningún lote fantasma en el almacén local.
- **Escenario 3: Un 404 no se reemplaza.**
  - **Dado** que el backend responde que el lote no existe,
  - **Cuando** consulto ese código,
  - **Entonces** no se busca en el almacén local, para que un QR falso no parezca auténtico.
- **Escenario 4: Silencio cuando todo va bien.**
  - **Dado** que el backend responde normalmente,
  - **Cuando** navego por el sitio,
  - **Entonces** no aparece ningún aviso de demo.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-13: Hardening de entradas, códigos y evidencias

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Desarrollador · 🆕 **Nueva**

> **Como** desarrollador, **quiero** validación estricta de las entradas del backend y del cliente, **para** que datos corruptos o malintencionados no rompan la trazabilidad.

#### 🧪 Criterios de aceptación (HU-13) — Dado / Cuando / Entonces

- **Escenario 1: Códigos sin colisión.**
  - **Dado** que dos lotes del mismo año quedarían con el mismo `HUE-YYYY-NNN`,
  - **Cuando** se genera el código,
  - **Entonces** el secuencial avanza hasta encontrar uno libre; nunca hay duplicados.
- **Escenario 2: Archivos rechazados en origen.**
  - **Dado** que el navegador no puede procesar un tipo de archivo,
  - **Cuando** lo selecciono como evidencia,
  - **Entonces** el frontend lo bloquea antes de enviarlo al backend.
- **Escenario 3: Limpieza de evidencias huérfanas.**
  - **Dado** que la creación de un lote falla a mitad de camino,
  - **Cuando** la transacción se revierte,
  - **Entonces** las evidencias ya subidas a R2 se limpian y no quedan huérfanas.
- **Escenario 4: Errores controlados, nunca 500.**
  - **Dado** que llega un payload inválido,
  - **Cuando** el backend lo procesa,
  - **Entonces** responde 4xx con detalle de validación, no un error interno.
- **Escenario 5: Stellar no rompe el registro.**
  - **Dado** que Horizon falla al anclar,
  - **Cuando** se guarda el lote,
  - **Entonces** queda con `stellar_tx_hash` en `None` y el ancla se reintenta con `POST /api/lotes/{codigo}/anclar`.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 Tareas técnicas (no son HU)

- [x] `app/db.py`: SQLite cuando `DATABASE_URL` está vacía, Postgres cuando no; `asegurar_columnas_sqlite()` en el lifespan.
- [x] Alembic `0001_initial` + `0002_usuarios` (con `batch_alter_table`); el CMD del Dockerfile migra antes de servir.
- [x] `app/services/r2.py` con `R2_*` en `core/config.py` y `.env.example`.
- [x] `render.yaml` (blueprint del servicio) y la decisión Render-vs-Vercel documentada en `AGENTS.md`.
- [x] `scripts/migrar_sqlite_a_neon.py` con revalidación de hashes; `.env.neon` ignorado por git.
- [x] `AvisoModoDemo` + `modoDemoActivo()` en el frontend; escrituras sin fallback y 404 sin búsqueda local.
- [x] Hardening: códigos secuenciales sin colisión, validación estricta, limpieza de evidencias y bloqueo de archivos no procesables.
- [x] Verificación: 68 tests con R2 y Stellar simulados, y `/api/health`, `/api/lotes` y `/api/verify` comprobados en producción.

[⬆ Volver al inicio](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-09 Neon](#-hu-09-production-persistence-on-neon-postgres) · [HU-10 R2](#-hu-10-photo-evidence-on-cloudflare-r2) · [HU-11 Render](#-hu-11-backend-deployment-on-render-with-automatic-migrations) · [HU-12 demo mode](#-hu-12-demo-mode-notice-when-the-backend-is-down) · [HU-13 hardening](#-hu-13-hardening-of-inputs-codes-and-evidence) · [Technical tasks](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-09: Production persistence on Neon Postgres

> 🔴 **Must Have** · 👤 **Role:** System administrator · 🆕 **New**

> **As a** system administrator, **I want** batches and users to persist on Neon Postgres, shared by every backend instance, **so that** production doesn't depend on one machine's file and survives restarts and deployments.

#### 🧪 Acceptance criteria (HU-09) — Given / When / Then

- **Scenario 1: Schema in production.**
  - **Given** an empty Neon database,
  - **When** `alembic upgrade head` runs with the `DATABASE_URL` from `.env.neon`,
  - **Then** the `lotes`, `eventos`, `usuarios` and `alembic_version` tables are created with every column, including `lotes.usuario_id`.
- **Scenario 2: Isolated local development.**
  - **Given** an empty `DATABASE_URL` in `backend/.env`,
  - **When** the backend starts locally,
  - **Then** it uses SQLite (`agrotrace_local.db`) without touching Neon, and `asegurar_columnas_sqlite` adds new columns to old tables.
- **Scenario 3: Neon URL accepted.**
  - **Given** Neon hands out the pooler endpoint with the `postgres://` scheme,
  - **When** the backend reads the URL,
  - **Then** it normalises it and forces the psycopg v3 driver.
- **Scenario 4: Data migration with revalidation.**
  - **Given** batches sitting in the local SQLite file,
  - **When** `python -m scripts.migrar_sqlite_a_neon` runs,
  - **Then** the batches are copied to Neon and the script revalidates each SHA-256 before accepting the copy.
- **Scenario 5: The secret stays out of the repository.**
  - **Given** the production URL is sensitive data,
  - **When** the backend is versioned,
  - **Then** the URL lives in `.env.neon` (gitignored) and not in `.env`.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-10: Photo evidence on Cloudflare R2

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want** my evidence photos uploaded to Cloudflare R2 with a stable public URL, **so that** whoever scans the QR can see them long after the harvest, without depending on my device.

#### 🧪 Acceptance criteria (HU-10) — Given / When / Then

- **Scenario 1: Upload along with the batch.**
  - **Given** I attach photos when registering a batch,
  - **When** I save the form,
  - **Then** each compressed photo is uploaded to R2 with a unique key and the batch keeps its public URLs in the `fotos` field.
- **Scenario 2: URLs stay out of the hash.**
  - **Given** storage URLs may change,
  - **When** the batch's canonical SHA-256 is computed,
  - **Then** only the 8 `CAMPOS_LOTE` fields go in and `fotos` stays out, identically on backend and frontend.
- **Scenario 3: Storage errors are visible.**
  - **Given** R2 rejects the upload,
  - **When** I submit the form,
  - **Then** the error is shown on screen and no half-created batch is left behind.
- **Scenario 4: An honest size in the hash.**
  - **Given** the client compresses the photo before sending,
  - **When** `tamano` is recorded in `evidencias`,
  - **Then** it is the size of the compressed data URL that travels — the same one that enters the hash, not the original file's.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-11: Backend deployment on Render with automatic migrations

> 🟠 **Should Have** · 👤 **Role:** System administrator · 🆕 **New**

> **As an** administrator, **I want** every push to `main` to deploy the backend on Render with no manual steps, **so that** we reach production in minutes with no risk of forgetting a migration.

#### 🧪 Acceptance criteria (HU-11) — Given / When / Then

- **Scenario 1: Migrate before serving.**
  - **Given** Render builds the Dockerfile,
  - **When** the container starts,
  - **Then** the CMD runs `alembic upgrade head` before starting uvicorn, so the schema is always up to date.
- **Scenario 2: Service blueprint.**
  - **Given** `render.yaml` exists,
  - **When** it syncs with Render,
  - **Then** the service is defined with region, plan and variables, reproducible from the repository.
- **Scenario 3: CORS with the frontend.**
  - **Given** `FRONTEND_URL` is set in the dashboard,
  - **When** the Vercel frontend calls the API,
  - **Then** the origin is allowed and the request goes through.
- **Scenario 4: The right platform.**
  - **Given** Vercel functions time out at 10 s and their filesystem is ephemeral,
  - **When** the backend's platform was chosen,
  - **Then** it stayed on Render and the decision is documented in `AGENTS.md`.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-12: Demo-mode notice when the backend is down

> 🟠 **Should Have** · 👤 **Role:** End user (visitor) · 🆕 **New**

> **As a** visitor, **I want** the app to tell me clearly when I'm looking at demonstration data, **so that** I never mistake test data for real batches.

#### 🧪 Acceptance criteria (HU-12) — Given / When / Then

- **Scenario 1: Reads fall back, with a notice.**
  - **Given** the backend is unreachable,
  - **When** I open a screen that reads batches,
  - **Then** the frontend falls back to the local store and shows the `AvisoModoDemo` on that screen.
- **Scenario 2: Writes never fall back.**
  - **Given** demo mode is active,
  - **When** I try to create a batch,
  - **Then** the error is shown and no ghost batch is created in the local store.
- **Scenario 3: A 404 is not replaced.**
  - **Given** the backend answers that the batch doesn't exist,
  - **When** I look up that code,
  - **Then** the local store is not consulted, so a fake QR never looks authentic.
- **Scenario 4: Silence when all is well.**
  - **Given** the backend responds normally,
  - **When** I browse the site,
  - **Then** no demo notice appears at all.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-13: Hardening of inputs, codes and evidence

> 🟠 **Should Have** · 👤 **Role:** Developer · 🆕 **New**

> **As a** developer, **I want** strict validation of backend and client inputs, **so that** corrupt or malicious data never breaks traceability.

#### 🧪 Acceptance criteria (HU-13) — Given / When / Then

- **Scenario 1: Codes without collisions.**
  - **Given** two batches in the same year would land on the same `HUE-YYYY-NNN`,
  - **When** the code is generated,
  - **Then** the sequence advances until a free one is found; there are never duplicates.
- **Scenario 2: Files rejected at the source.**
  - **Given** the browser cannot process a file type,
  - **When** I pick it as evidence,
  - **Then** the frontend blocks it before sending it to the backend.
- **Scenario 3: Orphan evidence cleanup.**
  - **Given** batch creation fails midway,
  - **When** the transaction rolls back,
  - **Then** evidence already uploaded to R2 is cleaned up and nothing is orphaned.
- **Scenario 4: Controlled errors, never a 500.**
  - **Given** an invalid payload arrives,
  - **When** the backend processes it,
  - **Then** it answers 4xx with validation detail, not an internal error.
- **Scenario 5: Stellar never breaks the record.**
  - **Given** Horizon fails while anchoring,
  - **When** the batch is saved,
  - **Then** it keeps `stellar_tx_hash` as `None` and the anchor is retried with `POST /api/lotes/{codigo}/anclar`.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 Technical tasks (not user stories)

- [x] `app/db.py`: SQLite when `DATABASE_URL` is empty, Postgres otherwise; `asegurar_columnas_sqlite()` in the lifespan.
- [x] Alembic `0001_initial` + `0002_usuarios` (with `batch_alter_table`); the Dockerfile CMD migrates before serving.
- [x] `app/services/r2.py` with `R2_*` in `core/config.py` and `.env.example`.
- [x] `render.yaml` (service blueprint) and the Render-vs-Vercel decision documented in `AGENTS.md`.
- [x] `scripts/migrar_sqlite_a_neon.py` with hash revalidation; `.env.neon` gitignored.
- [x] `AvisoModoDemo` + `modoDemoActivo()` in the frontend; writes without fallback and 404 without local lookup.
- [x] Hardening: collision-free sequential codes, strict validation, evidence cleanup and blocking of unprocessable files.
- [x] Verification: 68 tests with R2 and Stellar mocked, plus `/api/health`, `/api/lotes` and `/api/verify` checked in production.

[⬆ Back to top](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-09 Neon](#-hu-09-persistência-de-produção-no-neon-postgres) · [HU-10 R2](#-hu-10-evidências-fotográficas-no-cloudflare-r2) · [HU-11 Render](#-hu-11-implantação-do-backend-no-render-com-migrações-automáticas) · [HU-12 modo demo](#-hu-12-aviso-de-modo-demo-quando-o-backend-não-responde) · [HU-13 robustez](#-hu-13-robustez-de-entradas-códigos-e-evidências) · [Tarefas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-09: Persistência de produção no Neon Postgres

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Administrador do sistema · 🆕 **Nova**

> **Como** administrador do sistema, **quero** que os lotes e usuários persistam no Neon Postgres, compartilhado por todas as instâncias do backend, **para que** a produção não dependa do arquivo de uma única máquina e sobreviva a reinícios e implantações.

#### 🧪 Critérios de aceitação (HU-09) — Dado / Quando / Então

- **Cenário 1: Esquema em produção.**
  - **Dado** que o banco Neon está vazio,
  - **Quando** `alembic upgrade head` é executado com a `DATABASE_URL` de `.env.neon`,
  - **Então** as tabelas `lotes`, `eventos`, `usuarios` e `alembic_version` são criadas com todas as colunas, incluindo `lotes.usuario_id`.
- **Cenário 2: Desenvolvimento local isolado.**
  - **Dado** que `DATABASE_URL` está vazia em `backend/.env`,
  - **Quando** o backend inicia localmente,
  - **Então** usa SQLite (`agrotrace_local.db`) sem tocar no Neon, e `asegurar_columnas_sqlite` acrescenta às tabelas antigas as colunas novas.
- **Cenário 3: URL do Neon aceita.**
  - **Dado** que o Neon entrega o endpoint do pooler com esquema `postgres://`,
  - **Quando** o backend lê a URL,
  - **Então** ela é normalizada e o driver psycopg v3 é forçado.
- **Cenário 4: Migração de dados com revalidação.**
  - **Dado** que há lotes no SQLite local,
  - **Quando** `python -m scripts.migrar_sqlite_a_neon` é executado,
  - **Então** os lotes são copiados para o Neon e o script revalida o SHA-256 de cada um antes de aceitar a cópia.
- **Cenário 5: O segredo fica fora do repositório.**
  - **Dado** que a URL de produção é um dado sensível,
  - **Quando** o backend é versionado,
  - **Então** a URL vive em `.env.neon` (ignorado pelo git) e não em `.env`.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-10: Evidências fotográficas no Cloudflare R2

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor, **quero** que as fotos de evidência subam para o Cloudflare R2 e fiquem com URL pública estável, **para que** quem escanear o QR possa vê-las muito depois da colheita, sem depender do meu aparelho.

#### 🧪 Critérios de aceitação (HU-10) — Dado / Quando / Então

- **Cenário 1: Envio junto com o lote.**
  - **Dado** que anexo fotos ao registrar um lote,
  - **Quando** salvo o formulário,
  - **Então** cada foto comprimida sobe para o R2 com uma chave única e o lote guarda suas URLs públicas no campo `fotos`.
- **Cenário 2: As URLs ficam fora do hash.**
  - **Dado** que as URLs de armazenamento podem mudar,
  - **Quando** o SHA-256 canônico do lote é calculado,
  - **Então** só entram os 8 campos de `CAMPOS_LOTE` e `fotos` fica fora, igual no backend e no frontend.
- **Cenário 3: Erro de armazenamento visível.**
  - **Dado** que o R2 rejeita o envio,
  - **Quando** envio o formulário,
  - **Então** o erro aparece na tela e não sobra nenhum lote pela metade.
- **Cenário 4: Tamanho honesto no hash.**
  - **Dado** que o cliente comprime a foto antes de enviar,
  - **Quando** `tamano` é registrado em `evidencias`,
  - **Então** é o tamanho do data URL comprimido que viaja — o mesmo que entra no hash, não o do arquivo original.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-11: Implantação do backend no Render com migrações automáticas

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Administrador do sistema · 🆕 **Nova**

> **Como** administrador, **quero** que cada push para `main` implante o backend no Render sem passos manuais, **para que** cheguemos à produção em minutos e sem o risco de esquecer uma migração.

#### 🧪 Critérios de aceitação (HU-11) — Dado / Quando / Então

- **Cenário 1: Migrar antes de servir.**
  - **Dado** que o Render constrói o Dockerfile,
  - **Quando** o contêiner inicia,
  - **Então** o CMD executa `alembic upgrade head` antes de levantar o uvicorn, assim o esquema sempre chega em dia.
- **Cenário 2: Blueprint do serviço.**
  - **Dado** que existe o `render.yaml`,
  - **Quando** ele é sincronizado com o Render,
  - **Então** o serviço fica definido com região, plano e variáveis, reprodutível a partir do repositório.
- **Cenário 3: CORS com o frontend.**
  - **Dado** que `FRONTEND_URL` está configurada no painel,
  - **Quando** o frontend da Vercel chama a API,
  - **Então** a origem está permitida e a requisição passa.
- **Cenário 4: A plataforma certa.**
  - **Dado** que as funções da Vercel cortam aos 10 s e o filesystem delas é efêmero,
  - **Quando** foi escolhido onde rodar o backend,
  - **Então** ficou no Render e a decisão está documentada no `AGENTS.md`.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-12: Aviso de modo demo quando o backend não responde

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Usuário final (visitante) · 🆕 **Nova**

> **Como** visitante, **quero** que o aplicativo me avise claramente quando estou vendo dados de demonstração, **para que** não confunda dados de teste com lotes reais.

#### 🧪 Critérios de aceitação (HU-12) — Dado / Quando / Então

- **Cenário 1: Leituras com fallback avisado.**
  - **Dado** que o backend não responde,
  - **Quando** abro uma tela que lê lotes,
  - **Então** o frontend recai no armazém local e mostra o `AvisoModoDemo` nessa tela.
- **Cenário 2: Escritas sem fallback.**
  - **Dado** que o modo demo está ativo,
  - **Quando** tento criar um lote,
  - **Então** o erro é mostrado e nenhum lote fantasma é criado no armazém local.
- **Cenário 3: Um 404 não é substituído.**
  - **Dado** que o backend responde que o lote não existe,
  - **Quando** consulto esse código,
  - **Então** não se busca no armazém local, para que um QR falso não pareça autêntico.
- **Cenário 4: Silêncio quando tudo vai bem.**
  - **Dado** que o backend responde normalmente,
  - **Quando** navego pelo site,
  - **Então** não aparece nenhum aviso de demo.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 HU-13: Robustez de entradas, códigos e evidências

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Desenvolvedor · 🆕 **Nova**

> **Como** desenvolvedor, **quero** validação estrita das entradas do backend e do cliente, **para que** dados corrompidos ou mal-intencionados não quebrem a rastreabilidade.

#### 🧪 Critérios de aceitação (HU-13) — Dado / Quando / Então

- **Cenário 1: Códigos sem colisão.**
  - **Dado** que dois lotes do mesmo ano ficariam com o mesmo `HUE-YYYY-NNN`,
  - **Quando** o código é gerado,
  - **Então** o sequencial avança até achar um livre; nunca há duplicados.
- **Cenário 2: Arquivos rejeitados na origem.**
  - **Dado** que o navegador não consegue processar um tipo de arquivo,
  - **Quando** eu o seleciono como evidência,
  - **Então** o frontend o bloqueia antes de enviar ao backend.
- **Cenário 3: Limpeza de evidências órfãs.**
  - **Dado** que a criação de um lote falha no meio do caminho,
  - **Quando** a transação é revertida,
  - **Então** as evidências já enviadas ao R2 são limpas e nada fica órfão.
- **Cenário 4: Erros controlados, nunca 500.**
  - **Dado** que chega um payload inválido,
  - **Quando** o backend o processa,
  - **Então** responde 4xx com detalhe de validação, não um erro interno.
- **Cenário 5: O Stellar não quebra o registro.**
  - **Dado** que o Horizon falha ao ancorar,
  - **Quando** o lote é salvo,
  - **Então** fica com `stellar_tx_hash` em `None` e a âncora é repetida com `POST /api/lotes/{codigo}/anclar`.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)

---

### 📌 Tarefas técnicas (não são HU)

- [x] `app/db.py`: SQLite quando `DATABASE_URL` está vazia, Postgres caso contrário; `asegurar_columnas_sqlite()` no lifespan.
- [x] Alembic `0001_initial` + `0002_usuarios` (com `batch_alter_table`); o CMD do Dockerfile migra antes de servir.
- [x] `app/services/r2.py` com `R2_*` em `core/config.py` e `.env.example`.
- [x] `render.yaml` (blueprint do serviço) e a decisão Render-vs-Vercel documentada no `AGENTS.md`.
- [x] `scripts/migrar_sqlite_a_neon.py` com revalidação de hashes; `.env.neon` ignorado pelo git.
- [x] `AvisoModoDemo` + `modoDemoActivo()` no frontend; escritas sem fallback e 404 sem busca local.
- [x] Robustez: códigos sequenciais sem colisão, validação estrita, limpeza de evidências e bloqueio de arquivos não processáveis.
- [x] Verificação: 68 testes com R2 e Stellar simulados, mais `/api/health`, `/api/lotes` e `/api/verify` conferidos em produção.

[⬆ Voltar ao início](#-backlog-infraestructura-de-producción--agrotrace-rural)
