import { NextResponse } from "next/server";

/**
 * GET /api/health/db — Comprueba si DATABASE_URL está configurada en el servidor.
 * Útil para ver si Vercel tiene la variable (sin revelar el valor).
 */
export async function GET() {
  const url = process.env.DATABASE_URL?.trim() || "";
  const configured = url.length >= 15 && (url.startsWith("postgresql://") || url.startsWith("postgres://"));
  if (!configured) {
    return NextResponse.json(
      { ok: false, database: "missing", hint: "Agregá DATABASE_URL en Vercel → Settings → Environment Variables y hacé Redeploy." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, database: "configured" });
}
