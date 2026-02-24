"use client";

import clsx from "clsx";

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Si es clickeable, aplica hover/active y cursor. */
  interactive?: boolean;
  /** Si se pasa, envuelve en <a> para navegación. */
  href?: string;
}

export default function DashboardCard({
  interactive = true,
  href,
  className,
  children,
  ...rest
}: DashboardCardProps) {
  const base =
    "bg-white rounded-[14px] border border-gray-200/60 shadow-card overflow-hidden " +
    "transition-all duration-dashboard ";
  const interactiveStyles =
    interactive
      ? "hover:shadow-card-hover hover:border-gray-300/80 hover:-translate-y-px active:shadow-card-active active:translate-y-0 cursor-pointer"
      : "";

  const content = (
    <div className={clsx(base, interactiveStyles, className)} {...rest}>
      {children}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-dash-blue focus-visible:ring-offset-2 rounded-[14px]"
      >
        {content}
      </a>
    );
  }

  return content;
}
