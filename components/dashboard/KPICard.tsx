"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import DashboardCard from "./DashboardCard";

type KPIVariant = "blue" | "green" | "yellow" | "red" | "neutral";

const variantStyles: Record<
  KPIVariant,
  { bg: string; value: string; label: string; border: string }
> = {
  blue: {
    bg: "bg-dash-blue/6",
    value: "text-dash-blue",
    label: "text-dash-muted",
    border: "border-dash-blue/20",
  },
  green: {
    bg: "bg-dash-green/8",
    value: "text-dash-green",
    label: "text-dash-muted",
    border: "border-dash-green/25",
  },
  yellow: {
    bg: "bg-dash-yellow/10",
    value: "text-dash-yellow",
    label: "text-dash-muted",
    border: "border-dash-yellow/30",
  },
  red: {
    bg: "bg-dash-red/8",
    value: "text-dash-red",
    label: "text-dash-muted",
    border: "border-dash-red/25",
  },
  neutral: {
    bg: "bg-gray-100",
    value: "text-dash-blue",
    label: "text-dash-muted",
    border: "border-gray-200",
  },
};

export interface KPICardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  variant?: KPIVariant;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function KPICard({
  value,
  label,
  sublabel,
  variant = "blue",
  icon,
  onClick,
  href,
  className,
}: KPICardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={clsx(
        "p-4 sm:p-5 rounded-[14px] border transition-all duration-dashboard",
        styles.bg,
        styles.border,
        (onClick || href) && "hover:shadow-card-hover hover:-translate-y-px active:translate-y-0 cursor-pointer"
      )}
    >
      {icon && <div className="mb-2 text-dash-muted [&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
      <p className={clsx("text-2xl sm:text-3xl font-bold tabular-nums", styles.value)}>
        {typeof value === "number" ? value.toLocaleString("es-PY") : value}
      </p>
      <p className={clsx("text-sm font-medium mt-0.5", styles.label)}>{label}</p>
      {sublabel && (
        <p className="text-xs text-dash-muted mt-1 opacity-90">{sublabel}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className={clsx("block", className)}>
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx("block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dash-blue focus-visible:ring-offset-2 rounded-[14px]", className)}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
