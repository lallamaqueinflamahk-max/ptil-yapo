import { NextResponse } from "next/server";
import { getSerieEvolucion } from "@/lib/services/evolucion";

/** GET ?dias=30|60|90&filter= (opcional). Fuente según DATA_SOURCE (mock | db). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const diasParam = searchParams.get("dias");
  const filter = searchParams.get("filter") ?? null;
  const dias = diasParam === "30" ? 30 : diasParam === "90" ? 90 : 60;

  const { serie, lastUpdated } = await getSerieEvolucion(dias, filter);
  return NextResponse.json({
    serie,
    dias,
    filter,
    lastUpdated,
  });
}
