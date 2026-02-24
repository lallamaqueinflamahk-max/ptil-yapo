"use client";

import "leaflet/dist/leaflet.css";
import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import PanelSeccionalDetalle from "@/components/dashboard/PanelSeccionalDetalle";
import type { SeccionalMapaControl } from "./types";
import type { PuntoMapa } from "@/lib/types/mapaCapas";
import type { ZoomSemantico } from "./types";
import {
  CAPAS_CONTROL,
  ESTADO_COLOR,
  CENTRO_ASUNCION,
  ZOOM_CIUDAD,
  ZOOM_BARRIO,
  ZOOM_SECCIONAL,
  LIGHT_BASE_URL,
  LIGHT_ATTRIBUTION,
} from "./constants";

export interface MapaControlDashboardProps {
  seccionales: SeccionalMapaControl[];
  /** Capas por dataKey: leales, riesgo, no_verificados, capacitacion */
  capas: Record<string, PuntoMapa[]>;
  height?: number;
  className?: string;
}

function zoomToSemantico(zoom: number): ZoomSemantico {
  if (zoom <= ZOOM_CIUDAD) return "ciudad";
  if (zoom < ZOOM_SECCIONAL) return "barrio";
  return "seccional";
}

const ZOOM_LABEL: Record<ZoomSemantico, string> = {
  ciudad: "Vista ciudad",
  barrio: "Vista barrio",
  seccional: "Vista seccional",
};

