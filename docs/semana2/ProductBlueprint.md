# Product Blueprint: AgroTrace Rural

> **Nombre del proyecto:** AgroTrace Rural · **Repositorio (enlace obligatorio):** [AgroTrace Rural GitHub Repository](https://github.com/agrocassis-BAF/ProyectoBase#-agro-cassis)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [🎯 1. Priorización](#-1-priorización-de-historias) · [💎 2. Propuesta de valor](#-2-propuesta-de-valor) · [🔁 3. Flujo de usuario](#-3-flujo-de-usuario) · [✅ 4. Alcance del MVP](#-4-alcance-del-mvp) · [🖼️ 5. Lean Canvas](#-5-lean-canvas) · [📋 6. Backlog (Kanban)](#-6-backlog-priorizado-kanban) · [🏗️ 7. Arquitectura](#-7-arquitectura-inicial) · [⚓ 8. Stellar](#-8-uso-de-stellar-y-justificación)

---

### 🎯 1. Priorización de historias

Las siguientes historias de usuario fueron seleccionadas entre las propuestas individuales presentadas por el equipo (Napoleon Anaya, Cristian Jiménez, Jefferson Cabrera y Diego Martínez). Se aplicó la metodología de priorización MoSCoW (Imprescindible, Debería, Podría, Queda fuera), definiendo como **Imprescindibles** aquellas funciones necesarias para completar el ciclo "del campo al cliente con trazabilidad verificable".

**Criterio de priorización:** MoSCoW (Imprescindible para la trazabilidad central del MVP piloto "Huevos Guarumo").

| Prioridad | Historia | Propuesta por | Por qué entra al backlog |
| :---: | :--- | :---: | :--- |
| 🔴 **1 (Imprescindible)** | **Como pequeño productor agrícola**, quiero registrar cada lote cosechado (fecha, cantidad, fotos), para tener un respaldo organizado del origen de mi producción. | Napoleon Anaya | Es la entrada de datos esencial; sin este registro inicial no existe información sobre la cual construir la trazabilidad. |
| 🔴 **2 (Imprescindible)** | **Como consumidor final**, quiero escanear un código QR en la etiqueta del producto, para verificar la finca de origen, fecha de recolección y evidencias fotográficas antes de comprar. | Napoleon Anaya | Entrega el valor directo al cliente en el punto de venta, permitiéndole comprobar la procedencia y frescura. |
| 🔴 **3 (Imprescindible)** | **Como verificado / autoridad / cliente**, quiero validar que la huella digital del historial de un lote coincida con la registrada al cosechar, para comprobar que la información no ha sido alterada. | Cristian Jiménez | Cumple con la propuesta diferencial de inmutabilidad y seguridad criptográfica utilizando la red Stellar. |
| 🟠 **4 (Debería)** | **Como responsable de empaque y despacho**, quiero generar un código QR único para cada lote embalado (cubeta de huevos), para asegurar que el paquete físico corresponda exactamente al registro digital. | Jefferson Cabrera | Conecta el inventario físico con la plataforma digital en la etapa de poscosecha. |
| 🟠 **5 (Debería)** | **Como comprador o distribuidor local**, quiero consultar el historial de eventos de un lote (cosecha, clasificación y empaque), para validar la frescura antes de comercializarlo. | Diego Martínez | Facilita la adopción del sistema por parte de comerciantes locales y canales de distribución directos. |

---

### 💎 2. Propuesta de valor

**Usuario (del Problem Brief):**
Consumidor final de productos agrícolas en Cáceres, Bajo Cauca y Medellín que busca alimentos frescos y de origen verificado, junto con el pequeño productor agropecuario de la Finca Guarumo que requiere organizar sus registros y certificar la autenticidad de su cosecha sin incurrir en procesos burocráticos costosos.

**Resultado que obtiene:**
El consumidor obtiene **certeza absoluta sobre la procedencia, fecha de recolección y frescura** del alimento mediante un simple escaneo de código QR en su celular. El pequeño productor obtiene un **mecanismo de certificación de origen inmutable** que elimina la opacidad de la cadena de intermediarios y le permite comercializar directamente a un precio justo.

**Por qué elegiría esta solución:**
A diferencia de los sellos de calidad tradicionales que resultan costosos e inalcanzables para pequeños productores rurales, AgroTrace Rural proporciona un "pasaporte digital" transparente respaldado por evidencia multimedia (fotografías de la producción) y verificación de integridad mediante huellas criptográficas SHA-256 ancladas en la red Stellar.

**En qué se diferencia de cómo lo resuelve hoy:**
Actualmente, la trazabilidad se maneja mediante registros en cuadernos, facturas físicas, fotos dispersas en WhatsApp y declaraciones verbales no verificables. AgroTrace Rural unifica la captura de datos en una plataforma ágil, vincula el empaque físico mediante códigos QR y garantiza mediante blockchain que los registros históricos no puedan ser manipulados ni falsificados con posterioridad.

---

### 🔁 3. Flujo de usuario

Secuencia de navegación del usuario por la plataforma AgroTrace Rural de principio a fin:

| Paso | Rol | Qué hace | Punto de interacción |
| :---: | :--- | :--- | :--- |
| **1** | Productor Agrícola | Ingresa al formulario de la aplicación móvil/web, selecciona el lote (ej. Cubeta de huevos HUE-2027-001), ingresa fecha/cantidad y adjunta fotografía de evidencia de la recolección. | Formulario web en dispositivo móvil (conectado vía Starlink en Finca Guarumo). |
| **2** | Sistema / Backend | Procesa la información del lote, guarda los datos operativos en PostgreSQL, calcula el hash criptográfico SHA-256 de los datos/evidencias y ancla la huella en Stellar Testnet. | Servidor FastAPI + Script de integración Stellar SDK. |
| **3** | Empacador / Despacho | Genera e imprime la etiqueta con el código QR único asociado al lote `HUE-2027-001` y la adhiere al empaque (cubeta de huevos). | Módulo de impresión/generación QR en la web de AgroTrace. |
| **4** | Consumidor Final | Escanea el código QR de la cubeta de huevos utilizando la cámara de su teléfono inteligente en el punto de venta o al recibir su domicilio. | Aplicación de cámara estándar del teléfono móvil del cliente. |
| **5** | Consumidor Final | Visualiza la página pública del lote con la información de origen, fecha de postura, fotos de la finca Guarumo y el indicador de verificación de integridad on-chain. | Interfaz pública Web de consulta (`https://agrotrace.example/lote/HUE-2027-001`). |

---

### ✅ 4. Alcance del MVP

El Producto Mínimo Viable (MVP) se enfoca exclusivamente en validar el ciclo completo de trazabilidad para la línea de **Gallinas Ponedoras (Huevos Guarumo)**.

| Dentro del MVP (funcionalidad central) | Fuera del MVP (deseable, para después) |
| :--- | :--- |
| Módulo de registro de lotes de huevos con fecha, cantidad y fotografías de evidencia. | Integración de múltiples líneas productivas (piscicultura, porcinos, bovinos, frutales). |
| Generación e impresión de etiquetas con código QR por lote de empaque. | Sensores IoT automatizados para medición de temperatura y humedad en tiempo real. |
| Cálculo de huella digital SHA-256 de los datos del lote y sus evidencias. | Plataforma e-commerce completa con pasarela de pagos en línea integrada. |
| Anclaje selectivo de huellas criptográficas en Stellar Testnet. | Sistema de mensajería interna / chat en vivo entre consumidor y productor. |
| Página pública de consulta QR con botón de verificación de integridad on-chain. | Módulo de analítica avanzada con inteligencia artificial para predicción de cosecha. |

**Por qué el recorte sigue entregando valor:**
Concentrar el MVP en las cubetas de huevos permite probar la hipótesis central del negocio —que la trazabilidad transparente mediante QR y blockchain aumenta la confianza del cliente— sin la complejidad técnica de manejar múltiples ciclos productivos heterogéneos. La cubeta de huevos es un producto de alta rotación y consumo diario en la subregión del Bajo Cauca, ideal para iterar rápidamente el flujo con usuarios reales antes de escalar a piscicultura o ganadería.

---

### 🖼️ 5. Lean Canvas

Lienzo de una página con el modelo de negocio simplificado de AgroTrace Rural:

**Enlace al Lean Canvas (obligatorio):** [Lean Canvas AgroTrace Rural](https://github.com/users/alucart2005/projects/16)

---

### 📋 6. Backlog priorizado (Kanban)

El trabajo del equipo se gestiona mediante el tablero ágil de GitHub Projects, donde se estructuran las tareas priorizadas y sus criterios de aceptación en formato Gherkin (Dado / Cuando / Entonces).

**Enlace al tablero (obligatorio):** [Tablero Kanban en GitHub Projects — AgroTrace Rural](https://github.com/users/alucart2005/projects/1)

---

### 🏗️ 7. Arquitectura inicial

La arquitectura de AgroTrace Rural adopta un enfoque híbrido pragmático que combina una infraestructura tradicional para la operación eficiente con la red Stellar como notario de integridad.

```text
                                FINCA GUARUMO
                                      |
                          +-----------+-----------+
                          |                       |
                     PRODUCCIÓN              EVIDENCIAS
                          |                 Fotos / Video
                          |                       |
                          +-----------+-----------+
                                      |
                                 AgroTrace
                                      |
                   +------------------+------------------+
                   |                                     |
               PostgreSQL                             Storage
        (Datos operacionales)                  (Fotografías/Media)
                   |                                     |
                   +------------------+------------------+
                                      |
                                HASH SHA-256
                                      |
                              STELLAR TESTNET
                          (Notario Criptográfico)
                                      |
                                PÁGINA WEB QR
                                      |
                             CONSUMIDOR FINAL
```

- **Frontend:** Desarrollado en React / Next.js con Tailwind CSS, garantizando un diseño responsive y optimizado para consumo en dispositivos móviles.
- **Backend:** Construido en Python con FastAPI, encargado de gestionar la lógica de negocio, autenticación, carga de archivos y cálculo de huellas criptográficas.
- **Base de Datos y Almacenamiento:** PostgreSQL para almacenar la información operativa estructurada y almacenamiento de archivos local/S3 para guardar las imágenes de evidencia sin saturar la blockchain.
- **Red Blockchain:** Stellar SDK (Testnet) para registrar únicamente la huella Hash SHA-256 del lote de producción.

---

### ⚓ 8. Uso de Stellar y justificación

**¿Por qué usar la red Stellar?**
Stellar fue seleccionada por sus bajos costos de transacción, altísima velocidad de confirmación (3 a 5 segundos) y bajo consumo energético, características indispensables para un proyecto de impacto rural accesible.

**Componentes de Stellar utilizados:**

1. **Cuentas y Claves Criptográficas (Public/Secret Keys):** Para firmar las transacciones que representan la emisión o certificación de un lote de producción desde la cuenta oficial de la Finca Guarumo.
2. **Memo Text / Hash en Transacciones:** Para adjuntar la huella criptográfica SHA-256 (32 bytes) del lote directamente en el campo de datos de la transacción en Stellar Testnet.

**Criterio de Pertinencia:**
El uso de la blockchain en AgroTrace Rural se justifica estrictamente bajo el criterio de **integridad y auditoría compartida por partes que no se confían totalmente** (productor, consumidor, autoridad sanitaria). La plataforma cumple con la regla de oro: **ningún archivo pesado (fotos/videos) se almacena en la blockchain**. Stellar actúa únicamente como un **notario digital descentralizado** que permite comprobar de manera independiente que los registros presentados en la web no han sido alterados tras su creación inicial.

[⬆ Volver al inicio](#product-blueprint-agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [🎯 1. Story prioritization](#-1-story-prioritization) · [💎 2. Value proposition](#-2-value-proposition) · [🔁 3. User flow](#-3-user-flow) · [✅ 4. MVP scope](#-4-mvp-scope) · [🖼️ 5. Lean Canvas](#-5-lean-canvas-one-page-model) · [📋 6. Backlog (Kanban)](#-6-prioritized-backlog-kanban) · [🏗️ 7. Architecture](#-7-initial-architecture) · [⚓ 8. Stellar](#-8-use-of-stellar-and-justification)

---

### 🎯 1. Story prioritization

The following user stories were selected from the individual proposals presented by the team (Napoleon Anaya, Cristian Jiménez, Jefferson Cabrera and Diego Martínez). The MoSCoW prioritization methodology (Must, Should, Could, Won't) was applied, defining as **Must-haves** the functions needed to complete the "from the field to the customer with verifiable traceability" cycle.

**Prioritization criterion:** MoSCoW (Must-have for the core traceability of the pilot MVP "Huevos Guarumo").

| Priority | Story | Proposed by | Why it makes the backlog |
| :---: | :--- | :---: | :--- |
| 🔴 **1 (Must)** | **As a smallholder farmer**, I want to register each harvested batch (date, quantity, photos), so that I have an organized backup of the origin of my production. | Napoleon Anaya | It is the essential data entry; without this initial record there is no information on which to build traceability. |
| 🔴 **2 (Must)** | **As an end consumer**, I want to scan a QR code on the product label, so I can verify the source farm, harvest date and photographic evidence before buying. | Napoleon Anaya | It delivers direct value to the customer at the point of sale, letting them verify origin and freshness. |
| 🔴 **3 (Must)** | **As a verifier / authority / client**, I want to validate that the digital fingerprint of a batch's history matches the one recorded at harvest, so I can confirm the information has not been altered. | Cristian Jiménez | It fulfills the differentiating proposal of immutability and cryptographic security using the Stellar network. |
| 🟠 **4 (Should)** | **As the person in charge of packaging and dispatch**, I want to generate a unique QR code for each packaged batch (egg crate), so that the physical package exactly matches the digital record. | Jefferson Cabrera | It connects physical inventory with the digital platform at the post-harvest stage. |
| 🟠 **5 (Should)** | **As a local buyer or distributor**, I want to look up the event history of a batch (harvest, sorting and packaging), so I can validate freshness before selling it. | Diego Martínez | It eases adoption of the system by local merchants and direct distribution channels. |

---

### 💎 2. Value proposition

**User (from the Problem Brief):**
End consumer of agricultural products in Cáceres, Bajo Cauca and Medellín looking for fresh, verified-origin food, along with the small livestock farmer of Finca Guarumo who needs to organize their records and certify the authenticity of their harvest without incurring costly bureaucratic processes.

**Outcome they get:**
The consumer gets **absolute certainty about the origin, harvest date and freshness** of the food through a simple QR scan on their phone. The small farmer gets an **immutable origin certification mechanism** that removes the opacity of the intermediary chain and lets them sell directly at a fair price.

**Why they would choose this solution:**
Unlike traditional quality seals that are costly and out of reach for small rural producers, AgroTrace Rural provides a transparent "digital passport" backed by multimedia evidence (production photos) and integrity verification through SHA-256 cryptographic fingerprints anchored on the Stellar network.

**How it differs from today's solution:**
Today, traceability is handled with notebook records, physical invoices, photos scattered across WhatsApp and unverifiable verbal statements. AgroTrace Rural unifies data capture in an agile platform, links the physical packaging through QR codes and uses blockchain to guarantee that historical records cannot be manipulated or falsified afterwards.

---

### 🔁 3. User flow

End-to-end navigation sequence of the user through the AgroTrace Rural platform:

| Step | Role | What they do | Interaction point |
| :---: | :--- | :--- | :--- |
| **1** | Farmer | Opens the mobile/web app form, selects the batch (e.g. egg crate HUE-2027-001), enters date/quantity and attaches a photo as harvest evidence. | Web form on a mobile device (connected via Starlink at Finca Guarumo). |
| **2** | System / Backend | Processes the batch information, stores operational data in PostgreSQL, computes the SHA-256 cryptographic hash of the data/evidence and anchors the fingerprint on Stellar Testnet. | FastAPI server + Stellar SDK integration script. |
| **3** | Packer / Dispatch | Generates and prints the label with the unique QR code tied to batch `HUE-2027-001` and attaches it to the package (egg crate). | QR print/generation module on the AgroTrace web app. |
| **4** | End Consumer | Scans the QR code on the egg crate using their smartphone camera at the point of sale or when receiving delivery. | The customer's standard phone camera app. |
| **5** | End Consumer | Views the public batch page with origin information, laying date, photos of Finca Guarumo and the on-chain integrity verification indicator. | Public web consultation interface (`https://agrotrace.example/lote/HUE-2027-001`). |

---

### ✅ 4. MVP scope

The Minimum Viable Product (MVP) focuses exclusively on validating the full traceability cycle for the **Laying Hens (Huevos Guarumo)** line.

| In the MVP (core functionality) | Out of the MVP (desirable, later) |
| :--- | :--- |
| Batch registration module for eggs with date, quantity and evidence photos. | Integration of multiple production lines (fish farming, pigs, cattle, fruit). |
| Generation and printing of QR labels per packaging batch. | Automated IoT sensors for real-time temperature and humidity measurement. |
| SHA-256 fingerprint calculation of batch data and evidence. | Full e-commerce platform with an integrated online payment gateway. |
| Selective anchoring of cryptographic fingerprints on Stellar Testnet. | Internal messaging / live chat system between consumer and producer. |
| Public QR lookup page with an on-chain integrity verification button. | Advanced analytics module with AI for harvest prediction. |

**Why the cut still delivers value:**
Focusing the MVP on egg crates lets us test the core business hypothesis —that transparent QR and blockchain traceability increases customer trust— without the technical complexity of handling multiple heterogeneous production cycles. Egg crates are a high-rotation, daily-consumption product in the Bajo Cauca subregion, ideal for quickly iterating the flow with real users before scaling to fish farming or cattle.

---

### 🖼️ 5. Lean Canvas (one-page model)

One-page canvas with the simplified business model of AgroTrace Rural:

**Lean Canvas link (required):** [Lean Canvas AgroTrace Rural](https://github.com/users/alucart2005/projects/16)

---

### 📋 6. Prioritized backlog (Kanban)

Team work is managed through the agile GitHub Projects board, where prioritized tasks and their acceptance criteria are structured in Gherkin format (Given / When / Then).

**Board link (required):** [Kanban board on GitHub Projects — AgroTrace Rural](https://github.com/users/alucart2005/projects/1)

---

### 🏗️ 7. Initial architecture

The AgroTrace Rural architecture adopts a pragmatic hybrid approach that combines traditional infrastructure for efficient operation with the Stellar network as an integrity notary.

```text
                            FINCA GUARUMO (FARM)
                                  |
                      +-----------+-----------+
                      |                       |
                 PRODUCTION              EVIDENCE
                      |              Photos / Video
                      |                       |
                      +-----------+-----------+
                                  |
                             AgroTrace
                                  |
               +------------------+------------------+
               |                                     |
          PostgreSQL                             Storage
   (Operational data)                    (Photos/Media)
               |                                     |
               +------------------+------------------+
                                  |
                            SHA-256 HASH
                                  |
                          STELLAR TESTNET
                     (Cryptographic Notary)
                                  |
                         QR WEB PAGE
                                  |
                          END CONSUMER
```

- **Frontend:** Built with React / Next.js and Tailwind CSS, ensuring a responsive design optimized for mobile devices.
- **Backend:** Built in Python with FastAPI, responsible for business logic, authentication, file uploads and cryptographic fingerprint computation.
- **Database and Storage:** PostgreSQL for structured operational information and local/S3 file storage for evidence images, keeping them off the blockchain.
- **Blockchain network:** Stellar SDK (Testnet) to record only the SHA-256 hash fingerprint of the production batch.

---

### ⚓ 8. Use of Stellar and justification

**Why use the Stellar network?**
Stellar was chosen for its low transaction costs, very high confirmation speed (3 to 5 seconds) and low energy consumption — characteristics essential to an accessible rural-impact project.

**Stellar components used:**

1. **Accounts and cryptographic keys (public/secret keys):** To sign the transactions that represent the issuance or certification of a production batch from the official Finca Guarumo account.
2. **Memo Text / Hash in transactions:** To attach the batch's SHA-256 cryptographic fingerprint (32 bytes) directly in the transaction data field on Stellar Testnet.

**Relevance criterion:**
The use of blockchain in AgroTrace Rural is strictly justified by the criterion of **integrity and auditing shared among parties that do not fully trust each other** (producer, consumer, health authority). The platform follows the golden rule: **no heavy files (photos/videos) are stored on the blockchain**. Stellar acts solely as a **decentralized digital notary** that allows independent proof that the records shown on the web have not been altered after their initial creation.

[⬆ Back to top](#product-blueprint-agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [🎯 1. Priorização](#-1-priorização-de-histórias) · [💎 2. Proposta de valor](#-2-proposta-de-valor) · [🔁 3. Fluxo do usuário](#-3-fluxo-do-usuário) · [✅ 4. Escopo do MVP](#-4-escopo-do-mvp) · [🖼️ 5. Lean Canvas](#-5-lean-canvas-modelo-de-negócio) · [📋 6. Backlog (Kanban)](#-6-backlog-priorizado-quadro-kanban) · [🏗️ 7. Arquitetura](#-7-arquitetura-inicial) · [⚓ 8. Stellar](#-8-uso-da-stellar-e-justificativa)

---

### 🎯 1. Priorização de histórias

As seguintes histórias de usuário foram selecionadas entre as propostas individuais apresentadas pela equipe (Napoleon Anaya, Cristian Jiménez, Jefferson Cabrera e Diego Martínez). Foi aplicada a metodologia de priorização MoSCoW (Imprescindível, Deveria, Poderia, Fica de fora), definindo como **Imprescindíveis** as funções necessárias para completar o ciclo "do campo ao cliente com rastreabilidade verificável".

**Critério de priorização:** MoSCoW (Imprescindível para a rastreabilidade central do MVP piloto "Huevos Guarumo").

| Prioridade | História | Proposto por | Por que entra no backlog |
| :---: | :--- | :---: | :--- |
| 🔴 **1 (Imprescindível)** | **Como pequeno produtor agrícola**, quero registrar cada lote colhido (data, quantidade, fotos), para ter um respaldo organizado da origem da minha produção. | Napoleon Anaya | É a entrada de dados essencial; sem este registro inicial não existe informação sobre a qual construir a rastreabilidade. |
| 🔴 **2 (Imprescindível)** | **Como consumidor final**, quero escanear um código QR na etiqueta do produto, para verificar a fazenda de origem, a data de colheita e as evidências fotográficas antes de comprar. | Napoleon Anaya | Entrega o valor direto ao cliente no ponto de venda, permitindo comprovar a procedência e a frescura. |
| 🔴 **3 (Imprescindível)** | **Como verificador / autoridade / cliente**, quero validar que a impressão digital do histórico de um lote corresponde à registrada na colheita, para comprovar que a informação não foi alterada. | Cristian Jiménez | Cumpre a proposta diferencial de imutabilidade e segurança criptográfica utilizando a rede Stellar. |
| 🟠 **4 (Deveria)** | **Como responsável pela embalagem e despacho**, quero gerar um código QR único para cada lote embalado (caixa de ovos), para garantir que o pacote físico corresponda exatamente ao registro digital. | Jefferson Cabrera | Conecta o inventário físico à plataforma digital na etapa pós-colheita. |
| 🟠 **5 (Deveria)** | **Como comprador ou distribuidor local**, quero consultar o histórico de eventos de um lote (colheita, classificação e embalagem), para validar a frescura antes de comercializá-lo. | Diego Martínez | Facilita a adoção do sistema por comerciantes locais e canais de distribuição diretos. |

---

### 💎 2. Proposta de valor

**Usuário (do Problem Brief):**
Consumidor final de produtos agrícolas em Cáceres, Bajo Cauca e Medellín que busca alimentos frescos e de origem verificada, junto com o pequeno produtor agropecuário da Finca Guarumo que precisa organizar seus registros e certificar a autenticidade da sua colheita sem incorrer em processos burocráticos custosos.

**Resultado que obtém:**
O consumidor obtém **certeza absoluta sobre a procedência, a data de colheita e a frescura** do alimento por meio de um simples escaneamento do código QR no celular. O pequeno produtor obtém um **mecanismo de certificação de origem imutável** que elimina a opacidade da cadeia de intermediários e permite comercializar diretamente a um preço justo.

**Por que escolheria esta solução:**
Diferentemente dos selos de qualidade tradicionais, que são custosos e inacessíveis para pequenos produtores rurais, o AgroTrace Rural fornece um "passaporte digital" transparente, respaldado por evidência multimídia (fotos da produção) e verificação de integridade por meio de impressões digitais criptográficas SHA-256 ancoradas na rede Stellar.

**Em que difere de como é resolvido hoje:**
Atualmente, a rastreabilidade é tratada com registros em cadernos, notas fiscais físicas, fotos espalhadas no WhatsApp e declarações verbais não verificáveis. O AgroTrace Rural unifica a captura de dados em uma plataforma ágil, vincula a embalagem física por meio de códigos QR e garante por meio da blockchain que os registros históricos não possam ser manipulados nem falsificados posteriormente.

---

### 🔁 3. Fluxo do usuário

Sequência de navegação do usuário pela plataforma AgroTrace Rural do início ao fim:

| Etapa | Papel | O que faz | Ponto de interação |
| :---: | :--- | :--- | :--- |
| **1** | Produtor Agrícola | Abre o formulário do app móvel/web, seleciona o lote (ex.: caixa de ovos HUE-2027-001), informa data/quantidade e anexa fotografia de evidência da colheita. | Formulário web em dispositivo móvel (conectado via Starlink na Finca Guarumo). |
| **2** | Sistema / Backend | Processa as informações do lote, grava os dados operacionais no PostgreSQL, calcula o hash criptográfico SHA-256 dos dados/evidências e ancora a impressão digital na Stellar Testnet. | Servidor FastAPI + script de integração Stellar SDK. |
| **3** | Embalador / Despacho | Gera e imprime a etiqueta com o código QR único associado ao lote `HUE-2027-001` e a fixa na embalagem (caixa de ovos). | Módulo de impressão/geração de QR no web do AgroTrace. |
| **4** | Consumidor Final | Escaneia o código QR da caixa de ovos com a câmera do smartphone no ponto de venda ou ao receber a entrega. | Aplicativo de câmera padrão do celular do cliente. |
| **5** | Consumidor Final | Visualiza a página pública do lote com a informação de origem, data de postura, fotos da Finca Guarumo e o indicador de verificação de integridade on-chain. | Interface web pública de consulta (`https://agrotrace.example/lote/HUE-2027-001`). |

---

### ✅ 4. Escopo do MVP

O Produto Mínimo Viável (MVP) foca exclusivamente em validar o ciclo completo de rastreabilidade para a linha de **Galinhas Poedeiras (Huevos Guarumo)**.

| Dentro do MVP (funcionalidade central) | Fora do MVP (desejável, para depois) |
| :--- | :--- |
| Módulo de registro de lotes de ovos com data, quantidade e fotografias de evidência. | Integração de múltiplas linhas produtivas (piscicultura, suínos, bovinos, frutíferas). |
| Geração e impressão de etiquetas com código QR por lote de embalagem. | Sensores IoT automatizados para medição de temperatura e umidade em tempo real. |
| Cálculo da impressão digital SHA-256 dos dados do lote e suas evidências. | Plataforma e-commerce completa com gateway de pagamento integrado. |
| Ancoragem seletiva de impressões digitais criptográficas na Stellar Testnet. | Sistema de mensagens internas / chat ao vivo entre consumidor e produtor. |
| Página pública de consulta QR com botão de verificação de integridade on-chain. | Módulo de analítica avançada com inteligência artificial para previsão de colheita. |

**Por que o recorte continua entregando valor:**
Concentrar o MVP nas caixas de ovos permite testar a hipótese central do negócio —que a rastreabilidade transparente via QR e blockchain aumenta a confiança do cliente— sem a complexidade técnica de lidar com múltiplos ciclos produtivos heterogêneos. A caixa de ovos é um produto de alta rotação e consumo diário na subregião do Bajo Cauca, ideal para iterar rapidamente o fluxo com usuários reais antes de escalar para piscicultura ou pecuária.

---

### 🖼️ 5. Lean Canvas (modelo de negócio)

Canvas de uma página com o modelo de negócio simplificado do AgroTrace Rural:

**Link do Lean Canvas (obrigatório):** [Lean Canvas AgroTrace Rural](https://github.com/users/alucart2005/projects/16)

---

### 📋 6. Backlog priorizado (quadro Kanban)

O trabalho da equipe é gerenciado pelo board ágil do GitHub Projects, onde as tarefas priorizadas e seus critérios de aceitação são estruturados em formato Gherkin (Dado / Quando / Então).

**Link do board (obrigatório):** [Board Kanban no GitHub Projects — AgroTrace Rural](https://github.com/users/alucart2005/projects/1)

---

### 🏗️ 7. Arquitetura inicial

A arquitetura do AgroTrace Rural adota uma abordagem híbrida pragmática que combina infraestrutura tradicional para a operação eficiente com a rede Stellar como notário de integridade.

```text
                          FINCA GUARUMO (FAZENDA)
                                  |
                      +-----------+-----------+
                      |                       |
                  PRODUÇÃO              EVIDÊNCIAS
                      |              Fotos / Vídeo
                      |                       |
                      +-----------+-----------+
                                  |
                             AgroTrace
                                  |
               +------------------+------------------+
               |                                     |
          PostgreSQL                             Storage
    (Dados operacionais)                (Fotos/Mídia)
               |                                     |
               +------------------+------------------+
                                  |
                            HASH SHA-256
                                  |
                          STELLAR TESTNET
                       (Notário Criptográfico)
                                  |
                         PÁGINA WEB QR
                                  |
                         CONSUMIDOR FINAL
```

- **Frontend:** Desenvolvido em React / Next.js com Tailwind CSS, garantindo design responsivo e otimizado para consumo em dispositivos móveis.
- **Backend:** Construído em Python com FastAPI, responsável pela lógica de negócio, autenticação, upload de arquivos e cálculo de impressões digitais criptográficas.
- **Banco de Dados e Armazenamento:** PostgreSQL para armazenar a informação operacional estruturada e armazenamento local/S3 para guardar as imagens de evidência sem saturar a blockchain.
- **Rede Blockchain:** Stellar SDK (Testnet) para registrar apenas a impressão digital Hash SHA-256 do lote de produção.

---

### ⚓ 8. Uso da Stellar e justificativa

**Por que usar a rede Stellar?**
A Stellar foi selecionada por seus baixos custos de transação, altíssima velocidade de confirmação (3 a 5 segundos) e baixo consumo de energia — características indispensáveis para um projeto de impacto rural acessível.

**Componentes da Stellar utilizados:**

1. **Contas e chaves criptográficas (public/secret keys):** Para assinar as transações que representam a emissão ou certificação de um lote de produção a partir da conta oficial da Finca Guarumo.
2. **Memo Text / Hash nas transações:** Para anexar a impressão digital criptográfica SHA-256 (32 bytes) do lote diretamente no campo de dados da transação na Stellar Testnet.

**Critério de pertinência:**
O uso da blockchain no AgroTrace Rural justifica-se estritamente sob o critério de **integridade e auditoria compartilhada por partes que não se confiam totalmente** (produtor, consumidor, autoridade sanitária). A plataforma cumpre a regra de ouro: **nenhum arquivo pesado (fotos/vídeos) é armazenado na blockchain**. A Stellar atua apenas como um **notário digital descentralizado** que permite comprovar de forma independente que os registros apresentados na web não foram alterados após sua criação inicial.

[⬆ Voltar ao topo](#product-blueprint-agrotrace-rural)
