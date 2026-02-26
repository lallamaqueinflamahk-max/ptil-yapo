"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CaminosRegistro from "@/components/CaminosRegistro";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";
import { setMasterKey } from "@/lib/utils/masterKey";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [isOperatorFlow, setIsOperatorFlow] = useState(false);

  const [healthResult, setHealthResult] = useState<{ ok: boolean; database: string; hint?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("master") === "1") {
      void fetch("/api/master-key")
        .then((r) => r.json())
        .then((data: { required: boolean }) => {
          if (!data.required) {
            setMasterKey(true);
          }
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
    if (params.get("operador") === "1") {
      setIsOperatorFlow(true);
      setShowForm(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
    // Diagnóstico: ?health=1 hace POST a /api/subscriptores (funciona aunque /api/health dé 404)
    if (params.get("health") === "1") {
      fetch("/api/subscriptores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healthCheck: true }),
      })
        .then((r) => r.json())
        .then((data: { ok?: boolean; database?: string; hint?: string }) => {
          setHealthResult({
            ok: !!data.ok,
            database: data.database ?? "unknown",
            hint: data.hint,
          });
        })
        .catch(() => setHealthResult({ ok: false, database: "error", hint: "No se pudo conectar al servidor." }));
    }
  }, []);

  const openViaA = () => {
    setIsOperatorFlow(false);
    setShowForm(true);
  };

  const openViaB = () => {
    setIsOperatorFlow(true);
    setShowForm(true);
  };

  const openViaC = () => {
    setIsOperatorFlow(false);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {healthResult && (
        <div
          className={`px-4 py-3 text-center text-sm font-medium ${
            healthResult.ok ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"
          }`}
          role="alert"
        >
          Base de datos: <strong>{healthResult.database}</strong>
          {healthResult.hint && <span className="block mt-1">{healthResult.hint}</span>}
        </div>
      )}
      <Header />
      <main className="flex-1">
        <Hero />
        <CaminosRegistro onViaA={openViaA} onViaB={openViaB} onViaC={openViaC} />
      </main>
      <Footer />

      {showForm && (
        <RegisterForm
          onClose={() => setShowForm(false)}
          isOperatorFlow={isOperatorFlow}
        />
      )}
    </div>
  );
}
