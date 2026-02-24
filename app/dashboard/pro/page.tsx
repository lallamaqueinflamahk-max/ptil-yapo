"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Users, MapPin, UserCheck, Award, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import KPICard from "@/components/dashboard/KPICard";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import BarChartRanking from "@/components/charts/BarChartRanking";
import { PAGES } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FILTER_LABELS: Record<string, string> = {
  lealtad: "Lealtad Global",
  suscriptores: "Suscriptores activos hoy",
};

function ProContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") ?? undefined;
  const filterLabel = filter ? FILTER_LABELS[filter] ?? filter : null;
  const { chartFilter, resetChartFilter } = useDashboardCharts();

  const { data, error } = useSWR("/api/dashboard/pro", fetcher, {
    refreshInterval: 10000,
  });

  if (error) {
    return (
      <div className="rounded-[14px] border border-dash-red/30 bg-dash-red/5 p-6 text-dash-red">
        Error al cargar datos. Reintentá en unos segundos.
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

  return (
    <div className="space-y-8">
      {filterLabel && (
        <div className="rounded-[14px] border border-dash-blue/25 bg-dash-blue/8 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium text-dash-blue">
            Vista detallada: <span className="font-semibold">{filterLabel}</span> — rankings y tablas filtrados por este indicador.
          </p>
          <Link
            href="/dashboard/pro"
            className="text-sm font-medium text-dash-blue hover:underline"
          >
            Quitar filtro
          </Link>
        </div>
      )}
      {chartFilter && (
        <div className="rounded-[14px] border border-dash-yellow/30 bg-dash-yellow/10 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium text-dash-blue">
            Filtro desde gráfico: <span className="font-semibold">{chartFilter.label ?? chartFilter.value}</span>. Doble clic en cualquier gráfico para restablecer.
          </p>
          <button type="button" onClick={resetChartFilter} className="text-sm font-medium text-dash-blue hover:underline">
            Restablecer vista
          </button>
        </div>
      )}
      <PageHero
        title={PAGES.pro.title}
        subtitle={PAGES.pro.subtitle}
        trust={PAGES.pro.trust}
        forWho={PAGES.pro.forWho}
      />

      <section aria-label="Métricas de estructura">
        <h2 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">
          Métricas de estructura
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            value={afiliadosLeales}
            label="Afiliados Leales"
            variant="green"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <KPICard
            value={seccionales}
            label="Seccionales"
            variant="blue"
            icon={<MapPin className="w-5 h-5" />}
          />
          <KPICard
            value={operadores}
            label="Operadores YAPÓ"
            variant="green"
            icon={<UserCheck className="w-5 h-5" />}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard interactive={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-dash-blue" />
              <h2 className="text-base font-semibold text-dash-blue">
                Ranking de Presidentes de Seccional
              </h2>
            </div>
            <BarChartRanking
              data={rankingPresidentes}
              dataKey="nombre"
              barKey="leales"
              nameKey="nombre"
              chartId="pro-ranking-presidentes"
              filterType="ranking"
              height={260}
            />
          </div>
        </DashboardCard>

        <DashboardCard interactive={false}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-dash-blue" />
              <h2 className="text-base font-semibold text-dash-blue">
                Rendimiento de Operadores YAPÓ (Score)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2.5 font-semibold text-dash-muted">Operador</th>
                    <th className="text-right py-2.5 font-semibold text-dash-muted">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rendimientoOperadores.map((op: { nombre: string; score: number }) => (
                    <tr
                      key={op.nombre}
                      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-dashboard"
                    >
                      <td className="py-3 font-medium text-gray-800">{op.nombre}</td>
                      <td className="py-3 text-right font-semibold text-dash-blue tabular-nums">
                        {op.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

export default function DashboardProPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-dash-muted">
          Cargando...
        </div>
      }
    >
      <ProContent />
    </Suspense>
  );
}
