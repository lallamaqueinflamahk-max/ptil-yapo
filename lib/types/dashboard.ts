/**
 * Tipos compartidos para dashboard y APIs.
 * Al conectar BD real, alinear con Prisma/SENTINEL360 (EventoAuditoria, Seccional, etc.).
 */

export interface EventoAuditoria {
  id: string;
  tipo: string;
  entidad: string;
  entidadId: string | null;
  usuario: string;
  mensaje: string;
  createdAt: string;
}

/** Ámbito territorial para mostrar en hero (ej. "Asunción · 45 seccionales") */
export interface ScopeInfo {
  nombreCiudad: string;
  circunscripcion: string;
  totalSeccionales: number;
}

/** Respuesta de GET /api/dashboard/maestro. Incluye lastUpdated y scope para UI. */
export interface MaestroApiResponse {
  organizacion: string;
  totalVotantes: number;
  seccionales: number;
  scope?: ScopeInfo;
  concejalesActivos: number;
  eventosHoy: number;
  tipificacionRangos: Array<{ rango: number; id: string; desc: string }>;
  coloresRango: Record<string, { fill: string; border: string }>;
  lealesPorLideres: Array<{ nombre: string; valor: number; color: string }>;
  seguidoresPorConcejales: Array<{ nombre: string; seguidores: number; fill: string }>;
  heatmapPoints: Array<{ id: number; lat: number; lng: number; cantidad: number; color?: string }>;
  listadoSeccionales: ListadoSeccionalItem[];
  eventosAuditoria: EventoAuditoria[];
  capasMapa: unknown;
  /** ISO string; presente cuando la fuente es mock o cuando la BD devuelve tiempo de consulta */
  lastUpdated?: string;
}

export interface ListadoSeccionalItem {
  id: string;
  numero: number;
  nombre: string;
  barrio: string;
  titular: string;
  rangoId: string;
  activo: boolean;
  cantidadValidados: number;
  lat: number;
  lng: number;
  estado: "green" | "yellow" | "red";
  estadoLabel: string;
  contacto: string | null;
}

/** Respuesta de GET /api/dashboard/alertas */
export interface AlertasApiResponse {
  alertas: import("@/lib/alertas/types").Alerta[];
  total: number;
  /** ISO string */
  lastUpdated?: string;
}

/** Respuesta de GET /api/dashboard/evolucion */
export interface EvolucionApiResponse {
  serie: Array<{ fecha: string; etiqueta: string; validados: number; leales?: number; verificados?: number; derivaciones?: number }>;
  dias: number;
  filter: string | null;
  lastUpdated?: string;
}

/** Detalle de seccional para panel del mapa (GET /api/dashboard/mapa-seccional) */
export type SemáforoEstado = "green" | "yellow" | "red";

export interface KpiLocal {
  id: string;
  label: string;
  value: number;
  unit: string;
  tendencia: "up" | "down" | "stable";
}

export interface PuntoEvolucionLocal {
  fecha: string;
  valor: number;
  etiqueta?: string;
}

export interface AlertaActiva {
  id: string;
  tipo: string;
  mensaje: string;
  severidad: "alta" | "media" | "baja";
  fecha: string;
}

export interface DetalleSeccional {
  numero: number;
  nombre: string;
  barrio: string;
  titular: string;
  titularWhatsApp?: string | null;
  rangoId: string;
  lat: number;
  lng: number;
  estado: SemáforoEstado;
  estadoLabel: string;
  kpisLocales: KpiLocal[];
  evolucion: PuntoEvolucionLocal[];
  alertasActivas: AlertaActiva[];
  lastUpdated?: string;
}
