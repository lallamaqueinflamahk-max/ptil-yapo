"use client";

import useSWR from "swr";
import { useDashboardChartsOptional } from "@/context/DashboardChartContext";
import { AlertSystem } from "@/components/alerts";
import type { Alerta } from "@/lib/alertas/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Mock para demo si la API no devuelve datos */
function mockAlertas(): Alerta[] {
  const now = new Date().toISOString();
  return [
    {
      id: "alt-1",
      tipo: "riesgo_politico",
      severidad: "alta",
      nivel: "critico",
      titulo: "Alto porcentaje de seccionales con baja base",
      mensaje: "12 de 45 seccionales tienen menos de 200 validados (27%).",
      porQue: "Debilidad territorial en varias zonas.",
      consecuencia: "Aumenta el riesgo político.",
      accionSugerida: "Reforzar operativos en seccionales 3, 7 y 18.",
      entidad: "Seccional 18",
      filterKey: { type: "seccional", value: "18", label: "Seccional 18" },
      createdAt: now,
    },
    {
      id: "alt-2",
      tipo: "baja_actividad",
      severidad: "media",
      nivel: "warning",
      titulo: "Baja actividad en eventos del día",
      mensaje: "Solo 4 eventos registrados hoy (umbral mínimo 5).",
      porQue: "Eventos hoy por debajo del mínimo.",
      accionSugerida: "Coordinar con operadores para registrar actividad.",
      createdAt: now,
    },
    {
      id: "alt-3",
      tipo: "concentracion_poder",
      severidad: "media",
      nivel: "warning",
      titulo: "Concentración de seguidores en un concejal",
      mensaje: "Un concejal concentra 38% de los seguidores (máx. 35%).",
      porQue: "Desbalance en la distribución.",
      accionSugerida: "Revisar estrategia de diversificación.",
      entidad: "Sosa",
      filterKey: { type: "ranking", value: "Sosa", label: "Sosa" },
      createdAt: now,
    },
    {
      id: "alt-4",
      tipo: "inflacion_datos",
      severidad: "baja",
      nivel: "info",
      titulo: "Seccional con alto % del total de validados",
      mensaje: "Seccional 22 concentra 24% de los validados (límite 25%).",
      porQue: "Porcentaje cercano al umbral.",
      accionSugerida: "Monitorear evolución.",
      entidad: "Seccional 22",
      filterKey: { type: "seccional", value: "22", label: "Seccional 22" },
      createdAt: now,
    },
  ];
}

export default function AlertasPersistentePage() {
  const setChartFilter = useDashboardChartsOptional()?.setChartFilter;

  const { data } = useSWR<{ alertas: Alerta[] }>("/api/dashboard/alertas", fetcher, {
    refreshInterval: 30000,
  });

  const alertas = data?.alertas?.length ? data.alertas : mockAlertas();

  const handleActionClick = (alerta: Alerta) => {
    if (alerta.filterKey) {
      setChartFilter?.({
        type: alerta.filterKey.type,
        value: alerta.filterKey.value,
        label: alerta.filterKey.label ?? alerta.entidad ?? alerta.titulo,
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-[900px] px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary">
            Sistema de alertas persistente
          </h1>
          <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">
            Banda superior fija, colores semánticos, filtros por nivel y estado (activa/resuelta), CTA de acción.
          </p>
        </div>
        <AlertSystem
          alertas={alertas}
          scrollTargetId="alertas-panel"
          onActionClick={handleActionClick}
          maxVisible={15}
        />
      </div>
    </div>
  );
}
