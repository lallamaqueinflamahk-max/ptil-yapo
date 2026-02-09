/**
 * Tipificación de oficios informales con IA (OpenAI/Gemini).
 * Conecta con la API para categorizar y sugerir grupo A/B/C.
 */

import type { GrupoPreclasificacion } from "@/lib/utils/preclasificacion";

export interface TipificacionOficioResult {
  categoria: string;
  especialidad: string;
  sugerencia_grupo: GrupoPreclasificacion;
}

const PROMPT = `Analiza el siguiente oficio informal en Paraguay. 
Categorízalo en una rama industrial (ej: Construcción, Servicios, Metalurgia, Electricidad, etc.) y asígnale una especialidad concreta.
Basado solo en la descripción, sugiere un nivel de idoneidad: A (certificado/formal), B (experiencia comprobable), C (requiere capacitación).
Responde ÚNICAMENTE con un JSON válido, sin markdown, con estas claves exactas:
{"categoria": "string", "especialidad": "string", "sugerencia_grupo": "A" | "B" | "C"}`;

/** Mock cuando no hay API key (desarrollo/demo). */
function mockTipificacion(descripcionUsuario: string): TipificacionOficioResult {
  const lower = descripcionUsuario.toLowerCase();
  let categoria = "Servicios";
  let especialidad = "General";
  let sugerencia_grupo: GrupoPreclasificacion = "B";
  if (lower.includes("electric") || lower.includes("cable")) {
    categoria = "Electricidad";
    especialidad = "Electricista";
  } else if (lower.includes("albañil") || lower.includes("construc")) {
    categoria = "Construcción";
    especialidad = "Albañilería";
  } else if (lower.includes("plomer") || lower.includes("tuber")) {
    categoria = "Construcción";
    especialidad = "Plomería";
  } else if (lower.includes("metal") || lower.includes("soldad")) {
    categoria = "Metalurgia";
    especialidad = "Soldadura";
  }
  return { categoria, especialidad, sugerencia_grupo };
}

/**
 * Clasifica el oficio usando IA (OpenAI). Si no hay OPENAI_API_KEY, devuelve mock.
 * imagenUrl opcional: data URL (base64) o URL pública para visión.
 */
export async function tipificarOficioIA(
  descripcionUsuario: string,
  imagenUrl?: string | null
): Promise<TipificacionOficioResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return mockTipificacion(descripcionUsuario);
  }

  type ContentPart =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

  const userContent: ContentPart[] = [
    {
      type: "text",
      text: `${PROMPT}\n\nOficio a analizar: "${descripcionUsuario}"`,
    },
  ];

  if (imagenUrl?.startsWith("data:") || imagenUrl?.startsWith("http")) {
    userContent.push({
      type: "image_url",
      image_url: { url: imagenUrl },
    });
  }

  const body = {
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      { role: "system", content: "Respondes solo con JSON válido." },
      { role: "user", content: userContent },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI tipificar oficio:", res.status, err);
    return mockTipificacion(descripcionUsuario);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, "").trim();
  try {
    const parsed = JSON.parse(jsonStr) as TipificacionOficioResult;
    if (!["A", "B", "C"].includes(parsed.sugerencia_grupo)) {
      parsed.sugerencia_grupo = "B";
    }
    return {
      categoria: String(parsed.categoria ?? "Servicios"),
      especialidad: String(parsed.especialidad ?? "General"),
      sugerencia_grupo: parsed.sugerencia_grupo,
    };
  } catch {
    return mockTipificacion(descripcionUsuario);
  }
}
