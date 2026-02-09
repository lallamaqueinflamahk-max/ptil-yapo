/**
 * Esquema del subscriptor PTIL (payload del formulario de registro).
 */

export type Estudios = "SNPP" | "SINAFOCAL" | "Empírico" | "Otros";
export type EstadoEmpleo = "Desempleado" | "Contratado" | "Independiente";
export type CargoGestor = "Presidente" | "Convencional";
export type ClasificacionAutomatica = "Grupo A" | "Grupo B" | "Grupo C";

export interface SubscriptorIdentidad {
  nombre_completo: string;
  cedula_nro: number;
  foto_cedula_ocr: string;
  biometria_facial: boolean;
}

export interface SubscriptorContacto {
  whatsapp: string;
  email: string;
  redes_sociales: ("facebook" | "instagram")[];
}

export interface UbicacionGps {
  lat: number;
  lng: number;
}

export interface SubscriptorPerfilLaboral {
  oficio_principal: string;
  oficio_secundario: string;
  experiencia_anios: number;
  ubicacion_gps: UbicacionGps;
  yapo_selfie_url: string;
  estudios: Estudios;
  seguro_social: boolean;
  estado_empleo: EstadoEmpleo;
}

export interface GestorZona {
  nombre: string;
  cargo: CargoGestor;
  seccional: number;
}

export interface SubscriptorRespaldoConfianza {
  promotor_yapo: string;
  gestor_zona: GestorZona;
  cedula_operador_validador?: number;
}

export interface Subscriptor {
  subscriptor: {
    identidad: SubscriptorIdentidad;
    contacto: SubscriptorContacto;
    perfil_laboral: SubscriptorPerfilLaboral;
    respaldo_confianza: SubscriptorRespaldoConfianza;
    clasificacion_automatica: ClasificacionAutomatica;
  };
}
