/**
 * Tipos para el mapa que controla el dashboard.
 * El mapa es fuente de filtro: clic en seccional → chartFilter → KPIs, gráficos y tablas recalculan.
 */

export interface SeccionalMapaControl {
  id: string;
  numero: number;
  nombre: string;
  barrio?: string;
  titular?: string;
  lat: number;
  lng: number;
  cantidadValidados?: number;
  estado: "green" | "yellow" | "red";
  estadoLabel?: string;
}

/** Capas activables: cada una responde una pregunta. No decorativas. */
export type CapaControlId = "lealtad" | "riesgo" | "verificacion" | "idoneidad";

export interface CapaControlConfig {
  id: CapaControlId;
  label: string;
  /** Clave en el objeto capas (ej. leales, no_verificados) */
  dataKey: string;
  /** Color semántico (Design System) */
  color: string;
}

/** Nivel de zoom semántico: ciudad → barrio → seccional */
export type ZoomSemantico = "ciudad" | "barrio" | "seccional";

export type MapViewBounds = [[number, number], [number, number]];
