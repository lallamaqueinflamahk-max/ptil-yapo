import { NextRequest, NextResponse } from "next/server";
import { evaluarAlertas } from "@/lib/alertas/reglas";
import { getContextoKPIs } from "@/lib/services/contextoKpis";
import type { NivelAlerta, TipoAlerta } from "@/lib/alertas/types";

/** GET: alertas automáticas basadas en KPIs. Query: ?nivel=info|warning|critico & tipo=... */
export async function GET(request: NextRequest) {
  try {
    const ctx = await getContextoKPIs();
    let alertas = evaluarAlertas(ctx);
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel") as NivelAlerta | null;
    const tipo = searchParams.get("tipo") as TipoAlerta | null;
    if (nivel && ["info", "warning", "critico"].includes(nivel)) {
      alertas = alertas.filter((a) => a.nivel === nivel);
    }
    if (tipo) {
      alertas = alertas.filter((a) => a.tipo === tipo);
    }
    return NextResponse.json({
      alertas,
      total: alertas.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error al evaluar alertas:", e);
    return NextResponse.json(
      { error: "No se pudieron calcular las alertas." },
      { status: 500 }
    );
  }
}
