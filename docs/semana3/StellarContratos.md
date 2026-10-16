# ⚓ Contratos inteligentes en Stellar: ventajas del ecosistema

> **Proyecto:** AgroTrace Rural · **Tema:** por qué usar las herramientas del ecosistema Stellar para contratos (Soroban / Stellar Smart Contracts)
>
> 🌐 **¡App del MVP en línea!** [https://frontend-2mx1.vercel.app](https://frontend-2mx1.vercel.app)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [🧩 1. Qué ofrece](#-1-qué-ofrece-el-ecosistema-stellar) · [✅ 2. Ventajas](#-2-ventajas-de-usar-el-ecosistema) · [🥚 3. Caso AgroTrace](#-3-caso-agrotrace-rural) · [🚀 4. Escalación](#-4-ruta-de-escalación)

---

### 🧩 1. Qué ofrece el ecosistema Stellar

Los **Stellar Smart Contracts (antes Soroban)** son la plataforma de contratos inteligentes integrada en la propia red Stellar — no son una cadena nueva. Un contrato es un programa pequeño escrito en **Rust** y compilado a **WebAssembly (Wasm)**. El ecosistema entrega herramientas oficiales listas para usar:

| Herramienta | Para qué sirve |
| :--- | :--- |
| **Soroban SDK (Rust)** | Escribir, probar y depurar contratos; entorno local idéntico al on-chain |
| **Stellar CLI (`stellar`)** | `stellar contract build/invoke/deploy`, red local, cuentas Testnet |
| **Soroban RPC** | Invocar contratos, simular transacciones y leer eventos desde apps |
| **Local Network / Sandbox** | Red local para desarrollo sin gastar en Testnet/Mainnet |
| **stellar-sdk (JS/Python)** | Conectar tu backend o frontend (FastAPI / Next.js) a la red |
| **Freighter** | Billetera navegador para firmar operaciones de contrato |

---

### ✅ 2. Ventajas de usar el ecosistema

1. **Costos bajos y predecibles.** El modelo de recursos cobra por CPU, lecturas/escrituras de ledger y bytes — con límites fijados por protocolo. `simulateTransaction` devuelve el consumo exacto *antes* de firmar.
2. **Finalidad rápida (~5 segundos).** Ideal para el punto de venta rural: el consumidor ve el resultado casi de inmediato.
3. **Seguridad por diseño (Rust + Wasm).** Rust elimina clases enteras de bugs (memoria, hilos) antes de compilar; Wasm acota lo que un contrato puede ejecutar.
4. **Herramientas oficiales y testing local.** SDK con modo de prueba local idéntico al host on-chain: unit tests y fuzzing sin gastar XLM.
5. **Modelo de almacenamiento con rent.** Datos persistentes/temporales con TTL y precios dinámicos: evita el "state bloat" que encarece otras redes.
6. **Interoperabilidad nativa.** Los contratos ven las cuentas Stellar y los activos nativos (USDC, por ejemplo) vía Stellar Asset Contract — reutilizas billeteras, anchors y DEX existentes.
7. **Bajo consumo energético.** Consensus Protocol de Stellar (~5 s, ~150 TPS en vivo) no usa proof-of-work.
8. **Identidad flexible.** Firmas passkey (secp256r1) permiten autenticación biométrica desde el celular.

---

### 🥚 3. Caso AgroTrace Rural

**Opción de contratos (A o B):**

| Opción | Qué es | Estado |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes (Soroban) | Postergada |
| **B** | Transacción clásica + Memo Hash (32 bytes) | ✅ **Elegida para el MVP** |

**Hoy el MVP usa la ruta mínima correcta (Opción B):** *transacción clásica + Memo Hash (32 bytes)* con `stellar-sdk`. No necesita contrato. **Cuándo sí conviene un contrato (Opción A):**

- Reglas de negocio automáticas (ej.: un lote no puede recibir más eventos tras su despacho).
- Pagos o regalías automáticas entre productor y distribuidor.
- Certificados revocables / estados on-chain (activo, agotado, retirado).
- Tokens de fidelización o representación de cubetas (Stellar Asset Contract).

La misma cuenta, las mismas claves y el mismo `stellar-sdk` sirven para ambas rutas: migrar de memo a contrato es evolutivo, no un reinicio.

---

### 🚀 4. Ruta de escalación

1. **MVP (hoy):** hash en Memo Hash — costo por lote ≈ 0.00001 XLM, cero mantenimiento.
2. **Etapa 2:** contrato `traceability` con función `anchor(batch_id, hash)` y eventos `Anchored` indexables por Horizon/Soroban RPC.
3. **Etapa 3:** activos Stellar por línea productiva (HUvos Guarumo como token) + pagos programados.

[⬆ Volver al inicio](#-contratos-inteligentes-en-stellar-ventajas-del-ecosistema)

---

## 🇺🇸 English

📑 **Contents:** [🧩 1. What the ecosystem offers](#-1-what-the-stellar-ecosystem-offers) · [✅ 2. Advantages](#-2-advantages-of-using-the-ecosystem) · [🥚 3. AgroTrace case](#-3-agrotrace-rural-case) · [🚀 4. Scaling path](#-4-scaling-path)

---

### 🧩 1. What the Stellar ecosystem offers

**Stellar Smart Contracts (formerly Soroban)** are the smart contract platform built into the Stellar network itself — not a separate chain. A contract is a small program written in **Rust** and compiled to **WebAssembly (Wasm)**. The ecosystem ships ready-to-use official tooling:

| Tool | What it is for |
| :--- | :--- |
| **Soroban SDK (Rust)** | Write, test and debug contracts; a local environment identical to on-chain |
| **Stellar CLI (`stellar`)** | `stellar contract build/invoke/deploy`, local network, Testnet accounts |
| **Soroban RPC** | Invoke contracts, simulate transactions and read events from apps |
| **Local Network / Sandbox** | Local network for development without spending Testnet/Mainnet funds |
| **stellar-sdk (JS/Python)** | Connect your backend or frontend (FastAPI / Next.js) to the network |
| **Freighter** | Browser wallet to sign contract operations |

---

### ✅ 2. Advantages of using the ecosystem

1. **Low, predictable costs.** The resource model charges for CPU, ledger reads/writes and bytes — with protocol-fixed limits. `simulateTransaction` returns exact consumption *before* you sign.
2. **Fast finality (~5 seconds).** Ideal at the rural point of sale: the consumer sees the result almost immediately.
3. **Secure by design (Rust + Wasm).** Rust eliminates entire bug classes (memory, threads) before compiling; Wasm constrains what a contract can execute.
4. **Official tooling and local testing.** SDK with a local test mode identical to the on-chain host: unit tests and fuzzing without spending XLM.
5. **Storage rent model.** Persistent/temporary data with TTL and dynamic pricing: prevents the "state bloat" that makes other networks expensive.
6. **Native interoperability.** Contracts see Stellar accounts and native assets (e.g. USDC) through the Stellar Asset Contract — you reuse existing wallets, anchors and DEX.
7. **Low energy use.** Stellar's Consensus Protocol (~5 s, ~150 live TPS) uses no proof-of-work.
8. **Flexible identity.** Passkey signatures (secp256r1) enable biometric authentication from a phone.

---

### 🥚 3. AgroTrace Rural case

**Contract option (A or B):**

| Option | What it is | Status |
| :--- | :--- | :--- |
| **A** | Smart contracts (Soroban) | Postponed |
| **B** | Classic transaction + Memo Hash (32 bytes) | ✅ **Chosen for the MVP** |

**Today the MVP uses the correct minimal path (Option B):** *classic transaction + Memo Hash (32 bytes)* with `stellar-sdk`. No contract needed. **When a contract does make sense (Option A):**

- Automatic business rules (e.g. a batch cannot receive more events after dispatch).
- Automatic payments or royalties between producer and distributor.
- Revocable certificates / on-chain states (active, sold out, recalled).
- Loyalty tokens or representation of crates (Stellar Asset Contract).

The same account, keys and `stellar-sdk` serve both paths: moving from memo to contract is an evolution, not a restart.

---

### 🚀 4. Scaling path

1. **MVP (today):** hash in Memo Hash — cost per batch ≈ 0.00001 XLM, zero maintenance.
2. **Stage 2:** a `traceability` contract with an `anchor(batch_id, hash)` function and indexable `Anchored` events via Horizon/Soroban RPC.
3. **Stage 3:** Stellar assets per production line (Guarumo eggs as a token) + scheduled payments.

[⬆ Back to top](#-contratos-inteligentes-en-stellar-ventajas-del-ecosistema)

---

## 🇧🇷 Português

📑 **Conteúdo:** [🧩 1. O que o ecossistema oferece](#-1-o-que-o-ecossistema-stellar-oferece) · [✅ 2. Vantagens](#-2-vantagens-de-usar-o-ecossistema) · [🥚 3. Caso AgroTrace](#-3-caso-agrotrace-rural) · [🚀 4. Rota de escala](#-4-rota-de-escala)

---

### 🧩 1. O que o ecossistema Stellar oferece

Os **Stellar Smart Contracts (antes Soroban)** são a plataforma de contratos inteligentes integrada na própria rede Stellar — não são uma cadeia nova. Um contrato é um programa pequeno escrito em **Rust** e compilado para **WebAssembly (Wasm)**. O ecossistema entrega ferramentas oficiais prontas:

| Ferramenta | Para que serve |
| :--- | :--- |
| **Soroban SDK (Rust)** | Escrever, testar e depurar contratos; ambiente local idêntico ao on-chain |
| **Stellar CLI (`stellar`)** | `stellar contract build/invoke/deploy`, rede local, contas Testnet |
| **Soroban RPC** | Invocar contratos, simular transações e ler eventos dos apps |
| **Local Network / Sandbox** | Rede local para desenvolver sem gastar em Testnet/Mainnet |
| **stellar-sdk (JS/Python)** | Conectar o backend ou frontend (FastAPI / Next.js) à rede |
| **Freighter** | Carteira de navegador para assinar operações de contrato |

---

### ✅ 2. Vantagens de usar o ecossistema

1. **Custos baixos e previsíveis.** O modelo de recursos cobra por CPU, leituras/escritas de ledger e bytes — com limites fixados pelo protocolo. `simulateTransaction` retorna o consumo exato *antes* de assinar.
2. **Finalidade rápida (~5 segundos).** Ideal no ponto de venda rural: o consumidor vê o resultado quase na hora.
3. **Segurança por projeto (Rust + Wasm).** Rust elimina classes inteiras de bugs (memória, threads) antes de compilar; Wasm restringe o que um contrato pode executar.
4. **Ferramentas oficiais e testes locais.** SDK com modo de teste local idêntico ao host on-chain: unit tests e fuzzing sem gastar XLM.
5. **Modelo de armazenamento com rent.** Dados persistentes/temporários com TTL e preços dinâmicos: evita o "state bloat" que encarece outras redes.
6. **Interoperabilidade nativa.** Contratos veem contas Stellar e ativos nativos (ex.: USDC) via Stellar Asset Contract — reutiliza carteiras, anchors e DEX existentes.
7. **Baixo consumo energético.** O Consensus Protocol da Stellar (~5 s, ~150 TPS ao vivo) não usa proof-of-work.
8. **Identidade flexível.** Assinaturas passkey (secp256r1) permitem autenticação biométrica pelo celular.

---

### 🥚 3. Caso AgroTrace Rural

**Opção de contratos (A ou B):**

| Opção | O que é | Status |
| :--- | :--- | :--- |
| **A** | Contratos inteligentes (Soroban) | Adiada |
| **B** | Transação clássica + Memo Hash (32 bytes) | ✅ **Escolhida para o MVP** |

**Hoje o MVP usa a rota mínima correta (Opção B):** *transação clássica + Memo Hash (32 bytes)* com `stellar-sdk`. Não precisa de contrato. **Quando um contrato faz sentido (Opção A):**

- Regras de negócio automáticas (ex.: um lote não pode receber mais eventos após o despacho).
- Pagamentos ou royalties automáticos entre produtor e distribuidor.
- Certificados revogáveis / estados on-chain (ativo, esgotado, recolhido).
- Tokens de fidelização ou representação de caixas (Stellar Asset Contract).

A mesma conta, as mesmas chaves e o mesmo `stellar-sdk` servem para ambos os caminhos: migrar de memo para contrato é evolução, não reinício.

---

### 🚀 4. Rota de escala

1. **MVP (hoje):** hash em Memo Hash — custo por lote ≈ 0.00001 XLM, zero manutenção.
2. **Etapa 2:** contrato `traceability` com função `anchor(batch_id, hash)` e eventos `Anchored` indexáveis via Horizon/Soroban RPC.
3. **Etapa 3:** ativos Stellar por linha produtiva (ovos Guarumo como token) + pagamentos programados.

[⬆ Voltar ao topo](#-contratos-inteligentes-en-stellar-ventajas-del-ecosistema)
