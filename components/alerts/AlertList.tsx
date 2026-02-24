"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, ShieldAlert, MapPin, Check, X } from "lucide-react";
import type { Alerta, NivelAlerta, TipoAlerta } from "@/lib/alertas/types";
import { TIPO_ALERTA_LABEL, NIVEL_ALERTA_STYLE } from "@/lib/alertas/types";
import { useAlertPersist, alertaStableKey } from "./useAlertPersist";
import { Chip } from "@/components/ui";
import { Button } from "@/components/ui";

export interface AlertListProps {
  alertas: Alerta[];
  /** Filtros por nivel (chips). Por defecto todos. */
  showLevelFilters?: boolean;
  /** Filtros por estado activa/resuelta. Por defecto true. */
  showEstadoFilters?: boolean;
  /** Callback al clic en CTA de acción (ej. "Ver en mapa") */
  onActionClick?: (alerta: Alerta) => void;
  /** Máximo de alertas visibles (scroll después) */
  maxVisible?: number;
  className?: string;
}

const TIPO_ICON: Record<TipoAlerta, React.ComponentType<{ className?: string }>> = {
  riesgo_politico: ShieldAlert,
  baja_actividad: AlertTriangle,
  concentracion_poder: AlertTriangle,
  inflacion_datos: AlertTriangle,
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Ahora";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit" });
}

const NIVEL_CHIP: Record<NivelAlerta, "danger" | "warning" | "neutral"> = {
  critico: "danger",
  warning: "warning",
  info: "neutral",
};

export function AlertList({
  alertas,
  showLevelFilters = true,
  showEstadoFilters = true,
  onActionClick,
  maxVisible = 20,
  className = "",
}: AlertListProps) {
  const {
    resueltasKeys,
    isResuelta,
    marcarResuelta,
    marcarActiva,
    getResueltaAt,
    estadoFilter,
    setEstadoFilter,
    alertasByEstado,
  } = useAlertPersist();

  const [nivelFilter, setNivelFilter] = useState<NivelAlerta | "">("");

  const filtered = useMemo(() => {
    let list = alertasByEstado(alertas);
    if (nivelFilter) list = list.filter((a) => a.nivel === nivelFilter);
    const order: Record<NivelAlerta, number> = { critico: 0, warning: 1, info: 2 };
    return [...list].sort(
      (a, b) => order[a.nivel] - order[b.nivel] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [alertas, alertasByEstado, nivelFilter]);

  const visibles = filtered.slice(0, maxVisible);

  return (
    <div className={className}>
      {/* Filtros por nivel */}
      {showLevelFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-sentinel-text-secondary">
            Nivel
          </span>
          {(["critico", "warning", "info"] as const).map((n) => {
            const style = NIVEL_ALERTA_STYLE[n];
            const label = n === "critico" ? "Crítico" : n === "warning" ? "Atención" : "Info";
            const active = nivelFilter === n;
            return (
              <Chip
                key={n}
                variant={NIVEL_CHIP[n]}
                selected={active}
                onSelect={() => setNivelFilter(active ? "" : n)}
              >
                {label}
              </Chip>
            );
          })}
        </div>
      )}

      {/* Filtros por estado (activa / resuelta) */}
      {showEstadoFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-sentinel-text-secondary">
            Estado
          </span>
          {(["activas", "resueltas", "todas"] as const).map((e) => (
            <Chip
              key={e}
              variant="control"
              selected={estadoFilter === e}
              onSelect={() => setEstadoFilter(e)}
            >
              {e === "activas" ? "Activas" : e === "resueltas" ? "Resueltas" : "Todas"}
            </Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-sentinel-lg border border-semantic-success-border bg-semantic-success-bg p-4 text-center">
          <p className="text-sm font-semibold text-semantic-success">
            {alertas.length === 0 ? "Sin alertas" : "Ninguna alerta coincide con el filtro"}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[480px] overflow-y-auto">
          {visibles.map((a) => {
            const Icon = TIPO_ICON[a.tipo];
            const style = NIVEL_ALERTA_STYLE[a.nivel];
            const key = alertaStableKey(a);
            const resuelta = isResuelta(key);
            const resueltaAt = getResueltaAt(key);
            const tieneAccion = Boolean(a.filterKey);

            return (
              <li
                key={a.id}
                className={`rounded-sentinel-lg border-2 p-4 transition-colors ${
                  a.nivel === "critico"
                    ? "border-l-4 border-l-semantic-danger"
                    : a.nivel === "warning"
                      ? "border-l-4 border-l-semantic-warning"
                      : "border-l-4 border-l-semantic-neutral"
                } ${style.bg} ${style.border} ${resuelta ? "opacity-85" : ""}`}
              >
                <div className="flex gap-3">
                  <div className={`shrink-0 p-1.5 rounded-sentinel-md border ${style.border} ${style.bg}`}>
                    <Icon className={`h-5 w-5 ${style.text}`} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold uppercase ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-sentinel-text-secondary">
                        {TIPO_ALERTA_LABEL[a.tipo]}
                        {a.entidad ? ` · ${a.entidad}` : ""}
                      </span>
                      {resuelta && resueltaAt && (
                        <span className="text-xs text-semantic-success flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Resuelta {formatFecha(resueltaAt)}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sentinel-text-primary text-sm">{a.titulo}</p>
                    <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">{a.mensaje}</p>
                    <p className="text-xs text-sentinel-text-muted mt-2 font-medium">
                      → {a.accionSugerida}
                    </p>
                    <p className="text-xs text-sentinel-text-muted mt-1">{formatFecha(a.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tieneAccion && (
                        <Button
                          variant="secondary"
                          className="text-xs h-8"
                          onClick={() => onActionClick?.(a)}
                        >
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Ver en mapa
                        </Button>
                      )}
                      {resuelta ? (
                        <Button
                          variant="ghost"
                          className="text-xs h-8"
                          onClick={() => marcarActiva(key)}
                        >
                          Marcar activa
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="text-xs h-8 text-semantic-success"
                          onClick={() => marcarResuelta(key)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Marcar resuelta
                        </Button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (resuelta ? marcarActiva(key) : marcarResuelta(key))}
                    className="shrink-0 p-1.5 rounded-sentinel-md text-sentinel-text-muted hover:bg-black/5"
                    aria-label={resuelta ? "Marcar como activa" : "Marcar como resuelta"}
                  >
                    {resuelta ? (
                      <Check className="h-4 w-4 text-semantic-success" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {filtered.length > maxVisible && (
        <p className="text-xs text-sentinel-text-muted mt-2">
          Mostrando {maxVisible} de {filtered.length}
        </p>
      )}
    </div>
  );
}
