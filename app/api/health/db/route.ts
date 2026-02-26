import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health/db — Comprueba si DATABASE_URL está configurada y si la conexión a la DB funciona.
 * Si /api/health/db da 404 en producción, probá GET /api/subscriptores?health=1 (misma app).
 */
export async function GET() {
  const url = process.env.DATABASE_URL?.trim() || "";
  const hasUrl = url.length >= 15;
  if (!hasUrl) {
    return NextResponse.json(
      { ok: false, database: "missing", hint: "Agregá DATABASE_URL en Vercel → Settings → Environment Variables y hacé Redeploy." },
      { status: 503 }
    );
  }
  try {
    await prisma.$connect();
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e))
      .replace(/postgresql:\/\/[^\s]+/gi, "[URL]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    return NextResponse.json(
      { ok: false, database: "configured", connectError: msg, hint: "Revisá la URL en Vercel, que Neon esté activo y que hayas ejecutado: npx prisma db push" },
      { status: 503 }
    );
  }
}
