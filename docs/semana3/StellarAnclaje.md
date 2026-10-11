# ⚓ Anclaje en Stellar: Diseño y Servicio (MVP)

> **Proyecto:** AgroTrace Rural · **Módulo:** Anclaje de huellas SHA-256 en Stellar Testnet · **Código:** `backend/app/services/stellar.py`
>
> 🌐 **¡App del MVP en línea!** [https://frontend-woad-pi-73.vercel.app](https://frontend-woad-pi-73.vercel.app)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [🔗 1. Diseño](#-1-diseño-del-anclaje) · [🔄 2. Flujo](#-2-flujo-de-anclaje) · [🔑 3. Cuenta](#-3-cuenta-y-fondeo-en-testnet) · [🧩 4. Servicio](#-4-servicio-stellarpy) · [🛠️ 5. Scripts](#-5-scripts-cli) · [🔐 6. Variables](#-6-variables-de-entorno) · [✅ 7. Verificación](#-7-verificación-on-chain) · [🧪 8. Tests](#-8-tests)

---

### 🔗 1. Diseño del anclaje

El MVP **no usa contratos inteligentes**. Siguiendo `docs/semana2/ProductBlueprint.md` §8, la huella SHA-256 de cada lote se registra en el campo **Memo Hash (32 bytes)** de una transacción normal en **Stellar Testnet**.

**Opción de contratos (A o B):**

| Opción | Qué es | Estado |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes en Stellar (Soroban) | Descartada para el MVP |
| **B** | Transacción clásica + Memo Hash (32 bytes) | ✅ **Elegida** |

*Por qué elegimos la Opción B:* el MVP solo necesita probar que la huella existió (sin lógica on-chain); cuesta ≈ 0,00001 XLM por lote y no exige mantener un contrato Rust/Wasm. *Por qué no la Opción A todavía:* un contrato sería sobreingeniería hasta que existan reglas de negocio automáticas (ver `StellarContratos.md` §3–4). **Fotos y videos jamás van en blockchain** — solo el hash.

| Componente | Decisión |
| :--- | :--- |
| Red | Stellar **Testnet** (`Test SDF Network ; September 2015`) |
| Transacción | Pago de 1 stroop de XLM a la misma cuenta (op mínima) |
| Memo | `MEMO_HASH` con los 32 bytes del SHA-256 del lote |
| Firmante | Cuenta de la Finca Guarumo (`STELLAR_SECRET_KEY`) |
| Regla de oro | **Fotos/videos nunca van en blockchain** — solo el hash |

---

### 🔄 2. Flujo de anclaje

1. El backend calcula el hash del lote: `hash_lote(datos_lote, fotos)` (JSON canónico → SHA-256).
2. `anchor_hash(lote_id, hash_hex)` valida que sean 32 bytes y arma la transacción.
3. Si la cuenta no tiene saldo, **Friendbot** la fondea automáticamente.
4. Envío a Horizon; ante `tx_too_late` / `tx_bad_seq` reintenta (máx. 3 intentos).
5. Se guarda en la base de datos el `tx_hash` y el `ledger` del lote.
6. El consumidor verifica con `verify_anchor(tx_hash, hash_hex)`.

---

### 🔑 3. Cuenta y fondeo en Testnet

```bash
cd backend
python -m scripts.stellar_account create   # genera claves + fondea con Friendbot
python -m scripts.stellar_account show     # muestra saldo
```

`create` imprime `STELLAR_PUBLIC_KEY` y `STELLAR_SECRET_KEY` para guardarlas en `backend/.env` (nunca subirlas al repositorio).

---

### 🧩 4. Servicio `stellar.py`

| Función | Responsabilidad |
| :--- | :--- |
| `get_server()` | Cliente Horizon (`HORIZON_URL`) |
| `load_keypair()` | Carga la clave secreta desde la configuración |
| `ensure_funded()` | Fondea con Friendbot si la cuenta no existe |
| `anchor_hash()` | Construye, firma y envía la transacción con Memo Hash; reintenta ante errores transitorios |
| `verify_anchor()` | Consulta la transacción en Horizon y compara el memo decodificado (base64) con el hash esperado |

Errores propios: `StellarError` (hash inválido, transacción rechazada, cuenta sin clave, etc.).

---

### 🛠️ 5. Scripts CLI

```bash
cd backend
python -m scripts.anchor_demo    # HUE-2027-001: hash → ancla → verifica (Testnet real)
```

Salida esperada:

```text
SHA-256 : cf1adb06...
Anclado : tx=fa454397... ledger=5133158
Verificación on-chain: VERIFICADO
```

---

### 🔐 6. Variables de entorno

```bash
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PUBLIC_KEY=G...
STELLAR_SECRET_KEY=S...
```

---

### ✅ 7. Verificación on-chain

`POST /api/verify` con `{"tx_hash", "hash_hex"}` devuelve:

```json
{"verified": true, "memo_match": true, "successful": true, "ledger": 5133158}
```

Horizon entrega los memos hash en **base64**; el servicio los decodifica y compara byte a byte con el hash recalculado — así se detecta cualquier alteración posterior de los datos del lote.

---

### 🧪 8. Tests

```bash
cd backend
python -m pytest tests/ -v
```

- `test_sha256.py`: determinismo, orden independiente de claves, sensibilidad a cambios.
- `test_stellar.py`: memo de 32 bytes, anclaje con Horizon mockeado, casos de verificación (ok / memo distinto / tx inexistente).

[⬆ Volver al inicio](#-anclaje-en-stellar-diseño-y-servicio-mvp)

---

## 🇺🇸 English

📑 **Contents:** [🔗 1. Design](#-1-anchoring-design) · [🔄 2. Flow](#-2-anchoring-flow) · [🔑 3. Account](#-3-account-and-testnet-funding) · [🧩 4. Service](#-4-stellarpy-service) · [🛠️ 5. Scripts](#-5-cli-scripts) · [🔐 6. Env vars](#-6-environment-variables) · [✅ 7. Verification](#-7-on-chain-verification) · [🧪 8. Tests](#-8-tests)

---

### 🔗 1. Anchoring design

The MVP **does not use smart contracts**. Following `docs/semana2/ProductBlueprint.md` §8, each batch's SHA-256 fingerprint is recorded in the **Memo Hash field (32 bytes)** of a regular transaction on **Stellar Testnet**.

**Contract option (A or B):**

| Option | What it is | Status |
| :--- | :--- | :--- |
| **A** | Smart contracts on Stellar (Soroban) | Discarded for the MVP |
| **B** | Classic transaction + Memo Hash (32 bytes) | ✅ **Chosen** |

*Why we chose Option B:* the MVP only needs to prove the fingerprint existed (no on-chain logic); it costs ≈ 0.00001 XLM per batch and requires no Rust/Wasm contract maintenance. *Why not Option A yet:* a contract would be over-engineering until automatic business rules exist (see `StellarContratos.md` §3–4). **Photos and videos never go on blockchain** — only the hash.

| Component | Decision |
| :--- | :--- |
| Network | Stellar **Testnet** (`Test SDF Network ; September 2015`) |
| Transaction | Payment of 1 stroop of XLM to the same account (minimal operation) |
| Memo | `MEMO_HASH` carrying the batch's 32-byte SHA-256 |
| Signer | Finca Guarumo account (`STELLAR_SECRET_KEY`) |
| Golden rule | **Photos/videos never go on blockchain** — only the hash |

---

### 🔄 2. Anchoring flow

1. The backend computes the batch hash: `hash_lote(batch_data, photos)` (canonical JSON → SHA-256).
2. `anchor_hash(batch_id, hash_hex)` validates the 32 bytes and builds the transaction.
3. If the account has no balance, **Friendbot** funds it automatically.
4. Submission to Horizon; on `tx_too_late` / `tx_bad_seq` it retries (max 3 attempts).
5. The `tx_hash` and `ledger` are stored for the batch.
6. The consumer verifies with `verify_anchor(tx_hash, hash_hex)`.

---

### 🔑 3. Account and Testnet funding

```bash
cd backend
python -m scripts.stellar_account create   # generates keys + funds via Friendbot
python -m scripts.stellar_account show     # shows balance
```

`create` prints `STELLAR_PUBLIC_KEY` and `STELLAR_SECRET_KEY` to store in `backend/.env` (never commit them).

---

### 🧩 4. `stellar.py` service

| Function | Responsibility |
| :--- | :--- |
| `get_server()` | Horizon client (`HORIZON_URL`) |
| `load_keypair()` | Loads the secret key from settings |
| `ensure_funded()` | Funds via Friendbot if the account does not exist |
| `anchor_hash()` | Builds, signs and submits the Memo Hash transaction; retries on transient errors |
| `verify_anchor()` | Fetches the transaction from Horizon and compares the decoded (base64) memo against the expected hash |

Custom error: `StellarError`.

---

### 🛠️ 5. CLI scripts

```bash
cd backend
python -m scripts.anchor_demo    # HUE-2027-001: hash → anchor → verify (real Testnet)
```

Expected output:

```text
SHA-256 : cf1adb06...
Anclado : tx=fa454397... ledger=5133158
Verificación on-chain: VERIFICADO
```

---

### 🔐 6. Environment variables

```bash
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PUBLIC_KEY=G...
STELLAR_SECRET_KEY=S...
```

---

### ✅ 7. On-chain verification

`POST /api/verify` with `{"tx_hash", "hash_hex"}` returns:

```json
{"verified": true, "memo_match": true, "successful": true, "ledger": 5133158}
```

Horizon returns hash memos as **base64**; the service decodes them and compares byte by byte with the recomputed hash — detecting any later modification of the batch data.

---

### 🧪 8. Tests

```bash
cd backend
python -m pytest tests/ -v
```

- `test_sha256.py`: determinism, key-order independence, change sensitivity.
- `test_stellar.py`: 32-byte memo, anchoring with mocked Horizon, verification cases (ok / mismatched memo / missing tx).

[⬆ Back to top](#-anclaje-en-stellar-diseño-y-servicio-mvp)

---

## 🇧🇷 Português

📑 **Conteúdo:** [🔗 1. Design](#-1-design-da-ancoragem) · [🔄 2. Fluxo](#-2-fluxo-de-ancoragem) · [🔑 3. Conta](#-3-conta-e-financiamento-na-testnet) · [🧩 4. Serviço](#-4-serviço-stellarpy) · [🛠️ 5. Scripts](#-5-scripts-cli) · [🔐 6. Variáveis](#-6-variáveis-de-ambiente) · [✅ 7. Verificação](#-7-verificação-on-chain) · [🧪 8. Testes](#-8-testes)

---

### 🔗 1. Design da ancoragem

O MVP **não usa contratos inteligentes**. Seguindo `docs/semana2/ProductBlueprint.md` §8, a impressão digital SHA-256 de cada lote é registrada no campo **Memo Hash (32 bytes)** de uma transação normal na **Stellar Testnet**.

**Opção de contratos (A ou B):**

| Opção | O que é | Status |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes na Stellar (Soroban) | Descartada para o MVP |
| **B** | Transação clássica + Memo Hash (32 bytes) | ✅ **Escolhida** |

*Por que escolhemos a Opção B:* o MVP só precisa provar que a impressão existiu (sem lógica on-chain); custa ≈ 0,00001 XLM por lote e não exige manter um contrato Rust/Wasm. *Por que não a Opção A ainda:* um contrato seria superengenharia até existirem regras de negócio automáticas (ver `StellarContratos.md` §3–4). **Fotos e vídeos nunca vão para a blockchain** — apenas o hash.

| Componente | Decisão |
| :--- | :--- |
| Rede | Stellar **Testnet** (`Test SDF Network ; September 2015`) |
| Transação | Pagamento de 1 stroop de XLM para a mesma conta (operação mínima) |
| Memo | `MEMO_HASH` com os 32 bytes do SHA-256 do lote |
| Assinante | Conta da Finca Guarumo (`STELLAR_SECRET_KEY`) |
| Regra de ouro | **Fotos/vídeos nunca vão para a blockchain** — apenas o hash |

---

### 🔄 2. Fluxo de ancoragem

1. O backend calcula o hash do lote: `hash_lote(dados_lote, fotos)` (JSON canônico → SHA-256).
2. `anchor_hash(lote_id, hash_hex)` valida os 32 bytes e monta a transação.
3. Se a conta não tem saldo, o **Friendbot** a financia automaticamente.
4. Envio ao Horizon; em `tx_too_late` / `tx_bad_seq` tenta novamente (máx. 3 tentativas).
5. O `tx_hash` e o `ledger` são gravados para o lote.
6. O consumidor verifica com `verify_anchor(tx_hash, hash_hex)`.

---

### 🔑 3. Conta e financiamento na Testnet

```bash
cd backend
python -m scripts.stellar_account create   # gera chaves + financia via Friendbot
python -m scripts.stellar_account show     # mostra saldo
```

`create` imprime `STELLAR_PUBLIC_KEY` e `STELLAR_SECRET_KEY` para guardar em `backend/.env` (nunca subir ao repositório).

---

### 🧩 4. Serviço `stellar.py`

| Função | Responsabilidade |
| :--- | :--- |
| `get_server()` | Cliente Horizon (`HORIZON_URL`) |
| `load_keypair()` | Carrega a chave secreta das configurações |
| `ensure_funded()` | Financia via Friendbot se a conta não existir |
| `anchor_hash()` | Constrói, assina e envia a transação com Memo Hash; repete em erros transitórios |
| `verify_anchor()` | Consulta a transação no Horizon e compara o memo decodificado (base64) com o hash esperado |

Erro próprio: `StellarError`.

---

### 🛠️ 5. Scripts CLI

```bash
cd backend
python -m scripts.anchor_demo    # HUE-2027-001: hash → ancora → verifica (Testnet real)
```

Saída esperada:

```text
SHA-256 : cf1adb06...
Anclado : tx=fa454397... ledger=5133158
Verificación on-chain: VERIFICADO
```

---

### 🔐 6. Variáveis de ambiente

```bash
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PUBLIC_KEY=G...
STELLAR_SECRET_KEY=S...
```

---

### ✅ 7. Verificação on-chain

`POST /api/verify` com `{"tx_hash", "hash_hex"}` retorna:

```json
{"verified": true, "memo_match": true, "successful": true, "ledger": 5133158}
```

O Horizon devolve memos hash em **base64**; o serviço os decodifica e compara byte a byte com o hash recalculado — detectando qualquer alteração posterior dos dados do lote.

---

### 🧪 8. Testes

```bash
cd backend
python -m pytest tests/ -v
```

- `test_sha256.py`: determinismo, independência da ordem das chaves, sensibilidade a mudanças.
- `test_stellar.py`: memo de 32 bytes, ancoragem com Horizon simulado, casos de verificação (ok / memo diferente / tx inexistente).

[⬆ Voltar ao topo](#-anclaje-en-stellar-diseño-y-servicio-mvp)
