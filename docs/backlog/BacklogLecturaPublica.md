# 📋 Backlog: Lectura pública protegida — AgroTrace Rural

> **Feature:** Caché de verificación, paginación y límites de abuso · **Ciclo:** `Version-0.03` (0.3.0) · **Continúa:** HU-27..HU-28
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#29](https://github.com/alucart2005/AgroTraceRural/issues/29), [#30](https://github.com/alucart2005/AgroTraceRural/issues/30) y [#31](https://github.com/alucart2005/AgroTraceRural/issues/31) (formato `docs/backlog/IssuesListos.md`)

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
> | **8 · Lectura pública protegida ◀** | **2026-12-23** | **HU-29..31 (este backlog)** |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-29 caché de verificación](#-hu-29-caché-de-la-verificación-con-ttl) · [HU-30 paginación](#-hu-30-paginación-de-los-listados) · [HU-31 límites de abuso](#-hu-31-límite-de-tamaño-de-petición-y-de-tasa) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-29: Caché de la verificación con TTL

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Consumidor final · 🆕 **Nueva** · 🏷️ `backend` `infra`

> **Como** consumidor, **quiero** que escanear el QR responda rápido y sin depender de Horizon en cada lectura, **para** verificar el lote en segundos aunque Stellar esté lento.

**Contexto técnico.** `GET /api/verify/{codigo}` llama a `verify_anchor`, que consulta Horizon **en cada petición** (`app/api/lotes.py`). La etiqueta QR se imprime en cada cubeta: un día de mercado son cientos de escaneos del mismo código, todos idénticos y todos contra la red. El resultado solo cambia si los datos se alteran, y eso ya lo detecta el hash recalculado en el servidor.

#### 🧪 Criterios de aceptación (HU-29) — Dado / Cuando / Entonces

- **Escenario 1: una sola llamada a Horizon.**
  - **Dado** que dos peticiones a `GET /api/verify/{codigo}` llegan dentro del TTL,
  - **Cuando** el backend las atiende,
  - **Entonces** `verify_anchor` se ejecuta **una** vez (test con contador) y la segunda se sirve de caché.
- **Escenario 2: TTL configurable.**
  - **Dado** la variable `VERIFY_CACHE_TTL` (por defecto `300` segundos),
  - **Cuando** el valor cambia y se reinicia el servicio,
  - **Entonces** el nuevo TTL se aplica sin tocar código. `0` desactiva la caché.
- **Escenario 3: se distingue el origen.**
  - **Dado** una respuesta cacheada,
  - **Cuando** la inspecciono,
  - **Entonces** incluye `cache: { "hit": true, "edad": 42 }` y la cabecera `Cache-Control: public, max-age=60`.
- **Escenario 4: los errores no se congelan.**
  - **Dado** que Horizon falla,
  - **Cuando** el endpoint responde el error de infraestructura,
  - **Entonces** ese resultado **no** se guarda en caché y el siguiente escaneo vuelve a intentar.
- **Escenario 5: el ancla invalida la entrada.**
  - **Dado** un lote pendiente que acaba de anclarse,
  - **Cuando** se completa el reintento,
  - **Entonces** su entrada de caché se descarta y la siguiente verificación lee el estado nuevo.

---

### 📌 HU-30: Paginación de los listados

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Consumidor y productor · 🆕 **Nueva** · 🏷️ `backend` `frontend`

> **Como** usuario, **quiero** que los listados se carguen por páginas, **para** que la aplicación siga siendo rápida a medida que crecen los lotes registrados.

**Contexto técnico.** `GET /api/lotes` y `GET /api/lotes/mios` devuelven **todas** las filas con `fotos` y `evidencias` (arreglos JSON), sin `limit` ni `offset`. El catálogo, el buscador y "Mis lotes" consumen el arreglo completo en el cliente.

#### 🧪 Criterios de aceptación (HU-30) — Dado / Cuando / Entonces

- **Escenario 1: página explícita.**
  - **Dado** `GET /api/lotes?limit=20&offset=40`,
  - **Cuando** el backend responde,
  - **Entonces** devuelve como máximo 20 lotes y la cabecera `X-Total-Count` con el total real.
- **Escenario 2: límites seguros.**
  - **Dado** `limit=0`, `limit=51` o `offset=-1`,
  - **Cuando** llega la petición,
  - **Entonces** responde `422` con el detalle del parámetro, sin tocar la base.
- **Escenario 3: orden estable.**
  - **Dado** dos páginas consecutivas,
  - **Cuando** las comparo,
  - **Entonces** no hay lotes repetidos ni faltantes: el orden es `created_at DESC, id DESC` (desempate estable).
- **Escenario 4: "Mis lotes" pagina igual.**
  - **Dado** un productor con 80 lotes,
  - **Cuando** consulta `GET /api/lotes/mios?limit=20`,
  - **Entonces** recibe su primera página y el total de **sus** lotes, no el global.
- **Escenario 5: compatibilidad.**
  - **Dado** un cliente que no envía parámetros,
  - **Cuando** llama al endpoint,
  - **Entonces** recibe la primera página con `limit` por defecto (`50`) y el contrato documentado.
- **Escenario 6: la UI no pierde funciones.**
  - **Dado** el catálogo y "Mis lotes" con más de una página,
  - **Cuando** pulso "Cargar más",
  - **Entonces** se anexan los siguientes lotes sin duplicar y el modo demo recorta igual en cliente.

---

### 📌 HU-31: Límite de tamaño de petición y de tasa

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Administrador del sistema · 🆕 **Nueva** · 🏷️ `backend` `infra`

> **Como** administrador, **quiero** límites de tamaño y de frecuencia en la API pública, **para** que un cliente abusivo no tumbe Render ni agote las conexiones de Neon.

**Contexto técnico.** `POST /api/lotes` acepta hasta 6 fotos en base64 de hasta 10 MB cada una dentro del JSON: ~60 MB de cuerpo que uvicorn bufferiza antes de validar. No hay rate limit en ningún endpoint y `/api/verify/{codigo}` es público. Render free tiene recursos acotados, así que un script sencillo deja el servicio sin memoria.

#### 🧪 Criterios de aceptación (HU-31) — Dado / Cuando / Entonces

- **Escenario 1: cuerpo demasiado grande.**
  - **Dado** una petición con `Content-Length` mayor a `MAX_BODY_BYTES` (8 MB por defecto),
  - **Cuando** llega al backend,
  - **Entonces** responde `413` con un mensaje que indica el máximo, **antes** de parsear el JSON.
- **Escenario 2: lecturas limitadas.**
  - **Dado** más de 60 peticiones por minuto desde la misma IP a rutas de lectura,
  - **Cuando** llega la 61,
  - **Entonces** responde `429` con `Retry-After` y no consulta la base ni Horizon.
- **Escenario 3: escrituras y login más estrictos.**
  - **Dado** los límites configurados (`10/min` escrituras, `5/min` en `/api/auth/google`),
  - **Cuando** se exceden,
  - **Entonces** responde `429` sin alterar datos.
- **Escenario 4: el uso normal no se bloquea.**
  - **Dado** un consumidor escaneando un QR cada segundo,
  - **Cuando** navega la ficha y verifica,
  - **Entonces** nunca recibe `429` (los límites son holgados para lectura humana).
- **Escenario 5: configurable y desactivable.**
  - **Dado** `RATE_LIMIT_ENABLED=false` en el entorno de tests,
  - **Cuando** corre la suite,
  - **Entonces** los límites no interfieren; en producción se activan por variable.
- **Escenario 6: respuesta honesta.**
  - **Dado** un `429`,
  - **Cuando** el frontend lo recibe,
  - **Entonces** muestra "demasiadas solicitudes, intenta en un minuto" y no cae al modo demo.

---

### 📌 Tareas técnicas (no son HU)

- [ ] Caché en memoria por proceso con `lock` y limpieza perezosa; documentar que con más de una réplica haría falta Redis o una tabla.
- [ ] Tests de caché con un contador de llamadas a `verify_anchor`.
- [ ] Paginación con `limit`/`offset` validados y cabecera `X-Total-Count`.
- [ ] Middleware ASGI propio para tamaño de cuerpo y ventana deslizante de tasa (sin dependencias nuevas).
- [ ] Variables nuevas en `.env.example`: `VERIFY_CACHE_TTL`, `MAX_BODY_BYTES`, `RATE_LIMIT_ENABLED`, `RATE_LIMIT_READ`, `RATE_LIMIT_WRITE`.
- [ ] Ajustar `render.yaml` y documentar los límites en `README.md`.
- [ ] Tests: 413, 429 con `Retry-After`, paginación fuera de rango, compatibilidad sin parámetros.
- [ ] Actualizar `CHANGELOG.md`.

[⬆ Volver al inicio](#-backlog-lectura-pública-protegida--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-29 verification cache](#-hu-29-verification-cache-with-ttl) · [HU-30 pagination](#-hu-30-pagination-of-listings) · [HU-31 abuse limits](#-hu-31-request-size-and-rate-limits) · [Technical tasks](#-technical-tasks-not-user-stories)

---

### 📌 HU-29: Verification cache with TTL

> 🟠 **Should Have** · 👤 **Role:** End consumer · 🆕 **New** · 🏷️ `backend` `infra`

> **As a** consumer, **I want** QR scans to answer quickly without hitting Horizon on every read, **so that** I can verify a batch in seconds even when Stellar is slow.

**Technical context.** `GET /api/verify/{codigo}` calls `verify_anchor`, which queries Horizon **on every request** (`app/api/lotes.py`). The QR label is printed on every crate: a market day means hundreds of scans of the same code, all identical and all against the network. The result only changes if data is tampered with, and that is already caught by the hash recomputed on the server.

#### 🧪 Acceptance criteria (HU-29) — Given / When / Then

- **Scenario 1: a single Horizon call.**
  - **Given** two requests to `GET /api/verify/{codigo}` within the TTL,
  - **When** the backend serves them,
  - **Then** `verify_anchor` runs **once** (counter test) and the second is served from cache.
- **Scenario 2: configurable TTL.**
  - **Given** the `VERIFY_CACHE_TTL` variable (default `300` seconds),
  - **When** it changes and the service restarts,
  - **Then** the new TTL applies without code changes. `0` disables caching.
- **Scenario 3: the origin is visible.**
  - **Given** a cached response,
  - **When** I inspect it,
  - **Then** it includes `cache: { "hit": true, "edad": 42 }` and the `Cache-Control: public, max-age=60` header.
- **Scenario 4: errors are not frozen.**
  - **Given** Horizon fails,
  - **When** the endpoint returns the infrastructure error,
  - **Then** that result is **not** cached and the next scan retries.
- **Scenario 5: anchoring invalidates the entry.**
  - **Given** a pending batch that just got anchored,
  - **When** the retry completes,
  - **Then** its cache entry is dropped and the next verification reads the new state.

---

### 📌 HU-30: Pagination of listings

> 🟠 **Should Have** · 👤 **Role:** Consumer and farmer · 🆕 **New** · 🏷️ `backend` `frontend`

> **As a** user, **I want** listings to load page by page, **so that** the app stays fast as registered batches grow.

**Technical context.** `GET /api/lotes` and `GET /api/lotes/mios` return **every** row with `fotos` and `evidencias` (JSON arrays), with no `limit` or `offset`. The catalogue, search and "My batches" consume the full array on the client.

#### 🧪 Acceptance criteria (HU-30) — Given / When / Then

- **Scenario 1: explicit page.**
  - **Given** `GET /api/lotes?limit=20&offset=40`,
  - **When** the backend responds,
  - **Then** it returns at most 20 batches and an `X-Total-Count` header with the real total.
- **Scenario 2: safe bounds.**
  - **Given** `limit=0`, `limit=51` or `offset=-1`,
  - **When** the request arrives,
  - **Then** it answers `422` with the parameter detail, without touching the database.
- **Scenario 3: stable order.**
  - **Given** two consecutive pages,
  - **When** I compare them,
  - **Then** no batch is repeated or missing: order is `created_at DESC, id DESC` (stable tie-break).
- **Scenario 4: "My batches" paginates too.**
  - **Given** a farmer with 80 batches,
  - **When** they call `GET /api/lotes/mios?limit=20`,
  - **Then** they get their first page and the total of **their** batches, not the global one.
- **Scenario 5: compatibility.**
  - **Given** a client sending no parameters,
  - **When** it calls the endpoint,
  - **Then** it gets the first page with the default `limit` (`50`) and the documented contract.
- **Scenario 6: the UI loses no features.**
  - **Given** the catalogue and "My batches" with more than one page,
  - **When** I press "Load more",
  - **Then** the next batches are appended without duplicates, and demo mode slices the same way on the client.

---

### 📌 HU-31: Request size and rate limits

> 🟠 **Should Have** · 👤 **Role:** System administrator · 🆕 **New** · 🏷️ `backend` `infra`

> **As an** administrator, **I want** size and frequency limits on the public API, **so that** an abusive client cannot take Render down or exhaust Neon connections.

**Technical context.** `POST /api/lotes` accepts up to 6 base64 photos of up to 10 MB each inside the JSON: ~60 MB of body that uvicorn buffers before validating. There is no rate limiting anywhere and `/api/verify/{codigo}` is public. Render free has tight resources, so a simple script can run the service out of memory.

#### 🧪 Acceptance criteria (HU-31) — Given / When / Then

- **Scenario 1: body too large.**
  - **Given** a request with a `Content-Length` above `MAX_BODY_BYTES` (8 MB by default),
  - **When** it reaches the backend,
  - **Then** it answers `413` with a message stating the maximum, **before** parsing the JSON.
- **Scenario 2: limited reads.**
  - **Given** more than 60 requests per minute from the same IP to read routes,
  - **When** the 61st arrives,
  - **Then** it answers `429` with `Retry-After` and queries neither the database nor Horizon.
- **Scenario 3: stricter writes and login.**
  - **Given** the configured limits (`10/min` writes, `5/min` on `/api/auth/google`),
  - **When** they are exceeded,
  - **Then** it answers `429` without changing any data.
- **Scenario 4: normal use is never blocked.**
  - **Given** a consumer scanning a QR every second,
  - **When** they browse the detail page and verify,
  - **Then** they never get `429` (limits are generous for human reading).
- **Scenario 5: configurable and switchable.**
  - **Given** `RATE_LIMIT_ENABLED=false` in the test environment,
  - **When** the suite runs,
  - **Then** limits do not interfere; production enables them via variable.
- **Scenario 6: honest response.**
  - **Given** a `429`,
  - **When** the frontend receives it,
  - **Then** it shows "too many requests, try again in a minute" and does not fall back to demo mode.

---

### 📌 Technical tasks (not user stories)

- [ ] In-process cache with a `lock` and lazy cleanup; document that more than one replica needs Redis or a table.
- [ ] Cache tests with a call counter around `verify_anchor`.
- [ ] Validated `limit`/`offset` pagination and the `X-Total-Count` header.
- [ ] Custom ASGI middleware for body size and a sliding-window rate limiter (no new dependencies).
- [ ] New variables in `.env.example`: `VERIFY_CACHE_TTL`, `MAX_BODY_BYTES`, `RATE_LIMIT_ENABLED`, `RATE_LIMIT_READ`, `RATE_LIMIT_WRITE`.
- [ ] Adjust `render.yaml` and document the limits in `README.md`.
- [ ] Tests: 413, 429 with `Retry-After`, out-of-range pagination, compatibility without parameters.
- [ ] Update `CHANGELOG.md`.

[⬆ Back to top](#-backlog-lectura-pública-protegida--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-29 cache de verificação](#-hu-29-cache-da-verificação-com-ttl) · [HU-30 paginação](#-hu-30-paginação-das-listagens) · [HU-31 limites de abuso](#-hu-31-limite-de-tamanho-de-requisição-e-de-taxa) · [Tarefas técnicas](#-tarefas-técnicas-não-são-hu)

---

### 📌 HU-29: Cache da verificação com TTL

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Consumidor final · 🆕 **Nova** · 🏷️ `backend` `infra`

> **Como** consumidor, **quero** que escanear o QR responda rápido e sem depender do Horizon em cada leitura, **para** verificar o lote em segundos mesmo com o Stellar lento.

**Contexto técnico.** `GET /api/verify/{codigo}` chama `verify_anchor`, que consulta o Horizon **em cada requisição** (`app/api/lotes.py`). A etiqueta QR é impressa em cada cubeta: um dia de feira são centenas de leituras do mesmo código, todas idênticas e todas contra a rede. O resultado só muda se os dados forem alterados, e isso já é detectado pelo hash recalculado no servidor.

#### 🧪 Critérios de aceitação (HU-29) — Dado / Quando / Então

- **Cenário 1: uma única chamada ao Horizon.**
  - **Dado** que duas requisições a `GET /api/verify/{codigo}` chegam dentro do TTL,
  - **Quando** o backend as atende,
  - **Então** `verify_anchor` roda **uma** vez (teste com contador) e a segunda vem do cache.
- **Cenário 2: TTL configurável.**
  - **Dado** a variável `VERIFY_CACHE_TTL` (padrão `300` segundos),
  - **Quando** o valor muda e o serviço reinicia,
  - **Então** o novo TTL se aplica sem tocar no código. `0` desativa o cache.
- **Cenário 3: a origem é visível.**
  - **Dado** uma resposta em cache,
  - **Quando** a inspeciono,
  - **Então** inclui `cache: { "hit": true, "edad": 42 }` e o cabeçalho `Cache-Control: public, max-age=60`.
- **Cenário 4: erros não ficam congelados.**
  - **Dado** que o Horizon falha,
  - **Quando** o endpoint devolve o erro de infraestrutura,
  - **Então** esse resultado **não** é cacheado e a próxima leitura tenta de novo.
- **Cenário 5: a ancoragem invalida a entrada.**
  - **Dado** um lote pendente que acabou de ser ancorado,
  - **Quando** o reintento termina,
  - **Então** sua entrada de cache é descartada e a próxima verificação lê o estado novo.

---

### 📌 HU-30: Paginação das listagens

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Consumidor e produtor · 🆕 **Nova** · 🏷️ `backend` `frontend`

> **Como** usuário, **quero** que as listagens carreguem por páginas, **para** que a aplicação continue rápida à medida que os lotes crescem.

**Contexto técnico.** `GET /api/lotes` e `GET /api/lotes/mios` devolvem **todas** as linhas com `fotos` e `evidencias` (arrays JSON), sem `limit` nem `offset`. O catálogo, a busca e "Meus lotes" consomem o array completo no cliente.

#### 🧪 Critérios de aceitação (HU-30) — Dado / Quando / Então

- **Cenário 1: página explícita.**
  - **Dado** `GET /api/lotes?limit=20&offset=40`,
  - **Quando** o backend responde,
  - **Então** devolve no máximo 20 lotes e o cabeçalho `X-Total-Count` com o total real.
- **Cenário 2: limites seguros.**
  - **Dado** `limit=0`, `limit=51` ou `offset=-1`,
  - **Quando** a requisição chega,
  - **Então** responde `422` com o detalhe do parâmetro, sem tocar no banco.
- **Cenário 3: ordem estável.**
  - **Dado** duas páginas consecutivas,
  - **Quando** as comparo,
  - **Então** nenhum lote se repete nem falta: a ordem é `created_at DESC, id DESC` (desempate estável).
- **Cenário 4: "Meus lotes" pagina igual.**
  - **Dado** um produtor com 80 lotes,
  - **Quando** consulta `GET /api/lotes/mios?limit=20`,
  - **Então** recebe a primeira página e o total dos **seus** lotes, não o global.
- **Cenário 5: compatibilidade.**
  - **Dado** um cliente que não envia parâmetros,
  - **Quando** chama o endpoint,
  - **Então** recebe a primeira página com o `limit` padrão (`50`) e o contrato documentado.
- **Cenário 6: a UI não perde funções.**
  - **Dado** o catálogo e "Meus lotes" com mais de uma página,
  - **Quando** aperto "Carregar mais",
  - **Então** os próximos lotes são anexados sem duplicar, e o modo demo corta igual no cliente.

---

### 📌 HU-31: Limite de tamanho de requisição e de taxa

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Administrador do sistema · 🆕 **Nova** · 🏷️ `backend` `infra`

> **Como** administrador, **quero** limites de tamanho e de frequência na API pública, **para** que um cliente abusivo não derrube o Render nem esgote as conexões do Neon.

**Contexto técnico.** `POST /api/lotes` aceita até 6 fotos em base64 de até 10 MB cada dentro do JSON: ~60 MB de corpo que o uvicorn bufferiza antes de validar. Não há rate limit em nenhum endpoint e `/api/verify/{codigo}` é público. O Render free tem recursos limitados, então um script simples deixa o serviço sem memória.

#### 🧪 Critérios de aceitação (HU-31) — Dado / Quando / Então

- **Cenário 1: corpo grande demais.**
  - **Dado** uma requisição com `Content-Length` acima de `MAX_BODY_BYTES` (8 MB por padrão),
  - **Quando** chega ao backend,
  - **Então** responde `413` com a mensagem do máximo, **antes** de interpretar o JSON.
- **Cenário 2: leituras limitadas.**
  - **Dado** mais de 60 requisições por minuto do mesmo IP em rotas de leitura,
  - **Quando** chega a 61ª,
  - **Então** responde `429` com `Retry-After` e não consulta o banco nem o Horizon.
- **Cenário 3: escritas e login mais estritos.**
  - **Dado** os limites configurados (`10/min` escritas, `5/min` em `/api/auth/google`),
  - **Quando** são excedidos,
  - **Então** responde `429` sem alterar dados.
- **Cenário 4: o uso normal não é bloqueado.**
  - **Dado** um consumidor lendo um QR a cada segundo,
  - **Quando** navega a ficha e verifica,
  - **Então** nunca recebe `429` (os limites são folgados para leitura humana).
- **Cenário 5: configurável e desativável.**
  - **Dado** `RATE_LIMIT_ENABLED=false` no ambiente de testes,
  - **Quando** a suíte roda,
  - **Então** os limites não interferem; em produção são ativados por variável.
- **Cenário 6: resposta honesta.**
  - **Dado** um `429`,
  - **Quando** o frontend o recebe,
  - **Então** mostra "muitas solicitações, tente em um minuto" e não cai no modo demo.

---

### 📌 Tarefas técnicas (não são HU)

- [ ] Cache em memória por processo com `lock` e limpeza preguiçosa; documentar que mais de uma réplica exige Redis ou tabela.
- [ ] Testes de cache com contador de chamadas a `verify_anchor`.
- [ ] Paginação com `limit`/`offset` validados e cabeçalho `X-Total-Count`.
- [ ] Middleware ASGI próprio para tamanho de corpo e janela deslizante de taxa (sem dependências novas).
- [ ] Variáveis novas em `.env.example`: `VERIFY_CACHE_TTL`, `MAX_BODY_BYTES`, `RATE_LIMIT_ENABLED`, `RATE_LIMIT_READ`, `RATE_LIMIT_WRITE`.
- [ ] Ajustar `render.yaml` e documentar os limites em `README.md`.
- [ ] Testes: 413, 429 com `Retry-After`, paginação fora do intervalo, compatibilidade sem parâmetros.
- [ ] Atualizar `CHANGELOG.md`.

[⬆ Voltar ao topo](#-backlog-lectura-pública-protegida--agrotrace-rural)
