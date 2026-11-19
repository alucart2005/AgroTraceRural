# 📋 Backlog: Integridad de la cadena de custodia — AgroTrace Rural

> **Feature:** Escritura de eventos del productor dueño y cadena de hashes verificable · **Ciclo:** `Version-0.03` (0.3.0) · **Continúa:** HU-24..HU-26
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#27](https://github.com/alucart2005/AgroTraceRural/issues/27) y [#28](https://github.com/alucart2005/AgroTraceRural/issues/28) (formato `docs/backlog/IssuesListos.md`)

> 🗺️ **Roadmap** · [Board #14](https://github.com/users/alucart2005/projects/14)
>
> | Entrega · Delivery · Entrega | Fecha · Date · Data | Historias · Stories · Histórias |
> |---|---|---|
> | 1 · MVP verificable | 2026-10-16 | HU-01..05 |
> | 2 · Producción y robustez | 2026-10-18 | HU-09..13 |
> | 3 · Autenticación con Google | 2026-10-30 | HU-06..08 |
> | 4 · Estabilidad del backend | 2026-11-08 | HU-14..15 |
> | 5 · Rediseño visual y ayuda | 2026-11-10 | HU-16..23 |
> | 6 · Fiabilidad del anclaje | 2026-11-28 | HU-24..26 |
> | **7 · Integridad de la cadena de custodia ◀** | **2026-12-11** | **HU-27..28 (este backlog)** |
> | 8 · Lectura pública protegida | 2026-12-23 | HU-29..31 |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-27 eventos del dueño](#-hu-27-escritura-de-eventos-restringida-al-productor-dueño) · [HU-28 cadena de hashes](#-hu-28-cadena-de-custodia-encadenada-y-verificable) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-27: Escritura de eventos restringida al productor dueño

> 🔴 **Debe (Must Have)** · 👤 **Rol:** Consumidor final · 🆕 **Nueva** · 🏷️ `backend`

> **Como** consumidor, **quiero** que solo el productor dueño pueda añadir eventos de custodia a un lote, **para** que nadie pueda falsificar un despacho o un empaque ajeno.

**Contexto técnico.** `POST /api/lotes/{codigo}/eventos` usa `ESCRITURA = [Depends(require_api_key)]` (`app/api/lotes.py:27`). La `X-API-Key` viaja en el bundle (`NEXT_PUBLIC_API_KEY`), es decir, **es pública por diseño**: con la URL del backend cualquiera puede insertar un evento en cualquier lote. La trazabilidad promete lo contrario.

#### 🧪 Criterios de aceptación (HU-27) — Dado / Cuando / Entonces

- **Escenario 1: sin sesión no se escribe.**
  - **Dado** que envío un evento sin `Authorization: Bearer`,
  - **Cuando** el backend lo procesa,
  - **Entonces** responde `401` y no se crea ningún evento, aunque la `X-API-Key` sea válida.
- **Escenario 2: otro productor no puede escribir.**
  - **Dado** un lote de la productora A y una sesión válida de la productora B,
  - **Cuando** B intenta añadir un evento,
  - **Entonces** responde `403` con un mensaje claro y el lote queda intacto.
- **Escenario 3: el dueño sí escribe.**
  - **Dado** el productor que registró el lote,
  - **Cuando** añade clasificación, empaque o despacho,
  - **Entonces** el evento se guarda y aparece en la línea de tiempo pública.
- **Escenario 4: lotes heredados sin dueño.**
  - **Dado** un lote con `usuario_id = NULL` (anterior a HU-08),
  - **Cuando** alguien intenta añadirle eventos,
  - **Entonces** solo se permite mediante el endpoint interno con `X-API-Key` y queda registrado en el log de auditoría; la UI explica que el lote debe reclamarse.
- **Escenario 5: el frontend no finge éxito.**
  - **Dado** una respuesta `401`/`403` al guardar un evento,
  - **Cuando** la UI la recibe,
  - **Entonces** muestra el error y **no** cae al almacén demo ni simula que se guardó.

---

### 📌 HU-28: Cadena de custodia encadenada y verificable

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Distribuidor / Auditor · 🆕 **Nueva** · 🏷️ `backend` `frontend`

> **Como** auditor, **quiero** que cada evento quede encadenado al anterior mediante un hash, **para** detectar si alguien alteró la línea de tiempo después del registro.

**Contexto técnico.** Hoy el hash canónico cubre **solo los 8 campos del lote**; los eventos viven fuera y se pueden editar en la base de datos sin que la verificación lo note. Se añade a `Evento` (`app/models/lote.py`) los campos `hash_evento` y `hash_evento_anterior` (migración `0004_cadena_eventos`). El primer eslabón encadena con `Lote.hash_sha256`; cada uno siguiente, con el `hash_evento` previo. **El hash canónico del lote no cambia** (`CAMPOS_LOTE` sigue en 8 campos) para no romper la paridad con `frontend/lib/hash.ts` ni los vectores de `tests/test_sha256.py`.

#### 🧪 Criterios de aceptación (HU-28) — Dado / Cuando / Entonces

- **Escenario 1: eslabón al crear.**
  - **Dado** un lote recién registrado,
  - **Cuando** se añade un evento,
  - **Entonces** `hash_evento_anterior` es igual al hash del eslabón previo y `hash_evento = SHA-256(hash_evento_anterior + tipo + fecha + descripcion)`.
- **Escenario 2: cadena íntegra.**
  - **Dado** un lote con 4 eventos sin tocar,
  - **Cuando** consulto `GET /api/verify/{codigo}`,
  - **Entonces** la respuesta incluye `cadena_valida: true`, `hash_cadena` (último eslabón) y `eventos_verificados: 4`.
- **Escenario 3: alteración detectada.**
  - **Dado** que alguien cambia la descripción de un evento directamente en la base de datos,
  - **Cuando** se verifica el lote,
  - **Entonces** `cadena_valida: false` e `indice_alterado` indica el evento exacto, sin afectar el `hash_sha256` original del lote.
- **Escenario 4: evento borrado detectado.**
  - **Dado** que alguien elimina un evento intermedio,
  - **Cuando** se recalcula la cadena,
  - **Entonces** el eslabón siguiente ya no encadena y la verificación lo reporta como alteración.
- **Escenario 5: lectura clara en la ficha.**
  - **Dado** un consumidor en `/lote/[id]`,
  - **Cuando** la cadena es válida,
  - **Entonces** ve "Cadena de custodia verificada (N eventos)"; si no lo es, ve "Cadena alterada en el evento N" y la etiqueta se marca en rojo.
- **Escenario 6: verificación pública sin exponer datos.**
  - **Dado** un consumidor anónimo,
  - **Cuando** consulta la verificación,
  - **Entonces** recibe hashes y estados, nunca datos personales del productor.

---

### 📌 Tareas técnicas (no son HU)

- [ ] Migración `0004_cadena_eventos`: `hash_evento` (64), `hash_evento_anterior` (64) + backfill de los eventos existentes en orden de `id`.
- [ ] `hash_evento()` en `app/services/sha256.py` con payload documentado y vector de prueba propio.
- [ ] `VerificacionOut` amplía `cadena_valida`, `hash_cadena`, `eventos_verificados`, `indice_alterado`.
- [ ] `agregar_evento` calcula el eslabón dentro de la misma transacción (con lock por lote para evitar carreras).
- [ ] Endurecer `POST /api/lotes/{codigo}/anclar` con la misma comprobación de propiedad.
- [ ] Tests: eslabón correcto, alteración, borrado intermedio, cadena vacía, concurrencia de dos eventos.
- [ ] UI: `Timeline.tsx` y `VerificarIntegridad.tsx` muestran el estado de la cadena.
- [ ] Docs: `docs/semana3/StellarAnclaje.md`, `README.md` y `CHANGELOG.md`.

[⬆ Volver al inicio](#-backlog-integridad-de-la-cadena-de-custodia--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-27 owner-only events](#-hu-27-custody-event-writes-restricted-to-the-owning-farmer) · [HU-28 hash chain](#-hu-28-hashed-and-verifiable-custody-chain) · [Technical tasks](#-technical-tasks-not-user-stories)

---

### 📌 HU-27: Custody event writes restricted to the owning farmer

> 🔴 **Must Have** · 👤 **Role:** End consumer · 🆕 **New** · 🏷️ `backend`

> **As a** consumer, **I want** only the owning farmer to add custody events to a batch, **so that** nobody can forge someone else's dispatch or packing event.

**Technical context.** `POST /api/lotes/{codigo}/eventos` uses `ESCRITURA = [Depends(require_api_key)]` (`app/api/lotes.py:27`). The `X-API-Key` ships in the bundle (`NEXT_PUBLIC_API_KEY`), so it is **public by design**: anyone with the backend URL can insert an event into any batch. That contradicts the traceability promise.

#### 🧪 Acceptance criteria (HU-27) — Given / When / Then

- **Scenario 1: no session, no write.**
  - **Given** I send an event without `Authorization: Bearer`,
  - **When** the backend processes it,
  - **Then** it answers `401` and no event is created, even if the `X-API-Key` is valid.
- **Scenario 2: another farmer cannot write.**
  - **Given** a batch owned by farmer A and a valid session for farmer B,
  - **When** B tries to add an event,
  - **Then** it answers `403` with a clear message and the batch is untouched.
- **Scenario 3: the owner can write.**
  - **Given** the farmer who registered the batch,
  - **When** they add classification, packing or dispatch,
  - **Then** the event is stored and shows up in the public timeline.
- **Scenario 4: legacy batches without an owner.**
  - **Given** a batch with `usuario_id = NULL` (pre-HU-08),
  - **When** someone tries to add events,
  - **Then** only the internal `X-API-Key` endpoint is allowed, the action is written to the audit log, and the UI explains the batch must be claimed.
- **Scenario 5: the frontend does not fake success.**
  - **Given** a `401`/`403` response when saving an event,
  - **When** the UI receives it,
  - **Then** it shows the error and does **not** fall back to the demo store or pretend it was saved.

---

### 📌 HU-28: Hashed and verifiable custody chain

> 🟠 **Should Have** · 👤 **Role:** Distributor / Auditor · 🆕 **New** · 🏷️ `backend` `frontend`

> **As an** auditor, **I want** every event chained to the previous one by a hash, **so that** I can detect whether the timeline was altered after registration.

**Technical context.** Today the canonical hash covers **only the 8 batch fields**; events live outside it and can be edited in the database without verification noticing. `Evento` (`app/models/lote.py`) gains `hash_evento` and `hash_evento_anterior` (migration `0004_cadena_eventos`). The first link chains to `Lote.hash_sha256`; each next link chains to the previous `hash_evento`. **The batch canonical hash does not change** (`CAMPOS_LOTE` stays at 8 fields) so the parity with `frontend/lib/hash.ts` and the vectors in `tests/test_sha256.py` keep working.

#### 🧪 Acceptance criteria (HU-28) — Given / When / Then

- **Scenario 1: link on create.**
  - **Given** a freshly registered batch,
  - **When** an event is appended,
  - **Then** `hash_evento_anterior` equals the previous link's hash and `hash_evento = SHA-256(hash_evento_anterior + tipo + fecha + descripcion)`.
- **Scenario 2: intact chain.**
  - **Given** a batch with 4 untouched events,
  - **When** I call `GET /api/verify/{codigo}`,
  - **Then** the response includes `cadena_valida: true`, `hash_cadena` (last link) and `eventos_verificados: 4`.
- **Scenario 3: tampering detected.**
  - **Given** someone changes an event description directly in the database,
  - **When** the batch is verified,
  - **Then** `cadena_valida: false` and `indice_alterado` points at the exact event, without affecting the batch's original `hash_sha256`.
- **Scenario 4: deleted event detected.**
  - **Given** someone removes a middle event,
  - **When** the chain is recomputed,
  - **Then** the next link no longer chains and verification reports tampering.
- **Scenario 5: clear reading on the detail page.**
  - **Given** a consumer on `/lote/[id]`,
  - **When** the chain is valid,
  - **Then** they see "Custody chain verified (N events)"; otherwise "Chain tampered at event N" and the badge turns red.
- **Scenario 6: public verification without leaking data.**
  - **Given** an anonymous consumer,
  - **When** they read the verification,
  - **Then** they get hashes and states, never the farmer's personal data.

---

### 📌 Technical tasks (not user stories)

- [ ] Migration `0004_cadena_eventos`: `hash_evento` (64), `hash_evento_anterior` (64) + backfill of existing events in `id` order.
- [ ] `hash_evento()` in `app/services/sha256.py` with a documented payload and its own test vector.
- [ ] `VerificacionOut` gains `cadena_valida`, `hash_cadena`, `eventos_verificados`, `indice_alterado`.
- [ ] `agregar_evento` computes the link inside the same transaction (with a per-batch lock to avoid races).
- [ ] Harden `POST /api/lotes/{codigo}/anclar` with the same ownership check.
- [ ] Tests: correct link, tampering, middle deletion, empty chain, two concurrent events.
- [ ] UI: `Timeline.tsx` and `VerificarIntegridad.tsx` show the chain state.
- [ ] Docs: `docs/semana3/StellarAnclaje.md`, `README.md` and `CHANGELOG.md`.

[⬆ Back to top](#-backlog-integridad-de-la-cadena-de-custodia--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-27 eventos do dono](#-hu-27-escrita-de-eventos-restrita-ao-produtor-dono) · [HU-28 cadeia de hashes](#-hu-28-cadeia-de-custódia-encadeada-e-verificável) · [Tarefas técnicas](#-tarefas-técnicas-não-são-hu)

---

### 📌 HU-27: Escrita de eventos restrita ao produtor dono

> 🔴 **Deve (Must Have)** · 👤 **Papel:** Consumidor final · 🆕 **Nova** · 🏷️ `backend`

> **Como** consumidor, **quero** que apenas o produtor dono possa adicionar eventos de custódia a um lote, **para** que ninguém falsifique a expedição ou a embalagem de outro.

**Contexto técnico.** `POST /api/lotes/{codigo}/eventos` usa `ESCRITURA = [Depends(require_api_key)]` (`app/api/lotes.py:27`). A `X-API-Key` viaja no bundle (`NEXT_PUBLIC_API_KEY`), ou seja, **é pública por projeto**: com a URL do backend qualquer pessoa insere um evento em qualquer lote. Isso contradiz a promessa de rastreabilidade.

#### 🧪 Critérios de aceitação (HU-27) — Dado / Quando / Então

- **Cenário 1: sem sessão não escreve.**
  - **Dado** que envio um evento sem `Authorization: Bearer`,
  - **Quando** o backend processa,
  - **Então** responde `401` e nenhum evento é criado, mesmo com `X-API-Key` válida.
- **Cenário 2: outro produtor não pode escrever.**
  - **Dado** um lote da produtora A e uma sessão válida da produtora B,
  - **Quando** B tenta adicionar um evento,
  - **Então** responde `403` com mensagem clara e o lote fica intacto.
- **Cenário 3: o dono escreve.**
  - **Dado** o produtor que registrou o lote,
  - **Quando** adiciona classificação, embalagem ou expedição,
  - **Então** o evento é salvo e aparece na linha do tempo pública.
- **Cenário 4: lotes herdados sem dono.**
  - **Dado** um lote com `usuario_id = NULL` (anterior à HU-08),
  - **Quando** alguém tenta adicionar eventos,
  - **Então** só o endpoint interno com `X-API-Key` é permitido, a ação vai para o log de auditoria e a UI explica que o lote precisa ser reivindicado.
- **Cenário 5: o frontend não finge sucesso.**
  - **Dado** uma resposta `401`/`403` ao salvar um evento,
  - **Quando** a UI a recebe,
  - **Então** mostra o erro e **não** cai no armazenamento demo nem simula que salvou.

---

### 📌 HU-28: Cadeia de custódia encadeada e verificável

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Distribuidor / Auditor · 🆕 **Nova** · 🏷️ `backend` `frontend`

> **Como** auditor, **quero** que cada evento fique encadeado ao anterior por um hash, **para** detectar se alguém alterou a linha do tempo após o registro.

**Contexto técnico.** Hoje o hash canônico cobre **apenas os 8 campos do lote**; os eventos ficam fora e podem ser editados no banco sem que a verificação perceba. `Evento` (`app/models/lote.py`) ganha `hash_evento` e `hash_evento_anterior` (migração `0004_cadena_eventos`). O primeiro elo encadeia com `Lote.hash_sha256`; cada seguinte, com o `hash_evento` anterior. **O hash canônico do lote não muda** (`CAMPOS_LOTE` continua com 8 campos) para não quebrar a paridade com `frontend/lib/hash.ts` nem os vetores de `tests/test_sha256.py`.

#### 🧪 Critérios de aceitação (HU-28) — Dado / Quando / Então

- **Cenário 1: elo ao criar.**
  - **Dado** um lote recém-registrado,
  - **Quando** um evento é adicionado,
  - **Então** `hash_evento_anterior` é igual ao hash do elo anterior e `hash_evento = SHA-256(hash_evento_anterior + tipo + fecha + descripcion)`.
- **Cenário 2: cadeia íntegra.**
  - **Dado** um lote com 4 eventos sem alteração,
  - **Quando** consulto `GET /api/verify/{codigo}`,
  - **Então** a resposta inclui `cadena_valida: true`, `hash_cadena` (último elo) e `eventos_verificados: 4`.
- **Cenário 3: alteração detectada.**
  - **Dado** que alguém muda a descrição de um evento direto no banco,
  - **Quando** o lote é verificado,
  - **Então** `cadena_valida: false` e `indice_alterado` aponta o evento exato, sem afetar o `hash_sha256` original do lote.
- **Cenário 4: evento apagado detectado.**
  - **Dado** que alguém remove um evento do meio,
  - **Quando** a cadeia é recalculada,
  - **Então** o elo seguinte já não encadeia e a verificação reporta alteração.
- **Cenário 5: leitura clara na ficha.**
  - **Dado** um consumidor em `/lote/[id]`,
  - **Quando** a cadeia é válida,
  - **Então** vê "Cadeia de custódia verificada (N eventos)"; se não for, vê "Cadeia alterada no evento N" e a etiqueta fica vermelha.
- **Cenário 6: verificação pública sem expor dados.**
  - **Dado** um consumidor anônimo,
  - **Quando** consulta a verificação,
  - **Então** recebe hashes e estados, nunca dados pessoais do produtor.

---

### 📌 Tarefas técnicas (não são HU)

- [ ] Migração `0004_cadena_eventos`: `hash_evento` (64), `hash_evento_anterior` (64) + backfill dos eventos existentes em ordem de `id`.
- [ ] `hash_evento()` em `app/services/sha256.py` com payload documentado e vetor de teste próprio.
- [ ] `VerificacionOut` amplia `cadena_valida`, `hash_cadena`, `eventos_verificados`, `indice_alterado`.
- [ ] `agregar_evento` calcula o elo na mesma transação (com lock por lote para evitar corridas).
- [ ] Endurecer `POST /api/lotes/{codigo}/anclar` com a mesma verificação de propriedade.
- [ ] Testes: elo correto, alteração, remoção intermediária, cadeia vazia, concorrência de dois eventos.
- [ ] UI: `Timeline.tsx` e `VerificarIntegridad.tsx` mostram o estado da cadeia.
- [ ] Docs: `docs/semana3/StellarAnclaje.md`, `README.md` e `CHANGELOG.md`.

[⬆ Voltar ao topo](#-backlog-integridad-de-la-cadena-de-custodia--agrotrace-rural)
