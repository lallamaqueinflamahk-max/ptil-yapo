"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    estadoVerificacion?: string;
    nombre?: string;
    fechaInscripcion?: string;
    mensaje?: string;
    estadoIdoneidad?: string;
    grupo?: string;
    tieneCertificacion?: boolean;
    derivadoACapacitacion?: boolean;
    error?: string;
  } | null>(null);

  const labelsIdoneidad: Record<string, string> = {
    CERTIFICADO: "Certificado",
    PENDIENTE_COMITE: "Pendiente de comité",
    EN_CAPACITACION: "En capacitación",
    CERTIFICADO_POST_CAPACITACION: "Certificado (post capacitación)",
    SIN_RESPALDO: "Sin respaldo (requiere derivación a capacitación)",
  };

  const consultar = async () => {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/subscriptores/verificar?codigo=${encodeURIComponent(c)}`);
      const json = await res.json();
      setResult(json);
    } catch {
      setResult({ ok: false, error: "Error de conexión." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yapo-gray flex flex-col">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-yapo-orange-light hover:underline flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <h1 className="text-xl font-bold">Consultar estado de inscripción</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        <p className="text-gray-600 mb-6">
          Ingresá el código de verificación que recibiste al inscribirte para ver el estado de tu ficha.
        </p>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && consultar()}
            placeholder="Ej. ABC12XYZ"
            className="input-yapo flex-1 font-mono tracking-wider"
            maxLength={12}
          />
          <button
            type="button"
            onClick={consultar}
            disabled={loading || !codigo.trim()}
            className="btn-yapo btn-yapo-primary shrink-0 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? "Buscando…" : "Consultar"}
          </button>
        </div>
        {result && (
          <div
            className={`rounded-xl border-2 p-4 ${
              result.ok
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {result.ok ? (
              <>
                <p className="font-semibold">{result.nombre}</p>
                <p className="text-sm mt-1">
                  Estado de verificación: <strong>{result.estadoVerificacion}</strong>
                </p>
                {result.estadoIdoneidad && (
                  <p className="text-sm mt-1">
                    Estado de idoneidad laboral:{" "}
                    <strong>{labelsIdoneidad[result.estadoIdoneidad] ?? result.estadoIdoneidad}</strong>
                    {result.grupo && (
                      <span className="text-gray-600 font-normal"> ({result.grupo})</span>
                    )}
                  </p>
                )}
                {result.fechaInscripcion && (
                  <p className="text-sm mt-1">Fecha de inscripción: {result.fechaInscripcion}</p>
                )}
                <p className="text-sm mt-2">{result.mensaje}</p>
              </>
            ) : (
              <p>{result.error ?? "No se encontró la inscripción."}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
