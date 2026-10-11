# 🖥️ Documentación del frontend (MVP)

> **Proyecto:** AgroTrace Rural · **Carpeta:** `frontend/` (Next.js 14 · App Router · TypeScript · Tailwind) · **Deploy:** Vercel

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [🗺️ 1. Rutas](#-1-mapas-de-rutas-y-historias) · [🧠 2. Capa de datos](#-2-capa-de-datos-modo-backend-o-demo) · [🔐 3. Hash y verificación](#-3-hash-sha-256-y-verificación-on-chain) · [🧱 4. Componentes](#-4-componentes) · [⚙️ 5. Env y deploy](#-5-variables-de-entorno-y-despliegue-en-vercel)

---

### 🗺️ 1. Mapas de rutas y historias

| Ruta | Historia | Qué hace |
| :--- | :--- | :--- |
| `/` | — | Landing con el flujo de trazabilidad (pasos 1–4) |
| `/productor` | HU-01 · HU-05 | Lista de lotes registrados con acceso a página pública y QR |
| `/productor/nuevo` | HU-01 | Formulario de registro: fecha, línea, cantidad y **foto obligatoria**; bloquea el guardado sin evidencia |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Página pública: origen, fotos, botón "Verificar integridad" e historial cronológico |
| `/lote/[id]/etiqueta` | HU-04 | Etiqueta imprimible con QR único por cubeta (`window.print()`) |
| `/lote/NOEXISTE` | HU-02 (esc. 2) | Pantalla de alerta "Lote no encontrado / código no auténtico" |

---

### 🧠 2. Capa de datos (¿modo backend o demo?)

Todas las pantallas hablan con `lib/api.ts`, que decide la fuente:

- **Con backend:** si existe `NEXT_PUBLIC_API_URL`, hace `fetch` al FastAPI (`/api/lotes`, `/api/lotes/{id}`, `/api/verify/{id}`) — reescrito por `vercel.json` con `BACKEND_URL`.
- **Modo demo (por defecto):** si el backend no responde o no está configurado, usa `lib/demoStore.ts` con datos de ejemplo persistidos en `localStorage`. El lote semilla `HUE-2027-001` (Finca Guarumo, Cáceres) aparece automáticamente.

Esto permite desplegar el frontend en Vercel **sin backend** y recorrer todo el flujo HU-01→HU-05 en el navegador.

---

### 🔐 3. Hash SHA-256 y verificación on-chain

`lib/hash.ts` implementa la misma convención que el backend:

1. **JSON canónico:** claves ordenadas alfabéticamente, sin `undefined` (`canonicalJson`).
2. **SHA-256** con Web Crypto (`crypto.subtle.digest`) → hex de 64 caracteres.
3. El payload hasheado incluye `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio, evidencias[{nombre,tamano}]` — **nunca los bytes de la foto** (regla de oro: archivos pesados fuera de la blockchain).

**HU-03:** el botón "Verificar ahora" recalcula el hash desde los datos actuales y lo compara con el registrado. Coincide → insignia verde + `tx_hash` enlazado a Horizon Testnet. No coincide → alerta roja de alteración.

---

### 🧱 4. Componentes

| Componente | Rol |
| :--- | :--- |
| `Nav` / `Footer` | Navegación responsive y pie de página |
| `VerificarIntegridad` | Cliente (HU-03): estado idle → verificando → ok/error |
| `Timeline` | Historial cronológico numerado (HU-05) |
| `qrcode.react` (`QRCodeSVG`) | Generación del QR de la etiqueta (HU-04) |

---

### ⚙️ 5. Variables de entorno y despliegue en Vercel

`frontend/.env.example`:

```bash
NEXT_PUBLIC_API_URL=   # URL del backend FastAPI (vacío = modo demo)
BACKEND_URL=           # solo en Vercel: destino del rewrite /api/*
NEXT_PUBLIC_SITE_URL=  # URL pública (base del QR)
```

**Pasos en Vercel:** Importar repo → **Root Directory: `frontend`** → Framework: Next.js (auto) → agregar env vars → Deploy. Cada PR genera un preview.

[⬆ Volver al inicio](#-documentación-del-frontend-mvp)

---

## 🇺🇸 English

📑 **Contents:** [🗺️ 1. Routes](#-1-routes-and-stories-map) · [🧠 2. Data layer](#-2-data-layer-backend-or-demo-mode) · [🔐 3. Hash and verification](#-3-sha-256-hash-and-on-chain-verification) · [🧱 4. Components](#-4-components) · [⚙️ 5. Env and deploy](#-5-environment-variables-and-vercel-deployment)

---

### 🗺️ 1. Routes and stories map

| Route | Story | What it does |
| :--- | :--- | :--- |
| `/` | — | Landing page with the traceability flow (steps 1–4) |
| `/productor` | HU-01 · HU-05 | List of registered batches with links to the public page and QR |
| `/productor/nuevo` | HU-01 | Registration form: date, line, quantity and **mandatory photo**; blocks saving without evidence |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Public page: origin, photos, "Verify integrity" button and chronological history |
| `/lote/[id]/etiqueta` | HU-04 | Printable label with a unique QR per crate (`window.print()`) |
| `/lote/NOEXISTE` | HU-02 (sc. 2) | "Batch not found / code not authentic" alert screen |

---

### 🧠 2. Data layer (backend or demo mode?)

Every screen talks to `lib/api.ts`, which chooses the source:

- **With backend:** if `NEXT_PUBLIC_API_URL` exists, it `fetch`es FastAPI (`/api/lotes`, `/api/lotes/{id}`, `/api/verify/{id}`) — rewritten by `vercel.json` using `BACKEND_URL`.
- **Demo mode (default):** if the backend is missing or unreachable, it uses `lib/demoStore.ts` with sample data persisted in `localStorage`. The seed batch `HUE-2027-001` (Finca Guarumo, Cáceres) appears automatically.

This lets the frontend deploy to Vercel **without a backend** while covering the whole HU-01→HU-05 flow in the browser.

---

### 🔐 3. SHA-256 hash and on-chain verification

`lib/hash.ts` implements the same convention as the backend:

1. **Canonical JSON:** keys sorted alphabetically, no `undefined` (`canonicalJson`).
2. **SHA-256** via Web Crypto (`crypto.subtle.digest`) → 64-char hex.
3. The hashed payload includes `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio, evidencias[{nombre,tamano}]` — **never the photo bytes** (golden rule: heavy files stay off-chain).

**HU-03:** the "Verify now" button recomputes the hash from current data and compares it with the registered one. Match → green badge + `tx_hash` linked to Horizon Testnet. Mismatch → red tamper alert.

---

### 🧱 4. Components

| Component | Role |
| :--- | :--- |
| `Nav` / `Footer` | Responsive navigation and page footer |
| `VerificarIntegridad` | Client (HU-03): idle → verifying → ok/error states |
| `Timeline` | Numbered chronological history (HU-05) |
| `qrcode.react` (`QRCodeSVG`) | Label QR generation (HU-04) |

---

### ⚙️ 5. Environment variables and Vercel deployment

`frontend/.env.example`:

```bash
NEXT_PUBLIC_API_URL=   # FastAPI backend URL (empty = demo mode)
BACKEND_URL=           # Vercel only: target of the /api/* rewrite
NEXT_PUBLIC_SITE_URL=  # Public URL (QR base)
```

**Vercel steps:** import repo → **Root Directory: `frontend`** → Framework: Next.js (auto) → add env vars → Deploy. Every PR generates a preview.

[⬆ Back to top](#-documentación-del-frontend-mvp)

---

## 🇧🇷 Português

📑 **Conteúdo:** [🗺️ 1. Rotas](#-1-mapa-de-rotas-e-histórias) · [🧠 2. Camada de dados](#-2-camada-de-dados-modo-backend-ou-demo) · [🔐 3. Hash e verificação](#-3-hash-sha-256-e-verificação-on-chain) · [🧱 4. Componentes](#-4-componentes) · [⚙️ 5. Env e deploy](#-5-variáveis-de-ambiente-e-implantação-no-vercel)

---

### 🗺️ 1. Mapa de rotas e histórias

| Rota | História | O que faz |
| :--- | :--- | :--- |
| `/` | — | Landing com o fluxo de rastreabilidade (etapas 1–4) |
| `/productor` | HU-01 · HU-05 | Lista de lotes registrados com acesso à página pública e QR |
| `/productor/nuevo` | HU-01 | Formulário de registro: data, linha, quantidade e **foto obrigatória**; bloqueia o salvamento sem evidência |
| `/lote/[id]` | HU-02 · HU-03 · HU-05 | Página pública: origem, fotos, botão "Verificar integridade" e histórico cronológico |
| `/lote/[id]/etiqueta` | HU-04 | Etiqueta imprimível com QR único por caixa (`window.print()`) |
| `/lote/NOEXISTE` | HU-02 (esc. 2) | Tela de alerta "Lote não encontrado / código não autêntico" |

---

### 🧠 2. Camada de dados (modo backend ou demo?)

Todas as telas falam com `lib/api.ts`, que escolhe a fonte:

- **Com backend:** se existir `NEXT_PUBLIC_API_URL`, faz `fetch` ao FastAPI (`/api/lotes`, `/api/lotes/{id}`, `/api/verify/{id}`) — reescrito pelo `vercel.json` com `BACKEND_URL`.
- **Modo demo (padrão):** se o backend não responde ou não está configurado, usa `lib/demoStore.ts` com dados de exemplo persistidos em `localStorage`. O lote semente `HUE-2027-001` (Finca Guarumo, Cáceres) aparece automaticamente.

Isso permite implantar o frontend no Vercel **sem backend** e percorrer todo o fluxo HU-01→HU-05 no navegador.

---

### 🔐 3. Hash SHA-256 e verificação on-chain

`lib/hash.ts` implementa a mesma convenção do backend:

1. **JSON canônico:** chaves ordenadas alfabeticamente, sem `undefined` (`canonicalJson`).
2. **SHA-256** com Web Crypto (`crypto.subtle.digest`) → hex de 64 caracteres.
3. O payload hasheado inclui `codigo, fecha_cosecha, linea_productiva, cantidad, unidad, finca, municipio, evidencias[{nombre,tamano}]` — **nunca os bytes da foto** (regra de ouro: arquivos pesados fora da blockchain).

**HU-03:** o botão "Verificar agora" recalcula o hash dos dados atuais e compara com o registrado. Coincide → selo verde + `tx_hash` com link para o Horizon Testnet. Não coincide → alerta vermelho de adulteração.

---

### 🧱 4. Componentes

| Componente | Papel |
| :--- | :--- |
| `Nav` / `Footer` | Navegação responsiva e rodapé |
| `VerificarIntegridad` | Cliente (HU-03): idle → verificando → ok/erro |
| `Timeline` | Histórico cronológico numerado (HU-05) |
| `qrcode.react` (`QRCodeSVG`) | Geração do QR da etiqueta (HU-04) |

---

### ⚙️ 5. Variáveis de ambiente e implantação no Vercel

`frontend/.env.example`:

```bash
NEXT_PUBLIC_API_URL=   # URL do backend FastAPI (vazio = modo demo)
BACKEND_URL=           # apenas no Vercel: destino do rewrite /api/*
NEXT_PUBLIC_SITE_URL=  # URL pública (base do QR)
```

**Passos no Vercel:** importar repo → **Root Directory: `frontend`** → Framework: Next.js (auto) → adicionar env vars → Deploy. Cada PR gera um preview.

[⬆ Voltar ao topo](#-documentación-del-frontend-mvp)
