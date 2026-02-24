"use client";

import { UserCheck } from "lucide-react";

interface OperatorSectionProps {
  onValidationInSitu: () => void;
}

export default function OperatorSection({ onValidationInSitu }: OperatorSectionProps) {
  return (
    <section className="px-4 py-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-200/80 via-amber-100/70 to-orange-200/60 rounded-2xl p-6 border-2 border-yapo-blue/50 shadow-xl hover:shadow-2xl hover:border-blue-500/60 transition-all duration-300">
        <p className="text-center text-blue-900 text-lg mb-4 font-semibold">
          ¿Te está registrando un Operador YAPÓ? <span className="text-amber-800">Abrir registro con Operador YAPÓ</span>
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onValidationInSitu}
            className="btn-yapo btn-yapo-secondary min-h-[60px] px-6 flex items-center gap-2 hover:scale-105 active:scale-[0.98] ring-2 ring-blue-300/50"
          >
            <UserCheck className="w-6 h-6" aria-hidden />
            VALIDACIÓN IN SITU
          </button>
        </div>
      </div>
    </section>
  );
}
