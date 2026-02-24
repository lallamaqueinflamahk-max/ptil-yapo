# Sistema de color semántico — Dashboard (fondo blanco)

**Principio:** El color nunca es decorativo. Cada color comunica **estado**, **riesgo** o **control**. El usuario debe identificar problemas en **3 segundos** sin leer números.

---

## 1. Paleta principal (semántica)

| Rol | Nombre token | Hex | Uso único |
|-----|----------------|-----|-----------|
| **Control** | `semantic-control` | `#1E3A8A` | Navegación, CTAs principales, “yo tengo el control”, filtros activos. |
| **Éxito** | `semantic-success` | `#0D9488` | Dentro de rango, OK, completado, cubierto, meta alcanzada. |
| **Advertencia** | `semantic-warning` | `#B45309` | Revisar pronto, atención, no crítico. |
| **Riesgo** | `semantic-danger` | `#B91C1C` | Actuar ya, crítico, fuera de rango, alerta. |
| **Neutral** | `semantic-neutral` | `#475569` | Dato sin juicio, secundario, deshabilitado. |

**Regla de oro:**  
- **Verde (éxito)** = “todo bien” o “en camino”.  
- **Amarillo/ámbar (advertencia)** = “mirar en breve”.  
- **Rojo (riesgo)** = “mirar ahora”.  
- **Azul (control)** = “acción o contexto de mando”.  
- **Gris (neutral)** = “solo información”.

---

## 2. Paleta secundaria (refuerzo y contraste)

Para fondos, bordes y texto sobre blanco, sin introducir nuevos significados:

| Token | Hex | Uso |
|-------|-----|-----|
| `semantic-success-bg` | `#CCFBF1` | Fondo de card/ fila “OK”. |
| `semantic-success-border` | `#0D9488` | Borde, indicador “OK”. |
| `semantic-warning-bg` | `#FEF3C7` | Fondo “atención”. |
| `semantic-warning-border` | `#B45309` | Borde, indicador “atención”. |
| `semantic-danger-bg` | `#FEE2E2` | Fondo “crítico”. |
| `semantic-danger-border` | `#B91C1C` | Borde, indicador “crítico”. |
| `semantic-neutral-bg` | `#F1F5F9` | Fondo de zona neutra. |
| `semantic-neutral-border` | `#94A3B8` | Bordes neutros. |

---

## 3. Cuándo usar cada color

### Control (azul `#1E3A8A`)
- Nav activa, botón principal del dashboard.
- Filtro activo (“Vista detallada: X”).
- Títulos de sección que implican acción (ej. “Acciones prioritarias”).
- Enlaces “Ver en mapa”, “Ver detalle”.
- **No usar** para estados de riesgo/éxito ni para números de KPI (salvo que sea “control” explícito).

### Éxito (verde `#0D9488`)
- KPI dentro de rango o con tendencia positiva.
- Estado “OK”, “Cubierta”, “Completado”.
- Semáforo verde en mapa y tablas.
- Barras o segmentos que representan “buen” resultado.
- **No usar** para “cantidad” sin juicio (ahí usar neutral).

### Advertencia (ámbar `#B45309`)
- KPI que requiere revisión (ej. “atención”).
- Estado “Atención”, “En proceso”, “Pendiente de revisión”.
- Semáforo amarillo en mapa y tablas.
- Alertas de nivel “warning”.
- **No usar** para “crítico” (ahí usar riesgo).

### Riesgo (rojo `#B91C1C`)
- KPI crítico o fuera de rango.
- Estado “Crítico”, “Sin responsable”, “Alerta”.
- Semáforo rojo en mapa y tablas.
- Alertas de nivel “crítico”.
- **No usar** para “atención” (reservar rojo para lo urgente).

### Neutral (gris `#475569`)
- Números o datos sin estado (ej. “Total: 1.234”).
- Encabezados de tabla, ejes, leyendas.
- Texto secundario, placeholders.
- **No usar** para indicar “bueno” o “malo” (usar éxito/riesgo).

---

## 4. Aplicación por componente

### KPIs (números y anillos)
- **Fondo de card:** según estado del KPI.  
  - En rango → `semantic-success-bg` + borde `semantic-success-border`.  
  - Atención → `semantic-warning-bg` + borde `semantic-warning-border`.  
  - Crítico → `semantic-danger-bg` + borde `semantic-danger-border`.  
  - Solo informativo → `semantic-neutral-bg` + borde `semantic-neutral-border`.
- **Número:** mismo color que el estado (éxito / advertencia / riesgo). Si es neutral, texto `semantic-neutral`.
- **Anillo de progreso:** color de estado (verde = bien, ámbar = atención, rojo = mal). Nunca azul para “porcentaje de salud”.
- **Meta:** texto “Meta 80%” en neutral; si se cumple, refuerzo en éxito.

### Mapas
- **Puntos/círculos por seccional:**  
  - Verde = OK.  
  - Amarillo = Atención.  
  - Rojo = Crítico.  
