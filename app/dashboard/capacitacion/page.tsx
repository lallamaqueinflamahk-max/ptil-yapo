"use client";

import Link from "next/link";
import useSWR from "swr";
import { BookOpen, PieChart, Table, CheckCircle2, AlertCircle } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardCapacitacionPage() {
  const { data, error } = useSWR("/api/dashboard/capacitacion", fetcher, {
    refreshInterval: 10000,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-yapo-gray flex items-center justify-center">
        <p className="text-red-600">Error al cargar datos.</p>
      </div>
    );
  }

  const contadoresPorOficio = data?.contadoresPorOficio ?? [
    { oficio: "Albañiles", cantidad: 1280 },
    { oficio: "Plomeros", cantidad: 940 },
    { oficio: "Electricistas", cantidad: 730 },
    { oficio: "Limpieza", cantidad: 615 },
  ];
  const matrizReforma = data?.matrizReforma ?? [
    { label: "Certificados", valor: 80, color: "#22C55E" },
    { label: "Necesita capacitación", valor: 20, color: "#EF4444" },
  ];
  const actividad = data?.actividadTiempoReal ?? [
    { id: "1", nombre: "Juan Pérez", oficio: "Albañil", clasificacion: "Por Capacitar" },
    { id: "2", nombre: "María García", oficio: "Electricista", clasificacion: "Certificado" },
  ];

  return (
    <div className="min-h-screen bg-yapo-gray">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard de Capacitación</h1>
          <Link href="/" className="text-yapo-orange-light hover:underline text-sm">
            Volver a Inicio
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Contadores por Oficio
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {contadoresPorOficio.map((item: { oficio: string; cantidad: number }) => (
              <div
                key={item.oficio}
                className="rounded-xl bg-yapo-gray p-4 border border-yapo-gray-dark"
              >
                <p className="text-2xl font-bold text-yapo-blue">
                  {item.cantidad.toLocaleString("es-PY")}
                </p>
                <p className="text-sm text-gray-600">{item.oficio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Matriz de Reforma
            </h2>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={matrizReforma}
                  dataKey="valor"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {matrizReforma.map((entry: { color: string }, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            80% Certificados vs 20% necesita capacitación
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <Table className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Actividad en tiempo real
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yapo-gray-dark">
                  <th className="text-left py-2 font-semibold text-yapo-blue">Trabajador</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Oficio</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Clasificación</th>
                  <th className="text-right py-2 font-semibold text-yapo-blue">Acción</th>
                </tr>
              </thead>
              <tbody>
                {actividad.map((row: { id: string; nombre: string; oficio: string; clasificacion: string }) => (
                  <tr key={row.id} className="border-b border-yapo-gray">
                    <td className="py-3">{row.nombre}</td>
                    <td className="py-3">{row.oficio}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.clasificacion === "Certificado"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.clasificacion === "Certificado" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {row.clasificacion}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="text-yapo-blue font-medium hover:underline"
                      >
                        Auditar
                      </button>
                    </td>
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
