"use client";

interface HeroProps {
  onRegister: () => void;
}

export default function Hero({ onRegister }: HeroProps) {
  return (
    <section className="px-4 py-10 md:py-14 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-yapo-blue text-center leading-tight mb-4">
        Programa Territorial de Idoneidad Laboral (PTIL)
      </h1>

      <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto mb-8">
        Ordenando la fuerza que mueve a Asunción. Formalizá tu oficio y accedé a
        los beneficios de la Red YAPÓ.
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRegister}
          className="btn-yapo btn-yapo-primary min-h-[56px] px-8 text-xl"
        >
          REGISTRARME AHORA
        </button>
      </div>
    </section>
  );
}
