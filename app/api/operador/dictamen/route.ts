/**
 * PATCH - Registrar dictamen del Operador YAPÓ al Comité.
 * Body: { fichaId, cedulaOperador, dictamen, evidenciaFaltaEquipo? }.
 * dictamen: APROBADO | APROBADO_OBSERVACION | RECHAZADO | DERIVAR_CAPACITACION
 * En APROBADO/APROBADO_OBSERVACION se acredita la comisión en Billetera YAPÓ.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { debeDerivarACapacitacion } from "@/lib/idoneidad/clasificacion";
import { COMISION_POR_VALIDACION } from "@/lib/constants/comision";

const DICTAMENES_VALIDOS = ["APROBADO", "APROBADO_OBSERVACION", "RECHAZADO", "DERIVAR_CAPACITACION"] as const;

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const fichaId = body.fichaId?.trim();
    const cedulaOperador = body.cedulaOperador?.trim();
    const dictamen = body.dictamen?.trim().toUpperCase();
    const evidenciaFaltaEquipo = body.evidenciaFaltaEquipo === true;
    const lugarValidacion = ["IN_SITU", "LUGAR_TRABAJO", "CASA"].includes(String(body.lugarValidacion ?? "").toUpperCase())
      ? (String(body.lugarValidacion).toUpperCase() as "IN_SITU" | "LUGAR_TRABAJO" | "CASA")
      : null;

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
      lugarValidacion: string | null;
      estadoVerificacion?: string;
    } = {
      dictamenOperador: dictamen,
      dictamenAt: ahora,
      evidenciaFaltaEquipo,
      lugarValidacion,
    };

    if (dictamen === "APROBADO" || dictamen === "APROBADO_OBSERVACION") {
      actualizar.estadoVerificacion = "VERIFICADO";
    }

    await prisma.ficha.update({
      where: { id: fichaId },
      data: actualizar,
    });

    // Acreditar comisión en Billetera YAPÓ del operador
    if (dictamen === "APROBADO" || dictamen === "APROBADO_OBSERVACION") {
      const operador = await prisma.operador.findUnique({
        where: { cedula: cedulaOperador },
      });
      if (operador) {
        await prisma.$transaction([
          prisma.operador.update({
            where: { id: operador.id },
            data: { saldoDisponible: { increment: COMISION_POR_VALIDACION } },
          }),
          prisma.billeteraMovimiento.create({
            data: {
              operadorId: operador.id,
              tipo: "COMISION_ACREDITADA",
              monto: COMISION_POR_VALIDACION,
              referencia: fichaId,
              estado: "COMPLETADO",
            },
          }),
        ]);
      }
    }

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
