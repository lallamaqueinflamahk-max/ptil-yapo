# Tablas como centros de acción — UX (sistemas operativos)

**Principio:** Las tablas priorizan **impacto** sobre orden alfabético. Estados visuales claros, acciones rápidas por fila, filtro y orden en tiempo real. Al seleccionar una fila se disparan cambios en mapa y KPIs. Objetivo: **decidir y actuar en segundos**.

---

## 1. Columnas críticas por tipo de tabla

| Tabla | Columnas críticas (orden sugerido) | Justificación |
|-------|------------------------------------|---------------|
| **Control de Seccionales** | Estado → Rango → Validados → Nº → Nombre → Titular → Contacto → Acciones | Estado primero para priorizar riesgo; luego métrica de impacto (validados); identificación (Nº, nombre); contacto y acciones al final. |
| **Seccionales · Sparklines** | Estado → Seccional → Barrio → Validados → Tendencia → Acciones | Misma lógica: estado visible, luego identidad, métrica y tendencia; acciones rápidas al final. |
| **Dirigentes · Datos y contacto** | Nombre → Cargo → Seccional → Contacto (acción) | Tabla de referencia; la acción principal es contacto (WhatsApp). Opcional: "Ver en mapa" por seccional. |

**Regla:** La primera columna ordenable por defecto debe ser la de **mayor impacto** (estado o métrica clave), no el nombre.

---

## 2. Estados visuales (chips, flags, colores)

| Estado | Token / variante | Apariencia | Uso |
|--------|-------------------|------------|-----|
| **OK / Éxito** | `semantic-success` (chip verde) | Fondo suave verde, texto verde oscuro, borde verde | Seccional en rango, sin alertas. |
| **Atención** | `semantic-warning` (chip ámbar) | Fondo ámbar claro, texto ámbar oscuro | Revisar pronto. |
| **Crítico / Riesgo** | `semantic-danger` (chip rojo) | Fondo rojo claro, texto rojo oscuro | Actuar ya. |
| **Rango (R1/R2/R3)** | Control / identidad | R1 = acento riesgo; R2 = control; R3 = neutral/éxito | No confundir con estado operativo. |
| **Fila seleccionada** | `semantic-control` | Borde izquierdo grueso azul, fondo azul muy suave | Indica "esta fila controla el mapa y los KPIs". |

**Flags:** Además del chip de estado, se puede usar un **indicador lateral** (barra vertical de color) en la fila para escaneo rápido sin leer texto.

**Orden por impacto:** Al ordenar por "Estado", el orden semántico debe ser: **Crítico → Atención → OK** (no alfabético). Al ordenar por "Validados", por defecto **mayor a menor**.

---

## 3. Acciones por fila

| Acción | Dónde | Comportamiento |
|--------|--------|----------------|
| **Clic en fila** | Toda la fila | Selecciona la entidad → `setChartFilter({ type: "seccional", value, label })` → mapa centra/se resalta, KPIs y otros gráficos filtran. Doble clic restablece. |
| **Ver en mapa** | Botón/link en columna Acciones | Scroll al mapa (si existe) + mismo `setChartFilter`; mapa centra en esa seccional. |
| **WhatsApp / Contacto** | Celda o columna Acciones | Abre `https://wa.me/...` sin cambiar filtro. |
| **Alertas** (futuro) | Icono o link | Abre panel de alertas filtrado por esa seccional. |

Las acciones deben ser **visibles y con un solo clic**; no esconder en menú contextual a menos que haya muchas acciones.

---

## 4. Comportamiento al seleccionar una fila

