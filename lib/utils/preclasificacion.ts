/**
 * Matriz de Preclasificación YAPÓ
 * Clasifica al trabajador según su nivel de certificación e historial.
 */

export type GrupoPreclasificacion = "A" | "B" | "C";

export interface PreclasificacionResult {
  grupo: GrupoPreclasificacion;
  estado: string;
  prioridad: 1 | 2 | 3;
  label: string;
  color: string; // Tailwind class
  requiereComite: boolean;
}

type EstudiosValue = "SNPP" | "SINAFOCAL" | "Empírico" | "Otros";

/**
 * GRUPO A: Oficio Certificado
 * Posee título oficial (SNPP/SINAFOCAL/Otros). Pasa a Validación Rápida.
 *
 * GRUPO B: Oficio por Historial
 * Sin título, pero con experiencia comprobable (Empírico y >= 2 años). Pendiente Comité.
 *
 * GRUPO C: Declarado sin Respaldo
 * Sin referencias ni historial. Derivación automática a capacitación.
 */
export function getGrupoPreclasificacion(
  estudios: string,
  experienciaAnios: number
): PreclasificacionResult {
  const estudiosNorm = estudios.trim();

  // GRUPO A: estudios !== "Empírico"
  if (estudiosNorm !== "Empírico") {
    return {
      grupo: "A",
      estado: "Validación Rápida",
      prioridad: 1,
      label: "Certificado",
      color: "text-green-600 bg-green-100",
      requiereComite: false,
    };
  }

  // GRUPO B: Empírico con >= 2 años
  if (estudiosNorm === "Empírico" && experienciaAnios >= 2) {
    return {
      grupo: "B",
      estado: "Pendiente Comité (Auditoría In Situ)",
      prioridad: 2,
      label: "Historial",
      color: "text-amber-700 bg-amber-100",
      requiereComite: true,
    };
  }

  // GRUPO C: resto
  return {
    grupo: "C",
    estado: "Derivado a Capacitación",
    prioridad: 3,
    label: "Sin respaldo",
    color: "text-red-600 bg-red-100",
    requiereComite: false,
  };
}

/**
 * Clasifica al trabajador a partir del objeto con perfil_laboral (para backend/datos completos).
 */
export function clasificarTrabajador(datos: {
  perfil_laboral: { estudios: EstudiosValue | string; experiencia_anios: number };
}): PreclasificacionResult {
  return getGrupoPreclasificacion(
    datos.perfil_laboral.estudios,
    datos.perfil_laboral.experiencia_anios
  );
}

/** Niveles que se consideran "posee título" (no Empírico) para Grupo A. */
export const NIVELES_CERTIFICADO = ["SNPP", "SINAFOCAL", "Otros"];

export function poseeTituloFromNivelEstudios(nivelEstudios: string): boolean {
  return nivelEstudios.trim() !== "Empírico";
}
