import type { Subscriptor } from "@/lib/types/subscriptor";
import { getGrupoPreclasificacion } from "./preclasificacion";

export interface FormDataLike {
  nombreCompleto: string;
  cedula: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  oficioPrincipal: string;
  oficioSecundario: string;
  anosExperiencia: string;
  nivelEstudios: string;
  situacion: string;
  seguroSocial: boolean;
  selfieDataUrl: string | null;
  promotor: string;
  gestorZona: string;
  cargoGestor: string;
  seccionalNro: string;
  cedulaOperador: string;
}

export interface GpsCoords {
  lat: number;
  lng: number;
}

const CARGOS_MAP: Record<string, "Presidente" | "Convencional"> = {
  "Presidente de Seccional": "Presidente",
  Convencional: "Convencional",
};

const ESTUDIOS_MAP: Record<string, "SNPP" | "SINAFOCAL" | "Empírico" | "Otros"> = {
  SNPP: "SNPP",
  SINAFOCAL: "SINAFOCAL",
  Empírico: "Empírico",
  Otros: "Otros",
};

const ESTADO_EMPLEO_MAP: Record<string, "Desempleado" | "Contratado" | "Independiente"> = {
  Desempleado: "Desempleado",
  Contratado: "Contratado",
  Independiente: "Independiente",
};

export function buildSubscriptor(
  data: FormDataLike,
  gpsCoords: GpsCoords | null
): Subscriptor {
  const anos = parseInt(data.anosExperiencia, 10) || 0;
  const { grupo } = getGrupoPreclasificacion(data.nivelEstudios, anos);
  const clasificacion: Subscriptor["subscriptor"]["clasificacion_automatica"] =
    grupo === "A" ? "Grupo A" : grupo === "B" ? "Grupo B" : "Grupo C";

  const redes: ("facebook" | "instagram")[] = [];
  if (data.facebook?.trim()) redes.push("facebook");
  if (data.instagram?.trim()) redes.push("instagram");

  const cargoNorm = CARGOS_MAP[data.cargoGestor] ?? "Convencional";
  const estudiosNorm = ESTUDIOS_MAP[data.nivelEstudios] ?? "Otros";
  const estadoEmpleoNorm = ESTADO_EMPLEO_MAP[data.situacion] ?? "Independiente";

  return {
    subscriptor: {
      identidad: {
        nombre_completo: data.nombreCompleto.trim(),
        cedula_nro: parseInt(data.cedula.replace(/\D/g, ""), 10) || 0,
        foto_cedula_ocr: "", // URL cuando exista OCR
        biometria_facial: false,
      },
      contacto: {
        whatsapp: data.whatsapp.trim(),
        email: data.email.trim(),
        redes_sociales: redes,
      },
      perfil_laboral: {
        oficio_principal: data.oficioPrincipal.trim(),
        oficio_secundario: data.oficioSecundario.trim(),
        experiencia_anios: anos,
        ubicacion_gps: gpsCoords ?? { lat: 0, lng: 0 },
        yapo_selfie_url: data.selfieDataUrl ?? "",
        estudios: estudiosNorm,
        seguro_social: data.seguroSocial,
        estado_empleo: estadoEmpleoNorm,
      },
      respaldo_confianza: {
        promotor_yapo: data.promotor.trim() || "Miguel Sosa",
        gestor_zona: {
          nombre: data.gestorZona.trim(),
          cargo: cargoNorm,
          seccional: parseInt(data.seccionalNro.replace(/\D/g, ""), 10) || 0,
        },
        ...(data.cedulaOperador.trim()
          ? {
              cedula_operador_validador: parseInt(
                data.cedulaOperador.replace(/\D/g, ""),
                10
              ) || 0,
            }
          : {}),
      },
      clasificacion_automatica: clasificacion,
    },
  };
}
