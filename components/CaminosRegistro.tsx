"use client";

import Image from "next/image";
import { Smartphone, UserCheck, Camera, MapPin, Bell } from "lucide-react";

interface CaminosRegistroProps {
  onViaA: () => void;
  onViaB: () => void;
  onViaC: () => void;
}

export default function CaminosRegistro({ onViaA, onViaB, onViaC }: CaminosRegistroProps) {
  return (
    <section className="px-4 py-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-yapo-blue text-center mb-2">
        Cómo inscribirse al PTIL
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-2xl mx-auto">
        Hay tres formas de registrarte. Elegí la que te quede más cómoda: solo desde tu celular, con un operador que te visita, o con una selfie de trabajo y GPS.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Auto-Registro */}
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg hover:shadow-xl hover:shadow-blue-200/40 hover:border-blue-300 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-out flex flex-col group">
          <div className="relative w-full aspect-[3/4] min-h-[220px] bg-gradient-to-b from-slate-800 via-blue-900 to-slate-800 overflow-hidden">
            <Image
              src="/images/auto-registro-cta.png"
              alt="Auto-Registro: cargá tu cédula, datos y foto desde tu celular. Pendiente de verificación."
              fill
              className="object-contain object-center p-3 group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
              priority
            />
            <div className="absolute bottom-2 left-2 right-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/95 text-slate-900 text-xs font-bold shadow-lg">
                <Bell className="w-3.5 h-3.5" />
                Pendiente de verificación
              </span>
            </div>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-yapo-blue shrink-0">
                <Smartphone className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-gray-900">Auto-Registro</h3>
            </div>
            <p className="text-xs font-medium text-blue-800/90 mb-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              El trabajador carga solo: entrá desde tu celular, subí cédula, datos básicos y tu foto.
            </p>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              El sistema asigna <strong>Estado: Pendiente de Verificación</strong>. Se envía alerta a un <strong>Operador YAPÓ</strong> de tu zona para que agende la visita o verifique online.
            </p>
            <button
              type="button"
              onClick={onViaA}
              className="btn-yapo btn-yapo-primary w-full min-h-[52px] text-base font-semibold shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Registrarme ahora
            </button>
          </div>
        </div>

        {/* Carga Directa */}
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-amber-300 shadow-lg hover:shadow-xl hover:shadow-amber-200/40 hover:border-amber-400 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-out flex flex-col group">
          <div className="relative w-full aspect-[3/4] min-h-[220px] bg-gradient-to-b from-slate-800 via-blue-900 to-slate-800 overflow-hidden">
            <Image
              src="/images/carga-directa-cta.png"
              alt="Carga Directa: un Operador YAPÓ te registra en tu puesto o en verificación in situ. Verificación instantánea."
              fill
              className="object-contain object-center p-3 group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <UserCheck className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-gray-900">Carga Directa</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Un <strong>Operador YAPÓ</strong> te registra en tu puesto de trabajo o en verificación in situ (va a tu casa si trabajás ahí). El Operador actúa como caza talentos y la verificación es <strong>instantánea</strong>: saca fotos y valida en el momento.
            </p>
            <button
              type="button"
              onClick={onViaB}
              className="btn-yapo btn-yapo-secondary w-full min-h-[52px] text-base font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <UserCheck className="w-5 h-5" />
              Registro con Operador
            </button>
          </div>
        </div>

        {/* Validación Digital Online */}
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-green-300 shadow-lg hover:shadow-xl hover:shadow-green-200/40 hover:border-green-400 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-out flex flex-col group">
          <div className="relative w-full aspect-[3/4] min-h-[220px] bg-gradient-to-b from-slate-800 via-blue-900 to-slate-800 overflow-hidden">
            <Image
              src="/images/validacion-digital-cta.png"
              alt="Validación Digital Online: Selfie de Trabajo y GPS activo. Foto en la app, sin visita física."
              fill
              className="object-contain object-center p-3 group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 text-green-800 shrink-0">
                <Camera className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-gray-900">Validación Digital Online</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Sin visita física. Para que sea legalmente válida para el Comité: <strong>Selfie de Trabajo</strong> (YAPÓ Selfie, con herramienta y obra de fondo), <strong>GPS activo obligatorio</strong>, foto sacada en la app (no adjuntar archivo).
            </p>
            <button
              type="button"
              onClick={onViaC}
              className="btn-yapo min-h-[52px] w-full text-base border-2 border-green-600 text-green-800 hover:bg-green-600 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-green-500/25 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              <MapPin className="w-5 h-5" />
              Validación digital (Selfie + GPS)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>Sistema de notificación por geofencing (Operadores YAPÓ):</strong> cuando un trabajador se inscribe por Vía A o C, el sistema detecta su ubicación GPS y envía una alerta a los Operadores YAPÓ de ese barrio o zona. El primero que toque <strong>&quot;Tomar Verificación&quot;</strong> en su celular se queda con ese suscriptor; así se evitan conflictos y se incentiva la validación rápida (5.000 Gs por validación aprobada).
        </div>
      </div>
    </section>
  );
}
