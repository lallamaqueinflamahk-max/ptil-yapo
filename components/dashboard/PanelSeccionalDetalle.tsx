"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Info, MessageCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DetalleSeccional } from "@/app/api/dashboard/mapa-seccional/route";

const SEMAFORO_COLORS = {
  green: { bg: "bg-dash-green/10", border: "border-dash-green", dot: "bg-dash-green", text: "text-dash-green" },
  yellow: { bg: "bg-dash-yellow/10", border: "border-dash-yellow", dot: "bg-dash-yellow", text: "text-dash-yellow" },
  red: { bg: "bg-dash-red/10", border: "border-dash-red", dot: "bg-dash-red", text: "text-dash-red" },
} as const;

export interface PanelSeccionalDetalleProps {
  numero: number | null;
  onClose: () => void;
}

export default function PanelSeccionalDetalle({ numero, onClose }: PanelSeccionalDetalleProps) {
  const [detalle, setDetalle] = useState<DetalleSeccional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numero) {
      setDetalle(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/mapa-seccional?numero=${numero}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar detalle");
        return r.json();
      })
      .then((data: DetalleSeccional) => {
        setDetalle(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [numero]);

  if (numero === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 shadow-xl z-[1100] flex flex-col overflow-hidden rounded-l-[14px]"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <h3 className="text-base font-semibold text-dash-blue">
            {detalle ? detalle.nombre : `Seccional ${numero}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dash-muted hover:bg-gray-200 hover:text-dash-blue transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-12 text-dash-muted">
              Cargando detalle…
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-dash-red/30 bg-dash-red/5 p-4 text-dash-red text-sm">
              {error}
            </div>
          )}
          {detalle && !loading && (
            <>
              {/* Semáforo de estado */}
              <div className={`rounded-xl border-2 p-3 ${SEMAFORO_COLORS[detalle.estado].bg} ${SEMAFORO_COLORS[detalle.estado].border}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${SEMAFORO_COLORS[detalle.estado].dot}`} />
                  <span className={`text-sm font-semibold ${SEMAFORO_COLORS[detalle.estado].text}`}>
                    {detalle.estadoLabel}
                  </span>
                </div>
                <p className="text-xs text-dash-muted mt-1">
                  {detalle.barrio} · {detalle.titular}
                </p>
              </div>

              {/* Responsable de seccional: contacto y WhatsApp */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                <h4 className="text-sm font-semibold text-dash-blue mb-2">Responsable de seccional</h4>
                <p className="text-sm font-medium text-gray-800">{detalle.titular}</p>
                {detalle.titularWhatsApp ? (
                  <a
                    href={`https://wa.me/${detalle.titularWhatsApp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <p className="text-xs text-dash-muted mt-1">Sin contacto registrado</p>
                )}
              </div>

              {/* KPIs locales */}
              <div>
                <h4 className="text-sm font-semibold text-dash-blue mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  KPIs locales
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {detalle.kpisLocales.map((kpi) => {
                    const TendenciaIcon = kpi.tendencia === "up" ? TrendingUp : kpi.tendencia === "down" ? TrendingDown : Minus;
                    const tendenciaColor = kpi.tendencia === "up" ? "text-dash-green" : kpi.tendencia === "down" ? "text-dash-red" : "text-dash-muted";
                    return (
                      <div
                        key={kpi.id}
                        className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                      >
                        <p className="text-xs text-dash-muted truncate">{kpi.label}</p>
                        <p className="text-lg font-bold text-dash-blue tabular-nums mt-0.5">
                          {kpi.value.toLocaleString("es-PY")}{kpi.unit}
                        </p>
                        <TendenciaIcon className={`w-3.5 h-3.5 mt-1 ${tendenciaColor}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evolución temporal */}
              <div>
                <h4 className="text-sm font-semibold text-dash-blue mb-3">Evolución temporal</h4>
                <div className="h-[180px] rounded-lg border border-gray-100 bg-white/80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={detalle.evolucion} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="evolGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="etiqueta" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v.toLocaleString("es-PY")} />
                      <Tooltip formatter={(v: number) => v.toLocaleString("es-PY")} contentStyle={{ borderRadius: "8px", fontSize: 12 }} />
                      <Area type="monotone" dataKey="valor" stroke="#1E3A8A" strokeWidth={2} fill="url(#evolGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alertas activas */}
              <div>
                <h4 className="text-sm font-semibold text-dash-blue mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas activas
                </h4>
                {detalle.alertasActivas.length === 0 ? (
                  <p className="text-sm text-dash-muted">Ninguna alerta activa.</p>
                ) : (
                  <ul className="space-y-2">
                    {detalle.alertasActivas.map((a) => (
                      <li
                        key={a.id}
                        className={`rounded-lg border p-3 text-sm ${
                          a.severidad === "alta"
                            ? "border-dash-red/30 bg-dash-red/5"
                            : a.severidad === "media"
                            ? "border-dash-yellow/30 bg-dash-yellow/5"
                            : "border-gray-200 bg-gray-50/80"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                            a.severidad === "alta" ? "text-dash-red" : a.severidad === "media" ? "text-dash-yellow" : "text-dash-muted"
                          }`} />
                          <div>
                            <p className="font-medium text-gray-800">{a.tipo}</p>
                            <p className="text-dash-muted mt-0.5">{a.mensaje}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
