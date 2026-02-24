"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "./Tooltip";

export type KPICardState = "normal" | "positive" | "warning" | "risk";

export interface KPICardVariation {
  /** Texto mostrado (ej. "+5%", "-2 pts") */
  value: string;
  direction: "up" | "down" | "neutral";
  /** Si la subida es buena (ej. cumplimiento) o mala (ej. incidencias). Define color de la tendencia. */
  positiveIsGood?: boolean;
}

export interface KPICardProps {
  /** Valor principal del KPI */
  value: string | number;
  /** Etiqueta (ej. "Idoneidad", "En riesgo") */
  label: string;
  /** Variación temporal. Si no se pasa, no se muestra. */
  variation?: KPICardVariation;
  /** Estado semántico: define color de fondo, borde y valor. Por defecto "normal". */
  state?: KPICardState;
  /** Explicación mostrada en tooltip al hover/focus */
  tooltip: string;
  /** Callback al hacer clic: dispara filtro global (ej. setChartFilter) */
  onFilter: () => void;
  /** Si true, muestra skeleton y no dispara onFilter */
  loading?: boolean;
  /** Unidad detrás del valor (ej. "%", " uds") */
  unit?: string;
  /** Si true, valor más grande y card más prominente */
  primary?: boolean;
  /** Si true, se muestra anillo/estado activo de filtro */
  isActive?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
}

const STATE_STYLES: Record<
  KPICardState,
  { bg: string; border: string; value: string; ring: string }
> = {
  normal: {
    bg: "bg-semantic-neutral-bg",
    border: "border-semantic-neutral-border",
    value: "text-semantic-neutral",
    ring: "stroke-semantic-neutral",
  },
  positive: {
    bg: "bg-semantic-success-bg",
    border: "border-semantic-success-border",
    value: "text-semantic-success",
    ring: "stroke-semantic-success",
  },
  warning: {
    bg: "bg-semantic-warning-bg",
    border: "border-semantic-warning-border",
    value: "text-semantic-warning",
    ring: "stroke-semantic-warning",
  },
  risk: {
    bg: "bg-semantic-danger-bg",
    border: "border-semantic-danger-border",
    value: "text-semantic-danger",
    ring: "stroke-semantic-danger",
  },
};

function TrendIcon({
  direction,
  positiveIsGood = true,
}: {
  direction: "up" | "down" | "neutral";
  positiveIsGood?: boolean;
}) {
  if (direction === "neutral") {
    return <Minus className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />;
  }
  const isGood = direction === "up" ? positiveIsGood : !positiveIsGood;
  const className = isGood ? "text-semantic-success" : "text-semantic-danger";
  if (direction === "up") {
    return <TrendingUp className={clsx("h-3.5 w-3.5 shrink-0", className)} aria-hidden />;
  }
  return <TrendingDown className={clsx("h-3.5 w-3.5 shrink-0", className)} aria-hidden />;
}

export function KPICard({
  value,
  label,
  variation,
  state = "normal",
  tooltip,
  onFilter,
  loading = false,
  unit = "",
  primary = false,
  isActive = false,
  className,
}: KPICardProps) {
  const styles = STATE_STYLES[state];

  const content = (
    <button
      type="button"
      onClick={loading ? undefined : onFilter}
      disabled={loading}
      aria-busy={loading}
      aria-pressed={isActive}
      aria-label={`${label}: ${typeof value === "number" ? value.toLocaleString("es-PY") : value}${unit}. ${tooltip}. Clic para filtrar.`}
      className={clsx(
        "group relative w-full rounded-sentinel-lg border-2 text-left transition-all duration-dashboard ease-sentinel-out",
        "hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98] active:shadow-card-active",
        "focus:outline-none focus:ring-2 focus:ring-semantic-control focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-80",
        styles.bg,
        styles.border,
        primary ? "p-5 sm:p-6" : "p-4",
        isActive && "ring-2 ring-semantic-control ring-offset-2 shadow-card-hover",
        className
      )}
    >
      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-sentinel-border" />
          <div className="h-8 w-20 animate-pulse rounded bg-sentinel-border" />
          {variation && (
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-sentinel-border" />
          )}
        </div>
      ) : (
        <>
          <p
            className={clsx(
              "font-semibold text-sentinel-text-secondary",
              primary ? "text-sm" : "text-xs"
            )}
          >
            {label}
          </p>
          <p
            className={clsx(
              "font-bold tabular-nums",
              styles.value,
              primary ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            )}
          >
            {typeof value === "number" ? value.toLocaleString("es-PY") : value}
            {unit}
          </p>
          {variation && (
            <div className="mt-1 flex items-center gap-1.5">
              <TrendIcon
                direction={variation.direction}
                positiveIsGood={variation.positiveIsGood}
              />
              <span className="text-xs font-medium text-sentinel-text-secondary">
                {variation.value}
              </span>
            </div>
          )}
        </>
      )}
    </button>
  );

  return (
    <Tooltip content={tooltip} placement="top">
      <div className="inline-block w-full min-w-0">{content}</div>
    </Tooltip>
  );
}
