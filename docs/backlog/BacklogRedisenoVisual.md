# 📋 Backlog: Rediseño visual — AgroTrace Rural

> **Feature:** Navegación, sistema visual y ayuda (ciclos `Version-0.03` → `Version-0.05`, versiones 0.3.0–0.5.0) · **Continúa:** HU-01..HU-08
> **Patrón:** `docs/semana2/KanbanBacklog.md` · Creado como GitHub Issues [#16](https://github.com/alucart2005/AgroTraceRural/issues/16), [#17](https://github.com/alucart2005/AgroTraceRural/issues/17), [#18](https://github.com/alucart2005/AgroTraceRural/issues/18), [#19](https://github.com/alucart2005/AgroTraceRural/issues/19), [#20](https://github.com/alucart2005/AgroTraceRural/issues/20), [#21](https://github.com/alucart2005/AgroTraceRural/issues/21), [#22](https://github.com/alucart2005/AgroTraceRural/issues/22) y [#23](https://github.com/alucart2005/AgroTraceRural/issues/23) (formato `docs/backlog/IssuesListos.md`)

> ✅ **Estado (2026-11-10):** HU-16 a HU-23 **implementadas, desplegadas y verificadas en producción** (frontend en Vercel, verificación visual con Playwright en claro y oscuro a 320–1400 px); las ocho historias figuran como `Done` en el [tablero del proyecto #14](https://github.com/users/alucart2005/projects/14) con `Priority=P1/P2` y `Size=M/S/L/L/M/S/S/M`, dentro del milestone **Entrega 5 — Rediseño visual y ayuda** (2026-11-10).
> 🇺🇸 **Status (2026-11-10):** HU-16 through HU-23 are **implemented, deployed and verified in production** (frontend on Vercel, visual checks with Playwright in light and dark at 320–1400 px); all eight stories are tracked as `Done` on [project board #14](https://github.com/users/alucart2005/projects/14) with `Priority=P1/P2` and `Size=M/S/L/L/M/S/S/M`, under the **Entrega 5 — Rediseño visual y ayuda** milestone (2026-11-10).
> 🇧🇷 **Status (2026-11-10):** HU-16 a HU-23 estão **implementadas, implantadas e verificadas em produção** (frontend na Vercel, verificação visual com Playwright em claro e escuro a 320–1400 px); as oito histórias constam como `Done` no [quadro do projeto #14](https://github.com/users/alucart2005/projects/14) com `Priority=P1/P2` e `Size=M/S/L/L/M/S/S/M`, dentro do milestone **Entrega 5 — Rediseño visual y ayuda** (2026-11-10).

> 🗺️ **Roadmap** · [Board #14](https://github.com/users/alucart2005/projects/14)
>
> | Entrega · Delivery · Entrega | Fecha · Date · Data | Historias · Stories · Histórias |
> |---|---|---|
> | 1 · MVP verificable | 2026-10-16 | HU-01..05 |
> | 2 · Producción y robustez | 2026-10-18 | HU-09..13 |
> | 3 · Autenticación con Google | 2026-10-30 | HU-06..08 |
> | 4 · Estabilidad del backend | 2026-11-08 | HU-14..15 |
> | **5 · Rediseño visual y ayuda ◀** | **2026-11-10** | **HU-16..23 (este backlog)** |

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) · [🇺🇸 English](#-english) · [🇧🇷 Português](#-português)

---

## 🇪🇸 Español

📑 **Contenido:** [HU-16 móvil](#-hu-16-navegación-móvil-con-menú-hamburguesa) · [HU-17 lote real](#-hu-17-lote-de-referencia-real-hue-2026-008) · [HU-18 área del productor](#-hu-18-rediseño-del-área-del-productor) · [HU-19 sistema visual y oscuro](#-hu-19-sistema-visual-el-libro-de-la-finca-y-modo-oscuro) · [HU-20 submenús](#-hu-20-menús-con-submenús-y-catálogo-del-productor) · [HU-21 etiqueta QR](#-hu-21-etiqueta-qr-proporcional-y-centrada) · [HU-22 portada y pie](#-hu-22-inicio-y-pie-de-página-adaptados-a-móvil) · [HU-23 ayuda](#-hu-23-centro-de-ayuda-con-manual-trilingüe) · [Tareas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-16: Navegación móvil con menú hamburguesa

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Usuario móvil (productor o consumidor) · 🆕 **Nueva**

> **Como** usuario de celular, **quiero** una navegación propia para pantallas angostas, con menú hamburguesa y submenús, **para** llegar a cualquier sección sin punteros diminutos ni zoom.

#### 🧪 Criterios de aceptación (HU-16) — Dado / Cuando / Entonces

- **Escenario 1: Panel hamburguesa.**
  - **Dado** que la pantalla es menor a `md`,
  - **Cuando** pulso el botón de menú,
  - **Entonces** se abre el panel con los 5 grupos (Consulta, Lotes, Catálogo, Configuración, Ayuda) y sus submenús.
- **Escenario 2: Panel de cristal.**
  - **Dado** que el panel está abierto sobre contenido cualquiera,
  - **Cuando** lo miro,
  - **Entonces** es translúcido (`bg-superficie/85` + `backdrop-blur`) y legible sobre lo que sea que haya detrás.
- **Escenario 3: Marca e iconos sin solaparse.**
  - **Dado** que el ancho va de 320 a 430 px,
  - **Cuando** mido el logo y el grupo de iconos,
  - **Entonces** la marca queda a la izquierda y el grupo tema/ayuda/hamburguesa a la derecha, con separación positiva y sin scroll horizontal.
- **Escenario 4: Escritorio intacto.**
  - **Dado** que la pantalla es `md` o mayor,
  - **Cuando** veo la barra,
  - **Entonces** muestra los enlaces en línea, sin hamburguesa, igual que antes.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-17: Lote de referencia real HUE-2026-008

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Usuario final (visitante / evaluador) · 🆕 **Nueva**

> **Como** visitante, **quiero** que el «lote demo» sea un lote real con hash verificado y ancla en Stellar, **para** probar el flujo completo — registro, QR, verificación — con datos de verdad.

#### 🧪 Criterios de aceptación (HU-17) — Dado / Cuando / Entonces

- **Escenario 1: Una sola referencia.**
  - **Dado** que navego por el sitio,
  - **Cuando** busco el lote de ejemplo,
  - **Entonces** todas las referencias (nav, portada, buscador, etiqueta QR y almacén demo) apuntan al mismo HUE-2026-008.
- **Escenario 2: Datos verificables de verdad.**
  - **Dado** que abro la ficha del lote,
  - **Cuando** verifico la integridad,
  - **Entonces** el SHA-256 recalculado coincide y la transacción de Stellar con su ledger son reales y consultables en Horizon Testnet.
- **Escenario 3: Historial consistente.**
  - **Dado** que el lote tenía un evento de despacho duplicado,
  - **Cuando** se revisó la base de datos,
  - **Entonces** el duplicado quedó eliminado y la cadena de custodia cuenta una historia coherente.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-18: Rediseño del área del productor

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor, **quiero** un panel lateral con mis secciones y un registro de lote en tres pasos, **para** registrar lotes sin perderme en un formulario largo y ver todo mi trabajo de un vistazo.

#### 🧪 Criterios de aceptación (HU-18) — Dado / Cuando / Entonces

- **Escenario 1: Sidebar del productor.**
  - **Dado** que entro a `/productor` en escritorio,
  - **Cuando** veo la página,
  - **Entonces** el panel lateral muestra el logo, el menú con submenús y mi sesión, con el área de contenido al lado.
- **Escenario 2: Registro en tres pasos.**
  - **Dado** que abro `/productor/nuevo`,
  - **Cuando** registro un lote,
  - **Entonces** avanzo por Datos, Evidencias y Resumen, y el botón de continuar se bloquea si falta algo obligatorio.
- **Escenario 3: Evidencias con cámara y resumen previo.**
  - **Dado** que estoy en el paso de evidencias,
  - **Cuando** adjunto fotos,
  - **Entonces** puedo usar la cámara o archivos, las fotos se comprimen antes de subir, y el resumen muestra el hash que se va a anclar antes de guardar.
- **Escenario 4: Ficha pública renovada.**
  - **Dado** que un consumidor abre la ficha del lote,
  - **Cuando** la consulta,
  - **Entonces** ve el banner de verificación, el carrusel de fotos, las filas con iconos y el grid de evidencias.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-19: Sistema visual «El libro de la finca» y modo oscuro

> 🔴 **Imprescindible (Must Have)** · 👤 **Rol:** Usuario (productor o consumidor) · 🆕 **Nueva**

> **Como** usuario, **quiero** una identidad visual propia — tipografías Fraunces y Archivo, paleta esmeralda por variables, filetes en vez de tarjetas — con modo oscuro, **para** leer cómodo de día y de noche y que la app se sienta de una finca, no de una plantilla.

#### 🧪 Criterios de aceptación (HU-19) — Dado / Cuando / Entonces

- **Escenario 1: Tipografías auto-alojadas.**
  - **Dado** que cargo cualquier página,
  - **Cuando** inspecciono las fuentes,
  - **Entonces** Fraunces y Archivo se sirven de nuestro propio dominio, sin pedir a Google Fonts.
- **Escenario 2: Paleta por variables y superficies opacas.**
  - **Dado** que el tema usa variables CSS,
  - **Cuando** pinto paneles, inputs y cabecera,
  - **Entonces** las variables de color van en trípletes RGB para que los alfa funcionen — un hex produce `rgb(#hex / α)`, CSS inválido que el navegador descarta dejando el elemento transparente.
- **Escenario 3: Modo oscuro sin destello.**
  - **Dado** que tengo el tema oscuro guardado,
  - **Cuando** recargo una página,
  - **Entonces** un script previo al render aplica la clase y la página no destella en blanco; el conmutador sol/luna cambia el tema sin recargar.
- **Escenario 4: La etiqueta QR siempre clara.**
  - **Dado** que el tema oscuro está activo,
  - **Cuando** abro la etiqueta para imprimir,
  - **Entonces** la vista imprimible ignora el tema oscuro y sale en claro para pegarla en la cubeta.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-20: Menús con submenús y catálogo del productor

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Pequeño Productor Agrícola · 🆕 **Nueva**

> **Como** productor, **quiero** menús con submenús — Consulta, Lotes, Catálogo, Configuración, Ayuda — y páginas para productos, evidencias y mi perfil, **para** organizar todo el trabajo de la finca en un solo lugar.

#### 🧪 Criterios de aceptación (HU-20) — Dado / Cuando / Entonces

- **Escenario 1: Una sola fuente de menú.**
  - **Dado** que cambio algo del menú,
  - **Cuando** busco dónde editarlo,
  - **Entonces** todo vive en `lib/menu.ts` y alimenta el sidebar, la barra de escritorio y el panel móvil.
- **Escenario 2: Páginas reales, no enlaces muertos.**
  - **Dado** que abro `/productor/productos`, `/productor/evidencias` o `/productor/configuracion`,
  - **Cuando** cargan,
  - **Entonces** cada una existe con su contenido propio y navegable.
- **Escenario 3: Ayuda al alcance.**
  - **Dado** que estoy en cualquier página,
  - **Cuando** busco ayuda,
  - **Entonces** el grupo Ayuda del menú lleva al centro de ayuda y al manual de usuario.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-21: Etiqueta QR proporcional y centrada

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Responsable de Empaque y Despacho · 🆕 **Nueva**

> **Como** responsable de empaque, **quiero** una etiqueta QR con el código en proporción y centrado, **para** imprimirla y pegarla en la cubeta sin que se deforme ni quede chiquita en una esquina.

#### 🧪 Criterios de aceptación (HU-21) — Dado / Cuando / Entonces

- **Escenario 1: Proporción exacta.**
  - **Dado** que agrando o achico la etiqueta,
  - **Cuando** mido el QR,
  - **Entonces** mantiene su relación de aspecto; nunca se estira.
- **Escenario 2: Centrado con márgenes.**
  - **Dado** que abro la etiqueta en cualquier ancho,
  - **Cuando** miro la composición,
  - **Entonces** el código queda centrado con márgenes estables alrededor.
- **Escenario 3: Escaneable al tamaño de impresión.**
  - **Dado** que la etiqueta está impresa,
  - **Cuando** la escaneo,
  - **Entonces** se decodifica correctamente — verificada con zxing-cpp — y siempre sale en tema claro aunque el usuario tenga el oscuro.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-22: Inicio y pie de página adaptados a móvil

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Usuario móvil (consumidor) · 🆕 **Nueva**

> **Como** usuario de celular, **quiero** una portada equilibrada y un pie compacto en pantallas angostas, **para** orientarme desde el primer vistazo sin hacer zoom ni desplazar a los lados.

#### 🧪 Criterios de aceptación (HU-22) — Dado / Cuando / Entonces

- **Escenario 1: Portada apilada a 320 px.**
  - **Dado** que abro la portada en un celular angosto,
  - **Cuando** la recorro,
  - **Entonces** hero, buscador y pasos quedan apilados en un orden legible y sin scroll horizontal.
- **Escenario 2: Pie a dos columnas.**
  - **Dado** que llego al final de la página,
  - **Cuando** veo el pie,
  - **Entonces** los enlaces se organizan en dos columnas compactas y legibles, no en una torre interminable.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-23: Centro de ayuda con manual trilingüe

> 🟢 **Podría (Could Have)** · 👤 **Rol:** Usuario (productor o evaluador) · 🆕 **Nueva**

> **Como** usuario nuevo, **quiero** un centro de ayuda con manual en español, inglés y portugués, novedades, acerca de y reporte de problemas, **para** aprender a usar la app en mi idioma sin pedirle a nadie.

#### 🧪 Criterios de aceptación (HU-23) — Dado / Cuando / Entonces

- **Escenario 1: Rutas de ayuda.**
  - **Dado** que necesito orientación,
  - **Cuando** abro `/ayuda`,
  - **Entonces** encuentro el índice con manual, novedades y versiones, acerca de y cómo reportar un problema.
- **Escenario 2: Manual trilingüe.**
  - **Dado** que abro `/ayuda/manual`,
  - **Cuando** cambio el idioma,
  - **Entonces** los 7 capítulos se sirven en ES, EN o PT y la preferencia se recuerda.
- **Escenario 3: Una sola versión en todo el sitio.**
  - **Dado** que miro el pie o las novedades,
  - **Cuando** compruebo la versión,
  - **Entonces** todo bebe de `lib/version.ts` (0.5.0): pie, índice de ayuda y página de novedades.
- **Escenario 4: Ayuda desde cualquier página.**
  - **Dado** que estoy donde sea,
  - **Cuando** pulso el «?» del encabezado,
  - **Entonces** el desplegable me lleva al manual y a las demás páginas de ayuda.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 Tareas técnicas (no son HU)

- [x] `lib/menu.ts` como única fuente del menú; `MenuNavegacion.tsx` con variantes sidebar / barra / panel móvil.
- [x] Wizard de 3 pasos en `/productor/nuevo` y ficha pública con banner de verificación, carrusel y grid de evidencias.
- [x] Fraunces + Archivo auto-alojadas; paleta por variables CSS en trípletes RGB; clases `.panel` / `.recuadro` / `.marca`.
- [x] Modo oscuro: script previo al render sin destello, conmutador sol/luna, etiqueta QR siempre en claro.
- [x] `demoStore` v3 y unificación de todas las referencias en HUE-2026-008; despacho duplicado eliminado de la base.
- [x] Etiqueta QR proporcional verificada como escaneable con zxing-cpp.
- [x] `/ayuda` con manual ES/EN/PT (`content/manual/*`), versiones, acerca de y reportar; `lib/version.ts` como única fuente de la versión.
- [x] Verificación con Playwright a 320/360/390/430/1400 px en claro y oscuro; `npm run lint` + `npm run build`.

[⬆ Volver al inicio](#-backlog-rediseño-visual--agrotrace-rural)

---

## 🇺🇸 English

📑 **Contents:** [HU-16 mobile](#-hu-16-mobile-navigation-with-hamburger-menu) · [HU-17 real batch](#-hu-17-hue-2026-008-as-the-real-reference-batch) · [HU-18 producer area](#-hu-18-producer-area-redesign) · [HU-19 visual system & dark](#-hu-19-the-farm-ledger-visual-system-and-dark-mode) · [HU-20 submenus](#-hu-20-submenu-navigation-and-the-producer-catalogue) · [HU-21 QR label](#-hu-21-a-proportional-centred-qr-label) · [HU-22 landing & footer](#-hu-22-landing-and-footer-adapted-to-phones) · [HU-23 help](#-hu-23-help-centre-with-a-trilingual-manual) · [Technical tasks](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-16: Mobile navigation with hamburger menu

> 🔴 **Must Have** · 👤 **Role:** Mobile user (farmer or consumer) · 🆕 **New**

> **As a** phone user, **I want** navigation built for narrow screens, with a hamburger menu and submenus, **so that** I can reach any section without tiny taps or zooming.

#### 🧪 Acceptance criteria (HU-16) — Given / When / Then

- **Scenario 1: Hamburger panel.**
  - **Given** the screen is below `md`,
  - **When** I press the menu button,
  - **Then** the panel opens with the 5 groups (Consulta, Lotes, Catálogo, Configuración, Ayuda) and their submenus.
- **Scenario 2: Glass panel.**
  - **Given** the panel is open over any content,
  - **When** I look at it,
  - **Then** it is translucent (`bg-superficie/85` + `backdrop-blur`) and readable over whatever is behind it.
- **Scenario 3: Brand and icons never overlap.**
  - **Given** a width between 320 and 430 px,
  - **When** I measure the logo and the icon cluster,
  - **Then** the brand sits on the left and the theme/help/hamburger group on the right, with positive separation and no horizontal scroll.
- **Scenario 4: Desktop untouched.**
  - **Given** the screen is `md` or wider,
  - **When** I see the bar,
  - **Then** it shows inline links, no hamburger, same as before.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-17: HUE-2026-008 as the real reference batch

> 🔴 **Must Have** · 👤 **Role:** End user (visitor / evaluator) · 🆕 **New**

> **As a** visitor, **I want** the “demo batch” to be a real batch with a verified hash and a Stellar anchor, **so that** I can test the whole flow — registration, QR, verification — on true data.

#### 🧪 Acceptance criteria (HU-17) — Given / When / Then

- **Scenario 1: A single reference.**
  - **Given** I browse the site,
  - **When** I look for the example batch,
  - **Then** every reference (nav, landing, search, QR label and demo store) points to the same HUE-2026-008.
- **Scenario 2: Truly verifiable data.**
  - **Given** I open the batch page,
  - **When** I verify integrity,
  - **Then** the recomputed SHA-256 matches and the Stellar transaction with its ledger are real and queryable on Horizon Testnet.
- **Scenario 3: A consistent history.**
  - **Given** the batch had a duplicated dispatch event,
  - **When** the database was reviewed,
  - **Then** the duplicate was removed and the chain of custody tells a coherent story.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-18: Producer-area redesign

> 🔴 **Must Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want** a side panel with my sections and a three-step batch registration, **so that** I can register batches without getting lost in a long form and see all my work at a glance.

#### 🧪 Acceptance criteria (HU-18) — Given / When / Then

- **Scenario 1: Producer sidebar.**
  - **Given** I open `/productor` on desktop,
  - **When** I see the page,
  - **Then** the side panel shows the logo, the submenu navigation and my session, with the content area beside it.
- **Scenario 2: Registration in three steps.**
  - **Given** I open `/productor/nuevo`,
  - **When** I register a batch,
  - **Then** I move through Datos, Evidencias and Resumen, and the continue button blocks until the required fields are filled.
- **Scenario 3: Evidence with camera and a preview summary.**
  - **Given** I am on the evidence step,
  - **When** I attach photos,
  - **Then** I can use the camera or files, photos are compressed before upload, and the summary shows the hash that will be anchored before saving.
- **Scenario 4: A renewed public page.**
  - **Given** a consumer opens the batch page,
  - **When** they view it,
  - **Then** they see the verification banner, the photo carousel, the icon rows and the evidence grid.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-19: The farm-ledger visual system and dark mode

> 🔴 **Must Have** · 👤 **Role:** User (farmer or consumer) · 🆕 **New**

> **As a** user, **I want** a visual identity of our own — Fraunces and Archivo typefaces, an emerald palette through variables, rules instead of identical cards — plus dark mode, **so that** reading is comfortable day and night and the app feels like a farm, not a template.

#### 🧪 Acceptance criteria (HU-19) — Given / When / Then

- **Scenario 1: Self-hosted typefaces.**
  - **Given** I load any page,
  - **When** I inspect the fonts,
  - **Then** Fraunces and Archivo are served from our own domain, with no request to Google Fonts.
- **Scenario 2: Palette through variables, opaque surfaces.**
  - **Given** the theme uses CSS variables,
  - **When** panels, inputs and the header are painted,
  - **Then** colour variables are RGB triplets so alphas work — a hex produces `rgb(#hex / α)`, invalid CSS the browser drops, leaving the element transparent.
- **Scenario 3: Dark mode without a flash.**
  - **Given** I have dark theme saved,
  - **When** I reload a page,
  - **Then** a pre-render script applies the class and the page doesn't flash white; the sun/moon toggle switches themes without reloading.
- **Scenario 4: The QR label always light.**
  - **Given** dark theme is active,
  - **When** I open the label to print,
  - **Then** the printable view ignores dark mode and comes out light to stick on the bucket.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-20: Submenu navigation and the producer catalogue

> 🟢 **Could Have** · 👤 **Role:** Smallholder Farmer · 🆕 **New**

> **As a** farmer, **I want** menus with submenus — Consulta, Lotes, Catálogo, Configuración, Ayuda — plus pages for products, evidence and my profile, **so that** all the farm's work is organised in one place.

#### 🧪 Acceptance criteria (HU-20) — Given / When / Then

- **Scenario 1: A single menu source.**
  - **Given** I change something in the menu,
  - **When** I look for where to edit it,
  - **Then** it all lives in `lib/menu.ts` and feeds the sidebar, the desktop bar and the mobile panel.
- **Scenario 2: Real pages, not dead links.**
  - **Given** I open `/productor/productos`, `/productor/evidencias` or `/productor/configuracion`,
  - **When** they load,
  - **Then** each one exists with its own, navigable content.
- **Scenario 3: Help within reach.**
  - **Given** I am on any page,
  - **When** I look for help,
  - **Then** the Ayuda group in the menu leads to the help centre and the user manual.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-21: A proportional, centred QR label

> 🟢 **Could Have** · 👤 **Role:** Packing & Dispatch Lead · 🆕 **New**

> **As a** packing lead, **I want** a QR label with the code in proportion and centred, **so that** I can print it and stick it on the bucket without distortion or a tiny square lost in a corner.

#### 🧪 Acceptance criteria (HU-21) — Given / When / Then

- **Scenario 1: Exact proportion.**
  - **Given** I enlarge or shrink the label,
  - **When** I measure the QR,
  - **Then** it keeps its aspect ratio; it is never stretched.
- **Scenario 2: Centred with margins.**
  - **Given** I open the label at any width,
  - **When** I look at the composition,
  - **Then** the code is centred with stable margins around it.
- **Scenario 3: Scannable at print size.**
  - **Given** the label is printed,
  - **When** I scan it,
  - **Then** it decodes correctly — verified with zxing-cpp — and it always comes out in light theme even if the user is in dark.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-22: Landing and footer adapted to phones

> 🟢 **Could Have** · 👤 **Role:** Mobile user (consumer) · 🆕 **New**

> **As a** phone user, **I want** a balanced landing and a compact footer on narrow screens, **so that** I can orient myself at a glance without zooming or sideways scrolling.

#### 🧪 Acceptance criteria (HU-22) — Given / When / Then

- **Scenario 1: A stacked landing at 320 px.**
  - **Given** I open the landing on a narrow phone,
  - **When** I scroll through it,
  - **Then** hero, search and steps stack in a readable order with no horizontal scroll.
- **Scenario 2: A two-column footer.**
  - **Given** I reach the end of the page,
  - **When** I see the footer,
  - **Then** the links sit in two compact, readable columns, not an endless tower.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-23: Help centre with a trilingual manual

> 🟢 **Could Have** · 👤 **Role:** User (farmer or evaluator) · 🆕 **New**

> **As a** new user, **I want** a help centre with a manual in Spanish, English and Portuguese, plus releases, about and problem reporting, **so that** I can learn the app in my own language without asking anyone.

#### 🧪 Acceptance criteria (HU-23) — Given / When / Then

- **Scenario 1: Help routes.**
  - **Given** I need guidance,
  - **When** I open `/ayuda`,
  - **Then** I find the index with the manual, releases and versions, about, and how to report a problem.
- **Scenario 2: A trilingual manual.**
  - **Given** I open `/ayuda/manual`,
  - **When** I switch the language,
  - **Then** the 7 chapters are served in ES, EN or PT and the preference is remembered.
- **Scenario 3: One version across the site.**
  - **Given** I look at the footer or the releases page,
  - **When** I check the version,
  - **Then** everything draws from `lib/version.ts` (0.5.0): footer, help index and releases page.
- **Scenario 4: Help from any page.**
  - **Given** I am anywhere,
  - **When** I press the “?” in the header,
  - **Then** the dropdown takes me to the manual and the other help pages.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 Technical tasks (not user stories)

- [x] `lib/menu.ts` as the single menu source; `MenuNavegacion.tsx` with sidebar / desktop bar / mobile panel variants.
- [x] 3-step wizard in `/productor/nuevo` and a public batch page with verification banner, carousel and evidence grid.
- [x] Self-hosted Fraunces + Archivo; palette through CSS variables as RGB triplets; `.panel` / `.recuadro` / `.marca` classes.
- [x] Dark mode: pre-render script with no flash, sun/moon toggle, QR label always light.
- [x] `demoStore` v3 and every reference unified on HUE-2026-008; duplicated dispatch removed from the database.
- [x] Proportional QR label verified as scannable with zxing-cpp.
- [x] `/ayuda` with an ES/EN/PT manual (`content/manual/*`), versions, about and reporting; `lib/version.ts` as the single version source.
- [x] Verification with Playwright at 320/360/390/430/1400 px in light and dark; `npm run lint` + `npm run build`.

[⬆ Back to top](#-backlog-rediseño-visual--agrotrace-rural)

---

## 🇧🇷 Português

📑 **Conteúdo:** [HU-16 móvel](#-hu-16-navegação-móvel-com-menu-hambúrguer) · [HU-17 lote real](#-hu-17-hue-2026-008-como-lote-real-de-referência) · [HU-18 área do produtor](#-hu-18-redesenho-da-área-do-produtor) · [HU-19 sistema visual e escuro](#-hu-19-sistema-visual-o-livro-da-fazenda-e-modo-escuro) · [HU-20 submenus](#-hu-20-menus-com-submenu-e-catálogo-do-produtor) · [HU-21 etiqueta QR](#-hu-21-etiqueta-qr-proporcional-e-centrada) · [HU-22 capa e rodapé](#-hu-22-início-e-rodapé-adaptados-ao-celular) · [HU-23 ajuda](#-hu-23-central-de-ajuda-com-manual-trilíngue) · [Tarefas técnicas](#-tareas-técnicas-no-son-hu)

---

### 📌 HU-16: Navegação móvel com menu hambúrguer

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Usuário móvel (produtor ou consumidor) · 🆕 **Nova**

> **Como** usuário de celular, **quero** uma navegação própria para telas estreitas, com menu hambúrguer e submenus, **para que** eu chegue a qualquer seção sem toques minúsculos nem zoom.

#### 🧪 Critérios de aceitação (HU-16) — Dado / Quando / Então

- **Cenário 1: Painel hambúrguer.**
  - **Dado** que a tela é menor que `md`,
  - **Quando** pressiono o botão de menu,
  - **Então** abre o painel com os 5 grupos (Consulta, Lotes, Catálogo, Configuración, Ayuda) e seus submenus.
- **Cenário 2: Painel de cristal.**
  - **Dado** que o painel está aberto sobre qualquer conteúdo,
  - **Quando** eu o olho,
  - **Então** é translúcido (`bg-superficie/85` + `backdrop-blur`) e legível sobre o que estiver atrás.
- **Cenário 3: Marca e ícones sem sobreposição.**
  - **Dado** que a largura vai de 320 a 430 px,
  - **Quando** meço o logo e o grupo de ícones,
  - **Então** a marca fica à esquerda e o grupo tema/ajuda/hambúrguer à direita, com separação positiva e sem rolagem horizontal.
- **Cenário 4: Desktop intacto.**
  - **Dado** que a tela é `md` ou maior,
  - **Quando** vejo a barra,
  - **Então** mostra os links em linha, sem hambúrguer, igual a antes.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-17: HUE-2026-008 como lote real de referência

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Usuário final (visitante / avaliador) · 🆕 **Nova**

> **Como** visitante, **quero** que o «lote demo» seja um lote real com hash verificado e âncora no Stellar, **para que** eu teste o fluxo completo — registro, QR, verificação — com dados de verdade.

#### 🧪 Critérios de aceitação (HU-17) — Dado / Quando / Então

- **Cenário 1: Uma só referência.**
  - **Dado** que navego pelo site,
  - **Quando** procuro o lote de exemplo,
  - **Então** todas as referências (nav, capa, buscador, etiqueta QR e armazém demo) apontam para o mesmo HUE-2026-008.
- **Cenário 2: Dados verificáveis de verdade.**
  - **Dado** que abro a ficha do lote,
  - **Quando** verifico a integridade,
  - **Então** o SHA-256 recalculado coincide e a transação do Stellar com seu ledger são reais e consultáveis no Horizon Testnet.
- **Cenário 3: Histórico consistente.**
  - **Dado** que o lote tinha um evento de despacho duplicado,
  - **Quando** o banco de dados foi revisto,
  - **Então** o duplicado foi eliminado e a cadeia de custódia conta uma história coerente.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-18: Redesenho da área do produtor

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor, **quero** um painel lateral com as minhas seções e um registro de lote em três passos, **para que** eu registre lotes sem me perder num formulário longo e veja todo o meu trabalho de relance.

#### 🧪 Critérios de aceitação (HU-18) — Dado / Quando / Então

- **Cenário 1: Sidebar do produtor.**
  - **Dado** que entro em `/productor` no desktop,
  - **Quando** vejo a página,
  - **Então** o painel lateral mostra o logo, o menu com submenus e a minha sessão, com a área de conteúdo ao lado.
- **Cenário 2: Registro em três passos.**
  - **Dado** que abro `/productor/novo`,
  - **Quando** registro um lote,
  - **Então** avanço por Datos, Evidencias e Resumen, e o botão de continuar bloqueia se falta algo obrigatório.
- **Cenário 3: Evidências com câmera e resumo prévio.**
  - **Dado** que estou no passo de evidências,
  - **Quando** anexo fotos,
  - **Então** posso usar a câmera ou arquivos, as fotos são comprimidas antes de subir, e o resumo mostra o hash que será ancorado antes de salvar.
- **Cenário 4: Ficha pública renovada.**
  - **Dado** que um consumidor abre a ficha do lote,
  - **Quando** a consulta,
  - **Então** vê o banner de verificação, o carrossel de fotos, as linhas com ícones e a grade de evidências.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-19: Sistema visual «O livro da fazenda» e modo escuro

> 🔴 **Imprescindível (Must Have)** · 👤 **Papel:** Usuário (produtor ou consumidor) · 🆕 **Nova**

> **Como** usuário, **quero** uma identidade visual própria — tipografias Fraunces e Archivo, paleta esmeralda por variáveis, filetes em vez de cartões — com modo escuro, **para que** eu leia com conforto de dia e de noite e o aplicativo pareça uma fazenda, não um modelo pronto.

#### 🧪 Critérios de aceitação (HU-19) — Dado / Quando / Então

- **Cenário 1: Tipografias auto-hospedadas.**
  - **Dado** que carrego qualquer página,
  - **Quando** inspeciono as fontes,
  - **Então** Fraunces e Archivo são servidas do nosso próprio domínio, sem pedir ao Google Fonts.
- **Cenário 2: Paleta por variáveis e superfícies opacas.**
  - **Dado** que o tema usa variáveis CSS,
  - **Quando** pinto painéis, inputs e cabeçalho,
  - **Então** as variáveis de cor vão em tripletas RGB para que os alfa funcionem — um hex produz `rgb(#hex / α)`, CSS inválido que o navegador descarta deixando o elemento transparente.
- **Cenário 3: Modo escuro sem piscar.**
  - **Dado** que tenho o tema escuro salvo,
  - **Quando** recarrego uma página,
  - **Então** um script anterior à renderização aplica a classe e a página não pisca em branco; o interruptor sol/lua troca o tema sem recarregar.
- **Cenário 4: A etiqueta QR sempre clara.**
  - **Dado** que o tema escuro está ativo,
  - **Quando** abro a etiqueta para imprimir,
  - **Então** a vista imprimível ignora o tema escuro e sai clara para colar na cubeta.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-20: Menus com submenu e catálogo do produtor

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Pequeno Produtor Agrícola · 🆕 **Nova**

> **Como** produtor, **quero** menus com submenus — Consulta, Lotes, Catálogo, Configuración, Ayuda — e páginas para produtos, evidências e meu perfil, **para que** todo o trabalho da fazenda fique organizado num só lugar.

#### 🧪 Critérios de aceitação (HU-20) — Dado / Quando / Então

- **Cenário 1: Uma só fonte de menu.**
  - **Dado** que mudo algo no menu,
  - **Quando** procuro onde editá-lo,
  - **Então** tudo vive em `lib/menu.ts` e alimenta a sidebar, a barra do desktop e o painel móvel.
- **Cenário 2: Páginas reais, não links mortos.**
  - **Dado** que abro `/productor/productos`, `/productor/evidencias` ou `/productor/configuracion`,
  - **Quando** carregam,
  - **Então** cada uma existe com conteúdo próprio e navegável.
- **Cenário 3: Ajuda ao alcance.**
  - **Dado** que estou em qualquer página,
  - **Quando** procuro ajuda,
  - **Então** o grupo Ayuda do menu leva à central de ajuda e ao manual do usuário.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-21: Etiqueta QR proporcional e centrada

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Responsável de Embalagem e Despacho · 🆕 **Nova**

> **Como** responsável de embalagem, **quero** uma etiqueta QR com o código em proporção e centrado, **para que** eu a imprima e cole na cubeta sem deformação nem um quadradinho perdido num canto.

#### 🧪 Critérios de aceitação (HU-21) — Dado / Quando / Então

- **Cenário 1: Proporção exata.**
  - **Dado** que aumento ou diminuo a etiqueta,
  - **Quando** meço o QR,
  - **Então** mantém a proporção; nunca é esticado.
- **Cenário 2: Centrado com margens.**
  - **Dado** que abro a etiqueta em qualquer largura,
  - **Quando** olho a composição,
  - **Então** o código fica centrado com margens estáveis ao redor.
- **Cenário 3: Escaneável no tamanho de impressão.**
  - **Dado** que a etiqueta está impressa,
  - **Quando** eu a escaneio,
  - **Então** decodifica corretamente — verificada com zxing-cpp — e sempre sai em tema claro mesmo que o usuário esteja no escuro.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-22: Início e rodapé adaptados ao celular

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Usuário móvel (consumidor) · 🆕 **Nova**

> **Como** usuário de celular, **quero** uma capa equilibrada e um rodapé compacto em telas estreitas, **para que** eu me oriente no primeiro olhar sem zoom nem rolagem lateral.

#### 🧪 Critérios de aceitação (HU-22) — Dado / Quando / Então

- **Cenário 1: Capa empilhada a 320 px.**
  - **Dado** que abro a capa num celular estreito,
  - **Quando** a percorro,
  - **Então** hero, buscador e passos ficam empilhados numa ordem legível e sem rolagem horizontal.
- **Cenário 2: Rodapé em duas colunas.**
  - **Dado** que chego ao fim da página,
  - **Quando** vejo o rodapé,
  - **Então** os links se organizam em duas colunas compactas e legíveis, não numa torre interminável.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 HU-23: Central de ajuda com manual trilíngue

> 🟢 **Poderia (Could Have)** · 👤 **Papel:** Usuário (produtor ou avaliador) · 🆕 **Nova**

> **Como** usuário novo, **quero** uma central de ajuda com manual em espanhol, inglês e português, novidades, sobre e reporte de problemas, **para que** eu aprenda a usar o aplicativo no meu idioma sem pedir a ninguém.

#### 🧪 Critérios de aceitação (HU-23) — Dado / Quando / Então

- **Cenário 1: Rotas de ajuda.**
  - **Dado** que preciso de orientação,
  - **Quando** abro `/ayuda`,
  - **Então** encontro o índice com manual, novidades e versões, sobre e como reportar um problema.
- **Cenário 2: Manual trilíngue.**
  - **Dado** que abro `/ayuda/manual`,
  - **Quando** troco o idioma,
  - **Então** os 7 capítulos são servidos em ES, EN ou PT e a preferência fica lembrada.
- **Cenário 3: Uma só versão no site todo.**
  - **Dado** que olho o rodapé ou as novidades,
  - **Quando** confiro a versão,
  - **Então** tudo bebe de `lib/version.ts` (0.5.0): rodapé, índice de ajuda e página de novidades.
- **Cenário 4: Ajuda de qualquer página.**
  - **Dado** que estou em qualquer lugar,
  - **Quando** pressiono o «?» do cabeçalho,
  - **Então** o menu suspenso me leva ao manual e às demais páginas de ajuda.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)

---

### 📌 Tarefas técnicas (não são HU)

- [x] `lib/menu.ts` como única fonte do menu; `MenuNavegacion.tsx` com variantes sidebar / barra / painel móvel.
- [x] Wizard de 3 passos em `/productor/novo` e ficha pública com banner de verificação, carrossel e grade de evidências.
- [x] Fraunces + Archivo auto-hospedadas; paleta por variáveis CSS em tripletas RGB; classes `.panel` / `.recuadro` / `.marca`.
- [x] Modo escuro: script anterior à renderização sem piscar, interruptor sol/lua, etiqueta QR sempre clara.
- [x] `demoStore` v3 e unificação de todas as referências no HUE-2026-008; despacho duplicado eliminado do banco.
- [x] Etiqueta QR proporcional verificada como escaneável com zxing-cpp.
- [x] `/ayuda` com manual ES/EN/PT (`content/manual/*`), versões, sobre e reporte; `lib/version.ts` como única fonte da versão.
- [x] Verificação com Playwright a 320/360/390/430/1400 px em claro e escuro; `npm run lint` + `npm run build`.

[⬆ Voltar ao início](#-backlog-rediseño-visual--agrotrace-rural)
