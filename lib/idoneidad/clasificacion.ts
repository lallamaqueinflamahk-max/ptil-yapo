/**
 * Clasificación de trabajadores por estado de idoneidad y reglas de derivación.
 */

import { getGrupoPreclasificacion } from "@/lib/utils/preclasificacion";
import type { EstadoIdoneidad, GrupoClasificacion } from "./types";

/** Convierte Grupo A/B/C (preclasificación) a GrupoClasificacion. */
export function normalizarGrupo(grupo: string): GrupoClasificacion {
  if (grupo === "Grupo A" || grupo === "A") return "Grupo A";
  if (grupo === "Grupo B" || grupo === "B") return "Grupo B";
  return "Grupo C";
}

/**
 * Determina el estado de idoneidad de un trabajador según su grupo y si tiene
 * derivación a capacitación y/o certificación registrada.
 */
export function getEstadoIdoneidad(
  grupo: GrupoClasificacion | string,
  opciones: {
    tieneCertificacion?: boolean;
    derivadoACapacitacion?: boolean;
    derivacionCompletada?: boolean;
  } = {}
): EstadoIdoneidad {
  const g = normalizarGrupo(grupo);
  const { tieneCertificacion = false, derivadoACapacitacion = false, derivacionCompletada = false } = opciones;

  if (tieneCertificacion) {
    return derivacionCompletada ? "CERTIFICADO_POST_CAPACITACION" : "CERTIFICADO";
  }
  if (g === "Grupo A") return "CERTIFICADO";
  if (g === "Grupo B") return "PENDIENTE_COMITE";
  if (g === "Grupo C") {
    if (derivadoACapacitacion) return "EN_CAPACITACION";
    return "SIN_RESPALDO";
  }
  return "SIN_RESPALDO";
}

/**
 * Indica si el trabajador debe ser derivado automáticamente a capacitación.
 * Grupo C siempre; Grupo B solo si no tiene certificación (opcional en política).
 */
export function debeDerivarACapacitacion(
  grupo: GrupoClasificacion | string,
  opciones?: { grupoBSinCertificacionTambien?: boolean }
): boolean {
  const g = normalizarGrupo(grupo);
  if (g === "Grupo C") return true;
  if (g === "Grupo B" && opciones?.grupoBSinCertificacionTambien) return true;
  return false;
}

/**
 * Clasifica a partir de nivel de estudios y años de experiencia (como en el formulario).
 */
export function clasificarPorEstudiosYExperiencia(
  nivelEstudios: string,
  experienciaAnios: number
): { grupo: GrupoClasificacion; estado: string; label: string } {
  const pre = getGrupoPreclasificacion(nivelEstudios, experienciaAnios);
  const grupo: GrupoClasificacion =
    pre.grupo === "A" ? "Grupo A" : pre.grupo === "B" ? "Grupo B" : "Grupo C";
  return {
    grupo,
    estado: pre.estado,
    label: pre.label,
  };
}
