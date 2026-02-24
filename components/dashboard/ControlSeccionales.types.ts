export type RangoId = "R1" | "R2" | "R3";

export interface SeccionalRow {
  id: string;
  numero: number;
  nombre: string;
  barrio: string;
  titular: string;
  rangoId: RangoId;
  activo: boolean;
  cantidadValidados: number;
  lat: number;
  lng: number;
  /** Semáforo para mapa: green | yellow | red */
  estado?: "green" | "yellow" | "red";
  estadoLabel?: string;
  /** WhatsApp o teléfono del titular (para contacto directo) */
  contacto?: string | null;
}
