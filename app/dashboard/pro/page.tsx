"use client";

import Link from "next/link";
import useSWR from "swr";
import { Users, Award, TrendingUp, Coins } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardProPage() {
  const { data, error } = useSWR("/api/dashboard/pro", fetcher, {
    refreshInterval: 10000,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-yapo-gray flex items-center justify-center">
        <p className="text-red-600">Error al cargar datos.</p>
      </div>
    );
  }

  const afiliadosLeales = data?.afiliadosLeales ?? 4520;
  const seccionales = data?.seccionales ?? 8;
  const operadores = data?.operadores ?? 38;
  const rankingPresidentes = data?.rankingPresidentes ?? [
    { nombre: "Lopez", leales: 540 },
    { nombre: "Ramirez", leales: 460 },
    { nombre: "Gimenez", leales: 420 },
  ];
  const rendimientoOperadores = data?.rendimientoOperadores ?? [
    { nombre: "Carvallo", score: 92 },
    { nombre: "Gimenez", score: 83 },
    { nombre: "Rojas", score: 78 },
  ];
  const maxLeales = Math.max(...rankingPresidentes.map((p: { leales: number }) => p.leales), 1);

  return (
    <div className="min-h-screen bg-yapo-gray">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/concejal-miguel-sosa-anr.jpg"
              alt="Miguel Sosa"
              className="h-12 w-12 rounded-full border-2 border-white object-cover bg-white/20 shrink-0"
            />
            <div>
              <h1 className="text-xl font-bold">Panel de Control (Miguel Sosa)</h1>
              <p className="text-sm text-white/90">Candidato a Concejal</p>
            </div>
          </div>
          <Link href="/" className="text-yapo-orange-light hover:underline text-sm shrink-0">
            Volver a Inicio
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-lg font-semibold text-yapo-blue mb-4">
            Gestión de estructura
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-yapo-orange/10 rounded-xl p-4 border border-yapo-orange/30">
              <p className="text-2xl font-bold text-yapo-orange">
                {afiliadosLeales.toLocaleString("es-PY")}
              </p>
              <p className="text-sm text-gray-600">Afiliados Leales</p>
            </div>
            <div className="bg-yapo-blue/10 rounded-xl p-4 border border-yapo-blue/30">
              <p className="text-2xl font-bold text-yapo-blue">{seccionales}</p>
              <p className="text-sm text-gray-600">Seccionales</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-2xl font-bold text-emerald-600">{operadores}</p>
              <p className="text-sm text-gray-600">Operadores YAPÓ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-yapo-orange" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Ranking de Presidentes de Seccional
            </h2>
          </div>
          <ul className="space-y-4">
            {rankingPresidentes.map((p: { nombre: string; leales: number }) => (
              <li key={p.nombre}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-gray-800 w-28">{p.nombre}</span>
                  <span className="text-sm font-semibold text-yapo-blue">
                    {p.leales.toLocaleString("es-PY")} leales
                  </span>
                </div>
                <div className="h-3 bg-yapo-gray-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yapo-orange rounded-full transition-all"
                    style={{ width: `${(p.leales / maxLeales) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Rendimiento de Operadores YAPÓ (Score)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yapo-gray-dark">
                  <th className="text-left py-2 font-semibold text-yapo-blue">Operador</th>
                  <th className="text-right py-2 font-semibold text-yapo-blue">Score</th>
                </tr>
              </thead>
              <tbody>
                {rendimientoOperadores.map((op: { nombre: string; score: number }) => (
                  <tr key={op.nombre} className="border-b border-yapo-gray">
                    <td className="py-3">{op.nombre}</td>
                    <td className="py-3 text-right font-bold text-yapo-blue">{op.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
