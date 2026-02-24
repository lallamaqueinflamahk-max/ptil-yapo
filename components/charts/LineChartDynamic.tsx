"use client";

import { useRef } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDashboardCharts, type TimeRangeDays } from "@/context/DashboardChartContext";
import ChartInteractionsHint from "./ChartInteractionsHint";
import { LineChartTooltip } from "./RichTooltip";
import { CHART_PALETTE } from "./constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DIAS_OPTIONS: { value: TimeRangeDays; label: string }[] = [
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

export interface LineChartDynamicProps {
  title?: string;
  /** ID para leyendas clickeables (ocultar serie) */
  chartId?: string;
  /** Métricas a mostrar (keys del objeto en cada punto) */
  dataKeys?: { key: string; color: string; name: string }[];
  className?: string;
  height?: number;
}

export default function LineChartDynamic({
  title = "Evolución temporal",
  chartId = "evolucion",
  dataKeys = [
    { key: "validados", color: CHART_PALETTE[0], name: "Validados" },
    { key: "leales", color: CHART_PALETTE[1], name: "Leales" },
    { key: "verificados", color: CHART_PALETTE[2], name: "Verificados" },
  ],
  className = "",
  height = 320,
}: LineChartDynamicProps) {
  const { timeRangeDays, setTimeRangeDays, chartFilter, setChartFilter, resetChartFilter, hiddenLegendKeys, toggleLegendKey } = useDashboardCharts();
  const lastClickRef = useRef<number>(0);

  const { data } = useSWR<{ serie: Array<Record<string, unknown>>; dias: number }>(
    `/api/dashboard/evolucion?dias=${timeRangeDays}${chartFilter ? `&filter=${encodeURIComponent(chartFilter.value)}` : ""}`,
    fetcher,
    { refreshInterval: 20000 }
  );

  const serie = data?.serie ?? [];

  const handleClick = (state: { activePayload?: { payload?: Record<string, unknown> }[] }) => {
    const payload = state?.activePayload?.[0]?.payload;
    if (!payload) return;
    const now = Date.now();
    if (now - lastClickRef.current < 400) {
      resetChartFilter();
      lastClickRef.current = 0;
      return;
    }
    lastClickRef.current = now;
    setChartFilter({
      type: "kpi",
      value: "evolucion",
      label: `Evolución · ${payload.etiqueta ?? payload.fecha}`,
    });
  };

  const renderLegend = (props: { payload?: { value: string; color: string }[] }) => {
    if (!props.payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {props.payload.map((entry) => {
          const dataKey = dataKeys.find((k) => k.name === entry.value)?.key ?? entry.value;
          const key = `${chartId}:${dataKey}`;
          const hidden = hiddenLegendKeys.has(key);
          return (
            <li
              key={entry.value}
              onClick={() => toggleLegendKey(chartId, dataKey)}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: hidden ? "transparent" : entry.color }}
              />
              <span className={hidden ? "text-dash-muted line-through" : ""}>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {title && <h3 className="text-base font-semibold text-dash-blue">{title}</h3>}
        <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
          {DIAS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeRangeDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRangeDays === opt.value ? "bg-dash-blue text-white" : "text-dash-muted hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <ChartInteractionsHint message="Clic en punto = filtrar · Doble clic = restablecer · Leyenda = mostrar/ocultar serie" />
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={serie}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onClick={handleClick}
            onDoubleClick={() => resetChartFilter()}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString("es-PY")} />
            <Tooltip
              content={(props) => (
                <LineChartTooltip
                  {...(props as Parameters<typeof LineChartTooltip>[0])}
                  labelFormatter={(_label, pl) =>
                    (pl as { fecha?: string })?.fecha ?? _label
                  }
                  valueFormatter={(v) => v.toLocaleString("es-PY")}
                />
              )}
            />
            <Legend content={renderLegend} />
            {dataKeys.map(({ key, color, name }) => {
              if (hiddenLegendKeys.has(`${chartId}:${key}`)) return null;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive
                  animationDuration={400}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
