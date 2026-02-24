import { NextResponse } from "next/server";
import { getDetalleSeccional } from "@/lib/services/mapaSeccional";

/** Re-exportar tipos para componentes que importan desde esta ruta */
export type { DetalleSeccional, KpiLocal, PuntoEvolucionLocal, AlertaActiva, SemáforoEstado } from "@/lib/types/dashboard";

/** GET ?numero=18 — Detalle de una seccional para el panel lateral del mapa. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numeroStr = searchParams.get("numero");
  const numero = numeroStr ? parseInt(numeroStr, 10) : NaN;

  if (Number.isNaN(numero) || numero < 1 || numero > 45) {
    return NextResponse.json(
      { error: "Parámetro numero requerido (1-45)" },
      { status: 400 }
    );
  }

  const detalle = await getDetalleSeccional(numero);
  if (!detalle) {
    return NextResponse.json({ error: "Seccional no encontrada" }, { status: 404 });
  }

  return NextResponse.json(detalle);
}
