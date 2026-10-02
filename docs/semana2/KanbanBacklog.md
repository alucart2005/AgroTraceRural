# 📋 Kanban Backlog: AgroTrace Rural

> **Proyecto:** AgroTrace Rural · **Módulo:** Trazabilidad Agrícola Verificable · **Board:** [GitHub Projects](https://github.com/users/alucart2005/projects/1)

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-01 Registro de lote](#-hu-01-registro-de-lote-por-el-productor) · [HU-02 Origen vía QR](#-hu-02-consulta-de-origen-mediante-código-qr) · [HU-03 Integridad on-chain](#-hu-03-verificación-de-integridad-on-chain-en-stellar) · [HU-04 QR de empaque](#-hu-04-generación-e-impresión-de-qr-para-empaque) · [HU-05 Historial](#-hu-05-consulta-de-historial-de-eventos-por-distribuidor)

---

### 📌 HU-01: Registro de Lote por el Productor

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola

> **Como** pequeño productor agrícola, **quiero** registrar cada lote cosechado (especificando fecha, cantidad y adjuntando foto de evidencia), **para** tener un respaldo organizado del origen de mi producción.

#### 🧪 Criterios de aceptación (HU-01) — Dado / Cuando / Entonces

- **Escenario 1: Registro exitoso de lote con evidencia fotográfica.**
  - **Dado** que el productor ha iniciado sesión en la plataforma móvil de AgroTrace,
  - **Cuando** diligencia el formulario con la fecha de recolección, selecciona la línea "Huevos Guarumo", ingresa la cantidad (ej. 10 cubetas) y adjunta una fotografía del galpón/cosecha,
  - **Entonces** el sistema debe crear el lote con un identificador único (ej. `HUE-2027-001`), guardar los datos en la base de datos y mostrar una confirmación exitosa en pantalla.
- **Escenario 2: Intento de registro sin imagen de evidencia.**
  - **Dado** que el productor completa los campos de texto del formulario de lote,
  - **Cuando** intenta guardar el registro sin adjuntar ninguna foto de evidencia,
  - **Entonces** el sistema debe bloquear el envío y mostrar un mensaje solicitando cargar al menos una imagen antes de guardar.

[⬆ Volver al inicio](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-02: Consulta de Origen mediante Código QR

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Consumidor Final

> **Como** consumidor final, **quiero** escanear un código QR en la etiqueta de la cubeta de huevos, **para** verificar la finca de origen, la fecha de recolección y las fotografías de evidencia antes de comprar.

#### 🧪 Criterios de aceptación (HU-02) — Dado / Cuando / Entonces

- **Escenario 1: Lectura correcta de código QR existente.**
  - **Dado** que el consumidor tiene una cubeta de huevos con la etiqueta QR impresa de AgroTrace,
  - **Cuando** escanea el código QR utilizando la cámara de su teléfono móvil,
  - **Entonces** el navegador web debe redirigir a la vista pública del lote (`/lote/HUE-2027-001`), desplegando el nombre de la finca "Guarumo", municipio "Cáceres", fecha de postura y la fotografía de evidencia capturada.
- **Escenario 2: Escaneo de código QR inexistente o alterado.**
  - **Dado** que el consumidor escanea un código QR que no corresponde a ningún lote activo en el sistema,
  - **Cuando** la página web intenta consultar la información,
  - **Entonces** la plataforma debe mostrar una pantalla de alerta indicando que el lote no existe o que el código no es auténtico.

[⬆ Volver al inicio](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-03: Verificación de Integridad On-Chain en Stellar

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Verificador / Autoridad Sanitaria / Cliente Institucional

> **Como** verificado / autoridad sanitaria o comprador institucional, **quiero** validar que la huella digital del historial de un lote coincida con la registrada en el momento de la cosecha, **para** comprobar que la información no ha sido alterada ni manipulada.

#### 🧪 Criterios de aceptación (HU-03) — Dado / Cuando / Entonces

- **Escenario 1: Confirmación de integridad sin alteraciones (datos intactos).**
  - **Dado** que un usuario está consultando la página pública de un lote registrado,
  - **Cuando** hace clic en el botón "Verificar Integridad On-Chain",
  - **Entonces** el sistema recalcula la huella SHA-256 de los datos actuales, la compara con el Hash registrado en Stellar Testnet y muestra una insignia verde de "Información Verificada e Inalterada" con el ID de la transacción.
- **Escenario 2: Detección de modificación no autorizada en la base de datos.**
  - **Dado** que un dato del lote (ej. la fecha o la foto) fue modificado posteriormente en la base de datos local,
  - **Cuando** el usuario ejecuta la verificación de integridad,
  - **Entonces** el Hash calculado no coincidirá con el registrado en Stellar y el sistema mostrará una alerta roja advirtiendo que la información fue alterada.

[⬆ Volver al inicio](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-04: Generación e Impresión de QR para Empaque

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Responsable de Empaque y Despacho

> **Como** responsable de empaque y despacho, **quiero** generar un código QR único para cada lote embalado, **para** asegurar que el empaque físico corresponda exactamente al registro digital.

#### 🧪 Criterios de aceptación (HU-04) — Dado / Cuando / Entonces

- **Escenario 1: Generación de etiqueta lista para impresión.**
  - **Dado** que el usuario de empaque selecciona un lote activo recién clasificado en la plataforma,
  - **Cuando** presiona la opción "Generar Etiqueta QR",
  - **Entonces** el sistema genera una vista previa imprimible del código QR que contiene la URL directa del lote, acompañada del logo de AgroTrace Rural y la fecha de empaque.

[⬆ Volver al inicio](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-05: Consulta de Historial de Eventos por Distribuidor

> 🟠 **Debería (Should Have)** · 👤 **Rol:** Comprador / Distribuidor Local

> **Como** comprador o distribuidor local, **quiero** consultar la secuencia de eventos de un lote (cosecha, empaque y despacho), **para** validar la frescura y tiempos de entrega antes de comercializarlos.

#### 🧪 Criterios de aceptación (HU-05) — Dado / Cuando / Entonces

- **Escenario 1: Visualización cronológica de la cadena de custodia.**
  - **Dado** que un distribuidor local ingresa el identificador del lote en el buscador de la plataforma,
  - **Cuando** accede al detalle del producto,
  - **Entonces** el sistema despliega una línea de tiempo numerada con las fechas y horas exactas en que se registraron la recolección, la clasificación y la salida hacia transporte.

[⬆ Volver al inicio](#-kanban-backlog-agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-01 Batch registration](#-hu-01-farmer-batch-registration) · [HU-02 Origin via QR](#-hu-02-consumer-origin-lookup-via-qr) · [HU-03 On-chain integrity](#-hu-03-on-chain-integrity-verification-on-stellar) · [HU-04 Packaging QR](#-hu-04-qr-label-generation-and-printing-for-packaging) · [HU-05 History](#-hu-05-event-history-lookup-by-distributor)

---

### 📌 HU-01: Farmer batch registration

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer

> **As a** smallholder farmer, **I want to** register each harvested batch (specifying date, quantity and attaching an evidence photo), **so that** I have an organized backup of the origin of my production.

#### 🧪 Acceptance criteria (HU-01) — Given / When / Then

- **Scenario 1: Successful batch registration with photo evidence.**
  - **Given** the farmer has logged in to the AgroTrace mobile platform,
  - **When** they fill in the form with the harvest date, select the "Huevos Guarumo" line, enter the quantity (e.g. 10 crates) and attach a photo of the coop/harvest,
  - **Then** the system must create the batch with a unique identifier (e.g. `HUE-2027-001`), save the data to the database and display a success confirmation on screen.
- **Scenario 2: Attempt to register without evidence image.**
  - **Given** the farmer completes the batch form's text fields,
  - **When** they try to save the record without attaching any evidence photo,
  - **Then** the system must block the submission and show a message asking to upload at least one image before saving.

[⬆ Back to top](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-02: Consumer origin lookup via QR

> 🔴 **Must Have** · 👤 **Role:** End Consumer

> **As an** end consumer, **I want to** scan a QR code on the egg crate label, **so that** I can verify the source farm, the harvest date and the evidence photos before buying.

#### 🧪 Acceptance criteria (HU-02) — Given / When / Then

- **Scenario 1: Successful read of an existing QR code.**
  - **Given** the consumer has an egg crate with the printed AgroTrace QR label,
  - **When** they scan the QR code using their phone camera,
  - **Then** the web browser must redirect to the public batch view (`/lote/HUE-2027-001`), showing the farm name "Guarumo", the municipality "Cáceres", the laying date and the captured evidence photo.
- **Scenario 2: Scan of a nonexistent or altered QR code.**
  - **Given** the consumer scans a QR code that does not match any active batch in the system,
  - **When** the website tries to fetch the information,
  - **Then** the platform must display an alert screen indicating that the batch does not exist or that the code is not authentic.

[⬆ Back to top](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-03: On-chain integrity verification on Stellar

> 🔴 **Must Have** · 👤 **Role:** Verifier / Health Authority / Institutional Client

> **As a** verifier / health authority or institutional buyer, **I want to** validate that the digital fingerprint of a batch's history matches the one recorded at harvest time, **so that** I can confirm the information has not been altered or manipulated.

#### 🧪 Acceptance criteria (HU-03) — Given / When / Then

- **Scenario 1: Integrity confirmation with no alterations (intact data).**
  - **Given** a user is viewing the public page of a registered batch,
  - **When** they click the "Verify On-Chain Integrity" button,
  - **Then** the system recalculates the SHA-256 fingerprint of the current data, compares it with the hash recorded on Stellar Testnet and displays a green badge of "Verified and Unaltered Information" with the transaction ID.
- **Scenario 2: Detection of unauthorized modification in the database.**
  - **Given** a batch field (e.g. the date or photo) was modified afterwards in the local database,
  - **When** the user runs the integrity verification,
  - **Then** the calculated hash will not match the one recorded on Stellar and the system will display a red alert warning that the information was altered.

[⬆ Back to top](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-04: QR label generation and printing for packaging

> 🟠 **Should Have** · 👤 **Role:** Packaging and Dispatch Lead

> **As the** person in charge of packaging and dispatch, **I want to** generate a unique QR code for each packaged batch, **so that** the physical package exactly matches the digital record.

#### 🧪 Acceptance criteria (HU-04) — Given / When / Then

- **Scenario 1: Generation of a print-ready label.**
  - **Given** the packaging user selects an active, freshly sorted batch on the platform,
  - **When** they press the "Generate QR Label" option,
  - **Then** the system generates a printable preview of the QR code containing the batch's direct URL, along with the AgroTrace Rural logo and the packaging date.

[⬆ Back to top](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-05: Event history lookup by distributor

> 🟠 **Should Have** · 👤 **Role:** Buyer / Local Distributor

> **As a** local buyer or distributor, **I want to** look up the sequence of events of a batch (harvest, packaging and dispatch), **so that** I can validate freshness and delivery times before selling them.

#### 🧪 Acceptance criteria (HU-05) — Given / When / Then

- **Scenario 1: Chronological view of the chain of custody.**
  - **Given** a local distributor enters the batch identifier in the platform's search box,
  - **When** they access the product detail,
  - **Then** the system displays a numbered timeline with the exact dates and times at which collection, sorting and dispatch to transport were recorded.

[⬆ Back to top](#-kanban-backlog-agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-01 Registro de lote](#-hu-01-registro-de-lote-pelo-produtor) · [HU-02 Origem via QR](#-hu-02-consulta-de-origem-via-código-qr) · [HU-03 Integridade on-chain](#-hu-03-verificação-de-integridade-on-chain-na-stellar) · [HU-04 QR de embalagem](#-hu-04-geração-e-impressão-de-qr-para-embalagem) · [HU-05 Histórico](#-hu-05-consulta-de-histórico-de-eventos-pelo-distribuidor)

---

### 📌 HU-01: Registro de lote pelo produtor

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola

> **Como** pequeno produtor agrícola, **quero** registrar cada lote colhido (especificando data, quantidade e anexando foto de evidência), **para** ter um respaldo organizado da origem da minha produção.

#### 🧪 Critérios de aceitação (HU-01) — Dado / Quando / Então

- **Cenário 1: Registro bem-sucedido de lote com evidência fotográfica.**
  - **Dado** que o produtor iniciou sessão na plataforma móvel da AgroTrace,
  - **Quando** preenche o formulário com a data de colheita, seleciona a linha "Huevos Guarumo", informa a quantidade (ex.: 10 caixas) e anexa uma fotografia do galinheiro/colheita,
  - **Então** o sistema deve criar o lote com um identificador único (ex.: `HUE-2027-001`), gravar os dados no banco e exibir uma confirmação de sucesso na tela.
- **Cenário 2: Tentativa de registro sem imagem de evidência.**
  - **Dado** que o produtor preenche os campos de texto do formulário de lote,
  - **Quando** tenta salvar o registro sem anexar nenhuma foto de evidência,
  - **Então** o sistema deve bloquear o envio e exibir uma mensagem solicitando carregar pelo menos uma imagem antes de salvar.

[⬆ Voltar ao topo](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-02: Consulta de origem via código QR

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Consumidor Final

> **Como** consumidor final, **quero** escanear um código QR na etiqueta da caixa de ovos, **para** verificar a fazenda de origem, a data de colheita e as fotografias de evidência antes de comprar.

#### 🧪 Critérios de aceitação (HU-02) — Dado / Quando / Então

- **Cenário 1: Leitura correta de código QR existente.**
  - **Dado** que o consumidor tem uma caixa de ovos com a etiqueta QR impressa da AgroTrace,
  - **Quando** escaneia o código QR com a câmera do celular,
  - **Então** o navegador deve redirecionar para a visão pública do lote (`/lote/HUE-2027-001`), exibindo o nome da fazenda "Guarumo", o município "Cáceres", a data de postura e a fotografia de evidência capturada.
- **Cenário 2: Escaneamento de código QR inexistente ou alterado.**
  - **Dado** que o consumidor escaneia um código QR que não corresponde a nenhum lote ativo no sistema,
  - **Quando** o site tenta consultar a informação,
  - **Então** a plataforma deve exibir uma tela de alerta indicando que o lote não existe ou que o código não é autêntico.

[⬆ Voltar ao topo](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-03: Verificação de integridade on-chain na Stellar

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Verificador / Autoridade Sanitária / Cliente Institucional

> **Como** verificador / autoridade sanitária ou comprador institucional, **quero** validar que a impressão digital do histórico de um lote corresponde à registrada no momento da colheita, **para** comprovar que a informação não foi alterada nem manipulada.

#### 🧪 Critérios de aceitação (HU-03) — Dado / Quando / Então

- **Cenário 1: Confirmação de integridade sem alterações (dados intactos).**
  - **Dado** que um usuário está consultando a página pública de um lote registrado,
  - **Quando** clica no botão "Verificar Integridade On-Chain",
  - **Então** o sistema recalcula a impressão digital SHA-256 dos dados atuais, compara com o hash registrado na Stellar Testnet e exibe um selo verde de "Informação Verificada e Inalterada" com o ID da transação.
- **Cenário 2: Detecção de modificação não autorizada no banco de dados.**
  - **Dado** que um dado do lote (ex.: a data ou a foto) foi modificado posteriormente no banco local,
  - **Quando** o usuário executa a verificação de integridade,
  - **Então** o hash calculado não corresponderá ao registrado na Stellar e o sistema exibirá um alerta vermelho avisando que a informação foi alterada.

[⬆ Voltar ao topo](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-04: Geração e impressão de QR para embalagem

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Responsável pela Embalagem e Despacho

> **Como** responsável pela embalagem e despacho, **quero** gerar um código QR único para cada lote embalado, **para** garantir que a embalagem física corresponda exatamente ao registro digital.

#### 🧪 Critérios de aceitação (HU-04) — Dado / Quando / Então

- **Cenário 1: Geração de etiqueta pronta para impressão.**
  - **Dado** que o usuário de embalagem seleciona um lote ativo recém-classificado na plataforma,
  - **Quando** pressiona a opção "Gerar Etiqueta QR",
  - **Então** o sistema gera uma pré-visualização imprimível do código QR que contém a URL direta do lote, acompanhada do logo da AgroTrace Rural e da data de embalagem.

[⬆ Voltar ao topo](#-kanban-backlog-agrotrace-rural)

---

### 📌 HU-05: Consulta de histórico de eventos pelo distribuidor

> 🟠 **Deveria (Should Have)** · 👤 **Papel:** Comprador / Distribuidor Local

> **Como** comprador ou distribuidor local, **quero** consultar a sequência de eventos de um lote (colheita, embalagem e despacho), **para** validar a frescura e os prazos de entrega antes de comercializá-los.

#### 🧪 Critérios de aceitação (HU-05) — Dado / Quando / Então

- **Cenário 1: Visualização cronológica da cadeia de custódia.**
  - **Dado** que um distribuidor local informa o identificador do lote na busca da plataforma,
  - **Quando** acessa o detalhe do produto,
  - **Então** o sistema exibe uma linha do tempo numerada com as datas e horários exatos em que a colheita, a classificação e a saída para o transporte foram registrados.

[⬆ Voltar ao topo](#-kanban-backlog-agrotrace-rural)
