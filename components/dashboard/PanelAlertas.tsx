"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import { AlertTriangle, Activity, ShieldAlert, TrendingUp, BarChart3, X, MapPin, Check, UserPlus, Zap } from "lucide-react";
import type { Alerta, TipoAlerta, NivelAlerta } from "@/lib/alertas/types";
import { TIPO_ALERTA_LABEL, NIVEL_ALERTA_STYLE } from "@/lib/alertas/types";
import { useDashboardChartsOptional } from "@/context/DashboardChartContext";

const STORAGE_KEY = "ptil-alertas-silenciadas";
const STORAGE_REVISADAS = "ptil-alertas-revisadas";
const STORAGE_ASIGNADAS = "ptil-alertas-asignadas";
const STORAGE_RESUELTAS = "ptil-alertas-resueltas";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TIPO_ICON: Record<TipoAlerta, React.ComponentType<{ className?: string }>> = {
  riesgo_politico: ShieldAlert,
  baja_actividad: Activity,
  concentracion_poder: BarChart3,
  inflacion_datos: TrendingUp,
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Ahora";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/** Clave estable para silenciar la misma alerta entre refrescos */
function stableKey(a: Alerta): string {
  return `${a.tipo}|${a.entidad ?? a.titulo}|${a.filterKey?.value ?? ""}`;
}

function getSilenciadas(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function silenciarKey(key: string) {
  const set = getSilenciadas();
  set.add(key);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

function getRevisadas(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_REVISADAS);
    const arr = raw ? (JSON.parse(raw) as { key: string; fecha: string }[]) : [];
    return new Set(arr.map((x) => x.key));
  } catch {
    return new Set();
  }
}

function getRevisadasConFecha(): Map<string, string> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_REVISADAS);
    const arr = raw ? (JSON.parse(raw) as { key: string; fecha: string }[]) : [];
    return new Map(arr.map((x) => [x.key, x.fecha]));
  } catch {
    return new Map();
  }
}

function marcarRevisada(key: string) {
  try {
    const raw = localStorage.getItem(STORAGE_REVISADAS);
    const arr = raw ? (JSON.parse(raw) as { key: string; fecha: string }[]) : [];
    const next = arr.filter((x) => x.key !== key);
    next.push({ key, fecha: new Date().toISOString() });
    localStorage.setItem(STORAGE_REVISADAS, JSON.stringify(next));
  } catch {}
}

function getAsignadas(): Map<string, string> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_ASIGNADAS);
    const arr = raw ? (JSON.parse(raw) as { key: string; quien: string }[]) : [];
    return new Map(arr.map((x) => [x.key, x.quien]));
  } catch {
    return new Map();
  }
}

function asignarAlerta(key: string, quien: string) {
  try {
    const raw = localStorage.getItem(STORAGE_ASIGNADAS);
    const arr = raw ? (JSON.parse(raw) as { key: string; quien: string }[]) : [];
    const next = arr.filter((x) => x.key !== key);
    if (quien) next.push({ key, quien });
    localStorage.setItem(STORAGE_ASIGNADAS, JSON.stringify(next));
  } catch {}
}

function getResueltas(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_RESUELTAS);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function marcarResuelta(key: string) {
  try {
    const set = getResueltas();
    set.add(key);
    localStorage.setItem(STORAGE_RESUELTAS, JSON.stringify([...set]));
  } catch {}
}

