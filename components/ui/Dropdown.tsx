"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Estilo de riesgo (ej. "Eliminar") */
  danger?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled,
  danger,
  className,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-dashboard",
        danger
          ? "text-semantic-danger hover:bg-semantic-danger-bg"
          : "text-sentinel-text-primary hover:bg-semantic-neutral-bg",
        disabled && "cursor-not-allowed opacity-disabled",
        className
      )}
    >
      {children}
    </button>
  );
}

export interface DropdownProps {
  /** Elemento que abre el dropdown al clic */
  trigger: ReactNode;
  /** Contenido del menú (DropdownItem u otros) */
  children: ReactNode;
  /** Alineación del panel respecto al trigger */
  align?: "left" | "right";
  /** Clases para el trigger wrapper */
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "left",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const content = (
    <div className={clsx("relative inline-block", className)}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="inline-flex cursor-pointer"
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          className={clsx(
            "absolute z-50 mt-1 min-w-[10rem] rounded-sentinel-lg border border-sentinel-border bg-surface py-1 shadow-card-hover",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );

  return content;
}
