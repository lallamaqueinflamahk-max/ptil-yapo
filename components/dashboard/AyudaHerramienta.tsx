"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export interface ItemAyuda {
  /** Nombre del botón, capa o elemento (ej. "Leales", "Estado OK") */
  label: string;
  /** Qué hace y cómo interpretarlo */
  descripcion: string;
}

export interface AyudaHerramientaProps {
  /** Título de la herramienta (ej. "Mapa interactivo") */
  titulo: string;
  /** Explicación general: qué es esta herramienta y para qué sirve */
  introduccion: string;
  /** Lista de elementos (botones, capas, leyendas) con su explicación */
  items?: ItemAyuda[];
  /** Clases para el botón de ayuda */
  className?: string;
}

export default function AyudaHerramienta({
  titulo,
  introduccion,
  items = [],
  className = "",
}: AyudaHerramientaProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-yapo-blue/40 text-yapo-blue hover:bg-yapo-blue/10 hover:border-yapo-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-yapo-blue focus-visible:ring-offset-2 transition-colors ${className}`}
        aria-label={`Ayuda: cómo usar ${titulo}`}
        title={`Cómo usar ${titulo}`}
      >
        <HelpCircle className="w-4 h-4" aria-hidden />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ayuda-titulo"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 bg-yapo-blue/5">
              <h2 id="ayuda-titulo" className="text-lg font-bold text-yapo-blue">
                Cómo usar: {titulo}
              </h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yapo-blue"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">¿Qué es y para qué sirve?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{introduccion}</p>
              </section>
              {items.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Elementos y controles</h3>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.label} className="border-l-4 border-yapo-blue/30 pl-3 py-1">
                        <span className="font-medium text-gray-800">{item.label}</span>
                        <p className="text-sm text-gray-600 mt-0.5">{item.descripcion}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
