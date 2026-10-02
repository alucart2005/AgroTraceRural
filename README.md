# 🌱 AgroTrace Rural

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

[![Blockchain](https://img.shields.io/badge/Blockchain-Stellar-blueviolet)](#)
[![AgTech](https://img.shields.io/badge/Industry-AgTech-green)](#)
[![Trazabilidad](https://img.shields.io/badge/Traceability-QR%20%2B%20SHA--256-orange)](#)
[![Colombia](https://img.shields.io/badge/Made%20in-Colombia-yellow)](#)

---

## 🇪🇸 Español

> ### *"Del campo al cliente, con trazabilidad verificable."* 🇨🇴

---

### 📖 Sobre el proyecto

**AgroTrace Rural** es un proyecto de trazabilidad agroalimentaria que busca crear un canal **finca → cliente**: reducir la dependencia de intermediarios y permitir que el consumidor verifique el origen de los productos que compra mediante un **código QR**.

El corazón del proyecto es la plataforma **AgroTrace**, un sistema de registros digitales con huellas criptográficas **SHA-256** y anclaje selectivo de eventos en la red **Stellar**. Los documentos, fotografías y videos **no se almacenan en blockchain**: se conservan en almacenamiento digital y solo se registra su huella criptográfica, fecha, lote y referencia, de modo que una modificación posterior del archivo pueda ser detectada.

#### 📍 Contexto del piloto

| | |
|---|---|
| **Ubicación** | Guarumo, Cáceres — Bajo Cauca antioqueño (Antioquia) |
| **Área** | 6 hectáreas |
| **Producción** | 🐟 Peces · 🐔 Gallinas ponedoras · 🦆 Patos · 🐖 Porcinos · 🐄 Bovinos · 🌳 Frutales |
| **Producto piloto** | Cubeta de huevos con pasaporte digital QR |
| **Inversión preliminar** | $48.000.000 COP |
| **Horizonte** | 36 meses, con primera etapa de 12 meses |

---

### 📑 Contenido

1. [❓ El problema](#-el-problema)
2. [💡 Oportunidad e hipótesis](#-oportunidad-e-hipótesis)
3. [✅ ¿Por qué blockchain?](#-por-qué-blockchain)
4. [🏗️ Arquitectura](#-arquitectura)
5. [🔄 Flujo de trazabilidad](#-flujo-de-trazabilidad)
6. [🌾 Modelo productivo](#-modelo-productivo)
7. [🛒 Comercialización directa](#-comercialización-directa)
8. [👥 Equipo y roles](#-equipo-y-roles)
9. [🗺️ Cronograma](#-cronograma)
10. [💰 Inversión y financiación](#-inversión-y-financiación)
11. [📈 Indicadores y metas](#-indicadores-y-metas)
12. [⚠️ Supuestos y riesgos](#-supuestos-y-riesgos)
13. [📋 Requisitos regulatorios](#-requisitos-regulatorios)
14. [🌱 Visión](#-visión)

---

### ❓ El problema

Los consumidores **no pueden conocer ni verificar de manera sencilla el origen y el proceso de producción** de los productos agrícolas que compran. Para el pequeño productor, mantener esta información organizada también representa trabajo adicional cuando se usan registros manuales, fotografías, documentos y conversaciones independientes.

Las principales fricciones identificadas son:

1. **Registro de información:** los registros manuales generan esfuerzo y posibilidad de errores.
2. **Organización de evidencias:** fotos, documentos y registros están en diferentes lugares.
3. **Demostración del origen:** al comercializar, cuesta presentar toda la información del producto.
4. **Consulta del consumidor:** recibe información limitada sobre el origen y el proceso.
5. **Intercambio de información:** cada actor maneja sus propios registros; no hay historia común.

> 🗳️ **Decisión del problema:** propuesto por **Napoleon de Jesus Anaya Romero** y elegido por **votación** del equipo entre las propuestas presentadas.

---

### 💡 Oportunidad e hipótesis

> 💡 **Oportunidad priorizada:** mejorar la verificación del origen y el historial de cada lote agrícola.

Conecta directamente al productor con el consumidor y genera valor para ambos: el productor organiza mejor sus registros y el consumidor accede a la información del lote mediante un **código QR**.

> 🔒 **Hipótesis:** un registro verificable y difícil de alterar podría aumentar la confianza en la información de trazabilidad.

En cada lote:

- **identificador único**;
- registros y evidencias almacenados en el sistema con huella **SHA-256**;
- referencia de la huella registrada en **Stellar**;
- fotografías y videos **fuera de la cadena**;
- consulta pública al escanear el **QR** (origen, lote, fecha y evidencias).

La hipótesis se validará mediante un **MVP pequeño** y pruebas con usuarios reales.

---

### ✅ ¿Por qué blockchain?

**Criterio principal:**

> ✅ *Varias partes necesitan compartir un registro verificable y existe interés en preservar el histórico de los registros.*

Productor, intermediarios y consumidor son actores que necesitan consultar información del mismo lote y preservar su historial sin alteraciones no registradas.

**Regla fundamental:** *los datos completos permanecen fuera de blockchain.* En Stellar se registran únicamente los datos mínimos para verificar integridad:

```text
lote_id
evento
timestamp
hash
referencia
```

Esto reduce costos y protege la información sensible. La información operativa permanece en una base de datos tradicional; blockchain se usa solo donde aporta una característica adicional: **probar que una evidencia existió en un momento determinado y que no fue modificada sin dejar rastro**. La pertinencia deberá validarse comparando costo, complejidad y beneficio frente a una solución basada solo en una base de datos tradicional.

---

### 🏗️ Arquitectura

```text
                   FINCA GUARUMO
                         |
             +-----------+-----------+
             |                       |
        PRODUCCIÓN             EVIDENCIAS
             |               Fotos / Video
             |                       |
             +-----------+-----------+
                         |
                      AgroTrace
                         |
              +----------+----------+
              |                     |
          PostgreSQL             Storage
              |                     |
              +----------+----------+
                         |
                   SHA-256 HASH
                         |
                      STELLAR
                         |
                       QR WEB
                         |
                      CLIENTE
```

---

### 🔄 Flujo de trazabilidad

Ejemplo: una cubeta de huevos.

```text
Gallinas GAL-001
       ↓
Producción diaria
       ↓
Lote HUE-2027-001
       ↓
Clasificación → Empaque → Generación QR
       ↓
Hash SHA-256 → Registro verificable
       ↓
Pedido → Despacho → Entrega
       ↓
Cliente
```

El cliente consulta:

```text
https://agrotrace.example/lote/HUE-2027-001
```

La página muestra la información pública del lote y un **indicador de verificación**.

---

### 🌾 Modelo productivo

Distribución preliminar de las 6 hectáreas *(sujeta a levantamiento topográfico, agua, suelos y normas ambientales)*:

| Área | Hectáreas | Uso |
|---|---:|---|
| Ganadería bovina | 3,00 ha | Pastoreo rotacional y manejo de bovinos |
| Piscicultura | 0,70 ha | Estanques, circulación y zona técnica |
| Gallinas ponedoras | 0,25 ha | Galpón, patio, bodega y bioseguridad |
| Patos | 0,15 ha | Área integrada con manejo de agua |
| Porcinos | 0,25 ha | Porqueriza, manejo de residuos y zona sanitaria |
| Frutales | 1,10 ha | Mango, guayaba, cítricos, papaya u otras especies adaptadas |
| Infraestructura y reserva | 0,55 ha | Casa/bodega, accesos, agua, compostaje y servicios |
| **TOTAL** | **6,00 ha** | |

#### Metas iniciales

- 🐔 **Gallinas ponedoras:** 80–120 aves *(producto piloto: cubeta de huevos con QR)*
- 🐟 **Piscicultura:** 1–2 estanques pequeños, según disponibilidad de agua
- 🦆 **Patos:** 20–30 animales *(unidad complementaria)*
- 🐖 **Porcinos:** pequeño lote de engorde
- 🐄 **Bovinos:** pequeño hato según capacidad de carga
- 🌳 **Frutales:** 1,1 ha de especies adaptadas con salida comercial

**Principio de diseño:** no se llena la capacidad productiva desde el primer año; el proyecto avanza **por fases** para que la producción genere caja antes de ampliar.

---

### 🛒 Comercialización directa

| Canal | Descripción |
|---|---|
| **1. WhatsApp** | Catálogo → pedido → confirmación → pago → despacho |
| **2. Sitio web** | Catálogo: huevos, pescado, frutas, carne de cerdo, productos bovinos permitidos y otros productos |
| **3. Clientes recurrentes** | Planes semanales: **Canasta Finca Guarumo** (huevos, fruta de temporada, pescado según disponibilidad) |

**Objetivo inicial:** 20–30 clientes recurrentes en Cáceres y Bajo Cauca, con expansión posterior a Medellín.

---

### 👥 Equipo y roles

- **Integrantes:**
  - Cristian Esteban Jiménez Durango — `CristianEstebanJimenezDurango`
  - Jefferson Cabrera — *\[usuario de GitHub pendiente\]*
  - Napoleon de Jesus Anaya Romero — `alucart2005`
  - Diego Martínez — *\[usuario de GitHub pendiente\]*
- **Rol:** Programación / Informes
- **Responsable de entregas:** Napoleon de Jesus Anaya Romero
- **Canal de coordinación interna:** GitHub Issues

---

### 🗺️ Cronograma

| Fase | Mes | Contenido |
|---|---|---|
| **0 — Preparación** | 0–1 | Levantamiento, análisis de agua/suelo, cotizaciones, requisitos ICA, diseño financiero, solicitud de crédito y diseño del MVP |
| **1 — Infraestructura** | 2–3 | Agua, cercas, drenajes, galpón, porqueriza, estanques, bodega y compostaje |
| **2 — Primer ciclo productivo** | 3–6 | Gallinas, patos, primer lote porcino, alevinos, frutales y bovinos según capacidad |
| **3 — AgroTrace MVP** | 2–4 | Login, fincas, lotes, animales, producción, inventario, ventas, QR, historial, hash y anclaje en Stellar *(producto piloto: huevos)* |
| **4 — Comercialización** | 4–8 | Catálogo, WhatsApp Business, sitio web, QR, base de clientes y pedidos |
| **5 — Consolidación** | 7–12 | Incorporación progresiva de pescado, frutas, porcinos, patos y bovinos |

#### Horizonte financiero

- **Año 1:** producción + trazabilidad + clientes *(MVP funcionando, primeros lotes trazables, flujo de caja)*
- **Año 2:** escala *(más producción, clientes, infraestructura, sensores y automatización)*
- **Año 3:** replicación *(la finca inicial como piloto para productores vecinos)*

---

### 💰 Inversión y financiación

> **Presupuesto preliminar de estructuración.** Los valores deben sustituirse por cotizaciones locales antes de radicar la solicitud.

| Componente | Valor estimado (COP) |
|---|---:|
| Inversión productiva | $36.000.000 |
| Tecnología y trazabilidad *(\*)* | $4.500.000 |
| Capital de trabajo | $7.500.000 |
| **Inversión total** | **$48.000.000** |

*(\*) El MVP AgroTrace, dron DJI Avata 2, Starlink y computadores se aportan como contrapartida propia (**$0 financiable**).*

#### Estructura sugerida

| Fuente | Valor |
|---|---:|
| Crédito solicitado | **$40.000.000** |
| Aporte propio en efectivo | $4.000.000 |
| Aporte propio en activos/equipos | $4.000.000+ |
| **Proyecto** | **$48.000.000+** |

**Principio financiero fundamental:** *no financiar con deuda todo lo que todavía no tiene mercado.*

```text
INFRAESTRUCTURA → PRODUCCIÓN PEQUEÑA → CLIENTES
       → FLUJO DE CAJA → VALIDACIÓN → AMPLIACIÓN
```

Posibles canales: bancos comerciales con líneas **FINAGRO**, Banco Agrario, cooperativas financieras, programas de FINAGRO y programas públicos vigentes *(tasas y disponibilidad a verificar al momento de radicar)*.

---

### 📈 Indicadores y metas

| Categoría | Indicadores |
|---|---|
| **Productivos** | Animales, huevos/día, kg de pescado/carne/fruta, mortalidad, consumo de alimento |
| **Comerciales** | Clientes activos, ventas mensuales, ticket promedio, % venta directa, recompra |
| **Tecnológicos** | Lotes trazados, productos con QR, eventos registrados, evidencias digitales, registros anclados en Stellar |
| **Financieros** | Ingresos, costos, margen bruto, flujo de caja, servicio de deuda, punto de equilibrio |

#### ✅ Éxito al mes 12

- AgroTrace funcionando con **al menos 50 lotes/eventos trazables** y QR operando
- Producción de huevos estable y primer ciclo de peces y porcinos
- **20–30 clientes recurrentes** con ventas directas verificables
- Flujo de caja mensual e historial digital útil para futura ampliación del crédito

---

### ⚠️ Supuestos y riesgos

**Supuestos:**

1. **Los consumidores valoran la trazabilidad:** si no consultan la información, blockchain tendría poco valor comercial.
2. **Los productores están dispuestos a registrar información:** el sistema debe ser sencillo por lote.
3. **La información es confiable desde el origen:** blockchain protege la integridad del registro, no la verdad del dato inicial.

**Riesgos y mitigación principales:**

| Riesgo | Mitigación |
|---|---|
| Enfermedades / mortalidad | Bioseguridad, registros sanitarios y asistencia veterinaria |
| Sequía / inundación | Reservas de agua y drenajes |
| Alteración de registros | Hash SHA-256 + Stellar |
| Pérdida de datos | Backups |
| Intermediarios | Venta directa y clientes recurrentes |
| Baja demanda | Empezar con producción pequeña |
| Sobreendeudamiento | Inversión por fases |

La hipótesis quedará invalidada si una base de datos tradicional o una integración entre sistemas existentes logra el mismo nivel de confianza con menor complejidad: por eso se comienza con un **MVP pequeño** y se mide el uso real antes de escalar.

---

### 📋 Requisitos regulatorios

Antes de adquirir animales y operar comercialmente debe verificarse la situación del predio ante el **ICA** y las obligaciones sanitarias de cada especie (Registro Sanitario de Predio Pecuario, trazabilidad bovina, guías de movilización, permisos ambientales, entre otros).

La plataforma **no reemplaza** los registros oficiales: es una **capa tecnológica complementaria**.

---

### 🌱 Visión

> **Convertir una finca de 6 hectáreas de Guarumo en un modelo demostrativo de producción agropecuaria diversificada, comercialización directa y trazabilidad verificable, utilizando tecnología para aumentar la confianza del consumidor y mejorar la gestión del productor.**

[⬆ Volver al inicio](#-agro-cassis)

---

## 🇺🇸 English

> ### *"From the farm to the customer, with verifiable traceability."* 🇨🇴

---

### 📖 About the project

**AgroTrace Rural** is a food traceability project that aims to create a **farm → customer** channel: reducing dependence on intermediaries and allowing consumers to verify the origin of the products they buy through a **QR code**.

At the core of the project is the **AgroTrace** platform, a digital record system with **SHA-256** cryptographic fingerprints and selective anchoring of events on the **Stellar** network. Documents, photographs and videos are **not stored on blockchain**: they are kept in digital storage and only their cryptographic fingerprint, date, batch and reference are recorded, so a later modification of the file can be detected.

#### 📍 Pilot context

| | |
|---|---|
| **Location** | Guarumo, Cáceres — Bajo Cauca, Antioquia |
| **Area** | 6 hectares |
| **Production** | 🐟 Fish · 🐔 Laying hens · 🦆 Ducks · 🐖 Pigs · 🐄 Cattle · 🌳 Fruit trees |
| **Pilot product** | Egg crate with a digital QR passport |
| **Preliminary investment** | COP $48,000,000 |
| **Horizon** | 36 months, with a first stage of 12 months |

---

### 📑 Contents

1. [❓ The problem](#-the-problem)
2. [💡 Opportunity and hypothesis](#-opportunity-and-hypothesis)
3. [✅ Why blockchain?](#-why-blockchain)
4. [🏗️ Architecture](#-architecture)
5. [🔄 Traceability flow](#-traceability-flow)
6. [🌾 Production model](#-production-model)
7. [🛒 Direct sales](#-direct-sales)
8. [👥 Team and roles](#-team-and-roles)
9. [🗺️ Timeline](#-timeline)
10. [💰 Investment and financing](#-investment-and-financing)
11. [📈 Indicators and goals](#-indicators-and-goals)
12. [⚠️ Assumptions and risks](#-assumptions-and-risks)
13. [📋 Regulatory requirements](#-regulatory-requirements)
14. [🌱 Vision](#-vision)

---

### ❓ The problem

Consumers **cannot easily know or verify the origin and the production process** of the agricultural products they buy. For the small producer, keeping this information organized also means extra work when manual records, photographs, documents and separate conversations are used.

The main identified frictions are:

1. **Recording information:** manual records mean extra effort and a higher chance of errors.
2. **Organizing evidence:** photos, documents and records are in different places.
3. **Demonstrating origin:** when selling, it is hard to present all the product information.
4. **Consumer inquiry:** consumers receive limited information about the origin and the process.
5. **Information exchange:** each actor keeps its own records; there is no shared history.

> 🗳️ **Decision on the problem:** proposed by **Napoleon de Jesus Anaya Romero** and chosen by a team **vote** among the submitted proposals.

---

### 💡 Opportunity and hypothesis

> 💡 **Prioritized opportunity:** improving the verification of the origin and history of each agricultural batch.

It directly connects producer and consumer and creates value for both: the producer organizes records better and the consumer accesses batch information through a **QR code**.

> 🔒 **Hypothesis:** a verifiable, hard-to-alter record could increase confidence in traceability information.

In each batch:

- a **unique identifier**;
- records and evidence stored in the system with a **SHA-256** fingerprint;
- a reference to the fingerprint registered on **Stellar**;
- photographs and videos **off-chain**;
- public lookup by scanning the **QR** (origin, batch, date and evidence).

The hypothesis will be validated through a **small MVP** and testing with real users.

---

### ✅ Why blockchain?

**Main criterion:**

> ✅ *Multiple parties need to share a verifiable record and there is an interest in preserving the history of the records.*

Producer, intermediaries and consumers are actors who need to consult information about the same batch and preserve its history without untracked changes.

**Fundamental rule:** *the complete data remains off the blockchain.* On Stellar, only the minimum data needed to verify integrity is registered:

```text
lote_id
evento
timestamp
hash
referencia
```

This reduces costs and protects sensitive information. Operational information remains in a traditional database; blockchain is used only where it adds an additional feature: **proving that evidence existed at a given time and was not modified without leaving a trace**. Relevance must be validated by comparing cost, complexity and benefit against a solution based solely on a traditional database.

---

### 🏗️ Architecture

```text
                 FINCA GUARUMO
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
              +----------+----------+
              |                     |
          PostgreSQL             Storage
              |                     |
              +----------+----------+
                         |
                   SHA-256 HASH
                         |
                      STELLAR
                         |
                       QR WEB
                         |
                      CUSTOMER
```

---

### 🔄 Traceability flow

Example: an egg crate.

```text
Hens GAL-001
       ↓
Daily production
       ↓
Batch HUE-2027-001
       ↓
Sorting → Packing → QR generation
       ↓
SHA-256 hash → Verifiable record
       ↓
Order → Dispatch → Delivery
       ↓
Customer
```

The customer visits:

```text
https://agrotrace.example/lote/HUE-2027-001
```

The page shows the public information of the batch and a **verification indicator**.

---

### 🌾 Production model

Preliminary distribution of the 6 hectares *(subject to topographic survey, water, soil and environmental regulations)*:

| Area | Hectares | Use |
|---|---:|---|
| Cattle farming | 3.00 ha | Rotational grazing and cattle management |
| Fish farming | 0.70 ha | Ponds, circulation and technical area |
| Laying hens | 0.25 ha | Coop, yard, warehouse and biosecurity |
| Ducks | 0.15 ha | Integrated area with water management |
| Pigs | 0.25 ha | Piggery, waste management and sanitary area |
| Fruit trees | 1.10 ha | Mango, guava, citrus, papaya or other adapted species |
| Infrastructure and reserve | 0.55 ha | House/warehouse, access, water, composting and service areas |
| **TOTAL** | **6.00 ha** | |

#### Initial goals

- 🐔 **Laying hens:** 80–120 birds *(pilot product: egg crate with QR)*
- 🐟 **Fish farming:** 1–2 small ponds, depending on water availability
- 🦆 **Ducks:** 20–30 animals *(complementary unit)*
- 🐖 **Pigs:** small fattening batch
- 🐄 **Cattle:** small herd according to carrying capacity
- 🌳 **Fruit trees:** 1.1 ha of adapted species with commercial outlet

**Design principle:** production capacity is not filled in the first year; the project advances **in phases** so that production generates cash before expanding.

---

### 🛒 Direct sales

| Channel | Description |
|---|---|
| **1. WhatsApp** | Catalog → order → confirmation → payment → dispatch |
| **2. Website** | Catalog: eggs, fish, fruit, pork, permitted beef products and other products |
| **3. Recurring customers** | Weekly plans: **Finca Guarumo Basket** (eggs, seasonal fruit, fish when available) |

**Initial goal:** 20–30 recurring customers in Cáceres and Bajo Cauca, with later expansion to Medellín.

---

### 👥 Team and roles

- **Members:**
  - Cristian Esteban Jiménez Durango — `CristianEstebanJimenezDurango`
  - Jefferson Cabrera — *\[GitHub username pending\]*
  - Napoleon de Jesus Anaya Romero — `alucart2005`
  - Diego Martínez — *\[GitHub username pending\]*
- **Role:** Programming / Reports
- **Deliverables owner:** Napoleon de Jesus Anaya Romero
- **Internal coordination channel:** GitHub Issues

---

### 🗺️ Timeline

| Phase | Month | Content |
|---|---|---|
| **0 — Preparation** | 0–1 | Survey, water/soil analysis, quotes, ICA requirements, financial design, credit application and MVP design |
| **1 — Infrastructure** | 2–3 | Water, fences, drains, coop, pigsty, ponds, warehouse and composting |
| **2 — First production cycle** | 3–6 | Hens, ducks, first pig batch, fry, fruit trees and cattle within capacity |
| **3 — AgroTrace MVP** | 2–4 | Login, farms, batches, animals, production, inventory, sales, QR, history, hash and Stellar anchoring *(pilot product: eggs)* |
| **4 — Sales** | 4–8 | Catalog, WhatsApp Business, website, QR, customer base and orders |
| **5 — Consolidation** | 7–12 | Progressive addition of fish, fruit, pigs, ducks and cattle |

#### Financial horizon

- **Year 1:** production + traceability + customers *(working MVP, first traceable batches, cash flow)*
- **Year 2:** scale *(more production, customers, infrastructure, sensors and automation)*
- **Year 3:** replication *(the initial farm as a pilot for neighboring producers)*

---

### 💰 Investment and financing

> **Preliminary structuring budget.** Values must be replaced with local quotes before submitting the application.

| Component | Estimated value (COP) |
|---|---:|
| Productive investment | $36,000,000 |
| Technology and traceability *(\*)* | $4,500,000 |
| Working capital | $7,500,000 |
| **Total investment** | **$48,000,000** |

*(\*) The AgroTrace MVP, DJI Avata 2 drone, Starlink and computers are contributed as own counterpart (**$0 financeable**).*

#### Suggested structure

| Source | Value |
|---|---:|
| Requested credit | **$40,000,000** |
| Own cash contribution | $4,000,000 |
| Own contribution in assets/equipment | $4,000,000+ |
| **Project** | **$48,000,000+** |

**Fundamental financial principle:** *do not finance with debt everything that does not yet have a market.*

```text
INFRASTRUCTURE → SMALL PRODUCTION → CUSTOMERS
       → CASH FLOW → VALIDATION → EXPANSION
```

Possible channels: commercial banks with **FINAGRO** lines, Banco Agrario, financial cooperatives, FINAGRO programs and current public programs *(rates and availability to be verified at submission)*.

---

### 📈 Indicators and goals

| Category | Indicators |
|---|---|
| **Productive** | Animals, eggs/day, kg of fish/meat/fruit, mortality, feed consumption |
| **Commercial** | Active customers, monthly sales, average ticket, % direct sales, repeat purchases |
| **Technological** | Tracked batches, QR products, registered events, digital evidence, records anchored on Stellar |
| **Financial** | Revenue, costs, gross margin, cash flow, debt service, break-even point |

#### ✅ Success at month 12

- AgroTrace running with **at least 50 traceable batches/events** and a working QR
- Stable egg production and first fish and pig cycles
- **20–30 recurring customers** with verifiable direct sales
- Monthly cash flow and a digital history useful for future credit expansion

---

### ⚠️ Assumptions and risks

**Assumptions:**

1. **Consumers value traceability:** if they do not consult the information, blockchain would have little commercial value.
2. **Producers are willing to record information:** the system must be simple enough per batch.
3. **Information is reliable from the source:** blockchain protects the integrity of the record, not the truth of the initial data.

**Main risks and mitigation:**

| Risk | Mitigation |
|---|---|
| Diseases / mortality | Biosecurity, health records and veterinary assistance |
| Drought / flooding | Water reserves and drainage |
| Record tampering | SHA-256 hash + Stellar |
| Data loss | Backups |
| Intermediaries | Direct sales and recurring customers |
| Low demand | Start with small production |
| Over-indebtedness | Investment in phases |

The hypothesis would be invalidated if a traditional database or an integration between existing systems achieves the same level of trust with less complexity: that is why we start with a **small MVP** and measure real usage before scaling.

---

### 📋 Regulatory requirements

Before acquiring animals and operating commercially, the property's status must be checked with **ICA** and the sanitary obligations of each species (Livestock Farm Health Registration, bovine traceability, movement permits, environmental permits, among others).

The platform **does not replace** official records: it is a **complementary technological layer**.

---

### 🌱 Vision

> **Turning a 6-hectare farm in Guarumo into a demonstrative model of diversified agricultural production, direct sales and verifiable traceability, using technology to increase consumer confidence and improve the producer's management.**

[⬆ Back to top](#-agro-cassis)

---

## 🇧🇷 Português

> ### *"Do campo ao cliente, com rastreabilidade verificável."* 🇨🇴

---

### 📖 Sobre o projeto

**AgroTrace Rural** é um projeto de rastreabilidade alimentar que busca criar um canal **fazenda → cliente**: reduzir a dependência de intermediários e permitir que o consumidor verifique a origem dos produtos que compra por meio de um **código QR**.

No centro do projeto está a plataforma **AgroTrace**, um sistema de registros digitais com impressões criptográficas **SHA-256** e ancoragem seletiva de eventos na rede **Stellar**. Documentos, fotografias e vídeos **não são armazenados na blockchain**: ficam em armazenamento digital e apenas sua impressão criptográfica, data, lote e referência são registrados, de modo que qualquer modificação posterior do arquivo possa ser detectada.

#### 📍 Contexto do piloto

| | |
|---|---|
| **Localização** | Guarumo, Cáceres — Bajo Cauca, Antioquia |
| **Área** | 6 hectares |
| **Produção** | 🐟 Peixes · 🐔 Galinhas poedeiras · 🦆 Patos · 🐖 Suínos · 🐄 Bovinos · 🌳 Frutiras |
| **Produto piloto** | Caixa de ovos com passe digital QR |
| **Investimento preliminar** | $48.000.000 COP |
| **Horizonte** | 36 meses, com primeira etapa de 12 meses |

---

### 📑 Conteúdo

1. [❓ O problema](#-o-problema)
2. [💡 Oportunidade e hipótese](#-oportunidade-e-hipótese)
3. [✅ Por que blockchain?](#-por-que-blockchain)
4. [🏗️ Arquitetura](#-arquitetura)
5. [🔄 Fluxo de rastreabilidade](#-fluxo-de-rastreabilidade)
6. [🌾 Modelo produtivo](#-modelo-produtivo)
7. [🛒 Venda direta](#-venda-direta)
8. [👥 Equipe e papéis](#-equipe-e-papéis)
9. [🗺️ Cronograma do projeto](#-cronograma-do-projeto)
10. [💰 Investimento e financiamento](#-investimento-e-financiamento)
11. [📈 Indicadores e metas](#-indicadores-e-metas)
12. [⚠️ Premissas e riscos](#-premissas-e-riscos)
13. [📋 Requisitos regulatórios](#-requisitos-regulatórios)
14. [🌱 Visão](#-visão)

---

### ❓ O problema

Os consumidores **não conseguem conhecer nem verificar de forma simples a origem e o processo de produção** dos produtos agrícolas que compram. Para o pequeno produtor, manter essa informação organizada também representa trabalho adicional quando se usam registros manuais, fotografias, documentos e conversas independentes.

As principais fricções identificadas são:

1. **Registro de informação:** registros manuais geram esforço e possibilidade de erros.
2. **Organização de evidências:** fotos, documentos e registros estão em locais diferentes.
3. **Demonstração da origem:** na comercialização, é difícil apresentar todas as informações do produto.
4. **Consulta do consumidor:** recebe informação limitada sobre a origem e o processo.
5. **Intercâmbio de informação:** cada ator mantém seus próprios registros; não há história comum.

> 🗳️ **Decisão sobre o problema:** proposto por **Napoleon de Jesus Anaya Romero** e escolhido por **votação** da equipe entre as propostas apresentadas.

---

### 💡 Oportunidade e hipótese

> 💡 **Oportunidade priorizada:** melhorar a verificação da origem e do histórico de cada lote agrícola.

Conecta diretamente produtor e consumidor e gera valor para ambos: o produtor organiza melhor seus registros e o consumidor acessa a informação do lote por meio de um **código QR**.

> 🔒 **Hipótese:** um registro verificável e difícil de alterar poderia aumentar a confiança na informação de rastreabilidade.

Em cada lote:

- **identificador único**;
- registros e evidências armazenados no sistema com impressão **SHA-256**;
- referência da impressão registrada na **Stellar**;
- fotografias e vídeos **fora da cadeia**;
- consulta pública ao escanear o **QR** (origem, lote, data e evidências).

A hipótese será validada por meio de um **MVP pequeno** e testes com usuários reais.

---

### ✅ Por que blockchain?

**Critério principal:**

> ✅ *Várias partes precisam compartilhar um registro verificável e existe interesse em preservar o histórico dos registros.*

Produtor, intermediários e consumidor são atores que precisam consultar a informação do mesmo lote e preservar seu histórico sem alterações não registradas.

**Regra fundamental:** *os dados completos permanecem fora da blockchain.* Na Stellar são registrados apenas os dados mínimos necessários para verificar integridade:

```text
lote_id
evento
timestamp
hash
referencia
```

Isso reduz custos e protege informações sensíveis. A informação operacional permanece em um banco de dados tradicional; a blockchain é usada apenas onde acrescenta uma característica adicional: **provar que uma evidência existia em um momento determinado e que não foi modificada sem deixar rastro**. A pertinência deverá ser validada comparando custo, complexidade e benefício frente a uma solução baseada apenas em um banco de dados tradicional.

---

### 🏗️ Arquitetura

```text
                 FAZENDA GUARUMO
                         |
             +-----------+-----------+
             |                       |
        PRODUÇÃO               EVIDÊNCIAS
             |              Fotos / Vídeo
             |                       |
             +-----------+-----------+
                         |
                      AgroTrace
                         |
              +----------+----------+
              |                     |
          PostgreSQL             Storage
              |                     |
              +----------+----------+
                         |
                   SHA-256 HASH
                         |
                      STELLAR
                         |
                       QR WEB
                         |
                      CLIENTE
```

---

### 🔄 Fluxo de rastreabilidade

Exemplo: uma caixa de ovos.

```text
Galinhas GAL-001
       ↓
Produção diária
       ↓
Lote HUE-2027-001
       ↓
Classificação → Embalagem → Geração de QR
       ↓
Hash SHA-256 → Registro verificável
       ↓
Pedido → Despacho → Entrega
       ↓
Cliente
```

O cliente consulta:

```text
https://agrotrace.example/lote/HUE-2027-001
```

A página mostra a informação pública do lote e um **indicador de verificação**.

---

### 🌾 Modelo produtivo

Distribuição preliminar das 6 hectares *(sujeita a levantamento topográfico, água, solos e normas ambientais)*:

| Área | Hectares | Uso |
|---|---:|---|
| Pecuária bovina | 3,00 ha | Pastoreo rotacionado e manejo de bovinos |
| Piscicultura | 0,70 ha | Tanques, circulação e área técnica |
| Galinhas poedeiras | 0,25 ha | Galinheiro, pátio, galpão e biosegurança |
| Patos | 0,15 ha | Área integrada com manejo de água |
| Suínos | 0,25 ha | Chiqueiro, manejo de resíduos e zona sanitária |
| Frutiras | 1,10 ha | Manga, goiaba, cítricos, mamão ou outras espécies adaptadas |
| Infraestrutura e reserva | 0,55 ha | Casa/galpão, acessos, água, compostagem e serviços |
| **TOTAL** | **6,00 ha** | |

#### Metas iniciais

- 🐔 **Galinhas poedeiras:** 80–120 aves *(produto piloto: caixa de ovos com QR)*
- 🐟 **Piscicultura:** 1–2 pequenos tanques, conforme disponibilidade de água
- 🦆 **Patos:** 20–30 animais *(unidade complementar)*
- 🐖 **Suínos:** pequeno lote de engorda
- 🐄 **Bovinos:** pequeno rebanho conforme capacidade de carga
- 🌳 **Frutiras:** 1,1 ha de espécies adaptadas com saída comercial

**Princípio de projeto:** a capacidade produtiva não é preenchida no primeiro ano; o projeto avança **por fases** para que a produção gere caixa antes de ampliar.

---

### 🛒 Venda direta

| Canal | Descrição |
|---|---|
| **1. WhatsApp** | Catálogo → pedido → confirmação → pagamento → despacho |
| **2. Site** | Catálogo: ovos, peixes, frutas, carne de porco, produtos bovinos permitidos e outros produtos |
| **3. Clientes recorrentes** | Planos semanais: **Cesta Finca Guarumo** (ovos, fruta da estação, peixe conforme disponibilidade) |

**Meta inicial:** 20–30 clientes recorrentes em Cáceres e Bajo Cauca, com expansão posterior para Medellín.

---

### 👥 Equipe e papéis

- **Integrantes:**
  - Cristian Esteban Jiménez Durango — `CristianEstebanJimenezDurango`
  - Jefferson Cabrera — *\[usuário do GitHub pendente\]*
  - Napoleon de Jesus Anaya Romero — `alucart2005`
  - Diego Martínez — *\[usuário do GitHub pendente\]*
- **Função:** Programação / Relatórios
- **Responsável pelas entregas:** Napoleon de Jesus Anaya Romero
- **Canal de coordenação interna:** GitHub Issues

---

### 🗺️ Cronograma do projeto

| Fase | Mês | Conteúdo |
|---|---|---|
| **0 — Preparação** | 0–1 | Levantamento, análises de água/solo, cotações, requisitos ICA, desenho financeiro, solicitação de crédito e desenho do MVP |
| **1 — Infraestrutura** | 2–3 | Água, cercas, drenagens, galinheiro, chiqueiro, tanques, galpão e compostagem |
| **2 — Primeiro ciclo produtivo** | 3–6 | Galinhas, patos, primeiro lote suíno, alevinos, frutiras e bovinos conforme capacidade |
| **3 — MVP AgroTrace** | 2–4 | Login, fazendas, lotes, animais, produção, inventário, vendas, QR, histórico, hash e ancoragem na Stellar *(produto piloto: ovos)* |
| **4 — Comercialização** | 4–8 | Catálogo, WhatsApp Business, site, QR, base de clientes e pedidos |
| **5 — Consolidação** | 7–12 | Incorporação progressiva de peixes, frutas, suínos, patos e bovinos |

#### Horizonte financeiro

- **Ano 1:** produção + rastreabilidade + clientes *(MVP funcionando, primeiros lotes rastreáveis, fluxo de caixa)*
- **Ano 2:** escala *(mais produção, clientes, infraestrutura, sensores e automação)*
- **Ano 3:** replicação *(a fazenda inicial como piloto para produtores vizinhos)*

---

### 💰 Investimento e financiamento

> **Orçamento preliminar de estruturação.** Os valores devem ser substituídos por cotações locais antes de apresentar a solicitação.

| Componente | Valor estimado (COP) |
|---|---:|
| Investimento produtivo | $36.000.000 |
| Tecnologia e rastreabilidade *(\*)* | $4.500.000 |
| Capital de giro | $7.500.000 |
| **Investimento total** | **$48.000.000** |

*(\*) O MVP AgroTrace, o drone DJI Avata 2, o Starlink e os computadores são aportados como contrapartida própria (**$0 financiável**).*

#### Estrutura sugerida

| Fonte | Valor |
|---|---:|
| Crédito solicitado | **$40.000.000** |
| Aporte próprio em dinheiro | $4.000.000 |
| Aporte próprio em ativos/equipamentos | $4.000.000+ |
| **Projeto** | **$48.000.000+** |

**Princípio financeiro fundamental:** *não financiar com dívida tudo aquilo que ainda não tem mercado.*

```text
INFRAESTRUTURA → PRODUÇÃO PEQUENA → CLIENTES
       → FLUXO DE CAIXA → VALIDAÇÃO → AMPLIAÇÃO
```

Possíveis canais: bancos comerciais com linhas **FINAGRO**, Banco Agrário, cooperativas financeiras, programas do FINAGRO e programas públicos vigentes *(taxas e disponibilidade a verificar no momento da solicitação)*.

---

### 📈 Indicadores e metas

| Categoria | Indicadores |
|---|---|
| **Produtivos** | Animais, ovos/dia, kg de peixe/carne/fruta, mortalidade, consumo de ração |
| **Comerciais** | Clientes ativos, vendas mensais, ticket médio, % venda direta, recompra |
| **Tecnológicos** | Lotes rastreados, produtos com QR, eventos registrados, evidências digitais, registros ancorados na Stellar |
| **Financeiros** | Receitas, custos, margem bruta, fluxo de caixa, serviço da dívida, ponto de equilíbrio |

#### ✅ Sucesso no mês 12

- AgroTrace funcionando com **pelo menos 50 lotes/eventos rastreáveis** e QR operando
- Produção de ovos estável e primeiros ciclos de peixes e suínos
- **20–30 clientes recorrentes** com vendas diretas verificáveis
- Fluxo de caixa mensal e histórico digital útil para futura ampliação do crédito

---

### ⚠️ Premissas e riscos

**Premissas:**

1. **Os consumidores valorizam a rastreabilidade:** se não consultarem a informação, a blockchain teria pouco valor comercial.
2. **Os produtores estão dispostos a registrar informação:** o sistema deve ser simples por lote.
3. **A informação é confiável desde a origem:** a blockchain protege a integridade do registro, não a verdade do dado inicial.

**Principais riscos e mitigação:**

| Risco | Mitigação |
|---|---|
| Doenças / mortalidade | Biosegurança, registros sanitários e assistência veterinária |
| Seca / inundação | Reservas de água e drenagens |
| Alteração de registros | Hash SHA-256 + Stellar |
| Perda de dados | Backups |
| Intermediários | Venda direta e clientes recorrentes |
| Baixa demanda | Começar com produção pequena |
| Sobreendividamento | Investimento por fases |

A hipótese ficaria invalidada se um banco de dados tradicional ou uma integração entre sistemas existentes alcançasse o mesmo nível de confiança com menor complexidade: por isso começa-se com um **MVP pequeno** e mede-se o uso real antes de escalar.

---

### 📋 Requisitos regulatórios

Antes de adquirir animais e operar comercialmente, deve-se verificar a situação do predio junto ao **ICA** e as obrigações sanitárias de cada espécie (Registro Sanitário de Predio Pecuario, rastreabilidade bovina, guias de movimentação, licenças ambientais, entre outros).

A plataforma **não substitui** os registros oficiais: é uma **camada tecnológica complementar**.

---

### 🌱 Visão

> **Transformar uma fazenda de 6 hectares de Guarumo em um modelo demonstrativo de produção agropecuária diversificada, venda direta e rastreabilidade verificável, utilizando tecnologia para aumentar a confiança do consumidor e melhorar a gestão do produtor.**

[⬆ Voltar ao início](#-agro-cassis)
