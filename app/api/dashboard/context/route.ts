import { NextResponse } from "next/server";
import { getDashboardContext } from "@/lib/services/dashboardContext";

/** GET - Contexto agregado del dashboard para el Asistente Maestro. */
export async function GET() {
  try {
    const context = await getDashboardContext();
    return NextResponse.json(context);
  } catch (e) {
    console.error("Error al cargar contexto del dashboard:", e);
    return NextResponse.json(
      { error: "No se pudo cargar el contexto del dashboard." },
      { status: 500 }
    );
  }
}
