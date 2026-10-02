# 📋 Roles del MVP — Agro Cassis

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

> **Proyecto:** Agro Cassis · **Contexto:** #BafBootCampCol
> **Alcance:** definición de los dos roles mínimos necesarios para construir y validar el MVP descrito en el Problem Brief.

---

### Resumen ejecutivo

| Rol | Misión | Entregable principal |
| :--- | :--- | :--- |
| 💻 **Programación** | Construir y mantener el MVP funcional de punta a punta: registrar un lote, generarlo con QR y anclar su huella en Stellar. | MVP desplegado con verificación on-chain |
| 📄 **Informes** | Asegurar que el proyecto se entienda, se entregue a tiempo en el bootcamp y esté validado con usuarios reales. | Documentación al día + registro de validación |

> **Principio rector:** un rol no reemplaza al otro. Programación demuestra *qué funciona*; Informes demuestra *que importa y que se entrega*.

---

### 1. 💻 Rol: Programación

#### 1.1 Misión

Construir, integrar y mantener el MVP descrito en el Problem Brief: cada lote recibe un **ID único**, su información se almacena en una **base de datos tradicional**, su huella **SHA-256** se ancla en **Stellar**, y el consumidor lo consulta mediante un **código QR**.

#### 1.2 Responsabilidades

##### 1.2.1 Frontend (interfaz de usuario)

- Formulario de registro de lote: productor, tipo de producto (huevos, pescado, frutas, carne, entre otros), fecha, cantidad y número de lote.
- Carga de fotos y videos como evidencias, almacenadas **fuera de la cadena** conforme al criterio de pertinencia del brief.
- Página pública de consulta asociada al **QR** que muestra: origen, lote, fecha y evidencias disponibles.
- Historial del lote y estado de su verificación on-chain.
- Diseño adaptable a móvil, dado que el consumidor escanea el código desde su teléfono.

##### 1.2.2 Backend (API y datos)

- API REST para la creación y consulta de lotes y evidencias.
- **Base de datos tradicional** para la información operativa, tal como lo establece el brief: la blockchain no reemplaza la BD.
- Generación y gestión del **ID único** por lote.
- Autenticación básica del productor y control de acceso.
- Servicio de almacenamiento off-chain para fotografías y videos.

##### 1.2.3 Blockchain (anclaje en Stellar)

- Definición del **JSON canónico** del lote: qué datos exactos ingresan al cálculo del **SHA-256**.
- Servicio que calcula la huella y registra su **referencia en Stellar (testnet)**: gestión de cuenta, llaves y fondos (friendbot).
- Comando **`verificar-lote`**: recalcula la huella y la compara con el valor registrado on-chain, permitiendo detectar modificaciones posteriores.
- Registro de costos y transacciones realizadas en testnet.

#### 1.3 Entregables

1. Aplicación web desplegada (registro, evidencias y vista QR).
2. API documentada con su esquema de datos.
3. Módulo de anclaje en Stellar con huella SHA-256.
4. Comando de verificación de integridad por lote.

#### 1.4 Herramientas sugeridas

| Área | Opciones |
| :--- | :--- |
| Frontend | React + Vite, HTML/CSS moderno |
| Backend | Node.js + Express o Python + FastAPI |
| Base de datos | SQLite (MVP) o PostgreSQL |
| Almacenamiento off-chain | Sistema de archivos, S3 o Supabase |
| Blockchain | Stellar SDK (JavaScript o Python), Red de pruebas (testnet) |

#### 1.5 Criterio de terminado

> Registrar un lote con fotografía → escanear el QR desde un celular → ejecutar `verificar-lote` y obtener coincidencia de huella. Si alguien modifica el lote en la base de datos, la verificación lo detecta.

#### 1.6 Riesgo y mitigación

| Riesgo | Mitigación |
| :--- | :--- |
| La integración con Stellar depende de una sola persona. | Documentar el módulo completo y garantizar que al menos dos personas del rol sepan ejecutar la verificación. |
| El MVP se construye sin considerar al usuario real. | Informes comparte los hallazgos de las entrevistas en la reunión semanal de cruce. |

---

### 2. 📄 Rol: Informes

#### 2.1 Misión

Garantizar que el proyecto sea comprendido, entregado a tiempo dentro del bootcamp y **validado con usuarios reales** antes de afirmar que la solución funciona.

#### 2.2 Responsabilidades

##### 2.2.1 Informes y documentación

