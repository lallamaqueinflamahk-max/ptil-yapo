"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, History } from "lucide-react";

const STORAGE_KEY_ULTIMO_CODIGO = "ptil_ultimo_codigo_verificar";

function VerificarContent() {
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState("");
  const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);
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
    carnet?: {
      nombreCompleto: string;
      cedulaNro: string;
      oficioPrincipal: string;
      selfieDataUrl: string | null;
      codigoVerificacion: string;
      fechaInscripcion: string;
    };
    error?: string;
  } | null>(null);

  const labelsIdoneidad: Record<string, string> = {
    CERTIFICADO: "Certificado",
    PENDIENTE_COMITE: "Pendiente de comité",
    EN_CAPACITACION: "En capacitación",
    CERTIFICADO_POST_CAPACITACION: "Certificado (post capacitación)",
    SIN_RESPALDO: "Sin respaldo (requiere derivación a capacitación)",
  };

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_ULTIMO_CODIGO) : null;
    if (saved) setUltimoCodigo(saved);
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("codigo");
    if (fromUrl) {
      setCodigo(fromUrl.trim().toUpperCase());
    }
  }, [searchParams]);

  const consultar = async (codigoOverride?: string) => {
    const c = (codigoOverride ?? codigo).trim().toUpperCase();
    if (!c) return;
    if (!codigoOverride) setCodigo(c);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/subscriptores/verificar?codigo=${encodeURIComponent(c)}`);
      const json = await res.json();
      setResult(json);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ULTIMO_CODIGO, c);
        setUltimoCodigo(c);
      }
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
        <p className="text-gray-700 mb-6 font-medium">
          Ingresá el código de verificación que recibiste al inscribirte para ver el estado de tu ficha.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && consultar()}
            placeholder="Ej. ABC12XYZ"
            className="input-yapo flex-1 font-mono tracking-wider min-h-[48px]"
            maxLength={12}
          />
          <button
            type="button"
            onClick={() => consultar()}
            disabled={loading || !codigo.trim()}
            className="btn-yapo btn-yapo-primary shrink-0 disabled:opacity-50 min-h-[48px]"
          >
            <Search className="w-5 h-5" />
            {loading ? "Buscando…" : "Consultar"}
          </button>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          El código está en el mensaje que te enviamos al inscribirte.
        </p>
        {ultimoCodigo && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <History className="w-4 h-4 text-gray-600" aria-hidden />
            <span className="text-sm text-gray-700">Última consulta:</span>
            <button
              type="button"
              onClick={() => consultar(ultimoCodigo)}
              className="text-sm font-mono font-semibold text-yapo-blue hover:underline"
            >
              {ultimoCodigo}
            </button>
          </div>
        )}
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

                {/* Carnet tipo cédula de trabajador YAPÓ certificado */}
                {result.estadoVerificacion === "VERIFICADO" && result.carnet && (
                  <div className="mt-6 rounded-xl border-2 border-yapo-blue bg-white overflow-hidden shadow-lg max-w-sm mx-auto">
                    <div className="bg-yapo-blue text-white px-4 py-2 text-center">
                      <p className="text-xs font-medium uppercase tracking-wider">Programa Territorial de Idoneidad Laboral</p>
                      <p className="text-lg font-bold">YAPÓ Certificado</p>
                    </div>
                    <div className="p-4 flex gap-4">
                      <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-yapo-orange bg-yapo-gray">
                        {result.carnet.selfieDataUrl ? (
                          <img
                            src={result.carnet.selfieDataUrl}
                            alt="Foto del trabajador"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-yapo-gray-dark">👤</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate" title={result.carnet.nombreCompleto}>
                          {result.carnet.nombreCompleto}
                        </p>
                        <p className="text-sm text-gray-600">Cédula: {result.carnet.cedulaNro}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Oficio:</span> {result.carnet.oficioPrincipal}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">Código: {result.carnet.codigoVerificacion}</p>
                        <p className="text-xs text-gray-600">Inscripción: {result.carnet.fechaInscripcion}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                        Datos personales verificados
                      </span>
                    </div>
                  </div>
                )}
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

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yapo-gray flex items-center justify-center">
        <p className="text-gray-600">Cargando…</p>
      </div>
    }>
      <VerificarContent />
    </Suspense>
  );
}
