"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Si true, el botón ocupa todo el ancho disponible */
  fullWidth?: boolean;
  /** Muestra spinner y deshabilita clic */
  loading?: boolean;
  /** Contenido cuando está loading (por defecto solo spinner) */
  loadingLabel?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { base: string; hover: string; active: string; disabled: string; focus: string }
> = {
  primary:
    "bg-semantic-control text-semantic-control-on shadow-button hover:bg-semantic-control-hover hover:shadow-button-hover active:shadow-card-active focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control focus-visible:ring-offset-2 disabled:opacity-disabled disabled:pointer-events-none",
  secondary:
    "border-2 border-semantic-control text-semantic-control bg-surface hover:bg-semantic-control hover:text-semantic-control-on active:bg-semantic-control-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control focus-visible:ring-offset-2 disabled:opacity-disabled disabled:pointer-events-none",
  ghost:
    "text-sentinel-text-secondary bg-transparent hover:bg-semantic-neutral-bg hover:text-sentinel-text-primary active:bg-semantic-neutral-border/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-control focus-visible:ring-offset-2 disabled:opacity-disabled disabled:pointer-events-none",
  danger:
    "bg-semantic-danger text-white shadow-button hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-semantic-danger focus-visible:ring-offset-2 disabled:opacity-disabled disabled:pointer-events-none",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      fullWidth,
      loading = false,
      loadingLabel,
      className,
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={clsx(
          "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sentinel-lg px-4 py-2 text-sm font-semibold transition-all duration-dashboard ease-sentinel-out",
          "hover:scale-[1.02] active:scale-[0.98]",
          variantStyles[variant].base,
          !isDisabled && variantStyles[variant].hover,
          !isDisabled && variantStyles[variant].active,
          isDisabled && variantStyles[variant].disabled,
          variantStyles[variant].focus,
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden
            />
            {loadingLabel != null ? (
              <span>{loadingLabel}</span>
            ) : (
              <span className="sr-only">Cargando</span>
            )}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
