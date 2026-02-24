"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type ChipVariant = "green" | "yellow" | "red" | "blue" | "gray";

export interface SmartTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  /** Render celda; si no se define se usa String(row[key]) */
  render?: (row: T) => React.ReactNode;
  /** Chip opcional por fila (estado, rango, etc.) */
  chip?: (row: T) => { label: string; variant: ChipVariant } | null;
  /** Orden numérico (si sortable y son números) */
  numeric?: boolean;
}

/** Comparador opcional por columna: retorna valor ordenable (número o string). Para "estado" semántico: red=0, yellow=1, green=2. */
export type SortValueGetter<T> = (row: T, key: keyof T | string) => number | string;

export interface SmartTableProps<T> {
  data: T[];
  columns: SmartTableColumn<T>[];
  /** Claves para búsqueda en tiempo real (ej. ["nombre", "titular"]) */
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  /** Filtro por estado: clave del objeto (ej. "rangoId") */
  stateFilterKey?: keyof T;
  /** Opciones para el filtro de estado (valor, etiqueta) */
  stateOptions?: { value: string; label: string }[];
  /** Si el estado no es una clave directa, extraer valor para filtrar */
  getRowState?: (row: T) => string;
  /** Clave o función para id de fila (selección y key) */
  rowIdKey?: keyof T;
  getRowId?: (row: T) => string | number;
  /** Id de la fila seleccionada (ej. desde chartFilter) */
  selectedRowId?: string | number | null;
  /** Al hacer click en una fila */
  onSelectRow?: (row: T) => void;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Altura máxima del body (ej. "320px") */
  maxHeight?: string;
  /** Título o descripción corta */
  title?: string;
  /** Orden inicial por impacto: columna por defecto (ej. "estado" o "cantidadValidados") */
  defaultSortKey?: keyof T | string | null;
  /** Dirección del orden por defecto: desc = críticos primero / mayor primero */
  defaultSortDir?: "asc" | "desc";
  /** Para columnas con orden semántico (ej. estado): red < yellow < green. getSortValue(row, sortKey) retorna número o string. */
  getSortValue?: SortValueGetter<T>;
  /** Columna de acciones rápidas por fila (no hace clic en fila en la celda de acciones) */
  renderRowActions?: (row: T) => React.ReactNode;
  /** Si true, chips usan clases semánticas (semantic-success, semantic-warning, semantic-danger, etc.) */
  semanticChips?: boolean;
}

/** Chips con color semántico: impacto en 3 segundos */
const CHIP_CLASS_SEMANTIC: Record<ChipVariant, string> = {
  green: "bg-semantic-success-bg text-semantic-success border-semantic-success-border",
  yellow: "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border",
  red: "bg-semantic-danger-bg text-semantic-danger border-semantic-danger-border",
  blue: "bg-semantic-control/10 text-semantic-control border-semantic-control",
  gray: "bg-semantic-neutral-bg text-semantic-neutral border-semantic-neutral-border",
};

const CHIP_CLASS: Record<ChipVariant, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-amber-100 text-amber-800 border-amber-200",
  red: "bg-red-100 text-red-800 border-red-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function SmartTable<T extends object>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Buscar…",
  stateFilterKey,
  stateOptions = [],
  getRowState,
  rowIdKey,
  getRowId,
  selectedRowId = null,
  onSelectRow,
  emptyMessage = "No hay registros.",
  maxHeight = "320px",
  title,
  defaultSortKey = null,
  defaultSortDir = "desc",
  getSortValue,
  renderRowActions,
  semanticChips = true,
}: SmartTableProps<T>) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const getId = (row: T, index: number): string | number => {
    if (getRowId) return getRowId(row);
    if (rowIdKey) return String(row[rowIdKey] ?? "");
    return (row as { id?: string }).id ?? index;
  };

  const filtered = useMemo(() => {
    let list = data;
    if (search.trim() && searchKeys.length > 0) {
      const q = search.toLowerCase();
      list = list.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (stateFilter && (stateFilterKey || getRowState)) {
      list = list.filter((row) => {
        const val = getRowState ? getRowState(row) : String(row[stateFilterKey!] ?? "");
        return val === stateFilter;
      });
    }
    return list;
  }, [data, search, searchKeys, stateFilter, stateFilterKey, getRowState]);

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
        const an = Number(a[sortKey as keyof T]);
        const bn = Number(b[sortKey as keyof T]);
        cmp = an - bn;
      } else {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        const as = String(aVal ?? "");
        const bs = String(bVal ?? "");
        cmp = as.localeCompare(bs, "es");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns, getSortValue]);

  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-sm text-dash-muted font-medium">{title}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-sm transition-colors"
          />
        </div>
        {stateOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-dash-muted">Estado:</span>
            {stateOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStateFilter((s) => (s === opt.value ? "" : opt.value))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-200 hover:scale-105 ${
                  stateFilter === opt.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-400/25"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {stateFilter && (
              <button
                type="button"
                onClick={() => setStateFilter("")}
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>
      <div
        className="overflow-x-auto rounded-xl border border-yapo-gray-dark"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          <thead className="bg-yapo-gray sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2 font-semibold text-yapo-blue text-left ${
                    col.sortable ? "cursor-pointer select-none hover:bg-yapo-gray-dark/50" : ""
                  } ${col.numeric ? "text-right" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-400">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {renderRowActions && (
                <th className="px-4 py-2 font-semibold text-yapo-blue text-right w-32">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const rowId = getId(row, i);
                const isSelected = selectedRowId != null && String(rowId) === String(selectedRowId);
                return (
                  <tr
                    key={String(rowId)}
                    onClick={() => onSelectRow?.(row)}
                    className={`border-t border-yapo-gray-dark transition-colors ${
                      onSelectRow ? "cursor-pointer hover:bg-semantic-control/5" : ""
                    } ${isSelected ? "bg-semantic-control/10 border-l-4 border-l-semantic-control" : ""}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`px-4 py-2 ${col.numeric ? "text-right" : ""}`}
                      >
                        {col.chip?.(row) ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                              semanticChips ? CHIP_CLASS_SEMANTIC[col.chip(row)!.variant] : CHIP_CLASS[col.chip(row)!.variant]
                            }`}
                          >
                            {col.chip(row)!.label}
                          </span>
                        ) : col.render ? (
                          col.render(row)
                        ) : (
                          String(row[col.key as keyof T] ?? "—")
                        )}
                      </td>
                    ))}
                    {renderRowActions && (
                      <td
                        className="px-4 py-2 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderRowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Mostrando {sorted.length} de {data.length} registros
        {(search || stateFilter) && " (filtrados)"}
      </p>
    </div>
  );
}
