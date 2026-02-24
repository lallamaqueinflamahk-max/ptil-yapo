/**
 * Estado global del dashboard (Zustand).
 * Una sola fuente de verdad: KPIs, mapas, gráficos, tablas y alertas
 * reaccionan al mismo filtro y vista del mapa.
 */

import { create } from "zustand";

export type TimeRangeDays = 30 | 60 | 90;

export interface ChartFilterValue {
  type: "ranking" | "state" | "kpi" | "seccional";
  value: string;
  label?: string;
}

export interface MapViewState {
  bounds: [[number, number], [number, number]];
  zoom: number;
}

interface DashboardState {
  chartFilter: ChartFilterValue | null;
  timeRangeDays: TimeRangeDays;
  hiddenLegendKeys: Set<string>;
  mapViewState: MapViewState | null;
}

interface DashboardActions {
  setChartFilter: (filter: ChartFilterValue | null) => void;
  resetChartFilter: () => void;
  setTimeRangeDays: (days: TimeRangeDays) => void;
  toggleLegendKey: (chartId: string, itemKey: string) => void;
  setMapViewState: (state: MapViewState | null) => void;
}

/** Store: estado + acciones. Cualquier componente puede suscribirse por selector. */
export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  chartFilter: null,
  timeRangeDays: 60,
  hiddenLegendKeys: new Set(),
  mapViewState: null,

  setChartFilter: (filter) => set({ chartFilter: filter }),

  resetChartFilter: () => set({ chartFilter: null }),

  setTimeRangeDays: (days) => set({ timeRangeDays: days }),

  toggleLegendKey: (chartId, itemKey) => {
    const key = `${chartId}:${itemKey}`;
    set((state) => {
      const next = new Set(state.hiddenLegendKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { hiddenLegendKeys: next };
    });
  },

  setMapViewState: (state) => set({ mapViewState: state }),
}));

/** Selectores: evitan re-renders innecesarios cuando solo se usa una parte del estado. */
export const selectChartFilter = (s: DashboardState) => s.chartFilter;
export const selectSetChartFilter = (s: DashboardActions) => s.setChartFilter;
export const selectResetChartFilter = (s: DashboardActions) => s.resetChartFilter;
export const selectTimeRangeDays = (s: DashboardState) => s.timeRangeDays;
export const selectSetTimeRangeDays = (s: DashboardActions) => s.setTimeRangeDays;
export const selectHiddenLegendKeys = (s: DashboardState) => s.hiddenLegendKeys;
export const selectToggleLegendKey = (s: DashboardActions) => s.toggleLegendKey;
export const selectMapViewState = (s: DashboardState) => s.mapViewState;
export const selectSetMapViewState = (s: DashboardActions) => s.setMapViewState;
