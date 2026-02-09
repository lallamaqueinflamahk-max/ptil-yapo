"use client";

import "leaflet/dist/leaflet.css";
import { useRef, useEffect, useMemo } from "react";
import type { Map as LeafletMap } from "leaflet";

export interface HeatmapPoint {
  id: number;
  lat: number;
  lng: number;
  cantidad: number;
  /** Color por rango (R1/R2/R3) o por zona */
  color?: string;
  label?: string;
}

const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

export interface LegendItem {
  color: string;
  label: string;
}

export default function MapaCalorAsuncion({
  points,
  legend = [],
}: {
  points: HeatmapPoint[];
  legend?: LegendItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<{ remove(): void }[]>([]);

  const maxCantidad = useMemo(
    () => Math.max(...points.map((p) => p.cantidad), 1),
    [points]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const L = require("leaflet");
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(CENTRO_ASUNCION, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const L = require("leaflet");
    points.forEach((p) => {
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
      circle.addTo(map);
      markersRef.current.push(circle);
    });
  }, [points, maxCantidad]);

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
        className="h-[400px] w-full rounded-xl overflow-hidden border border-yapo-gray-dark z-0"
      />
    </div>
  );
}
