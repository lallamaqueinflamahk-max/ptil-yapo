# Auditoría y rediseño de gráficos del dashboard

**Principio:** Ningún gráfico es estático. Todos interactúan entre sí. Clic en uno filtra el resto. Hover aporta contexto útil. Drill-down obligatorio. Los gráficos responden **preguntas estratégicas**.

---

## 1. Tipos de gráficos por métrica y pregunta

| Métrica / Pregunta | Tipo correcto | Justificación |
|--------------------|---------------|----------------|
| **¿Cómo evoluciona el territorio en el tiempo?** | Líneas (evolución) | Comparar series (validados, leales, verificados) en el tiempo; ver tendencias. |
| **¿Quién concentra leales / influencia?** | Donut o barra horizontal | Partes de un todo (donut) o ranking (barra). Donut para "proporción"; barra para "cantidad absoluta" y comparar. |
| **¿Cuántos hay en cada etapa del embudo?** | Barras horizontales (embudo) o treemap | Etapas secuenciales (certificados → en trámite → sin proceso); ancho = cantidad. |
| **¿Qué seccionales y cómo evolucionan?** | Tabla con sparklines | Una fila por seccional; sparkline = tendencia; clic = filtrar por seccional. |
| **¿Dónde actuar?** | Mapa (no gráfico de barras) | Territorio = mapa. Los gráficos complementan con "quién" y "cuánto". |

**Regla:** Cada gráfico responde **una** pregunta estratégica. El título del bloque debe ser esa pregunta o su traducción directa.

---

## 2. Reglas de interacción cruzada

| Acción | Comportamiento | Efecto en el resto |
|--------|----------------|-------------------|
| **Clic simple** en elemento (segmento, barra, fila, punto) | `setChartFilter({ type, value, label })` | Mapa, tabla, otros gráficos y KPIs reciben el filtro y se actualizan (filtrar por seccional, por líder, por estado, por fecha según tipo). |
| **Doble clic** en el mismo gráfico | `resetChartFilter()` | Vista global; todos los gráficos muestran todos los datos. |
| **Clic en leyenda** | Toggle mostrar/ocultar serie (solo donde aplique) | No cambia filtro global; solo visibilidad en ese gráfico. |
| **Hover** | Tooltip con valor, % y contexto (ej. "Clic para filtrar por este líder") | No cambia filtro; aporta contexto para la acción. |

**Sincronía:** El **contexto** (`chartFilter`, `timeRangeDays`) es la fuente de verdad. Cuando un gráfico hace clic y llama `setChartFilter`, todos los que consumen `chartFilter` (mapa, tabla, LineChart con API, etc.) deben reaccionar. Cuando un gráfico hace doble clic y llama `resetChartFilter`, todos vuelven a vista global.

**Estado activo:** El gráfico que "originó" el filtro actual debe verse **resaltado** (borde, fondo suave o etiqueta "Filtro activo") y el elemento concreto (segmento, barra, fila) que coincide con `chartFilter.value` debe estar destacado. Así el usuario sabe qué clic generó la vista actual.

---

## 3. Uso de color semántico

| Contexto | Color | Uso en gráficos |
|----------|--------|------------------|
| **Éxito / dentro de rango** | Verde (`semantic-success`) | Certificados, leales, OK, meta alcanzada. |
| **Atención / revisar** | Ámbar (`semantic-warning`) | En trámite, pendientes, advertencia. |
| **Riesgo / crítico** | Rojo (`semantic-danger`) | Sin proceso, alerta, fuera de rango. |
| **Control / neutro** | Azul / gris (`semantic-control`, `semantic-neutral`) | Series sin juicio (validados, totales), ejes, leyendas. |

**Reglas:**
- En **embudo**: certificados = verde, en trámite = ámbar, sin proceso = rojo.
- En **donut de líderes**: colores distintos por líder (identidad), sin asignar "bueno/malo" salvo que se pinte por estado (ej. segmento "en riesgo" en rojo).
- En **evolución (líneas)**: cada serie puede tener color propio; si una serie es "meta" o "buena", usar verde; si es "alerta", rojo/ámbar.
- En **tabla**: chip de estado (OK / Atención / Crítico) con verde / ámbar / rojo; fila activa con borde o fondo `semantic-control` suave.

---

## 4. Animaciones funcionales

| Animación | Cuándo | Objetivo |
|-----------|--------|----------|
| **Entrada inicial** | Al montar el gráfico | Barras/líneas/segmentos animan desde 0 o desde valor anterior (Recharts `animationDuration`). Duración ~400–600 ms. |
| **Al filtrar** | Cuando `chartFilter` cambia | Los datos del gráfico cambian; la transición debe ser suave (Recharts anima por defecto al cambiar `data`). |
| **Hover** | Al pasar sobre elemento | Ligero aumento de tamaño o brillo (ej. `activeDot` más grande, segmento donut con `outerRadius+6`). No retrasar el tooltip. |
| **Estado activo** | Cuando el gráfico es el origen del filtro | Borde o anillo discreto (ej. `ring-2 ring-semantic-control`) en el contenedor del gráfico; el elemento activo con fondo/borde resaltado. |

