/**
 * Datos mock para el mapa de capas (leales, no verificados, riesgo, capacitación, dirigentes).
 * En producción se obtendrían de la API/BD filtrando por estado.
 */

import type { PuntoMapa, InfoSuscriptor, InfoDirigente } from "@/lib/types/mapaCapas";

const CENTRO = { lat: -25.2637, lng: -57.5759 };

function coord(offsetLat: number, offsetLng: number) {
  return { lat: CENTRO.lat + offsetLat * 0.008, lng: CENTRO.lng + offsetLng * 0.008 };
}

const SUSCRIPTORES_LEALES: InfoSuscriptor[] = [
  {
    tipo: "suscriptor",
    id: "sub-leal-1",
    codigoVerificacion: "ABC12XYZ",
    nombreCompleto: "Juan Carlos Pérez",
    cedula: "4.123.456",
    whatsapp: "+595 981 111 001",
    email: "juan.perez@email.com",
    oficioPrincipal: "Electricista",
    oficioSecundario: "Instalador de aire",
    experienciaAnios: 8,
    nivelEstudios: "SNPP",
    situacionLaboral: "Independiente",
    seguroSocial: true,
    clasificacionIdoneidad: "Grupo A",
    estadoVerificacion: "VERIFICADO",
    estadoLealtad: "ACTIVO",
    promotor: "Miguel Sosa",
    gestorZona: "Miguel Sosa",
    cargoGestor: "Presidente de Seccional",
    seccionalNro: "18",
    fechaInscripcion: "2026-01-15",
    gpsLat: -25.272,
    gpsLng: -57.572,
  },
  {
    tipo: "suscriptor",
    id: "sub-leal-2",
    codigoVerificacion: "DEF34UVW",
    nombreCompleto: "María González",
    cedula: "3.987.654",
    whatsapp: "+595 982 222 002",
    email: "maria.g@email.com",
    oficioPrincipal: "Costurera",
    oficioSecundario: null,
    experienciaAnios: 12,
    nivelEstudios: "SINAFOCAL",
    situacionLaboral: "Independiente",
    seguroSocial: false,
    clasificacionIdoneidad: "Grupo A",
    estadoVerificacion: "VERIFICADO",
    estadoLealtad: "ACTIVO",
    promotor: "Miguel Sosa",
    gestorZona: "María Nene Alvarenga",
    cargoGestor: "Presidente de Seccional",
    seccionalNro: "12",
    fechaInscripcion: "2026-01-20",
    gpsLat: -25.275,
    gpsLng: -57.571,
  },
];

const SUSCRIPTORES_NO_VERIFICADOS: InfoSuscriptor[] = [
  {
    tipo: "suscriptor",
    id: "sub-nv-1",
    codigoVerificacion: "GHI56RST",
    nombreCompleto: "Roberto Martínez",
    cedula: "5.111.222",
    whatsapp: "+595 983 333 003",
    email: null,
    oficioPrincipal: "Albañil",
    oficioSecundario: "Pintor",
    experienciaAnios: 5,
    nivelEstudios: "Empírico",
    situacionLaboral: "Contratado",
    seguroSocial: true,
    clasificacionIdoneidad: "Grupo B",
    estadoVerificacion: "PENDIENTE",
    estadoLealtad: "ACTIVO",
    promotor: "Miguel Sosa",
    gestorZona: "Jorge Turi Cappello",
    cargoGestor: "Convencional",
    seccionalNro: "4",
    fechaInscripcion: "2026-02-01",
    gpsLat: -25.268,
    gpsLng: -57.581,
  },
];

const SUSCRIPTORES_RIESGO: InfoSuscriptor[] = [
  {
    tipo: "suscriptor",
    id: "sub-riesgo-1",
    codigoVerificacion: "JKL78MNO",
    nombreCompleto: "Ana López",
    cedula: "4.555.666",
    whatsapp: "+595 984 444 004",
    email: "ana.lopez@email.com",
    oficioPrincipal: "Peluquera",
    oficioSecundario: null,
    experienciaAnios: 3,
    nivelEstudios: "Otros",
    situacionLaboral: "Independiente",
    seguroSocial: false,
    clasificacionIdoneidad: "Grupo B",
    estadoVerificacion: "VERIFICADO",
    estadoLealtad: "EN_RIESGO",
    promotor: "Miguel Sosa",
    gestorZona: "Miguel Sosa",
    cargoGestor: "Presidente de Seccional",
    seccionalNro: "18",
    fechaInscripcion: "2025-11-10",
    gpsLat: -25.277,
    gpsLng: -57.569,
  },
];

