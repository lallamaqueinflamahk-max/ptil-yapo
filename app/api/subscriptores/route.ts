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
  // #region agent log
  try {
    await fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" }, body: JSON.stringify({ sessionId: "a4fa08", location: "api/subscriptores/route.ts:POST", message: "API entry", data: {}, hypothesisId: "H3", timestamp: Date.now() }) }).catch(() => {});
  } catch (_) {}
  // #endregion
  try {
    const body = (await request.json()) as Body;
    // #region agent log
    try {
      await fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" }, body: JSON.stringify({ sessionId: "a4fa08", location: "api/subscriptores/route.ts:afterJson", message: "request.json done", data: { keys: Object.keys(body) }, hypothesisId: "H3", timestamp: Date.now() }) }).catch(() => {});
    } catch (_) {}
    // #endregion
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

    // #region agent log
    try {
      await fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" }, body: JSON.stringify({ sessionId: "a4fa08", location: "api/subscriptores/route.ts:beforeCrearFicha", message: "before crearFicha", data: {}, hypothesisId: "H4", timestamp: Date.now() }) }).catch(() => {});
    } catch (_) {}
    // #endregion
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
      gpsCasa: gpsCasaNorm,
      gpsLaburo: gpsLaburoNorm,
    });

    // #region agent log
    try {
      await fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" }, body: JSON.stringify({ sessionId: "a4fa08", location: "api/subscriptores/route.ts:afterCrearFicha", message: "crearFicha success", data: { id: result.id }, hypothesisId: "H4", timestamp: Date.now() }) }).catch(() => {});
    } catch (_) {}
    // #endregion
    return NextResponse.json({
      ok: true,
      codigoVerificacion: result.codigoVerificacion,
      codigoSeguridad: result.codigoSeguridad,
      estadoVerificacion: result.estadoVerificacion,
      mensaje: "Inscripción registrada. Guardá tu código de verificación para consultar el estado.",
    });
  } catch (e) {
    // #region agent log
    try {
      await fetch("http://127.0.0.1:7245/ingest/039a586b-016e-41a6-bbd7-7d228a8b81c8", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4fa08" }, body: JSON.stringify({ sessionId: "a4fa08", location: "api/subscriptores/route.ts:catch", message: "API catch", data: { errName: (e as Error)?.name, errMessage: (e as Error)?.message }, hypothesisId: "H3,H4", timestamp: Date.now() }) }).catch(() => {});
    } catch (_) {}
    // #endregion
    console.error("Error al crear ficha:", e);
    return NextResponse.json(
      { error: "No se pudo guardar la inscripción. Reintentá más tarde." },
      { status: 500 }
    );
  }
}
