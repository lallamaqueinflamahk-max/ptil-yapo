/**
 * Gráficos dinámicos SENTINEL360
 * Recharts + filtros globales (DashboardChartContext).
 * Clic en gráfico → setChartFilter → resto del dashboard reacciona.
 */

export { default as LineChartDynamic } from "./LineChartDynamic";
export type { LineChartDynamicProps } from "./LineChartDynamic";

export { default as BarChartRanking } from "./BarChartRanking";
export type { BarChartRankingProps } from "./BarChartRanking";

export { default as DonutChartStates } from "./DonutChartStates";
export type { DonutChartStatesProps } from "./DonutChartStates";

export { default as EmbudoIdoneidad } from "./EmbudoIdoneidad";
export type { EmbudoIdoneidadProps, EtapaEmbudo } from "./EmbudoIdoneidad";

export { default as ChartInteractionsHint } from "./ChartInteractionsHint";
export type { ChartInteractionsHintProps } from "./ChartInteractionsHint";

export {
  LineChartTooltip,
  BarChartTooltip,
  DonutChartTooltip,
  FunnelChartTooltip,
} from "./RichTooltip";

export {
  CHART_SEMANTIC,
  CHART_PALETTE,
  FUNNEL_SEMANTIC,
  getSemanticColor,
} from "./constants";
