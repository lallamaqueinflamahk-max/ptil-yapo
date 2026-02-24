"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronRight } from "lucide-react";
import type { KPIDef, KPIVariant } from "@/app/api/dashboard/kpis/route";

const variantStyles: Record<
  KPIVariant,
  { bg: string; value: string; border: string; variationPositive: string; variationNegative: string }
> = {
  green: {
    bg: "bg-dash-green/8",
    value: "text-dash-green",
    border: "border-dash-green/25",
    variationPositive: "text-dash-green",
    variationNegative: "text-dash-red",
  },
  yellow: {
    bg: "bg-dash-yellow/10",
    value: "text-dash-yellow",
    border: "border-dash-yellow/30",
    variationPositive: "text-dash-green",
    variationNegative: "text-dash-red",
  },
  red: {
    bg: "bg-dash-red/8",
    value: "text-dash-red",
    border: "border-dash-red/25",
    variationPositive: "text-dash-green",
    variationNegative: "text-dash-red",
  },
  blue: {
    bg: "bg-dash-blue/6",
    value: "text-dash-blue",
    border: "border-dash-blue/20",
    variationPositive: "text-dash-green",
    variationNegative: "text-dash-red",
  },
  neutral: {
    bg: "bg-gray-100",
    value: "text-dash-blue",
    border: "border-gray-200",
    variationPositive: "text-dash-green",
    variationNegative: "text-dash-red",
  },
};

function formatValue(value: number, unit: "%" | "number" | ""): string {
  if (unit === "%") return `${value.toLocaleString("es-PY")}%`;
  if (unit === "number") return value.toLocaleString("es-PY");
  return value.toLocaleString("es-PY");
}

function formatLastUpdate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  return d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/** Animación de conteo desde 0 hasta value (duración ~1s). */
function useCountUp(value: number, unit: "%" | "number" | "", enabled: boolean) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    const duration = 800;
    const start = prevValue.current;
    const end = value;
    prevValue.current = end;
    if (start === end) {
      setDisplay(end);
      return;
    }
    startRef.current = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplay(start + (end - start) * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, unit, enabled]);

  return display;
}

export interface KPIDynamicProps {
  kpi: KPIDef & { variant?: KPIVariant };
  onDrillDown?: (kpi: KPIDef & { variant?: KPIVariant }) => void;
  /** Etiqueta explícita del CTA (ej. "Ver en Territorio", "Ir a Capacitación") */
  actionLabel?: string;
  animate?: boolean;
}

export default function KPIDynamic({
  kpi,
  onDrillDown,
  actionLabel,
  animate = true,
}: KPIDynamicProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const displayValue = useCountUp(kpi.value, kpi.unit, animate);
  const variant = kpi.variant ?? "blue";
  const styles = variantStyles[variant];

  const variationSign = kpi.variation > 0 ? "+" : "";
  const variationText =
    kpi.unit === "%"
      ? `${variationSign}${kpi.variation.toLocaleString("es-PY")} p.p.`
      : `${variationSign}${kpi.variation.toLocaleString("es-PY")}`;
  const isPositive = kpi.variation >= 0;

  const handleClick = () => {
    if (onDrillDown) onDrillDown(kpi);
    else window.location.href = kpi.drillDownPath + (kpi.filterKey ? `?filter=${kpi.filterKey}` : "");
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className={`
        relative rounded-[14px] border p-4 sm:p-5 transition-all duration-200
        ${styles.bg} ${styles.border}
        hover:shadow-card-hover hover:-translate-y-px active:translate-y-0
        cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dash-blue focus-visible:ring-offset-2
      `}
      onClick={handleClick}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocusCapture={() => setTooltipOpen(true)}
      onBlurCapture={() => setTooltipOpen(false)}
      role="button"
      tabIndex={0}
      aria-describedby={tooltipOpen ? `kpi-tooltip-${kpi.id}` : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${styles.value}`}>
              {formatValue(displayValue, kpi.unit)}
            </span>
            {kpi.variation !== 0 && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-xs font-semibold tabular-nums ${
                  isPositive ? styles.variationPositive : styles.variationNegative
                }`}
              >
                {variationText}
              </motion.span>
            )}
          </div>
          <p className="text-sm font-medium text-dash-muted">{kpi.label}</p>
          {kpi.variationLabel && (
            <p className="text-xs text-dash-muted/80 mt-0.5">{kpi.variationLabel}</p>
          )}
          {actionLabel && (
            <p className="text-xs font-semibold text-[#1E3A8A] mt-1.5 flex items-center gap-0.5">
              {actionLabel}
              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Info className="w-4 h-4 text-dash-muted" aria-hidden />
          <ChevronRight className="w-4 h-4 text-dash-muted" aria-hidden />
        </div>
      </div>

      <AnimatePresence>
        {tooltipOpen && (
          <motion.div
            id={`kpi-tooltip-${kpi.id}`}
            role="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 left-0 right-0 top-full mt-2 p-3 rounded-xl bg-dash-blue text-white text-xs shadow-lg border border-dash-blue/20 pointer-events-none"
          >
            <p className="font-semibold mb-1.5">Fórmula</p>
            <p className="mb-2 opacity-95">{kpi.formula}</p>
            <p className="font-semibold mb-1">Fuente</p>
            <p className="mb-2 opacity-95">{kpi.source}</p>
            <p className="font-semibold mb-1">Última actualización</p>
            <p className="opacity-95">{formatLastUpdate(kpi.lastUpdate)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
