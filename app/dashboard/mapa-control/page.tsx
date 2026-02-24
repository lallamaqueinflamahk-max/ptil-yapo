"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import { buildSeccionalesParaMapaAvanzado } from "@/app/dashboard/maestro/maestroData";
import type { SeccionalMapaControl } from "@/components/dashboard/MapaControlDashboard";
import type { SeccionalRow } from "@/components/dashboard/ControlSeccionales";
import { getAllPuntosMapaCapas } from "@/lib/data/mapaCapasData";
import type { PuntoMapa } from "@/lib/types/mapaCapas";
import { KPICard } from "@/components/ui";
import { Button } from "@/components/ui";

const MapaControlDashboard = dynamic(
  () => import("@/components/dashboard/MapaControlDashboard").then((m) => m.MapaControlDashboard),
  { ssr: false }
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function buildSeccionalesControl(listado: SeccionalRow[]): SeccionalMapaControl[] {
  return buildSeccionalesParaMapaAvanzado(listado) as SeccionalMapaControl[];
}

export default function MapaControlPage() {
  const { chartFilter, resetChartFilter } = useDashboardCharts();
  const selectedSeccional = chartFilter?.type === "seccional" ? chartFilter.value : null;

  const { data } = useSWR("/api/dashboard/maestro", fetcher, { refreshInterval: 15000 });
  const listadoSeccionales: SeccionalRow[] = data?.listadoSeccionales ?? [];
  const capasMapa: Record<string, PuntoMapa[]> = data?.capasMapa ?? getAllPuntosMapaCapas();
  const seccionales = buildSeccionalesControl(listadoSeccionales);

  const totalSeccionales = listadoSeccionales.length;
  const enRiesgo = listadoSeccionales.filter((s) => s.estado === "red" || s.estado === "yellow").length;
  const validadosTotal = listadoSeccionales.reduce((acc, s) => acc + (s.cantidadValidados ?? 0), 0);

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary">
              Mapa control del dashboard
            </h1>
            <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">
              Clic en una seccional filtra KPIs, gráficos y tablas. El mapa no es decorativo.
            </p>
          </div>
          {chartFilter && (
            <div className="flex items-center gap-2 rounded-sentinel-lg border border-semantic-control bg-semantic-control/10 px-4 py-2">
              <span className="text-sentinel-sm font-medium text-semantic-control">
                Filtro activo: <strong>{chartFilter.label ?? chartFilter.value}</strong>
              </span>
              <Button variant="ghost" className="text-sm" onClick={resetChartFilter}>
                Restablecer
              </Button>
            </div>
          )}
        </div>

        {/* KPIs que reaccionan al filtro (ejemplo: podrían venir filtrados por API) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Seccionales"
            value={selectedSeccional ? "1" : totalSeccionales}
            state="normal"
            tooltip={
              selectedSeccional
                ? "Vista filtrada por la seccional seleccionada en el mapa."
                : "Total de seccionales en el ámbito."
            }
            onFilter={resetChartFilter}
            isActive={!!selectedSeccional}
            variation={
              selectedSeccional
                ? { value: "Filtro activo", direction: "neutral" }
                : { value: "Vista global", direction: "neutral" }
            }
          />
          <KPICard
            label="En riesgo"
            value={enRiesgo}
            unit=""
            state={enRiesgo > 5 ? "risk" : enRiesgo > 0 ? "warning" : "positive"}
            tooltip="Seccionales en estado Atención o Crítico. Clic en el mapa para ver detalle."
            onFilter={() => {}}
            variation={{ value: "vs. total", direction: "neutral" }}
          />
          <KPICard
            label="Validados"
            value={validadosTotal.toLocaleString("es-PY")}
            state="normal"
            tooltip="Total de validados en el ámbito. Al filtrar por seccional, este valor podría ser el de esa seccional."
            onFilter={() => {}}
          />
          <KPICard
            label="Acción"
            value={selectedSeccional ? "Ver detalle" : "Clic en mapa"}
            state="control"
            tooltip="Seleccioná una seccional en el mapa para filtrar el dashboard."
            onFilter={resetChartFilter}
            isActive={!!selectedSeccional}
          />
        </div>

        {/* Mapa que controla el dashboard */}
        <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-2">
            Mapa interactivo · Clic filtra KPIs y tablas
          </h2>
          <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
            Activá capas (Lealtad, Riesgo, Verificación, Idoneidad), filtrá por estado y hacé clic
            en un punto. El panel lateral muestra el detalle; el filtro global actualiza los KPIs de arriba.
          </p>
          <MapaControlDashboard
            seccionales={seccionales}
            capas={capasMapa}
            height={520}
          />
        </section>

        {/* Tabla simplificada que también reacciona al filtro (ejemplo) */}
        <section className="rounded-sentinel-xl border border-sentinel-border bg-surface p-4 shadow-card">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-2">
            Seccionales (reaccionan al clic en el mapa)
          </h2>
          <p className="text-sentinel-sm text-sentinel-text-secondary mb-4">
            La fila seleccionada coincide con el filtro del mapa. En un dashboard completo, esta tabla
            mostraría solo la seccional elegida o resaltaría esa fila.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sentinel-sm">
              <thead>
                <tr className="border-b border-sentinel-border bg-surface-alt">
                  <th className="px-3 py-2 font-semibold">Nº</th>
                  <th className="px-3 py-2 font-semibold">Nombre</th>
                  <th className="px-3 py-2 font-semibold">Barrio</th>
                  <th className="px-3 py-2 font-semibold text-right">Validados</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {listadoSeccionales
                  .slice(0, 15)
                  .map((s) => {
                    const isActive =
                      chartFilter?.type === "seccional" && chartFilter.value === String(s.numero);
                    return (
                      <tr
                        key={s.id}
                        className={`border-b border-sentinel-border transition-colors ${
                          isActive
                            ? "border-l-4 border-l-semantic-control bg-semantic-control/10"
                            : "hover:bg-surface-alt/50"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium">{s.numero}</td>
                        <td className="px-3 py-2">{s.nombre}</td>
                        <td className="px-3 py-2 text-sentinel-text-secondary">{s.barrio}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {(s.cantidadValidados ?? 0).toLocaleString("es-PY")}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-sentinel-sm border px-2 py-0.5 text-xs font-semibold ${
                              s.estado === "green"
                                ? "border-semantic-success-border bg-semantic-success-bg text-semantic-success"
                                : s.estado === "yellow"
                                  ? "border-semantic-warning-border bg-semantic-warning-bg text-semantic-warning"
                                  : "border-semantic-danger-border bg-semantic-danger-bg text-semantic-danger"
                            }`}
                          >
                            {s.estadoLabel ?? s.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