- Mantener actualizado el **Problem Brief**: equipo y roles, hipótesis y supuestos conforme a la evidencia recogida.
- **README** del proyecto: propósito, estructura, tecnologías e instrucciones para levantar el MVP.
- Informes semanales y demos del **#BafBootCampCol**.
- Registro de decisiones técnicas (por qué Stellar, por qué las evidencias permanecen off-chain).

##### 2.2.2 Coordinación

- Canal interno (Discord, WhatsApp o Slack), reuniones y tablero de trabajo (**GitHub Issues / Projects**).
- Organización de tareas y fechas de entrega entre quienes programan.
- Preparación de las demos: guión, alcance de la demostración y preguntas esperadas.

##### 2.2.3 Validación y QA de aceptación

- Guía de entrevista y sesiones con productores y consumidores de **Guarumo y Cáceres**, compromiso explícito del brief.
- Verificación de los **tres supuestos** de la hipótesis:
  1. ¿Los consumidores valoran la trazabilidad?
  2. ¿El productor está dispuesto a registrar información sin carga excesiva?
  3. ¿La información registrada es confiable desde el origen?
- Checklist de aceptación antes de cada entrega: flujo completo operativo, QR funcional, verificación de integridad activa.
- Documentación de hallazgos y su contraste con la hipótesis planteada.

#### 2.3 Entregables

1. Problem Brief y README actualizados.
2. Registro de validación con usuarios reales (entrevistas y hallazgos).
3. Estado de entregables del equipo.
4. Checklist de aceptación aplicado a cada demo.

#### 2.4 Herramientas sugeridas

| Área | Opciones |
| :--- | :--- |
| Gestión | GitHub Issues, GitHub Projects |
| Entrevistas | Google Forms, Google Docs, notas de campo |
| Informes | Markdown en el repositorio, plantillas del bootcamp |

#### 2.5 Criterio de terminado

> MVP probado por usuarios reales, con feedback documentado y un informe que conecta cada hallazgo con los supuestos del Problem Brief.

#### 2.6 Riesgo y mitigación

| Riesgo | Mitigación |
| :--- | :--- |
| Los informes se redactan al final, con presión y sin evidencia. | Escribir durante el proceso: avance semanal, no la noche anterior a la entrega. |
| La validación se pospone y la hipótesis queda sin comprobar. | Agendar las entrevistas desde la primera semana y bloquear fechas en el tablero. |

---

### 3. Acuerdos entre roles

| Punto de cruce | Acuerdo |
| :--- | :--- |
| **Reunión semanal (15 min)** | Programación muestra avances; Informes reporta hallazgos de entrevistas; juntos priorizan el backlog. |
| **Definición del lote** | Qué campos ingresan al hash: contrato técnico acordado y documentado por Informes. |
| **Criterio de terminado** | Nada se cierra en Programación sin el checklist de Informes; ningún informe afirma algo que no se haya demostrado. |
| **Independencia de validación** | Quien valida con usuarios no programa esa misma función, para que el informe de validación sea objetivo. |

---

### 4. Criterios globales del MVP

1. **Integridad:** toda alteración de un lote se detecta mediante la verificación de la huella.
2. **Pertinencia:** la blockchain se usa solo donde aporta valor; lo operativo permanece en base de datos tradicional.
3. **Evidencia:** ningún hallazgo se declara sin registro de validación con usuarios reales.
4. **Entrega:** cada semana se demuestra avance funcional, no solo documentación.

---

*Agro Cassis · Tecnología Blockchain para el sector agrícola colombiano · #BafBootCampCol*

