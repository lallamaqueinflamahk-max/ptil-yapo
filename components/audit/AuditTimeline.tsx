"use client";

import { useState, useMemo, useEffect } from "react";
import { ShieldCheck, RefreshCw, Zap } from "lucide-react";
import type { AuditEvent, ImpactoAuditoria } from "@/lib/types/audit";
import { TIPO_EVENTO_LABEL, IMPACTO_LABEL } from "@/lib/types/audit";
import { Chip } from "@/components/ui";
import clsx from "clsx";

export interface AuditTimelineProps {
  /** Lista de eventos (ordenados por createdAt desc en origen) */
  eventos: AuditEvent[];
  /** Tipos únicos para el filtro (si no se pasa, se derivan de eventos) */
  tiposDisponibles?: string[];
  /** Actualizar manualmente (opcional) */
  onRefresh?: () => void;
  refreshInterval?: number;
  /** Altura máxima del área de scroll */
  maxHeight?: number;
  className?: string;
}

const TIPO_STYLE: Record<string, { border: string; dot: string; chip: string }> = {
  CREACION: { border: "border-l-semantic-success", dot: "bg-semantic-success", chip: "border-semantic-success-border text-semantic-success" },
  ACTUALIZACION: { border: "border-l-semantic-control", dot: "bg-semantic-control", chip: "border-semantic-control text-semantic-control" },
  LOGIN: { border: "border-l-semantic-neutral", dot: "bg-semantic-neutral", chip: "border-semantic-neutral text-semantic-neutral" },
  LOGOUT: { border: "border-l-semantic-neutral", dot: "bg-semantic-neutral", chip: "border-semantic-neutral text-semantic-neutral" },
  CAMBIO_ESTADO: { border: "border-l-semantic-warning", dot: "bg-semantic-warning", chip: "border-semantic-warning-border text-semantic-warning" },
  EXPORTACION: { border: "border-l-semantic-control", dot: "bg-semantic-control", chip: "border-semantic-control text-semantic-control" },
  CAMBIO_ROL: { border: "border-l-semantic-warning", dot: "bg-semantic-warning", chip: "border-semantic-warning-border text-semantic-warning" },
  ELIMINACION: { border: "border-l-semantic-danger", dot: "bg-semantic-danger", chip: "border-semantic-danger-border text-semantic-danger" },
};

const IMPACTO_STYLE: Record<ImpactoAuditoria, string> = {
  bajo: "bg-semantic-neutral-bg border-semantic-neutral-border text-semantic-neutral",
  medio: "bg-semantic-control/10 border-semantic-control text-semantic-control",
  alto: "bg-semantic-warning-bg border-semantic-warning-border text-semantic-warning",
  critico: "bg-semantic-danger-bg border-semantic-danger-border text-semantic-danger",
};

const DEFAULT_TIPO_STYLE = {
  border: "border-l-semantic-neutral",
  dot: "bg-semantic-neutral",
  chip: "border-semantic-neutral text-semantic-neutral",
};

function getTipoStyle(tipo: string) {
  return TIPO_STYLE[tipo] ?? DEFAULT_TIPO_STYLE;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Hace un momento";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (d.toDateString() === now.toDateString()) return `Hoy ${d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}`;
  return formatTimestamp(iso);
}

/** Convierte EventoAuditoria del dashboard a AuditEvent (con impacto y metadata derivados si faltan). */
export function toAuditEvent(e: {
  id: string;
  tipo: string;
  entidad: string;
  entidadId?: string | null;
  usuario: string;
  mensaje: string;
  createdAt: string;
  impacto?: ImpactoAuditoria;
  metadata?: Record<string, unknown>;
}): AuditEvent {
  const impacto =
    e.impacto ??
    (["EXPORTACION", "CAMBIO_ROL", "ELIMINACION"].includes(e.tipo)
      ? "medio"
      : ["CREACION", "ACTUALIZACION"].includes(e.tipo)
        ? "bajo"
        : "bajo");
  const metadata: AuditEvent["metadata"] = {
    ...(e.metadata as AuditEvent["metadata"]),
    entidad: e.entidad,
    ...(e.entidadId != null && e.entidadId !== "" ? { entidadId: e.entidadId } : {}),
  };
  return {
    id: e.id,
    tipo: e.tipo,
    mensaje: e.mensaje,
    usuario: e.usuario,
    createdAt: e.createdAt,
    entidad: e.entidad,
    entidadId: e.entidadId ?? null,
    impacto,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  };
}

