import { NextResponse } from "next/server";
import { getMaestroData } from "@/lib/services/maestro";

/** GET: datos del dashboard Maestro. Fuente según DATA_SOURCE (mock | db). */
export async function GET() {
  try {
    const data = await getMaestroData();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Error al cargar datos maestro:", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los datos del dashboard." },
      { status: 500 }
    );
  }
}
