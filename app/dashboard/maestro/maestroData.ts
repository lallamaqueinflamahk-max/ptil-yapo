/**
 * Derivación de datos para el dashboard maestro.
 * En módulo .ts para evitar problemas de parsing en el componente.
 */

import type { HeatmapPoint } from "@/components/MapaCalorAsuncion";
import type { SeccionalRow } from "@/components/dashboard/ControlSeccionales";
import type { SeccionalMapa } from "@/components/dashboard/MapaInteractivoAvanzado";

export function buildDefaultHeatmap(): HeatmapPoint[] {
  const out: HeatmapPoint[] = [];
  for (let i = 0; i < 45; i++) {
    out.push({
      id: i + 1,
      lat: -25.2637 + Math.sin((i / 45) * Math.PI * 2) * 0.04,
      lng: -57.5759 + Math.cos((i / 45) * Math.PI * 2) * 0.04,
      cantidad: 400 + (i * 37) % 1200,
      color: i === 0 ? "#DC2626" : "#1E3A8A",
    });
  }
  return out;
}

export function buildPuntosCalor(
  heatmapPoints: HeatmapPoint[]
): Array<{ id: number; lat: number; lng: number; cantidad: number; color: string; label?: string }> {
  const out: Array<{ id: number; lat: number; lng: number; cantidad: number; color: string; label?: string }> = [];
  for (const p of heatmapPoints) {
    out.push({ id: p.id, lat: p.lat, lng: p.lng, cantidad: p.cantidad, color: p.color, label: p.label });
  }
  return out;
}

export function buildSeccionalesMapa(
  listado: SeccionalRow[]
): Array<{ id: string; numero: number; nombre: string; lat: number; lng: number; rangoId: string }> {
  const out: Array<{ id: string; numero: number; nombre: string; lat: number; lng: number; rangoId: string }> = [];
  for (const s of listado) {
    out.push({ id: s.id, numero: s.numero, nombre: s.nombre, lat: s.lat, lng: s.lng, rangoId: s.rangoId });
  }
  return out;
}

export function buildSeccionalesParaMapaAvanzado(listado: SeccionalRow[]): SeccionalMapa[] {
  const out: SeccionalMapa[] = [];
  for (const s of listado) {
    out.push({
      id: s.id,
      numero: s.numero,
      nombre: s.nombre,
      barrio: s.barrio,
      titular: s.titular,
      lat: s.lat,
      lng: s.lng,
      cantidadValidados: s.cantidadValidados,
      estado: s.estado ?? "green",
      estadoLabel: s.estadoLabel ?? "En rango esperado",
      rangoId: s.rangoId,
    });
  }
  return out;
}

export function buildDonutLealesData(
  lealesPorLideres: Array<{ nombre: string; valor: number; color: string }>
): Array<{ name: string; value: number; color: string }> {
  const out: Array<{ name: string; value: number; color: string }> = [];
  for (const d of lealesPorLideres) {
    out.push({ name: d.nombre, value: d.valor, color: d.color });
  }
  return out;
}

export type TablaSeccionalConSpark = SeccionalRow & {
  validados: number;
  sparkline: Array<{ valor: number }>;
};

export function buildTablaSeccionalesConSpark(
  listado: SeccionalRow[],
  limit: number
): TablaSeccionalConSpark[] {
  const result: TablaSeccionalConSpark[] = [];
  const slice = listado.slice(0, limit);
  for (const s of slice) {
    const base = s.cantidadValidados ?? 0;
    const sparkline: Array<{ valor: number }> = [];
    for (let i = 0; i < 10; i++) {
      sparkline.push({
        valor: Math.max(0, base - (10 - i) * 20 + (i * 7) % 50),
      });
    }
    result.push({
      ...s,
      nombre: s.nombre,
      barrio: s.barrio,
      validados: base,
      sparkline,
    });
  }
  return result;
}
