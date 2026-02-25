/**
 * POST - Solicitar retiro desde Billetera YAPÓ a Billetera Mango o a cuenta bancaria.
 * Body: { cedula, destino: "MANGO" | "CUENTA_BANCARIA", monto [, banco, numeroCuenta ] }.
 * monto en guaraníes (Gs). Para MANGO se usa el mangoPhone vinculado.
 * Para CUENTA_BANCARIA opcionalmente banco y numeroCuenta (se guardan en referencia).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cedula = body.cedula?.trim();
    const destino = body.destino?.trim().toUpperCase();
    const monto = typeof body.monto === "number" ? Math.floor(body.monto) : parseInt(String(body.monto || "0"), 10);
    const banco = body.banco?.trim() || null;
    const numeroCuenta = body.numeroCuenta?.trim() || null;

    if (!cedula) {
      return NextResponse.json(
        { error: "Faltó la cédula del operador." },
        { status: 400 }
      );
    }

    if (destino !== "MANGO" && destino !== "CUENTA_BANCARIA") {
      return NextResponse.json(
        { error: "destino debe ser MANGO o CUENTA_BANCARIA." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número positivo." },
        { status: 400 }
      );
    }

    const operador = await prisma.operador.findUnique({
      where: { cedula },
    });

    if (!operador) {
      return NextResponse.json(
        { error: "Operador no encontrado." },
        { status: 404 }
      );
    }

    if (operador.saldoDisponible < monto) {
      return NextResponse.json(
        { error: "Saldo insuficiente en Billetera YAPÓ." },
        { status: 400 }
      );
    }

    if (destino === "MANGO" && !operador.mangoPhone) {
      return NextResponse.json(
        { error: "Vinculá tu cuenta Mango antes de retirar a Mango." },
        { status: 400 }
      );
    }

    if (destino === "CUENTA_BANCARIA" && (!banco || !numeroCuenta)) {
      return NextResponse.json(
        { error: "Para retirar a cuenta bancaria indicá banco y número de cuenta." },
        { status: 400 }
      );
    }

    const tipoMovimiento = destino === "MANGO" ? "RETIRO_MANGO" : "RETIRO_CUENTA_BANCARIA";
    const referencia =
      destino === "MANGO"
        ? `Mango ${operador.mangoPhone}`
        : `${banco ?? "Banco"} - Cuenta ${numeroCuenta ?? ""}`;

    await prisma.$transaction([
      prisma.operador.update({
        where: { cedula },
        data: { saldoDisponible: { decrement: monto } },
      }),
      prisma.billeteraMovimiento.create({
        data: {
          operadorId: operador.id,
          tipo: tipoMovimiento,
          monto,
          referencia,
          estado: "COMPLETADO",
        },
      }),
    ]);

    // Aquí en producción se llamaría a la API de Mango o al proveedor bancario para ejecutar el retiro.
    // Por ahora solo registramos el movimiento y descontamos el saldo.

    return NextResponse.json({
      ok: true,
      destino,
      monto,
      mensaje:
        destino === "MANGO"
          ? "Retiro a Billetera Mango solicitado. El crédito se reflejará en tu Mango según los plazos del proveedor."
          : "Retiro a cuenta bancaria registrado. El depósito se procesará según los plazos configurados.",
    });
  } catch (e) {
    console.error("Error al retirar:", e);
    return NextResponse.json(
      { error: "No se pudo procesar el retiro." },
      { status: 500 }
    );
  }
}
