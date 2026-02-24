/**
 * GET - Fichas asignadas a este Operador YAPÓ (para dictamen).
 * Query: cedulaOperador (obligatorio).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DICTAMEN_LABELS: Record<string, string> = {
  APROBADO: "Aprobado",
  APROBADO_OBSERVACION: "Aprobado/Observación – Falta equipo",
  RECHAZADO: "Rechazado",
  DERIVAR_CAPACITACION: "Derivado a capacitación",
};

export async function GET(request: NextRequest) {
  try {
    const cedulaOperador = request.nextUrl.searchParams.get("cedulaOperador")?.trim();
    if (!cedulaOperador) {
      return NextResponse.json(
        { error: "Faltó el parámetro cedulaOperador." },
        { status: 400 }
      );
    }

    const fichas = await prisma.ficha.findMany({
      where: { asignadoOperadorCedula: cedulaOperador },
      orderBy: { asignadoAt: "desc" },
      select: {
        id: true,
        nombreCompleto: true,
        oficioPrincipal: true,
        whatsapp: true,
        estadoVerificacion: true,
        dictamenOperador: true,
        dictamenAt: true,
        evidenciaFaltaEquipo: true,
        asignadoAt: true,
      },
    });

    const listado = fichas.map((f) => ({
      id: f.id,
      nombreTrabajador: f.nombreCompleto,
      oficio: f.oficioPrincipal,
      whatsapp: f.whatsapp,
      estado: f.dictamenOperador
        ? (f.dictamenOperador.toLowerCase() as "aprobado" | "aprobado_observacion" | "rechazado" | "derivar_capacitacion")
        : "pendiente",
      dictamenLabel: f.dictamenOperador ? DICTAMEN_LABELS[f.dictamenOperador] ?? f.dictamenOperador : null,
      fechaRegistro: f.asignadoAt ? formatFecha(f.asignadoAt) : null,
      evidenciaFaltaEquipo: f.evidenciaFaltaEquipo ?? false,
    }));

    const pendientes = listado.filter((x) => x.estado === "pendiente");
    const conDictamen = listado.filter((x) => x.estado !== "pendiente");

    return NextResponse.json({
      validaciones: listado,
      pendientes,
      conDictamen,
      total: listado.length,
    });
  } catch (e) {
    console.error("Error al listar mis validaciones:", e);
    return NextResponse.json(
      { error: "Error al cargar validaciones." },
      { status: 500 }
    );
  }
}

function formatFecha(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `Hoy ${d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hoy ${d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}`;
  const days = Math.floor(h / 24);
  if (days === 1) return `Ayer ${d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("es-PY");
}
