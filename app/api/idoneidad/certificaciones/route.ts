import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const TIPOS_VALIDOS = ["SNPP", "SINAFOCAL", "OTRO"];

/** GET - Lista de certificaciones registradas. */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo")?.trim().toUpperCase();
  try {
    if (codigo) {
      const ficha = await prisma.ficha.findUnique({
        where: { codigoVerificacion: codigo },
        include: { certificaciones: { orderBy: { fechaEmision: "desc" } } },
      });
      if (!ficha) {
        return NextResponse.json({ error: "Ficha no encontrada." }, { status: 404 });
      }
      const listado = ficha.certificaciones.map((c) => ({
        id: c.id,
        fichaId: c.fichaId,
        tipo: c.tipo,
        institucion: c.institucion,
        fechaEmision: c.fechaEmision.toISOString().slice(0, 10),
        numeroTitulo: c.numeroTitulo,
        createdAt: c.createdAt.toISOString(),
      }));
      return NextResponse.json({ certificaciones: listado, total: listado.length });
    }

    const certificaciones = await prisma.certificacion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ficha: {
          select: { codigoVerificacion: true, nombreCompleto: true, oficioPrincipal: true },
        },
      },
    });
    const listado = certificaciones.map((c) => ({
      id: c.id,
      fichaId: c.fichaId,
      codigoVerificacion: c.ficha.codigoVerificacion,
      nombreCompleto: c.ficha.nombreCompleto,
      oficioPrincipal: c.ficha.oficioPrincipal,
      tipo: c.tipo,
      institucion: c.institucion,
      fechaEmision: c.fechaEmision.toISOString().slice(0, 10),
      numeroTitulo: c.numeroTitulo,
      createdAt: c.createdAt.toISOString(),
    }));
    return NextResponse.json({ certificaciones: listado, total: listado.length });
  } catch (e) {
    console.error("Error al listar certificaciones:", e);
    return NextResponse.json(
      { error: "Error al listar certificaciones." },
      { status: 500 }
    );
  }
}

/** POST - Registrar una certificación. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codigoVerificacion = body.codigoVerificacion?.trim().toUpperCase();
    const fichaId = body.fichaId?.trim();
    const tipo = body.tipo?.trim().toUpperCase();
    const institucion = body.institucion?.trim();
    const fechaEmision = body.fechaEmision?.trim();
    const numeroTitulo = body.numeroTitulo?.trim() || null;

    if (!codigoVerificacion && !fichaId) {
      return NextResponse.json(
        { error: "Indicá codigoVerificacion o fichaId." },
        { status: 400 }
      );
    }
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { error: "tipo debe ser uno de: SNPP, SINAFOCAL, OTRO." },
        { status: 400 }
      );
    }
    if (!institucion) {
      return NextResponse.json({ error: "institucion es obligatorio." }, { status: 400 });
    }
    if (!fechaEmision) {
      return NextResponse.json({ error: "fechaEmision es obligatorio (YYYY-MM-DD)." }, { status: 400 });
    }

    const ficha = codigoVerificacion
      ? await prisma.ficha.findUnique({ where: { codigoVerificacion } })
      : await prisma.ficha.findUnique({ where: { id: fichaId } });

    if (!ficha) {
      return NextResponse.json({ error: "No se encontró la ficha." }, { status: 404 });
    }

    const fecha = new Date(fechaEmision);
    if (isNaN(fecha.getTime())) {
      return NextResponse.json({ error: "fechaEmision inválida." }, { status: 400 });
    }

    const cert = await prisma.certificacion.create({
      data: {
        fichaId: ficha.id,
        tipo,
        institucion,
        fechaEmision: fecha,
        numeroTitulo: numeroTitulo ?? undefined,
      },
      include: {
        ficha: { select: { codigoVerificacion: true, nombreCompleto: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      id: cert.id,
      fichaId: cert.fichaId,
      codigoVerificacion: cert.ficha.codigoVerificacion,
      tipo: cert.tipo,
      institucion: cert.institucion,
      fechaEmision: cert.fechaEmision.toISOString().slice(0, 10),
      numeroTitulo: cert.numeroTitulo,
      createdAt: cert.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("Error al registrar certificación:", e);
    return NextResponse.json(
      { error: "No se pudo registrar la certificación." },
      { status: 500 }
    );
  }
}
