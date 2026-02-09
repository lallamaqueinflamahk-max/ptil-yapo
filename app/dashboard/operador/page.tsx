"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Camera, MapPin, CheckCircle2, Send, Coins } from "lucide-react";
import { mensajeBienvenidaYapo } from "@/lib/messages/whatsappBienvenida";

const COMISION_POR_VALIDACION = 5000;

type EstadoValidacion = "pendiente" | "aprobado";

interface ValidacionItem {
  id: string;
  nombreTrabajador: string;
  oficio: string;
  whatsapp: string;
  estado: EstadoValidacion;
  fechaRegistro: string;
}

const MOCK_VALIDACIONES: ValidacionItem[] = [
  { id: "1", nombreTrabajador: "Juan Carlos Pérez", oficio: "Electricista", whatsapp: "+595 981 111 111", estado: "pendiente", fechaRegistro: "Hoy 10:30" },
  { id: "2", nombreTrabajador: "María González", oficio: "Albañil", whatsapp: "+595 982 222 222", estado: "aprobado", fechaRegistro: "Ayer 15:00" },
  { id: "3", nombreTrabajador: "Roberto Martínez", oficio: "Plomero", whatsapp: "+595 983 333 333", estado: "pendiente", fechaRegistro: "Hoy 09:15" },
];

export default function DashboardOperadorPage() {
  const [validaciones, setValidaciones] = useState<ValidacionItem[]>(MOCK_VALIDACIONES);
  const [comisionTotal, setComisionTotal] = useState(5000);
  const [feedbackNombre, setFeedbackNombre] = useState<string | null>(null);
  const [reenviandoId, setReenviandoId] = useState<string | null>(null);
  const [mostrarComisionGanada, setMostrarComisionGanada] = useState(false);

  const aprobar = (item: ValidacionItem) => {
    setValidaciones((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, estado: "aprobado" as const } : v))
    );
    setComisionTotal((c) => c + COMISION_POR_VALIDACION);
    setFeedbackNombre(item.nombreTrabajador);
    setMostrarComisionGanada(true);
    const mensaje = mensajeBienvenidaYapo(item.nombreTrabajador);
    console.log("WhatsApp bienvenida enviado a", item.whatsapp, mensaje);
    setTimeout(() => setFeedbackNombre(null), 5000);
    setTimeout(() => setMostrarComisionGanada(false), 4000);
  };

  const reenviarBienvenida = (item: ValidacionItem) => {
    setReenviandoId(item.id);
    const mensaje = mensajeBienvenidaYapo(item.nombreTrabajador);
    console.log("Re-envío WhatsApp bienvenida a", item.whatsapp, mensaje);
    setTimeout(() => {
      setReenviandoId(null);
      setFeedbackNombre(item.nombreTrabajador);
      setTimeout(() => setFeedbackNombre(null), 3000);
    }, 800);
  };

  const pendientes = validaciones.filter((v) => v.estado === "pendiente");
  const aprobados = validaciones.filter((v) => v.estado === "aprobado");

  return (
    <div className="min-h-screen bg-yapo-gray">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold">Caza Talentos (Operador)</h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-yapo-orange/20 text-yapo-orange-light px-3 py-1.5 rounded-lg font-semibold">
                <Coins className="w-4 h-4" />
                {comisionTotal.toLocaleString("es-PY")} Gs
              </span>
              {mostrarComisionGanada && (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white text-sm font-bold px-2 py-1 rounded-lg animate-pulse">
                  + {COMISION_POR_VALIDACION.toLocaleString("es-PY")} Gs. ganados
                </span>
              )}
            </span>
            <Link
              href="/"
              className="text-yapo-orange-light hover:underline text-sm"
            >
              Volver a Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {feedbackNombre && (
          <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="font-medium">
              Mensaje de bienvenida enviado a <strong>{feedbackNombre}</strong>
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/?operador=1"
            className="bg-white rounded-2xl p-6 shadow flex items-center gap-4 hover:ring-2 hover:ring-yapo-orange"
          >
            <UserPlus className="w-10 h-10 text-yapo-blue" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Registrar trabajador</h2>
              <p className="text-sm text-gray-500">Validación in situ</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
            <Camera className="w-10 h-10 text-yapo-orange" />
            <div>
              <h2 className="font-semibold text-yapo-blue">Selfies pendientes</h2>
              <p className="text-sm text-gray-500">Validar con Geofencing</p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-yapo-blue mb-4">
            Validaciones pendientes ({pendientes.length})
          </h2>
          {pendientes.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay validaciones pendientes.</p>
          ) : (
            <ul className="space-y-4">
              {pendientes.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-yapo-gray border border-yapo-gray-dark"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                    <p className="text-sm text-gray-600">{item.oficio} · {item.whatsapp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => aprobar(item)}
                    className="btn-yapo min-h-[48px] px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                    APROBADO
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-yapo-blue mb-4">
            Historial de validaciones
          </h2>
          <ul className="space-y-4">
            {aprobados.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.nombreTrabajador}</p>
                  <p className="text-sm text-gray-600">{item.oficio} · {item.fechaRegistro}</p>
                </div>
                <button
                  type="button"
                  onClick={() => reenviarBienvenida(item)}
                  disabled={reenviandoId === item.id}
                  className="btn-yapo min-h-[44px] px-3 text-sm border-2 border-yapo-blue text-yapo-blue hover:bg-yapo-blue hover:text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {reenviandoId === item.id ? "Enviando…" : "Re-enviar Bienvenida"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-yapo-orange/10 rounded-2xl p-4 border border-yapo-orange/30">
          <p className="text-sm font-medium text-yapo-blue">
            <strong>Incentivo:</strong> Por cada validación aprobada sumás{" "}
            <strong>{COMISION_POR_VALIDACION.toLocaleString("es-PY")} Gs</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow sm:col-span-2 flex items-center gap-4">
          <MapPin className="w-10 h-10 text-yapo-blue shrink-0" />
          <div>
            <h2 className="font-semibold text-yapo-blue">Zona de cobertura</h2>
            <p className="text-sm text-gray-500">Mapa de validación activa</p>
          </div>
        </div>
      </main>
    </div>
  );
}
