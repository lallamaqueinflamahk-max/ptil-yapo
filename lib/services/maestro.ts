/**
 * Servicio de datos del dashboard Maestro.
 * Hoy: mock desde lib/data. Con BD real: leer seccionales, votantes, líderes y eventos desde Prisma.
 */

import {
  TOTAL_SECCIONALES,
  SECCIONALES,
  getHeatmapPointsFromSeccionales,
  TIPIFICACION_RANGOS,
  COLORES_POR_RANGO,
  type RangoId,
} from "@/lib/data/seccionales2026";
import { getAllPuntosMapaCapas } from "@/lib/data/mapaCapasData";
import { getTerritoryConfig } from "@/lib/config/territory";
import { getEventosAuditoria } from "./auditoria";
import type { MaestroApiResponse, ListadoSeccionalItem } from "@/lib/types/dashboard";

function getEstadoSeccional(
  numero: number,
  cantidadValidados: number
): { estado: "green" | "yellow" | "red"; estadoLabel: string } {
  const lealtad = 40 + (numero % 35);
  const formalizacion = 50 + (numero % 40);
  const riesgo = Math.max(0, 100 - formalizacion - lealtad * 0.5);
  if (riesgo > 55 || lealtad < 35 || formalizacion < 40) {
    return { estado: "red", estadoLabel: "Requiere atención prioritaria" };
  }
  if (riesgo > 35 || lealtad < 50 || formalizacion < 60) {
    return { estado: "yellow", estadoLabel: "Atención recomendada" };
  }
  return { estado: "green", estadoLabel: "En rango esperado" };
}

function buildListadoSeccionales(): ListadoSeccionalItem[] {
  const heatmap = getHeatmapPointsFromSeccionales();
  return SECCIONALES.map((s, i) => {
    const pt = heatmap[i];
    const cantidad = pt?.cantidad ?? 400 + ((s.seccional_nro * 31) % 1200);
    const { estado, estadoLabel } = getEstadoSeccional(s.seccional_nro, cantidad);
    const contacto =
      s.seccional_nro > 0 ? `595981${String(s.seccional_nro).padStart(3, "0").slice(-3)}` : null;
    return {
      id: `sec-${s.seccional_nro}-${i}`,
      numero: s.seccional_nro,
      nombre:
        s.seccional_nro > 0 ? `Seccional ${s.seccional_nro}` : s.barrio_jurisdiccion.replace(/_/g, " "),
      barrio: s.barrio_jurisdiccion.replace(/_/g, " "),
      titular: s.nombre_titular,
      rangoId: s.rango_id,
      activo: true,
      cantidadValidados: cantidad,
      lat: s.lat,
      lng: s.lng,
      estado,
      estadoLabel,
      contacto,
    };
  });
}

/**
 * Obtiene todos los datos del dashboard Maestro.
 * Con BD real: reemplazar por queries a Prisma (Seccional, Usuario, EventoAuditoria, agregados).
 */
export async function getMaestroData(): Promise<MaestroApiResponse> {
  const territory = getTerritoryConfig();
  const heatmapPoints = getHeatmapPointsFromSeccionales();
  const listadoSeccionales = buildListadoSeccionales();
  const eventosAuditoria = await getEventosAuditoria();

  const eventosHoy = eventosAuditoria.filter((e) => {
    const d = new Date(e.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const totalSecc = territory.totalSeccionales ?? TOTAL_SECCIONALES;
  const data: MaestroApiResponse = {
    organizacion: territory.organizacion,
    totalVotantes: 35720,
    seccionales: totalSecc,
    scope: {
      nombreCiudad: territory.nombreCiudad,
      circunscripcion: territory.circunscripcion,
      totalSeccionales: totalSecc,
    },
    concejalesActivos: 15,
    eventosHoy,
    tipificacionRangos: TIPIFICACION_RANGOS,
    coloresRango: COLORES_POR_RANGO,
    lealesPorLideres: [
      { nombre: "Sosa", valor: 32, color: "#DC2626" },
      { nombre: "Bello", valor: 21, color: "#1E3A8A" },
      { nombre: "Fernández", valor: 15, color: "#059669" },
      { nombre: "Lopez", valor: 14, color: "#6366F1" },
      { nombre: "Otros", valor: 18, color: "#94A3B8" },
    ],
    seguidoresPorConcejales: [
      { nombre: "Sosa", seguidores: 4200, fill: "#DC2626" },
      { nombre: "Lopez", seguidores: 3100, fill: "#1E3A8A" },
      { nombre: "Ruiz", seguidores: 2800, fill: "#3B82F6" },
      { nombre: "Diaz", seguidores: 2500, fill: "#6366F1" },
      { nombre: "Bello", seguidores: 2300, fill: "#059669" },
    ],
    heatmapPoints,
    listadoSeccionales,
    eventosAuditoria,
    capasMapa: getAllPuntosMapaCapas(),
    lastUpdated: new Date().toISOString(),
  };
  return data;
}
