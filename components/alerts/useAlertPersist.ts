"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getResueltasKeys,
  marcarResuelta as persistMarcarResuelta,
  marcarActiva as persistMarcarActiva,
  getResueltaFecha,
} from "@/lib/alerts/persist";
import type { Alerta } from "@/lib/alertas/types";

/** Clave estable para una alerta (debe coincidir con la usada en PanelAlertas si se comparte). */
export function alertaStableKey(a: Alerta): string {
  return `${a.tipo}|${a.entidad ?? a.titulo}|${a.filterKey?.value ?? ""}`;
}

export type EstadoAlertaFilter = "activas" | "resueltas" | "todas";

export interface UseAlertPersistReturn {
  /** Claves de alertas marcadas como resueltas */
  resueltasKeys: Set<string>;
  /** Si una alerta está resuelta */
  isResuelta: (key: string) => boolean;
  /** Marcar como resuelta (persiste en localStorage) */
  marcarResuelta: (key: string) => void;
  /** Marcar como activa de nuevo */
  marcarActiva: (key: string) => void;
  /** Fecha de resolución (ISO o null) */
  getResueltaAt: (key: string) => string | null;
  /** Filtro actual: activas / resueltas / todas */
  estadoFilter: EstadoAlertaFilter;
  setEstadoFilter: (v: EstadoAlertaFilter) => void;
  /** Alertas filtradas por estado (activas = no resueltas, resueltas = en resueltasKeys, todas = sin filtrar por estado) */
  alertasByEstado: (alertas: Alerta[]) => Alerta[];
}

export function useAlertPersist(): UseAlertPersistReturn {
  const [resueltasKeys, setResueltasKeys] = useState<Set<string>>(new Set());
  const [estadoFilter, setEstadoFilter] = useState<EstadoAlertaFilter>("activas");

  useEffect(() => {
    setResueltasKeys(getResueltasKeys());
  }, []);

  const isResuelta = useCallback((key: string) => resueltasKeys.has(key), [resueltasKeys]);

  const marcarResuelta = useCallback((key: string) => {
    persistMarcarResuelta(key);
    setResueltasKeys(getResueltasKeys());
  }, []);

  const marcarActiva = useCallback((key: string) => {
    persistMarcarActiva(key);
    setResueltasKeys(getResueltasKeys());
  }, []);

  const getResueltaAt = useCallback((key: string) => getResueltaFecha(key), []);

  const alertasByEstado = useCallback(
    (alertas: Alerta[]) => {
      if (estadoFilter === "todas") return alertas;
      if (estadoFilter === "activas") return alertas.filter((a) => !resueltasKeys.has(alertaStableKey(a)));
      return alertas.filter((a) => resueltasKeys.has(alertaStableKey(a)));
    },
    [estadoFilter, resueltasKeys]
  );

  return {
    resueltasKeys,
    isResuelta,
    marcarResuelta,
    marcarActiva,
    getResueltaAt,
    estadoFilter,
    setEstadoFilter,
    alertasByEstado,
  };
}
