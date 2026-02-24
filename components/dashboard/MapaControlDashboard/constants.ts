/**
 * Configuración de capas del mapa control.
 * Colores alineados al Design System SENTINEL360 (semánticos).
 */

import type { CapaControlConfig } from "./types";

export const CAPAS_CONTROL: CapaControlConfig[] = [
  { id: "lealtad", label: "Lealtad", dataKey: "leales", color: "#0D9488" },           // semantic-success
  { id: "riesgo", label: "Riesgo", dataKey: "riesgo", color: "#B91C1C" },            // semantic-danger
  { id: "verificacion", label: "Verificación", dataKey: "no_verificados", color: "#B45309" }, // semantic-warning
  { id: "idoneidad", label: "Idoneidad", dataKey: "capacitacion", color: "#1E3A8A" }, // semantic-control
];

export const ESTADO_COLOR: Record<string, string> = {
  green: "#0D9488",   // success
  yellow: "#B45309",  // warning
  red: "#B91C1C",    // danger
};

export const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

/** Zoom levels para nivel semántico */
export const ZOOM_CIUDAD = 11;
export const ZOOM_BARRIO = 14;
export const ZOOM_SECCIONAL = 15;

export const LIGHT_BASE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const LIGHT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
