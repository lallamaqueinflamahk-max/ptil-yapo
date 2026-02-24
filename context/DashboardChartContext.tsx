"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useDashboardStore,
  selectChartFilter,
  selectSetChartFilter,
  selectResetChartFilter,
  selectTimeRangeDays,
  selectSetTimeRangeDays,
  selectHiddenLegendKeys,
  selectToggleLegendKey,
  selectMapViewState,
  selectSetMapViewState,
  type ChartFilterValue,
  type MapViewState,
  type TimeRangeDays,
} from "@/store/dashboardStore";

export type { ChartFilterValue, MapViewState, TimeRangeDays } from "@/store/dashboardStore";

interface DashboardChartContextValue {
  chartFilter: ChartFilterValue | null;
  setChartFilter: (filter: ChartFilterValue | null) => void;
  resetChartFilter: () => void;
  timeRangeDays: TimeRangeDays;
  setTimeRangeDays: (d: TimeRangeDays) => void;
  hiddenLegendKeys: Set<string>;
  toggleLegendKey: (chartId: string, itemKey: string) => void;
  mapViewState: MapViewState | null;
  setMapViewState: (state: MapViewState | null) => void;
}

const DashboardChartContext = createContext<DashboardChartContextValue | null>(null);

export function useDashboardCharts() {
  const ctx = useContext(DashboardChartContext);
  if (!ctx) {
    throw new Error("useDashboardCharts debe usarse dentro de DashboardChartProvider");
  }
  return ctx;
}

export function useDashboardChartsOptional() {
  return useContext(DashboardChartContext);
}

/** Provider que conecta el contexto con el store de Zustand. Una sola fuente de verdad. */
export function DashboardChartProvider({ children }: { children: ReactNode }) {
  const chartFilter = useDashboardStore(selectChartFilter);
  const setChartFilter = useDashboardStore(selectSetChartFilter);
  const resetChartFilter = useDashboardStore(selectResetChartFilter);
  const timeRangeDays = useDashboardStore(selectTimeRangeDays);
  const setTimeRangeDays = useDashboardStore(selectSetTimeRangeDays);
  const hiddenLegendKeys = useDashboardStore(selectHiddenLegendKeys);
  const toggleLegendKey = useDashboardStore(selectToggleLegendKey);
  const mapViewState = useDashboardStore(selectMapViewState);
  const setMapViewState = useDashboardStore(selectSetMapViewState);

  const value: DashboardChartContextValue = {
    chartFilter,
    setChartFilter,
    resetChartFilter,
    timeRangeDays,
    setTimeRangeDays,
    hiddenLegendKeys,
    toggleLegendKey,
    mapViewState,
    setMapViewState,
  };

  return (
    <DashboardChartContext.Provider value={value}>
      {children}
    </DashboardChartContext.Provider>
  );
}
