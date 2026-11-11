# 📋 Backlog: Estabilidad del backend — AgroTrace Rural

> **Feature:** Dependencias y compatibilidad (httpx2 · Pydantic v2 · FedCM) · **Ciclo:** `Version-0.02` (0.2.0) · **Continúa:** HU-06..HU-08
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#14](https://github.com/alucart2005/AgroTraceRural/issues/14) y [#15](https://github.com/alucart2005/AgroTraceRural/issues/15) (formato `docs/backlog/IssuesListos.md`)

> ✅ **Estado (2026-11-10):** HU-14 y HU-15 **implementadas, desplegadas y verificadas** (68 tests en verde, aviso COOP eliminado en producción); ambas figuran como `Done` en el [tablero del proyecto #14](https://github.com/users/alucart2005/projects/14) con `Priority=P2` y `Size=S/XS`, dentro del milestone **Entrega 4 — Estabilidad del backend** (2026-11-08).
> 🇺🇸 **Status (2026-11-10):** HU-14 and HU-15 are **implemented, deployed and verified** (68 tests green, COOP notice gone in production); both stories are tracked as `Done` on [project board #14](https://github.com/users/alucart2005/projects/14) with `Priority=P2` and `Size=S/XS`, under the **Entrega 4 — Estabilidad del backend** milestone (2026-11-08).
> 🇧🇷 **Status (2026-11-10):** HU-14 e HU-15 estão **implementadas, implantadas e verificadas** (68 testes verdes, aviso COOP eliminado em produção); as duas histórias constam como `Done` no [quadro do projeto #14](https://github.com/users/alucart2005/projects/14) com `Priority=P2` e `Size=S/XS`, dentro do milestone **Entrega 4 — Estabilidad del backend** (2026-11-08).

> 🗺️ **Roadmap** · [Board #14](https://github.com/users/alucart2005/projects/14)
>
> | Entrega · Delivery · Entrega | Fecha · Date · Data | Historias · Stories · Histórias |
> |---|---|---|
> | 1 · MVP verificable | 2026-10-16 | HU-01..05 |
> | 2 · Producción y robustez | 2026-10-18 | HU-09..13 |
> | 3 · Autenticación con Google | 2026-10-30 | HU-06..08 |
> | **4 · Estabilidad del backend ◀** | **2026-11-08** | **HU-14..15 (este backlog)** |
> | 5 · Rediseño visual y ayuda | 2026-11-10 | HU-16..23 |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-14 httpx2 y Pydantic v2](#-hu-14-migración-a-httpx2-y-pydantic-v2) · [HU-15 FedCM](#-hu-15-botón-de-google-con-fedcm) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-14: Migración a httpx2 y Pydantic v2

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Desarrollador · 🆕 **Nueva**

> **Como** desarrollador, **quiero** las dependencias del backend al día: httpx2 para el test client de Starlette 1.7 y `SettingsConfigDict` de Pydantic v2, **para** que los 68 tests corran limpios y ninguna API eliminada rompa el anclaje en producción.

#### 🧪 Criterios de aceptación (HU-14) — Dado / Cuando / Entonces

- **Escenario 1: Test client compatible.**
  - **Dado** que Starlette sube a 1.7,
  - **Cuando** corro `.venv/bin/python -m pytest -q`,
  - **Entonces** los 68 tests pasan usando el cliente de httpx2, con R2 y Stellar simulados.
- **Escenario 2: Configuración moderna.**
  - **Dado** que la clase `Settings` usaba la `Config` de Pydantic v1, deprecada,
  - **Cuando** se define la configuración,
  - **Entonces** usa `SettingsConfigDict` y no vuelve a emitir el aviso de deprecación.
- **Escenario 3: Horizon sigue igual.**
  - **Dado** que el backend llama a Horizon para anclar y verificar,
  - **Cuando** usa httpx2,
  - **Entonces** los timeouts, reintentos y el mapeo a `StellarError` se comportan igual que antes.
- **Escenario 4: Dependencia fijada.**
  - **Dado** que el despliegue debe ser reproducible,
  - **Cuando** se instala el backend en Render,
  - **Entonces** httpx2 queda fijado en `requirements.txt` y el build no depende de una versión que cambie sola.

[⬆ Volver al inicio](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 HU-15: Botón de Google con FedCM

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor, **quiero** que el botón de Google use FedCM (Federated Credential Management), **para** que el navegador no muestre el aviso de terceros y el ingreso abra limpio.

#### 🧪 Criterios de aceptación (HU-15) — Dado / Cuando / Entonces

- **Escenario 1: Sin aviso COOP.**
  - **Dado** que el botón de Google Identity Services tiene FedCM activo,
  - **Cuando** pulso «Continuar con Google» en `/login`,
  - **Entonces** el popup abre sin el aviso de cross-origin opener policy.
- **Escenario 2: El flujo de sesión no cambia.**
  - **Dado** que el popup entrega el ID token como siempre,
  - **Cuando** el backend lo verifica,
  - **Entonces** la sesión se crea exactamente igual que en HU-06, sin tocar la lógica de autenticación.

[⬆ Volver al inicio](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 Tareas técnicas (no son HU)

- [x] `httpx2` añadido a `requirements.txt` y test client de los 68 tests migrado.
- [x] `SettingsConfigDict` en `core/config.py` en lugar de la clase `Config` deprecada.
- [x] FedCM activado en el botón de Google Identity Services de `/login`.
- [x] Verificación: `pytest -q` en verde, `npm run lint` + `npm run build`, y popup comprobado en producción sin el aviso COOP.

[⬆ Volver al inicio](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-14 httpx2 and Pydantic v2](#-hu-14-migration-to-httpx2-and-pydantic-v2) · [HU-15 FedCM](#-hu-15-google-button-with-fedcm) · [Technical tasks](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-14: Migration to httpx2 and Pydantic v2

> 🟢 **Could Have** · 👤 **Role:** Developer · 🆕 **New**

> **As a** developer, **I want** the backend dependencies up to date: httpx2 for the Starlette 1.7 test client and Pydantic v2's `SettingsConfigDict`, **so that** the 68 tests run clean and no removed API breaks anchoring in production.

#### 🧪 Acceptance criteria (HU-14) — Given / When / Then

- **Scenario 1: A compatible test client.**
  - **Given** Starlette moves to 1.7,
  - **When** I run `.venv/bin/python -m pytest -q`,
  - **Then** the 68 tests pass using the httpx2 client, with R2 and Stellar mocked.
- **Scenario 2: Modern configuration.**
  - **Given** the `Settings` class used Pydantic v1's deprecated `Config`,
  - **When** the configuration is defined,
  - **Then** it uses `SettingsConfigDict` and the deprecation warning is gone.
- **Scenario 3: Horizon unchanged.**
  - **Given** the backend calls Horizon to anchor and verify,
  - **When** it uses httpx2,
  - **Then** timeouts, retries and the `StellarError` mapping behave exactly as before.
- **Scenario 4: Pinned dependency.**
  - **Given** deployments must be reproducible,
  - **When** the backend installs on Render,
  - **Then** httpx2 is pinned in `requirements.txt` and the build doesn't depend on a version that shifts on its own.

[⬆ Back to top](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 HU-15: Google button with FedCM

> 🟢 **Could Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want** the Google button to use FedCM (Federated Credential Management), **so that** the browser shows no third-party notice and sign-in opens cleanly.

#### 🧪 Acceptance criteria (HU-15) — Given / When / Then

- **Scenario 1: No COOP notice.**
  - **Given** the Google Identity Services button has FedCM enabled,
  - **When** I press “Continue with Google” on `/login`,
  - **Then** the popup opens without the cross-origin opener policy notice.
- **Scenario 2: The session flow doesn't change.**
  - **Given** the popup hands over the ID token as always,
  - **When** the backend verifies it,
  - **Then** the session is created exactly as in HU-06, with no change to the authentication logic.

[⬆ Back to top](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 Technical tasks (not user stories)

- [x] `httpx2` added to `requirements.txt` and the test client of the 68 tests migrated.
- [x] `SettingsConfigDict` in `core/config.py` replacing the deprecated `Config` class.
- [x] FedCM enabled on the Google Identity Services button in `/login`.
- [x] Verification: `pytest -q` green, `npm run lint` + `npm run build`, and the popup checked in production without the COOP notice.

[⬆ Back to top](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-14 httpx2 e Pydantic v2](#-hu-14-migração-para-httpx2-e-pydantic-v2) · [HU-15 FedCM](#-hu-15-botão-do-google-com-fedcm) · [Tarefas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-14: Migração para httpx2 e Pydantic v2

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Desenvolvedor · 🆕 **Nova**

> **Como** desenvolvedor, **quero** as dependências do backend em dia: httpx2 para o test client do Starlette 1.7 e o `SettingsConfigDict` do Pydantic v2, **para que** os 68 testes rodem limpos e nenhuma API removida quebre a ancoragem em produção.

#### 🧪 Critérios de aceitação (HU-14) — Dado / Quando / Então

- **Cenário 1: Test client compatível.**
  - **Dado** que o Starlette sobe para 1.7,
  - **Quando** executo `.venv/bin/python -m pytest -q`,
  - **Então** os 68 testes passam usando o client do httpx2, com R2 e Stellar simulados.
- **Cenário 2: Configuração moderna.**
  - **Dado** que a classe `Settings` usava o `Config` do Pydantic v1, deprecado,
  - **Quando** a configuração é definida,
  - **Então** usa `SettingsConfigDict` e volta a emitir o aviso de deprecação.
- **Cenário 3: O Horizon segue igual.**
  - **Dado** que o backend chama o Horizon para ancorar e verificar,
  - **Quando** usa httpx2,
  - **Então** os timeouts, as repetições e o mapeamento para `StellarError` se comportam como antes.
- **Cenário 4: Dependência fixada.**
  - **Dado** que a implantação deve ser reprodutível,
  - **Quando** o backend é instalado no Render,
  - **Então** o httpx2 fica fixado no `requirements.txt` e o build não depende de uma versão que mude sozinha.

[⬆ Voltar ao início](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 HU-15: Botão do Google com FedCM

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor, **quero** que o botão do Google use FedCM (Federated Credential Management), **para que** o navegador não mostre o aviso de terceiros e o ingresso abra limpo.

#### 🧪 Critérios de aceitação (HU-15) — Dado / Quando / Então

- **Cenário 1: Sem aviso COOP.**
  - **Dado** que o botão do Google Identity Services tem o FedCM ativo,
  - **Quando** pressiono «Continuar com Google» em `/login`,
  - **Então** o popup abre sem o aviso de cross-origin opener policy.
- **Cenário 2: O fluxo de sessão não muda.**
  - **Dado** que o popup entrega o ID token como sempre,
  - **Quando** o backend o verifica,
  - **Então** a sessão é criada exatamente como na HU-06, sem tocar na lógica de autenticação.

[⬆ Voltar ao início](#-backlog-estabilidad-del-backend--agrotrace-rural)

---

### 📌 Tarefas técnicas (não são HU)

- [x] `httpx2` acrescentado ao `requirements.txt` e o test client dos 68 testes migrado.
- [x] `SettingsConfigDict` em `core/config.py` no lugar da classe `Config` deprecada.
- [x] FedCM ativado no botão do Google Identity Services de `/login`.
- [x] Verificação: `pytest -q` verde, `npm run lint` + `npm run build`, e popup conferido em produção sem o aviso COOP.

[⬆ Voltar ao início](#-backlog-estabilidad-del-backend--agrotrace-rural)
