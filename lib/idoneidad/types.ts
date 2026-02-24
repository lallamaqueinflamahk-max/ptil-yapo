/**
 * Módulo de idoneidad laboral: clasificación, derivación a capacitación y certificaciones.
 */

export type GrupoClasificacion = "Grupo A" | "Grupo B" | "Grupo C";

/** Estado de idoneidad del trabajador según clasificación y certificaciones. */
export type EstadoIdoneidad =
  | "CERTIFICADO"              // Grupo A o certificación registrada
  | "PENDIENTE_COMITE"         // Grupo B, pendiente auditoría
  | "EN_CAPACITACION"          // Derivado a capacitación (Grupo C o B sin respaldo)
  | "CERTIFICADO_POST_CAPACITACION" // Completó capacitación y obtuvo certificación
  | "SIN_RESPALDO";            // Grupo C sin derivación registrada aún

export type EstadoDerivacion = "PENDIENTE" | "EN_CURSO" | "COMPLETADO";

export type TipoCertificacion = "SNPP" | "SINAFOCAL" | "OTRO";

export interface DerivacionCapacitacion {
  id: string;
  fichaId: string;
  codigoVerificacion?: string;
  grupoOrigen: GrupoClasificacion;
  estado: EstadoDerivacion;
  fechaDerivacion: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Certificacion {
  id: string;
  fichaId: string;
  codigoVerificacion?: string;
  tipo: TipoCertificacion;
  institucion: string;
  fechaEmision: string;
  numeroTitulo?: string;
  createdAt: string;
}

export interface TrabajadorClasificacion {
  codigoVerificacion: string;
  nombreCompleto: string;
  grupo: GrupoClasificacion;
  estadoIdoneidad: EstadoIdoneidad;
  oficioPrincipal: string;
  nivelEstudios: string;
  experienciaAnios: number;
  tieneCertificacion: boolean;
  derivadoACapacitacion: boolean;
}
