"use client";

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
        Caminos de Registro (Input de Datos)
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-2xl mx-auto">
        El sistema permite ambas vías para no perder a ningún trabajador. Elegí cómo querés inscribirte.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Auto-Registro */}
        <div className="bg-white rounded-2xl p-5 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-yapo-blue">
              <Smartphone className="w-5 h-5" />
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Auto-Registro</h3>
          <p className="text-sm text-gray-600 mb-3">
            El trabajador carga solo: entrá desde tu celular, subí cédula, datos básicos y tu foto. El sistema asigna <strong>Estado: Pendiente de Verificación</strong>. Se envía alerta a un <strong>Operador YAPÓ</strong> de tu zona para que agende la visita o verifique online.
          </p>
          <button
            type="button"
            onClick={onViaA}
            className="btn-yapo btn-yapo-primary w-full min-h-[52px] text-base"
          >
            Registrarme ahora
          </button>
        </div>

        {/* Carga Directa */}
        <div className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-800">
              <UserCheck className="w-5 h-5" />
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Carga Directa</h3>
          <p className="text-sm text-gray-600 mb-3">
            Un <strong>Operador YAPÓ</strong> te registra en tu puesto de trabajo o en verificación in situ (va a tu casa si trabajás ahí). El Operador actúa como caza talentos y la verificación es <strong>instantánea</strong>: saca fotos y valida en el momento.
          </p>
          <button
            type="button"
            onClick={onViaB}
            className="btn-yapo btn-yapo-secondary w-full min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            Registro con Operador YAPÓ
          </button>
        </div>

        {/* Validación Digital Online */}
        <div className="bg-white rounded-2xl p-5 border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 text-green-800">
              <Camera className="w-5 h-5" />
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Validación Digital Online</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sin visita física. Para que sea legalmente válida para el Comité: <strong>Selfie de Trabajo</strong> (YAPÓ Selfie, con herramienta y obra de fondo), <strong>GPS activo obligatorio</strong>, foto sacada en la app (no adjuntar archivo).
          </p>
          <button
            type="button"
            onClick={onViaC}
            className="btn-yapo min-h-[52px] w-full text-base border-2 border-green-600 text-green-800 hover:bg-green-600 hover:text-white transition-colors rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Validación digital (Selfie + GPS)
          </button>
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
