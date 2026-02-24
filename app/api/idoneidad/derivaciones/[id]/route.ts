import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** PATCH - Actualizar estado de una derivación (PENDIENTE | EN_CURSO | COMPLETADO). */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Faltó el id." }, { status: 400 });
  }

  try {
    const body = await _request.json();
    const estado = body.estado?.trim().toUpperCase();
    const estadosValidos = ["PENDIENTE", "EN_CURSO", "COMPLETADO"];
    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: "estado debe ser uno de: PENDIENTE, EN_CURSO, COMPLETADO." },
        { status: 400 }
      );
    }

    const derivacion = await prisma.derivacionCapacitacion.update({
      where: { id },
      data: { estado },
      include: {
        ficha: { select: { codigoVerificacion: true, nombreCompleto: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      id: derivacion.id,
      estado: derivacion.estado,
      updatedAt: derivacion.updatedAt.toISOString(),
    });
  } catch (e) {
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Derivación no encontrada." }, { status: 404 });
    }
    console.error("Error al actualizar derivación:", e);
    return NextResponse.json(
      { error: "No se pudo actualizar." },
      { status: 500 }
    );
  }
}
