"use client";

import type { TooltipProps } from "recharts";

/** Tooltip rico para gráfico de línea (evolución): muestra fecha y todas las series con valores. */
export function LineChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = (v: number) => v.toLocaleString("es-PY"),
}: TooltipProps<number, string> & {
  labelFormatter?: (label: string, payload?: unknown) => string;
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const displayLabel = labelFormatter ? labelFormatter(label ?? "", payload[0]?.payload) : label;
  return (
    <div className="rounded-sentinel-lg border border-sentinel-border bg-surface px-3 py-2.5 shadow-card-hover min-w-[180px]">
      <div className="text-xs font-semibold text-sentinel-text-primary border-b border-sentinel-border pb-1.5 mb-2">
        {displayLabel}
      </div>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-sentinel-text-primary">
              {valueFormatter(Number(entry.value))}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-sentinel-text-muted mt-2 pt-1.5 border-t border-sentinel-border">
        Clic para filtrar · Doble clic restablecer
      </p>
    </div>
  );
}

/** Tooltip rico para barras: valor, % del total y posición. */
export function BarChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v: number) => v.toLocaleString("es-PY"),
  total,
  showPct = true,
}: TooltipProps<number, string> & {
  valueFormatter?: (v: number) => string;
  total?: number;
  showPct?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  const pct = total != null && total > 0 ? ((value / total) * 100).toFixed(1) : null;
  return (
    <div className="rounded-sentinel-lg border border-sentinel-border bg-surface px-3 py-2.5 shadow-card-hover">
      <div className="text-xs font-semibold text-sentinel-text-primary">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm font-bold tabular-nums text-semantic-control">
          {valueFormatter(value)}
        </span>
        {showPct && pct != null && (
          <span className="text-xs text-sentinel-text-secondary">({pct}% del total)</span>
        )}
      </div>
      <p className="text-[10px] text-sentinel-text-muted mt-1.5">Clic para filtrar dashboard</p>
    </div>
  );
}

/** Tooltip rico para donut: nombre, valor, porcentaje. */
export function DonutChartTooltip({
  active,
  payload,
  valueFormatter = (v: number) => v.toLocaleString("es-PY"),
  total,
}: TooltipProps<number, string> & {
  valueFormatter?: (v: number) => string;
  total?: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = Number(entry?.value ?? 0);
  const name = entry?.name ?? "";
  const pct = total != null && total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className="rounded-sentinel-lg border border-sentinel-border bg-surface px-3 py-2.5 shadow-card-hover">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: entry?.payload?.fill ?? entry?.color }}
        />
        <span className="text-xs font-semibold text-sentinel-text-primary">{name}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-sm font-bold tabular-nums">{valueFormatter(value)}</span>
        <span className="text-xs text-sentinel-text-secondary">{pct}%</span>
      </div>
      <p className="text-[10px] text-sentinel-text-muted mt-1.5">Clic en segmento para filtrar</p>
    </div>
  );
}

/** Tooltip para embudo: etapa, valor, % y tasa de conversión desde anterior. */
export function FunnelChartTooltip({
  etapa,
  valor,
  porcentaje,
  conversionDesdeAnterior,
}: {
  etapa: string;
  valor: number;
  porcentaje: number;
  conversionDesdeAnterior?: number | null;
}) {
  return (
    <div className="rounded-sentinel-lg border border-sentinel-border bg-surface px-3 py-2.5 shadow-card-hover">
      <div className="text-xs font-semibold text-sentinel-text-primary">{etapa}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm font-bold tabular-nums">{valor.toLocaleString("es-PY")}</span>
        <span className="text-xs text-sentinel-text-secondary">{porcentaje.toFixed(1)}%</span>
      </div>
      {conversionDesdeAnterior != null && (
        <p className="text-[10px] text-sentinel-text-muted mt-1">
          Conversión desde etapa anterior: {conversionDesdeAnterior.toFixed(1)}%
        </p>
      )}
      <p className="text-[10px] text-sentinel-text-muted mt-1.5">Clic para filtrar por esta etapa</p>
    </div>
  );
}
