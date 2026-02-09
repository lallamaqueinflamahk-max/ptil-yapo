import { NextResponse } from "next/server";
import {
  TOTAL_SECCIONALES,
  getHeatmapPointsFromSeccionales,
  ORGANIZACION,
  TIPIFICACION_RANGOS,
  COLORES_POR_RANGO,
} from "@/lib/data/seccionales2026";

/** Datos para Dashboard Maestro (Camilo) - Base 2026 Honor Colorado. */
export async function GET() {
  const heatmapPoints = getHeatmapPointsFromSeccionales();

  const data = {
    organizacion: ORGANIZACION,
    totalVotantes: 35720,
    seccionales: TOTAL_SECCIONALES,
    concejalesActivos: 15,
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
  };
  return NextResponse.json(data);
}
