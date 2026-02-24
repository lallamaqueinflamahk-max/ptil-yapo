/**
 * Tipos para el módulo de auditoría visual.
 * Compatible con EventoAuditoria del dashboard; extensible con impacto y metadata.
 */

export type ImpactoAuditoria = "bajo" | "medio" | "alto" | "critico";

export interface AuditMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AuditEvent {
  id: string;
  /** Tipo de evento (CREACION, ACTUALIZACION, LOGIN, EXPORTACION, etc.) */
  tipo: string;
  /** Descripción del evento (mensaje) */
  mensaje: string;
  /** Usuario que realizó la acción */
  usuario: string;
  /** Timestamp ISO */
  createdAt: string;
  /** Entidad afectada */
  entidad: string;
  entidadId?: string | null;
  /** Impacto para visualización (opcional; si no viene, se deriva del tipo) */
  impacto?: ImpactoAuditoria;
  /** Metadata adicional (solo lectura en UI) */
  metadata?: AuditMetadata;
}

export const TIPO_EVENTO_LABEL: Record<string, string> = {
  CREACION: "Creación",
  ACTUALIZACION: "Actualización",
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  CAMBIO_ESTADO: "Cambio de estado",
  EXPORTACION: "Exportación",
  CAMBIO_ROL: "Cambio de rol",
  ELIMINACION: "Eliminación",
};

export const IMPACTO_LABEL: Record<ImpactoAuditoria, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};
