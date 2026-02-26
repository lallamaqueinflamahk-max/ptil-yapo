/**
 * Crea una ficha en la base de datos a partir de los datos del formulario de inscripción.
 */
import { prisma } from "./index";
import { generarCodigosFicha } from "./codigos";
import { debeDerivarACapacitacion } from "@/lib/idoneidad/clasificacion";
import type { FormDataLike, GpsCoords } from "@/lib/utils/buildSubscriptor";
import { getGrupoPreclasificacion } from "@/lib/utils/preclasificacion";

export type EstadoVerificacion = "PENDIENTE" | "VERIFICADO" | "TRASPASADO";

export interface CrearFichaInput extends FormDataLike {
  gpsCoords: GpsCoords | null;
  gpsCasa?: GpsCoords | null;
  gpsLaburo?: GpsCoords | null;
}

export async function crearFicha(data: CrearFichaInput): Promise<{
  id: string;
  codigoSeguridad: string;
  codigoVerificacion: string;
  estadoVerificacion: EstadoVerificacion;
}> {
  const anos = parseInt(data.anosExperiencia, 10) || 0;
  const { grupo } = getGrupoPreclasificacion(data.nivelEstudios, anos);
  const clasificacion = grupo === "A" ? "Grupo A" : grupo === "B" ? "Grupo B" : "Grupo C";

  const cedulaNumero = parseInt(data.cedula.replace(/\D/g, ""), 10) || 0;
  const codigos = generarCodigosFicha();

  // Si tiene certificación (Grupo A) y cumple parámetros, validación automática sin Operador YAPÓ.
  const estadoInicial = grupo === "A" ? "VERIFICADO" : "PENDIENTE";

  const ficha = await prisma.ficha.create({
    data: {
      codigoSeguridad: codigos.codigoSeguridad,
      codigoVerificacion: codigos.codigoVerificacion,
      estadoVerificacion: estadoInicial,
      nombreCompleto: data.nombreCompleto.trim(),
      cedulaNro: data.cedula.trim(),
      cedulaNumero,
      whatsapp: data.whatsapp.trim(),
      email: data.email?.trim() || null,
      facebook: data.facebook?.trim() || null,
      instagram: data.instagram?.trim() || null,
      oficioPrincipal: data.oficioPrincipal.trim(),
      oficioSecundario: data.oficioSecundario?.trim() || null,
      experienciaAnios: anos,
      nivelEstudios: data.nivelEstudios || "Otros",
      situacion: data.situacion || "Independiente",
      seguroSocial: data.seguroSocial ?? false,
      selfieDataUrl: data.selfieDataUrl ?? null,
      gpsLat: data.gpsCoords?.lat ?? null,
      gpsLng: data.gpsCoords?.lng ?? null,
      gpsCasaLat: data.gpsCasa?.lat ?? null,
      gpsCasaLng: data.gpsCasa?.lng ?? null,
      gpsLaburoLat: data.gpsLaburo?.lat ?? null,
      gpsLaburoLng: data.gpsLaburo?.lng ?? null,
      promotorYapo: data.promotor?.trim() || "Juan Referente",
      gestorZona: (data.gestorZona?.trim() || "Prueba"),
      cargoGestor: (data.cargoGestor?.trim() || "Prueba"),
      seccionalNro: (data.seccionalNro?.trim() || "Prueba"),
      cedulaOperador: data.cedulaOperador?.trim() || null,
      clasificacionAutomatica: clasificacion,
    },
  });

  // Derivación automática a capacitación para Grupo C (y opcionalmente Grupo B sin certificación).
  if (debeDerivarACapacitacion(clasificacion, { grupoBSinCertificacionTambien: true })) {
    try {
      await prisma.derivacionCapacitacion.create({
        data: {
          fichaId: ficha.id,
          grupoOrigen: clasificacion,
          estado: "PENDIENTE",
        },
      });
    } catch (e) {
      // Si falla (ej. modelo no migrado), no bloqueamos la creación de la ficha.
      console.warn("No se pudo crear derivación a capacitación:", e);
    }
  }

  return {
    id: ficha.id,
    codigoSeguridad: ficha.codigoSeguridad,
    codigoVerificacion: ficha.codigoVerificacion,
    estadoVerificacion: ficha.estadoVerificacion as EstadoVerificacion,
  };
}
