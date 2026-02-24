"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Zap } from "lucide-react";

export interface EventoAuditoria {
  id: string;
  tipo: string;
  entidad: string;
  entidadId: string | null;
  usuario: string;
  mensaje: string;
  createdAt: string;
}

const TIPOS_ORDEN: string[] = ["CREACION", "ACTUALIZACION", "LOGIN", "LOGOUT", "CAMBIO_ESTADO", "EXPORTACION", "CAMBIO_ROL"];

const TIPO_LABEL: Record<string, string> = {
  CREACION: "Creación",
  ACTUALIZACION: "Actualización",
  LOGIN: "Login",
  LOGOUT: "Logout",
  CAMBIO_ESTADO: "Cambio estado",
  EXPORTACION: "Exportación",
  CAMBIO_ROL: "Cambio de rol",
};

/** Colores por tipo: control, transparencia, autoridad. Identificación inmediata. */
const TIPO_STYLE: Record<string, { bg: string; border: string; dot: string; chip: string; label: string }> = {
  CREACION: { bg: "bg-semantic-success-bg", border: "border-l-semantic-success", dot: "bg-semantic-success", chip: "bg-semantic-success-bg border-semantic-success-border text-semantic-success", label: "Creación" },
  ACTUALIZACION: { bg: "bg-semantic-control/5", border: "border-l-semantic-control", dot: "bg-semantic-control", chip: "bg-semantic-control/10 border-semantic-control text-semantic-control", label: "Actualización" },
  LOGIN: { bg: "bg-semantic-neutral-bg", border: "border-l-semantic-neutral", dot: "bg-semantic-neutral", chip: "bg-semantic-neutral-bg border-semantic-neutral text-semantic-neutral", label: "Login" },
  LOGOUT: { bg: "bg-semantic-neutral-bg", border: "border-l-semantic-neutral", dot: "bg-semantic-neutral", chip: "bg-semantic-neutral-bg border-semantic-neutral text-semantic-neutral", label: "Logout" },
  CAMBIO_ESTADO: { bg: "bg-semantic-warning-bg", border: "border-l-semantic-warning", dot: "bg-semantic-warning", chip: "bg-semantic-warning-bg border-semantic-warning-border text-semantic-warning", label: "Cambio estado" },
  EXPORTACION: { bg: "bg-semantic-control/5", border: "border-l-semantic-control", dot: "bg-semantic-control", chip: "bg-semantic-control/10 border-semantic-control text-semantic-control", label: "Exportación" },
  CAMBIO_ROL: { bg: "bg-semantic-warning-bg", border: "border-l-semantic-warning", dot: "bg-semantic-warning", chip: "bg-semantic-warning-bg border-semantic-warning-border text-semantic-warning", label: "Cambio de rol" },
};

function getTipoStyle(tipo: string) {
  return TIPO_STYLE[tipo] ?? {
    bg: "bg-semantic-neutral-bg",
    border: "border-l-semantic-neutral",
    dot: "bg-semantic-neutral",
    chip: "bg-semantic-neutral-bg border-semantic-neutral text-semantic-neutral",
    label: tipo,
  };
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Hace un momento";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatFechaFull(iso: string) {
  return new Date(iso).toLocaleString("es-PY", { dateStyle: "short", timeStyle: "medium" });
}

export default function AuditoriaTimeline({
  eventos: eventosInicial,
  refreshInterval = 15000,
  apiUrl = "/api/dashboard/maestro",
}: {
  eventos: EventoAuditoria[];
  refreshInterval?: number;
  apiUrl?: string;
}) {
  const [eventos, setEventos] = useState<EventoAuditoria[]>(eventosInicial);
  const [tipoFiltro, setTipoFiltro] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.eventosAuditoria) {
        setEventos(data.eventosAuditoria);
        setLastUpdated(new Date());
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setEventos(eventosInicial);
  }, [eventosInicial]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const t = setInterval(refresh, refreshInterval);
    return () => clearInterval(t);
  }, [refreshInterval, apiUrl]);

  const filtrados = tipoFiltro
    ? eventos.filter((e) => e.tipo === tipoFiltro)
    : eventos;

  return (
    <div className="rounded-2xl border-2 border-semantic-control/30 bg-white shadow-lg overflow-hidden">
      {/* Borde izquierdo de autoridad + header */}
      <div className="border-l-4 border-l-semantic-control bg-semantic-control/5 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-semantic-control text-white" aria-hidden>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Registro de auditoría</h2>
              <p className="text-sm text-dash-muted">Todo queda registrado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-dash-muted" title="Datos actualizados automáticamente">
                <Zap className="w-3.5 h-3.5 text-semantic-success" aria-hidden />
                <span className="h-1.5 w-1.5 rounded-full bg-semantic-success animate-pulse" aria-hidden />
                En vivo
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-semantic-control/30 bg-white text-semantic-control hover:bg-semantic-control/10 transition-colors disabled:opacity-50"
              title="Actualizar ahora"
              aria-label="Actualizar registro"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        {/* Filtros rápidos por tipo */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTipoFiltro("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
              !tipoFiltro
                ? "bg-semantic-control text-white border-semantic-control"
                : "bg-white border-gray-200 text-gray-600 hover:border-semantic-control/40"
            }`}
          >
            Todos
          </button>
          {TIPOS_ORDEN.map((t) => {
            const style = getTipoStyle(t);
            const isActive = tipoFiltro === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTipoFiltro((v) => (v === t ? "" : t))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                  isActive ? style.chip : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {TIPO_LABEL[t] ?? t}
              </button>
            );
          })}
        </div>

        {/* Conexión con alertas y KPIs */}
        <p className="text-xs text-dash-muted mb-4">
          Estos eventos alimentan los indicadores y las{" "}
          <a href="#alertas" className="text-semantic-control font-medium hover:underline">
            alertas del dashboard
          </a>
          .
        </p>

        {/* Timeline: línea vertical + eventos */}
        <div className="relative max-h-[380px] overflow-y-auto pr-1">
          {filtrados.length === 0 ? (
            <p className="text-sm text-dash-muted py-8 text-center">No hay eventos para mostrar.</p>
          ) : (
            <div className="relative pl-6 space-y-0">
              {/* Línea vertical */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-semantic-neutral-border"
                aria-hidden
              />
              {filtrados.map((e) => {
                const style = getTipoStyle(e.tipo);
                return (
                  <div
                    key={e.id}
                    className={`relative flex gap-3 py-3 border-b border-gray-100 last:border-0 ${style.bg} rounded-lg px-3 -ml-1 border-l-4 ${style.border} hover:opacity-95 transition-opacity`}
                  >
                    {/* Punto en la línea */}
                    <div
                      className={`absolute left-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${style.dot}`}
                      style={{ left: "6px", top: "1.25rem" }}
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0 pl-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.mensaje}</p>
                      <p className="text-xs text-dash-muted mt-0.5">
                        {e.usuario} · {e.entidad}
                        {e.entidadId ? ` (${e.entidadId})` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-dash-muted whitespace-nowrap" title={formatFechaFull(e.createdAt)}>
                      {formatFecha(e.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
