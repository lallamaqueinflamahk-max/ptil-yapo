"use client";

import Link from "next/link";
import useSWR from "swr";
import { MapPin, Users, PieChart, BarChart3 } from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer as BarResponsive,
  Cell as BarCell,
} from "recharts";
import dynamic from "next/dynamic";
import type { HeatmapPoint, LegendItem } from "@/components/MapaCalorAsuncion";

const MapaCalorAsuncion = dynamic(
  () => import("@/components/MapaCalorAsuncion"),
  { ssr: false }
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MAP_LEGEND: LegendItem[] = [
  { color: "#DC2626", label: "R1 Estratégico" },
  { color: "#1E3A8A", label: "R2 Operativo" },
  { color: "#059669", label: "R3 Base" },
];

const DEFAULT_HEATMAP: HeatmapPoint[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  lat: -25.2637 + Math.sin((i / 45) * Math.PI * 2) * 0.04,
  lng: -57.5759 + Math.cos((i / 45) * Math.PI * 2) * 0.04,
  cantidad: 400 + (i * 37) % 1200,
  color: i === 0 ? "#DC2626" : "#1E3A8A",
}));

export default function DashboardMaestroPage() {
  const { data, error } = useSWR("/api/dashboard/maestro", fetcher, {
    refreshInterval: 10000,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-yapo-gray flex items-center justify-center">
        <p className="text-red-600">Error al cargar datos.</p>
      </div>
    );
  }

  const totalVotantes = data?.totalVotantes ?? 35720;
  const seccionales = data?.seccionales ?? 45;
  const concejalesActivos = data?.concejalesActivos ?? 15;
  const lealesPorLideres = data?.lealesPorLideres ?? [
    { nombre: "Sosa", valor: 32, color: "#DC2626" },
    { nombre: "Bello", valor: 21, color: "#1E3A8A" },
    { nombre: "Fernández", valor: 15, color: "#059669" },
    { nombre: "Lopez", valor: 14, color: "#6366F1" },
    { nombre: "Otros", valor: 18, color: "#94A3B8" },
  ];
  const seguidoresPorConcejales = data?.seguidoresPorConcejales ?? [
    { nombre: "Sosa", seguidores: 4200, fill: "#DC2626" },
    { nombre: "Lopez", seguidores: 3100, fill: "#1E3A8A" },
    { nombre: "Ruiz", seguidores: 2800, fill: "#3B82F6" },
    { nombre: "Diaz", seguidores: 2500, fill: "#6366F1" },
    { nombre: "Bello", seguidores: 2300, fill: "#059669" },
  ];
  const heatmapPoints: HeatmapPoint[] =
    data?.heatmapPoints?.length ? (data.heatmapPoints as HeatmapPoint[]) : DEFAULT_HEATMAP;

  const renderActiveShape = (props: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: { nombre: string };
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-yapo-gray">
      <header className="bg-yapo-blue text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="/camilo-perez.jpg"
                alt="Camilo"
                className="h-12 w-12 rounded-full border-2 border-white object-cover bg-white/20"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Panel de Control Maestro</h1>
              <p className="text-sm text-white/90">Camilo</p>
            </div>
          </div>
          <Link href="/" className="text-yapo-orange-light hover:underline text-sm shrink-0">
            Volver a Inicio
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Métricas globales</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-yapo-orange/10 border border-yapo-orange/30 p-4">
              <p className="text-3xl font-bold text-yapo-orange">
                {totalVotantes.toLocaleString("es-PY")}
              </p>
              <p className="text-sm text-gray-600">Total de votantes</p>
            </div>
            <div className="rounded-xl bg-yapo-blue/10 border border-yapo-blue/30 p-4">
              <p className="text-3xl font-bold text-yapo-blue">{seccionales}</p>
              <p className="text-sm text-gray-600">Seccionales</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
              <p className="text-3xl font-bold text-emerald-600">{concejalesActivos}</p>
              <p className="text-sm text-gray-600">Concejales activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Mapa de calor - {seccionales} Seccionales (por rango)
            </h2>
          </div>
          {heatmapPoints.length > 0 ? (
            <MapaCalorAsuncion points={heatmapPoints} legend={MAP_LEGEND} />
          ) : (
            <div className="h-[400px] rounded-xl bg-yapo-gray flex items-center justify-center text-gray-500">
              Cargando mapa…
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-8 h-8 text-yapo-blue" />
              <h2 className="text-lg font-semibold text-yapo-blue">Leales por Líderes</h2>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={lealesPorLideres}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    activeShape={renderActiveShape}
                    activeIndex={undefined}
                    label={({ nombre, valor }) => `${nombre} ${valor}%`}
                  >
                    {lealesPorLideres.map((entry: { color: string }, i: number) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-yapo-blue" />
              <h2 className="text-lg font-semibold text-yapo-blue">
                Seguidores por Concejales
              </h2>
            </div>
            <div className="h-[280px]">
              <BarResponsive width="100%" height="100%">
                <BarChart
                  data={seguidoresPorConcejales}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString("es-PY")} />
                  <BarTooltip
                    formatter={(v: number) => v?.toLocaleString("es-PY")}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="seguidores" name="Seguidores" radius={[6, 6, 0, 0]} cursor="pointer">
                    {(seguidoresPorConcejales as { fill?: string }[]).map((entry, i) => (
                      <BarCell key={i} fill={entry.fill ?? "#F59E0B"} />
                    ))}
                  </Bar>
                </BarChart>
              </BarResponsive>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