[⬆ Volver al inicio](#-roles-del-mvp--agro-cassis)

---

## 🇺🇸 English

> **Project:** Agro Cassis · **Context:** #BafBootCampCol
> **Scope:** definition of the two minimum roles needed to build and validate the MVP described in the Problem Brief.

---

### Executive summary

| Role | Mission | Main deliverable |
| :--- | :--- | :--- |
| 💻 **Programming** | Build and maintain the end-to-end functional MVP: register a batch, generate its QR and anchor its fingerprint on Stellar. | Deployed MVP with on-chain verification |
| 📄 **Reports** | Ensure the project is understood, delivered on time in the bootcamp and validated with real users. | Up-to-date documentation + validation record |

> **Governing principle:** one role does not replace the other. Programming demonstrates *what works*; Reports demonstrates *that it matters and that it gets delivered*.

---

### 1. 💻 Role: Programming

#### 1.1 Mission

Build, integrate and maintain the MVP described in the Problem Brief: each batch receives a **unique ID**, its information is stored in a **traditional database**, its **SHA-256** fingerprint is anchored on **Stellar**, and the consumer queries it through a **QR code**.

#### 1.2 Responsibilities

##### 1.2.1 Frontend (user interface)

- Batch registration form: producer, product type (eggs, fish, fruit, meat, among others), date, quantity and batch number.
- Upload of photos and videos as evidence, stored **off-chain** in accordance with the brief's relevance criterion.
- Public query page associated with the **QR** showing: origin, batch, date and available evidence.
- Batch history and the status of its on-chain verification.
- Mobile-friendly design, since the consumer scans the code from their phone.

##### 1.2.2 Backend (API and data)

- REST API for creating and querying batches and evidence.
- **Traditional database** for operational information, as established by the brief: blockchain does not replace the database.
- Generation and management of the **unique ID** per batch.
- Basic producer authentication and access control.
- Off-chain storage service for photographs and videos.

##### 1.2.3 Blockchain (anchoring on Stellar)

- Definition of the batch's **canonical JSON**: which exact data enters the **SHA-256** calculation.
- Service that computes the fingerprint and registers its **reference on Stellar (testnet)**: account management, keys and funding (friendbot).
- **`verify-batch`** command: recomputes the fingerprint and compares it with the value recorded on-chain, enabling the detection of later modifications.
- Record of costs and transactions performed on testnet.

#### 1.3 Deliverables

1. Deployed web application (registration, evidence and QR view).
2. Documented API with its data schema.
3. Stellar anchoring module with SHA-256 fingerprint.
4. Per-batch integrity verification command.

#### 1.4 Suggested tools

| Area | Options |
| :--- | :--- |
| Frontend | React + Vite, modern HTML/CSS |
| Backend | Node.js + Express or Python + FastAPI |
| Database | SQLite (MVP) or PostgreSQL |
| Off-chain storage | File system, S3 or Supabase |
| Blockchain | Stellar SDK (JavaScript or Python), test network (testnet) |

#### 1.5 Definition of done

> Register a batch with a photo → scan the QR from a phone → run `verify-batch` and get a fingerprint match. If someone modifies the batch in the database, the verification detects it.

#### 1.6 Risk and mitigation

| Risk | Mitigation |
| :--- | :--- |
| The Stellar integration depends on a single person. | Document the entire module and ensure at least two people in the role can run the verification. |
| The MVP is built without considering the real user. | Reports shares the interview findings at the weekly cross meeting. |

---

### 2. 📄 Role: Reports

#### 2.1 Mission

Ensure the project is understood, delivered on time within the bootcamp and **validated with real users** before claiming that the solution works.

#### 2.2 Responsibilities

##### 2.2.1 Reports and documentation

- Keep the **Problem Brief** updated: team and roles, hypothesis and assumptions in line with the evidence gathered.
- Project **README**: purpose, structure, technologies and instructions to run the MVP.
- Weekly reports and demos of **#BafBootCampCol**.
- Record of technical decisions (why Stellar, why evidence remains off-chain).

##### 2.2.2 Coordination

- Internal channel (Discord, WhatsApp or Slack), meetings and work board (**GitHub Issues / Projects**).
- Organization of tasks and deadlines among those who code.
- Demo preparation: script, scope of the demonstration and expected questions.

##### 2.2.3 Validation and acceptance QA

- Interview guide and sessions with producers and consumers in **Guarumo and Cáceres**, an explicit commitment of the brief.
- Verification of the **three assumptions** of the hypothesis:
  1. Do consumers value traceability?
  2. Is the producer willing to record information without an excessive burden?
  3. Is the recorded information reliable from the source?
- Acceptance checklist before each delivery: full flow operational, QR working, integrity verification active.
- Documentation of findings and their contrast with the stated hypothesis.

#### 2.3 Deliverables

1. Updated Problem Brief and README.
2. Validation record with real users (interviews and findings).
3. Team deliverables status.
4. Acceptance checklist applied to each demo.

#### 2.4 Suggested tools

| Area | Options |
| :--- | :--- |
| Management | GitHub Issues, GitHub Projects |
| Interviews | Google Forms, Google Docs, field notes |
| Reports | Markdown in the repository, bootcamp templates |

#### 2.5 Definition of done

> MVP tested by real users, with documented feedback and a report connecting each finding to the assumptions of the Problem Brief.

#### 2.6 Risk and mitigation

| Risk | Mitigation |
| :--- | :--- |
| Reports are written at the end, under pressure and without evidence. | Write during the process: weekly progress, not the night before delivery. |
| Validation is postponed and the hypothesis remains unproven. | Schedule interviews from the first week and block dates on the board. |

---

### 3. Agreements between roles

| Crossing point | Agreement |
| :--- | :--- |
| **Weekly meeting (15 min)** | Programming shows progress; Reports presents interview findings; together they prioritize the backlog. |
| **Batch definition** | Which fields enter the hash: technical contract agreed and documented by Reports. |
| **Definition of done** | Nothing is closed in Programming without the Reports checklist; no report claims anything that has not been demonstrated. |
| **Validation independence** | Whoever validates with users does not code that same function, so that the validation report remains objective. |

---

### 4. Global MVP criteria

1. **Integrity:** any alteration of a batch is detected through fingerprint verification.
2. **Relevance:** blockchain is used only where it adds value; operations remain in a traditional database.
3. **Evidence:** no finding is declared without a validation record with real users.
4. **Delivery:** each week demonstrates functional progress, not only documentation.

---

*Agro Cassis · Blockchain technology for the Colombian agricultural sector · #BafBootCampCol*

[⬆ Back to top](#-roles-del-mvp--agro-cassis)

---

## 🇧🇷 Português

> **Projeto:** Agro Cassis · **Contexto:** #BafBootCampCol
> **Escopo:** definição dos dois papéis mínimos necessários para construir e validar o MVP descrito no Problem Brief.

---

### Resumo executivo

| Papel | Missão | Entregável principal |
| :--- | :--- | :--- |
| 💻 **Programação** | Construir e manter o MVP funcional de ponta a ponta: registrar um lote, gerar seu QR e ancorar sua impressão na Stellar. | MVP implantado com verificação on-chain |
| 📄 **Relatórios** | Garantir que o projeto seja compreendido, entregue a tempo no bootcamp e validado com usuários reais. | Documentação atualizada + registro de validação |

> **Princípio orientador:** um papel não substitui o outro. Programação demonstra *o que funciona*; Relatórios demonstra *que importa e que é entregue*.

---

### 1. 💻 Papel: Programação

#### 1.1 Missão

Construir, integrar e manter o MVP descrito no Problem Brief: cada lote recebe um **ID único**, suas informações são armazenadas em um **banco de dados tradicional**, sua impressão **SHA-256** é ancorada na **Stellar**, e o consumidor a consulta por meio de um **código QR**.

#### 1.2 Responsabilidades

##### 1.2.1 Frontend (interface do usuário)

- Formulário de registro de lote: produtor, tipo de produto (ovos, peixes, frutas, carne, entre outros), data, quantidade e número do lote.
- Upload de fotos e vídeos como evidências, armazenados **fora da cadeia** conforme o critério de pertinência do brief.
- Página pública de consulta associada ao **QR** que mostra: origem, lote, data e evidências disponíveis.
- Histórico do lote e o status de sua verificação on-chain.
- Design adaptável ao celular, pois o consumidor escaneia o código pelo telefone.

##### 1.2.2 Backend (API e dados)

- API REST para criação e consulta de lotes e evidências.
- **Banco de dados tradicional** para a informação operacional, conforme estabelece o brief: a blockchain não substitui o banco de dados.
- Geração e gestão do **ID único** por lote.
- Autenticação básica do produtor e controle de acesso.
- Serviço de armazenamento off-chain para fotografias e vídeos.

##### 1.2.3 Blockchain (ancoragem na Stellar)

- Definição do **JSON canônico** do lote: quais dados exatos entram no cálculo do **SHA-256**.
- Serviço que calcula a impressão e registra sua **referência na Stellar (testnet)**: gestão de conta, chaves e financiamento (friendbot).
- Comando **`verificar-lote`**: recalcula a impressão e a compara com o valor registrado on-chain, permitindo detectar modificações posteriores.
- Registro de custos e transações realizadas na testnet.

#### 1.3 Entregáveis

1. Aplicação web implantada (registro, evidências e visualização QR).
2. API documentada com seu esquema de dados.
3. Módulo de ancoragem na Stellar com impressão SHA-256.
4. Comando de verificação de integridade por lote.

#### 1.4 Ferramentas sugeridas

| Área | Opções |
| :--- | :--- |
| Frontend | React + Vite, HTML/CSS moderno |
| Backend | Node.js + Express ou Python + FastAPI |
| Banco de dados | SQLite (MVP) ou PostgreSQL |
| Armazenamento off-chain | Sistema de arquivos, S3 ou Supabase |
| Blockchain | Stellar SDK (JavaScript ou Python), rede de testes (testnet) |

#### 1.5 Critério de concluído

> Registrar um lote com fotografia → escanear o QR pelo celular → executar `verificar-lote` e obter correspondência da impressão. Se alguém modificar o lote no banco de dados, a verificação o detecta.

#### 1.6 Risco e mitigação

| Risco | Mitigação |
| :--- | :--- |
| A integração com a Stellar depende de uma única pessoa. | Documentar todo o módulo e garantir que pelo menos duas pessoas do papel saibam executar a verificação. |
| O MVP é construído sem considerar o usuário real. | Relatórios compartilha os achados das entrevistas na reunião semanal de cruzamento. |

---

### 2. 📄 Papel: Relatórios

#### 2.1 Missão

Garantir que o projeto seja compreendido, entregue a tempo no bootcamp e **validado com usuários reais** antes de afirmar que a solução funciona.

#### 2.2 Responsabilidades

##### 2.2.1 Relatórios e documentação

- Manter o **Problem Brief** atualizado: equipe e papéis, hipótese e premissas conforme a evidência coletada.
- **README** do projeto: propósito, estrutura, tecnologias e instruções para subir o MVP.
- Relatórios semanais e demos do **#BafBootCampCol**.
- Registro de decisões técnicas (por que a Stellar, por que as evidências permanecem off-chain).

##### 2.2.2 Coordenação

- Canal interno (Discord, WhatsApp ou Slack), reuniões e quadro de trabalho (**GitHub Issues / Projects**).
- Organização de tarefas e prazos entre quem programa.
- Preparação das demos: roteiro, escopo da demonstração e perguntas esperadas.

##### 2.2.3 Validação e QA de aceitação

- Guia de entrevista e sessões com produtores e consumidores de **Guarumo e Cáceres**, compromisso explícito do brief.
- Verificação das **três premissas** da hipótese:
  1. Os consumidores valoram a rastreabilidade?
  2. O produtor está disposto a registrar informações sem carga excessiva?
  3. A informação registrada é confiável desde a origem?
- Checklist de aceitação antes de cada entrega: fluxo completo operacional, QR funcional, verificação de integridade ativa.
- Documentação dos achados e seu contraste com a hipótese levantada.

#### 2.3 Entregáveis

1. Problem Brief e README atualizados.
2. Registro de validação com usuários reais (entrevistas e achados).
3. Status de entregáveis da equipe.
4. Checklist de aceitação aplicado a cada demo.

#### 2.4 Ferramentas sugeridas

| Área | Opções |
| :--- | :--- |
| Gestão | GitHub Issues, GitHub Projects |
| Entrevistas | Google Forms, Google Docs, notas de campo |
| Relatórios | Markdown no repositório, modelos do bootcamp |

#### 2.5 Critério de concluído

> MVP testado por usuários reais, com feedback documentado e um relatório que conecta cada achado às premissas do Problem Brief.

#### 2.6 Risco e mitigação

| Risco | Mitigação |
| :--- | :--- |
| Os relatórios são escritos no final, sob pressão e sem evidência. | Escrever durante o processo: avanço semanal, não na noite anterior à entrega. |
| A validação é adiada e a hipótese fica sem comprovação. | Agendar as entrevistas desde a primeira semana e bloquear datas no quadro. |

---

### 3. Acordos entre papéis

| Ponto de cruzamento | Acordo |
| :--- | :--- |
| **Reunião semanal (15 min)** | Programação mostra avanços; Relatórios apresenta achados das entrevistas; juntos priorizam o backlog. |
| **Definição do lote** | Quais campos entram no hash: contrato técnico acordado e documentado por Relatórios. |
| **Critério de concluído** | Nada é fechado em Programação sem o checklist de Relatórios; nenhum relatório afirma algo que não tenha sido demonstrado. |
| **Independência da validação** | Quem valida com usuários não programa essa mesma função, para que o relatório de validação seja objetivo. |

---

### 4. Critérios globais do MVP

1. **Integridade:** toda alteração de um lote é detectada por meio da verificação da impressão.
2. **Pertinência:** a blockchain é usada apenas onde agrega valor; o operacional permanece em banco de dados tradicional.
3. **Evidência:** nenhum achado é declarado sem registro de validação com usuários reais.
4. **Entrega:** toda semana demonstra progresso funcional, não apenas documentação.

---

*Agro Cassis · Tecnologia Blockchain para o setor agrícola colombiano · #BafBootCampCol*

[⬆ Voltar ao início](#-roles-del-mvp--agro-cassis)
