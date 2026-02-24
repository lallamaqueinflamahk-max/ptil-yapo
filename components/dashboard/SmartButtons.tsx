"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Bell, Check, Loader2, type LucideIcon } from "lucide-react";

const SUCCESS_DURATION_MS = 1800;

/** Botón de filtro (toggle on/off). Cambio visual claro según estado, feedback al hacer clic. */
export interface FilterButtonProps {
  label: string;
  active: boolean;
  onToggle: (next: boolean) => void;
  count?: number;
  icon?: LucideIcon;
  className?: string;
  "aria-label"?: string;
}

export function FilterButton({
  label,
  active,
  onToggle,
  count,
  icon: Icon = Filter,
  className = "",
  "aria-label": ariaLabel,
}: FilterButtonProps) {
  const handleClick = () => {
    onToggle(!active);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={ariaLabel ?? label}
      className={`
        inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl font-semibold text-sm
        transition-all duration-300 select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        hover:scale-[1.03] active:scale-[0.98]
        ${active
          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-400/30 hover:shadow-xl hover:shadow-red-400/40 focus-visible:ring-red-400"
          : "bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus-visible:ring-blue-400"
        }
        ${className}
      `}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`
            min-w-[22px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold tabular-nums
            ${active ? "bg-white/30 text-white" : "bg-slate-200/80 text-slate-600"}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Estados de un botón de acción para feedback visual. */
export type ActionButtonState = "idle" | "loading" | "success";

/** Botón de acción: ejecuta una acción, muestra loading y confirmación visual (check + "Listo"). */
export interface ActionButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const variantStyles = {
  primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-400/25 hover:shadow-xl hover:shadow-blue-400/35 border-transparent",
  secondary: "bg-white border-2 border-blue-500 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 shadow-md hover:shadow-lg border-blue-400",
  danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-400/25 hover:shadow-xl hover:shadow-red-400/35 border-transparent",
};

export function ActionButton({
  label,
  onClick,
  icon: Icon = Bell,
  variant = "primary",
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}: ActionButtonProps) {
  const [state, setState] = useState<ActionButtonState>("idle");

  const handleClick = useCallback(async () => {
    if (state !== "idle" || disabled) return;
    setState("loading");
    try {
      await Promise.resolve(onClick());
      setState("success");
      setTimeout(() => setState("idle"), SUCCESS_DURATION_MS);
    } catch {
      setState("idle");
    }
  }, [onClick, state, disabled]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      aria-label={ariaLabel ?? label}
      aria-busy={state === "loading"}
      className={`
        inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl font-semibold text-sm
        border transition-all duration-300 select-none
        hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${state === "idle" ? variantStyles[variant] : ""}
        ${state === "loading" ? "bg-slate-100 border-slate-300 text-slate-600 cursor-wait" : ""}
        ${state === "success" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg shadow-emerald-400/30" : ""}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            {label}
          </motion.span>
        )}
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden />
            <span>Ejecutando…</span>
          </motion.span>
        )}
        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden />
            <span>Listo</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** Botón contextual: mismo que ActionButton pero solo se muestra cuando `visible` es true. */
export interface ContextualButtonProps extends Omit<ActionButtonProps, "onClick"> {
  visible: boolean;
  onClick: () => void | Promise<void>;
}

export function ContextualButton({ visible, ...rest }: ContextualButtonProps) {
  if (!visible) return null;
  return <ActionButton {...rest} />;
}
