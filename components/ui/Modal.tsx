"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título del modal (para aria-labelledby y encabezado opcional) */
  title?: string;
  /** Contenido del modal */
  children: ReactNode;
  /** Clases para el panel del modal */
  className?: string;
  /** Si true, no se cierra al hacer clic en el overlay */
  closeOnOverlayClick?: boolean;
  /** Ancho máximo: "sm" | "md" | "lg" | "full" */
  size?: "sm" | "md" | "lg" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-[90vw]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closeOnOverlayClick = true,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && panelRef.current) {
      const focusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  const titleId = title ? "modal-title" : undefined;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-dashboard"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={clsx(
          "relative w-full rounded-sentinel-xl border border-sentinel-border bg-surface shadow-card-hover",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-sentinel-border px-5 py-4">
            <h2 id={titleId} className="text-sentinel-lg font-semibold text-sentinel-text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-sentinel-md p-1 text-sentinel-text-muted hover:bg-semantic-neutral-bg hover:text-sentinel-text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control"
              aria-label="Cerrar modal"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        )}
        <div className={title ? "p-5" : "p-5"}>{children}</div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