export default function MapaControlDashboard({
  seccionales,
  capas,
  height = 520,
  className = "",
}: MapaControlDashboardProps) {
  const { chartFilter, setChartFilter, resetChartFilter, setMapViewState } = useDashboardCharts();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const layerGroupsRef = useRef<Record<string, ReturnType<typeof import("leaflet").layerGroup>>({});
  const seccionalesLayerRef = useRef<ReturnType<typeof import("leaflet").layerGroup> | null>(null);
  const markersRef = useRef<ReturnType<typeof import("leaflet").Marker>[]>([]);

  const selectedNumero =
    chartFilter?.type === "seccional" ? parseInt(chartFilter.value, 10) : null;

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    lealtad: true,
    riesgo: true,
    verificacion: false,
    idoneidad: true,
  });
  const [estadoFilter, setEstadoFilter] = useState<"green" | "yellow" | "red" | null>(null);
  const [zoomLabel, setZoomLabel] = useState<ZoomSemantico>("ciudad");

  const flyToSeccional = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([lat, lng], ZOOM_SECCIONAL, { duration: 0.6, easeLinearity: 0.25 });
  }, []);

  const handleSeccionalClick = useCallback(
    (s: SeccionalMapaControl) => {
      setChartFilter({ type: "seccional", value: String(s.numero), label: s.nombre });
      flyToSeccional(s.lat, s.lng);
    },
    [setChartFilter, flyToSeccional]
  );

  const handleClosePanel = useCallback(() => {
    resetChartFilter();
    const map = mapRef.current;
    if (map) map.flyTo(CENTRO_ASUNCION, ZOOM_CIUDAD, { duration: 0.5 });
  }, [resetChartFilter]);

  // Sincronizar zoom a seccional cuando hay selección externa (ej. desde tabla)
  useEffect(() => {
    if (selectedNumero == null) return;
    const s = seccionales.find((x) => x.numero === selectedNumero);
    if (s) flyToSeccional(s.lat, s.lng);
  }, [selectedNumero, seccionales, flyToSeccional]);

  // Inicializar mapa
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const L = require("leaflet");
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(CENTRO_ASUNCION, ZOOM_CIUDAD);
    L.tileLayer(LIGHT_BASE_URL, { attribution: LIGHT_ATTRIBUTION }).addTo(map);

    const overlays: Record<string, ReturnType<typeof L.layerGroup>> = {};
    CAPAS_CONTROL.forEach((c) => {
      overlays[c.id] = L.layerGroup();
    });
    const seccLayer = L.layerGroup().addTo(map);
    Object.values(overlays).forEach((og) => og.addTo(map));

    mapRef.current = map;
    layerGroupsRef.current = overlays;
    seccionalesLayerRef.current = seccLayer;

    const reportView = () => {
      const b = map.getBounds();
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      setMapViewState({
        bounds: [[sw.lat, sw.lng], [ne.lat, ne.lng]],
        zoom: map.getZoom(),
      });
      setZoomLabel(zoomToSemantico(map.getZoom()));
    };
    reportView();
    map.on("moveend", reportView);

    return () => {
      map.off("moveend", reportView);
      map.remove();
      mapRef.current = null;
      seccionalesLayerRef.current = null;
      layerGroupsRef.current = {};
      markersRef.current = [];
    };
  }, [setMapViewState]);

  // Dibujar capas (puntos por dataKey)
  useEffect(() => {
    const map = mapRef.current;
    const L = require("leaflet");
    if (!map) return;

    CAPAS_CONTROL.forEach((config) => {
      const group = layerGroupsRef.current[config.id];
      if (!group) return;
      group.clearLayers();
      if (!activeLayers[config.id]) return;
      const puntos = capas[config.dataKey] ?? [];
      puntos.forEach((p) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 6,
          fillColor: config.color,
          color: "#fff",
          weight: 1.5,
          fillOpacity: 0.9,
        });
        marker.addTo(group);
      });
    });
  }, [capas, activeLayers]);

  const seccionalesFiltered =
    estadoFilter === null
      ? seccionales
      : seccionales.filter((s) => s.estado === estadoFilter);

  // Dibujar seccionales (marcadores con número + tooltip + click)
  useEffect(() => {
    const map = mapRef.current;
    const L = require("leaflet");
    const seccLayer = seccionalesLayerRef.current;
    if (!map || !seccLayer) return;

    seccLayer.clearLayers();
    markersRef.current = [];

    seccionalesFiltered.forEach((s) => {
      const color = ESTADO_COLOR[s.estado] ?? "#475569";
      const count = s.cantidadValidados ?? 0;
      const displayCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);
      const icon = L.divIcon({
        className: "seccional-marker-num",
        html: `
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;color:#fff;font-family:system-ui,sans-serif;
            transition: transform 0.2s ease;
          "><span>${displayCount}</span></div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const marker = L.marker([s.lat, s.lng], { icon });

      const previewHtml = `
        <div class="mapa-preview-seccional" style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;padding:4px 0;">
          <div style="font-weight:700;color:#1E3A8A;margin-bottom:6px;">${s.nombre}</div>
          <p style="margin:2px 0;color:#6B7280;">${s.barrio ?? ""} · ${s.titular ?? ""}</p>
          <p style="margin:6px 0 2px;">Validados: <strong>${count.toLocaleString("es-PY")}</strong></p>
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};"></span>
            <span style="font-weight:600;">${s.estadoLabel ?? s.estado}</span>
          </div>
          <p style="margin-top:6px;font-size:11px;color:#64748B;">Clic para filtrar dashboard</p>
        </div>
      `;
      marker.bindTooltip(previewHtml, {
        direction: "top",
        offset: [0, -22],
        opacity: 0.95,
        className: "mapa-tooltip-seccional",
      });

      marker.on("click", () => handleSeccionalClick(s));

      marker.addTo(seccLayer);
      markersRef.current.push(marker);
    });
  }, [seccionalesFiltered, handleSeccionalClick]);

  const toggleCapa = (id: string) => {
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className={`relative overflow-hidden rounded-sentinel-xl border border-sentinel-border bg-surface ${className}`}
    >
      {/* Capas activables */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-sentinel-lg border border-sentinel-border bg-surface/95 px-2 py-1.5 shadow-card">
          <Layers className="h-4 w-4 text-semantic-control" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-sentinel-text-secondary">
            Capas
          </span>
        </div>
        <div className="flex flex-wrap gap-2 rounded-sentinel-lg border border-sentinel-border bg-surface/95 p-2 shadow-card">
          {CAPAS_CONTROL.map((config) => {
            const hasData = (capas[config.dataKey]?.length ?? 0) > 0;
            const active = activeLayers[config.id];
            return (
              <button
                key={config.id}
                type="button"
                onClick={() => hasData && toggleCapa(config.id)}
                disabled={!hasData}
                className={`inline-flex items-center gap-1.5 rounded-sentinel-full border-2 px-3 py-1.5 text-xs font-semibold transition-all duration-dashboard ${
                  active
                    ? "text-white shadow-card-hover scale-105"
                    : "border-sentinel-border bg-surface text-sentinel-text-secondary"
                } ${!hasData ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-90"}`}
                style={active ? { backgroundColor: config.color, borderColor: config.color } : {}}
                title={hasData ? (active ? "Ocultar capa" : "Mostrar capa") : "Sin datos"}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-90" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zoom semántico */}
      <div className="absolute top-3 right-3 z-[1000] rounded-sentinel-lg border border-sentinel-border bg-surface/95 px-3 py-2 shadow-card">
        <span className="text-xs font-medium text-sentinel-text-secondary">
          {ZOOM_LABEL[zoomLabel]}
        </span>
      </div>

      {/* Filtro por estado (OK / Atención / Crítico) */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-2 rounded-sentinel-xl border border-sentinel-border bg-surface/95 px-3 py-2 shadow-card text-xs">
        <span className="mr-1 font-semibold uppercase tracking-wide text-sentinel-text-secondary">
          Estado
        </span>
        <button
          type="button"
          onClick={() => setEstadoFilter(null)}
          className={`rounded-sentinel-full border-2 px-3 py-1.5 font-semibold transition-all ${
            estadoFilter === null
              ? "border-semantic-control bg-semantic-control text-semantic-control-on"
              : "border-sentinel-border bg-surface text-sentinel-text-secondary hover:border-sentinel-border-strong"
          }`}
        >
          Todos
        </button>
        {(["green", "yellow", "red"] as const).map((key) => {
          const color = ESTADO_COLOR[key];
          const isActive = estadoFilter === key;
          const label = key === "green" ? "OK" : key === "yellow" ? "Atención" : "Crítico";
          return (
            <button
              key={key}
              type="button"
              onClick={() => setEstadoFilter(isActive ? null : key)}
              className="inline-flex items-center gap-1.5 rounded-sentinel-full border-2 px-3 py-1.5 font-semibold transition-all"
              style={{
                borderColor: color,
                ...(isActive ? { backgroundColor: color, color: "#fff" } : { backgroundColor: "var(--sentinel-color-surface)" }),
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? "#fff" : color }}
              />
              {label}
            </button>
          );
        })}
      </div>

      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full z-0"
      />

      {/* Panel lateral al hacer clic en seccional */}
      <AnimatePresence>
        {selectedNumero !== null && (
          <div className="absolute inset-0 z-[1100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/20"
              onClick={handleClosePanel}
              onKeyDown={(e) => e.key === "Escape" && handleClosePanel()}
              role="button"
              tabIndex={0}
              aria-label="Cerrar panel y restablecer filtro"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md"
            >
              <PanelSeccionalDetalle numero={selectedNumero} onClose={handleClosePanel} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
