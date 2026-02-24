"use client";

export interface ChartInteractionsHintProps {
  /** Mensaje opcional por gráfico; si no se pasa, se usa el genérico. */
  message?: string;
}

const DEFAULT_MESSAGE = "Clic = filtrar el dashboard · Doble clic = restablecer vista · Leyenda = mostrar/ocultar";

export default function ChartInteractionsHint({ message }: ChartInteractionsHintProps) {
  return (
    <p className="text-xs text-dash-muted mb-2" title={message ?? DEFAULT_MESSAGE}>
      {message ?? DEFAULT_MESSAGE}
    </p>
  );
}
