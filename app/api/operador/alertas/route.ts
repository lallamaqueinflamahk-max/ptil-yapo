/**
 * GET - Alertas geofencing: fichas PENDIENTE sin asignar (para que Operadores YAPÓ tomen verificación).
 * Query: cedula (opcional) - si se pasa, se busca el Operador y se filtra por su seccionalNro.
 * Query: seccional (opcional) - filtra por seccionalNro de la ficha (alternativa directa).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cedula = request.nextUrl.searchParams.get("cedula")?.trim() || null;
    let seccional = request.nextUrl.searchParams.get("seccional")?.trim() || null;

    if (cedula && !seccional) {
      const operador = await prisma.operador.findUnique({
        where: { cedula },
      });
      if (operador) seccional = operador.seccionalNro;
    }

    const where = {
      estadoVerificacion: "PENDIENTE",
      asignadoOperadorCedula: null,
      ...(seccional ? { seccionalNro: seccional } : {}),
    };

    const fichas = await prisma.ficha.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombreCompleto: true,
        oficioPrincipal: true,
        whatsapp: true,
        createdAt: true,
        seccionalNro: true,
        gestorZona: true,
        gpsLat: true,
        gpsLng: true,
      },
    });

    const listado = fichas.map((f) => ({
      id: f.id,
      nombreTrabajador: f.nombreCompleto,
      oficio: f.oficioPrincipal,
      whatsapp: f.whatsapp,
      fechaRegistro: formatFechaRelativa(f.createdAt),
      seccionalNro: f.seccionalNro,
      gestorZona: f.gestorZona,
      gpsLat: f.gpsLat,
      gpsLng: f.gpsLng,
    }));

    return NextResponse.json({ alertas: listado, total: listado.length });
  } catch (e) {
    console.error("Error al listar alertas operador:", e);
    return NextResponse.json(
      { error: "Error al cargar alertas." },
      { status: 500 }
    );
  }
}

function formatFechaRelativa(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Hace un momento";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return d.toLocaleDateString("es-PY");
}
