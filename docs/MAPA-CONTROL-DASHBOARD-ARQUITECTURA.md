# Mapa que controla el dashboard — Arquitectura

El **MapaControlDashboard** es el mapa interactivo que **controla** KPIs, gráficos y tablas. No es decorativo: cada interacción tiene repercusión en el resto del dashboard.

---

## 1. Stack

- **React** (client components)
- **Leaflet** (mapa base + marcadores, tooltips, flyTo)
- **DashboardChartContext** (filtro global: `chartFilter`, `setMapViewState`)
- **Framer Motion** (panel lateral y overlay)

---

## 2. Arquitectura de componentes

```
components/dashboard/MapaControlDashboard/
├── index.ts                 # Export público
├── types.ts                 # SeccionalMapaControl, CapaControlId, ZoomSemantico
├── constants.ts             # CAPAS_CONTROL, ESTADO_COLOR, zoom levels, tiles
└── MapaControlDashboard.tsx # Contenedor principal (mapa + capas + panel)
```

### Flujo de datos

1. **Entrada:** La página (ej. `/dashboard/mapa-control`) obtiene `seccionales` y `capas` de la API (`/api/dashboard/maestro`) y los pasa al mapa.
2. **Contexto:** El mapa usa `useDashboardCharts()` para:
   - **Leer** `chartFilter` → si `type === "seccional"`, muestra panel y resalta seccional.
   - **Escribir** `setChartFilter({ type: "seccional", value, label })` al hacer clic en un punto.
   - **Escribir** `setMapViewState({ bounds, zoom })` en cada `moveend`.
   - **Escribir** `resetChartFilter()` al cerrar el panel.
3. **Salida:** Cualquier componente que consuma `chartFilter` (KPIs, tabla, gráficos) se actualiza cuando el usuario hace clic en el mapa.

---

## 3. Funcionalidades

| Funcionalidad | Implementación |
|---------------|----------------|
| **Capas activables** | Lealtad, Riesgo, Verificación, Idoneidad. Chips arriba a la izquierda; cada capa muestra puntos desde `capas[dataKey]`. Colores semánticos (Design System). |
| **Hover con tooltip** | Leaflet `bindTooltip` en cada marcador de seccional: nombre, barrio, titular, validados, estado. Texto "Clic para filtrar dashboard". |
| **Clic recalcula dashboard** | `marker.on("click", () => handleSeccionalClick(s))` → `setChartFilter({ type: "seccional", value, label })`. KPIs, gráficos y tablas que lean `chartFilter` recalculan o filtran. |
| **Zoom semántico** | Etiqueta arriba a la derecha: "Vista ciudad" (zoom ≤11), "Vista barrio" (12–14), "Vista seccional" (15+). `moveend` actualiza la etiqueta y `setMapViewState`. |
| **Animaciones** | `map.flyTo(latlng, zoom, { duration: 0.6 })` al hacer clic en seccional; `flyTo(CENTRO, ZOOM_CIUDAD, { duration: 0.5 })` al cerrar panel. Panel lateral con Framer Motion (`initial={{ x: "100%" }}`, `animate={{ x: 0 }}`, spring). |

---

## 4. Capas (semánticas)

| Capa | dataKey | Color | Uso |
|------|---------|--------|-----|
| Lealtad | `leales` | success (#0D9488) | Puntos de adherentes leales. |
| Riesgo | `riesgo` | danger (#B91C1C) | Puntos en riesgo. |
| Verificación | `no_verificados` | warning (#B45309) | Pendientes de verificación. |
| Idoneidad | `capacitacion` | control (#1E3A8A) | Demanda de capacitación. |

---

## 5. Estados del mapa

- **Filtro por estado:** Botones "Todos", "OK", "Atención", "Crítico" filtran qué seccionales se dibujan (mismo dato, filtro visual).
- **Selección:** `chartFilter?.type === "seccional"` → panel abierto y zoom a esa seccional. Cerrar panel → `resetChartFilter()` y zoom out a ciudad.

---

## 6. Ejemplo funcional

**Ruta:** `/dashboard/mapa-control`

- **MapaControlDashboard** con datos de `/api/dashboard/maestro`.
- **KPIs** (Seccionales, En riesgo, Validados, Acción) que leen `chartFilter` y muestran "Filtro activo" o vista global.
- **Tabla** de seccionales que resalta la fila cuando `chartFilter.value === numero`.

El clic en el mapa actualiza el contexto → los KPIs y la tabla se actualizan sin prop drilling.

---

## 7. Integración en otras páginas

Para usar el mapa en otra vista (ej. maestro):

```tsx
import { MapaControlDashboard } from "@/components/dashboard/MapaControlDashboard";

// Dentro de DashboardChartProvider
<MapaControlDashboard
  seccionales={seccionalesControl}
  capas={capasMapa}
  height={520}
/>
```

Asegurarse de que los datos `seccionales` tengan la forma `SeccionalMapaControl` (id, numero, nombre, barrio, titular, lat, lng, cantidadValidados, estado, estadoLabel) y que `capas` tenga las claves `leales`, `riesgo`, `no_verificados`, `capacitacion`.
