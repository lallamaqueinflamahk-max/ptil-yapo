import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEstadoIdoneidad } from "@/lib/idoneidad/clasificacion";
import type { TrabajadorClasificacion } from "@/lib/idoneidad/types";

/** GET ?codigo=XXX - Clasificación y estado de idoneidad del trabajador por código de verificación. */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo")?.trim().toUpperCase();
  if (!codigo) {
    return NextResponse.json(
      { error: "Faltó el parámetro codigo (código de verificación)." },
      { status: 400 }
    );
  }

  try {
    const ficha = await prisma.ficha.findUnique({
      where: { codigoVerificacion: codigo },
      include: {
        derivacion: true,
        certificaciones: true,
      },
    });

    if (!ficha) {
      return NextResponse.json(
        { error: "No se encontró ninguna ficha con ese código." },
        { status: 404 }
      );
    }

    const tieneCertificacion = ficha.certificaciones.length > 0;
    const derivadoACapacitacion = !!ficha.derivacion;
    const derivacionCompletada = ficha.derivacion?.estado === "COMPLETADO";

    const estadoIdoneidad = getEstadoIdoneidad(ficha.clasificacionAutomatica, {
      tieneCertificacion,
      derivadoACapacitacion,
      derivacionCompletada,
    });

    const resultado: TrabajadorClasificacion = {
      codigoVerificacion: ficha.codigoVerificacion,
      nombreCompleto: ficha.nombreCompleto,
      grupo: ficha.clasificacionAutomatica as TrabajadorClasificacion["grupo"],
      estadoIdoneidad,
      oficioPrincipal: ficha.oficioPrincipal,
      nivelEstudios: ficha.nivelEstudios,
      experienciaAnios: ficha.experienciaAnios,
      tieneCertificacion,
      derivadoACapacitacion,
    };

    return NextResponse.json(resultado);
  } catch (e) {
    console.error("Error al obtener clasificación:", e);
    return NextResponse.json(
      { error: "Error al consultar la clasificación." },
      { status: 500 }
    );
  }
}
