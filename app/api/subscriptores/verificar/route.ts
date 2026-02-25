import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEstadoIdoneidad } from "@/lib/idoneidad/clasificacion";

/**
 * Consulta pública: el subscriptor ingresa su código de verificación
 * y ve el estado de su ficha y su estado de idoneidad laboral.
 */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo")?.trim().toUpperCase();
  if (!codigo) {
    return NextResponse.json(
      { error: "Faltó el código de verificación. Ej: ?codigo=ABC12XYZ" },
      { status: 400 }
    );
  }

  try {
    const ficha = await prisma.ficha.findUnique({
      where: { codigoVerificacion: codigo },
      include: {
        derivacion: true,
        certificaciones: { take: 1 },
      },
    });

    if (!ficha) {
      return NextResponse.json(
        { error: "No encontramos ninguna inscripción con ese código." },
        { status: 404 }
      );
    }

    const tieneCertificacion = (ficha.certificaciones?.length ?? 0) > 0;
    const derivadoACapacitacion = !!ficha.derivacion;
    const derivacionCompletada = ficha.derivacion?.estado === "COMPLETADO";

    const estadoIdoneidad = getEstadoIdoneidad(ficha.clasificacionAutomatica, {
      tieneCertificacion,
      derivadoACapacitacion,
      derivacionCompletada,
    });

    const mensajeVerificacion =
      ficha.estadoVerificacion === "PENDIENTE"
        ? "Tu inscripción está en proceso de verificación."
        : ficha.estadoVerificacion === "VERIFICADO"
          ? "Tu ficha fue verificada."
          : "Tu ficha ya fue traspasada a YAPÓ.";

    const payload: Record<string, unknown> = {
      ok: true,
      codigoVerificacion: ficha.codigoVerificacion,
      estadoVerificacion: ficha.estadoVerificacion,
      nombre: ficha.nombreCompleto,
      fechaInscripcion: ficha.createdAt.toISOString().slice(0, 10),
      mensaje: mensajeVerificacion,
      estadoIdoneidad,
      grupo: ficha.clasificacionAutomatica,
      tieneCertificacion,
      derivadoACapacitacion,
    };
    // Para carnet de trabajador YAPÓ certificado (solo si está VERIFICADO)
    if (ficha.estadoVerificacion === "VERIFICADO") {
      payload.carnet = {
        nombreCompleto: ficha.nombreCompleto,
        cedulaNro: ficha.cedulaNro,
        oficioPrincipal: ficha.oficioPrincipal,
        selfieDataUrl: ficha.selfieDataUrl,
        codigoVerificacion: ficha.codigoVerificacion,
        fechaInscripcion: ficha.createdAt.toISOString().slice(0, 10),
      };
    }
    return NextResponse.json(payload);
  } catch (e) {
    console.error("Error al verificar código:", e);
    return NextResponse.json(
      { error: "Error al consultar. Reintentá más tarde." },
      { status: 500 }
    );
  }
}
