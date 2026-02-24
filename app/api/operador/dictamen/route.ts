/**
 * PATCH - Registrar dictamen del Operador YAPÓ al Comité.
 * Body: { fichaId, cedulaOperador, dictamen, evidenciaFaltaEquipo? }.
 * dictamen: APROBADO | APROBADO_OBSERVACION | RECHAZADO | DERIVAR_CAPACITACION
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { debeDerivarACapacitacion } from "@/lib/idoneidad/clasificacion";

const DICTAMENES_VALIDOS = ["APROBADO", "APROBADO_OBSERVACION", "RECHAZADO", "DERIVAR_CAPACITACION"] as const;

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const fichaId = body.fichaId?.trim();
    const cedulaOperador = body.cedulaOperador?.trim();
    const dictamen = body.dictamen?.trim().toUpperCase();
    const evidenciaFaltaEquipo = body.evidenciaFaltaEquipo === true;

    if (!fichaId || !cedulaOperador || !dictamen) {
      return NextResponse.json(
        { error: "Faltan fichaId, cedulaOperador o dictamen." },
        { status: 400 }
      );
    }

    if (!DICTAMENES_VALIDOS.includes(dictamen as (typeof DICTAMENES_VALIDOS)[number])) {
      return NextResponse.json(
        { error: "dictamen debe ser: APROBADO, APROBADO_OBSERVACION, RECHAZADO, DERIVAR_CAPACITACION." },
        { status: 400 }
      );
    }

    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: { derivacion: true },
    });

    if (!ficha) {
      return NextResponse.json({ error: "Ficha no encontrada." }, { status: 404 });
    }

    if (ficha.asignadoOperadorCedula !== cedulaOperador) {
      return NextResponse.json(
        { error: "Esta ficha no está asignada a tu cédula de Operador YAPÓ." },
        { status: 403 }
      );
    }

    if (ficha.dictamenOperador != null) {
      return NextResponse.json(
        { error: "Ya registraste un dictamen para esta ficha." },
        { status: 409 }
      );
    }

    const ahora = new Date();
    const actualizar: {
      dictamenOperador: string;
      dictamenAt: Date;
      evidenciaFaltaEquipo: boolean;
      estadoVerificacion?: string;
    } = {
      dictamenOperador: dictamen,
      dictamenAt: ahora,
      evidenciaFaltaEquipo,
    };

    if (dictamen === "APROBADO" || dictamen === "APROBADO_OBSERVACION") {
      actualizar.estadoVerificacion = "VERIFICADO";
    }

    await prisma.ficha.update({
      where: { id: fichaId },
      data: actualizar,
    });

    if (dictamen === "DERIVAR_CAPACITACION") {
      const grupo = ficha.clasificacionAutomatica;
      if (debeDerivarACapacitacion(grupo, { grupoBSinCertificacionTambien: true })) {
        try {
          await prisma.derivacionCapacitacion.upsert({
            where: { fichaId },
            create: {
              fichaId,
              grupoOrigen: grupo,
              estado: "PENDIENTE",
            },
            update: {},
          });
        } catch (e) {
          console.warn("No se pudo crear/actualizar derivación a capacitación:", e);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      fichaId,
      dictamen,
      estadoVerificacion: actualizar.estadoVerificacion ?? ficha.estadoVerificacion,
    });
  } catch (e) {
    console.error("Error al registrar dictamen:", e);
    return NextResponse.json(
      { error: "No se pudo registrar el dictamen." },
      { status: 500 }
    );
  }
}
