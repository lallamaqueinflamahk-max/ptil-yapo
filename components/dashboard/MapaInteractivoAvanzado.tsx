"use client";

import "leaflet/dist/leaflet.css";
import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, MapPin } from "lucide-react";
import PanelSeccionalDetalle from "@/components/dashboard/PanelSeccionalDetalle";
import type { PuntoMapa } from "@/lib/types/mapaCapas";

const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

/** Base clara estilo Mapbox/CARTO */
const LIGHT_BASE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const LIGHT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Colores vivos / neón para capas y estado */
export const CAPAS_CONFIG: Record<string, { color: string; label: string }> = {
  leales: { color: "#00E676", label: "Leales" },
  riesgo: { color: "#FF1744", label: "Riesgo" },
  capacitacion: { color: "#00B0FF", label: "Capacitación" },
  dirigentes: { color: "#7C4DFF", label: "Dirigentes" },
  verificacion: { color: "#FFAB00", label: "Verificación" },
};

export const ESTADO_CONFIG: Record<string, { color: string; label: string }> = {
  green: { color: "#00E676", label: "OK" },
  yellow: { color: "#FFEA00", label: "Atención" },
  red: { color: "#FF1744", label: "Crítico" },
};

export interface SeccionalMapa {
  id: string;
  numero: number;
  nombre: string;
  barrio?: string;
  titular?: string;
  lat: number;
  lng: number;
  cantidadValidados?: number;
  estado: "green" | "yellow" | "red";
  estadoLabel?: string;
  rangoId?: string;
}

/** Bounds en formato [[south, west], [north, east]] para filtrar "en vista". */
export type MapViewBounds = [[number, number], [number, number]];

export interface MapaInteractivoAvanzadoProps {
  seccionales: SeccionalMapa[];
  capas: Record<string, PuntoMapa[]>;
  /** Filtro desde KPIs (ej. riesgo, lealtad, formalizacion) */
  kpiFilter?: string | null;
  /** Ranking/líder seleccionado para resaltar seccionales */
  selectedRanking?: string | null;
  /** Altura del mapa en px */
  height?: number;
  className?: string;
  /** Selección externa (ej. desde tabla): zoom y panel se sincronizan */
  selectedNumero?: number | null;
  /** Al hacer click en seccional (numero) o cerrar panel (null) */
  onSeccionalSelect?: (numero: number | null) => void;
  /** Llamado al mover/zoom del mapa: el mapa controla la vista; KPIs/tablas pueden filtrar por "en vista". */
  onMapViewChange?: (bounds: MapViewBounds, zoom: number) => void;
}

