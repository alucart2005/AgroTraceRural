# 📋 Backlog: Autenticación con Google — AgroTrace Rural

> **Feature:** Ingreso de productores con Google + registro de lotes autenticado · **Continúa:** HU-01, HU-05
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#6](https://github.com/alucart2005/AgroTraceRural/issues/6), [#7](https://github.com/alucart2005/AgroTraceRural/issues/7) y [#8](https://github.com/alucart2005/AgroTraceRural/issues/8) (formato `docs/backlog/IssuesListos.md`)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-06 Ingreso con Google](#-hu-06-ingreso-de-productor-con-google) · [HU-07 Datos del primer ingreso](#-hu-07-registro-de-datos-del-productor-en-el-primer-ingreso) · [HU-08 Lotes autenticados](#-hu-08-registro-de-lotes-con-sesión-de-productor) · [Tareas técnicas](#-tareas-técnicas)

---

### 📌 HU-06: Ingreso de productor con Google

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor agrícola, **quiero** iniciar sesión con mi cuenta de Google para acceder a la zona del productor, **para** no tener que crear ni recordar una contraseña adicional.

#### 🧪 Criterios de aceptación (HU-06) — Dado / Cuando / Entonces

- **Escenario 1: Primer ingreso con Google.**
  - **Dado** que un productor nuevo visita `/login`,
  - **Cuando** pulsa "Continuar con Google" y elige su cuenta en el popup,
  - **Entonces** el backend verifica el ID token con Google, crea su registro en la tabla `usuarios`, devuelve un JWT y el navegador lo redirige a `/productor/completar`.
- **Escenario 2: Ingreso de un productor con perfil ya completo.**
  - **Dado** que el productor completó sus datos en un ingreso anterior,
  - **Cuando** inicia sesión con Google,
  - **Entonces** el sistema lo redirige directamente a `/productor` (Mis lotes) sin pedirle información adicional.
- **Escenario 3: Acceso sin sesión a la zona del productor.**
  - **Dado** que un visitante escribe `/productor` o `/productor/nuevo` sin haber iniciado sesión,
  - **Cuando** la página detecta que no hay token vigente,
  - **Entonces** lo redirige a `/login` y no muestra el contenido protegido.
- **Escenario 4: Sesión expirada.**
  - **Dado** que el JWT del productor ya venció,
  - **Cuando** intenta continuar navegando,
  - **Entonces** el sistema limpia la sesión local y lo envía a `/login`.
- **Escenario 5: Cierre de sesión.**
  - **Dado** que el productor está autenticado,
  - **Cuando** pulsa "Salir" en la navegación,
  - **Entonces** se elimina el token del navegador y vuelve a la página pública.

