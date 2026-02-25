/**
 * Rol de staff seleccionado en el login (demo).
 * Solo el rol "maestro" puede ver el dashboard maestro; operadores no tienen acceso.
 */

export type StaffRole = "maestro" | "pro" | "operador" | "capacitacion" | null;

export const STAFF_ROLE_KEY = "ptil_staff_role";

export function getStaffRole(): StaffRole {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STAFF_ROLE_KEY);
  if (raw === "maestro" || raw === "pro" || raw === "operador" || raw === "capacitacion") return raw;
  return null;
}

export function setStaffRole(role: StaffRole): void {
  if (typeof window === "undefined") return;
  if (role) localStorage.setItem(STAFF_ROLE_KEY, role);
  else localStorage.removeItem(STAFF_ROLE_KEY);
}

/** Rutas que solo el staff maestro puede ver (no operadores ni otros roles). */
export const MAESTRO_ONLY_PATHS = [
  "/dashboard/maestro",
  "/dashboard/graficos",
  "/dashboard/tabla-operativa",
  "/dashboard/mapa-control",
  "/dashboard/admin",
] as const;

export function canAccessMaestroUi(role: StaffRole): boolean {
  return role === "maestro";
}