export default function MapaInteractivoAvanzado({
  seccionales,
  capas,
  kpiFilter = null,
  selectedRanking = null,
  height = 520,
  className = "",
  selectedNumero: selectedNumeroProp,
  onSeccionalSelect,
  onMapViewChange,
}: MapaInteractivoAvanzadoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const layerGroupsRef = useRef<Record<string, ReturnType<typeof import("leaflet").layerGroup>>>({});
  const seccionalesLayerRef = useRef<ReturnType<typeof import("leaflet").layerGroup> | null>(null);
  const markersRef = useRef<ReturnType<typeof import("leaflet").circleMarker | typeof import("leaflet").Marker>[]>([]);
  const onMapViewChangeRef = useRef(onMapViewChange);
  onMapViewChangeRef.current = onMapViewChange;

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    leales: true,
    riesgo: true,
    capacitacion: true,
    dirigentes: true,
    verificacion: false,
  });
  /** Filtro por estado: null = todos; 'green'|'yellow'|'red' = solo ese estado */
  const [estadoFilter, setEstadoFilter] = useState<"green" | "yellow" | "red" | null>(null);
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const isControlled = selectedNumeroProp !== undefined;
  const selectedNumero = isControlled ? selectedNumeroProp ?? null : internalSelected;
  const setSelectedNumero = isControlled
    ? (n: number | null) => { onSeccionalSelect?.(n ?? null); }
    : setInternalSelected;

  const capaIds = Object.keys(CAPAS_CONFIG);
  const capaDataKey = (id: string) => (id === "verificacion" ? "no_verificados" : id);

  const zoomToSeccional = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([lat, lng], 15);
  }, []);

  useEffect(() => {
    if (selectedNumero == null) return;
    const s = seccionales.find((x) => x.numero === selectedNumero);
    if (s) zoomToSeccional(s.lat, s.lng);
  }, [selectedNumero, seccionales, zoomToSeccional]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const L = require("leaflet");
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(CENTRO_ASUNCION, 12);
    const base = L.tileLayer(LIGHT_BASE_URL, {
      attribution: LIGHT_ATTRIBUTION,
    }).addTo(map);

    const overlays: Record<string, ReturnType<typeof L.layerGroup>> = {};
    capaIds.forEach((id) => {
      overlays[id] = L.layerGroup();
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
      const bounds: MapViewBounds = [[sw.lat, sw.lng], [ne.lat, ne.lng]];
      onMapViewChangeRef.current?.(bounds, map.getZoom());
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
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = require("leaflet");
    if (!map) return;

    capaIds.forEach((capaId) => {
      const group = layerGroupsRef.current[capaId];
      if (!group) return;
      group.clearLayers();
      if (!activeLayers[capaId]) return;
      const key = capaDataKey(capaId);
      const puntos = capas[key] ?? [];
      const config = CAPAS_CONFIG[capaId];
      const color = config?.color ?? "#6B7280";
      puntos.forEach((p) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
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

  useEffect(() => {
    const map = mapRef.current;
    const L = require("leaflet");
    const seccLayer = seccionalesLayerRef.current;
    if (!map || !seccLayer) return;

    seccLayer.clearLayers();
    markersRef.current = [];

    const estadoColor = (estado: string) =>
      ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG]?.color ?? "#64748B";

    seccionalesFiltered.forEach((s) => {
      const color = estadoColor(s.estado);
      const count = s.cantidadValidados ?? 0;
      const displayCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);
      const icon = L.divIcon({
        className: "seccional-marker-num",
        html: `
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;color:#fff;font-family:system-ui,sans-serif;
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
            <span style="font-weight:600;color:${color};">${s.estadoLabel ?? s.estado}</span>
          </div>
        </div>
      `;
      marker.bindTooltip(previewHtml, {
        direction: "top",
        offset: [0, -22],
        opacity: 0.95,
        className: "mapa-tooltip-seccional",
      });

      marker.on("click", () => {
        setSelectedNumero(s.numero);
        zoomToSeccional(s.lat, s.lng);
      });

      marker.addTo(seccLayer);
      markersRef.current.push(marker as unknown as ReturnType<typeof L.circleMarker>);
    });
  }, [seccionalesFiltered, zoomToSeccional, setSelectedNumero]);

  const toggleCapa = (id: string) => {
    setActiveLayers((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 bg-white ${className}`}>
      {/* Capas: chips con color de capa, clickeables */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-white/95 px-2 py-1.5 shadow-md border border-gray-100">
          <Layers className="w-4 h-4 text-dash-blue" />
          <span className="text-xs font-semibold text-dash-muted uppercase tracking-wide">Capas</span>
        </div>
        <div className="flex flex-wrap gap-2 rounded-lg bg-white/95 p-2 shadow-md border border-gray-100">
          {capaIds.map((id) => {
            const config = CAPAS_CONFIG[id];
            const hasData = id === "verificacion" ? (capas["no_verificados"]?.length ?? 0) > 0 : (capas[id]?.length ?? 0) > 0;
            const active = activeLayers[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => hasData && toggleCapa(id)}
                disabled={!hasData}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border-2 transition-all
                  ${active ? "text-white shadow-md scale-105" : "bg-white/80 text-gray-600 border-gray-200"}
                  ${!hasData ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}
                `}
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

      {/* Estado: filtro clickeable (OK, Atención, Crítico) */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-white/95 px-3 py-2 shadow-md border border-gray-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-dash-muted uppercase tracking-wide mr-1">Estado</span>
        <button
          type="button"
          onClick={() => setEstadoFilter(null)}
          className={`rounded-full px-3 py-1.5 font-semibold border-2 transition-all ${
            estadoFilter === null
              ? "bg-slate-700 text-white border-slate-700 shadow"
              : "bg-white text-gray-600 border-gray-200 hover:border-slate-400"
          }`}
        >
          Todos
        </button>
        {(Object.keys(ESTADO_CONFIG) as Array<keyof typeof ESTADO_CONFIG>).map((key) => {
          const cfg = ESTADO_CONFIG[key];
          const isActive = estadoFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setEstadoFilter(isActive ? null : key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold border-2 transition-all ${
                isActive ? "text-white shadow-md" : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
              style={{ borderColor: cfg.color, ...(isActive ? { backgroundColor: cfg.color } : {}) }}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white/90" : ""}`} style={isActive ? {} : { backgroundColor: cfg.color }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Filtro activo (explica el mapa) */}
      {(kpiFilter || selectedRanking) && (
        <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-dash-blue/10 border border-dash-blue/25 px-3 py-2 text-xs text-dash-blue font-medium">
          {kpiFilter && <>Filtro KPI: {kpiFilter}</>}
          {kpiFilter && selectedRanking && " · "}
          {selectedRanking && <>Ranking: {selectedRanking}</>}
        </div>
      )}

      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full z-0"
      />

      {/* Panel lateral al hacer click en seccional */}
      <AnimatePresence>
        {selectedNumero !== null && (
          <div className="absolute inset-0 z-[1100]">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setSelectedNumero(null)}
              onKeyDown={(e) => e.key === "Escape" && setSelectedNumero(null)}
              role="button"
              tabIndex={0}
              aria-label="Cerrar panel"
            />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md">
              <PanelSeccionalDetalle
                numero={selectedNumero}
                onClose={() => setSelectedNumero(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
