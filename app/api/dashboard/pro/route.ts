import { NextResponse } from "next/server";

/** Datos para Dashboard Pro (referente). */
export async function GET() {
  const data = {
    afiliadosLeales: 4520,
    seccionales: 8,
    operadores: 38,
    rankingPresidentes: [
      { nombre: "Lopez", leales: 540 },
      { nombre: "Ramirez", leales: 460 },
      { nombre: "Gimenez", leales: 420 },
      { nombre: "Vera", leales: 380 },
      { nombre: "Mendoza", leales: 350 },
    ],
    rendimientoOperadores: [
      { nombre: "Carvallo", score: 92 },
      { nombre: "Gimenez", score: 83 },
      { nombre: "Rojas", score: 78 },
      { nombre: "Vera", score: 71 },
      { nombre: "Duarte", score: 65 },
      { nombre: "Mendoza", score: 58 },
    ],
  };
  return NextResponse.json(data);
}
