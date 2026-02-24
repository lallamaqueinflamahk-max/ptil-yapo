"use client";

import { type HTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Si true, la card tiene efecto hover (sombra + escala ligera) */
  interactive?: boolean;
  /** Padding interno: "none" | "sm" | "md" | "lg" */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, padding = "md", className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-sentinel-lg border border-sentinel-border bg-surface shadow-card transition-all duration-dashboard",
          paddingMap[padding],
          interactive &&
            "cursor-pointer hover:shadow-card-hover hover:scale-[1.01] active:scale-[0.99] active:shadow-card-active",
          className
        )}
        {...rest}
      />
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return (
    <div
      className={clsx("mb-4 border-b border-sentinel-border pb-3", className)}
      {...rest}
    />
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
}

export function CardTitle({ as: Tag = "h3", className, ...rest }: CardTitleProps) {
  return (
    <Tag
      className={clsx("text-sentinel-lg font-semibold text-sentinel-text-primary", className)}
      {...rest}
    />
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...rest }: CardContentProps) {
  return <div className={clsx("text-sentinel-sm text-sentinel-text-secondary", className)} {...rest} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...rest }: CardFooterProps) {
  return (
    <div
      className={clsx("mt-4 flex flex-wrap items-center gap-2 border-t border-sentinel-border pt-3", className)}
      {...rest}
    />
  );
}