export default function PanelAlertas({
  apiUrl,
  apiUrlBase,
  refreshInterval = 30000,
  maxVisibles = 15,
}: {
  apiUrl?: string;
  apiUrlBase?: string;
  refreshInterval?: number;
  maxVisibles?: number;
}) {
  const base = apiUrlBase ?? apiUrl ?? "/api/dashboard/alertas";
  const [filtroNivel, setFiltroNivel] = useState<NivelAlerta | "">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | "">("");
  const [silenciadas, setSilenciadas] = useState<Set<string>>(new Set());
  const [revisadas, setRevisadas] = useState<Set<string>>(new Set());
  const [resueltas, setResueltas] = useState<Set<string>>(new Set());
  const [asignadas, setAsignadas] = useState<Map<string, string>>(new Map());
  const [asignarAbierto, setAsignarAbierto] = useState<string | null>(null);
  useEffect(() => {
    setSilenciadas(getSilenciadas());
    setRevisadas(getRevisadas());
    setResueltas(getResueltas());
    setAsignadas(getAsignadas());
  }, []);
  const revisadasFechas = getRevisadasConFecha();
  const chartContext = useDashboardChartsOptional();
  const setChartFilter = chartContext?.setChartFilter;

  const apiUrlWithParams = useMemo(() => {
    const url = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (filtroNivel) url.searchParams.set("nivel", filtroNivel);
    if (filtroTipo) url.searchParams.set("tipo", filtroTipo);
    return url.pathname + url.search;
  }, [base, filtroNivel, filtroTipo]);

  const { data, error } = useSWR<{ alertas: Alerta[]; total: number }>(apiUrlWithParams, fetcher, {
    refreshInterval,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  const alertasRaw = data?.alertas ?? [];
  const alertas = useMemo(() => {
    const filtered = alertasRaw.filter((a) => !silenciadas.has(stableKey(a)) && !resueltas.has(stableKey(a)));
    const order: Record<string, number> = { critico: 0, warning: 1, info: 2 };
    return [...filtered].sort((a, b) => order[a.nivel] - order[b.nivel] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [alertasRaw, silenciadas, resueltas]);

  const handleSilenciar = useCallback((a: Alerta) => {
    silenciarKey(stableKey(a));
    setSilenciadas(getSilenciadas());
  }, []);

  const handleMarcarRevisada = useCallback((a: Alerta) => {
    const key = stableKey(a);
    marcarRevisada(key);
    setRevisadas(getRevisadas());
    setAsignarAbierto(null);
  }, []);

  const handleAsignar = useCallback((a: Alerta, quien: string) => {
    const key = stableKey(a);
    asignarAlerta(key, quien);
    setAsignadas(getAsignadas());
    setAsignarAbierto(null);
  }, []);

  const handleResolver = useCallback((a: Alerta) => {
    const key = stableKey(a);
    marcarResuelta(key);
    setResueltas(getResueltas());
    setAsignarAbierto(null);
  }, []);

  const handleClickAlerta = useCallback(
    (a: Alerta) => {
      if (a.filterKey) {
        setChartFilter({
          type: a.filterKey.type,
          value: a.filterKey.value,
          label: a.filterKey.label ?? a.entidad ?? a.titulo,
        });
      }
    },
    [setChartFilter]
  );

  const visibles = alertas.slice(0, maxVisibles);
  const niveles: { value: NivelAlerta; label: string }[] = [
    { value: "critico", label: "Crítico" },
    { value: "warning", label: "Atención" },
    { value: "info", label: "Info" },
  ];
  const tipos: { value: TipoAlerta; label: string }[] = [
    { value: "riesgo_politico", label: "Riesgo político" },
    { value: "baja_actividad", label: "Baja actividad" },
    { value: "concentracion_poder", label: "Concentración" },
    { value: "inflacion_datos", label: "Inflación datos" },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">Alertas inteligentes</h2>
        </div>
        <p className="text-sm text-red-600">No se pudieron cargar las alertas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-semantic-control" aria-hidden />
          <h2 className="text-lg font-semibold text-yapo-blue">Alertas</h2>
          {alertas.length > 0 && (
            <span className="text-sm font-semibold text-dash-muted">
              {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 text-xs text-dash-muted font-medium" title="Datos actualizados automáticamente">
            <Zap className="w-3.5 h-3.5 text-semantic-success" aria-hidden />
            En vivo
          </span>
        )}
      </div>
      <p className="text-sm text-dash-muted mb-2">
        Causa, consecuencia y acción concreta. Clic en una alerta filtra el mapa y los KPIs.
      </p>
      <p className="text-xs text-gray-500 mb-3">
        <strong>Revisada</strong> = Ya lo vi. <strong>Resolver</strong> = Cerrar alerta (atendida).
      </p>

      {/* Filtros por nivel (semántico) y tipo */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold text-dash-muted self-center uppercase tracking-wide">Nivel:</span>
        {niveles.map((n) => {
          const style = NIVEL_ALERTA_STYLE[n.value];
          const isActive = filtroNivel === n.value;
          return (
            <button
              key={n.value}
              type="button"
              onClick={() => setFiltroNivel((v) => (v === n.value ? "" : n.value))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                isActive ? `${style.bg} ${style.text} ${style.border}` : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {n.label}
            </button>
          );
        })}
        <span className="text-xs font-semibold text-dash-muted self-center uppercase tracking-wide ml-2">Tipo:</span>
        {tipos.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFiltroTipo((v) => (v === t.value ? "" : t.value))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${
              filtroTipo === t.value
                ? "bg-semantic-control text-white border-semantic-control"
                : "bg-white border-gray-200 hover:border-semantic-control/40 text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
        {(filtroNivel || filtroTipo) && (
          <button
            type="button"
            onClick={() => { setFiltroNivel(""); setFiltroTipo(""); }}
            className="text-xs font-medium text-semantic-control hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="rounded-xl bg-semantic-success-bg border border-semantic-success-border p-4 text-center">
          <p className="text-sm font-semibold text-semantic-success">Sin alertas en este momento</p>
          <p className="text-xs text-gray-600 mt-1">
            {silenciadas.size > 0 ? "Todas están silenciadas. Limpiá el almacenamiento para verlas de nuevo." : "Los indicadores se encuentran dentro de los umbrales configurados."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto">
          {visibles.map((a) => {
            const Icon = TIPO_ICON[a.tipo];
            const style = NIVEL_ALERTA_STYLE[a.nivel];
            const tieneFiltro = Boolean(a.filterKey);
            const key = stableKey(a);
            const estaRevisada = revisadas.has(key);
            const revisadaFecha = revisadasFechas.get(key);
            const asignadaA = asignadas.get(key);
            const asignarOpen = asignarAbierto === key;
            const stripeClass = a.nivel === "critico" ? "border-l-4 border-l-semantic-danger" : a.nivel === "warning" ? "border-l-4 border-l-semantic-warning" : "border-l-4 border-l-semantic-neutral";
            return (
              <li
                key={a.id}
                className={`rounded-xl border-2 p-4 transition-colors ${stripeClass} ${style.bg} ${style.border} ${
                  tieneFiltro ? "cursor-pointer hover:ring-2 hover:ring-semantic-control/30" : ""
                } ${estaRevisada ? "opacity-90" : ""}`}
                onClick={() => tieneFiltro && handleClickAlerta(a)}
                role={tieneFiltro ? "button" : undefined}
              >
                <div className="flex gap-3">
                  <div className={`shrink-0 p-1.5 rounded-lg ${style.bg} border ${style.border}`}>
                    <Icon className={`w-5 h-5 ${style.text}`} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-dash-muted">
                        {TIPO_ALERTA_LABEL[a.tipo]}
                        {a.entidad ? ` · ${a.entidad}` : ""}
                      </span>
                      {tieneFiltro && (
                        <span className="text-xs text-semantic-control font-medium flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5" aria-hidden /> Ver en mapa
                        </span>
                      )}
                      {estaRevisada && revisadaFecha && (
                        <span className="text-xs text-semantic-success flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" aria-hidden /> Revisada {new Date(revisadaFecha).toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit" })}
                        </span>
                      )}
                      {asignadaA && (
                        <span className="text-xs text-semantic-control flex items-center gap-0.5">
                          <UserPlus className="w-3.5 h-3.5" aria-hidden /> Asignada a {asignadaA}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{a.titulo}</p>
                    <p className="text-sm text-gray-700 mt-1">{a.mensaje}</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <p className="text-gray-700">
                        <strong className="text-gray-800">Causa:</strong> {a.porQue ?? a.mensaje}
                      </p>
                      {a.consecuencia && (
                        <p className="text-gray-600">
                          <strong className="text-gray-800">Consecuencia:</strong> {a.consecuencia}
                        </p>
                      )}
                      <p className="font-medium text-gray-800 mt-2 flex items-start gap-1">
                        <span className="text-semantic-control shrink-0">→</span>
                        <span>{a.accionSugerida ?? a.accion ?? "Revisar indicadores."}</span>
                      </p>
                    </div>
                    {(a.valorActual != null || a.umbral != null) && (
                      <p className="text-xs text-dash-muted mt-2">
                        {a.valorActual != null && `Valor actual: ${a.valorActual}${typeof a.valorActual === "number" && a.valorActual < 100 ? "%" : ""}`}
                        {a.umbral != null && a.valorActual != null && " · "}
                        {a.umbral != null && `Umbral: ${a.umbral}%`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatFecha(a.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      {!estaRevisada && (
                        <button
                          type="button"
                          onClick={() => handleMarcarRevisada(a)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                          title="Ya lo vi"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar como revisada
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResolver(a)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Cerrar alerta (atendida)"
                      >
                        <Check className="w-3.5 h-3.5" /> Resolver
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setAsignarAbierto(asignarOpen ? null : key)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> {asignadaA ? "Cambiar asignación" : "Asignar"}
                        </button>
                        {asignarOpen && (
                          <div className="absolute left-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                            {["Operador de zona", "Coordinador territorial", "Sin asignar"].map((quien) => (
                              <button
                                key={quien}
                                type="button"
                                onClick={() => handleAsignar(a, quien === "Sin asignar" ? "" : quien)}
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                              >
                                {quien}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSilenciar(a); setAsignarAbierto(null); }}
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                    title="Silenciar esta alerta"
                    aria-label="Silenciar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {alertas.length > maxVisibles && (
        <p className="text-xs text-gray-500 mt-2">
          Mostrando {maxVisibles} de {alertas.length} alertas.
        </p>
      )}
    </div>
  );
}
