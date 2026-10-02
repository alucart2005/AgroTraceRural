# Historias de usuario individuales

> **Proyecto:** AgroTrace Rural · **Semana:** 2 · **Autor:** Napoleon de Jesus Anaya Romero · **GitHub:** [@alucart2005](https://github.com/alucart2005)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [📜 Mis historias de usuario](#-mis-historias-de-usuario) · [🏆 Orden de importancia](#-orden-de-importancia-y-por-qué) · [🧠 Explicación del orden](#-explicación-del-orden)

---

### 📜 Mis historias de usuario

| ID | Prioridad | Historia |
| :---: | :---: | :--- |
| **H1** | 🔴 Debe | **Como pequeño productor agrícola**, quiero registrar cada lote cosechado especificando la fecha, tipo de producto y adjuntando una fotografía de evidencia, para tener un respaldo organizado del origen de mi producción. |
| **H2** | 🔴 Debe | **Como consumidor final**, quiero escanear un código QR en la etiqueta del producto desde mi teléfono, para verificar la finca de origen, la fecha de recolección y las fotografías de evidencia antes de realizar la compra. |
| **H3** | 🟠 Debería | **Como responsable de empaque y despacho**, quiero generar un código QR único etiquetable para cada lote embalado, para asegurar que el paquete físico corresponda exactamente a la información registrada en el sistema. |
| **H4** | 🟠 Debería | **Como comprador o distribuidor local**, quiero consultar el historial de eventos de un lote específico (cosecha, clasificación y despacho), para validar la frescura y calidad de los productos antes de comercializarlos. |
| **H5** | 🔴 Debe | **Como verificado / autoridad sanitaria o cliente institucional**, quiero validar que la huella digital del historial de un lote coincida con la registrada en el momento de la cosecha, para comprobar que la información no ha sido alterada ni manipulada. |
| **H6** | 🟡 Podría | **Como pequeño productor agrícola**, quiero consultar un panel con el historial de todos los lotes de mi finca y su estado de venta, para gestionar de forma eficiente mis inventarios y entregas. |
| **H7** | 🟡 Podría | **Como consumidor final**, quiero enviar un mensaje de consulta o retroalimentación sobre un lote escaneado, para establecer comunicación directa con la finca productora. |

---

### 🏆 Orden de importancia y por qué

1. **H1 — Registro de lote por el productor:** es el paso cero; sin captura inicial no existe dato que procesar.
2. **H2 — Consulta del consumidor vía QR:** entrega el valor principal al consumidor final (transparencia y verificación directa).
3. **H5 — Verificación de integridad de datos:** aporta la ventaja diferencial (inmutabilidad y prueba de no alteración).
4. **H3 — Generación de código QR en empaque:** enlaza el registro digital con el empaque físico.
5. **H4 — Consulta del distribuidor local:** permite que intermediarios adopten el producto basándose en datos de calidad.
6. **H6 — Panel de historial de lotes de la finca:** agrega valor de gestión de inventarios y entregas.
7. **H7 — Retroalimentación del consumidor:** agrega valor de relacionamiento directo con la finca.

---

### 🧠 Explicación del orden

#### ¿Por qué la Historia 1 es la más importante?

El propósito central del producto (**AgroTrace Rural**) es resolver la desconfianza e incertidumbre sobre el origen de los productos agrícolas. Si el productor no realiza la captura inicial del lote (fecha, fotos, tipo de producto), **no existe ningún dato que procesar, no hay código QR que generar, ni huella de integridad que anclar**. Es el paso cero e imprescindible de toda la cadena de valor: sin la entrada del productor, el resto del sistema carece de contenido.

#### Criterio de priorización metodológico:

- **Prioridad Imprescindible 🔴 (Historias 1, 2 y 5):** Constituyen el *Minimum Viable Product* (MVP). La **Historia 1** genera el dato de origen, la **Historia 2** entrega el valor principal al consumidor final (transparencia y verificación directa mediante QR), y la **Historia 5** aporta la ventaja diferencial (inmutabilidad y verificación de no alteración). Juntas demuestran la hipótesis del *Problem Brief*.
- **Prioridad Debería 🟠 (Historias 3 y 4):** Articulan la operación física y comercial. La **Historia 3** enlaza el registro digital con el empaque físico (como las cubetas de huevos), y la **Historia 4** permite que intermediarios y distribuidores locales adopten el producto basándose en datos de calidad.
- **Prioridad Podría 🟡 (Historias 6 y 7):** Agregan valor de gestión y relacionamiento, pero el producto sigue cumpliendo su promesa fundamental de trazabilidad e integridad aun si estas funcionalidades se postergan para iteraciones futuras.

[⬆ Volver al inicio](#historias-de-usuario-individuales)

---

## 🇺🇸 English

📑 **Contents:** [📜 My user stories](#-my-user-stories) · [🏆 Importance order](#-importance-order-and-why) · [🧠 Explanation of the order](#-explanation-of-the-order)

---

### 📜 My user stories

| ID | Priority | Story |
| :---: | :---: | :--- |
| **H1** | 🔴 Must | **As a smallholder farmer**, I want to register each harvested batch specifying the date, product type and attaching a photo as evidence, so that I have an organized backup of the origin of my production. |
| **H2** | 🔴 Must | **As an end consumer**, I want to scan a QR code on the product label from my phone, so I can verify the source farm, the harvest date and the supporting photos before buying. |
| **H3** | 🟠 Should | **As the person in charge of packaging and dispatch**, I want to generate a unique labelable QR code for each packaged batch, so that the physical package exactly matches the information registered in the system. |
| **H4** | 🟠 Should | **As a local buyer or distributor**, I want to look up the event history of a specific batch (harvest, sorting and dispatch), so I can validate the freshness and quality of the products before selling them. |
| **H5** | 🔴 Must | **As a verifier / health authority or institutional client**, I want to validate that the digital fingerprint of a batch's history matches the one recorded at harvest time, so I can confirm the information has not been altered or manipulated. |
| **H6** | 🟡 Could | **As a smallholder farmer**, I want to view a dashboard with the history of all the batches on my farm and their sale status, so I can manage my inventories and deliveries efficiently. |
| **H7** | 🟡 Could | **As an end consumer**, I want to send an inquiry or feedback message about a scanned batch, so I can establish direct communication with the producing farm. |

---

### 🏆 Importance order and why

1. **H1 — Farmer batch registration:** it is the zero step; without the initial capture there is no data to process.
2. **H2 — Consumer QR lookup:** it delivers the main value to the end consumer (transparency and direct verification).
3. **H5 — Data integrity verification:** it provides the differentiating advantage (immutability and proof of non-alteration).
4. **H3 — QR generation at packaging:** it links the digital record to the physical package.
5. **H4 — Local distributor lookup:** it lets intermediaries adopt the product based on quality data.
6. **H6 — Farm batch history dashboard:** it adds inventory and delivery management value.
7. **H7 — Consumer feedback:** it adds direct relationship value with the farm.

---

### 🧠 Explanation of the order

#### Why is Story 1 the most important?

The core purpose of the product (**AgroTrace Rural**) is to resolve the distrust and uncertainty about the origin of agricultural products. If the producer does not capture the initial batch data (date, photos, product type), **there is no data to process, no QR code to generate, and no integrity fingerprint to anchor**. It is the zero step, indispensable to the entire value chain: without the producer's input, the rest of the system has no content.

#### Methodological prioritization criteria:

- **Must-have priority 🔴 (Stories 1, 2 and 5):** They make up the *Minimum Viable Product* (MVP). **Story 1** generates the origin data, **Story 2** delivers the main value to the end consumer (transparency and direct verification via QR), and **Story 5** provides the differentiating advantage (immutability and proof of non-alteration). Together they demonstrate the *Problem Brief* hypothesis.
- **Should-have priority 🟠 (Stories 3 and 4):** They articulate the physical and commercial operations. **Story 3** links the digital record to the physical packaging (like egg crates), and **Story 4** lets intermediaries and local distributors adopt the product based on quality data.
- **Could-have priority 🟡 (Stories 6 and 7):** They add management and relationship value, but the product still fulfills its fundamental traceability and integrity promise even if these features are deferred to future iterations.

[⬆ Volver al inicio](#historias-de-usuario-individuales)

---

## 🇧🇷 Português

📑 **Conteúdo:** [📜 Minhas histórias de usuário](#-minhas-histórias-de-usuário) · [🏆 Ordem de importância](#-ordem-de-importância-e-por-quê) · [🧠 Explicação da ordem](#-explicação-da-ordem)

---

### 📜 Minhas histórias de usuário

| ID | Prioridade | História |
| :---: | :---: | :--- |
| **H1** | 🔴 Deve | **Como pequeno produtor agrícola**, quero registrar cada lote colhido especificando a data, o tipo de produto e anexando uma fotografia de evidência, para ter um respaldo organizado da origem da minha produção. |
| **H2** | 🔴 Deve | **Como consumidor final**, quero escanear um código QR na etiqueta do produto pelo meu celular, para verificar a fazenda de origem, a data de colheita e as fotografias de evidência antes de comprar. |
| **H3** | 🟠 Deveria | **Como responsável pela embalagem e despacho**, quero gerar um código QR único etiquetável para cada lote embalado, para garantir que o pacote físico corresponda exatamente à informação registrada no sistema. |
| **H4** | 🟠 Deveria | **Como comprador ou distribuidor local**, quero consultar o histórico de eventos de um lote específico (colheita, classificação e despacho), para validar a frescura e a qualidade dos produtos antes de comercializá-los. |
| **H5** | 🔴 Deve | **Como verificador / autoridade sanitária ou cliente institucional**, quero validar que a impressão digital do histórico de um lote corresponde à registrada no momento da colheita, para comprovar que a informação não foi alterada nem manipulada. |
| **H6** | 🟡 Poderia | **Como pequeno produtor agrícola**, quero consultar um painel com o histórico de todos os lotes da minha fazenda e seu estado de venda, para gerenciar de forma eficiente meus inventários e entregas. |
| **H7** | 🟡 Poderia | **Como consumidor final**, quero enviar uma mensagem de consulta ou retroalimentação sobre um lote escaneado, para estabelecer comunicação direta com a fazenda produtora. |

---

### 🏆 Ordem de importância e por quê

1. **H1 — Registro de lote pelo produtor:** é o passo zero; sem a captura inicial não existe dado para processar.
2. **H2 — Consulta do consumidor via QR:** entrega o valor principal ao consumidor final (transparência e verificação direta).
3. **H5 — Verificação de integridade dos dados:** traz a vantagem diferencial (imutabilidade e prova de não alteração).
4. **H3 — Geração de QR na embalagem:** liga o registro digital à embalagem física.
5. **H4 — Consulta do distribuidor local:** permite que intermediários adotem o produto com base em dados de qualidade.
6. **H6 — Painel de histórico de lotes da fazenda:** agrega valor de gestão de inventários e entregas.
7. **H7 — Retroalimentação do consumidor:** agrega valor de relacionamento direto com a fazenda.

---

### 🧠 Explicação da ordem

#### Por que a História 1 é a mais importante?

O propósito central do produto (**AgroTrace Rural**) é resolver a desconfiança e a incerteza sobre a origem dos produtos agrícolas. Se o produtor não realizar a captura inicial do lote (data, fotos, tipo de produto), **não existe nenhum dado para processar, não há código QR para gerar, nem impressão digital de integridade para ancorar**. É o passo zero e imprescindível de toda a cadeia de valor: sem a entrada do produtor, o resto do sistema carece de conteúdo.

#### Critério de priorização metodológica:

- **Prioridade Imprescindível 🔴 (Histórias 1, 2 e 5):** Constituem o *Minimum Viable Product* (MVP). A **História 1** gera o dado de origem, a **História 2** entrega o valor principal ao consumidor final (transparência e verificação direta via QR), e a **História 5** traz a vantagem diferencial (imutabilidade e verificação de não alteração). Juntas demonstram a hipótese do *Problem Brief*.
- **Prioridade Deveria 🟠 (Histórias 3 e 4):** Articulam a operação física e comercial. A **História 3** liga o registro digital à embalagem física (como as caixas de ovos), e a **História 4** permite que intermediários e distribuidores locais adotem o produto com base em dados de qualidade.
- **Prioridade Poderia 🟡 (Histórias 6 e 7):** Agregam valor de gestão e relacionamento, mas o produto segue cumprindo sua promessa fundamental de rastreabilidade e integridade mesmo se essas funcionalidades forem postergadas para iterações futuras.

[⬆ Volver al inicio](#historias-de-usuario-individuales)
