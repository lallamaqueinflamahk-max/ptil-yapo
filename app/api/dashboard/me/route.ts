import { NextResponse } from "next/server";

/**
 * GET - Usuario staff actual (para avatar y nombre en el header).
 * En producción reemplazar por sesión (getServerSession, etc.) y devolver imagen de perfil real.
 */
export async function GET() {
  // Mock: cuando integres auth, leer session.user (name, email, image)
  const user = {
    name: "Staff Yapó",
    image: null as string | null,
  };
  return NextResponse.json(user);
}
