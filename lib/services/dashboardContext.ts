/**
 * Contexto agregado del dashboard para el Asistente Maestro.
 * Reúne datos de territorio, KPIs, evolución, alertas y Pro para respuestas en tiempo real.
 */

import { getMaestroData } from "@/lib/services/maestro";
import { getSerieEvolucion } from "@/lib/services/evolucion";
import { getContextoKPIs } from "@/lib/services/contextoKpis";
import { evaluarAlertas } from "@/lib/alertas/reglas";
import { prisma } from "@/lib/db";

export interface DashboardContextSummary {
  lastUpdated: string;
  territorio: {
    totalVotantes: number;
    seccionales: number;
    concejalesActivos: number;
    eventosHoy: number;
    estadoSeccionales: { green: number; yellow: number; red: number };
    scope?: { nombreCiudad: string; totalSeccionales: number };
  };
  pro: {
    afiliadosLeales: number;
    operadores: number;
    rankingPresidentes: Array<{ nombre: string; leales: number }>;
  };
  idoneidad: {
    totalFichas: number;
    fichasHoy: number;
    fichasVerificadas: number;
    totalDerivaciones: number;
    totalCertificaciones: number;
    pendientesDictamen: number;
  };
  kpis: {
    lealtadGlobal: number;
    riesgoPolitico: number;
    nivelFormalizacion: number;
    concentracionPoder: number;
  };
  evolucion: {
    dias: number;
    ultimosPuntos: Array<{ fecha: string; validados: number; verificados?: number; derivaciones?: number }>;
  };
  alertas: {
    total: number;
    criticos: number;
    resumen: Array<{ tipo: string; nivel: string; mensaje: string }>;
  };
}

async function getProData() {
  return {
    afiliadosLeales: 4520,
    seccionales: 8,
    operadores: 38,
    rankingPresidentes: [
      { nombre: "Lopez", leales: 540 },
      { nombre: "Ramirez", leales: 460 },
      { nombre: "Gimenez", leales: 420 },
      { nombre: "Vera", leales: 380 },
      { nombre: "Mendoza", leales: 350 },
    ],
  };
}

/** Construye el contexto completo del dashboard para el asistente. */
export async function getDashboardContext(): Promise<DashboardContextSummary> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [maestro, pro, evolucion, ctxKpis, totalFichas, fichasHoy, fichasVerificadas, totalDerivaciones, totalCertificaciones, derivacionesList] =
    await Promise.all([
      getMaestroData(),
      getProData(),
      getSerieEvolucion(30 as 30 | 60 | 90, null),
      getContextoKPIs(),
      prisma.ficha.count().catch(() => 0),
      prisma.ficha.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.ficha.count({ where: { estadoVerificacion: "VERIFICADO" } }).catch(() => 0),
      prisma.derivacionCapacitacion.count().catch(() => 0),
      prisma.certificacion.count().catch(() => 0),
      prisma.derivacionCapacitacion.findMany({ where: {}, select: { estado: true } }).catch(() => []),
    ]);

  const alertas = evaluarAlertas(ctxKpis);
  const listado = maestro.listadoSeccionales ?? [];
  const countGreen = listado.filter((s) => s.estado === "green").length;
  const countYellow = listado.filter((s) => s.estado === "yellow").length;
  const countRed = listado.filter((s) => s.estado === "red").length;

  const totalVotantes = maestro.totalVotantes ?? 35720;
  const afiliadosLeales = pro.afiliadosLeales ?? 4520;
  const lealtadGlobal = totalVotantes > 0 ? (afiliadosLeales / totalVotantes) * 100 : 0;
  const nivelFormalizacion = totalFichas > 0 ? (fichasVerificadas / totalFichas) * 100 : 0;
  const concentracionPoder =
    100 -
    (totalVotantes > 0 ? Math.min(100, (afiliadosLeales / totalVotantes) * 100 * 2.5) : 0);
  const riesgoPolitico = Math.max(0, 100 - nivelFormalizacion - lealtadGlobal * 0.5);

  const pendientesDictamen = Array.isArray(derivacionesList)
    ? derivacionesList.filter((d: { estado?: string }) => d.estado === "PENDIENTE").length
    : 0;

  const ultimosPuntos = (evolucion.serie ?? []).slice(-7).map((p) => ({
    fecha: p.fecha,
    validados: p.validados ?? 0,
    verificados: p.verificados,
    derivaciones: p.derivaciones,
  }));

  return {
    lastUpdated: now.toISOString(),
    territorio: {
      totalVotantes: maestro.totalVotantes ?? 0,
      seccionales: maestro.seccionales ?? 0,
      concejalesActivos: maestro.concejalesActivos ?? 0,
      eventosHoy: maestro.eventosHoy ?? 0,
      estadoSeccionales: { green: countGreen, yellow: countYellow, red: countRed },
      scope: maestro.scope,
    },
    pro: {
      afiliadosLeales: pro.afiliadosLeales,
      operadores: pro.operadores,
      rankingPresidentes: pro.rankingPresidentes?.slice(0, 5) ?? [],
    },
    idoneidad: {
      totalFichas,
      fichasHoy,
      fichasVerificadas,
      totalDerivaciones,
      totalCertificaciones,
      pendientesDictamen,
    },
    kpis: {
      lealtadGlobal: Math.round(lealtadGlobal * 10) / 10,
      riesgoPolitico: Math.round(riesgoPolitico * 10) / 10,
      nivelFormalizacion: Math.round(nivelFormalizacion * 10) / 10,
      concentracionPoder: Math.round(concentracionPoder * 10) / 10,
    },
    evolucion: {
      dias: 30,
      ultimosPuntos,
    },
    alertas: {
      total: alertas.length,
      criticos: alertas.filter((a) => a.nivel === "critico").length,
      resumen: alertas.slice(0, 10).map((a) => ({
        tipo: a.tipo,
        nivel: a.nivel,
        mensaje: a.mensaje,
      })),
    },
  };
}
