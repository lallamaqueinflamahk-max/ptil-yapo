# Estado global del dashboard (Zustand)

Una sola **fuente de verdad** para que **KPIs**, **mapas**, **gráficos**, **tablas** y **alertas** respondan entre sí.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│  store/dashboardStore.ts (Zustand)                                      │
│  Estado: chartFilter, timeRangeDays, hiddenLegendKeys, mapViewState      │
│  Acciones: setChartFilter, resetChartFilter, setTimeRangeDays,           │
│            toggleLegendKey, setMapViewState                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │  DashboardChartProvider lee y escribe
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  context/DashboardChartContext.tsx                                      │
│  Expone la misma API: useDashboardCharts() / useDashboardChartsOptional │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
   KPIs / Mapas              Gráficos                   Tablas / Alertas
   (setChartFilter,           (setChartFilter,           (chartFilter,
    mapViewState)              timeRangeDays,             setChartFilter)
                                hiddenLegendKeys)
```

- **Quién escribe:** Cualquier bloque que dispare una acción (clic en KPI, en gráfico, en fila de tabla, movimiento del mapa).
- **Quién lee:** Todos los que usan `useDashboardCharts()` o `useDashboardStore(selector)` reaccionan al mismo estado.

## Flujo de datos

1. **Usuario hace clic en un KPI (ej. “Seccional X”)**  
   → El componente llama `setChartFilter({ type: "seccional", value: "X", label: "..." })`.  
   → El store actualiza `chartFilter`.  
   → El mapa resalta/selecciona esa seccional, las tablas filtran por seccional, los gráficos pueden mostrar solo esa serie, las alertas pueden resaltar ítems de esa seccional.

2. **Usuario hace clic en un segmento de un gráfico (ej. donut “VERIFICADO”)**  
   → El gráfico llama `setChartFilter({ type: "state", value: "VERIFICADO", label: "..." })`.  
   → Mapa, tablas, KPIs y alertas reciben el mismo `chartFilter` y pueden filtrar o resaltar por ese estado.

3. **Usuario hace clic en una fila de una tabla**  
   → La tabla llama `setChartFilter({ type: "ranking" | "seccional", value, label })`.  
   → Mapa, KPIs, otros gráficos y alertas se actualizan con ese filtro.

4. **Usuario mueve/zoom el mapa**  
   → El mapa llama `setMapViewState({ bounds, zoom })`.  
   → KPIs o tablas que filtran “seccionales en vista” usan `mapViewState.bounds` para filtrar datos.

5. **Usuario hace doble clic (o “Limpiar filtro”)**  
   → Se llama `resetChartFilter()`.  
   → Todo vuelve a estado sin filtro.

6. **Usuario hace clic en la leyenda de un gráfico**  
   → Se llama `toggleLegendKey(chartId, itemKey)`.  
   → Solo ese gráfico (y quien lea `hiddenLegendKeys`) oculta/muestra la serie; el resto del dashboard sigue con el mismo `chartFilter`.

## Dónde está implementado

- **Store:** `store/dashboardStore.ts`  
  - Tipos: `ChartFilterValue`, `MapViewState`, `TimeRangeDays`.  
  - Hook: `useDashboardStore`.  
  - Selectores: `selectChartFilter`, `selectSetChartFilter`, etc., para re-renders granulares.

- **Provider:** `context/DashboardChartContext.tsx`  
  - `DashboardChartProvider` usa el store como fuente de verdad y reexpone la misma API por contexto.  
  - Los componentes pueden seguir usando `useDashboardCharts()` sin cambios.

- **Página de ejemplo:** `app/dashboard/maestro/page.tsx`  
  - Concentra KPIs, mapa interactivo, gráficos (líneas, barras, donut, embudo), tablas (ControlSeccionales, TableWithSparklines) y PanelAlertas.  
  - Todos leen `chartFilter` y `mapViewState` y escriben con `setChartFilter` / `setMapViewState`; al cambiar el filtro desde cualquier bloque, el resto responde.

## Ejemplo mínimo de uso directo del store

Si en el futuro querés usar el store sin pasar por el contexto:

```ts
import { useDashboardStore, selectChartFilter, selectSetChartFilter } from "@/store/dashboardStore";

function MiComponente() {
  const chartFilter = useDashboardStore(selectChartFilter);
  const setChartFilter = useDashboardStore(selectSetChartFilter);

  const handleClick = () => {
    setChartFilter({ type: "kpi", value: "lealtad", label: "Índice de Lealtad" });
  };

  return (
    <div>
      Filtro activo: {chartFilter?.label ?? "Ninguno"}
      <button onClick={handleClick}>Filtrar por Lealtad</button>
    </div>
  );
}
```

El mismo comportamiento se obtiene usando `useDashboardCharts()` desde el contexto; el valor viene del store.

## Ejemplo: dos bloques que responden entre sí

**Bloque A (disparador):** un botón que pone filtro por seccional.

```tsx
function BloqueA() {
  const { setChartFilter } = useDashboardCharts();
  return (
    <button
      onClick={() =>
        setChartFilter({
          type: "seccional",
          value: "Referente",
          label: "Seccional Referente",
        })
      }
    >
      Filtrar por Referente
    </button>
  );
}
```

**Bloque B (reactivo):** muestra el filtro activo y un botón para limpiar.

```tsx
function BloqueB() {
  const { chartFilter, resetChartFilter } = useDashboardCharts();
  return (
    <div>
      Filtro: {chartFilter?.label ?? "Ninguno"}
      {chartFilter && (
        <button onClick={resetChartFilter}>Limpiar</button>
      )}
    </div>
  );
}
```

Si ambos están dentro de `DashboardChartProvider`, al hacer clic en "Filtrar por Referente" el Bloque B se actualiza de inmediato; al hacer "Limpiar", el Bloque B vuelve a "Ninguno". En la página **Maestro** (`/dashboard/maestro`), el mapa, la tabla de seccionales, los gráficos y las alertas actúan como múltiples "Bloques B" ante los "Bloques A" (KPIs, gráficos, tabla) que llaman `setChartFilter`.
