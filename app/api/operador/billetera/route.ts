/**
 * GET - Billetera del operador: saldo YAPÓ, movimientos recientes y estado de vinculación Mango.
 * Query: cedula (cédula del operador).
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

    const operador = await prisma.operador.findUnique({
      where: { cedula },
      include: {
        movimientos: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!operador) {
      return NextResponse.json(
        { error: "Operador no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      saldoYapo: operador.saldoDisponible,
      mangoVinculado: !!operador.mangoPhone,
      mangoPhone: operador.mangoPhone ?? null,
      movimientos: operador.movimientos.map((m) => ({
        id: m.id,
        tipo: m.tipo,
        monto: m.monto,
        referencia: m.referencia,
        estado: m.estado,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("Error al obtener billetera:", e);
    return NextResponse.json(
      { error: "Error al cargar la billetera." },
      { status: 500 }
    );
  }
}
