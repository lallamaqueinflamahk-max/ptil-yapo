/**
 * Tipos para el mapa de capas: suscriptores y dirigentes.
 * Cada punto es clickeable y muestra información completa en popup.
 */

export type CapaId = "leales" | "no_verificados" | "riesgo" | "capacitacion" | "dirigentes";

export interface InfoSuscriptor {
  tipo: "suscriptor";
  id: string;
  codigoVerificacion: string;
  nombreCompleto: string;
  cedula: string;
  whatsapp: string;
  email: string | null;
  oficioPrincipal: string;
  oficioSecundario: string | null;
  experienciaAnios: number;
  nivelEstudios: string;
  situacionLaboral: string;
  seguroSocial: boolean;
  clasificacionIdoneidad: string;
  estadoVerificacion: string;
  estadoLealtad: string;
  promotor: string;
  gestorZona: string;
  cargoGestor: string;
  seccionalNro: string;
  fechaInscripcion: string;
  gpsLat: number | null;
  gpsLng: number | null;
}

export interface InfoDirigente {
  tipo: "dirigente";
  id: string;
  nombreCompleto: string;
  cargo: string;
  seccional: string;
  contacto: string | null;
  activo: boolean;
}

export interface PuntoMapa {
  lat: number;
  lng: number;
  capa: CapaId;
  info: InfoSuscriptor | InfoDirigente;
}
