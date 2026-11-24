# 📋 Backlog: Fiabilidad del anclaje — AgroTrace Rural

> **Feature:** Anclaje asíncrono, estado persistido y reintento automático · **Ciclo:** `Version-0.03` (0.3.0) · **Continúa:** HU-16..HU-23
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#24](https://github.com/alucart2005/AgroTraceRural/issues/24), [#25](https://github.com/alucart2005/AgroTraceRural/issues/25) y [#26](https://github.com/alucart2005/AgroTraceRural/issues/26) (formato `docs/backlog/IssuesListos.md`)

> 🗺️ **Roadmap** · [Board #14](https://github.com/users/alucart2005/projects/14)
>
> | Entrega · Delivery · Entrega | Fecha · Date · Data | Historias · Stories · Histórias |
> |---|---|---|
> | 1 · MVP verificable | 2026-10-16 | HU-01..05 |
> | 2 · Producción y robustez | 2026-10-18 | HU-09..13 |
> | 3 · Autenticación con Google | 2026-10-30 | HU-06..08 |
> | 4 · Estabilidad del backend | 2026-11-08 | HU-14..15 |
> | 5 · Rediseño visual y ayuda | 2026-11-10 | HU-16..23 |
> | **6 · Fiabilidad del anclaje ◀** | **2026-11-28** | **HU-24..26 (este backlog)** |
> | 7 · Integridad de la cadena de custodia | 2026-12-11 | HU-27..28 |
> | 8 · Lectura pública protegida | 2026-12-23 | HU-29..31 |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-24 anclaje asíncrono](#-hu-24-anclaje-del-hash-fuera-del-request) · [HU-25 reintento automático](#-hu-25-estado-de-anclaje-y-reintento-automático) · [HU-26 estado visible](#-hu-26-estado-de-anclaje-visible-en-la-interfaz) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-24: Anclaje del hash fuera del request

> 🔴 **Debe (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva** · 🏷️ `backend`

> **Como** productor, **quiero** que el registro del lote responda en cuanto queda guardado, **para** no ver un error ni crear un lote duplicado cuando Stellar tarda en confirmar.

**Contexto técnico.** Hoy `crear_lote` persiste el lote con `db.commit()` y acto seguido llama a `anclar_lote` (`app/services/lotes.py:134`), que abre una transacción Stellar con `set_timeout(60)` y hasta 3 reintentos con espera. Si Horizon se demora, el cliente recibe un error **aunque el lote ya existe**; al reintentar, se crea otro lote con el siguiente `HUE-YYYY-NNN`.

#### 🧪 Criterios de aceptación (HU-24) — Dado / Cuando / Entonces

- **Escenario 1: respuesta inmediata.**
  - **Dado** que Horizon tarda más de 5 segundos en confirmar,
  - **Cuando** envío `POST /api/lotes` con datos válidos,
  - **Entonces** recibo `201` en menos de 5 segundos con `codigo`, `hash_sha256` y `anclaje_estado = "pendiente"`.
- **Escenario 2: un solo lote.**
  - **Dado** que la respuesta llegó antes del ancla,
  - **Cuando** abro "Mis lotes",
  - **Entonces** el lote aparece una sola vez y no se generan duplicados.
- **Escenario 3: el ancla no se pierde.**
  - **Dado** que el request ya terminó,
  - **Cuando** corre la tarea en segundo plano,
  - **Entonces** `stellar_tx_hash` y `stellar_ledger` se rellenan y `anclaje_estado` pasa a `"anclado"`.
- **Escenario 4: Horizon caído no rompe el registro.**
  - **Dado** que `anchor_hash` lanza `StellarError`,
  - **Cuando** se ejecuta la tarea,
  - **Entonces** el lote sigue existiendo con `anclaje_estado = "fallido"`, el motivo se guarda en `anclaje_error` y **no** se devuelve un 5xx al productor.

---

### 📌 HU-25: Estado de anclaje y reintento automático

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Administrador del sistema · 🆕 **Nueva** · 🏷️ `backend` `infra`

> **Como** administrador, **quiero** que los lotes con anclaje fallido se reintenten solos con un límite, **para** que la trazabilidad se complete sin que nadie pulse un botón ni se reintente para siempre.

**Contexto técnico.** Se añaden a `Lote` los campos `anclaje_estado` (`pendiente|anclado|fallido|fallido_definitivo`), `anclaje_error`, `intentos_anclaje` y `ultimo_intento_at` (migración `0003_anclaje`). El reintento corre desde `scripts/reintentar_anclajes.py`, invocado por un cron de Render (o por una tarea del `lifespan`), para no depender del proceso web.

> ⚖️ **Decisión de implementación (2026-11-24): reintento manual, sin cron.** El plan free de Render rechaza los `cron_job` (`invalid plan: free`) y no se contrata un plan de pago ni se añade infraestructura externa para esto. El ancla inicial sigue encolándose en segundo plano (`BackgroundTasks`), y los reintentos quedan en manos del botón **"Reintentar ancla"** del dueño (`POST /api/lotes/{codigo}/anclar`) o de una pasada a mano `python -m scripts.reintentar_anclajes` (que es la que aplica el tope `ANCLAJE_REINTENTOS_MAX` y marca `fallido_definitivo`). La entrada de cron se eliminó de `render.yaml`.

#### 🧪 Criterios de aceptación (HU-25) — Dado / Cuando / Entonces

- **Escenario 1: reintentos acotados.**
  - **Dado** que un ancla falla,
  - **Cuando** se reintenta,
  - **Entonces** cada intento incrementa `intentos_anclaje` y actualiza `ultimo_intento_at`; la espera la marca quien ejecute la pasada manual (`python -m scripts.reintentar_anclajes`), sin bloquear el request original.
- **Escenario 2: barrido periódico.**
  - **Dado** que existen lotes en `pendiente` o `fallido`,
  - **Cuando** corre el job (pasada manual; no hay cron, ver la decisión arriba),
  - **Entonces** procesa como máximo 20 lotes por pasada, en orden de antigüedad.
- **Escenario 3: idempotencia.**
  - **Dado** que un lote ya está `anclado`,
  - **Cuando** el job lo encuentra,
  - **Entonces** no genera ninguna transacción nueva en Stellar.
- **Escenario 4: límite definitivo.**
  - **Dado** que un lote acumula 5 intentos fallidos,
  - **Cuando** el job vuelve a pasar,
  - **Entonces** lo marca `fallido_definitivo` y deja de reintentarlo; queda visible en el panel.
- **Escenario 5: el reintento manual sigue disponible.**
  - **Dado** que el productor pulsa "Reintentar anclaje",
  - **Cuando** llama a `POST /api/lotes/{codigo}/anclar`,
  - **Entonces** el endpoint exige ser el dueño del lote (solo sesión JWT, ya no `X-API-Key`) y, si Stellar confirma, deja `anclaje_estado = "anclado"`.

---

### 📌 HU-26: Estado de anclaje visible en la interfaz

> 🟡 **Podría (Could Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva** · 🏷️ `frontend`

> **Como** productor, **quiero** ver si mi lote ya está anclado o pendiente, **para** saber si la etiqueta QR ya es válida antes de pegarla en las cubetas.

#### 🧪 Criterios de aceptación (HU-26) — Dado / Cuando / Entonces

- **Escenario 1: distintivo claro.**
  - **Dado** un lote en la ficha o en "Mis lotes",
  - **Cuando** se renderiza la fila,
  - **Entonces** muestra un distintivo **Anclado** (verde), **Pendiente** (ámbar) o **Fallido** (rojo).
- **Escenario 2: la etiqueta no miente.**
  - **Dado** un lote `pendiente` o `fallido`,
  - **Cuando** abro la etiqueta QR,
  - **Entonces** se advierte "aún no verificable on-chain" y la etiqueta no se presenta como verificada.
- **Escenario 3: reintento solo para el dueño.**
  - **Dado** un lote no anclado,
  - **Cuando** lo abre su productor,
  - **Entonces** ve el botón "Reintentar anclaje" y el resultado se refleja sin recargar la página.
- **Escenario 4: verificar distingue causas.**
  - **Dado** un lote sin anclar,
  - **Cuando** pulso "Verificar ahora",
  - **Entonces** la interfaz dice "anclaje pendiente" y **no** "datos alterados".

---

### 📌 Tareas técnicas (no son HU)

- [ ] Migración `0003_anclaje`: columnas `anclaje_estado`, `anclaje_error`, `intentos_anclaje`, `ultimo_intento_at` + índice por `anclaje_estado`.
- [ ] `anclar_lote` deja de llamarse en línea; se encola con `BackgroundTasks` en `POST /api/lotes`.
- [ ] Backfill: los lotes existentes con `stellar_tx_hash` pasan a `anclado` en la migración.
- [x] `scripts/reintentar_anclajes.py` (paso manual; la entrada de cron de `render.yaml` se descartó por el plan free — ver la decisión de arriba).
- [ ] `LoteOut.anclaje_estado` y `lib/types.ts` alineados.
- [ ] Tests: 201 inmediato con Horizon lento, idempotencia, tope de 5 intentos, barrido del job.
- [ ] Actualizar `.env.example`, `README.md` (flujo de trazabilidad) y `CHANGELOG.md`.

[⬆ Volver al inicio](#-backlog-fiabilidad-del-anclaje--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-24 async anchoring](#-hu-24-anchoring-the-hash-outside-the-request) · [HU-25 automatic retry](#-hu-25-anchoring-state-and-automatic-retry) · [HU-26 visible state](#-hu-26-anchoring-state-visible-in-the-ui) · [Technical tasks](#-technical-tasks-not-user-stories)

---

### 📌 HU-24: Anchoring the hash outside the request

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New** · 🏷️ `backend`

> **As a** farmer, **I want** batch registration to respond as soon as it is stored, **so that** I never see an error or create a duplicate batch when Stellar is slow to confirm.

**Technical context.** `crear_lote` commits the batch and then calls `anclar_lote` (`app/services/lotes.py:134`), which opens a Stellar transaction with `set_timeout(60)` and up to 3 retries. If Horizon is slow, the client gets an error **even though the batch exists**; retrying creates another batch with the next `HUE-YYYY-NNN`.

#### 🧪 Acceptance criteria (HU-24) — Given / When / Then

- **Scenario 1: immediate response.**
  - **Given** Horizon takes more than 5 seconds to confirm,
  - **When** I send `POST /api/lotes` with valid data,
  - **Then** I get `201` in under 5 seconds with `codigo`, `hash_sha256` and `anclaje_estado = "pendiente"`.
- **Scenario 2: a single batch.**
  - **Given** the response arrived before anchoring,
  - **When** I open "My batches",
  - **Then** the batch appears exactly once and no duplicates are created.
- **Scenario 3: the anchor is not lost.**
  - **Given** the request already finished,
  - **When** the background task runs,
  - **Then** `stellar_tx_hash` and `stellar_ledger` are filled and `anclaje_estado` becomes `"anclado"`.
- **Scenario 4: a down Horizon does not break registration.**
  - **Given** `anchor_hash` raises `StellarError`,
  - **When** the task runs,
  - **Then** the batch still exists as `anclaje_estado = "fallido"`, the reason is stored in `anclaje_error`, and **no** 5xx is returned to the farmer.

---

### 📌 HU-25: Anchoring state and automatic retry

> 🟠 **Should Have** · 👤 **Role:** System administrator · 🆕 **New** · 🏷️ `backend` `infra`

> **As an** administrator, **I want** batches with a failed anchor to retry on their own, with a cap, **so that** traceability completes without anyone pressing a button and without retrying forever.

**Technical context.** `Lote` gains `anclaje_estado` (`pendiente|anclado|fallido|fallido_definitivo`), `anclaje_error`, `intentos_anclaje` and `ultimo_intento_at` (migration `0003_anclaje`). Retries run from `scripts/reintentar_anclajes.py`, triggered by a Render cron (or a `lifespan` task), so they do not depend on the web process.

> ⚖️ **Implementation decision (2026-11-24): manual retry, no cron.** Render's free plan rejects `cron_job` (`invalid plan: free`), and neither a paid plan nor extra infrastructure was taken on for this. The initial anchor is still queued in the background (`BackgroundTasks`), while retries rest with the owner's **"Reintentar ancla"** button (`POST /api/lotes/{codigo}/anclar`) or a manual `python -m scripts.reintentar_anclajes` pass (the one that enforces the `ANCLAJE_REINTENTOS_MAX` cap and marks `fallido_definitivo`). The cron entry was removed from `render.yaml`.

#### 🧪 Acceptance criteria (HU-25) — Given / When / Then

- **Scenario 1: bounded retries.**
  - **Given** an anchor fails,
  - **When** it is retried,
  - **Then** `intentos_anclaje` increases and `ultimo_intento_at` is updated; the wait is set by whoever runs the manual pass (`python -m scripts.reintentar_anclajes`), without blocking the original request.
- **Scenario 2: periodic sweep.**
  - **Given** batches sit in `pendiente` or `fallido`,
  - **When** the job runs (manual pass; there is no cron, see the decision above),
  - **Then** it processes at most 20 batches per pass, oldest first.
- **Scenario 3: idempotency.**
  - **Given** a batch is already `anclado`,
  - **When** the job finds it,
  - **Then** no new Stellar transaction is created.
- **Scenario 4: hard cap.**
  - **Given** a batch accumulates 5 failed attempts,
  - **When** the job runs again,
  - **Then** it is marked `fallido_definitivo` and no longer retried; it stays visible on the panel.
- **Scenario 5: manual retry still works.**
  - **Given** the farmer presses "Retry anchoring",
  - **When** it calls `POST /api/lotes/{codigo}/anclar`,
  - **Then** the endpoint requires ownership (JWT session only, no longer `X-API-Key`) and, if Stellar confirms, sets `anclaje_estado = "anclado"`.

---

### 📌 HU-26: Anchoring state visible in the UI

> 🟡 **Could Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New** · 🏷️ `frontend`

> **As a** farmer, **I want** to see whether my batch is anchored or pending, **so that** I know if the QR label is already valid before sticking it on the crates.

#### 🧪 Acceptance criteria (HU-26) — Given / When / Then

- **Scenario 1: clear badge.**
  - **Given** a batch on the detail page or in "My batches",
  - **When** the row renders,
  - **Then** it shows **Anchored** (green), **Pending** (amber) or **Failed** (red).
- **Scenario 2: the label does not lie.**
  - **Given** a `pendiente` or `fallido` batch,
  - **When** I open the QR label,
  - **Then** it warns "not yet verifiable on-chain" and the label is not presented as verified.
- **Scenario 3: retry only for the owner.**
  - **Given** an unanchored batch,
  - **When** its farmer opens it,
  - **Then** they see "Retry anchoring" and the result updates without a page reload.
- **Scenario 4: verification separates causes.**
  - **Given** an unanchored batch,
  - **When** I press "Verify now",
  - **Then** the UI says "anchoring pending" and **not** "tampered data".

---

### 📌 Technical tasks (not user stories)

- [ ] Migration `0003_anclaje`: `anclaje_estado`, `anclaje_error`, `intentos_anclaje`, `ultimo_intento_at` + index on `anclaje_estado`.
- [ ] `anclar_lote` is no longer called inline; it is queued with `BackgroundTasks` in `POST /api/lotes`.
- [ ] Backfill: existing batches with `stellar_tx_hash` become `anclado` in the migration.
- [x] `scripts/reintentar_anclajes.py` (manual pass; the `render.yaml` cron entry was dropped under the free plan — see the decision above).
- [ ] `LoteOut.anclaje_estado` and `lib/types.ts` kept in sync.
- [ ] Tests: immediate 201 with a slow Horizon, idempotency, 5-attempt cap, job sweep.
- [ ] Update `.env.example`, `README.md` (traceability flow) and `CHANGELOG.md`.

[⬆ Back to top](#-backlog-fiabilidad-del-anclaje--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-24 ancoragem assíncrona](#-hu-24-ancoragem-do-hash-fora-do-request) · [HU-25 reintento automático](#-hu-25-estado-de-ancoragem-e-reintento-automático) · [HU-26 estado visível](#-hu-26-estado-de-ancoragem-visível-na-interface) · [Tarefas técnicas](#-tarefas-técnicas-não-são-hu)

---

### 📌 HU-24: Ancoragem do hash fora do request

> 🔴 **Deve (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova** · 🏷️ `backend`

> **Como** produtor, **quero** que o registro do lote responda assim que for salvo, **para** não ver um erro nem criar um lote duplicado quando o Stellar demora para confirmar.

**Contexto técnico.** `crear_lote` grava o lote com `db.commit()` e em seguida chama `anclar_lote` (`app/services/lotes.py:134`), que abre uma transação Stellar com `set_timeout(60)` e até 3 reintentos. Se o Horizon demora, o cliente recebe um erro **embora o lote já exista**; ao tentar de novo, cria outro lote com o próximo `HUE-YYYY-NNN`.

#### 🧪 Critérios de aceitação (HU-24) — Dado / Quando / Então

- **Cenário 1: resposta imediata.**
  - **Dado** que o Horizon demora mais de 5 segundos,
  - **Quando** envio `POST /api/lotes` com dados válidos,
  - **Então** recebo `201` em menos de 5 segundos com `codigo`, `hash_sha256` e `anclaje_estado = "pendiente"`.
- **Cenário 2: um único lote.**
  - **Dado** que a resposta chegou antes da ancoragem,
  - **Quando** abro "Meus lotes",
  - **Então** o lote aparece uma única vez e não há duplicados.
- **Cenário 3: a âncora não se perde.**
  - **Dado** que o request já terminou,
  - **Quando** a tarefa em segundo plano roda,
  - **Então** `stellar_tx_hash` e `stellar_ledger` são preenchidos e `anclaje_estado` passa a `"anclado"`.
- **Cenário 4: Horizon fora do ar não quebra o registro.**
  - **Dado** que `anchor_hash` lança `StellarError`,
  - **Quando** a tarefa roda,
  - **Então** o lote continua existindo como `anclaje_estado = "fallido"`, o motivo fica em `anclaje_error` e **nenhum** 5xx é devolvido ao produtor.

---

### 📌 HU-25: Estado de ancoragem e reintento automático

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Administrador do sistema · 🆕 **Nova** · 🏷️ `backend` `infra`

> **Como** administrador, **quero** que os lotes com ancoragem falha sejam reintentados sozinhos e com limite, **para** que a rastreabilidade se complete sem ninguém apertar um botão e sem reintentar para sempre.

**Contexto técnico.** `Lote` ganha `anclaje_estado` (`pendiente|anclado|fallido|fallido_definitivo`), `anclaje_error`, `intentos_anclaje` e `ultimo_intento_at` (migração `0003_anclaje`). O reintento roda em `scripts/reintentar_anclajes.py`, acionado por um cron do Render (ou por uma tarefa do `lifespan`), para não depender do processo web.

> ⚖️ **Decisão de implementação (2026-11-24): reintento manual, sem cron.** O plano free do Render rejeita `cron_job` (`invalid plan: free`) e não foi contratado um plano pago nem adicionada infraestrutura externa para isso. A âncora inicial continua enfileirada em segundo plano (`BackgroundTasks`) e os reintentos ficam por conta do botão **"Reintentar ancla"** do dono (`POST /api/lotes/{codigo}/anclar`) ou de uma passagem manual `python -m scripts.reintentar_anclajes` (é ela que aplica o limite `ANCLAJE_REINTENTOS_MAX` e marca `fallido_definitivo`). A entrada de cron foi removida do `render.yaml`.

#### 🧪 Critérios de aceitação (HU-25) — Dado / Quando / Então

- **Cenário 1: reintentos limitados.**
  - **Dado** que uma ancoragem falha,
  - **Quando** é reintentada,
  - **Então** `intentos_anclaje` aumenta e `ultimo_intento_at` é atualizado; a espera é marcada por quem executar a passagem manual (`python -m scripts.reintentar_anclajes`), sem bloquear o request original.
- **Cenário 2: varredura periódica.**
  - **Dado** que existem lotes em `pendiente` ou `fallido`,
  - **Quando** o job roda (passagem manual; não há cron, ver a decisão acima),
  - **Então** processa no máximo 20 lotes por passada, dos mais antigos aos mais novos.
- **Cenário 3: idempotência.**
  - **Dado** que um lote já está `anclado`,
  - **Quando** o job o encontra,
  - **Então** não gera nenhuma transação nova no Stellar.
- **Cenário 4: limite definitivo.**
  - **Dado** que um lote acumula 5 tentativas falhas,
  - **Quando** o job passa novamente,
  - **Então** fica `fallido_definitivo` e deixa de ser reintentado; continua visível no painel.
- **Cenário 5: o reintento manual continua disponível.**
  - **Dado** que o produtor aperta "Reintentar ancoragem",
  - **Quando** chama `POST /api/lotes/{codigo}/anclar`,
  - **Então** o endpoint exige ser o dono do lote (apenas sessão JWT, não mais `X-API-Key`) e, se o Stellar confirmar, deixa `anclaje_estado = "anclado"`.

---

### 📌 HU-26: Estado de ancoragem visível na interface

> 🟡 **Poderia (Could Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova** · 🏷️ `frontend`

> **Como** produtor, **quero** ver se meu lote já está ancorado ou pendente, **para** saber se a etiqueta QR já é válida antes de colá-la nas cubetas.

#### 🧪 Critérios de aceitação (HU-26) — Dado / Quando / Então

- **Cenário 1: distintivo claro.**
  - **Dado** um lote na ficha ou em "Meus lotes",
  - **Quando** a linha é renderizada,
  - **Então** mostra um distintivo **Ancorado** (verde), **Pendente** (âmbar) ou **Falhou** (vermelho).
- **Cenário 2: a etiqueta não mente.**
  - **Dado** um lote `pendiente` ou `fallido`,
  - **Quando** abro a etiqueta QR,
  - **Então** aparece o aviso "ainda não verificável on-chain" e a etiqueta não é apresentada como verificada.
- **Cenário 3: reintento só para o dono.**
  - **Dado** um lote não ancorado,
  - **Quando** seu produtor o abre,
  - **Então** vê o botão "Reintentar ancoragem" e o resultado aparece sem recarregar a página.
- **Cenário 4: a verificação separa causas.**
  - **Dado** um lote sem ancoragem,
  - **Quando** aperto "Verificar agora",
  - **Então** a interface diz "ancoragem pendente" e **não** "dados alterados".

---

### 📌 Tarefas técnicas (não são HU)

- [ ] Migração `0003_anclaje`: `anclaje_estado`, `anclaje_error`, `intentos_anclaje`, `ultimo_intento_at` + índice por `anclaje_estado`.
- [ ] `anclar_lote` deixa de ser chamado em linha; é enfileirado com `BackgroundTasks` em `POST /api/lotes`.
- [ ] Backfill: lotes existentes com `stellar_tx_hash` passam a `anclado` na migração.
- [x] `scripts/reintentar_anclajes.py` (passagem manual; a entrada de cron no `render.yaml` foi descartada pelo plano free — ver a decisão acima).
- [ ] `LoteOut.anclaje_estado` e `lib/types.ts` alinhados.
- [ ] Testes: 201 imediato com Horizon lento, idempotência, limite de 5 tentativas, varredura do job.
- [ ] Atualizar `.env.example`, `README.md` (fluxo de rastreabilidade) e `CHANGELOG.md`.

[⬆ Voltar ao topo](#-backlog-fiabilidad-del-anclaje--agrotrace-rural)
