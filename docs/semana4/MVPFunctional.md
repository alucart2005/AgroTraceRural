<div align="center">

# 🌱 AgroTrace Rural — Entregable 4

### Functional MVP · Respuestas a la rúbrica de cierre de semana

![Proyecto](https://img.shields.io/badge/Proyecto-AgroTrace%20Rural-059669)
![Entregable](https://img.shields.io/badge/Entregable-4%20—%20Functional%20MVP-0ea5e9)
![Sección](https://img.shields.io/badge/Sección-8-6366f1)
![Fecha](https://img.shields.io/badge/Fecha-17%20de%20octubre%20de%202026-64748b)

**Documento:** `RespuestasEntregable4.md` · **Proyecto:** AgroTrace Rural · **Fecha:** 17 de octubre de 2026

</div>

---

## 📋 Metadatos del entregable

| Campo | Detalle |
|---|---|
| **Proyecto** | AgroTrace Rural — trazabilidad verificable de lotes de la Finca Guarumo |
| **Sección** | 8 — Entregable 4 (*Functional MVP*) |
| **Fecha de entrega** | 17 de octubre de 2026 |
| **Alcance del trabajo** | Implementación de las HU-01..HU-05, backend FastAPI + Cloudflare R2 + Stellar Testnet, despliegue en Render/Neon, endurecimiento del backend y corrección del modo demo |
| **Commits cubiertos** | 15–16 de octubre de 2026 (de `feat(frontend): implement HU-01 to HU-05 user stories` a `docs: document production deployment targets`) |
| **Estado** | MVP funcional desplegado · 50 pruebas automatizadas en verde |

> **En una frase:** esta semana el MVP pasó de frontend estático a **sistema completo desplegado** — las 5 historias funcionan de punta a punta (registro con fotos → SHA-256 → ancla en Stellar → QR → verificación on-chain), con FastAPI en Render, base de datos Neon, evidencias en Cloudflare R2 y una suite de 50 pruebas que corren sin red.

---

## 1. 📚 Aprendizajes y ajustes priorizados

### 1.1 Aprendizajes clave

| # | Aprendizaje | Lección aplicada |
|---|---|---|
| 🔐 | **La paridad del hash es obligatoria** | El navegador y el servidor deben producir **exactamente** el mismo SHA-256. Fijamos vectores de prueba calculados con el código real del navegador: si un lado cambia, la verificación se rompe en silencio. La canonicidad del JSON (claves ordenadas, sin espacios, mismos 8 campos) es tan crítica como el algoritmo. |
| 🧪 | **Un modo demo que "finge" datos es un bug, no una característica** | Al caer el backend, la UI mostraba lotes fantasma indistinguibles de los reales. Se corrigió con un aviso visible (`AvisoModoDemo`) y la regla de que **las escrituras nunca** se guardan en modo local. |
| 🔑 | **Una clave `NEXT_PUBLIC_*` no es secreto** | Viaja embebida en el bundle JS; solo disuade usos accidentales. La escritura real necesita autenticación verdadera. |
| ☁️ | **Las restricciones de infraestructura moldean el diseño** | Vercel corta las funciones serverless a 10 s (el anclaje en Stellar los supera), su *filesystem* es efímero y no interpola variables en `vercel.json`. De ahí que el backend vaya a Render y el frontend llame al API directamente. |

### 1.2 Ajustes antes del cierre

Priorizados por matriz impacto / esfuerzo:

| Ajuste | Impacto | Esfuerzo | Prioridad |
|---|:---:|:---:|:---:|
| Autenticación real para escrituras (hoy la clave es pública en el bundle) | 🔴 Alto | 🟡 Medio | **P1** |
| Botón de reintento de anclaje en la UI del productor | 🔴 Alto | 🟢 Bajo | **P1** |
| Pruebas de lint/build en CI | 🟡 Medio | 🟢 Bajo | **P2** |
| Sembrar más lotes de prueba para las demostraciones | 🟡 Medio | 🟢 Bajo | **P2** |

> 📌 **Queda pendiente para la siguiente etapa:** la discusión sobre contratos Soroban (Etapa 2) y la validación con usuarios reales descrita en la sección 3.

---

## 2. ⚠️ Riesgos y pendientes

### 2.1 Matriz de riesgos identificados antes del cierre

| # | Riesgo | Impacto | Mitigación prevista |
|---|---|:---:|---|
| 🔴 | **Cuenta Stellar única en Testnet** — toda la confianza descansa en una cuenta cuya clave secreta vive en el panel de Render; si se filtra, cualquiera podría anclar hashes fraudulentos a su nombre. | Crítico | Firma multifirma o escritura con autenticación real **antes** de un piloto con datos reales. |
| 🔴 | **Fragilidad de la cadena de verificación** — un cambio en la compresión de fotos del navegador altera el `tamano` que entra en el hash canónico y rompe la paridad con el backend. Es el punto más delicado del sistema y hoy está cubierto solo por pruebas unitarias. | Alto | Ampliar la suite con pruebas de extremo a extremo y congelar el contrato del payload. |
| 🟡 | **Planes gratuitos frágiles** — Render y Neon duermen por inactividad; la primera petición tras el reposo puede tardar o fallar. El `pool_pre_ping` mitiga conexiones colgadas de Neon, pero no el arranque en frío del servicio. | Medio | Mantener el servicio activo durante demostraciones en vivo; evaluar plan de pago al escalar. |
| 🟡 | **La hipótesis central sigue sin validar** — blockchain protege la integridad del registro, no la verdad del dato inicial: si el productor registra mal la fecha desde el origen, el sistema la certifica igual. Nadie ha probado aún que el consumidor valore la verificación. | Alto | Plan de validación de la sección 3. |
| 🟡 | **Sin respaldo automático de la base de datos** — Neon en plan gratuito no garantiza retención prolongada. | Medio | Volcado periódico del esquema y los datos. |
| 🟢 | **Alcance regulatorio fuera del MVP** — ICA, guías de movilización y registros sanitarios no están cubiertos; la plataforma es capa tecnológica complementaria, no reemplazo de los registros oficiales. | Bajo (esperado) | Declarado explícitamente en el README; fuera del alcance del MVP. |

### 2.2 Pendientes principales

| # | Pendiente | Responsable sugerido |
|---|---|---|
| 1 | Autenticación real para endpoints de escritura | Programación |
| 2 | Respaldos periódicos de Neon | Programación |
| 3 | Pruebas de extremo a extremo contra Horizon real (hoy los tests simulan Stellar para correr sin red) | Programación |
| 4 | Decisión sobre contratos Soroban en la Etapa 2 (evento `Anchored` indexable en lugar del Memo Hash) | Equipo |

---

## 3. 🧑‍🤝‍🧑 Plan de validación con usuarios

### 3.1 ¿A quiénes validaremos?

Los dos perfiles definidos en el Problem Brief:

| # | Perfil | Fuente de contacto |
|---|---|---|
| 👨‍🌾 | **El productor pequeño** | La propia Finca Guarumo y 2–3 productores vecinos de Cáceres / Bajo Cauca |
| 🛒 | **El consumidor en el punto de venta** | Tiendas locales y clientes recurrentes del plan Canasta Finca Guarumo |

### 3.2 Métodos y secuencia

| Fase | Método | Qué se observa / mide |
|---|---|---|
| **1** | **Prueba de usabilidad con el productor** *(pensar en voz alta)* | Que registre un lote real desde su celular (fotos, fecha, cantidad). Se miden tiempo, tropiezos y ayudas requeridas. |
| **2** | **Prueba de escaneo con consumidores** *(5–10 personas)* | Entregar cubetas etiquetadas en un punto de venta y observar: ¿escanean el QR?, ¿qué buscan en la página?, ¿pulsan "Verificar integridad"?, ¿entienden el resultado? |
| **3** | **Entrevistas breves post-escaneo** *(semiestructuradas)* | Si la información mostrada cambia su confianza en el producto y si pagarían lo mismo por una cubeta trazable; contrastar la percepción con y sin el sello de verificación on-chain. |
| **4** | **Métricas del producto a 30 días** | Lotes registrados por el productor sin soporte, escaneos del QR por cubeta vendida, uso del botón de verificación y eventos de custodia agregados después de la venta. |

### 3.3 Hipótesis y criterios de éxito

| ID | Hipótesis | Criterio de éxito (medible) |
|:---:|---|---|
| **H1** | El consumidor consulta el origen | ≥ **6 de 10** consumidores escanean espontáneamente **y** ≥ **7 de 10** afirman que la verificación aumenta su confianza |
| **H2** | El productor encuentra el sistema sencillo | Registra ≥ **5 lotes reales** en una semana sin ayuda y su tiempo por lote baja respecto a su registro manual actual |
| **H3** | La verificación on-chain aporta más que una base de datos tradicional | Al mostrar ambos resultados, la **mayoría** percibe mayor confianza con el sello Stellar |

> 🛑 **Criterio de invalidación:** si **H3** no se cumple, la hipótesis del proyecto queda invalidada y el caso de uso se reevalúa, tal como prevé el README. Blockchain se usa solo donde aporta una característica adicional; no se usa por moda.

### 3.4 Registro y trazabilidad de la validación

La validación se documentará en `docs/` con un registro de consentimiento simple y capturas de cada sesión, cumpliendo el rol de **Informes**: demostrar no solo que funciona, sino que **importa**.

---

<div align="center">

🌱 *Del campo al cliente, con trazabilidad verificable.*

**AgroTrace Rural** · [https://frontend-2mx1.vercel.app](https://frontend-2mx1.vercel.app)

</div>
