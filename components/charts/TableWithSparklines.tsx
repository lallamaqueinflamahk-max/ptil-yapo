"use client";

import { useRef, useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardChartsOptional } from "@/context/DashboardChartContext";
import ChartInteractionsHint from "./ChartInteractionsHint";

export interface SparklinePoint {
  fecha?: string;
  etiqueta?: string;
  valor: number;
}

export interface TableWithSparklinesColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  numeric?: boolean;
}

export interface TableWithSparklinesProps<T extends Record<string, unknown>> {
  data: T[];
  columns: TableWithSparklinesColumn<T>[];
  /** Key del campo en cada row que es un array de números o SparklinePoint[] para el sparkline */
  sparklineKey: keyof T | string;
  /** Key para valor del filtro (ej. numero para seccional) */
  filterKey: keyof T | string;
  /** Key para etiqueta mostrada en el banner (ej. nombre). Si no se pasa, se usa filterKey. */
  filterLabelKey?: keyof T | string;
  title?: string;
  chartId?: string;
  filterType?: "ranking" | "state" | "kpi" | "seccional";
  className?: string;
  /** Búsqueda en tiempo real por estas claves */
  searchKeys?: (keyof T | string)[];
  searchPlaceholder?: string;
  /** Orden inicial por impacto (ej. "estado" o "cantidadValidados") */
  defaultSortKey?: keyof T | string;
  defaultSortDir?: "asc" | "desc";
  /** Valor ordenable custom (ej. estado → 0=red, 1=yellow, 2=green) */
  getSortValue?: (row: T, key: keyof T | string) => number | string;
  /** Acciones rápidas por fila (ej. Ver en mapa, WhatsApp) */
  renderRowActions?: (row: T) => React.ReactNode;
}

function getSparklineValues(row: Record<string, unknown>, key: string): SparklinePoint[] {
  const raw = row[key];
  if (Array.isArray(raw)) {
    return raw.map((v, i) => (typeof v === "number" ? { valor: v, etiqueta: String(i + 1) } : { ...v, valor: (v as SparklinePoint).valor }));
  }
  return [];
}

export default function TableWithSparklines<T extends Record<string, unknown>>({
  data,
  columns,
  sparklineKey,
  filterKey,
  filterLabelKey,
  title,
  chartId = "table-spark",
  filterType = "ranking",
  className = "",
  searchKeys = [],
  searchPlaceholder = "Buscar…",
  defaultSortKey,
  defaultSortDir = "desc",
  getSortValue,
  renderRowActions,
}: TableWithSparklinesProps<T>) {
  const chartContext = useDashboardChartsOptional();
  const chartFilter = chartContext?.chartFilter ?? null;
  const setChartFilter = chartContext?.setChartFilter;
  const resetChartFilter = chartContext?.resetChartFilter;
  const isFilterOrigin = chartFilter?.type === filterType;
  const lastClickRef = useRef<number>(0);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k as keyof T] ?? "").toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => (c.key as string) === sortKey || c.key === sortKey);
    const isNum = col?.numeric ?? false;
    const useCustom = getSortValue != null;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (useCustom) {
        const aV = getSortValue(a, sortKey);
        const bV = getSortValue(b, sortKey);
        if (typeof aV === "number" && typeof bV === "number") cmp = aV - bV;
        else cmp = String(aV).localeCompare(String(bV), "es");
      } else if (isNum) {
        cmp = Number(a[sortKey as keyof T]) - Number(b[sortKey as keyof T]);
      } else {
        cmp = String(a[sortKey as keyof T] ?? "").localeCompare(String(b[sortKey as keyof T] ?? ""), "es");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns, getSortValue]);

  const handleRowClick = (row: T) => {
    if (!setChartFilter || !resetChartFilter) return;
    const value = row[filterKey as keyof T];
    const valueStr = String(value ?? "");
    if (!valueStr) return;
    const labelKey = (filterLabelKey ?? filterKey) as keyof T;
    const label = String(row[labelKey] ?? valueStr);
    const now = Date.now();
    if (now - lastClickRef.current < 400) {
      resetChartFilter();
      lastClickRef.current = 0;
      return;
    }
    lastClickRef.current = now;
    setChartFilter({ type: filterType, value: valueStr, label });
  };

  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sk = String(sparklineKey);

  return (
    <div className={`${className} ${isFilterOrigin ? "ring-2 ring-semantic-control/50 ring-offset-2 rounded-xl" : ""}`}>
      {title && <h3 className="text-base font-semibold text-dash-blue mb-2">{title}</h3>}
      <ChartInteractionsHint message="Clic en fila = filtrar mapa y KPIs · Doble clic = restablecer" />
      {searchKeys.length > 0 && (
        <div className="relative mb-3 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-300 focus:border-semantic-control focus:ring-2 focus:ring-semantic-control/20 outline-none text-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`py-3 px-4 font-semibold text-dash-muted text-left ${col.numeric ? "text-right" : ""} ${
                    col.sortable ? "cursor-pointer select-none hover:bg-gray-100" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-400">
                        {sortKey === col.key ? (sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              <th className="text-left py-3 px-4 font-semibold text-dash-muted w-24">Tendencia</th>
              {renderRowActions && <th className="text-right py-3 px-4 font-semibold text-dash-muted w-28">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const points = getSparklineValues(row as Record<string, unknown>, sk);
              const rowValue = row[filterKey as keyof T];
              const rowValueStr = String(rowValue ?? "");
              const isActive = isFilterOrigin && chartFilter?.value === rowValueStr;
              return (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  onDoubleClick={() => resetChartFilter?.()}
                  className={`border-b border-gray-100 hover:bg-semantic-control/5 cursor-pointer transition-colors ${isActive ? "bg-semantic-control/10 border-l-4 border-l-semantic-control" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`py-3 px-4 ${col.numeric ? "text-right" : ""}`}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "—")}
                    </td>
                  ))}
                  <td className="py-2 px-4 w-24 h-10">
                    {points.length > 0 ? (
                      <ResponsiveContainer width="100%" height={36}>
                        <LineChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                          <Line type="monotone" dataKey="valor" stroke="var(--semantic-control)" strokeWidth={1.5} dot={false} />
                          <Tooltip formatter={(v: number) => v.toLocaleString("es-PY")} contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-dash-muted text-xs">—</span>
                    )}
                  </td>
                  {renderRowActions && (
                    <td className="py-2 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {renderRowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {searchKeys.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">Mostrando {sorted.length} de {data.length} filas{search ? " (filtradas)" : ""}</p>
      )}
    </div>
  );
}
