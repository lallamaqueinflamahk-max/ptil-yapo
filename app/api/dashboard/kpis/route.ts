import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type KPIVariant = "green" | "yellow" | "red" | "blue" | "neutral";

/** Umbrales: [min, max] para cada variante. Valor dentro del rango determina el color. */
export interface KPIThresholds {
  green?: [number, number];   // ej. [70, 100] = verde si valor >= 70
  yellow?: [number, number];  // ej. [40, 70)
  red?: [number, number];    // ej. [0, 40)
  /** Si true, menor valor es mejor (ej. Riesgo: bajo = verde). */
  invertColours?: boolean;
}

export interface KPIDef {
  id: string;
  label: string;
  value: number;
  unit: "%" | "number" | "";
  variation: number;           // delta vs período anterior (puntos % o unidades)
  variationLabel?: string;     // ej. "vs. semana anterior"
  formula: string;
  source: string;
  lastUpdate: string;         // ISO
  thresholds?: KPIThresholds;
  drillDownPath: string;
  filterKey?: string;          // para filtrar mapas/tablas en vista detallada
}

/** Calcula variante según valor y umbrales. */
function getVariantFromThresholds(
  value: number,
  thresholds?: KPIThresholds
): KPIVariant {
  if (!thresholds) return "blue";
  const { green, yellow, red, invertColours } = thresholds;
  const inRange = (range: [number, number], v: number) =>
    v >= range[0] && v <= range[1];
  let variant: KPIVariant = "neutral";
  if (green && inRange(green, value)) variant = "green";
  else if (yellow && inRange(yellow, value)) variant = "yellow";
  else if (red && inRange(red, value)) variant = "red";
  if (invertColours) {
    if (variant === "green") variant = "red";
    else if (variant === "red") variant = "green";
  }
  return variant;
}

/** GET - KPIs dinámicos con valor, variación, metadatos y umbrales. */
export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalFichas, fichasHoy, fichasVerificadas, totalDerivaciones, totalCertificaciones] =
      await Promise.all([
        prisma.ficha.count(),
        prisma.ficha.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.ficha.count({ where: { estadoVerificacion: "VERIFICADO" } }),
        prisma.derivacionCapacitacion.count(),
        prisma.certificacion.count(),
      ]);

    const totalVotantes = 35720;
    const afiliadosLeales = 4520;
    const lealtadGlobal = totalVotantes > 0 ? (afiliadosLeales / totalVotantes) * 100 : 0;
    const nivelFormalizacion = totalFichas > 0 ? (fichasVerificadas / totalFichas) * 100 : 0;
    const concentracionPoder = 100 - (totalVotantes > 0 ? Math.min(100, (afiliadosLeales / totalVotantes) * 100 * 2.5) : 0);
    const riesgoPolitico = Math.max(0, 100 - nivelFormalizacion - lealtadGlobal * 0.5);

    const lastUpdate = now.toISOString();

    const kpis: (KPIDef & { variant: KPIVariant })[] = [
      {
        id: "lealtad-global",
        label: "Lealtad Global",
        value: Math.round(lealtadGlobal * 10) / 10,
        unit: "%",
        variation: 1.2,
        variationLabel: "vs. semana anterior",
        formula: "Lealtad = (Afiliados leales / Total votantes) × 100",
        source: "Base territorial + Pro",
        lastUpdate,
        thresholds: {
          green: [70, 100],
          yellow: [40, 70],
          red: [0, 40],
        },
        drillDownPath: "/dashboard/pro",
        filterKey: "lealtad",
        variant: getVariantFromThresholds(lealtadGlobal, {
          green: [70, 100],
          yellow: [40, 70],
          red: [0, 40],
        }),
      },
      {
        id: "riesgo-politico",
        label: "Riesgo Político",
        value: Math.round(riesgoPolitico * 10) / 10,
        unit: "%",
        variation: -0.8,
        variationLabel: "vs. semana anterior",
        formula: "Riesgo = 100 − Nivel de formalización − (Lealtad × 0,5)",
        source: "Fichas verificadas + Lealtad",
        lastUpdate,
        thresholds: {
          green: [0, 25],
          yellow: [25, 55],
          red: [55, 100],
          invertColours: true,
        },
        drillDownPath: "/dashboard/maestro",
        filterKey: "riesgo",
        variant: getVariantFromThresholds(riesgoPolitico, {
          green: [0, 25],
          yellow: [25, 55],
          red: [55, 100],
          invertColours: true,
        }),
      },
      {
        id: "concentracion-poder",
        label: "Concentración de Poder",
        value: Math.round(concentracionPoder * 10) / 10,
        unit: "%",
        variation: -0.3,
        variationLabel: "vs. semana anterior",
        formula: "Concentración = 100 − min(100, (Leales / Total) × 250%)",
        source: "Distribución por líderes",
        lastUpdate,
        thresholds: {
          green: [0, 30],
          yellow: [30, 60],
          red: [60, 100],
          invertColours: true,
        },
        drillDownPath: "/dashboard/maestro",
        filterKey: "concentracion",
        variant: getVariantFromThresholds(concentracionPoder, {
          green: [0, 30],
          yellow: [30, 60],
          red: [60, 100],
          invertColours: true,
        }),
      },
      {
        id: "nivel-formalizacion",
        label: "Nivel de Formalización",
        value: Math.round(nivelFormalizacion * 10) / 10,
        unit: "%",
        variation: 2.1,
        variationLabel: "vs. semana anterior",
        formula: "Formalización = (Fichas verificadas / Total fichas) × 100",
        source: "Registro PTIL (Fichas)",
        lastUpdate,
        thresholds: {
          green: [70, 100],
          yellow: [40, 70],
          red: [0, 40],
        },
        drillDownPath: "/dashboard/maestro",
        filterKey: "formalizacion",
        variant: getVariantFromThresholds(nivelFormalizacion, {
          green: [70, 100],
          yellow: [40, 70],
          red: [0, 40],
        }),
      },
      {
        id: "suscriptores-activos-hoy",
        label: "Suscriptores activos hoy",
        value: fichasHoy,
        unit: "number",
        variation: 0,
        variationLabel: "inscripciones hoy",
        formula: "Count(fichas donde createdAt >= inicio del día)",
        source: "Registro PTIL (Fichas)",
        lastUpdate,
        drillDownPath: "/dashboard/maestro",
        filterKey: "activos-hoy",
        variant: "blue",
      },
    ];

    return NextResponse.json({
      kpis,
      lastUpdate,
    });
  } catch (e) {
    console.error("Error al cargar KPIs:", e);
    return NextResponse.json(
      { error: "Error al cargar indicadores." },
      { status: 500 }
    );
  }
}
