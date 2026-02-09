/**
 * Cliente para tipificar oficio vía IA (llama a la API route).
 */

import type { GrupoPreclasificacion } from "@/lib/utils/preclasificacion";

export interface TipificacionOficioResult {
  categoria: string;
  especialidad: string;
  sugerencia_grupo: GrupoPreclasificacion;
}

export async function tipificarOficioIA(
  descripcionUsuario: string,
  imagenUrl?: string | null
): Promise<TipificacionOficioResult> {
  const res = await fetch("/api/tipificar-oficio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      descripcionUsuario: descripcionUsuario.trim(),
      imagenUrl: imagenUrl ?? undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Error al tipificar oficio");
  }

  return res.json() as Promise<TipificacionOficioResult>;
}
