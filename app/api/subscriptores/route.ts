import { NextRequest, NextResponse } from "next/server";
import { crearFicha } from "@/lib/db/crearFicha";
import type { FormDataLike, GpsCoords } from "@/lib/utils/buildSubscriptor";

type GpsPair = { lat: number; lng: number };
type Body = FormDataLike & {
  gpsCoords: GpsPair | null;
  gpsCasa?: GpsPair | null;
  gpsLaburo?: GpsPair | null;
};

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
      gpsCasa,
      gpsLaburo,
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
    const gpsCasaNorm: GpsCoords | null =
      gpsCasa && typeof gpsCasa.lat === "number" && typeof gpsCasa.lng === "number"
        ? { lat: gpsCasa.lat, lng: gpsCasa.lng }
        : null;
    const gpsLaburoNorm: GpsCoords | null =
      gpsLaburo && typeof gpsLaburo.lat === "number" && typeof gpsLaburo.lng === "number"
        ? { lat: gpsLaburo.lat, lng: gpsLaburo.lng }
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
      promotor: promotor ?? "Juan Referente",
      gestorZona: gestorZona ?? "",
      cargoGestor: cargoGestor ?? "",
      seccionalNro: seccionalNro ?? "",
      cedulaOperador: cedulaOperador ?? "",
      gpsCoords: gps,
      gpsCasa: gpsCasaNorm,
      gpsLaburo: gpsLaburoNorm,
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

    const err = e as Error & { code?: string };
    let message = "No se pudo guardar la inscripción. Reintentá más tarde.";

    if (err?.code === "P2002") {
      message = "Ya existe una inscripción con esa cédula o código. Usá otra cédula o consultá tu estado con el código que te enviamos.";
    } else if (err?.code === "P2003" || err?.message?.includes("foreign key")) {
      message = "Error de referencia en la base de datos. Revisá los datos e intentá de nuevo.";
    } else if (err?.message?.includes("Could not connect") || err?.message?.includes("SQLITE_CANTOPEN") || err?.message?.includes("ENOENT")) {
      message = "No se pudo conectar a la base de datos. En local ejecutá: npm run db:push y revisá que DATABASE_URL esté en .env (ej. file:./dev.db).";
    } else if (process.env.NODE_ENV === "development" && err?.message) {
      message = `Error al guardar: ${err.message.slice(0, 120)}`;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
