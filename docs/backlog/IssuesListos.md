# Issues listos para crear en GitHub

> Copia el título y cuerpo de cada issue en: **AgroTraceRural → Issues → New issue**
> (Requiere habilitar Issues en Settings → Features primero)

---

## HU-01: Registro de lote por el productor

**Título:**
`HU-01: Registro de lote por el productor`

**Cuerpo:**

```markdown
## Historia de usuario

**Como** pequeño productor agrícola, **quiero** registrar cada lote cosechado (especificando fecha, cantidad y adjuntando foto de evidencia), **para** tener un respaldo organizado del origen de mi producción.

- **Prioridad:** Imprescindible (Must Have)
- **Rol:** Pequeño Productor Agrícola
- **Fuente:** KanbanBacklog.md

## Criterios de aceptación (Gherkin)

### Escenario 1: Registro exitoso de lote con evidencia fotográfica

- **Dado** que el productor ha iniciado sesión en la plataforma móvil de AgroTrace,
- **Cuando** diligencia el formulario con la fecha de recolección, selecciona la línea "Huevos Guarumo", ingresa la cantidad (ej. 10 cubetas) y adjunta una fotografía del galpón/cosecha,
- **Entonces** el sistema debe crear el lote con un identificador único (ej. `HUE-2027-001`), guardar los datos en la base de datos y mostrar una confirmación exitosa en pantalla.

### Escenario 2: Intento de registro sin imagen de evidencia

- **Dado** que el productor completa los campos de texto del formulario de lote,
- **Cuando** intenta guardar el registro sin adjuntar ninguna foto de evidencia,
- **Entonces** el sistema debe bloquear el envío y mostrar un mensaje solicitando cargar al menos una imagen antes de guardar.
```

---

## HU-02: Consulta de origen mediante código QR

**Título:**
`HU-02: Consulta de origen mediante código QR`

**Cuerpo:**

```markdown
## Historia de usuario

**Como** consumidor final, **quiero** escanear un código QR en la etiqueta de la cubeta de huevos, **para** verificar la finca de origen, la fecha de recolección y las fotografías de evidencia antes de comprar.

- **Prioridad:** Imprescindible (Must Have)
- **Rol:** Consumidor Final
- **Fuente:** KanbanBacklog.md

## Criterios de aceptación (Gherkin)

### Escenario 1: Lectura correcta de código QR existente

- **Dado** que el consumidor tiene una cubeta de huevos con la etiqueta QR impresa de AgroTrace,
- **Cuando** escanea el código QR utilizando la cámara de su teléfono móvil,
- **Entonces** el navegador web debe redirigir a la vista pública del lote (`/lote/HUE-2027-001`), desplegando el nombre de la finca "Guarumo", municipio "Cáceres", fecha de postura y la fotografía de evidencia capturada.

### Escenario 2: Escaneo de código QR inexistente o alterado

- **Dado** que el consumidor escanea un código QR que no corresponde a ningún lote activo en el sistema,
- **Cuando** la página web intenta consultar la información,
- **Entonces** la plataforma debe mostrar una pantalla de alerta indicando que el lote no existe o que el código no es auténtico.
```

---

## HU-03: Verificación de integridad on-chain en Stellar

**Título:**
`HU-03: Verificación de integridad on-chain en Stellar`

**Cuerpo:**

```markdown
## Historia de usuario

**Como** verificado / autoridad sanitaria o comprador institucional, **quiero** validar que la huella digital del historial de un lote coincida con la registrada en el momento de la cosecha, **para** comprobar que la información no ha sido alterada ni manipulada.

- **Prioridad:** Imprescindible (Must Have)
- **Rol:** Verificador / Autoridad Sanitaria / Cliente Institucional
- **Fuente:** KanbanBacklog.md

## Criterios de aceptación (Gherkin)

### Escenario 1: Confirmación de integridad sin alteraciones (datos intactos)

- **Dado** que un usuario está consultando la página pública de un lote registrado,
- **Cuando** hace clic en el botón "Verificar Integridad On-Chain",
- **Entonces** el sistema recalcula la huella SHA-256 de los datos actuales, la compara con el Hash registrado en Stellar Testnet y muestra una insignia verde de "Información Verificada e Inalterada" con el ID de la transacción.

### Escenario 2: Detección de modificación no autorizada en la base de datos

- **Dado** que un dato del lote (ej. la fecha o la foto) fue modificado posteriormente en la base de datos local,
- **Cuando** el usuario ejecuta la verificación de integridad,
- **Entonces** el Hash calculado no coincidirá con el registrado en Stellar y el sistema mostrará una alerta roja advirtiendo que la información fue alterada.
```

---

## HU-04: Generación e impresión de QR para empaque

**Título:**
`HU-04: Generación e impresión de QR para empaque`

**Cuerpo:**

```markdown
## Historia de usuario

**Como** responsable de empaque y despacho, **quiero** generar un código QR único para cada lote embalado, **para** asegurar que el empaque físico corresponda exactamente al registro digital.

- **Prioridad:** Debería (Should Have)
- **Rol:** Responsable de Empaque y Despacho
- **Fuente:** KanbanBacklog.md

## Criterios de aceptación (Gherkin)

### Escenario 1: Generación de etiqueta lista para impresión

- **Dado** que el usuario de empaque selecciona un lote activo recién clasificado en la plataforma,
- **Cuando** presiona la opción "Generar Etiqueta QR",
- **Entonces** el sistema genera una vista previa imprimible del código QR que contiene la URL directa del lote, acompañada del logo de AgroTrace Rural y la fecha de empaque.
```

---

## HU-05: Consulta de historial de eventos por distribuidor

**Título:**
`HU-05: Consulta de historial de eventos por distribuidor`

**Cuerpo:**

```markdown
## Historia de usuario

**Como** comprador o distribuidor local, **quiero** consultar la secuencia de eventos de un lote (cosecha, empaque y despacho), **para** validar la frescura y tiempos de entrega antes de comercializarlos.

- **Prioridad:** Debería (Should Have)
- **Rol:** Comprador / Distribuidor Local
- **Fuente:** KanbanBacklog.md

## Criterios de aceptación (Gherkin)

### Escenario 1: Visualización cronológica de la cadena de custodia

- **Dado** que un distribuidor local ingresa el identificador del lote en el buscador de la plataforma,
- **Cuando** accede al detalle del producto,
- **Entonces** el sistema despliega una línea de tiempo numerada con las fechas y horas exactas en que se registraron la recolección, la clasificación y la salida hacia transporte.
```