export function AuditTimeline({
  eventos,
  tiposDisponibles,
  onRefresh,
  refreshInterval = 0,
  maxHeight = 420,
  className = "",
}: AuditTimelineProps) {
  const [tipoFiltro, setTipoFiltro] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const tipos = useMemo(() => {
    if (tiposDisponibles?.length) return tiposDisponibles;
    const set = new Set(eventos.map((e) => e.tipo));
    return ["CREACION", "ACTUALIZACION", "LOGIN", "LOGOUT", "CAMBIO_ESTADO", "EXPORTACION", "CAMBIO_ROL", "ELIMINACION"].filter((t) => set.has(t));
  }, [eventos, tiposDisponibles]);

  const filtrados = useMemo(() => {
    const list = tipoFiltro ? eventos.filter((e) => e.tipo === tipoFiltro) : eventos;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [eventos, tipoFiltro]);

  const handleRefresh = () => {
    onRefresh?.();
    setLastUpdated(new Date());
  };

  useEffect(() => {
    if (refreshInterval <= 0 || !onRefresh) return;
    const t = setInterval(() => {
      onRefresh();
      setLastUpdated(new Date());
    }, refreshInterval);
    return () => clearInterval(t);
  }, [refreshInterval, onRefresh]);

  const tipoToVariant = (t: string): "success" | "warning" | "danger" | "neutral" | "control" => {
    if (t === "CREACION") return "success";
    if (t === "ACTUALIZACION" || t === "EXPORTACION") return "control";
    if (t === "CAMBIO_ESTADO" || t === "CAMBIO_ROL") return "warning";
    if (t === "ELIMINACION") return "danger";
    return "neutral";
  };

  return (
    <div
      className={clsx(
        "rounded-none border border-sentinel-border bg-surface shadow-card overflow-hidden",
        "border-l-4 border-l-semantic-control",
        className
      )}
      role="region"
      aria-labelledby="audit-timeline-title"
    >
      {/* Header tipo banca/gobierno */}
      <div className="border-b border-sentinel-border bg-surface-alt px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-semantic-control text-semantic-control-on"
              aria-hidden
            >
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h2 id="audit-timeline-title" className="text-sentinel-lg font-bold text-sentinel-text-primary">
                Registro de auditoría
              </h2>
              <p className="text-sentinel-sm text-sentinel-text-secondary mt-0.5">
                Todo queda registrado. Registro de solo lectura.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sentinel-text-muted"
                title="Última actualización"
              >
                <Zap className="h-3.5 w-3.5 text-semantic-success" aria-hidden />
                <span className="h-1.5 w-1.5 rounded-full bg-semantic-success animate-pulse" aria-hidden />
                En vivo
              </span>
            )}
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-sentinel-md border border-sentinel-border bg-surface px-3 py-2 text-sentinel-sm font-medium text-sentinel-text-primary hover:bg-semantic-neutral-bg transition-colors focus:outline-none focus:ring-2 focus:ring-semantic-control focus:ring-offset-2"
                aria-label="Actualizar registro"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtro por tipo de evento */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-sentinel-border bg-surface">
        <span className="text-xs font-semibold uppercase tracking-wide text-sentinel-text-secondary">
          Tipo de evento
        </span>
        <Chip
          variant="control"
          selected={!tipoFiltro}
          onSelect={() => setTipoFiltro("")}
        >
          Todos
        </Chip>
        {tipos.map((t) => {
          const isActive = tipoFiltro === t;
          return (
            <Chip
              key={t}
              variant={tipoToVariant(t)}
              selected={isActive}
              onSelect={() => setTipoFiltro(isActive ? "" : t)}
            >
              {TIPO_EVENTO_LABEL[t] ?? t}
            </Chip>
          );
        })}
      </div>

      {/* Timeline (solo lectura) */}
      <div className="px-6 py-4">
        <div
          className="overflow-y-auto pr-1"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {filtrados.length === 0 ? (
            <p className="py-8 text-center text-sentinel-sm text-sentinel-text-muted">
              No hay eventos para mostrar.
            </p>
          ) : (
            <div className="relative pl-6">
              {/* Línea vertical */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px bg-sentinel-border"
                aria-hidden
              />
              <ul className="space-y-0" role="list">
                {filtrados.map((e) => {
                  const style = getTipoStyle(e.tipo);
                  const impacto = e.impacto ?? "bajo";
                  return (
                    <li
                      key={e.id}
                      className={clsx(
                        "relative flex flex-col gap-2 py-4 pl-4 border-b border-sentinel-border last:border-0",
                        "border-l-4 bg-surface",
                        style.border
                     )}
                      role="listitem"
                    >
                      {/* Punto en la línea */}
                      <div
                        className={clsx(
                          "absolute left-0 h-3 w-3 rounded-full border-2 border-surface shadow-sm",
                          style.dot
                        )}
                        style={{ left: "6px", top: "1.5rem" }}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sentinel-sm font-semibold text-sentinel-text-primary">
                            {e.mensaje}
                          </p>
                          <p className="text-sentinel-sm text-sentinel-text-secondary mt-0.5">
                            {e.usuario}
                            {e.entidad ? ` · ${e.entidad}` : ""}
                            {e.entidadId ? ` (${e.entidadId})` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={clsx(
                              "inline-flex rounded-sentinel-sm border px-2 py-0.5 text-xs font-semibold",
                              IMPACTO_STYLE[impacto]
                            )}
                          >
                            {IMPACTO_LABEL[impacto]}
                          </span>
                          <time
                            dateTime={e.createdAt}
                            className="text-xs text-sentinel-text-muted whitespace-nowrap tabular-nums"
                            title={formatTimestamp(e.createdAt)}
                          >
                            {formatRelative(e.createdAt)}
                          </time>
                        </div>
                      </div>
                      {/* Metadata (solo lectura) */}
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <div className="mt-2 rounded-sentinel-md border border-sentinel-border bg-surface-alt px-3 py-2">
                          <p className="text-xs font-semibold text-sentinel-text-secondary uppercase tracking-wide mb-1.5">
                            Metadata
                          </p>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {Object.entries(e.metadata).map(([k, v]) =>
                              v != null && v !== "" ? (
                                <div key={k} className="flex gap-2">
                                  <dt className="text-sentinel-text-muted shrink-0">{k}:</dt>
                                  <dd className="text-sentinel-text-primary font-medium tabular-nums truncate">
                                    {String(v)}
                                  </dd>
                                </div>
                              ) : null
                            )}
                          </dl>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <p className="text-xs text-sentinel-text-muted mt-3">
          {filtrados.length} evento{filtrados.length !== 1 ? "s" : ""} mostrado{filtrados.length !== 1 ? "s" : ""}
          {tipoFiltro ? ` (filtro: ${TIPO_EVENTO_LABEL[tipoFiltro] ?? tipoFiltro})` : ""}
        </p>
      </div>
    </div>
  );
}
