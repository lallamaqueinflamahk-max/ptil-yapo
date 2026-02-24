/**
 * Servicio de detalle por seccional (panel del mapa).
 * Hoy: mock. Con BD real: leer Seccional + KPIs agregados + alertas por seccional.
 */

import { SECCIONALES, getHeatmapPointsFromSeccionales } from "@/lib/data/seccionales2026";
import type { RangoId } from "@/lib/data/seccionales2026";
import { getDataSource } from "@/lib/config/territory";
import type {
  DetalleSeccional,
  KpiLocal,
  PuntoEvolucionLocal,
  AlertaActiva,
  SemáforoEstado,
} from "@/lib/types/dashboard";

function getKpisYEvolution(numero: number): { kpis: KpiLocal[]; evolucion: PuntoEvolucionLocal[] } {
  const base = 400 + ((numero * 31) % 1200);
  const lealtad = 40 + (numero % 35);
  const formalizacion = 50 + (numero % 40);
  const riesgo = Math.max(0, 100 - formalizacion - lealtad * 0.5);
  const kpis: KpiLocal[] = [
    { id: "validados", label: "Suscriptores validados", value: base, unit: "", tendencia: "up" },
    {
      id: "lealtad",
      label: "Lealtad (%)",
      value: Math.round(lealtad * 10) / 10,
      unit: "%",
      tendencia: numero % 3 === 0 ? "down" : "up",
    },
    {
      id: "formalizacion",
      label: "Formalización (%)",
      value: Math.round(formalizacion * 10) / 10,
      unit: "%",
      tendencia: "up",
    },
    {
      id: "riesgo",
      label: "Riesgo (%)",
      value: Math.round(riesgo * 10) / 10,
      unit: "%",
      tendencia: riesgo > 40 ? "up" : "down",
    },
  ];
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const evolucion: PuntoEvolucionLocal[] = meses.map((etiqueta, i) => ({
    fecha: `2026-${String(i + 1).padStart(2, "0")}-01`,
    valor: Math.round(base * (0.6 + (i / meses.length) * 0.5) + (i * 20)),
    etiqueta,
  }));
  return { kpis, evolucion };
}

function getEstado(
  numero: number,
  cantidadValidados: number
): { estado: SemáforoEstado; label: string } {
  const { kpis } = getKpisYEvolution(numero);
  const lealtad = kpis.find((k) => k.id === "lealtad")?.value ?? 50;
  const riesgo = kpis.find((k) => k.id === "riesgo")?.value ?? 30;
  const formalizacion = kpis.find((k) => k.id === "formalizacion")?.value ?? 60;
  if (riesgo > 55 || lealtad < 35 || formalizacion < 40) {
    return { estado: "red", label: "Requiere atención prioritaria" };
  }
  if (riesgo > 35 || lealtad < 50 || formalizacion < 60) {
    return { estado: "yellow", label: "Atención recomendada" };
  }
  return { estado: "green", label: "En rango esperado" };
}

function getAlertasMock(numero: number): AlertaActiva[] {
  const alertas: AlertaActiva[] = [];
  if (numero % 5 === 0) {
    alertas.push({
      id: `alt-${numero}-1`,
      tipo: "Verificación",
      mensaje: "Alto porcentaje de fichas pendientes de verificación",
      severidad: "alta",
      fecha: new Date().toISOString(),
    });
  }
  if (numero % 7 === 0) {
    alertas.push({
      id: `alt-${numero}-2`,
      tipo: "Capacitación",
      mensaje: "Derivaciones sin dictamen hace más de 7 días",
      severidad: "media",
      fecha: new Date().toISOString(),
    });
  }
  if (numero % 3 === 0 && numero % 5 !== 0) {
    alertas.push({
      id: `alt-${numero}-3`,
      tipo: "Lealtad",
      mensaje: "Lealtad por debajo del promedio territorial",
      severidad: "baja",
      fecha: new Date().toISOString(),
    });
  }
  return alertas;
}

/**
 * Obtiene el detalle de una seccional por número.
 * Con DATA_SOURCE=db: prisma.seccional.findUnique + agregados de KPIs y alertas.
 */
export async function getDetalleSeccional(
  numero: number
): Promise<DetalleSeccional | null> {
  if (getDataSource() === "db") {
    // TODO: const row = await prisma.seccional.findUnique({ where: { numero }, include: ... });
  }

  const row = SECCIONALES.find((s) => s.seccional_nro === numero);
  if (!row) return null;

  const heatmap = getHeatmapPointsFromSeccionales();
  const pt =
    heatmap.find((p) => p.label.includes(row.barrio_jurisdiccion)) ?? heatmap[numero - 1];
  const cantidadValidados = pt?.cantidad ?? 400 + ((numero * 31) % 1200);
  const { kpis, evolucion } = getKpisYEvolution(numero);
  const { estado, label: estadoLabel } = getEstado(numero, cantidadValidados);
  const alertasActivas = getAlertasMock(numero);
  const titularWhatsApp =
    row.seccional_nro > 0
      ? `595981${String(row.seccional_nro).padStart(3, "0").slice(-3)}`
      : null;

  return {
    numero: row.seccional_nro,
    nombre: `Seccional ${row.seccional_nro}`,
    barrio: row.barrio_jurisdiccion.replace(/_/g, " "),
    titular: row.nombre_titular,
    titularWhatsApp: titularWhatsApp ?? undefined,
    rangoId: row.rango_id,
    lat: row.lat,
    lng: row.lng,
    estado,
    estadoLabel,
    kpisLocales: kpis,
    evolucion,
    alertasActivas,
    lastUpdated: new Date().toISOString(),
  };
}
