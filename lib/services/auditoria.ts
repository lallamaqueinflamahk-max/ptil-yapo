/**
 * Servicio de eventos de auditoría.
 * Hoy: mock. Con BD real: usar prisma.eventoAuditoria.findMany() con orden y filtros.
 */

import type { EventoAuditoria } from "@/lib/types/dashboard";
import { getDataSource } from "@/lib/config/territory";

const TIPOS = ["CREACION", "ACTUALIZACION", "LOGIN", "CAMBIO_ESTADO", "EXPORTACION"] as const;
const ENTIDADES = ["Subscriptor", "Seccional", "Usuario", "Dirigente"];
const USUARIOS = ["Usuario Maestro", "Operador 12", "Pro Sosa", "Sistema"];

function mockEventos(): EventoAuditoria[] {
  const now = Date.now();
  const eventos: EventoAuditoria[] = [];
  for (let i = 0; i < 24; i++) {
    eventos.push({
      id: `evt-${now}-${i}`,
      tipo: TIPOS[i % TIPOS.length],
      entidad: ENTIDADES[i % ENTIDADES.length],
      entidadId: i % 3 === 0 ? `cuid-${i}` : null,
      usuario: USUARIOS[i % USUARIOS.length],
      mensaje: `${TIPOS[i % TIPOS.length]} en ${ENTIDADES[i % ENTIDADES.length]}`,
      createdAt: new Date(now - i * 180000).toISOString(),
    });
  }
  return eventos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Obtiene eventos de auditoría para el timeline.
 * Con DATA_SOURCE=db: leer de prisma.eventoAuditoria (ordenar por createdAt desc, limit opcional).
 */
export async function getEventosAuditoria(): Promise<EventoAuditoria[]> {
  if (getDataSource() === "db") {
    // TODO: return await prisma.eventoAuditoria.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    // Asegurar que el modelo Prisma tenga: id, tipo, entidad, entidadId, usuario, mensaje, createdAt
  }
  return mockEventos();
}