[⬆ Volver al inicio](#-backlog-autenticación-con-google--agrotrace-rural)

---

### 📌 HU-07: Registro de datos del productor en el primer ingreso

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor, **quiero** completar mis datos personales y de finca la primera vez que ingreso, **para** que la plataforma registre quién es el dueño de los lotes que publique.

#### 🧪 Criterios de aceptación (HU-07) — Dado / Cuando / Entonces

- **Escenario 1: Formulario de bienvenida en el primer ingreso.**
  - **Dado** que el productor se autentica por primera vez con Google,
  - **Cuando** el backend responde `perfil_completo: false` y el navegador abre `/productor/completar`,
  - **Entonces** el sistema muestra un formulario con 5 campos obligatorios: **nombre completo, cédula, teléfono, nombre de la finca y municipio**, con el correo y la foto de Google precargados como referencia.
- **Escenario 2: Guardado exitoso de los datos.**
  - **Dado** que el productor diligencia los 5 campos,
  - **Cuando** pulsa "Guardar mis datos",
  - **Entonces** el backend los persiste junto a su `google_sub`, marca el perfil como completo y lo redirige a `/productor`.
- **Escenario 3: Intento de guardar con campos vacíos.**
  - **Dado** que el formulario tiene campos sin diligenciar,
  - **Cuando** el productor intenta guardarlo,
  - **Entonces** el sistema bloquea el envío y resalta los campos obligatorios faltantes.
- **Escenario 4: Reintento de ingreso posterior.**
  - **Dado** que el productor ya tiene el perfil completo,
  - **Cuando** vuelve a iniciar sesión con Google,
  - **Entonces** no se le vuelve a solicitar ningún dato.

[⬆ Volver al inicio](#-backlog-autenticación-con-google--agrotrace-rural)

---

### 📌 HU-08: Registro de lotes con sesión de productor

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🔄 **Evolución de HU-01**

> **Como** responsable de AgroTrace, **quiero** que el registro de lotes exija la sesión del productor y quede vinculado a su identidad, **para** que nadie anónimo pueda crear lotes y cada lote tenga un responsable claro.

#### 🧪 Criterios de aceptación (HU-08) — Dado / Cuando / Entonces

- **Escenario 1: Registro autenticado de lote.**
  - **Dado** que el productor tiene sesión vigente y abre `/productor/nuevo`,
  - **Cuando** diligencia el formulario y guarda,
  - **Entonces** el backend acepta la petición con el JWT (ya no con `X-API-Key`), crea el lote con su `usuario_id` y confirma el registro con su código `HUE-YYYY-NNN`.
- **Escenario 2: Intento de registro sin sesión.**
  - **Dado** que un visitante o un script llama a `POST /api/lotes` sin token de productor,
  - **Cuando** el backend procesa la petición,
  - **Entonces** responde `401` y no se crea ningún lote; en el navegador es redirigido a `/login`.
- **Escenario 3: Mis lotes solo muestra los propios.**
  - **Dado** que hay lotes registrados por varios productores,
  - **Cuando** un productor inicia sesión en `/productor`,
  - **Entonces** la lista muestra únicamente los lotes asociados a su identidad.
- **Escenario 4: La verificación pública no cambia (HU-02 / HU-03).**
  - **Dado** que un consumidor escanea un QR,
  - **Cuando** consulta la ficha pública y verifica la integridad on-chain,
  - **Entonces** sigue funcionando sin credenciales y el **hash canónico de 8 campos permanece intacto** (el `usuario_id` queda fuera del hash).

[⬆ Volver al inicio](#-backlog-autenticación-con-google--agrotrace-rural)

---

### 📌 Tareas técnicas (no son HU)

**Google Cloud Console (manual):**
- [x] Pantalla de consentimiento OAuth (modo testing) + Client ID "Web application" con orígenes autorizados `http://localhost:3000` y `https://frontend-2mx1.vercel.app`. *(origen de Vercel verificado en producción; `http://localhost:3000` queda por confirmar al probar en local)*

**Backend (`backend/`):**
- [x] Modelo `Usuario` (`google_sub` único, email, nombre, foto_url, cédula, teléfono, finca, municipio) + FK `usuario_id` en `lotes`.
- [x] Migración Alembic `0002_usuarios`.
- [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` en `core/config.py`, `.env.example` y `render.yaml`.
- [x] `services/auth.py`: verificación del ID token con `google-auth` + JWT propio con PyJWT (exp ~30 días).
- [x] Router `api/auth.py`: `POST /api/auth/google`, `GET /api/auth/me`, `PUT /api/auth/me`.
- [x] `require_productor` en `api/deps.py`; `POST /api/lotes` pasa de `X-API-Key` a sesión Google (eventos/ancla/verify conservan la clave).
- [x] Tests: token Google mockeado, `401` sin sesión, flujo de completar perfil.

**Frontend (`frontend/`):**
- [x] `lib/auth.ts` (JWT en `localStorage`, detección de expiración) y `lib/api.ts` (header `Authorization: Bearer`, `loginConGoogle`, `obtenerYo`, `actualizarPerfil`).
- [x] Página `/login` con botón de Google Identity Services (popup).
- [x] Página `/productor/completar` (formulario de 5 campos).
- [x] Guard client-side en `/productor/*` → redirección a `/login`.
- [x] `Nav.tsx`: "Iniciar sesión" / avatar + "Salir"; sesión "demo" cuando el backend no responde.

**Variables y despliegue:**
- [x] Render: `GOOGLE_CLIENT_ID` + `AUTH_SECRET` seteados en el panel; `GOOGLE_CLIENT_SECRET` queda vacío a propósito (el popup no usa el secret).
- [x] Vercel: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + **redeploy** (se inlina en el build).

**Verificación:**
- [x] `.venv/bin/python -m pytest -q` (71 tests) · `npm run lint` · `npm run build`.
- [x] ⚠️ **No tocar** `CAMPOS_LOTE` en `app/services/sha256.py` ni `frontend/lib/hash.ts` (paridad del hash HU-03).

**Nota sobre HU-01:** su Escenario 1 ya asume "el productor ha iniciado sesión"; con esta feature esa precondición pasa de ser ficticia a ser obligatoria. No requiere reescribir la HU, solo tenerla presente.

---

## 🇺🇸 English

📑 **Contents:** [HU-06 Google sign-in](#-hu-06-farmer-sign-in-with-google) · [HU-07 First-login data](#-hu-07-farmer-data-capture-on-first-sign-in) · [HU-08 Authenticated batches](#-hu-08-batch-registration-with-farmer-session) · [Technical tasks](#-technical-tasks)

---

### 📌 HU-06: Farmer sign-in with Google

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want to** sign in with my Google account to access the farmer area, **so that** I don't have to create or remember an extra password.

#### 🧪 Acceptance criteria (HU-06) — Given / When / Then

- **Scenario 1: First sign-in with Google.**
  - **Given** a new farmer visits `/login`,
  - **When** they click "Continue with Google" and pick their account in the popup,
  - **Then** the backend verifies the ID token with Google, creates their record in the `usuarios` table, returns a JWT and the browser redirects them to `/productor/completar`.
- **Scenario 2: Sign-in with an already completed profile.**
  - **Given** the farmer completed their data on a previous sign-in,
  - **When** they sign in with Google,
  - **Then** the system redirects them straight to `/productor` (My batches) without asking for any information again.
- **Scenario 3: Access to the farmer area without a session.**
  - **Given** a visitor types `/productor` or `/productor/nuevo` without signing in,
  - **When** the page detects there is no valid token,
  - **Then** it redirects them to `/login` and does not render the protected content.
- **Scenario 4: Expired session.**
  - **Given** the farmer's JWT has expired,
  - **When** they keep navigating,
  - **Then** the system clears the local session and sends them to `/login`.
- **Scenario 5: Sign-out.**
  - **Given** the farmer is authenticated,
  - **When** they click "Sign out" in the navigation,
  - **Then** the browser token is removed and they return to the public page.

[⬆ Back to top](#-backlog-autentication-with-google--agrotrace-rural)

---

### 📌 HU-07: Farmer data capture on first sign-in

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want to** complete my personal and farm data the first time I sign in, **so that** the platform records who owns the batches it publishes.

#### 🧪 Acceptance criteria (HU-07) — Given / When / Then

- **Scenario 1: Welcome form on first sign-in.**
  - **Given** the farmer authenticates with Google for the first time,
  - **When** the backend responds `perfil_completo: false` and the browser opens `/productor/completar`,
  - **Then** the system shows a form with 5 required fields — **full name, national ID, phone, farm name and municipality** — with the Google email and photo preloaded as reference.
- **Scenario 2: Successful data save.**
  - **Given** the farmer fills in the 5 fields,
  - **When** they click "Save my data",
  - **Then** the backend persists them alongside their `google_sub`, marks the profile as complete and redirects them to `/productor`.
- **Scenario 3: Attempt to save with empty fields.**
  - **Given** the form has unfilled fields,
  - **When** the farmer tries to save,
  - **Then** the system blocks the submission and highlights the missing required fields.
- **Scenario 4: Later sign-in.**
  - **Given** the farmer's profile is already complete,
  - **When** they sign in with Google again,
  - **Then** no data is requested again.

[⬆ Back to top](#-backlog-autentication-with-google--agrotrace-rural)

---

### 📌 HU-08: Batch registration with farmer session

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🔄 **Evolution of HU-01**

> **As an** AgroTrace owner, **I want** batch registration to require the farmer's session and be linked to their identity, **so that** no anonymous party can create batches and every batch has a clear owner.

#### 🧪 Acceptance criteria (HU-08) — Given / When / Then

- **Scenario 1: Authenticated batch registration.**
  - **Given** the farmer has a valid session and opens `/productor/nuevo`,
  - **When** they fill in the form and save,
  - **Then** the backend accepts the request with the JWT (no longer with `X-API-Key`), creates the batch with their `usuario_id` and confirms the registration with its `HUE-YYYY-NNN` code.
- **Scenario 2: Registration attempt without a session.**
  - **Given** a visitor or a script calls `POST /api/lotes` without a farmer token,
  - **When** the backend processes the request,
  - **Then** it responds `401` and no batch is created; in the browser the user is redirected to `/login`.
- **Scenario 3: "My batches" only shows the farmer's own.**
  - **Given** batches exist from several farmers,
  - **When** a farmer signs in at `/productor`,
  - **Then** the list only shows the batches linked to their identity.
- **Scenario 4: Public verification is unchanged (HU-02 / HU-03).**
  - **Given** a consumer scans a QR code,
  - **When** they view the public page and run the on-chain integrity check,
  - **Then** it still works without credentials and the **8-field canonical hash remains intact** (`usuario_id` stays out of the hash).

[⬆ Back to top](#-backlog-autentication-with-google--agrotrace-rural)

---

### 📌 Technical tasks (not user stories)

**Google Cloud Console (manual):**
- [x] OAuth consent screen (testing mode) + "Web application" Client ID with authorized origins `http://localhost:3000` and `https://frontend-2mx1.vercel.app`. *(Vercel origin verified in production; `http://localhost:3000` still pending confirmation in local testing)*

**Backend (`backend/`):**
- [x] `Usuario` model (`google_sub` unique, email, name, photo, national ID, phone, farm, municipality) + `usuario_id` FK on `lotes`.
- [x] Alembic migration `0002_usuarios`.
- [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` in `core/config.py`, `.env.example` and `render.yaml`.
- [x] `services/auth.py`: ID token verification with `google-auth` + own JWT with PyJWT (~30 days expiry).
- [x] `api/auth.py` router: `POST /api/auth/google`, `GET /api/auth/me`, `PUT /api/auth/me`.
- [x] `require_productor` in `api/deps.py`; `POST /api/lotes` switches from `X-API-Key` to Google session (events/anchor/verify keep the key).
- [x] Tests: mocked Google token, `401` without session, profile-completion flow.

**Frontend (`frontend/`):**
- [x] `lib/auth.ts` (JWT in `localStorage`, expiry check) and `lib/api.ts` (`Authorization: Bearer` header, `loginConGoogle`, `obtenerYo`, `actualizarPerfil`).
- [x] `/login` page with Google Identity Services button (popup).
- [x] `/productor/completar` page (5-field form).
- [x] Client-side guard on `/productor/*` → redirect to `/login`.
- [x] `Nav.tsx`: "Sign in" / avatar + "Sign out"; "demo" session when the backend is down.

**Environment and deployment:**
- [x] Render: `GOOGLE_CLIENT_ID` + `AUTH_SECRET` set in the dashboard; `GOOGLE_CLIENT_SECRET` intentionally left empty (the popup does not use the secret).
- [x] Vercel: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + **redeploy** (inlined at build time).

**Verification:**
- [x] `.venv/bin/python -m pytest -q` (71 tests) · `npm run lint` · `npm run build`.
- [x] ⚠️ **Do not touch** `CAMPOS_LOTE` in `app/services/sha256.py` nor `frontend/lib/hash.ts` (HU-03 hash parity).

**Note on HU-01:** its Scenario 1 already assumes "the farmer has signed in"; with this feature that precondition stops being fictional and becomes mandatory. No rewrite needed, just keep it in mind.

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-06 Entrada com Google](#-hu-06-entrada-do-produtor-com-google) · [HU-07 Dados do primeiro acesso](#-hu-07-registro-de-dados-do-produtor-no-primeiro-acesso) · [HU-08 Lotes autenticados](#-hu-08-registro-de-lotes-com-sessão-de-produtor) · [Tarefas técnicas](#-tarefas-técnicas)

---

### 📌 HU-06: Entrada do produtor com Google

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor agrícola, **quero** entrar com a minha conta do Google para acessar a área do produtor, **para** não precisar criar nem lembrar outra senha.

#### 🧪 Critérios de aceitação (HU-06) — Dado / Quando / Então

- **Cenário 1: Primeiro acesso com Google.**
  - **Dado** que um produtor novo visita `/login`,
  - **Quando** clica em "Continuar com Google" e escolhe sua conta no popup,
  - **Então** o backend verifica o ID token com o Google, cria seu registro na tabela `usuarios`, devolve um JWT e o navegador o redireciona para `/productor/completar`.
- **Cenário 2: Acesso de produtor com perfil já completo.**
  - **Dado** que o produtor completou seus dados em um acesso anterior,
  - **Quando** entra com o Google,
  - **Então** o sistema o redireciona diretamente para `/productor` (Meus lotes) sem pedir nenhuma informação adicional.
- **Cenário 3: Acesso sem sessão à área do produtor.**
  - **Dado** que um visitante digita `/productor` ou `/productor/nuevo` sem ter iniciado sessão,
  - **Quando** a página detecta que não há token válido,
  - **Então** o redireciona para `/login` e não exibe o conteúdo protegido.
- **Cenário 4: Sessão expirada.**
  - **Dado** que o JWT do produtor já venceu,
  - **Quando** tenta continuar navegando,
  - **Então** o sistema limpa a sessão local e o envia para `/login`.
- **Cenário 5: Encerramento de sessão.**
  - **Dado** que o produtor está autenticado,
  - **Quando** clica em "Sair" na navegação,
  - **Então** o token é removido do navegador e ele volta à página pública.

[⬆ Voltar ao topo](#-backlog-autenticação-com-google--agrotrace-rural)

---

### 📌 HU-07: Registro de dados do produtor no primeiro acesso

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor, **quero** completar meus dados pessoais e da fazenda na primeira vez que entro, **para** que a plataforma registre quem é o dono dos lotes que publicar.

#### 🧪 Critérios de aceitação (HU-07) — Dado / Quando / Então

- **Cenário 1: Formulário de boas-vindas no primeiro acesso.**
  - **Dado** que o produtor se autentica pela primeira vez com o Google,
  - **Quando** o backend responde `perfil_completo: false` e o navegador abre `/productor/completar`,
  - **Então** o sistema exibe um formulário com 5 campos obrigatórios — **nome completo, cédula, telefone, nome da fazenda e município** — com o e-mail e a foto do Google pré-carregados como referência.
- **Cenário 2: Gravação bem-sucedida dos dados.**
  - **Dado** que o produtor preenche os 5 campos,
  - **Quando** clica em "Salvar meus dados",
  - **Então** o backend os persiste junto ao seu `google_sub`, marca o perfil como completo e o redireciona para `/productor`.
- **Cenário 3: Tentativa de salvar com campos vazios.**
  - **Dado** que o formulário tem campos sem preencher,
  - **Quando** o produtor tenta salvar,
  - **Então** o sistema bloqueia o envio e destaca os campos obrigatórios faltantes.
- **Cenário 4: Acesso posterior.**
  - **Dado** que o perfil do produtor já está completo,
  - **Quando** entra novamente com o Google,
  - **Então** nenhum dado é solicitado de novo.

[⬆ Voltar ao topo](#-backlog-autenticação-com-google--agrotrace-rural)

---

### 📌 HU-08: Registro de lotes com sessão de produtor

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🔄 **Evolução da HU-01**

> **Como** responsável pela AgroTrace, **quero** que o registro de lotes exija a sessão do produtor e fique vinculada à sua identidade, **para** que ninguém anônimo crie lotes e cada lote tenha um responsável claro.

#### 🧪 Critérios de aceitação (HU-08) — Dado / Quando / Então

- **Cenário 1: Registro autenticado de lote.**
  - **Dado** que o produtor tem sessão válida e abre `/productor/nuevo`,
  - **Quando** preenche o formulário e salva,
  - **Então** o backend aceita a requisição com o JWT (não mais com `X-API-Key`), cria o lote com seu `usuario_id` e confirma o registro com seu código `HUE-YYYY-NNN`.
- **Cenário 2: Tentativa de registro sem sessão.**
  - **Dado** que um visitante ou um script chama `POST /api/lotes` sem token de produtor,
  - **Quando** o backend processa a requisição,
  - **Então** responde `401` e nenhum lote é criado; no navegador, o usuário é redirecionado para `/login`.
- **Cenário 3: "Meus lotes" mostra apenas os do próprio produtor.**
  - **Dado** que existem lotes registrados por vários produtores,
  - **Quando** um produtor entra em `/productor`,
  - **Então** a lista mostra somente os lotes associados à sua identidade.
- **Cenário 4: A verificação pública não muda (HU-02 / HU-03).**
  - **Dado** que um consumidor escaneia um QR,
  - **Quando** consulta a ficha pública e verifica a integridade on-chain,
  - **Então** continua funcionando sem credenciais e o **hash canônico de 8 campos permanece intacto** (o `usuario_id` fica fora do hash).

[⬆ Voltar ao topo](#-backlog-autenticação-com-google--agrotrace-rural)

---

### 📌 Tarefas técnicas (não são HU)

**Google Cloud Console (manual):**
- [x] Tela de consentimento OAuth (modo testing) + Client ID "Web application" com origens autorizadas `http://localhost:3000` e `https://frontend-2mx1.vercel.app`. *(origem do Vercel verificada em produção; `http://localhost:3000` pendente de confirmação no teste local)*

**Backend (`backend/`):**
- [x] Modelo `Usuario` (`google_sub` único, email, nome, foto_url, cédula, telefone, fazenda, município) + FK `usuario_id` em `lotes`.
- [x] Migração Alembic `0002_usuarios`.
- [x] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` em `core/config.py`, `.env.example` e `render.yaml`.
- [x] `services/auth.py`: verificação do ID token com `google-auth` + JWT próprio com PyJWT (exp ~30 dias).
- [x] Router `api/auth.py`: `POST /api/auth/google`, `GET /api/auth/me`, `PUT /api/auth/me`.
- [x] `require_productor` em `api/deps.py`; `POST /api/lotes` passa de `X-API-Key` para sessão Google (eventos/âncora/verify mantêm a chave).
- [x] Testes: token Google simulado, `401` sem sessão, fluxo de completar perfil.

**Frontend (`frontend/`):**
- [x] `lib/auth.ts` (JWT em `localStorage`, detecção de expiração) e `lib/api.ts` (header `Authorization: Bearer`, `loginConGoogle`, `obtenerYo`, `actualizarPerfil`).
- [x] Página `/login` com botão do Google Identity Services (popup).
- [x] Página `/productor/completar` (formulário de 5 campos).
- [x] Guard client-side em `/productor/*` → redireciona para `/login`.
- [x] `Nav.tsx`: "Entrar" / avatar + "Sair"; sessão "demo" quando o backend está fora do ar.

**Variáveis e implantação:**
- [x] Render: `GOOGLE_CLIENT_ID` + `AUTH_SECRET` definidos no painel; `GOOGLE_CLIENT_SECRET` mantido vazio de propósito (o popup não usa o secret).
- [x] Vercel: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + **redeploy** (embutido no build).

**Verificação:**
- [x] `.venv/bin/python -m pytest -q` (71 testes) · `npm run lint` · `npm run build`.
- [x] ⚠️ **Não tocar** em `CAMPOS_LOTE` de `app/services/sha256.py` nem em `frontend/lib/hash.ts` (paridade do hash da HU-03).

**Nota sobre a HU-01:** seu Cenário 1 já pressupõe "o produtor iniciou sessão"; com esta feature a pré-condição deixa de ser fictória e passa a ser obrigatória. Não precisa reescrever a HU, apenas tê-la em mente.
