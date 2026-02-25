/**
 * GET - Obtener Operador YAPÓ por cédula (para saber seccional/zona).
 * POST - Registrar o actualizar Operador (cedula, seccionalNro, nombreCompleto).
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
    });

    if (!operador) {
      return NextResponse.json({ error: "Operador no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      cedula: operador.cedula,
      seccionalNro: operador.seccionalNro,
      nombreCompleto: operador.nombreCompleto,
      whatsapp: operador.whatsapp,
      avatarUrl: operador.avatarUrl,
    });
  } catch (e) {
    console.error("Error al obtener operador:", e);
    return NextResponse.json(
      { error: "Error al cargar operador." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cedula = body.cedula?.trim();
    const seccionalNro = body.seccionalNro?.trim();
    const nombreCompleto = body.nombreCompleto?.trim() || null;
    const whatsapp = body.whatsapp?.trim() || null;
    const avatarUrl = body.avatarUrl?.trim() || null;

    if (!cedula || !seccionalNro) {
      return NextResponse.json(
        { error: "Faltan cedula o seccionalNro." },
        { status: 400 }
      );
    }

    const operador = await prisma.operador.upsert({
      where: { cedula },
      create: { cedula, seccionalNro, nombreCompleto, whatsapp, avatarUrl },
      update: {
        seccionalNro,
        nombreCompleto: nombreCompleto ?? undefined,
        whatsapp: whatsapp ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      cedula: operador.cedula,
      seccionalNro: operador.seccionalNro,
      nombreCompleto: operador.nombreCompleto,
      whatsapp: operador.whatsapp,
      avatarUrl: operador.avatarUrl,
    });
  } catch (e) {
    console.error("Error al registrar operador:", e);
    return NextResponse.json(
      { error: "No se pudo registrar el operador." },
      { status: 500 }
    );
  }
}
