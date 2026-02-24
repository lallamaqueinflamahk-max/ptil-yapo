/**
 * Colores semánticos para gráficos (Design System SENTINEL360).
 * Uso consistente: éxito, advertencia, riesgo, control, neutral.
 */

export const CHART_SEMANTIC = {
  control: "#1E3A8A",
  success: "#0D9488",
  warning: "#B45309",
  danger: "#B91C1C",
  neutral: "#475569",
} as const;

/** Paleta para varias series (línea, barras múltiples) */
export const CHART_PALETTE = [
  CHART_SEMANTIC.control,
  CHART_SEMANTIC.success,
  CHART_SEMANTIC.warning,
  CHART_SEMANTIC.danger,
  "#6366F1", // variante para 5ª serie
  CHART_SEMANTIC.neutral,
] as const;

/** Colores por etapa de embudo (conversión laboral) */
export const FUNNEL_SEMANTIC = {
  certificados: CHART_SEMANTIC.success,
  en_tramite: CHART_SEMANTIC.warning,
  sin_proceso: CHART_SEMANTIC.danger,
  inscritos: CHART_SEMANTIC.control,
} as const;

export function getSemanticColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
