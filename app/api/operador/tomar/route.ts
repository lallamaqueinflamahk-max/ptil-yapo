/**
 * POST - Tomar verificación (geofencing: el primero que llega, gana).
 * Body: { fichaId, cedulaOperador }.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fichaId = body.fichaId?.trim();
    const cedulaOperador = body.cedulaOperador?.trim();

    if (!fichaId || !cedulaOperador) {
      return NextResponse.json(
        { error: "Faltan fichaId o cedulaOperador." },
        { status: 400 }
      );
    }

    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
    });

    if (!ficha) {
      return NextResponse.json({ error: "Ficha no encontrada." }, { status: 404 });
    }

    if (ficha.estadoVerificacion !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Esta ficha ya no está pendiente de verificación." },
        { status: 400 }
      );
    }

    if (ficha.asignadoOperadorCedula != null) {
      return NextResponse.json(
        { error: "Otro Operador YAPÓ ya tomó esta verificación.", codigo: "YA_TOMADA" },
        { status: 409 }
      );
    }

    await prisma.ficha.update({
      where: { id: fichaId },
      data: {
        asignadoOperadorCedula: cedulaOperador,
        asignadoAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      fichaId,
      mensaje: "Verificación tomada. Aparece en tus validaciones pendientes de dictamen.",
    });
  } catch (e) {
    console.error("Error al tomar verificación:", e);
    return NextResponse.json(
      { error: "No se pudo tomar la verificación." },
      { status: 500 }
    );
  }
}
