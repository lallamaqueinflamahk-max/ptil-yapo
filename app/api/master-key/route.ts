import { NextRequest, NextResponse } from "next/server";

const ENV_KEY = "PTIL_MASTER_KEY";

/** GET: indica si el modo demo requiere clave (sin revelar la clave). */
export async function GET() {
  const required = Boolean(process.env[ENV_KEY]);
  return NextResponse.json({ required });
}

/** POST: valida la clave master. Body: { key: string }. */
export async function POST(request: NextRequest) {
  const expected = process.env[ENV_KEY];
  if (!expected) {
    return NextResponse.json({ required: false, allowed: true });
  }
  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ required: true, allowed: false });
  }
  const submitted = typeof body?.key === "string" ? body.key : "";
  // Comparación a tiempo constante para no filtrar longitud de la clave
  const allowed =
    submitted.length === expected.length &&
    Buffer.from(submitted, "utf8").equals(Buffer.from(expected, "utf8"));
  return NextResponse.json({ required: true, allowed });
}
