"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  /** Deshabilita la pestaña */
  disabled?: boolean;
}

export interface TabsProps {
  /** Lista de pestañas */
  items: TabItem[];
  /** Id de la pestaña activa (controlado) */
  value?: string;
  /** Callback al cambiar de pestaña (para modo controlado) */
  onChange?: (id: string) => void;
  /** Id inicial (solo en modo no controlado) */
  defaultValue?: string;
  /** Clases para el contenedor */
  className?: string;
  /** "line" | "pill": estilo del indicador */
  variant?: "line" | "pill";
}

export function Tabs({
  items,
  value: controlledValue,
  onChange,
  defaultValue,
  className,
  variant = "line",
}: TabsProps) {
  const [internalValue, setInternal] = useState(defaultValue ?? items[0]?.id ?? "");
  const value = controlledValue ?? internalValue;

  const setValue = (id: string) => {
    if (onChange) onChange(id);
    else setInternal(id);
  };

  const activeIndex = items.findIndex((t) => t.id === value);

  return (
    <div className={clsx("w-full", className)}>
      <div
        role="tablist"
        aria-label="Pestañas"
        className={clsx(
          "flex gap-1 border-b border-sentinel-border",
          variant === "pill" && "gap-0 rounded-sentinel-lg border bg-surface-alt p-1"
        )}
      >
        {items.map((tab, i) => {
          const isActive = tab.id === value;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setValue(tab.id)}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors duration-dashboard focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control focus-visible:ring-offset-2 disabled:opacity-disabled disabled:pointer-events-none",
                variant === "line" &&
                  (isActive
                    ? "border-b-2 border-semantic-control text-semantic-control"
                    : "text-sentinel-text-secondary hover:text-sentinel-text-primary"),
                variant === "pill" &&
                  (isActive
                    ? "rounded-sentinel-md bg-surface text-semantic-control shadow-card"
                    : "text-sentinel-text-secondary hover:text-sentinel-text-primary")
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {items.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== value}
          className="py-4"
        >
          {tab.id === value ? tab.content : null}
        </div>
      ))}
    </div>
  );
}