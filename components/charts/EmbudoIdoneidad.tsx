"use client";

import { useRef } from "react";
import Link from "next/link";
import { useDashboardChartsOptional } from "@/context/DashboardChartContext";
import ChartInteractionsHint from "./ChartInteractionsHint";
import { FUNNEL_SEMANTIC } from "./constants";

/** Etapa del embudo con color semántico (éxito / atención / riesgo) */
export interface EtapaEmbudo {
  id: string;
  label: string;
  valor: number;
  color: string;
}

export interface EmbudoIdoneidadProps {
  /** Etapas del embudo; si no se pasan, se usan las por defecto */
  etapas?: EtapaEmbudo[];
  /** Meta en porcentaje (ej. 22) */
  metaPorcentaje?: number;
  /** Total para calcular % (si no se pasa, se usa suma de etapas) */
  total?: number;
  className?: string;
  /** Altura del bloque del embudo en px */
  height?: number;
  /** Si true, no se muestra el título interno (cuando el card ya tiene título) */
  hideTitle?: boolean;
  /** Tipo de filtro al hacer clic en etapa (state = filtra dashboard por etapa) */
  filterType?: "state" | "kpi";
}

/** Colores semánticos: éxito, advertencia, riesgo */
const SEMANTIC_EMBUDO = {
  certificados: FUNNEL_SEMANTIC.certificados,
  en_tramite: FUNNEL_SEMANTIC.en_tramite,
  sin_proceso: FUNNEL_SEMANTIC.sin_proceso,
};

const DEFAULT_ETAPAS: EtapaEmbudo[] = [
  { id: "certificados", label: "Certificados", valor: 1240, color: SEMANTIC_EMBUDO.certificados },
  { id: "en_tramite", label: "En trámite", valor: 890, color: SEMANTIC_EMBUDO.en_tramite },
  { id: "sin_proceso", label: "Sin proceso", valor: 2100, color: SEMANTIC_EMBUDO.sin_proceso },
];

export default function EmbudoIdoneidad({
  etapas = DEFAULT_ETAPAS,
  metaPorcentaje = 22,
  total: totalProp,
  className = "",
  height = 200,
  hideTitle = false,
  filterType = "state",
}: EmbudoIdoneidadProps) {
  const chartContext = useDashboardChartsOptional();
  const chartFilter = chartContext?.chartFilter ?? null;
  const setChartFilter = chartContext?.setChartFilter;
  const resetChartFilter = chartContext?.resetChartFilter;
  const lastClickRef = useRef<{ id: string; time: number }>({ id: "", time: 0 });

  const total = totalProp ?? etapas.reduce((s, e) => s + e.valor, 0);
  const porcentajeCertificados = total > 0
    ? Math.round((etapas.find((e) => e.id === "certificados")?.valor ?? 0) / total * 100)
    : 0;

  const handleStageClick = (etapa: EtapaEmbudo) => {
    if (!setChartFilter || !resetChartFilter) return;
    const now = Date.now();
    if (lastClickRef.current.id === etapa.id && now - lastClickRef.current.time < 400) {
      resetChartFilter();
      lastClickRef.current = { id: "", time: 0 };
      return;
    }
    lastClickRef.current = { id: etapa.id, time: now };
    setChartFilter({ type: filterType, value: etapa.id, label: etapa.label });
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {!hideTitle && <h3 className="text-base font-semibold text-dash-blue">Embudo de Idoneidad</h3>}
        <div className={`flex items-center gap-3 text-sm ${hideTitle ? "ml-auto" : ""}`}>
          <span className="font-bold text-semantic-success">
            Certificados: {porcentajeCertificados}%
          </span>
          <span className="text-dash-muted font-medium">Meta: {metaPorcentaje}%</span>
        </div>
      </div>
      <ChartInteractionsHint message="Clic en etapa = filtrar el dashboard · Doble clic = restablecer" />
      <div className="space-y-2" style={{ minHeight: height }}>
        {etapas.map((etapa) => {
          const pct = total > 0 ? (etapa.valor / total) * 100 : 0;
          const isActive = chartFilter?.type === filterType && chartFilter?.value === etapa.id;
          return (
            <button
              key={etapa.id}
              type="button"
              onClick={() => handleStageClick(etapa)}
              title="Clic para filtrar por esta etapa · Doble clic restablecer"
              className={`flex items-center gap-3 rounded-xl overflow-hidden border-2 transition-all hover:opacity-95 cursor-pointer text-left w-full ${isActive ? "ring-2 ring-semantic-control ring-offset-2" : ""}`}
              style={{
                borderColor: etapa.color,
                backgroundColor: `${etapa.color}20`,
              }}
            >
              <div
                className="h-10 flex items-center pl-3 font-bold text-white text-sm shrink-0 rounded-l-lg transition-[width] duration-300"
                style={{
                  width: `${Math.max(20, Math.min(95, pct))}%`,
                  backgroundColor: etapa.color,
                  boxShadow: `0 0 12px ${etapa.color}80`,
                }}
              >
                {etapa.label}
              </div>
              <span className="text-lg font-bold text-gray-800">
                {etapa.valor.toLocaleString("es-PY")}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/dashboard/capacitacion"
          className="px-4 py-2 rounded-xl font-semibold text-sm text-white bg-semantic-success hover:opacity-90 shadow-md transition-opacity"
        >
          Derivar Capacitación
        </Link>
        <Link
          href="/dashboard/capacitacion"
          className="text-sm font-medium text-semantic-control hover:underline"
        >
          Ver listado →
        </Link>
      </div>
    </div>
  );
}
