"use client";

import "leaflet/dist/leaflet.css";
import { useRef, useEffect, useMemo } from "react";

export interface CapaCalorPoint {
  id: number;
  lat: number;
  lng: number;
  cantidad: number;
  color?: string;
  label?: string;
}

export interface CapaSeccional {
  id: string;
  numero: number;
  nombre: string;
  lat: number;
  lng: number;
  rangoId?: string;
}

export interface LegendItem {
  color: string;
  label: string;
}

const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

export default function MapaMulticapa({
  puntosCalor = [],
  seccionales = [],
  legend = [],
}: {
  puntosCalor?: CapaCalorPoint[];
  seccionales?: CapaSeccional[];
  legend?: LegendItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const layersRef = useRef<{ calor: ReturnType<typeof import("leaflet").circleMarker>[]; seccionales: ReturnType<typeof import("leaflet").circleMarker>[] }>({
    calor: [],
    seccionales: [],
  });

  const maxCantidad = useMemo(
    () => Math.max(...puntosCalor.map((p) => p.cantidad), 1),
    [puntosCalor]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const L = require("leaflet");
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(CENTRO_ASUNCION, 12);
    const baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const overlayCalor = L.layerGroup().addTo(map);
    const overlaySeccionales = L.layerGroup().addTo(map);

    L.control
      .layers(
        { "Mapa base": baseLayer },
        {
          "Calor por seccionales": overlayCalor,
          "Puntos seccionales": overlaySeccionales,
        },
        { collapsed: true }
      )
      .addTo(map);

    mapRef.current = map;
    (map as unknown as { _overlayCalor: typeof overlayCalor })._overlayCalor = overlayCalor;
    (map as unknown as { _overlaySeccionales: typeof overlaySeccionales })._overlaySeccionales = overlaySeccionales;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = { calor: [], seccionales: [] };
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const overlayCalor = (map as unknown as { _overlayCalor: { clearLayers: () => void } })._overlayCalor;
    const overlaySeccionales = (map as unknown as { _overlaySeccionales: { clearLayers: () => void } })._overlaySeccionales;
    const L = require("leaflet");

    overlayCalor.clearLayers();
    layersRef.current.calor = [];
    puntosCalor.forEach((p) => {
      const radius = 4 + (p.cantidad / maxCantidad) * 20;
      const opacity = 0.5 + (p.cantidad / maxCantidad) * 0.4;
      const fillColor = p.color ?? "#F59E0B";
      const circle = L.circleMarker([p.lat, p.lng], {
        radius,
        fillColor,
        color: "#1E3A8A",
        weight: 1.5,
        fillOpacity: opacity,
      });
      const popupText = p.label
        ? `${p.label}<br/><strong>${p.cantidad.toLocaleString("es-PY")}</strong> validados`
        : `Seccional ${p.id}: ${p.cantidad.toLocaleString("es-PY")} validados`;
      circle.bindPopup(popupText);
      circle.addTo(overlayCalor);
      layersRef.current.calor.push(circle);
    });

    overlaySeccionales.clearLayers();
    layersRef.current.seccionales = [];
    seccionales.forEach((s) => {
      const circle = L.circleMarker([s.lat, s.lng], {
        radius: 10,
        fillColor: "#1E3A8A",
        color: "#fff",
        weight: 2,
        fillOpacity: 0.8,
      });
      circle.bindPopup(`<strong>${s.nombre}</strong><br/>${s.numero}`);
      circle.addTo(overlaySeccionales);
      layersRef.current.seccionales.push(circle);
    });
  }, [puntosCalor, seccionales, maxCantidad]);

  return (
    <div className="relative w-full">
      {legend.length > 0 && (
        <div className="absolute top-2 left-2 z-[1000] flex flex-wrap gap-3 rounded-lg bg-white/95 px-3 py-2 shadow-md">
          {legend.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <span
                className="h-3 w-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div
        ref={containerRef}
        className="h-[420px] w-full rounded-xl overflow-hidden border border-yapo-gray-dark z-0"
      />
    </div>
  );
}