**No animar:** Cambios de tema, redimensionado ventana (opcional), ni animaciones decorativas que no aporten feedback.

---

## 5. Drill-down obligatorio

Cada gráfico debe permitir **ir al detalle** de lo que muestra:

| Gráfico | Drill-down |
|---------|------------|
| **Evolución temporal** | Clic en punto = filtrar por fecha/período; tooltip "Ver detalle de este período" o enlace a vista de detalle por fecha. |
| **Leales por líderes (donut)** | Clic = filtrar por líder (ya hace filtro). Añadir en tooltip o debajo: "Ver en mapa" / "Ver seccionales de este líder" (el mapa ya reacciona al filtro). |
| **Seguidores por concejales (barra)** | Clic = filtrar (ya). Drill-down: mismo filtro lleva al mapa y tabla; opcional botón "Ver detalle" que scroll al mapa o abre panel. |
| **Embudo** | Clic en etapa = filtrar por estado (certificados / en trámite / sin proceso); drill-down = "Ver lista" a capacitación o listado de personas en esa etapa. |
| **Tabla con sparklines** | Clic en fila = filtrar por seccional (ya). Drill-down = mapa centrado en esa seccional + panel detalle (ya al filtrar). |

**Implementación:** Donde el clic solo hace `setChartFilter`, el "drill-down" es que el **resto** del dashboard (mapa, tabla, otros gráficos) ya reacciona. Donde haga falta un paso más (ej. "Ir a capacitación"), un botón o enlace explícito en el gráfico o en el tooltip.

---

## 6. Resumen: checklist por gráfico

- [ ] **Ningún gráfico estático:** todos tienen al menos clic → filtro o clic → drill-down.
- [ ] **Interacción cruzada:** clic en cualquier gráfico actualiza `chartFilter` y el resto reacciona.
- [ ] **Hover:** tooltip con valor, % y texto tipo "Clic para filtrar por X".
- [ ] **Doble clic:** restablece filtro en todos.
- [ ] **Drill-down:** clic lleva a filtro y, si aplica, a enlace/botón a vista de detalle.
- [ ] **Color semántico:** verde/ámbar/rojo donde hay estado o juicio de valor.
- [ ] **Animación:** entrada y transición de datos suaves; hover y estado activo visibles.
- [ ] **Estado activo:** el gráfico y el elemento que originaron el filtro se muestran resaltados.

---

## 7. Implementación de referencia

- **DonutChartStates, BarChartRanking, LineChartDynamic, TableWithSparklines:** ya usan `setChartFilter` y `resetChartFilter`; leyenda toggle; doble clic resetea. Pendiente: estado activo (resaltar cuando `chartFilter` coincide) y tooltip con "Clic para filtrar…".
- **EmbudoIdoneidad:** antes estático; rediseño: clic en etapa → `setChartFilter({ type: "state", value: idEtapa, label })`; botón "Derivar Capacitación" o "Ver lista" → drill-down a capacitación. Colores semánticos en etapas.
- **ChartInteractionsHint:** puede recibir texto opcional por gráfico (ej. "Clic en segmento = filtrar por líder").
- **Recharts:** `animationDuration={400}` y `isAnimationActive={true}` por defecto; activar en todos los gráficos que cambian datos.

---

## 8. Implementación actual (referencia)

- **DonutChartStates:** Clic/doble clic filtra/restablece; leyenda toggle; **estado activo**: anillo en contenedor y segmento activo con borde `semantic-control`; tooltip con "Clic para filtrar"; animación 400 ms.
- **BarChartRanking:** Igual; barra activa con `stroke` semántico; `ChartInteractionsHint` con mensaje específico; animación en `Bar`.
- **TableWithSparklines:** Fila activa con `bg-semantic-control/10` y `border-l-4 border-l-semantic-control`; hint por gráfico.
- **LineChartDynamic:** Animación en cada `Line`; hint con mensaje; clic en punto ya filtra por evolución.
- **EmbudoIdoneidad:** **Antes estático;** ahora: clic en etapa → `setChartFilter({ type: "state", value: id, label })`; doble clic restablece; colores semánticos (éxito/advertencia/riesgo); etapa activa con ring; "Derivar Capacitación" y "Ver listado" → enlaces a `/dashboard/capacitacion` (drill-down); usa `useDashboardChartsOptional` para no requerir provider.
- **ChartInteractionsHint:** Acepta prop `message` opcional para texto por gráfico.
