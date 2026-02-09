/**
 * Base de datos aglomerada 2026 - Seccionales Honor Colorado (Asunción).
 * Taxonomía YAPÓ: R1 (Estratégico), R2 (Operativo), R3 (Base).
 */

export type RangoId = "R1" | "R2" | "R3";

export interface SeccionalRow {
  seccional_nro: number;
  barrio_jurisdiccion: string;
  nombre_titular: string;
  rango_id: RangoId;
  categoria_yapo: string;
  vinculo_institucional: string;
  /** Coordenadas aproximadas para mapa (Asunción) */
  lat: number;
  lng: number;
}

export const ORGANIZACION = "ANR - Honor Colorado 2026";
export const CIRCUNSCRIPCION = "Capital (Asunción)";
export const TOTAL_SECCIONALES = 45;

export const LIDERAZGO_CENTRAL = {
  consejo_presidentes: "Víctor Fernández",
  intendencia: "Luis Bello",
};

export const TIPIFICACION_RANGOS = [
  { rango: 1, id: "R1" as const, desc: "Autoridades Electas (Toma de Decisiones)" },
  { rango: 2, id: "R2" as const, desc: "Presidentes de Seccional (Control Territorial)" },
  { rango: 3, id: "R3" as const, desc: "Miembros y Convencionales (Ejecución de Base)" },
];

/** Colores por rango para mapa de calor */
export const COLORES_POR_RANGO: Record<RangoId, { fill: string; border: string }> = {
  R1: { fill: "#DC2626", border: "#991B1B" },   // rojo (estratégico)
  R2: { fill: "#1E3A8A", border: "#1E40AF" },   // azul (operativo)
  R3: { fill: "#059669", border: "#047857" },   // verde (base)
};

/** Centro aproximado de Asunción para distribuir seccionales sin coordenadas exactas */
const CENTRO = { lat: -25.2637, lng: -57.5759 };

