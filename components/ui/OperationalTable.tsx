"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import { Chip } from "./Chip";
import { Badge } from "./Badge";
import clsx from "clsx";

export type EstadoRiesgo = "success" | "warning" | "danger" | "neutral";

export interface OperationalTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  numeric?: boolean;
  /** Si no se pasa, se usa String(row[key]). Para la columna de estado usar render con Badge. */
  render?: (row: T) => React.ReactNode;
}

export interface QuickFilterOption {
  value: string | null;
  label: string;
}

export interface OperationalTableProps<T extends Record<string, unknown>> {
  /** Datos de la tabla */
  data: T[];
  /** Definición de columnas. La primera puede ser la columna visual de estado. */
  columns: OperationalTableColumn<T>[];
  /** Clave para el valor que se envía al filtro global (ej. "numero", "id") */
  filterValueKey: keyof T | string;
  /** Clave para la etiqueta mostrada en el filtro (ej. "nombre"). Por defecto filterValueKey. */
  filterLabelKey?: keyof T | string;
  /** Tipo de filtro en DashboardChartContext */
  filterType?: "seccional" | "ranking" | "state" | "kpi";
  /** Filtros rápidos (chips) arriba de la tabla. filterKey en cada opción debe coincidir con la clave de estado en cada row. */
  quickFilters?: QuickFilterOption[];
  /** Clave en cada row que define el estado para filtros rápidos (ej. "estado") */
  quickFilterRowKey?: keyof T | string;
  /** Orden inicial */
  defaultSortKey?: keyof T | string;
  defaultSortDir?: "asc" | "desc";
  /** Valor custom para ordenar (ej. estado → 0=red, 1=yellow, 2=green) */
  getSortValue?: (row: T, key: keyof T | string) => number | string;
  /** Acciones por fila (se renderizan en columna "Acciones"; clic no dispara selección de fila) */
  renderRowActions?: (row: T) => React.ReactNode;
  className?: string;
  /** Mensaje de hint debajo del título */
  hint?: string;
}

const ESTADO_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  green: "success",
  ok: "success",
  yellow: "warning",
  atencion: "warning",
  red: "danger",
  critico: "danger",
};

function getEstadoVariant(value: unknown): "success" | "warning" | "danger" | "neutral" {
  const s = String(value ?? "").toLowerCase();
  return ESTADO_BADGE[s] ?? "neutral";
}

export function OperationalTable<T extends Record<string, unknown>>({
  data,
  columns,
  filterValueKey,
  filterLabelKey,
  filterType = "seccional",
  quickFilters = [{ value: null, label: "Todos" }],
  quickFilterRowKey = "estado",
  defaultSortKey,
  defaultSortDir = "desc",
  getSortValue,
  renderRowActions,
  className = "",
  hint,
}: OperationalTableProps<T>) {
  const { chartFilter, setChartFilter, resetChartFilter } = useDashboardCharts();
  const [quickFilterValue, setQuickFilterValue] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const isFilterOrigin = chartFilter?.type === filterType;

  const filtered = useMemo(() => {
    if (quickFilterValue === null) return data;
    return data.filter(
      (row) => String(row[quickFilterRowKey as keyof T] ?? "") === quickFilterValue
    );
  }, [data, quickFilterValue, quickFilterRowKey]);

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
    const value = row[filterValueKey as keyof T];
    const valueStr = String(value ?? "");
    if (!valueStr) return;
    const labelKey = (filterLabelKey ?? filterValueKey) as keyof T;
    const label = String(row[labelKey] ?? valueStr);
    setChartFilter({ type: filterType, value: valueStr, label });
  };

  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className={clsx("rounded-sentinel-xl border border-sentinel-border bg-surface overflow-hidden", className)}>
      {/* Filtros rápidos */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-sentinel-border bg-surface-alt">
          <span className="text-xs font-semibold uppercase tracking-wide text-sentinel-text-secondary mr-1">
            Filtro
          </span>
          {quickFilters.map((opt) => (
            <Chip
              key={opt.label}
              variant="control"
              selected={quickFilterValue === opt.value}
              onSelect={() => setQuickFilterValue(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      )}

      {hint && (
        <p className="text-xs text-sentinel-text-muted px-4 pt-2">
          {hint}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sentinel-sm">
          <thead>
            <tr className="border-b border-sentinel-border bg-surface-alt">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    "py-3 px-4 font-semibold text-sentinel-text-secondary text-left whitespace-nowrap",
                    col.numeric && "text-right",
                    col.sortable && "cursor-pointer select-none hover:bg-semantic-neutral-bg transition-colors duration-dashboard"
                  )}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && (
                      <span className="text-sentinel-text-muted" aria-hidden>
                        {sortKey === col.key ? (
                          sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {renderRowActions && (
                <th className="py-3 px-4 font-semibold text-sentinel-text-secondary text-right w-32">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const rowValue = String(row[filterValueKey as keyof T] ?? "");
              const isActive = isFilterOrigin && chartFilter?.value === rowValue;
              return (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  onDoubleClick={() => resetChartFilter()}
                  className={clsx(
                    "border-b border-sentinel-border transition-colors duration-dashboard cursor-pointer",
                    "hover:bg-semantic-control/10",
                    isActive && "bg-semantic-control/10 border-l-4 border-l-semantic-control"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(row);
                    }
                    if (e.key === "Escape") resetChartFilter();
                  }}
                  aria-pressed={isActive}
                  aria-label={`Fila ${rowValue}, clic para filtrar dashboard`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={clsx(
                        "py-3 px-4",
                        col.numeric && "text-right tabular-nums"
                      )}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "—")}
                    </td>
                  ))}
                  {renderRowActions && (
                    <td
                      className="py-2 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {renderRowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-sentinel-border text-xs text-sentinel-text-muted">
        {sorted.length} de {data.length} filas
        {quickFilterValue !== null && " (filtradas)"}
      </div>
    </div>
  );
}
