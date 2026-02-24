"use client";

import { type HTMLAttributes } from "react";
import clsx from "clsx";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "control";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Si true, usa estilo outline (borde + fondo suave) en lugar de sólido */
  outline?: boolean;
}

const outlineStyles: Record<BadgeVariant, string> = {
  success: "bg-semantic-success-bg text-semantic-success-on border-semantic-success-border",
  warning: "bg-semantic-warning-bg text-semantic-warning-on border-semantic-warning-border",
  danger: "bg-semantic-danger-bg text-semantic-danger-on border-semantic-danger-border",
  neutral: "bg-semantic-neutral-bg text-semantic-neutral-on border-semantic-neutral-border",
  control: "bg-semantic-control/10 text-semantic-control border-semantic-control",
};

const solidStyles: Record<BadgeVariant, string> = {
  success: "bg-semantic-success text-white border-semantic-success",
  warning: "bg-semantic-warning text-white border-semantic-warning",
  danger: "bg-semantic-danger text-white border-semantic-danger",
  neutral: "bg-semantic-neutral text-white border-semantic-neutral",
  control: "bg-semantic-control text-semantic-control-on border-semantic-control",
};

export function Badge({
  variant = "neutral",
  outline = true,
  className,
  ...rest
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-sentinel-sm border px-2 py-0.5 text-xs font-semibold tabular-nums";
  const style = outline ? outlineStyles[variant] : solidStyles[variant];

  return (
    <span
      role="status"
      className={clsx(base, style, className)}
      {...rest}
    />
  );
}
