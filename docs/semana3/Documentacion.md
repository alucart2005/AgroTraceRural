# 📦 Documentación semanal 3 (MVP)

> **Proyecto:** AgroTrace Rural · **Carpeta:** `frontend/` (Next.js 14 · App Router · TypeScript · Tailwind) · **Deploy:** Vercel
>
> 🌐 **¡App en línea!** [https://frontend-woad-pi-73.vercel.app](https://frontend-woad-pi-73.vercel.app)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [🖥️ 1. Front construido](#-1-front-construido) · [⚓ 2. Decisión técnica](#-2-decisión-técnica) · [👥 3. Participación del equipo](#-3-participación-del-equipo) · [🚧 4. Bloqueos y siguiente paso](#-4-bloqueos-y-siguiente-paso)

---

### 🖥️ 1. Front construido

🌐 **La aplicación está desplegada y es usable desde cualquier dispositivo: [https://frontend-woad-pi-73.vercel.app](https://frontend-woad-pi-73.vercel.app)**

#### Stack y arquitectura

El frontend está construido con **Next.js 14 (App Router)**, **TypeScript** y **Tailwind CSS**, con `qrcode.react` para la generación de códigos QR. Es una aplicación de página única con rutas server-side y renderizado estático, apta para el consumo móvil en la finca (conexión Starlink) y en el punto de venta.

Todas las pantallas hablan con una capa de datos única (`lib/api.ts`), que decide la fuente en tiempo de ejecución: si existe `NEXT_PUBLIC_API_URL` hace `fetch` al backend FastAPI; si no, activa el **modo demo** con datos de ejemplo persistidos en `localStorage`. Esto permite recorrer todo el flujo del MVP en el navegador sin backend configurado — y es como está funcionando hoy la versión en producción de Vercel.

#### Pantallas implementadas y su vínculo con el Blueprint

| Ruta | Historia (Blueprint) | Qué implementa |
| :--- | :--- | :--- |
| `/` | — | Landing con el flujo de trazabilidad en 4 pasos: producción → evidencia → hash → QR → cliente. |
| `/productor` | HU-01 · HU-05 | Lista de lotes registrados con acceso a la página pública y a la etiqueta QR. |
| `/productor/nuevo` | HU-01 | Formulario de registro del productor: código del lote, fecha de cosecha, línea productiva, cantidad y **foto obligatoria**. El botón de guardado queda bloqueado sin evidencia fotográfica — regla del MVP. |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Página pública de consulta (la que abre el consumidor tras escanear el QR): origen, finca, municipio, fecha, fotos del lote, botón **"Verificar integridad"** e historial cronológico de eventos. |
| `/lote/[id]/etiqueta` | HU-04 | Etiqueta imprimible con QR único por cubeta (ej. `HUE-2027-001`), lista para pegar al empaque físico mediante `window.print()`. |
| `/lote/NOEXISTE` | HU-02 (esc. 2) | Pantalla de alerta "Lote no encontrado / código no auténtico" ante códigos falsos o manipulados. |

Las cinco historias de usuario del Blueprint quedan cubiertas de extremo a extremo: el productor registra la cubeta de huevos (HU-01), el sistema le asigna un lote con evidencias (HU-02), la huella SHA-256 se registra en Stellar y se puede verificar (HU-03), la etiqueta QR física se imprime desde la app (HU-04) y el comprador consulta el historial del lote (HU-05).

#### Verificación de integridad (HU-03)

`lib/hash.ts` implementa la misma convención que el backend: **JSON canónico** (claves ordenadas, sin `undefined`) → **SHA-256** vía Web Crypto → hex de 64 caracteres. El payload incluye `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio` y metadatos de las evidencias (`nombre`, `tamano`) — **nunca los bytes de la foto** (regla de oro: los archivos pesados quedan fuera de la blockchain). El botón "Verificar ahora" recalcula el hash desde los datos actuales y lo compara con el registrado: coincide → insignia verde con `tx_hash` enlazado a Horizon Testnet; no coincide → alerta roja de alteración.

#### Flujo completo de prueba (lote semilla `HUE-2027-001`)

1. Abrir `/productor/nuevo`, llenar el formulario y adjuntar foto → se crea el lote.
2. Ir a `/lote/{id}/etiqueta`, imprimir la etiqueta con QR → se pega a la cubeta.
3. Escanear el QR (o abrir el enlace) en `/lote/{id}` → el consumidor ve origen, fotos e historial.
4. Pulsar "Verificar integridad" → resultado verde con transacción enlazada en Horizon.

Este flujo fue validado con **pruebas E2E automatizadas (Playwright + Chromium): 10/10 verificaciones exitosas**, incluyendo bloqueo sin foto, creación del lote `HUE-2026-001`, verificación verde, etiqueta QR y pantalla 404.

#### Despliegue

El proyecto está desplegado en **Vercel** (proyecto `frontend`, Root Directory `frontend`, framework Next.js auto-detectado). El rewrite de `vercel.json` redirige `/api/*` a `BACKEND_URL` cuando exista; en su ausencia opera el modo demo. Cada push a `main` genera un nuevo deployment de producción y cada pull request genera un preview aislado.

---

### ⚓ 2. Decisión técnica

**Pregunta:** ¿qué opción de uso de Stellar elegimos para el anclaje de huellas del MVP?

| Opción | Qué es | Estado |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes en Stellar (Soroban): un contrato Rust/Wasm con función `anchor(batch_id, hash)` y eventos `Anchored` | Postergada |
| **B** | Transacción clásica de Stellar + **Memo Hash (32 bytes)** con la huella SHA-256 del lote, vía `stellar-sdk` (Python) | ✅ **Elegida** |

**Decisión: Opción B.** El MVP necesita una sola cosa de la blockchain: **probar que la huella de un lote existió en un momento dado y no fue alterada después**. Eso se logra registrando los 32 bytes del SHA-256 en el campo Memo Hash de una transacción normal de Stellar Testnet (pago de 1 stroop de XLM a la misma cuenta, operación mínima). La opción B cuesta ≈ 0,00001 XLM por lote, no exige mantener un contrato, ni escribir Rust, ni pagar costos de recursos, y la verificación se resuelve consultando Horizon con `verify_anchor()` (el servicio decodifica el memo en base64 y lo compara byte a byte con el hash recalculado).

**Qué se descartó y por qué:** (1) **La Opción A (Soroban) para el MVP** — un contrato es sobreingeniería mientras no existan reglas de negocio automáticas (límites de eventos, pagos, certificados revocables); además introduce la complejidad de toolchain Rust/Wasm sin beneficio medible en esta etapa. Se descarta, no se elimina: la misma cuenta y el mismo `stellar-sdk` permiten migrar a un contrato cuando el producto lo requiera (ver `StellarContratos.md` §3–4). (2) **Almacenar fotos/videos en blockchain** — viola la regla de oro del `ProductBlueprint.md` §8 (los archivos pesados quedan en almacenamiento externo; solo viaja el hash), encarecería cada lote y expondría información sensible. (3) **Otras cadenas** — se evaluó Stellar por los criterios ya fijados en el Blueprint: costos mínimos y predecibles, finalidad de ~5 segundos, bajo consumo energético y SDK oficial para Python/TypeScript.

---

### 👥 3. Participación del equipo

| Integrante | GitHub | Aporte en este entregable |
| :--- | :--- | :--- |
| **Napoleon de Jesus Anaya Romero** | `alucart2005` | Construcción del frontend (Next.js), backend de anclaje Stellar (FastAPI), scripts, tests, documentación trilingüe, despliegue en Vercel y MCPs del proyecto. Commits: `1e08f05`, `8cc4002`, `e92ef10`, `5769363`. |
| **Cristian Esteban Jiménez Durango** | `CristianEstebanJimenezDurango` | Propuso la HU-03 (verificación de integridad con huella SHA-256 en Stellar) — la historia diferenciadora del MVP. |
| **Jefferson Cabrera** | *pendiente de confirmar* | Propuso la HU-04 (etiqueta QR única por cubeta que conecta el empaque físico con el registro digital). |
| **Diego Martínez** | *pendiente de confirmar* | Propuso la HU-05 (historial de eventos del lote para validar frescura por parte del comprador local). |

---

### 🚧 4. Bloqueos y siguiente paso

**Bloqueos actuales:**

- El **backend (FastAPI) aún no está desplegado** en la nube (Railway/Render); el frontend opera en modo demo con datos locales.
- **Base de datos no conectada:** falta crear la instancia (Neon/PostgreSQL) y definir `DATABASE_URL`.
- **Faltan commits de los compañeros** esta semana (Cristian, Jefferson y Diego aún no han aportado al repositorio).
- `docs/semana3/StackTecnologico.md` sigue pendiente.

**Próximo paso hacia el MVP:** desplegar el backend en Railway/Render con las variables de entorno de Stellar Testnet, conectar `NEXT_PUBLIC_API_URL` y `BACKEND_URL` en Vercel para salir del modo demo y registrar los primeros lotes reales con anclaje on-chain verificable.

[⬆ Volver al inicio](#-documentación-semanal-3-mvp)

---

## 🇺🇸 English

📑 **Contents:** [💻 1. Frontend built](#-1-frontend-built) · [⚓ 2. Technical decision](#-2-technical-decision) · [👥 3. Team participation](#-3-team-participation) · [🚧 4. Blockers and next step](#-4-blockers-and-next-step)

---

### 💻 1. Frontend built

🌐 **The application is deployed and usable from any device: [https://frontend-woad-pi-73.vercel.app](https://frontend-woad-pi-73.vercel.app)**

#### Stack and architecture

The frontend is built with **Next.js 14 (App Router)**, **TypeScript** and **Tailwind CSS**, plus `qrcode.react` for QR code generation. It is a single-page application with server-side routes and static rendering, suitable for mobile use on the farm (Starlink connection) and at the point of sale.

Every screen talks to a single data layer (`lib/api.ts`), which picks the source at runtime: if `NEXT_PUBLIC_API_URL` exists it `fetch`es the FastAPI backend; otherwise it activates **demo mode** with sample data persisted in `localStorage`. This lets the whole MVP flow run in the browser with no backend configured — and that is exactly how today's Vercel production version works.

#### Screens implemented and their Blueprint link

| Route | Story (Blueprint) | What it implements |
| :--- | :--- | :--- |
| `/` | — | Landing page with the 4-step traceability flow: production → evidence → hash → QR → customer. |
| `/productor` | HU-01 · HU-05 | List of registered batches with links to the public page and the QR label. |
| `/productor/nuevo` | HU-01 | Farmer registration form: batch code, harvest date, production line, quantity and **mandatory photo**. The save button stays blocked without photographic evidence — an MVP rule. |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Public lookup page (the one the customer opens after scanning the QR): origin, farm, municipality, date, batch photos, the **"Verify integrity"** button and the chronological event history. |
| `/lote/[id]/etiqueta` | HU-04 | Printable label with a unique QR per crate (e.g. `HUE-2027-001`), ready to stick on the physical package via `window.print()`. |
| `/lote/NOEXISTE` | HU-02 (sc. 2) | "Batch not found / code not authentic" alert screen for fake or tampered codes. |

All five Blueprint user stories are covered end to end: the farmer registers the egg crate (HU-01), the system assigns it a batch with evidence (HU-02), the SHA-256 fingerprint is registered on Stellar and can be verified (HU-03), the physical QR label is printed from the app (HU-04) and the buyer looks up the batch history (HU-05).

#### Integrity verification (HU-03)

`lib/hash.ts` implements the same convention as the backend: **canonical JSON** (sorted keys, no `undefined`) → **SHA-256** via Web Crypto → 64-char hex. The payload includes `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio` and evidence metadata (`nombre`, `tamano`) — **never the photo bytes** (golden rule: heavy files stay off-chain). The "Verify now" button recomputes the hash from current data and compares it with the registered one: match → green badge with `tx_hash` linked to Horizon Testnet; mismatch → red tamper alert.

#### Full test flow (seed batch `HUE-2027-001`)

1. Open `/productor/nuevo`, fill the form and attach a photo → the batch is created.
2. Go to `/lote/{id}/etiqueta`, print the QR label → stick it on the crate.
3. Scan the QR (or open the link) at `/lote/{id}` → the customer sees origin, photos and history.
4. Click "Verify integrity" → green result with the transaction linked on Horizon.

This flow was validated with **automated E2E tests (Playwright + Chromium): 10/10 successful checks**, including photo-blocking, creation of batch `HUE-2026-001`, green verification, QR label and the 404 screen.

#### Deployment

The project is deployed on **Vercel** (project `frontend`, Root Directory `frontend`, auto-detected Next.js framework). The `vercel.json` rewrite redirects `/api/*` to `BACKEND_URL` when it exists; in its absence demo mode takes over. Each push to `main` generates a new production deployment and each pull request generates an isolated preview.

---

### ⚓ 2. Technical decision

**Question:** which option of using Stellar did we choose to anchor the MVP fingerprints?

| Option | What it is | Status |
| :--- | :--- | :--- |
| **A** | Smart contracts on Stellar (Soroban): a Rust/Wasm contract with an `anchor(batch_id, hash)` function and `Anchored` events | Postponed |
| **B** | Classic Stellar transaction + **Memo Hash (32 bytes)** carrying the batch's SHA-256 fingerprint, via `stellar-sdk` (Python) | ✅ **Chosen** |

**Decision: Option B.** The MVP needs exactly one thing from the blockchain: **to prove that a batch fingerprint existed at a given time and was not altered afterwards**. That is achieved by putting the 32 SHA-256 bytes into the Memo Hash field of a regular Stellar Testnet transaction (payment of 1 stroop of XLM to the same account — a minimal operation). Option B costs ≈ 0.00001 XLM per batch, requires no contract maintenance, no Rust toolchain and no resource fees; verification is solved by querying Horizon with `verify_anchor()` (the service decodes the memo from base64 and compares it byte by byte against the recomputed hash).

**What was discarded and why:** (1) **Option A (Soroban) for the MVP** — a contract is over-engineering while no automatic business rules exist (event limits, payments, revocable certificates); it also adds Rust/Wasm toolchain complexity with no measurable benefit at this stage. Discarded, not eliminated: the same account and `stellar-sdk` allow migrating to a contract when the product requires it (see `StellarContratos.md` §3–4). (2) **Storing photos/videos on-chain** — it breaks the golden rule of `ProductBlueprint.md` §8 (heavy files stay in external storage; only the hash travels), would make every batch expensive and would expose sensitive information. (3) **Other chains** — Stellar was evaluated against the criteria already set in the Blueprint: minimal, predictable costs, ~5-second finality, low energy use and an official SDK for Python/TypeScript.

---

### 👥 3. Team participation

| Member | GitHub | Contribution in this deliverable |
| :--- | :--- | :--- |
| **Napoleon de Jesus Anaya Romero** | `alucart2005` | Frontend build (Next.js), Stellar anchoring backend (FastAPI), scripts, tests, trilingual documentation, Vercel deployment and project MCPs. Commits: `1e08f05`, `8cc4002`, `e92ef10`, `5769363`. |
| **Cristian Esteban Jiménez Durango** | `CristianEstebanJimenezDurango` | Proposed HU-03 (integrity verification with SHA-256 fingerprint on Stellar) — the MVP's differentiating story. |
| **Jefferson Cabrera** | *pending confirmation* | Proposed HU-04 (unique QR label per crate linking the physical package to the digital record). |
| **Diego Martínez** | *pending confirmation* | Proposed HU-05 (batch event history so the local buyer can validate freshness). |

---

### 🚧 4. Blockers and next step

**Current blockers:**

- The **FastAPI backend is not yet deployed** in the cloud (Railway/Render); the frontend runs in demo mode with local data.
- **No database connected:** the instance (Neon/PostgreSQL) still needs to be created and `DATABASE_URL` defined.
- **Teammates' commits are missing** this week (Cristian, Jefferson and Diego have not contributed to the repository yet).
- `docs/semana3/StackTecnologico.md` is still pending.

**Next step toward the MVP:** deploy the backend on Railway/Render with the Stellar Testnet environment variables, connect `NEXT_PUBLIC_API_URL` and `BACKEND_URL` on Vercel to leave demo mode, and register the first real batches with verifiable on-chain anchoring.

[⬆ Back to top](#-documentación-semanal-3-mvp)

---

## 🇧🇷 Português

📑 **Conteúdo:** [💻 1. Frontend construído](#-1-frontend-construído) · [⚓ 2. Decisão técnica](#-2-decisão-técnica) · [👥 3. Participação da equipe](#-3-participação-da-equipe) · [🚧 4. Bloqueios e próximo passo](#-4-bloqueios-e-próximo-passo)

---

### 💻 1. Frontend construído

🌐 **O aplicativo está implantado e utilizável de qualquer dispositivo: [https://frontend-woad-pi-73.vercel.app](https://frontend-woad-pi-73.vercel.app)**

#### Stack e arquitetura

O frontend foi construído com **Next.js 14 (App Router)**, **TypeScript** e **Tailwind CSS**, além de `qrcode.react` para geração de códigos QR. É uma aplicação de página única com rotas server-side e renderização estática, adequada para uso móvel na fazenda (conexão Starlink) e no ponto de venda.

Todas as telas falam com uma camada única de dados (`lib/api.ts`), que escolhe a fonte em tempo de execução: se existir `NEXT_PUBLIC_API_URL`, faz `fetch` ao backend FastAPI; caso contrário, ativa o **modo demo** com dados de exemplo persistidos em `localStorage`. Isso permite percorrer todo o fluxo do MVP no navegador sem backend configurado — e é exatamente como funciona hoje a versão de produção no Vercel.

#### Telas implementadas e sua ligação com o Blueprint

| Rota | História (Blueprint) | O que implementa |
| :--- | :--- | :--- |
| `/` | — | Landing com o fluxo de rastreabilidade em 4 etapas: produção → evidência → hash → QR → cliente. |
| `/productor` | HU-01 · HU-05 | Lista de lotes registrados com acesso à página pública e à etiqueta QR. |
| `/productor/nuevo` | HU-01 | Formulário de registro do produtor: código do lote, data da colheita, linha produtiva, quantidade e **foto obrigatória**. O botão de salvar fica bloqueado sem evidência fotográfica — regra do MVP. |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Página pública de consulta (aquela que o cliente abre após escanear o QR): origem, fazenda, município, data, fotos do lote, botão **"Verificar integridade"** e histórico cronológico de eventos. |
| `/lote/[id]/etiqueta` | HU-04 | Etiqueta imprimível com QR único por caixa (ex.: `HUE-2027-001`), pronta para colar no embalagem físico via `window.print()`. |
| `/lote/NOEXISTE` | HU-02 (esc. 2) | Tela de alerta "Lote não encontrado / código não autêntico" para códigos falsos ou adulterados. |

As cinco histórias de usuário do Blueprint estão cobertas de ponta a ponta: o produtor registra a caixa de ovos (HU-01), o sistema atribui um lote com evidências (HU-02), a impressão SHA-256 é registrada na Stellar e pode ser verificada (HU-03), a etiqueta QR física é impressa pelo app (HU-04) e o comprador consulta o histórico do lote (HU-05).

#### Verificação de integridade (HU-03)

`lib/hash.ts` implementa a mesma convenção do backend: **JSON canônico** (chaves ordenadas, sem `undefined`) → **SHA-256** via Web Crypto → hex de 64 caracteres. O payload inclui `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio` e metadados das evidências (`nombre`, `tamano`) — **nunca os bytes da foto** (regra de ouro: arquivos pesados ficam fora da blockchain). O botão "Verificar agora" recalcula o hash dos dados atuais e compara com o registrado: coincide → selo verde com `tx_hash` linkado ao Horizon Testnet; não coincide → alerta vermelho de adulteração.

#### Fluxo completo de teste (lote semente `HUE-2027-001`)

1. Abrir `/productor/nuevo`, preencher o formulário e anexar foto → o lote é criado.
2. Ir em `/lote/{id}/etiqueta`, imprimir a etiqueta QR → colar na caixa.
3. Escanear o QR (ou abrir o link) em `/lote/{id}` → o cliente vê origem, fotos e histórico.
4. Clicar em "Verificar integridade" → resultado verde com a transação linkada no Horizon.

Esse fluxo foi validado com **testes E2E automatizados (Playwright + Chromium): 10/10 verificações bem-sucedidas**, incluindo bloqueio sem foto, criação do lote `HUE-2026-001`, verificação verde, etiqueta QR e a tela 404.

#### Implantação

O projeto está implantado no **Vercel** (projeto `frontend`, Root Directory `frontend`, framework Next.js detectado automaticamente). O rewrite do `vercel.json` redireciona `/api/*` para `BACKEND_URL` quando existir; na sua ausência o modo demo assume. Cada push em `main` gera um novo deployment de produção e cada pull request gera um preview isolado.

---

### ⚓ 2. Decisão técnica

**Pergunta:** qual opção de uso da Stellar escolhemos para ancorar as impressões do MVP?

| Opção | O que é | Status |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes na Stellar (Soroban): um contrato Rust/Wasm com função `anchor(batch_id, hash)` e eventos `Anchored` | Adiada |
| **B** | Transação clássica da Stellar + **Memo Hash (32 bytes)** com a impressão SHA-256 do lote, via `stellar-sdk` (Python) | ✅ **Escolhida** |

**Decisão: Opção B.** O MVP precisa de uma única coisa da blockchain: **provar que a impressão de um lote existiu em um momento dado e não foi alterada depois**. Isso é conseguido registrando os 32 bytes do SHA-256 no campo Memo Hash de uma transação normal na Stellar Testnet (pagamento de 1 stroop de XLM para a mesma conta — operação mínima). A opção B custa ≈ 0,00001 XLM por lote, não exige manter contrato, nem escrever Rust, nem pagar taxas de recursos; a verificação se resolve consultando o Horizon com `verify_anchor()` (o serviço decodifica o memo em base64 e o compara byte a byte com o hash recalculado).

**O que foi descartado e por quê:** (1) **A Opção A (Soroban) para o MVP** — um contrato seria superengenharia enquanto não existirem regras de negócio automáticas (limites de eventos, pagamentos, certificados revogáveis); além disso introduz a complexidade da toolchain Rust/Wasm sem benefício mensurável nesta etapa. Descartada, não eliminada: a mesma conta e o mesmo `stellar-sdk` permitem migrar para um contrato quando o produto exigir (ver `StellarContratos.md` §3–4). (2) **Armazenar fotos/vídeos na blockchain** — quebra a regra de ouro do `ProductBlueprint.md` §8 (arquivos pesados ficam em armazenamento externo; só viaja o hash), encareceria cada lote e exporia informações sensíveis. (3) **Outras cadeias** — a Stellar foi avaliada pelos critérios já fixados no Blueprint: custos mínimos e previsíveis, finalidade de ~5 segundos, baixo consumo energético e SDK oficial para Python/TypeScript.

---

### 👥 3. Participação da equipe

| Integrante | GitHub | Aporte nesta entrega |
| :--- | :--- | :--- |
| **Napoleon de Jesus Anaya Romero** | `alucart2005` | Construção do frontend (Next.js), backend de ancoragem na Stellar (FastAPI), scripts, testes, documentação trilingue, implantação no Vercel e MCPs do projeto. Commits: `1e08f05`, `8cc4002`, `e92ef10`, `5769363`. |
| **Cristian Esteban Jiménez Durango** | `CristianEstebanJimenezDurango` | Propôs a HU-03 (verificação de integridade com impressão SHA-256 na Stellar) — a história diferenciadora do MVP. |
| **Jefferson Cabrera** | *pendente de confirmação* | Propôs a HU-04 (etiqueta QR única por caixa que conecta o embalagem físico ao registro digital). |
| **Diego Martínez** | *pendente de confirmação* | Propôs a HU-05 (histórico de eventos do lote para o comprador local validar a frescura). |

---

### 🚧 4. Bloqueios e próximo passo

**Bloqueios atuais:**

- O **backend (FastAPI) ainda não está implantado** na nuvem (Railway/Render); o frontend opera em modo demo com dados locais.
- **Banco de dados não conectado:** falta criar a instância (Neon/PostgreSQL) e definir `DATABASE_URL`.
- **Faltam commits dos colegas** nesta semana (Cristian, Jefferson e Diego ainda não contribuíram no repositório).
- `docs/semana3/StackTecnologico.md` segue pendente.

**Próximo passo rumo ao MVP:** implantar o backend no Railway/Render com as variáveis de ambiente da Stellar Testnet, conectar `NEXT_PUBLIC_API_URL` e `BACKEND_URL` no Vercel para sair do modo demo e registrar os primeiros lotes reais com ancoragem on-chain verificável.

[⬆ Voltar ao topo](#-documentación-semanal-3-mvp)
