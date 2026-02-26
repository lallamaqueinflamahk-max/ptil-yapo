"use client";

import { useDashboardCharts } from "@/context/DashboardChartContext";
import {
  LineChartDynamic,
  BarChartRanking,
  DonutChartStates,
  EmbudoIdoneidad,
  CHART_PALETTE,
} from "@/components/charts";
import { Button } from "@/components/ui";

const LEALES_POR_LIDERES = [
  { nombre: "Referente", valor: 32, color: CHART_PALETTE[0] },
  { nombre: "Bello", valor: 21, color: CHART_PALETTE[1] },
  { nombre: "Fernández", valor: 15, color: CHART_PALETTE[2] },
  { nombre: "Lopez", valor: 14, color: CHART_PALETTE[3] },
  { nombre: "Otros", valor: 18, color: CHART_PALETTE[4] },
];

const DONUT_DISTRIBUCION = [
  { name: "OK", value: 28, color: CHART_PALETTE[1] },
  { name: "Atención", value: 10, color: CHART_PALETTE[2] },
  { name: "Crítico", value: 7, color: CHART_PALETTE[3] },
];

const ETAPAS_EMBUDO = [
  { id: "certificados", label: "Certificados", valor: 1240, color: CHART_PALETTE[1] },
  { id: "en_tramite", label: "En trámite", valor: 890, color: CHART_PALETTE[2] },
  { id: "sin_proceso", label: "Sin proceso", valor: 2100, color: CHART_PALETTE[3] },
];

function buildDonutData(
  items: Array<{ name: string; value: number; color: string }>
): Array<{ name: string; value: number; color: string }> {
  return items;
}

export default function GraficosDinamicosPage() {
  const { chartFilter, resetChartFilter } = useDashboardCharts();

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary">
              Gráficos dinámicos
            </h1>
            <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">
              Reaccionan a filtros globales. Clic en cualquier gráfico filtra el dashboard; doble clic restablece. Tooltips ricos y colores semánticos.
            </p>
          </div>
          {chartFilter && (
            <div className="flex items-center gap-2 rounded-sentinel-lg border border-semantic-control bg-semantic-control/10 px-4 py-2">
              <span className="text-sentinel-sm font-medium text-semantic-control">
                Filtro: <strong>{chartFilter.label ?? chartFilter.value}</strong>
              </span>
              <Button variant="ghost" className="text-sm" onClick={resetChartFilter}>
                Restablecer
              </Button>
            </div>
          )}
        </div>

        {/* Línea — evolución temporal */}
        <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Línea · Evolución temporal
          </h2>
          <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
            Datos desde API. Clic en un punto filtra por esa fecha; doble clic restablece. Leyenda para mostrar/ocultar series.
          </p>
          <LineChartDynamic
            title=""
            chartId="evolucion-graficos"
            height={320}
            dataKeys={[
              { key: "validados", color: CHART_PALETTE[0], name: "Validados" },
              { key: "leales", color: CHART_PALETTE[1], name: "Leales" },
              { key: "verificados", color: CHART_PALETTE[2], name: "Verificados" },
            ]}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Barras — ranking */}
          <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
            <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
              Barras · Ranking
            </h2>
            <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
              Clic en barra filtra por ese valor. Tooltip con valor y % del total.
            </p>
            <BarChartRanking
              data={LEALES_POR_LIDERES}
              dataKey="nombre"
              barKey="valor"
              nameKey="nombre"
              title=""
              chartId="ranking-leales"
              filterType="ranking"
              height={280}
            />
          </section>

          {/* Donut — distribución */}
          <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
            <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
              Donut · Distribución por estado
            </h2>
            <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
              Clic en segmento filtra por ese estado. Tooltip con valor y porcentaje.
            </p>
            <DonutChartStates
              data={buildDonutData(DONUT_DISTRIBUCION)}
              title=""
              chartId="donut-estados"
              filterType="state"
              height={280}
            />
          </section>
        </div>

        {/* Embudo — conversión laboral */}
        <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Embudo · Conversión laboral
          </h2>
          <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
            Clic en etapa filtra el dashboard por esa etapa. Colores semánticos: éxito (certificados), advertencia (en trámite), riesgo (sin proceso).
          </p>
          <EmbudoIdoneidad
            etapas={ETAPAS_EMBUDO}
            metaPorcentaje={22}
            hideTitle
            filterType="state"
          />
        </section>
      </div>
    </div>
  );
}
