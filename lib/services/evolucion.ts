/**
 * Servicio de serie temporal (evolución) para gráficos.
 * Hoy: mock. Con BD real: agregar por día desde tablas de hechos (validados, leales, verificados).
 */

import { getDataSource } from "@/lib/config/territory";

export interface PuntoEvolucion {
  fecha: string;
  etiqueta: string;
  validados: number;
  leales?: number;
  verificados?: number;
  derivaciones?: number;
  [key: string]: number | string | undefined;
}

function generarSerieMock(dias: number, filter?: string | null): PuntoEvolucion[] {
  const now = new Date();
  const points: PuntoEvolucion[] = [];
  const step = dias === 30 ? 1 : dias === 60 ? 2 : 3;
  let baseValidados = 32000;
  let baseLeales = 4000;
  let baseVerificados = 28000;
  let baseDerivaciones = 120;

  for (let i = dias; i >= 0; i -= step) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfYear =
      (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000);
    const variacion = Math.sin(dayOfYear / 30) * 200 + (dias - i) * 8;
    const v = Math.max(
      0,
      Math.round(baseValidados + variacion + (i === 0 ? 0 : (dias - i) * 5))
    );
    const le = Math.round(baseLeales + variacion * 0.4 + (dias - i) * 2);
    const ver = Math.round(baseVerificados + variacion * 0.9);
    const der = Math.max(0, Math.round(baseDerivaciones + (dias - i) * 0.5));

    points.push({
      fecha: d.toISOString().slice(0, 10),
      etiqueta: d.toLocaleDateString("es-PY", { day: "2-digit", month: "short" }),
      validados: v,
      leales: le,
      verificados: ver,
      derivaciones: der,
    });
  }

  if (filter) {
    return points.map((p) => ({
      ...p,
      validados: Math.round((p.validados as number) * (0.3 + Math.random() * 0.5)),
      leales: p.leales ? Math.round((p.leales as number) * (0.4 + Math.random() * 0.4)) : undefined,
    }));
  }
  return points;
}

/**
 * Obtiene la serie de evolución para los últimos N días.
 * Con DATA_SOURCE=db: agregar por día desde BD (validados, leales, verificados, derivaciones).
 */
export async function getSerieEvolucion(
  dias: 30 | 60 | 90,
  filter?: string | null
): Promise<{ serie: PuntoEvolucion[]; lastUpdated: string }> {
  if (getDataSource() === "db") {
    // TODO: agregar por fecha desde Prisma; filter = seccional o ranking para filtrar
  }
  const serie = generarSerieMock(dias, filter ?? undefined);
  return { serie, lastUpdated: new Date().toISOString() };
}
