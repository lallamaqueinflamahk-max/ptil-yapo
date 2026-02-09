import { NextResponse } from "next/server";
import { tipificarOficioIA } from "@/lib/ai/tipificarOficioIA";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const descripcionUsuario = typeof body.descripcionUsuario === "string"
      ? body.descripcionUsuario
      : "";
    const imagenUrl = typeof body.imagenUrl === "string" ? body.imagenUrl : undefined;

    if (!descripcionUsuario.trim()) {
      return NextResponse.json(
        { error: "descripcionUsuario es requerido" },
        { status: 400 }
      );
    }

    const result = await tipificarOficioIA(descripcionUsuario.trim(), imagenUrl || null);
    return NextResponse.json(result);
  } catch (e) {
    console.error("tipificar-oficio error:", e);
    return NextResponse.json(
      { error: "Error al tipificar oficio" },
      { status: 500 }
    );
  }
}
