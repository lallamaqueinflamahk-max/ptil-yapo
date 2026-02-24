"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { AuditTimeline, toAuditEvent } from "@/components/audit";
import type { AuditEvent } from "@/lib/types/audit";
import type { EventoAuditoria } from "@/lib/types/dashboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AuditoriaPage() {
  const { data, mutate } = useSWR("/api/dashboard/maestro", fetcher, {
    refreshInterval: 20000,
  });

  const eventosRaw: EventoAuditoria[] = data?.eventosAuditoria ?? [];
  const eventos: AuditEvent[] = eventosRaw.map((e) =>
    toAuditEvent({
      id: e.id,
      tipo: e.tipo,
      entidad: e.entidad,
      entidadId: e.entidadId,
      usuario: e.usuario,
      mensaje: e.mensaje,
      createdAt: e.createdAt,
    })
  );

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-[900px] px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary">
            Registro de auditoría
          </h1>
          <p className="text-sentinel-sm text-sentinel-text-secondary mt-1">
            Timeline de eventos. Solo lectura. Filtro por tipo de evento. Visual profesional tipo banca/gobierno.
          </p>
        </div>
        <AuditTimeline
          eventos={eventos}
          onRefresh={handleRefresh}
          refreshInterval={25000}
          maxHeight={520}
        />
      </div>
    </div>
  );
}
