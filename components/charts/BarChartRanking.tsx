"use client";

import { useRef, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import ChartInteractionsHint from "./ChartInteractionsHint";
import { BarChartTooltip } from "./RichTooltip";
import { getSemanticColor } from "./constants";

export interface BarChartRankingProps<T extends Record<string, unknown>> {
  data: T[];
  dataKey: string;
  barKey: string;
  nameKey?: string;
  colorKey?: keyof T;
  title?: string;
  chartId?: string;
  filterType?: "ranking" | "state" | "kpi";
  height?: number;
  className?: string;
}

export default function BarChartRanking<T extends Record<string, unknown> & { nombre?: string; [k: string]: unknown }>({
  data,
  dataKey,
  barKey,
  nameKey = "nombre",
  colorKey,
  title,
  chartId = "ranking",
  filterType = "ranking",
  height = 280,
  className = "",
}: BarChartRankingProps<T>) {
  const { chartFilter, setChartFilter, resetChartFilter, hiddenLegendKeys, toggleLegendKey } = useDashboardCharts();
  const isFilterOrigin = chartFilter?.type === filterType;
  const lastClickRef = useRef<number>(0);

  const getColor = (entry: T, index: number) => {
    if (colorKey && entry[colorKey]) return String(entry[colorKey]);
    return getSemanticColor(index);
  };

  const visibleData = data.filter((row) => {
    const name = (row[nameKey] ?? row.nombre) as string;
    return !hiddenLegendKeys.has(`${chartId}:${name}`);
  });

  const total = useMemo(
    () => visibleData.reduce((acc, row) => acc + Number((row[barKey] as number) ?? 0), 0),
    [visibleData, barKey]
  );

  const handleClick = (state: { activePayload?: { payload?: T }[] }) => {
    const payload = state?.activePayload?.[0]?.payload;
    if (!payload) return;
    const name = (payload[nameKey] ?? payload.nombre) as string;
    if (!name) return;
    const now = Date.now();
    if (now - lastClickRef.current < 400) {
      resetChartFilter();
      lastClickRef.current = 0;
      return;
    }
    lastClickRef.current = now;
    setChartFilter({ type: filterType, value: name, label: name });
  };

  const renderLegend = (props: { payload?: { value: string }[] }) => {
    if (!props.payload?.length) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-2">
        {data.slice(0, 8).map((entry, i) => {
          const name = (entry[nameKey] ?? entry.nombre) as string;
          const key = `${chartId}:${name}`;
          const hidden = hiddenLegendKeys.has(key);
          return (
            <li
              key={String(entry[dataKey] ?? i)}
              onClick={() => toggleLegendKey(chartId, name)}
              className="flex items-center gap-1.5 cursor-pointer select-none text-xs"
            >
              <span
                className="inline-block w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: hidden ? "transparent" : getColor(entry, i) }}
              />
              <span className={hidden ? "text-dash-muted line-through" : ""}>{name}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`${className} ${isFilterOrigin ? "ring-2 ring-semantic-control/50 ring-offset-2 rounded-xl" : ""}`}>
      {title && <h3 className="text-base font-semibold text-dash-blue mb-2">{title}</h3>}
      <ChartInteractionsHint message="Clic en barra = filtrar por este valor · Doble clic = restablecer" />
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visibleData}
            margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
            onClick={handleClick}
            onDoubleClick={() => resetChartFilter()}
            barCategoryGap="12%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString("es-PY")} />
            <Tooltip
              content={(props) => (
                <BarChartTooltip
                  {...props}
                  valueFormatter={(v) => v.toLocaleString("es-PY")}
                  total={total}
                  showPct={true}
                />
              )}
              cursor={{ fill: "rgba(30, 58, 138, 0.08)" }}
            />
            <Legend content={renderLegend} />
            <Bar dataKey={barKey} name={barKey} radius={[6, 6, 0, 0]} cursor="pointer" isAnimationActive animationDuration={400}>
              {visibleData.map((entry, index) => {
                const name = (entry[nameKey] ?? entry.nombre) as string;
                const active = isFilterOrigin && chartFilter?.value === name;
                return (
                  <Cell
                    key={String(entry[dataKey] ?? index)}
                    fill={getColor(entry, index)}
                    stroke={active ? "var(--semantic-control)" : undefined}
                    strokeWidth={active ? 3 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
