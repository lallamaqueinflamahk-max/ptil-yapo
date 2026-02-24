"use client";

import { useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import ChartInteractionsHint from "./ChartInteractionsHint";
import { DonutChartTooltip } from "./RichTooltip";

export interface DonutChartStatesProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
  chartId?: string;
  filterType?: "ranking" | "state" | "kpi";
  height?: number;
  className?: string;
}

const renderActiveShape = (props: unknown) => {
  const p = props as {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
  };
  return (
    <Sector
      cx={p.cx}
      cy={p.cy}
      innerRadius={p.innerRadius}
      outerRadius={p.outerRadius + 6}
      startAngle={p.startAngle}
      endAngle={p.endAngle}
      fill={p.fill}
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
    />
  );
};

export default function DonutChartStates({
  data,
  title = "Distribución por estado",
  chartId = "donut-states",
  filterType = "state",
  height = 280,
  className = "",
}: DonutChartStatesProps) {
  const { chartFilter, setChartFilter, resetChartFilter, hiddenLegendKeys, toggleLegendKey } = useDashboardCharts();
  const isFilterOrigin = chartFilter?.type === filterType;
  const lastClickRef = useRef<number>(0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const visibleData = data.filter((d) => !hiddenLegendKeys.has(`${chartId}:${d.name}`));

  const handleClick = (entry: { name: string; value: number }) => {
    const now = Date.now();
    if (now - lastClickRef.current < 400) {
      resetChartFilter();
      lastClickRef.current = 0;
      return;
    }
    lastClickRef.current = now;
    setChartFilter({ type: filterType, value: entry.name, label: entry.name });
  };

  const renderLegend = (props: { payload?: { value: string; color: string }[] }) => {
    if (!props.payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-2">
        {props.payload.map((entry) => {
          const hidden = hiddenLegendKeys.has(`${chartId}:${entry.value}`);
          const item = data.find((d) => d.name === entry.value);
          const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <li
              key={entry.value}
              onClick={() => toggleLegendKey(chartId, entry.value)}
              className="flex items-center gap-1.5 cursor-pointer select-none text-xs"
            >
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: hidden ? "transparent" : entry.color }}
              />
              <span className={hidden ? "text-dash-muted line-through" : ""}>
                {entry.value} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`${className} ${isFilterOrigin ? "ring-2 ring-semantic-control/50 ring-offset-2 rounded-xl" : ""}`}>
      {title && <h3 className="text-base font-semibold text-dash-blue mb-2">{title}</h3>}
      <ChartInteractionsHint message="Clic en segmento = filtrar por este valor · Doble clic = restablecer" />
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={height * 0.28}
              outerRadius={height * 0.38}
              paddingAngle={2}
              activeShape={renderActiveShape}
              onClick={(entry: { name: string; value: number }) => handleClick(entry)}
              onDoubleClick={() => resetChartFilter()}
              isAnimationActive
              animationDuration={400}
            >
              {visibleData.map((entry) => {
                const active = isFilterOrigin && chartFilter?.value === entry.name;
                return (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke={active ? "var(--semantic-control)" : "white"}
                    strokeWidth={active ? 3 : 2}
                    cursor="pointer"
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={(props) => (
                <DonutChartTooltip {...props} total={total} valueFormatter={(v) => v.toLocaleString("es-PY")} />
              )}
            />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
