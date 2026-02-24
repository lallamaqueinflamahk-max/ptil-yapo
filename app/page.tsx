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
