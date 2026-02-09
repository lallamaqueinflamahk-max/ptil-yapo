/**
 * Mensaje de Bienvenida Automático (WhatsApp) al validar un trabajador.
 * Se dispara cuando el Operador YAPÓ presiona [APROBADO] en su dashboard.
 */

const PLANTILLA = `¡Bienvenido a la red de profesionales YAPÓ, [Nombre del Trabajador]! 🛠️

Tu perfil ha sido validado exitosamente en el Programa Territorial de Idoneidad Laboral (PTIL).

¿Qué sigue para vos?

• Certificado: Tu capacidad laboral ya cuenta con el respaldo de tu Gestor de Zona y el equipo técnico de YAPÓ.

• Beneficios: Muy pronto recibirás novedades sobre el Seguro YAPÓ Insurtech y cupones de descuento en comercios adheridos.

• Visibilidad: Tu oficio ya es parte de la fuerza que mueve Asunción.

Este es un servicio de GUARANÍ GLOBAL TECH (GGT). La formalización es el primer paso hacia tu crecimiento. 🚀`;

export function mensajeBienvenidaYapo(nombreTrabajador: string): string {
  const nombre = nombreTrabajador?.trim() || "trabajador";
  return PLANTILLA.replace("[Nombre del Trabajador]", nombre);
}

export { PLANTILLA };
