"use client";

import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

export type KPIState = "success" | "warning" | "danger" | "neutral" | "control";

export interface KPIActionCardProps {
  /** Valor principal (número o texto corto) */
  value: string | number;
  /** Etiqueta del KPI */
  label: string;
  /** Tendencia temporal: dirección y texto (ej. "+5% vs. mes anterior") */
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
    /** Si la subida es buena (ej. lealtad) o mala (ej. riesgo) */
    positiveIsGood?: boolean;
  };
  /** Color semántico según estado: determina borde, fondo y texto */
  state: KPIState;
  /** Meta opcional (ej. "Meta 80%") */
  meta?: string;
  /** Progreso 0–100 para anillo (opcional). Si no se pasa, no se muestra anillo. */
  progress?: number;
  /** Acción al hacer clic: filtra el dashboard y/o navega */
  onAction: () => void;
  /** Texto del CTA (ej. "Ver en mapa", "Filtrar por líder") */
  actionLabel: string;
  /** true = KPI primario (más grande, más prominente) */
  primary?: boolean;
  /** Indica si este KPI está actualmente seleccionado (filtro activo) */
  isActive?: boolean;
  /** Unidad opcional para el valor (ej. "%", "uds") */
  unit?: string;
}

const STATE_STYLES: Record<
  KPIState,
  { bg: string; border: string; value: string; trendUp: string; trendDown: string; ring: string }
> = {
  success: {
    bg: "bg-semantic-success-bg",
    border: "border-semantic-success-border",
    value: "text-semantic-success",
    trendUp: "text-semantic-success",
    trendDown: "text-semantic-danger",
    ring: "stroke-semantic-success",
  },
  warning: {
    bg: "bg-semantic-warning-bg",
    border: "border-semantic-warning-border",
    value: "text-semantic-warning",
    trendUp: "text-semantic-danger",
    trendDown: "text-semantic-success",
    ring: "stroke-semantic-warning",
  },
  danger: {
    bg: "bg-semantic-danger-bg",
    border: "border-semantic-danger-border",
    value: "text-semantic-danger",
    trendUp: "text-semantic-danger",
    trendDown: "text-semantic-success",
    ring: "stroke-semantic-danger",
  },
  neutral: {
    bg: "bg-semantic-neutral-bg",
    border: "border-semantic-neutral-border",
    value: "text-semantic-neutral",
    trendUp: "text-semantic-success",
    trendDown: "text-semantic-danger",
    ring: "stroke-semantic-neutral",
  },
  control: {
    bg: "bg-[#EFF6FF]",
    border: "border-semantic-control",
    value: "text-semantic-control",
    trendUp: "text-semantic-success",
    trendDown: "text-semantic-danger",
    ring: "stroke-semantic-control",
  },
};

function TrendIcon({
  direction,
  positiveIsGood,
  trendDirection,
}: {
  direction: "up" | "down" | "neutral";
  positiveIsGood?: boolean;
  trendDirection: "up" | "down" | "neutral";
}) {
  if (direction === "neutral") return <Minus className="w-3.5 h-3.5 shrink-0 opacity-70" />;
  const good = trendDirection === "up" ? positiveIsGood !== false : positiveIsGood === false;
  const className = good ? "text-semantic-success" : "text-semantic-danger";
  if (trendDirection === "up") return <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${className}`} />;
  return <TrendingDown className={`w-3.5 h-3.5 shrink-0 ${className}`} />;
}

export default function KPIActionCard({
  value,
  label,
  trend,
  state,
  meta,
  progress,
  onAction,
  actionLabel,
  primary = false,
  isActive = false,
  unit = "",
}: KPIActionCardProps) {
  const styles = STATE_STYLES[state];
  const trendDirection = trend?.direction ?? "neutral";

  return (
    <button
      type="button"
      onClick={onAction}
      className={`
        group relative w-full rounded-2xl border-2 text-left overflow-hidden
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-semantic-control
        ${styles.bg} ${styles.border}
        ${primary ? "p-5 sm:p-6" : "p-4"}
        ${isActive ? "ring-2 ring-semantic-control ring-offset-2 shadow-md" : ""}
      `}
      aria-pressed={isActive}
      aria-label={`${label}: ${value}${unit}. ${actionLabel}`}
    >
      {/* Anillo de progreso (solo si hay progress y no es raw) */}
      {progress != null && progress >= 0 && !primary && (
        <div className="absolute top-3 right-3 w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/80 dark:text-gray-200/80"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(100, progress)} 100`}
              className={styles.ring}
            />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className={`font-semibold text-semantic-neutral ${primary ? "text-sm" : "text-xs"}`}>
          {label}
        </p>
        <p className={`font-bold ${styles.value} ${primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
          {typeof value === "number" ? value.toLocaleString("es-PY") : value}{unit}
        </p>
        {meta && (
          <p className="text-xs text-semantic-neutral">{meta}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <TrendIcon
              direction={trend.direction}
              positiveIsGood={trend.positiveIsGood}
              trendDirection={trend.direction}
            />
            <span className="text-xs font-medium text-semantic-neutral">{trend.value}</span>
          </div>
        )}
      </div>

      {/* CTA siempre visible: microinteracción hover */}
      <div className={`flex items-center gap-1 font-medium ${styles.value} ${primary ? "mt-3 text-sm" : "mt-2 text-xs"} group-hover:gap-2 transition-all duration-200`}>
        <span>{actionLabel}</span>
        <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
      </div>
    </button>
  );
}
