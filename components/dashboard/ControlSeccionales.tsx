"use client";

import { useMemo, useState } from "react";
import { Building2, MessageCircle, MapPin } from "lucide-react";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import SmartTable from "@/components/dashboard/SmartTable";
import type { SmartTableColumn } from "@/components/dashboard/SmartTable";
import { ESTADO_CONFIG } from "@/components/dashboard/MapaInteractivoAvanzado";
import AyudaHerramienta, { type AyudaHerramientaProps } from "@/components/dashboard/AyudaHerramienta";
import type { SeccionalRow } from "./ControlSeccionales.types";

export type { SeccionalRow, RangoId } from "./ControlSeccionales.types";

const RANGOS = [
  { value: "R1", label: "R1 Estratégico" },
  { value: "R2", label: "R2 Operativo" },
  { value: "R3", label: "R3 Base" },
] as const;

type EstadoKey = "green" | "yellow" | "red";

/** Orden por impacto: Crítico (0) → Atención (1) → OK (2). Para estado. */
function estadoSortOrder(estado: string | undefined): number {
  if (estado === "red") return 0;
  if (estado === "yellow") return 1;
  return 2; // green o cualquiera
}

const columns: SmartTableColumn<SeccionalRow>[] = [
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    chip: (s) => {
      const e = s.estado ?? "green";
      return {
        label: s.estadoLabel ?? (e === "green" ? "OK" : e === "yellow" ? "Atención" : "Crítico"),
        variant: e,
      };
    },
  },
  {
    key: "rangoId",
    label: "Rango",
    sortable: true,
    chip: (s) => {
      const variant = s.rangoId === "R1" ? "red" : s.rangoId === "R2" ? "blue" : "green";
      return { label: s.rangoId, variant };
    },
  },
  {
    key: "cantidadValidados",
    label: "Validados",
    sortable: true,
    numeric: true,
    render: (s) => s.cantidadValidados.toLocaleString("es-PY"),
  },
  { key: "numero", label: "Nº", sortable: true, numeric: true },
  { key: "nombre", label: "Nombre", sortable: true },
  { key: "titular", label: "Titular", sortable: true },
  {
    key: "contacto",
    label: "Contacto",
    render: (s) =>
      s.contacto ? (
        <a
          href={`https://wa.me/${String(s.contacto).replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      ) : (
        "—"
      ),
  },
];

export default function ControlSeccionales({
  seccionales,
  selectedSeccionalNumero = null,
  ayuda,
  scrollToMap,
}: {
  seccionales: SeccionalRow[];
  /** Si se pasa, se resalta la fila y se usa para sincronizar con mapa/panel (si no se pasa, se usa chartFilter del contexto) */
  selectedSeccionalNumero?: string | number | null;
  /** Si se pasa, se muestra el botón de ayuda con esta explicación */
  ayuda?: Pick<AyudaHerramientaProps, "titulo" | "introduccion" | "items">;
  /** Si se pasa, el botón "Ver en mapa" hace scroll al mapa tras seleccionar la seccional */
  scrollToMap?: () => void;
}) {
  const { chartFilter, setChartFilter } = useDashboardCharts();
  const [estadoFilter, setEstadoFilter] = useState<EstadoKey | "">("");
  const selectedId =
    selectedSeccionalNumero !== undefined && selectedSeccionalNumero !== null
      ? String(selectedSeccionalNumero)
      : chartFilter?.type === "seccional"
        ? chartFilter.value
        : null;

  const filteredByEstado = useMemo(() => {
    if (!estadoFilter) return seccionales;
    return seccionales.filter((s) => (s.estado ?? "green") === estadoFilter);
  }, [seccionales, estadoFilter]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-8 h-8 text-yapo-blue" />
        <h2 className="text-lg font-semibold text-yapo-blue">Control de Seccionales</h2>
        {ayuda && <AyudaHerramienta {...ayuda} />}
      </div>
      <p className="text-sm text-dash-muted mb-3">
        Centro de comando: buscá, ordená por columna, filtrá por rango o estado. Hacé clic en una fila para verla en el mapa, actualizar KPIs y abrir historial y alertas.
      </p>
      {/* Filtro por Estado (OK, Atención, Crítico) — chips visibles y clickeables */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-bold text-dash-muted uppercase tracking-wide">Estado</span>
        <button
          type="button"
          onClick={() => setEstadoFilter("")}
          className={`rounded-full px-3 py-1.5 text-xs font-bold border-2 transition-all ${
            estadoFilter === "" ? "bg-slate-700 text-white border-slate-700 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-slate-400"
          }`}
        >
          Todos
        </button>
        {(Object.keys(ESTADO_CONFIG) as EstadoKey[]).map((key) => {
          const cfg = ESTADO_CONFIG[key];
          const isActive = estadoFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setEstadoFilter(isActive ? "" : key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border-2 transition-all ${
                isActive ? "text-white shadow-md" : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
              style={{ borderColor: cfg.color, ...(isActive ? { backgroundColor: cfg.color } : {}) }}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white/90" : ""}`} style={isActive ? {} : { backgroundColor: cfg.color }} />
              {cfg.label}
            </button>
          );
        })}
      </div>
      <SmartTable<SeccionalRow>
        data={filteredByEstado}
        columns={columns}
        searchKeys={["nombre", "titular", "barrio", "numero"]}
        searchPlaceholder="Buscar por nombre, titular, barrio o número…"
        stateFilterKey="rangoId"
        stateOptions={[...RANGOS]}
        getRowId={(row) => String(row.numero)}
        selectedRowId={selectedId}
        onSelectRow={(s) =>
          setChartFilter({ type: "seccional", value: String(s.numero), label: s.nombre })
        }
        defaultSortKey="estado"
        defaultSortDir="desc"
        getSortValue={(row, key) => {
          if (key === "estado") return estadoSortOrder(row.estado);
          if (key === "cantidadValidados") return row.cantidadValidados;
          return String(row[key as keyof SeccionalRow] ?? "");
        }}
        renderRowActions={(s) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setChartFilter({ type: "seccional", value: String(s.numero), label: s.nombre });
              scrollToMap?.();
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-semantic-control/10 text-semantic-control border border-semantic-control/30 hover:bg-semantic-control/20 transition-colors"
            title="Ver en mapa"
          >
            <MapPin className="w-3.5 h-3.5" />
            Mapa
          </button>
        )}
        emptyMessage="No hay seccionales que coincidan."
        maxHeight="320px"
      />
    </div>
  );
}
