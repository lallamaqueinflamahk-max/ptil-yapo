"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import clsx from "clsx";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Contenido que activa el tooltip (hover/focus) */
  children: ReactNode;
  /** Texto o contenido del tooltip */
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Clases adicionales para el contenedor del trigger */
  className?: string;
  /** Id para asociar aria-describedby (accesibilidad) */
  id?: string;
}

const placementStyles: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  children,
  content,
  placement = "top",
  className,
  id: idProp,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [generatedId] = useState(() => `tooltip-${Math.random().toString(36).slice(2, 9)}`);
  const id = idProp ?? generatedId;

  return (
    <div
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={() => setVisible(true)}
      onBlurCapture={() => setVisible(false)}
    >
      <div
        className="inline-flex cursor-default"
        tabIndex={0}
        role="button"
        aria-describedby={visible ? id : undefined}
      >
        {children}
      </div>
      {visible && (
        <TooltipContent id={id} placement={placement}>
          {content}
        </TooltipContent>
      )}
    </div>
  );
}

function TooltipContent({
  id,
  placement,
  children,
}: {
  id: string;
  placement: TooltipPlacement;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="tooltip"
      className={clsx(
        "absolute z-50 max-w-xs rounded-sentinel-md border border-sentinel-border bg-surface-alt px-3 py-2 text-sentinel-sm text-sentinel-text-secondary shadow-card-hover",
        placementStyles[placement]
      )}
    >
      {children}
    </div>
  );
}
