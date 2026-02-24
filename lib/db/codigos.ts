/**
 * Generación de códigos de seguridad y verificación para fichas PTIL.
 * - codigoSeguridad: uso interno y traspaso a YAPÓ oficial (único por ficha).
 * - codigoVerificacion: código corto para que el subscriptor consulte su estado (público).
 */

const ANIO = new Date().getFullYear();
const ALFANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin 0,O,1,I para evitar confusiones

function randomStr(chars: string, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/** Código interno/traspaso: PTIL-2026-XXXXXXXX */
export function generarCodigoSeguridad(): string {
  return `PTIL-${ANIO}-${randomStr(ALFANUM, 8)}`;
}

/** Código corto para consulta del subscriptor: 8 caracteres alfanuméricos */
export function generarCodigoVerificacion(): string {
  return randomStr(ALFANUM, 8);
}

/** Genera ambos códigos. En producción, verificar unicidad en DB antes de devolver. */
export function generarCodigosFicha(): {
  codigoSeguridad: string;
  codigoVerificacion: string;
} {
  return {
    codigoSeguridad: generarCodigoSeguridad(),
    codigoVerificacion: generarCodigoVerificacion(),
  };
}
