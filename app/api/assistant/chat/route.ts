import { NextRequest, NextResponse } from "next/server";
import { getDashboardContext } from "@/lib/services/dashboardContext";
import type { DashboardContextSummary } from "@/lib/services/dashboardContext";

const SYSTEM_PROMPT = (ctx: DashboardContextSummary) => `Eres el ASISTENTE MAESTRO del dashboard del Programa Territorial de Idoneidad Laboral (PTIL). Tu rol es responder con claridad y precisión sobre todos los datos del dashboard, en tiempo real.

Tienes acceso al siguiente contexto actualizado (JSON). Úsalo siempre para dar números, porcentajes, recuentos y resúmenes. Si el usuario pide una estadística, un gráfico mental o un reporte, genera la respuesta a partir de estos datos.

CONTEXTO DEL DASHBOARD (actualizado):
${JSON.stringify(ctx, null, 2)}

Instrucciones:
- Responde en español, de forma clara y concisa.
- Cuando pidan números o porcentajes, usa exactamente los valores del contexto.
- Puedes resumir tendencias (ej. "Lealtad global está en X%, riesgo político en Y%").
- Si piden "reporte diario" o "resumen del día", incluye territorio, KPIs, idoneidad y alertas.
- Para gráficos o porcentajes, describe los datos y su interpretación; si es útil, sugiere qué tipo de gráfico verían en el dashboard (ej. "Podés ver la evolución en Dashboard > Gráficos").
- Si no hay dato en el contexto para una pregunta, dilo y orienta al usuario a la sección correspondiente del dashboard.
- Mantén un tono profesional pero cercano.`;

type Message = { role: "user" | "assistant"; content: string };

/** Respuesta mock cuando no hay API key: usa el contexto real para generar una respuesta simple. */
function mockResponse(userMessage: string, ctx: DashboardContextSummary): string {
  const m = userMessage.toLowerCase();
  if (m.includes("lealtad") || m.includes("leales")) {
    return `La **lealtad global** actual es **${ctx.kpis.lealtadGlobal}%**. Hay **${ctx.pro.afiliadosLeales}** afiliados leales y **${ctx.territorio.totalVotantes}** votantes en total. Podés ver el detalle en Dashboard > Pro.`;
  }
  if (m.includes("riesgo") || m.includes("político")) {
    return `El **riesgo político** está en **${ctx.kpis.riesgoPolitico}%**. El territorio tiene ${ctx.territorio.estadoSeccionales.red} seccionales en estado crítico, ${ctx.territorio.estadoSeccionales.yellow} en atención y ${ctx.territorio.estadoSeccionales.green} en rango. Más en Dashboard > Territorio.`;
  }
  if (m.includes("formaliz") || m.includes("verificad")) {
    return `El **nivel de formalización** es **${ctx.kpis.nivelFormalizacion}%**. Hay **${ctx.idoneidad.fichasVerificadas}** fichas verificadas de **${ctx.idoneidad.totalFichas}** totales. Inscripciones hoy: **${ctx.idoneidad.fichasHoy}**.`;
  }
  if (m.includes("certific") || m.includes("derivacion")) {
    return `**Idoneidad:** ${ctx.idoneidad.totalDerivaciones} derivaciones a capacitación, ${ctx.idoneidad.totalCertificaciones} certificaciones registradas. Pendientes de dictamen: **${ctx.idoneidad.pendientesDictamen}**.`;
  }
  if (m.includes("alertas") || m.includes("alerta")) {
    return `Hay **${ctx.alertas.total}** alertas (${ctx.alertas.criticos} críticas). ${ctx.alertas.resumen.length ? "Algunas: " + ctx.alertas.resumen.slice(0, 3).map((a) => a.mensaje).join("; ") + "." : ""}`;
  }
  if (m.includes("resumen") || m.includes("reporte") || m.includes("día") || m.includes("dia")) {
    return `**Resumen del día:** Territorio: ${ctx.territorio.seccionales} seccionales, ${ctx.territorio.eventosHoy} eventos hoy. Lealtad ${ctx.kpis.lealtadGlobal}%, riesgo ${ctx.kpis.riesgoPolitico}%. Idoneidad: ${ctx.idoneidad.totalFichas} fichas, ${ctx.idoneidad.fichasHoy} inscripciones hoy, ${ctx.idoneidad.pendientesDictamen} pendientes de dictamen. Alertas: ${ctx.alertas.total}.`;
  }
  if (m.includes("grafico") || m.includes("gráfico") || m.includes("evolucion") || m.includes("evolución")) {
    const pts = ctx.evolucion.ultimosPuntos;
    const last = pts[pts.length - 1];
    return `Los últimos datos de evolución (${ctx.evolucion.dias} días): validados recientes **${last?.validados ?? "—"}**. Podés ver la serie completa y gráficos en **Dashboard > Gráficos**.`;
  }
  return `Tenés acceso a todo el dashboard: territorio (${ctx.territorio.seccionales} seccionales, ${ctx.territorio.totalVotantes} votantes), Pro (${ctx.pro.afiliadosLeales} leales, ${ctx.pro.operadores} operadores), idoneidad (${ctx.idoneidad.totalFichas} fichas, ${ctx.idoneidad.totalCertificaciones} certificaciones). Decime qué número, porcentaje o reporte necesitás y te lo armo con los datos en tiempo real.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history: Message[] = Array.isArray(body.history) ? body.history : [];
    const provider = body.provider === "anthropic" ? "anthropic" : "openai";

    if (!message) {
      return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
    }

    const ctx = await getDashboardContext();
    const systemPrompt = SYSTEM_PROMPT(ctx);

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (provider === "anthropic" && anthropicKey) {
      const apiMessages = [
        ...history.map((m) => (m.role === "assistant" ? { role: "assistant" as const, content: m.content } : { role: "user" as const, content: m.content })),
        { role: "user" as const, content: message },
      ];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Anthropic chat:", res.status, err);
        return NextResponse.json({
          text: mockResponse(message, ctx),
          source: "fallback",
        });
      }
      const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
      const text =
        data.content?.find((c) => c.type === "text")?.text?.trim() || mockResponse(message, ctx);
      return NextResponse.json({ text, source: "anthropic" });
    }

    if (openaiKey) {
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: message },
      ];
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1024,
          messages,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("OpenAI assistant chat:", res.status, err);
        return NextResponse.json({
          text: mockResponse(message, ctx),
          source: "fallback",
        });
      }
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim() || mockResponse(message, ctx);
      return NextResponse.json({ text, source: "openai" });
    }

    return NextResponse.json({
      text: mockResponse(message, ctx),
      source: "mock",
    });
  } catch (e) {
    console.error("Error en /api/assistant/chat:", e);
    return NextResponse.json(
      { error: "No se pudo procesar la consulta. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
