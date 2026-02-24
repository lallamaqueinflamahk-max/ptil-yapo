/**
 * Contexto KPIs para el motor de alertas.
 * Hoy: mock. Con BD real: agregar desde Prisma (conteos por seccional, eventos del día, seguidores por concejal).
 */

import { getHeatmapPointsFromSeccionales, SECCIONALES } from "@/lib/data/seccionales2026";
import { getDataSource } from "@/lib/config/territory";
import type { ContextoKPIs } from "@/lib/alertas/reglas";

function buildContextoMock(): ContextoKPIs {
  const heatmap = getHeatmapPointsFromSeccionales();
  const listadoSeccionales = SECCIONALES.map((s, i) => {
    const pt = heatmap[i];
    return {
      numero: s.seccional_nro,
      nombre:
        s.seccional_nro > 0 ? `Seccional ${s.seccional_nro}` : s.barrio_jurisdiccion.replace(/_/g, " "),
      cantidadValidados: pt?.cantidad ?? 0,
    };
  });

  return {
    totalVotantes: 35720,
    eventosHoy: 4,
    seccionales: SECCIONALES.length,
    listadoSeccionales,
    seguidoresPorConcejales: [
      { nombre: "Sosa", seguidores: 4200 },
      { nombre: "Lopez", seguidores: 3100 },
      { nombre: "Ruiz", seguidores: 2800 },
      { nombre: "Diaz", seguidores: 2500 },
      { nombre: "Bello", seguidores: 2300 },
    ],
    lealesPorLideres: [
      { nombre: "Sosa", valor: 32 },
      { nombre: "Bello", valor: 21 },
      { nombre: "Fernández", valor: 15 },
      { nombre: "Lopez", valor: 14 },
      { nombre: "Otros", valor: 18 },
    ],
  };
}

/**
 * Devuelve el contexto de KPIs para evaluar alertas.
 * Con DATA_SOURCE=db: consultar totalVotantes, eventosHoy, listadoSeccionales, seguidoresPorConcejales desde BD.
 */
export async function getContextoKPIs(): Promise<ContextoKPIs> {
  if (getDataSource() === "db") {
    // TODO: agregar desde Prisma y opcionalmente cache
    // eventosHoy = await prisma.eventoAuditoria.count({ where: { createdAt: { gte: startOfToday } } });
    // listadoSeccionales = await prisma.seccional.findMany({ select: { numero, nombre, ... } });
  }
  return buildContextoMock();
}
