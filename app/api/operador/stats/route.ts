/**
 * GET - Estadísticas del Operador YAPÓ: total validados, validados este mes, pendientes de dictamen.
 * Query: cedula (obligatorio).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cedula = request.nextUrl.searchParams.get("cedula")?.trim();
    if (!cedula) {
      return NextResponse.json(
        { error: "Faltó el parámetro cedula." },
        { status: 400 }
      );
    }

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalValidados, validadosEsteMes, pendientesDictamen] = await Promise.all([
      prisma.ficha.count({
        where: {
          asignadoOperadorCedula: cedula,
          dictamenOperador: { not: null },
        },
      }),
      prisma.ficha.count({
        where: {
          asignadoOperadorCedula: cedula,
          dictamenOperador: { not: null },
          dictamenAt: { gte: inicioMes },
        },
      }),
      prisma.ficha.count({
        where: {
          asignadoOperadorCedula: cedula,
          dictamenOperador: null,
        },
      }),
    ]);

    return NextResponse.json({
      totalValidados,
      validadosEsteMes,
      pendientesDictamen,
    });
  } catch (e) {
    console.error("Error al obtener stats operador:", e);
    return NextResponse.json(
      { error: "Error al cargar estadísticas." },
      { status: 500 }
    );
  }
}
