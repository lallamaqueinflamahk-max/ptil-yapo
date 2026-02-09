import { NextResponse } from "next/server";

/** Datos para Dashboard de Capacitación (validación de oficios). */
export async function GET() {
  const data = {
    contadoresPorOficio: [
      { oficio: "Albañiles", cantidad: 1280 },
      { oficio: "Plomeros", cantidad: 940 },
      { oficio: "Electricistas", cantidad: 730 },
      { oficio: "Limpieza", cantidad: 615 },
    ],
    matrizReforma: [
      { label: "Certificados", valor: 80, color: "#22C55E" },
      { label: "Necesita capacitación", valor: 20, color: "#EF4444" },
    ],
    actividadTiempoReal: [
      { id: "1", nombre: "Juan Pérez", oficio: "Albañil", clasificacion: "Por Capacitar" as const },
      { id: "2", nombre: "María García", oficio: "Electricista", clasificacion: "Certificado" as const },
      { id: "3", nombre: "Carlos López", oficio: "Plomero", clasificacion: "Por Capacitar" as const },
      { id: "4", nombre: "Ana Martínez", oficio: "Limpieza", clasificacion: "Certificado" as const },
    ],
  };
  return NextResponse.json(data);
}
