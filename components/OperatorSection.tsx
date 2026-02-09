"use client";

import { UserCheck } from "lucide-react";

interface OperatorSectionProps {
  onValidationInSitu: () => void;
}

export default function OperatorSection({ onValidationInSitu }: OperatorSectionProps) {
  return (
    <section className="px-4 py-6 max-w-4xl mx-auto">
      <div className="bg-yapo-gray-dark/60 rounded-2xl p-6 border border-yapo-gray-dark">
        <p className="text-center text-gray-700 text-lg mb-4">
          ¿Te está ayudando un Agente? Iniciar Registro con Operador
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onValidationInSitu}
            className="btn-yapo btn-yapo-secondary min-h-[60px] px-6 flex items-center gap-2"
          >
            <UserCheck className="w-6 h-6" aria-hidden />
            VALIDACIÓN IN SITU
          </button>
        </div>
      </div>
    </section>
  );
}
