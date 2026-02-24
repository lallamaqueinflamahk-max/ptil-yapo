/**
 * Módulo de idoneidad laboral: clasificación por estado, derivación a capacitación y certificaciones.
 * - Clasifica trabajadores por grupo (A/B/C) y estado de idoneidad.
 * - Deriva automáticamente a capacitación (Grupo C y opcionalmente B sin certificación).
 * - Registro de certificaciones (SNPP, SINAFOCAL, OTRO).
 */

export type {
  GrupoClasificacion,
  EstadoIdoneidad,
  EstadoDerivacion,
  TipoCertificacion,
  DerivacionCapacitacion as DerivacionCapacitacionType,
  Certificacion as CertificacionType,
  TrabajadorClasificacion,
} from "./types";

export {
  normalizarGrupo,
  getEstadoIdoneidad,
  debeDerivarACapacitacion,
  clasificarPorEstudiosYExperiencia,
} from "./clasificacion";
