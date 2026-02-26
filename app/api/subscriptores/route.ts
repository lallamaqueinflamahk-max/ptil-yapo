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
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    const isPayloadTooLarge =
      msg.includes("body") && (msg.includes("limit") || msg.includes("size") || msg.includes("413"));
    const isInvalidJson = msg.includes("JSON") || msg.includes("parse") || msg.includes("Unexpected");
    const errorMessage = isPayloadTooLarge
      ? "La foto pesa demasiado. Sacá otra selfie más simple (solo vos y la herramienta, fondo claro) y reintentá."
      : isInvalidJson
        ? "Datos inválidos. Revisá el formulario e intentá de nuevo."
        : "No se pudo procesar la solicitud. Reintentá más tarde.";
    const status = isPayloadTooLarge ? 413 : 400;
    return NextResponse.json({ error: errorMessage }, { status });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Datos inválidos. Revisá el formulario e intentá de nuevo." },
      { status: 400 }
    );
  }

  // En producción, solo avisar si DATABASE_URL está vacío o claramente inválido.
  if (process.env.NODE_ENV === "production") {
    const dbUrl = process.env.DATABASE_URL?.trim() || "";
    if (dbUrl.length < 15) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL no está configurada en Vercel. Settings → Environment Variables → Key: DATABASE_URL (escrito a mano) → Value: tu URL de Neon (postgresql://...) → Save → Redeploy.",
        },
        { status: 503 }
      );
    }
  }

  try {
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
    const errMsg = (err?.message ?? "").toLowerCase();
    let message = "No se pudo guardar la inscripción. Reintentá más tarde.";

    if (err?.code === "P2002") {
      message = "Ya existe una inscripción con esa cédula o código. Usá otra cédula o consultá tu estado con el código que te enviamos.";
    } else if (err?.code === "P2003" || errMsg.includes("foreign key")) {
      message = "Error de referencia en la base de datos. Revisá los datos e intentá de nuevo.";
    } else if (
      err?.code === "P1001" ||
      err?.code === "P1002" ||
      err?.code === "P1003" ||
      err?.code === "P1017" ||
      errMsg.includes("could not connect") ||
      errMsg.includes("sqlite_cantopen") ||
      errMsg.includes("enoent") ||
      errMsg.includes("econnrefused") ||
      errMsg.includes("connection refused") ||
      errMsg.includes("can't reach database") ||
      errMsg.includes("timed out") ||
      errMsg.includes("authentication failed") ||
      errMsg.includes("invalid prisma") ||
      errMsg.includes("engine") ||
      errMsg.includes("schema") ||
      errMsg.includes("database")
    ) {
      message =
        "No se pudo conectar a la base de datos. Seguí docs/NEON-SETUP.md y agregá DATABASE_URL en Vercel → Settings → Environment Variables.";
    } else if (
      errMsg.includes("relation") ||
      (errMsg.includes("does not exist") && errMsg.includes("ficha"))
    ) {
      message =
        "Las tablas no existen en Neon. En la carpeta del proyecto ejecutá: npx prisma db push (con DATABASE_URL de Neon en .env). Luego probá de nuevo.";
    } else if (process.env.NODE_ENV === "development" && (err as Error)?.message) {
      message = `Error al guardar: ${((err as Error).message).slice(0, 120)}`;
    } else if (process.env.NODE_ENV === "production") {
      message =
        "No se pudo guardar. Revisá en Vercel que DATABASE_URL esté configurado (base de datos en la nube, ej. Neon o Supabase).";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
