"use client";

import Link from "next/link";
import { useMasterKey } from "@/hooks/useMasterKey";
import { setMasterKey } from "@/lib/utils/masterKey";

async function enableDemoMode(): Promise<boolean> {
  const resCheck = await fetch("/api/master-key");
  const { required } = (await resCheck.json()) as { required: boolean };
  if (!required) {
    return true;
  }
  const key = window.prompt("Clave admin master:");
  if (key == null) return false;
  const resValidate = await fetch("/api/master-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  const { allowed } = (await resValidate.json()) as { allowed: boolean };
  return allowed;
}

export default function Footer() {
  const masterKey = useMasterKey();

  return (
    <footer className="mt-auto border-t-2 border-yapo-blue/50 bg-gradient-to-r from-blue-200/60 via-amber-100/50 to-orange-200/50 px-4 py-6">
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
          <p className="text-[11px] text-gray-400">
            <button
              type="button"
              onClick={async () => {
                const ok = await enableDemoMode();
                if (ok) {
                  setMasterKey(true);
                  window.location.reload();
                } else {
                  window.alert("Clave incorrecta o cancelado.");
                }
              }}
              className="text-gray-400 hover:text-gray-500 underline decoration-dotted"
            >
              Staff: modo demo
            </button>
          </p>
        )}
        <p className="text-sm text-gray-600">
          <Link href="/verificar" className="text-yapo-blue hover:text-amber-600 hover:underline font-medium transition-colors">
            Consultar estado de mi inscripción
          </Link>
        </p>
        <p className="text-xs font-medium text-blue-800/90 uppercase tracking-wide">
          Cláusula de Privacidad y Blindaje GGT
        </p>
        <p className="text-sm text-blue-900/80 leading-relaxed">
          <span className="font-semibold text-amber-800">YAPÓ</span> no valida ideologías; ordena oficios preexistentes. Gestión
          exclusiva de{" "}
          <strong className="text-yapo-blue">GUARANÍ GLOBAL TECH CORPORATION (GGT)</strong>.
        </p>
        <p className="text-xs text-blue-800/70 leading-relaxed">
          Al registrarte, autorizás el uso de imagen para certificación de
          idoneidad y acceso al Seguro YAPÓ Insurtech.
        </p>
      </div>
    </footer>
  );
}
