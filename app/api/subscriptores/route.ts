import { NextRequest, NextResponse } from "next/server";
import { crearFicha } from "@/lib/db/crearFicha";
import type { FormDataLike, GpsCoords } from "@/lib/utils/buildSubscriptor";

type Body = FormDataLike & { gpsCoords: { lat: number; lng: number } | null };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const {
      nombreCompleto,
      cedula,
      whatsapp,
      email,
      facebook,
      instagram,
      oficioPrincipal,
      oficioSecundario,
      anosExperiencia,
      nivelEstudios,
      situacion,
      seguroSocial,
      selfieDataUrl,
      promotor,
      gestorZona,
      cargoGestor,
      seccionalNro,
      cedulaOperador,
      gpsCoords,
    } = body;

    if (!nombreCompleto?.trim() || !cedula?.trim() || !whatsapp?.trim() || !oficioPrincipal?.trim()) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, cédula, whatsapp, oficio principal." },
        { status: 400 }
      );
    }

    const gps: GpsCoords | null =
      gpsCoords && typeof gpsCoords.lat === "number" && typeof gpsCoords.lng === "number"
        ? { lat: gpsCoords.lat, lng: gpsCoords.lng }
        : null;

    const result = await crearFicha({
      nombreCompleto,
      cedula,
      whatsapp,
      email: email ?? "",
      facebook: facebook ?? "",
      instagram: instagram ?? "",
      oficioPrincipal,
      oficioSecundario: oficioSecundario ?? "",
      anosExperiencia: anosExperiencia ?? "",
      nivelEstudios: nivelEstudios ?? "Otros",
      situacion: situacion ?? "Independiente",
      seguroSocial: seguroSocial ?? false,
      selfieDataUrl: selfieDataUrl ?? null,
      promotor: promotor ?? "Miguel Sosa",
      gestorZona: gestorZona ?? "",
      cargoGestor: cargoGestor ?? "",
      seccionalNro: seccionalNro ?? "",
      cedulaOperador: cedulaOperador ?? "",
      gpsCoords: gps,
    });

    return NextResponse.json({
      ok: true,
      codigoVerificacion: result.codigoVerificacion,
      codigoSeguridad: result.codigoSeguridad,
      estadoVerificacion: result.estadoVerificacion,
      mensaje: "Inscripción registrada. Guardá tu código de verificación para consultar el estado.",
    });
  } catch (e) {
    console.error("Error al crear ficha:", e);
    return NextResponse.json(
      { error: "No se pudo guardar la inscripción. Reintentá más tarde." },
      { status: 500 }
    );
  }
}
