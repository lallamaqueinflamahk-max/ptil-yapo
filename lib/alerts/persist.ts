/**
 * Persistencia de estado de alertas (activa / resuelta).
 * Resueltas se guardan en localStorage por clave estable.
 */

const STORAGE_KEY = "ptil-alertas-resueltas";

export interface ResueltaEntry {
  key: string;
  resueltaAt: string; // ISO
}

function getRaw(): ResueltaEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResueltaEntry[]) : [];
  } catch {
    return [];
  }
}

/** Devuelve el Set de claves que están marcadas como resueltas. */
export function getResueltasKeys(): Set<string> {
  return new Set(getRaw().map((e) => e.key));
}

/** Marca una alerta como resuelta (por clave estable). */
export function marcarResuelta(key: string): void {
  const arr = getRaw().filter((e) => e.key !== key);
  arr.push({ key, resueltaAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

/** Quita el estado resuelta de una alerta. */
export function marcarActiva(key: string): void {
  const arr = getRaw().filter((e) => e.key !== key);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

/** Fecha en que se marcó como resuelta (si existe). */
export function getResueltaFecha(key: string): string | null {
  const entry = getRaw().find((e) => e.key === key);
  return entry?.resueltaAt ?? null;
}
