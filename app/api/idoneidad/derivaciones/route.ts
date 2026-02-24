import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { debeDerivarACapacitacion, normalizarGrupo } from "@/lib/idoneidad/clasificacion";

/** GET - Lista de derivaciones a capacitación (para dashboard). */
export async function GET() {
  try {
    const derivaciones = await prisma.derivacionCapacitacion.findMany({
      orderBy: { fechaDerivacion: "desc" },
      include: {
        ficha: {
          select: {
            codigoVerificacion: true,
            nombreCompleto: true,
            oficioPrincipal: true,
            clasificacionAutomatica: true,
          },
        },
      },
    });

    const listado = derivaciones.map((d) => ({
      id: d.id,
      fichaId: d.fichaId,
      codigoVerificacion: d.ficha.codigoVerificacion,
      nombreCompleto: d.ficha.nombreCompleto,
      oficioPrincipal: d.ficha.oficioPrincipal,
      grupoOrigen: d.grupoOrigen,
      estado: d.estado,
      fechaDerivacion: d.fechaDerivacion.toISOString(),
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({ derivaciones: listado, total: listado.length });
  } catch (e) {
    console.error("Error al listar derivaciones:", e);
    return NextResponse.json(
      { error: "Error al listar derivaciones." },
      { status: 500 }
    );
  }
}

/** POST - Crear derivación a capacitación (por código de verificación o fichaId). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codigoVerificacion = body.codigoVerificacion?.trim().toUpperCase();
    const fichaId = body.fichaId?.trim();

    if (!codigoVerificacion && !fichaId) {
      return NextResponse.json(
        { error: "Indicá codigoVerificacion o fichaId." },
        { status: 400 }
      );
    }

    const ficha = codigoVerificacion
      ? await prisma.ficha.findUnique({ where: { codigoVerificacion } })
      : await prisma.ficha.findUnique({ where: { id: fichaId } });

    if (!ficha) {
      return NextResponse.json(
        { error: "No se encontró la ficha." },
        { status: 404 }
      );
    }

    const grupo = normalizarGrupo(ficha.clasificacionAutomatica);
    if (!debeDerivarACapacitacion(grupo, { grupoBSinCertificacionTambien: true })) {
      return NextResponse.json(
        { error: "Este trabajador no aplica para derivación automática (solo Grupo C o B sin certificación)." },
        { status: 400 }
      );
    }

    const existente = await prisma.derivacionCapacitacion.findUnique({
      where: { fichaId: ficha.id },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Ya existe una derivación para esta ficha.", derivacionId: existente.id },
        { status: 409 }
      );
    }

    const derivacion = await prisma.derivacionCapacitacion.create({
      data: {
        fichaId: ficha.id,
        grupoOrigen: grupo,
        estado: "PENDIENTE",
      },
      include: {
        ficha: {
          select: { codigoVerificacion: true, nombreCompleto: true, oficioPrincipal: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      id: derivacion.id,
      fichaId: derivacion.fichaId,
      codigoVerificacion: derivacion.ficha.codigoVerificacion,
      grupoOrigen: derivacion.grupoOrigen,
      estado: derivacion.estado,
      fechaDerivacion: derivacion.fechaDerivacion.toISOString(),
    });
  } catch (e) {
    console.error("Error al crear derivación:", e);
    return NextResponse.json(
      { error: "No se pudo crear la derivación." },
      { status: 500 }
    );
  }
}
