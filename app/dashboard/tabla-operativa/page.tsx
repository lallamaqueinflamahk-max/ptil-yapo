"use client";

import { useMemo } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import { OperationalTable, Button, Badge } from "@/components/ui";
import type { OperationalTableColumn, QuickFilterOption } from "@/components/ui";

type Estado = "green" | "yellow" | "red";

interface SeccionalRow {
  id: string;
  numero: number;
  nombre: string;
  barrio: string;
  titular: string;
  estado: Estado;
  estadoLabel: string;
  cantidadValidados: number;
  contacto: string | null;
}

const ESTADO_BADGE: Record<Estado, "success" | "warning" | "danger"> = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

function buildMockData(): SeccionalRow[] {
  const barrios = ["Villa Morra", "Sajonia", "Loma Pyta", "San Pablo", "Recoleta", "Catedral", "La Encarnación", "Pinozá"];
  const titulares = ["Ana García", "Carlos López", "María Fernández", "José Martínez", "Lucía Pérez", "Pedro Sánchez", "Rosa Díaz", "Miguel Torres"];
  const rows: SeccionalRow[] = [];
  const estados: Estado[] = ["green", "green", "yellow", "red", "green", "yellow", "green", "red"];
  const labels: Record<Estado, string> = { green: "OK", yellow: "Atención", red: "Crítico" };
  for (let i = 1; i <= 20; i++) {
    const estado = estados[i % estados.length];
    rows.push({
      id: `s-${i}`,
      numero: i,
      nombre: `Seccional ${i}`,
      barrio: barrios[i % barrios.length],
      titular: titulares[i % titulares.length],
      estado,
      estadoLabel: labels[estado],
      cantidadValidados: 80 + (i * 37) % 400,
      contacto: i % 3 === 0 ? null : `+595 981 ${100 + i} ${100 + i}`,
    });
  }
  return rows;
}

const MOCK_DATA = buildMockData();

const QUICK_FILTERS: QuickFilterOption[] = [
  { value: null, label: "Todos" },
  { value: "green", label: "OK" },
  { value: "yellow", label: "Atención" },
  { value: "red", label: "Crítico" },
];

export default function TablaOperativaPage() {
  const { chartFilter, resetChartFilter } = useDashboardCharts();

  const columns: OperationalTableColumn<SeccionalRow>[] = useMemo(
    () => [
      {
        key: "estado",
        label: "Estado",
        sortable: true,
        render: (row) => (
          <Badge variant={ESTADO_BADGE[row.estado]} outline>
            {row.estadoLabel}
          </Badge>
        ),
      },
      { key: "numero", label: "Nº", sortable: true, numeric: true },
      { key: "nombre", label: "Seccional", sortable: true },
      { key: "barrio", label: "Barrio", sortable: true },
      { key: "titular", label: "Titular", sortable: true },
      {
        key: "cantidadValidados",
        label: "Validados",
        sortable: true,
        numeric: true,
        render: (row) => row.cantidadValidados.toLocaleString("es-PY"),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary">
              Tabla operativa
            </h1>
            <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">
              Primera columna visual (estado), orden dinámico, filtros rápidos, clic en fila recalcula dashboard, acciones inline.
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

        <OperationalTable<SeccionalRow>
          data={MOCK_DATA}
          columns={columns}
          filterValueKey="numero"
          filterLabelKey="nombre"
          filterType="seccional"
          quickFilters={QUICK_FILTERS}
          quickFilterRowKey="estado"
          defaultSortKey="cantidadValidados"
          defaultSortDir="desc"
          getSortValue={(row, key) => {
            if (key === "estado") {
              const o: Record<Estado, number> = { red: 0, yellow: 1, green: 2 };
              return o[row.estado] ?? 2;
            }
            const v = row[key as keyof SeccionalRow];
            if (typeof v === "number") return v;
            return String(v ?? "");
          }}
          hint="Clic en fila = filtrar mapa y KPIs · Doble clic = restablecer · Acciones no activan filtro"
          renderRowActions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                className="min-h-0 h-8 px-2 text-xs"
                onClick={() => alert(`Ver en mapa: ${row.nombre}`)}
                aria-label={`Ver ${row.nombre} en mapa`}
              >
                <MapPin className="h-3.5 w-3.5" />
              </Button>
              {row.contacto && (
                <Button
                  variant="ghost"
                  className="min-h-0 h-8 px-2 text-xs"
                  onClick={() => alert(`Contactar: ${row.contacto}`)}
                  aria-label={`Contactar a ${row.titular}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
