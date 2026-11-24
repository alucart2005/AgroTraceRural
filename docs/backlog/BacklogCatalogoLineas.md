# 📋 Backlog: Catálogo de líneas productivas — AgroTrace Rural

> **Feature:** Catálogo fijo de productos y validación en la API · **Ciclo:** `Version-0.07` (0.7.0) · **Continúa:** HU-29..HU-31
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issue [#32](https://github.com/alucard2005/AgroTraceRural/issues/32) (formato `docs/backlog/IssuesListos.md`)

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
> | 7 · Integridad de la cadena de custodia | 2026-12-11 | HU-27..28 |
> | 8 · Lectura pública protegida | 2026-12-23 | HU-29..31 |
> | **9 · Catálogo de líneas productivas ◀** | **2026-11-24** | **HU-32 (este backlog)** |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-32 catálogo de líneas](#-hu-32-catálogo-fijo-de-líneas-productivas) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-32: Catálogo fijo de líneas productivas

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Productor · 🆕 **Nueva** · 🏷️ `backend` `frontend`

> **Como** productor, **quiero** registrar cada lote bajo un producto del catálogo de la finca, **para** que el catálogo público no se llene de líneas inventadas ni de variantes con mayúsculas o espacios distintos.

**Contexto técnico.** `linea_productiva` entra en el payload canónico del hash (8 campos, `CAMPOS_LOTE`), así que no se puede normalizar después: el valor queda sellado en Stellar. El formulario `/productor/nuevo` ya era un `<select>` alimentado por `LINEAS_PRODUCTIVAS` (`frontend/lib/types.ts`), pero `POST /api/lotes` solo validaba longitud (`min_length=1, max_length=80`). Un cliente podía crear lotes con productos arbitrarios —de hecho en producción existía un lote con la línea "Movilidad 1"— y esa línea aparecía como una más en `/productor/productos`. La ficha de la línea además ofrecía "Registrar lote de esta línea" con `?linea=<nombre>`, que en esos casos avisaba en vez de crear un lote con el producto equivocado.

#### 🧪 Criterios de aceptación (HU-32) — Dado / Cuando / Entonces

- **Escenario 1: las tres líneas del catálogo se aceptan.**
  - **Dado** el catálogo vigente (`Huevos Guarumo`, `Pescado Tilapia`, `Frutales varios`),
  - **Cuando** el productor registra un lote con cualquiera de ellas,
  - **Entonces** `POST /api/lotes` responde `201` y guarda el valor exacto.
- **Escenario 2: una línea inventada se rechaza.**
  - **Dado** un valor fuera del catálogo (p. ej. `Movilidad 1`),
  - **Cuando** llega a `POST /api/lotes`,
  - **Entonces** responde `422` con el mensaje "Línea productiva fuera del catálogo" y **no** crea lote, no sube fotos a R2 ni encola anclaje.
- **Escenario 3: variantes tipográficas tampoco pasan.**
  - **Dado** `huevos guarumo`, ` Huevos Guarumo` o `Huevos  Guarumo`,
  - **Cuando** se intentan registrar,
  - **Entonces** también son `422`: el valor viaja dentro del hash y debe ser idéntico al del catálogo.
- **Escenario 4: lo ya anclado no se toca.**
  - **Dado** los lotes existentes, todos con valores del catálogo (o con una línea heredada ya oculta),
  - **Cuando** se despliega la validación,
  - **Entonces** sus hashes y transacciones en Stellar no cambian y `/api/verify/{codigo}` sigue en verde.

---

### 📌 Tareas técnicas (no son HU)

- [x] `LINEAS_PRODUCTIVAS` en `app/schemas.py`, espejo exacto de `frontend/lib/types.ts`.
- [x] `field_validator` en `LoteCreateIn.linea_productiva` → `422` fuera de catálogo.
- [x] Tests: las tres líneas aceptadas y valores fuera del catálogo rechazados (91 → 93).
- [x] Documentar la paridad del catálogo en `AGENTS.md` (igual que la paridad del hash).
- [x] Ocultar el lote heredado con línea "Movilidad 1" (`HUE-2026-001`, `oculto = true`).

[⬆ Volver al inicio](#-backlog-catálogo-de-líneas-productivas--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-32 product-line catalogue](#-hu-32-fixed-product-line-catalogue) · [Technical tasks](#-technical-tasks-not-user-stories)

---

### 📌 HU-32: Fixed product-line catalogue

> 🟠 **Should Have** · 👤 **Role:** Producer · 🆕 **New** · 🏷️ `backend` `frontend`

> **As a** producer, **I want** every batch registered under a product from the farm's catalogue, **so that** the public catalogue is not filled with invented lines or variants differing in case or spacing.

**Technical context.** `linea_productiva` is part of the canonical hash payload (8 fields, `CAMPOS_LOTE`), so it cannot be normalised later: the value gets sealed on Stellar. The `/productor/nuevo` form was already a `<select>` fed by `LINEAS_PRODUCTIVAS` (`frontend/lib/types.ts`), but `POST /api/lotes` only validated length (`min_length=1, max_length=80`). A client could register batches under arbitrary products —production even had a batch under the line "Movilidad 1"— and that line showed up as yet another entry in `/productor/productos`. The line page also offered "Registrar lote de esta línea" with `?linea=<name>`, which in those cases warned instead of creating a batch under the wrong product.

#### 🧪 Acceptance criteria (HU-32) — Given / When / Then

- **Scenario 1: the three catalogue lines are accepted.**
  - **Given** the current catalogue (`Huevos Guarumo`, `Pescado Tilapia`, `Frutales varios`),
  - **When** the producer registers a batch with any of them,
  - **Then** `POST /api/lotes` answers `201` and stores the exact value.
- **Scenario 2: an invented line is rejected.**
  - **Given** a value outside the catalogue (e.g. `Movilidad 1`),
  - **When** it reaches `POST /api/lotes`,
  - **Then** it answers `422` with "Línea productiva fuera del catálogo" and **no** batch is created, no photo is uploaded to R2 and no anchor is queued.
- **Scenario 3: typographic variants do not pass either.**
  - **Given** `huevos guarumo`, ` Huevos Guarumo` or `Huevos  Guarumo`,
  - **When** they are submitted,
  - **Then** they are `422` too: the value travels inside the hash and must be identical to the catalogue entry.
- **Scenario 4: what is already anchored stays untouched.**
  - **Given** the existing batches, all with catalogue values (or with an already hidden legacy line),
  - **When** the validation is deployed,
  - **Then** their hashes and Stellar transactions do not change and `/api/verify/{codigo}` stays green.

---

### 📌 Technical tasks (not user stories)

- [x] `LINEAS_PRODUCTIVAS` in `app/schemas.py`, an exact mirror of `frontend/lib/types.ts`.
- [x] `field_validator` on `LoteCreateIn.linea_productiva` → `422` outside the catalogue.
- [x] Tests: all three lines accepted and out-of-catalogue values rejected (91 → 93).
- [x] Document the catalogue parity in `AGENTS.md` (next to the hash parity note).
- [x] Hide the legacy batch with the "Movilidad 1" line (`HUE-2026-001`, `oculto = true`).

[⬆ Back to top](#-backlog-catálogo-de-líneas-productivas--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-32 catálogo de linhas](#-hu-32-catálogo-fixo-de-linhas-produtivas) · [Tarefas técnicas](#-tarefas-técnicas-não-são-hu)

---

### 📌 HU-32: Catálogo fixo de linhas produtivas

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Produtor · 🆕 **Nova** · 🏷️ `backend` `frontend`

> **Como** produtor, **quero** registrar cada lote sob um produto do catálogo da fazenda, **para** que o catálogo público não se encha de linhas inventadas nem de variantes com maiúsculas ou espaços diferentes.

**Contexto técnico.** `linea_productiva` entra no payload canônico do hash (8 campos, `CAMPOS_LOTE`), então não pode ser normalizada depois: o valor fica selado na Stellar. O formulário `/productor/nuevo` já era um `<select>` alimentado por `LINEAS_PRODUCTIVAS` (`frontend/lib/types.ts`), mas `POST /api/lotes` só validava o comprimento (`min_length=1, max_length=80`). Um cliente podia registrar lotes com produtos arbitrários — em produção existia até um lote com a linha "Movilidad 1" — e essa linha aparecia como mais uma em `/productor/productos`. A página da linha ainda oferecia "Registrar lote de esta línea" com `?linea=<nome>`, que nesses casos avisava em vez de criar um lote com o produto errado.

#### 🧪 Critérios de aceitação (HU-32) — Dado / Quando / Então

- **Cenário 1: as três linhas do catálogo são aceitas.**
  - **Dado** o catálogo vigente (`Huevos Guarumo`, `Pescado Tilapia`, `Frutales varios`),
  - **Quando** o produtor registra um lote com qualquer uma delas,
  - **Então** `POST /api/lotes` responde `201` e guarda o valor exato.
- **Cenário 2: uma linha inventada é rejeitada.**
  - **Dado** um valor fora do catálogo (por exemplo, `Movilidad 1`),
  - **Quando** chega a `POST /api/lotes`,
  - **Então** responde `422` com a mensagem "Línea productiva fuera del catálogo" e **não** cria lote, não envia fotos ao R2 nem enfileira ancoragem.
- **Cenário 3: variantes tipográficas também não passam.**
  - **Dado** `huevos guarumo`, ` Huevos Guarumo` ou `Huevos  Guarumo`,
  - **Quando** são enviados,
  - **Então** também são `422`: o valor viaja dentro do hash e deve ser idêntico ao do catálogo.
- **Cenário 4: o que já está ancorado não muda.**
  - **Dado** os lotes existentes, todos com valores do catálogo (ou com uma linha herdada já oculta),
  - **Quando** a validação é implantada,
  - **Então** seus hashes e transações na Stellar não mudam e `/api/verify/{codigo}` continua verde.

---

### 📌 Tarefas técnicas (não são HU)

- [x] `LINEAS_PRODUCTIVAS` em `app/schemas.py`, espelho exato de `frontend/lib/types.ts`.
- [x] `field_validator` em `LoteCreateIn.linea_productiva` → `422` fora do catálogo.
- [x] Testes: as três linhas aceitas e valores fora do catálogo rejeitados (91 → 93).
- [x] Documentar a paridade do catálogo em `AGENTS.md` (ao lado da paridade do hash).
- [x] Ocultar o lote herdado com a linha "Movilidad 1" (`HUE-2026-001`, `oculto = true`).

[⬆ Voltar ao topo](#-backlog-catálogo-de-líneas-productivas--agrotrace-rural)
