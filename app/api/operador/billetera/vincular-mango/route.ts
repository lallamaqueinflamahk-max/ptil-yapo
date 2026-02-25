/**
 * POST - Vincular o desvincular la cuenta personal de Billetera Mango del operador.
 * Body: { cedula, mangoPhone }. mangoPhone vacío o null = desvincular.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cedula = body.cedula?.trim();
    const mangoPhone = body.mangoPhone?.trim() || null;

    if (!cedula) {
      return NextResponse.json(
        { error: "Faltó la cédula del operador." },
        { status: 400 }
      );
    }

    const operador = await prisma.operador.findUnique({
      where: { cedula },
    });

    if (!operador) {
      return NextResponse.json(
        { error: "Operador no encontrado." },
        { status: 404 }
      );
    }

    await prisma.operador.update({
      where: { cedula },
      data: { mangoPhone },
    });

    return NextResponse.json({
      ok: true,
      mangoVinculado: !!mangoPhone,
      mangoPhone,
    });
  } catch (e) {
    console.error("Error al vincular Mango:", e);
    return NextResponse.json(
      { error: "No se pudo vincular la cuenta Mango." },
      { status: 500 }
    );
  }
}