- **Leyenda:** mismos tres colores + etiquetas “OK”, “Atención”, “Crítico”. Sin más colores para “estado”.
- **Capas temáticas (ej. Leales, Riesgo):** pueden usar tonos distintos siempre que la **leyenda** diga qué significa cada uno y no se confunda con el semáforo (OK/Atención/Crítico). Recomendación: usar el mismo rojo/ámbar/verde para “estado”; otras capas en azul o gris para “capa de dato”, no estado.

### Tablas
- **Fila:** fondo suave según estado de la fila (éxito-bg / warning-bg / danger-bg) o sin fondo si es neutral.
- **Chip de estado:**  
  - “OK” → verde (fondo + texto).  
  - “Atención” → ámbar.  
  - “Crítico” → rojo.  
- **Columna numérica “salud”:** color del número = estado (verde/ámbar/rojo). No usar azul para valores.

### Alertas
- **Borde/card:**  
  - Crítico → `semantic-danger-border` + `semantic-danger-bg`.  
  - Atención → `semantic-warning-border` + `semantic-warning-bg`.  
  - Info → `semantic-neutral-border` + `semantic-neutral-bg`.
- **Icono y título:** mismo color que el nivel (rojo / ámbar / gris).
- **Banner “X alertas críticas”:** fondo y borde riesgo; texto en rojo oscuro.

---

## 5. Resumen visual (3 segundos)

Objetivo: que el usuario identifique problemas sin leer números.

| Lo que ve | Significado |
|-----------|-------------|
| Mucho **verde** en KPIs y mapa | Territorio o métricas en rango. |
| **Amarillo** en una card o en el mapa | Esa unidad necesita atención. |
| **Rojo** en una card o en el mapa | Esa unidad es prioridad ahora. |
| **Azul** en nav o botón | Acción o contexto de control. |
| **Gris** | Dato o contexto, sin alarma. |

Regla de uso: **un solo significado por color en todo el dashboard.** Verde = siempre “OK/éxito”; rojo = siempre “riesgo/crítico”; amarillo = siempre “advertencia/atención”.

---

## 6. Tokens en código (CSS / Tailwind)

Variables en `:root` (`app/globals.css`) y tema Tailwind (`tailwind.config.ts`). Prefijo de clases: `semantic-*`.

---

## 7. Ejemplos aplicados

### KPIs

```html
<!-- KPI en rango (éxito) -->
<div class="border-2 border-semantic-success-border bg-semantic-success-bg rounded-xl p-4">
  <p class="text-2xl font-bold text-semantic-success">78%</p>
  <p class="text-sm text-semantic-neutral">Índice de Lealtad · Meta 80%</p>
</div>

<!-- KPI atención -->
<div class="border-2 border-semantic-warning-border bg-semantic-warning-bg rounded-xl p-4">
  <p class="text-2xl font-bold text-semantic-warning">24%</p>
  <p class="text-sm text-semantic-neutral">Riesgo Político · Revisar</p>
</div>

<!-- KPI crítico -->
<div class="border-2 border-semantic-danger-border bg-semantic-danger-bg rounded-xl p-4">
  <p class="text-sm font-bold text-semantic-danger">ALERTA 2 líderes &gt; 40%</p>
  <p class="text-xs text-semantic-neutral">Concentración de Poder</p>
</div>

<!-- KPI solo dato (neutral) -->
<div class="border-2 border-semantic-neutral-border bg-semantic-neutral-bg rounded-xl p-4">
  <p class="text-2xl font-bold text-semantic-neutral">35.720</p>
  <p class="text-sm text-semantic-neutral">Total votantes</p>
</div>
```

### Mapas (leyenda y puntos)

- **Punto OK:** `#0D9488` (semantic-success) o clase `bg-semantic-success`.
- **Punto Atención:** `#B45309` (semantic-warning) o `bg-semantic-warning`.
- **Punto Crítico:** `#B91C1C` (semantic-danger) o `bg-semantic-danger`.
- Leyenda: mismo color + etiqueta "OK" / "Atención" / "Crítico".

### Tablas (chips de estado)

```html
<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-semantic-success-bg text-semantic-success border border-semantic-success-border">OK</span>
<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-semantic-warning-bg text-semantic-warning border border-semantic-warning-border">Atención</span>
<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-semantic-danger-bg text-semantic-danger border border-semantic-danger-border">Crítico</span>
```

### Alertas (card por nivel)

```html
<div class="border-2 border-semantic-danger-border bg-semantic-danger-bg rounded-xl p-4">
  <p class="font-semibold text-semantic-danger">Riesgo político · Seccional 12</p>
  ...
</div>
```

### CTAs y control

```html
<button class="bg-semantic-control text-white hover:bg-semantic-control-hover ...">Ver en mapa</button>
<nav class="... active:bg-semantic-control active:text-white">...</nav>
```

Con estos usos, el usuario identifica en ~3 segundos: verde = bien, amarillo = atención, rojo = problema, azul = acción.