const SECCIONALES_2026: SeccionalRow[] = [
  { seccional_nro: 0, barrio_jurisdiccion: "Asuncion_Global", nombre_titular: "Luis Bello", rango_id: "R1", categoria_yapo: "Lider_Ejecutivo", vinculo_institucional: "Intendente_Municipal", lat: CENTRO.lat, lng: CENTRO.lng },
  { seccional_nro: 0, barrio_jurisdiccion: "Asuncion_Global", nombre_titular: "Arturo Almirón", rango_id: "R1", categoria_yapo: "Lider_Legislativo", vinculo_institucional: "Presidente_Junta_Municipal", lat: CENTRO.lat + 0.002, lng: CENTRO.lng },
  { seccional_nro: 23, barrio_jurisdiccion: "Zeballos_Cue", nombre_titular: "Víctor Fernández", rango_id: "R2", categoria_yapo: "Presidente_Consejo", vinculo_institucional: "Lider_Operativo_Capital", lat: -25.272, lng: -57.558 },
  { seccional_nro: 4, barrio_jurisdiccion: "La_Encarnacion", nombre_titular: "Jorge Turi Cappello", rango_id: "R2", categoria_yapo: "Estratega_Base", vinculo_institucional: "Referente_HC", lat: -25.268, lng: -57.582 },
  { seccional_nro: 1, barrio_jurisdiccion: "Centro_Catedral", nombre_titular: "Maximiliano Ayala", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Presidente_Seccional", lat: -25.266, lng: -57.575 },
  { seccional_nro: 19, barrio_jurisdiccion: "Sajonia", nombre_titular: "Rosanna Rolón", rango_id: "R2", categoria_yapo: "Enlace_Legislativo", vinculo_institucional: "Concejal_Asuncion", lat: -25.278, lng: -57.565 },
  { seccional_nro: 43, barrio_jurisdiccion: "Trinidad", nombre_titular: "Luis Bello", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Intendente_Municipal", lat: -25.255, lng: -57.592 },
  { seccional_nro: 45, barrio_jurisdiccion: "Terminal_Hipodromo", nombre_titular: "Javier Pintos", rango_id: "R2", categoria_yapo: "Enlace_Legislativo", vinculo_institucional: "Concejal_Asuncion", lat: -25.282, lng: -57.578 },
  { seccional_nro: 12, barrio_jurisdiccion: "Barrio_Obrero", nombre_titular: "María Nene Alvarenga", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Presidente_Seccional", lat: -25.275, lng: -57.572 },
  { seccional_nro: 15, barrio_jurisdiccion: "Roberto_L_Petit", nombre_titular: "Nelson Mora (Padre)", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Referente_HC", lat: -25.271, lng: -57.568 },
  { seccional_nro: 5, barrio_jurisdiccion: "Gral_Diaz", nombre_titular: "José Pepe Alvarenga", rango_id: "R2", categoria_yapo: "Operador_Estrategico", vinculo_institucional: "Ex_Concejal", lat: -25.269, lng: -57.588 },
  { seccional_nro: 7, barrio_jurisdiccion: "Pinoza", nombre_titular: "Enrique Berni", rango_id: "R2", categoria_yapo: "Enlace_Juridico", vinculo_institucional: "Miembro_CM_Concejal", lat: -25.277, lng: -57.562 },
  { seccional_nro: 18, barrio_jurisdiccion: "Barrio_Obrero_Sur", nombre_titular: "Miguel Sosa", rango_id: "R2", categoria_yapo: "Enlace_Legislativo", vinculo_institucional: "Concejal_Asuncion", lat: -25.276, lng: -57.574 },
  { seccional_nro: 21, barrio_jurisdiccion: "Santa_Ana", nombre_titular: "Daniel Centurión", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Diputado_Pacto_Unidad", lat: -25.273, lng: -57.555 },
  { seccional_nro: 32, barrio_jurisdiccion: "San_Pablo", nombre_titular: "Pedro Benítez", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Presidente_Seccional", lat: -25.258, lng: -57.568 },
  { seccional_nro: 2, barrio_jurisdiccion: "Dr_Francia", nombre_titular: "María Maura Aranda", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Presidente_Seccional", lat: -25.265, lng: -57.578 },
  { seccional_nro: 3, barrio_jurisdiccion: "San_Roque", nombre_titular: "Ángel Florentín Peña", rango_id: "R2", categoria_yapo: "Control_Territorial", vinculo_institucional: "Presidente_Seccional", lat: -25.267, lng: -57.571 },
];

/** Mapa de filas conocidas por número de seccional (solo nros > 0) */
const POR_NRO = new Map<number, SeccionalRow>();
SECCIONALES_2026.filter((s) => s.seccional_nro > 0).forEach((s) => POR_NRO.set(s.seccional_nro, s));

/** Una fila por seccional 1..45 para dashboard y mapa */
function completarSeccionales(): SeccionalRow[] {
  const out: SeccionalRow[] = [];
  for (let n = 1; n <= TOTAL_SECCIONALES; n++) {
    const known = POR_NRO.get(n);
    if (known) {
      out.push(known);
      continue;
    }
    const angle = (n / TOTAL_SECCIONALES) * Math.PI * 2;
    out.push({
      seccional_nro: n,
      barrio_jurisdiccion: `Seccional_${n}`,
      nombre_titular: `Presidente ${n}`,
      rango_id: "R2",
      categoria_yapo: "Control_Territorial",
      vinculo_institucional: "Presidente_Seccional",
      lat: CENTRO.lat + Math.sin(angle) * 0.04,
      lng: CENTRO.lng + Math.cos(angle) * 0.04,
    });
  }
  return out;
}

export const SECCIONALES = completarSeccionales();

/** Obtener puntos para mapa de calor con cantidad (validados) y color por rango */
export function getHeatmapPointsFromSeccionales(
  validadosPorSeccional: Record<number, number> = {}
): Array<{ id: number; lat: number; lng: number; cantidad: number; rangoId: RangoId; color: string; label: string }> {
  return SECCIONALES.map((row, i) => {
    const cantidad = validadosPorSeccional[row.seccional_nro] ?? 400 + ((row.seccional_nro * 31) % 1200);
    const { fill } = COLORES_POR_RANGO[row.rango_id];
    return {
      id: i + 1,
      lat: row.lat,
      lng: row.lng,
      cantidad,
      rangoId: row.rango_id,
      color: fill,
      label: `${row.barrio_jurisdiccion.replace(/_/g, " ")} - ${row.nombre_titular}`,
    };
  });
}
