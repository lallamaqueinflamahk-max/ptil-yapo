"use client";

import { useMasterKey } from "@/hooks/useMasterKey";
import { setMasterKey } from "@/lib/utils/masterKey";

export default function Footer() {
  const masterKey = useMasterKey();

  return (
    <footer className="mt-auto border-t border-yapo-gray-dark bg-yapo-white px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4 text-center">
        {masterKey ? (
          <p className="text-sm">
            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium mr-2">
              Modo demo activo
            </span>
            <button
              type="button"
              onClick={() => {
                setMasterKey(false);
                window.location.reload();
              }}
              className="text-yapo-blue underline hover:no-underline"
            >
              Desactivar
            </button>
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            <button
              type="button"
              onClick={() => {
                setMasterKey(true);
                window.location.reload();
              }}
              className="underline hover:text-gray-600"
            >
              Modo demo (master key)
            </button>
          </p>
        )}
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Cláusula de Privacidad y Blindaje GGT
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          YAPÓ no valida ideologías; ordena oficios preexistentes. Gestión
          exclusiva de{" "}
          <strong>GUARANÍ GLOBAL TECH CORPORATION (GGT)</strong>.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Al registrarte, autorizás el uso de imagen para certificación de
          idoneidad y acceso al Seguro YAPÓ Insurtech.
        </p>
      </div>
    </footer>
  );
}
