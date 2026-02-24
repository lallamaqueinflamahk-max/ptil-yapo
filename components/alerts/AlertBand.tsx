"use client";

import { AlertTriangle, ShieldAlert, AlertCircle, ChevronDown } from "lucide-react";
import type { NivelAlerta } from "@/lib/alertas/types";

export interface AlertaBandItem {
  id: string;
  nivel: NivelAlerta;
  /** Clave estable para persistir resuelta (ej. tipo|entidad|filterValue) */
  stableKey: string;
}

export interface AlertBandProps {
  /** Alertas activas (no resueltas) para mostrar en la banda */
  alertas: AlertaBandItem[];
  /** CTA principal: "Ver alertas", "Ir a alertas", etc. */
  ctaLabel?: string;
  /** Callback al hacer clic en el CTA (ej. scroll a #alertas o abrir panel) */
  onCtaClick?: () => void;
  /** Si true, la banda se puede colapsar con un botón */
  collapsible?: boolean;
  /** Id del ancla para scroll (si onCtaClick hace scroll) */
  ctaScrollTargetId?: string;
  className?: string;
}

const NIVEL_BAND: Record<
  NivelAlerta,
  { bg: string; text: string; border: string; icon: typeof ShieldAlert; label: string }
> = {
  critico: {
    bg: "bg-semantic-danger",
    text: "text-white",
    border: "border-semantic-danger",
    icon: ShieldAlert,
    label: "Crítico",
  },
  warning: {
    bg: "bg-semantic-warning",
    text: "text-white",
    border: "border-semantic-warning",
    icon: AlertTriangle,
    label: "Atención",
  },
  info: {
    bg: "bg-semantic-neutral",
    text: "text-white",
    border: "border-semantic-neutral",
    icon: AlertCircle,
    label: "Info",
  },
};

function pickBandStyle(counts: { critico: number; warning: number; info: number }) {
  if (counts.critico > 0) return NIVEL_BAND.critico;
  if (counts.warning > 0) return NIVEL_BAND.warning;
  return NIVEL_BAND.info;
}

export function AlertBand({
  alertas,
  ctaLabel = "Ver alertas",
  onCtaClick,
  collapsible = false,
  ctaScrollTargetId,
  className = "",
}: AlertBandProps) {
  if (alertas.length === 0) return null;

  const counts = alertas.reduce(
    (acc, a) => {
      acc[a.nivel]++;
      return acc;
    },
    { critico: 0, warning: 0, info: 0 } as Record<NivelAlerta, number>
  );

  const style = pickBandStyle(counts);
  const Icon = style.icon;

  const parts: string[] = [];
  if (counts.critico > 0) parts.push(`${counts.critico} ${counts.critico === 1 ? "crítica" : "críticas"}`);
  if (counts.warning > 0) parts.push(`${counts.warning} en atención`);
  if (counts.info > 0) parts.push(`${counts.info} info`);

  const handleCta = () => {
    if (ctaScrollTargetId && typeof document !== "undefined") {
      document.getElementById(ctaScrollTargetId)?.scrollIntoView({ behavior: "smooth" });
    }
    onCtaClick?.();
  };

  return (
    <div
      role="alert"
      className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${style.bg} ${style.text} ${className}`}
      aria-live="assertive"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="h-6 w-6 shrink-0 opacity-95" aria-hidden />
          <span className="font-semibold text-sm md:text-base truncate">
            {parts.join(" · ")}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCta}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-sentinel-md bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
        >
          {ctaLabel}
          <ChevronDown className="h-4 w-4 rotate-0 md:rotate-0" aria-hidden />
        </button>
      </div>
    </div>
  );
}
