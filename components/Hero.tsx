"use client";

import LogoYapo from "./LogoYapo";

interface HeroProps {
  onRegister: () => void;
}

export default function Hero({ onRegister }: HeroProps) {
  return (
    <section className="px-4 py-2 md:py-3 max-w-4xl mx-auto rounded-b-2xl bg-gradient-to-b from-blue-100 via-amber-100/90 to-orange-100/80 border-x-2 border-b-2 border-blue-200/60 shadow-lg">
      <div className="flex justify-center mb-1">
        <LogoYapo
          logoSrc="/logo-yapo-oficial.png"
          size="xl"
          className="max-w-[min(90vw,28rem)]"
          rotate3d
        />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yapo-blue via-blue-700 to-yapo-blue bg-clip-text text-transparent text-center leading-tight mb-1">
        Programa de certificación de idoneidad laboral
      </h1>

      <p className="text-lg text-blue-900/90 text-center max-w-2xl mx-auto mb-4 font-medium">
        Ordenando la fuerza que mueve a Asunción. Formalizá tu oficio y accedé a
        los beneficios de la <span className="text-amber-700 font-semibold">Red YAPÓ</span>.
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRegister}
          className="btn-yapo btn-yapo-primary min-h-[56px] px-8 text-xl hover:scale-105 active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200"
        >
          REGISTRARME AHORA
        </button>
      </div>
    </section>
  );
}
