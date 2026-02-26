import { NextResponse } from "next/server";

/**
 * GET /api/health — Comprueba si DATABASE_URL está configurada (solo variable, no conecta a la DB).
 * Abrí esta URL en el navegador; no da 405. Para probar conexión real: /api/health/db
 */
export async function GET() {
  const url = process.env.DATABASE_URL?.trim() || "";
  const configured = url.length >= 15;
  return NextResponse.json(
    {
      ok: configured,
      database: configured ? "configured" : "missing",
      hint: configured ? undefined : "Agregá DATABASE_URL en Vercel → Settings → Environment Variables y hacé Redeploy.",
    },
    { status: configured ? 200 : 503 }
  );
}
