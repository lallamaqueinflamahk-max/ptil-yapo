"use client";

/**
 * Encabezado de pantalla para producto premium.
 * Justifica la existencia de la vista: título, subtítulo, confianza y "para quién".
 */

export interface PageHeroProps {
  title: string;
  subtitle: string;
  /** Línea de confianza (ej. "Datos en tiempo real · Una sola fuente") */
  trust?: string;
  /** Para quién es esta pantalla (justificación) */
  forWho?: string;
  /** Ámbito opcional (ej. "Asunción · 45 seccionales") */
  scope?: string;
  /** Última actualización opcional */
  lastUpdated?: string;
  /** Contenido extra a la derecha (botones, filtros) */
  actions?: React.ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  trust,
  forWho,
  scope,
  lastUpdated,
  actions,
}: PageHeroProps) {
  return (
    <header className="border-b border-gray-200/80 pb-6 mb-2">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5 max-w-2xl">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {trust && (
              <span className="font-medium text-gray-600">{trust}</span>
            )}
            {scope && (
              <span>{scope}</span>
            )}
            {lastUpdated && (
              <span>Actualizado {lastUpdated}</span>
            )}
          </div>
          {forWho && (
            <p className="text-xs text-gray-500 mt-2 italic">
              Para: {forWho}
            </p>
          )}
        </div>
        {actions && (
          <div className="shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