const SUSCRIPTORES_CAPACITACION: InfoSuscriptor[] = [
  {
    tipo: "suscriptor",
    id: "sub-cap-1",
    codigoVerificacion: "PQR90STU",
    nombreCompleto: "Luis Fernández",
    cedula: "2.777.888",
    whatsapp: "+595 985 555 005",
    email: null,
    oficioPrincipal: "Ayudante general",
    oficioSecundario: null,
    experienciaAnios: 1,
    nivelEstudios: "Empírico",
    situacionLaboral: "Desempleado",
    seguroSocial: false,
    clasificacionIdoneidad: "Grupo C",
    estadoVerificacion: "VERIFICADO",
    estadoLealtad: "ACTIVO",
    promotor: "Miguel Sosa",
    gestorZona: "Daniel Centurión",
    cargoGestor: "Convencional",
    seccionalNro: "21",
    fechaInscripcion: "2026-02-05",
    gpsLat: -25.273,
    gpsLng: -57.556,
  },
];

const DIRIGENTES: InfoDirigente[] = [
  { tipo: "dirigente", id: "dir-1", nombreCompleto: "Miguel Sosa", cargo: "Concejal", seccional: "Barrio Obrero Sur (18)", contacto: "+595 981 000 001", activo: true },
  { tipo: "dirigente", id: "dir-2", nombreCompleto: "Víctor Fernández", cargo: "Presidente Consejo", seccional: "Zeballos Cué (23)", contacto: null, activo: true },
  { tipo: "dirigente", id: "dir-3", nombreCompleto: "María Nene Alvarenga", cargo: "Presidente Seccional", seccional: "Barrio Obrero (12)", contacto: "+595 982 000 002", activo: true },
  { tipo: "dirigente", id: "dir-4", nombreCompleto: "Jorge Turi Cappello", cargo: "Referente HC", seccional: "La Encarnación (4)", contacto: null, activo: true },
  { tipo: "dirigente", id: "dir-5", nombreCompleto: "Maximiliano Ayala", cargo: "Presidente Seccional", seccional: "Centro Catedral (1)", contacto: null, activo: true },
];

const COORDS_LEALES = [coord(0, 0.5), coord(-0.3, -0.2)];
const COORDS_NO_VERIF = [coord(0.2, -0.4)];
const COORDS_RIESGO = [coord(-0.5, 0.3)];
const COORDS_CAPACITACION = [coord(0.4, 0.6)];
const COORDS_DIRIGENTES = [coord(-0.2, 0), coord(0.1, -0.5), coord(-0.4, -0.3), coord(0.3, -0.2), coord(-0.1, 0.4)];

export function getPuntosLeales(): PuntoMapa[] {
  return SUSCRIPTORES_LEALES.map((info, i) => ({
    lat: info.gpsLat ?? COORDS_LEALES[i]?.lat ?? CENTRO.lat,
    lng: info.gpsLng ?? COORDS_LEALES[i]?.lng ?? CENTRO.lng,
    capa: "leales",
    info,
  }));
}

export function getPuntosNoVerificados(): PuntoMapa[] {
  return SUSCRIPTORES_NO_VERIFICADOS.map((info, i) => ({
    lat: info.gpsLat ?? COORDS_NO_VERIF[i]?.lat ?? CENTRO.lat,
    lng: info.gpsLng ?? COORDS_NO_VERIF[i]?.lng ?? CENTRO.lng,
    capa: "no_verificados",
    info,
  }));
}

export function getPuntosRiesgo(): PuntoMapa[] {
  return SUSCRIPTORES_RIESGO.map((info, i) => ({
    lat: info.gpsLat ?? COORDS_RIESGO[i]?.lat ?? CENTRO.lat,
    lng: info.gpsLng ?? COORDS_RIESGO[i]?.lng ?? CENTRO.lng,
    capa: "riesgo",
    info,
  }));
}

export function getPuntosCapacitacion(): PuntoMapa[] {
  return SUSCRIPTORES_CAPACITACION.map((info, i) => ({
    lat: info.gpsLat ?? COORDS_CAPACITACION[i]?.lat ?? CENTRO.lat,
    lng: info.gpsLng ?? COORDS_CAPACITACION[i]?.lng ?? CENTRO.lng,
    capa: "capacitacion",
    info,
  }));
}

export function getPuntosDirigentes(): PuntoMapa[] {
  return DIRIGENTES.map((info, i) => ({
    lat: COORDS_DIRIGENTES[i]?.lat ?? CENTRO.lat,
    lng: COORDS_DIRIGENTES[i]?.lng ?? CENTRO.lng,
    capa: "dirigentes",
    info,
  }));
}

export function getAllPuntosMapaCapas(): Record<string, PuntoMapa[]> {
  return {
    leales: getPuntosLeales(),
    no_verificados: getPuntosNoVerificados(),
    riesgo: getPuntosRiesgo(),
    capacitacion: getPuntosCapacitacion(),
    dirigentes: getPuntosDirigentes(),
  };
}