1. **Filtro global:** Se llama `setChartFilter({ type: "seccional", value: id, label: nombre })`.
2. **Mapa:** Recibe `chartFilter`; si `type === "seccional"`, resalta el punto correspondiente y puede centrar la vista o abrir el panel de detalle.
3. **KPIs:** Pueden mostrar datos agregados "para esta seccional" si el backend o el cliente lo soportan; si no, al menos el indicador "Vista: [Nombre seccional]" con opción de restablecer.
4. **Otras tablas y gráficos:** Filtran por la misma seccional (ej. tabla de dirigentes filtrada por seccional seleccionada, si aplica).
5. **Feedback visual:** La fila seleccionada tiene borde izquierdo y fondo suave (`bg-semantic-control/10`, `border-l-4 border-l-semantic-control`). El contenedor de la tabla puede mostrar un anillo sutil si esta tabla es el origen del filtro.

**Doble clic en la fila seleccionada** (o botón "Restablecer vista") llama `resetChartFilter()` y vuelve a la vista global.

---

## 5. Filtro y orden en tiempo real

- **Búsqueda:** Sobre columnas definidas (nombre, titular, barrio, número). Sin recarga; filtrado en cliente.
- **Filtro por estado:** Chips "Todos | OK | Atención | Crítico" que filtran en tiempo real.
- **Filtro por rango:** R1, R2, R3 (en Control de Seccionales).
- **Orden:** Clic en cabecera de columna ordenable alterna asc/desc. Por defecto, **orden por impacto**: estado (Crítico primero) o validados (desc).
- **Opcional — Solo vista del mapa:** Si el mapa tiene vista activa (`mapViewState`), un toggle "Solo seccionales en vista" filtra la tabla a las que están dentro de los bounds actuales.

---

## 6. Resumen de implementación

| Elemento | Implementación |
|----------|----------------|
| Columnas críticas | Control Seccionales: Estado, Rango, Validados, Nº, Nombre, Titular, Contacto. Tabla spark: Estado, Seccional, Barrio, Validados, Tendencia. |
| Chips | SmartTable y TableWithSparklines usan variantes `success` / `warning` / `danger` con clases `semantic-*`. |
| Orden por impacto | SmartTable: `defaultSortKey` + `defaultSortDir`; opcional `sortByImpact` (estado: red → yellow → green; luego numérico desc). |
| Acciones por fila | Columna opcional `actions` en SmartTable (render o array de botones). TableWithSparklines: acciones opcionales (Ver en mapa, WhatsApp). |
| Selección | `onSelectRow` → `setChartFilter`; `selectedRowId` desde `chartFilter.value`; fila con estilo activo. |
| Filtro/orden tiempo real | SmartTable ya tiene search + stateFilter + sort. TableWithSparklines: búsqueda y orden opcionales. |

Objetivo: que el usuario identifique **qué requiere acción** en menos de 3 segundos y ejecute la acción (contacto, ver en mapa, filtrar) en uno o dos clics.

---

## 7. Implementación actual (referencia)

- **SmartTable:** Orden por defecto con `defaultSortKey` y `defaultSortDir`; `getSortValue` para orden semántico (ej. estado: red=0, yellow=1, green=2). Chips con clases semánticas (`semanticChips=true`). Columna opcional `renderRowActions(row)`. Fila seleccionada: `bg-semantic-control/10` y `border-l-4 border-l-semantic-control`. Búsqueda y filtro por estado en tiempo real.
- **Control de Seccionales:** Columnas en orden impacto: Estado, Rango, Validados, Nº, Nombre, Titular, Contacto. Orden inicial por estado (desc = Crítico primero). Acción "Ver en mapa" por fila que aplica filtro y hace scroll al mapa. `scrollToMap` opcional desde la página.
- **TableWithSparklines:** Búsqueda (`searchKeys`), orden por columnas (`sortable`, `defaultSortKey`, `getSortValue`), columna Estado con chip semántico, `renderRowActions` (Ver en mapa + WhatsApp). `filterKey` y `filterLabelKey` para que el valor del filtro sea numero y la etiqueta nombre (sincronía con mapa).
- **Maestro:** Tabla spark con estado primero, orden por impacto, acciones por fila; ControlSeccionales con `scrollToMap={scrollToMapa}`.
