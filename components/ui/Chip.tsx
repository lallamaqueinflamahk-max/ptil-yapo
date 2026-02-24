"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ChipVariant = "control" | "success" | "warning" | "danger" | "neutral";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Etiqueta del chip */
  children: ReactNode;
  /** Estado semántico (para filtros: control = activo) */
  variant?: ChipVariant;
  /** Si true, el chip aparece seleccionado/activo */
  selected?: boolean;
  /** Si true, usa estilo de botón (clicable); si false, solo presentacional */
  interactive?: boolean;
  /** Callback al hacer clic (solo si interactive) */
  onSelect?: () => void;
  className?: string;
}

const variantStyles: Record<
  ChipVariant,
  { base: string; selected: string }
> = {
  control:
    "border-semantic-neutral-border text-sentinel-text-secondary bg-surface hover:border-semantic-control hover:text-semantic-control",
  success:
    "border-semantic-success-border text-semantic-success-on bg-semantic-success-bg",
  warning:
    "border-semantic-warning-border text-semantic-warning-on bg-semantic-warning-bg",
  danger:
    "border-semantic-danger-border text-semantic-danger-on bg-semantic-danger-bg",
  neutral:
    "border-semantic-neutral-border text-semantic-neutral-on bg-semantic-neutral-bg",
};

const selectedStyles: Record<ChipVariant, string> = {
  control:
    "!border-semantic-control !bg-semantic-control !text-semantic-control-on ring-2 ring-semantic-control ring-offset-2",
  success: "ring-2 ring-semantic-success ring-offset-2",
  warning: "ring-2 ring-semantic-warning ring-offset-2",
  danger: "ring-2 ring-semantic-danger ring-offset-2",
  neutral: "ring-2 ring-semantic-neutral ring-offset-2",
};

export function Chip({
  children,
  variant = "control",
  selected = false,
  interactive = true,
  onSelect,
  className,
  ...rest
}: ChipProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-sentinel-full border px-3 py-1.5 text-xs font-semibold transition-all duration-dashboard focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control focus-visible:ring-offset-2 disabled:opacity-disabled";

  const style = selected
    ? `${variantStyles[variant].base} ${selectedStyles[variant]}`
    : variantStyles[variant].base;

  if (interactive) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={selected}
        onClick={onSelect}
        className={clsx(base, style, className)}
        {...rest}
      >
        {children}
      </button>
    );
  }

  const { onClick, ...spanRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <span
      role="status"
      className={clsx(base, style, "cursor-default", className)}
      {...spanRest}
    >
      {children}
    </span>
  );
}
