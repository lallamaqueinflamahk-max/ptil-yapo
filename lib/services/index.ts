/**
 * Capa de servicios para dashboard y APIs.
 * Hoy: implementaciones mock. Con DATA_SOURCE=db, reemplazar por lecturas a Prisma.
 * Ver docs/CONEXION-DB.md para el plan de conexión a BD real.
 */

export { getMaestroData } from "./maestro";
export { getEventosAuditoria } from "./auditoria";
export { getContextoKPIs } from "./contextoKpis";
export { getSerieEvolucion } from "./evolucion";
export type { PuntoEvolucion } from "./evolucion";
export { getDetalleSeccional } from "./mapaSeccional";
