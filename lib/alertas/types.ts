/**
 * Sistema de alertas automáticas basado en KPIs.
 * Nivel (info/warning/crítico), porqué, acción sugerida y vinculación a mapas/KPIs.
 */

export type TipoAlerta =
  | "riesgo_politico"
  | "baja_actividad"
  | "concentracion_poder"
  | "inflacion_datos";

export type Severidad = "critica" | "alta" | "media" | "baja";

/** Nivel de alerta para UI: info / warning / crítico */
export type NivelAlerta = "info" | "warning" | "critico";

/** Vinculación al dashboard: al hacer click en la alerta se aplica este filtro (mapa, KPIs, tablas). */
export interface AlertaFilterKey {
  type: "seccional" | "ranking" | "state" | "kpi";
  value: string;
  label?: string;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidad: Severidad;
  /** Nivel para filtros y chips: info, warning, crítico */
  nivel: NivelAlerta;
  titulo: string;
  mensaje: string;
  /** Explicación del porqué (causa que disparó la alerta) */
  porQue: string;
  /** Consecuencia si no se actúa (opcional; refuerza urgencia) */
  consecuencia?: string;
  /** Acción sugerida para el usuario */
  accionSugerida: string;
  /** Entidad afectada: seccional, concejal, operador, etc. */
  entidad?: string;
  /** Valor actual del KPI que disparó la alerta */
  valorActual?: number;
  /** Umbral configurado (opcional) */
  umbral?: number;
  /** @deprecated Usar accionSugerida */
  accion?: string;
  /** Al hacer click: filtrar mapa, KPIs y tablas por esta entidad */
  filterKey?: AlertaFilterKey;
  createdAt: string;
}

export const TIPO_ALERTA_LABEL: Record<TipoAlerta, string> = {
  riesgo_politico: "Riesgo político",
  baja_actividad: "Baja actividad",
  concentracion_poder: "Concentración de poder",
  inflacion_datos: "Inflación de datos",
};

export const SEVERIDAD_STYLE: Record<Severidad, { bg: string; text: string; border: string }> = {
  critica: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  alta: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  media: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  baja: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
};

/** Estilos por nivel: color semántico para identificación inmediata (sistemas críticos). */
export const NIVEL_ALERTA_STYLE: Record<NivelAlerta, { bg: string; text: string; border: string; stripe: string; label: string }> = {
  info: {
    bg: "bg-semantic-neutral-bg",
    text: "text-semantic-neutral",
    border: "border-semantic-neutral-border",
    stripe: "bg-semantic-control",
    label: "Info",
  },
  warning: {
    bg: "bg-semantic-warning-bg",
    text: "text-semantic-warning",
    border: "border-semantic-warning-border",
    stripe: "bg-semantic-warning",
    label: "Atención",
  },
  critico: {
    bg: "bg-semantic-danger-bg",
    text: "text-semantic-danger",
    border: "border-semantic-danger-border",
    stripe: "bg-semantic-danger",
    label: "Crítico",
  },
};

/** Mapeo severidad → nivel para UI */
export function severidadANivel(s: Severidad): NivelAlerta {
  if (s === "critica" || s === "alta") return "critico";
  if (s === "media") return "warning";
  return "info";
}
