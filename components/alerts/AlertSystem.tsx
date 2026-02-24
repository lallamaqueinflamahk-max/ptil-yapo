"use client";

import { useMemo } from "react";
import type { Alerta } from "@/lib/alertas/types";
import { AlertBand } from "./AlertBand";
import { AlertList } from "./AlertList";
import { useAlertPersist, alertaStableKey } from "./useAlertPersist";

export interface AlertSystemProps {
  /** Lista de alertas (desde API o mock) */
  alertas: Alerta[];
  /** Id del elemento al que hacer scroll al clic en CTA de la banda */
  scrollTargetId?: string;
  /** Clase para el contenedor del listado */
  listClassName?: string;
  /** Máximo alertas en la lista antes de scroll */
  maxVisible?: number;
  /** Callback cuando el usuario hace clic en "Ver en mapa" (opcional) */
  onActionClick?: (alerta: Alerta) => void;
}

/** Sistema de alertas persistente: banda fija superior + listado con filtros y estados. */
export function AlertSystem({
  alertas,
  scrollTargetId = "alertas-panel",
  listClassName = "",
  maxVisible = 20,
  onActionClick,
}: AlertSystemProps) {
  const { resueltasKeys, alertasByEstado } = useAlertPersist();

  const activas = useMemo(() => {
    return alertasByEstado(alertas).filter((a) => !resueltasKeys.has(alertaStableKey(a)));
  }, [alertas, alertasByEstado, resueltasKeys]);

  const bandItems = useMemo(
    () => activas.map((a) => ({ id: a.id, nivel: a.nivel, stableKey: alertaStableKey(a) })),
    [activas]
  );

  return (
    <>
      <AlertBand
        alertas={bandItems}
        ctaLabel="Ver alertas"
        ctaScrollTargetId={scrollTargetId}
      />
      {bandItems.length > 0 && <div className="h-14 shrink-0" aria-hidden />}
      <section id={scrollTargetId} className={listClassName} aria-labelledby="alertas-panel-title">
        <h2 id="alertas-panel-title" className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
          Alertas
        </h2>
        <AlertList
          alertas={alertas}
          showLevelFilters
          showEstadoFilters
          onActionClick={onActionClick}
          maxVisible={maxVisible}
        />
      </section>
    </>
  );
}
