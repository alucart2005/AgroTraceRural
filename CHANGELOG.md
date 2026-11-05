# 📌 Changelog — AgroTrace Rural

> Historial de versiones por rama (`Version-0.01`, `Version-0.02`) · Formato de commits: `feat:`, `fix:`, `docs:`, `chore:`

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

### Versión 0.02 — 2026-11-05 · rama `Version-0.02`

Mantenimiento y sincronización de la plataforma.

- **`fix(backend)`** Se reemplaza la clase interna `Config` de Pydantic por `SettingsConfigDict` en `app/core/config.py`: desaparece el aviso `PydanticDeprecatedSince20` en cada arranque.
- **`chore(deps)`** Se añade `httpx2` a `requirements.txt` para el `TestClient` de Starlette 1.7 (el uso de `httpx` quedó deprecado). La suite pasa de **71 tests con 2 avisos a 71 tests sin avisos**.
- **`chore(db)`** La SQLite local de desarrollo se realinea con las migraciones: sello `alembic_version` en `0002_usuarios` y reconstrucción de `lotes` (índice `ix_lotes_usuario_id` + FK `SET NULL`, creados por `asegurar_columnas_sqlite` sin quedar registrados). Los 8 lotes locales se conservan y `alembic check` queda en verde.
- **`chore(github)`** Los issues **#1..#8 (HU-01..HU-08)** se cierran con `completed`, alineados con el `Status=Done` del tablero del proyecto #14.
- **`docs`** Se publica este changelog.

### Versión 0.01 — 2026-10-30 · rama `Version-0.01`

Primera entrega documental cerrada.

- **`docs`** El enlace del video demo en `README.md` se actualiza a `https://www.youtube.com/watch?v=stVQCivrmCg`.
- **`docs`** `docs/semana1/ProblemBrief.md` se renombra de «Agro Cassis» a «AgroTrace Rural» y se añade su PDF.

### Base `main` — HU-01..HU-08 entregadas (2026-10-30, `aec1a36`)

- **`feat(auth)`** Ingreso de productores con Google, datos del primer ingreso y registro de lotes con sesión (HU-06, HU-07, HU-08), con JWT y verificación del ID token.
- **`fix(auth)`** Endurecimiento del registro: espacios en blanco rechazados y carrera de `google_sub` respondida con 409.
- **`docs(backlog)`** Backlog de autenticación con 51 tareas cerradas y tablero #14 con las 8 historias en `Done`.

---

## 🇺🇸 English

### Version 0.02 — 2026-11-05 · branch `Version-0.02`

Platform maintenance and synchronization.

- **`fix(backend)`** Pydantic's inner `Config` class replaced with `SettingsConfigDict` in `app/core/config.py`, removing the `PydanticDeprecatedSince20` warning on every startup.
- **`chore(deps)`** `httpx2` added to `requirements.txt` for Starlette 1.7's `TestClient` (`httpx` is deprecated there). The suite goes from **71 tests with 2 warnings to 71 tests with none**.
- **`chore(db)`** The local development SQLite is realigned with the migrations: `alembic_version` stamped at `0002_usuarios` and `lotes` rebuilt (index `ix_lotes_usuario_id` + `SET NULL` FK, previously added by `asegurar_columnas_sqlite` without being recorded). The 8 local batches are preserved and `alembic check` passes.
- **`chore(github)`** Issues **#1..#8 (HU-01..HU-08)** closed as `completed`, matching the `Status=Done` on project board #14.
- **`docs`** This changelog published.

### Version 0.01 — 2026-10-30 · branch `Version-0.01`

First closed documentation delivery.

- **`docs`** Demo video link in `README.md` updated to `https://www.youtube.com/watch?v=stVQCivrmCg`.
- **`docs`** `docs/semana1/ProblemBrief.md` renamed from «Agro Cassis» to «AgroTrace Rural», with its PDF added.

### `main` baseline — HU-01..HU-08 delivered (2026-10-30, `aec1a36`)

- **`feat(auth)`** Farmer Google sign-in, first-login data capture and authenticated batch registration (HU-06, HU-07, HU-08) with JWT and ID-token verification.
- **`fix(auth)`** Registration hardening: whitespace-only fields rejected and `google_sub` races answered with 409.
- **`docs(backlog)`** Auth backlog with 51 tasks closed and board #14 showing all 8 stories as `Done`.

---

## 🇧🇷 Português

### Versão 0.02 — 2026-11-05 · branch `Version-0.02`

Manutenção e sincronização da plataforma.

- **`fix(backend)`** A classe interna `Config` do Pydantic foi substituída por `SettingsConfigDict` em `app/core/config.py`, eliminando o aviso `PydanticDeprecatedSince20` em cada inicialização.
- **`chore(deps)`** `httpx2` adicionado ao `requirements.txt` para o `TestClient` do Starlette 1.7 (o uso de `httpx` ficou deprecado). A suíte passou de **71 testes com 2 avisos para 71 testes sem avisos**.
- **`chore(db)`** O SQLite local de desenvolvimento foi realinhado com as migrações: `alembic_version` carimbado em `0002_usuarios` e `lotes` reconstruída (índice `ix_lotes_usuario_id` + FK `SET NULL`, antes criados por `asegurar_columnas_sqlite` sem registro). Os 8 lotes locais foram preservados e `alembic check` ficou verde.
- **`chore(github)`** Issues **#1..#8 (HU-01..HU-08)** fechados como `completed`, alinhados com o `Status=Done` no quadro do projeto #14.
- **`docs`** Este changelog publicado.

### Versão 0.01 — 2026-10-30 · branch `Version-0.01`

Primeira entrega documental encerrada.

- **`docs`** O link do vídeo demo no `README.md` foi atualizado para `https://www.youtube.com/watch?v=stVQCivrmCg`.
- **`docs`** `docs/semana1/ProblemBrief.md` renomeado de «Agro Cassis» para «AgroTrace Rural», com o seu PDF adicionado.

### Base `main` — HU-01..HU-08 entregues (2026-10-30, `aec1a36`)

- **`feat(auth)`** Entrada de produtores com Google, dados do primeiro acesso e registro de lotes com sessão (HU-06, HU-07, HU-08), com JWT e verificação do ID token.
- **`fix(auth)`** Endurecimento do registro: campos só com espaços rejeitados e corrida de `google_sub` respondida com 409.
- **`docs(backlog)`** Backlog de autenticação com 51 tarefas encerradas e quadro #14 com as 8 histórias em `Done`.
