"use client";

import "leaflet/dist/leaflet.css";
import { useRef, useEffect } from "react";
import type { PuntoMapa, InfoSuscriptor, InfoDirigente } from "@/lib/types/mapaCapas";

const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

const CAPA_CONFIG: Record<string, { color: string; label: string }> = {
  leales: { color: "#059669", label: "Leales" },
  no_verificados: { color: "#F59E0B", label: "No verificados" },
  riesgo: { color: "#DC2626", label: "Riesgo" },
  capacitacion: { color: "#6366F1", label: "Capacitación" },
  dirigentes: { color: "#1E3A8A", label: "Dirigentes" },
};

function buildPopupSuscriptor(s: InfoSuscriptor): string {
  return `
    <div class="mapa-popup" style="min-width:260px;max-width:320px;font-family:system-ui,sans-serif;font-size:13px;">
      <div style="font-weight:700;color:#1E3A8A;margin-bottom:8px;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Suscriptor</div>
      <p style="margin:4px 0;"><strong>${s.nombreCompleto}</strong></p>
      <p style="margin:4px 0;color:#6B7280;">Código: ${s.codigoVerificacion}</p>
      <p style="margin:4px 0;">Cédula: ${s.cedula}</p>
      <p style="margin:4px 0;">WhatsApp: ${s.whatsapp}</p>
      <p style="margin:6px 0 0;"><a href="https://wa.me/${s.whatsapp.replace(/\D/g, "")}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:12px;">Abrir WhatsApp</a></p>
      ${s.email ? `<p style="margin:4px 0;">Email: ${s.email}</p>` : ""}
      <p style="margin:8px 0 4px;font-weight:600;">Perfil laboral</p>
      <p style="margin:4px 0;">Oficio: ${s.oficioPrincipal}${s.oficioSecundario ? ` / ${s.oficioSecundario}` : ""}</p>
      <p style="margin:4px 0;">Experiencia: ${s.experienciaAnios} años · Estudios: ${s.nivelEstudios}</p>
      <p style="margin:4px 0;">Situación: ${s.situacionLaboral} · Seguro: ${s.seguroSocial ? "Sí" : "No"}</p>
      <p style="margin:4px 0;">Clasificación: <strong>${s.clasificacionIdoneidad}</strong></p>
      <p style="margin:8px 0 4px;font-weight:600;">Verificación y lealtad</p>
      <p style="margin:4px 0;">Estado: ${s.estadoVerificacion} · Lealtad: ${s.estadoLealtad}</p>
      <p style="margin:8px 0 4px;font-weight:600;">Respaldo</p>
      <p style="margin:4px 0;">Gestor: ${s.gestorZona} (${s.cargoGestor}) · Seccional ${s.seccionalNro}</p>
      <p style="margin:4px 0;">Promotor: ${s.promotor}</p>
      <p style="margin:8px 0 0;color:#6B7280;font-size:11px;">Inscripción: ${s.fechaInscripcion}</p>
    </div>
  `;
}

function buildPopupDirigente(d: InfoDirigente): string {
  return `
    <div class="mapa-popup" style="min-width:220px;font-family:system-ui,sans-serif;font-size:13px;">
      <div style="font-weight:700;color:#1E3A8A;margin-bottom:8px;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Dirigente</div>
      <p style="margin:4px 0;"><strong>${d.nombreCompleto}</strong></p>
      <p style="margin:4px 0;">Cargo: ${d.cargo}</p>
      <p style="margin:4px 0;">Seccional: ${d.seccional}</p>
      ${d.contacto ? `<p style="margin:4px 0;">Contacto: ${d.contacto}</p><p style="margin:6px 0 0;"><a href="https://wa.me/${d.contacto.replace(/\D/g, "")}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:12px;">Abrir WhatsApp</a></p>` : ""}
      <p style="margin:4px 0;">Estado: ${d.activo ? "Activo" : "Inactivo"}</p>
    </div>
  `;
}

function buildPopupContent(info: InfoSuscriptor | InfoDirigente): string {
  return info.tipo === "suscriptor" ? buildPopupSuscriptor(info) : buildPopupDirigente(info);
}

export interface MapaCapasSuscriptoresProps {
  capas: Record<string, PuntoMapa[]>;
}

export default function MapaCapasSuscriptores({ capas }: MapaCapasSuscriptoresProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const layerGroupsRef = useRef<Record<string, ReturnType<typeof import("leaflet").layerGroup>>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const L = require("leaflet");
    if (mapRef.current) return;

    const map = L.map(containerRef.current).setView(CENTRO_ASUNCION, 13);
    const baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const overlays: Record<string, ReturnType<typeof L.layerGroup>> = {};
    const capaIds = Object.keys(CAPA_CONFIG);
    capaIds.forEach((id) => {
      overlays[id] = L.layerGroup();
    });

    Object.values(overlays).forEach((og) => og.addTo(map));

    L.control
      .layers(
        { "Mapa base": baseLayer },
        {
          [CAPA_CONFIG.leales.label]: overlays.leales,
          [CAPA_CONFIG.no_verificados.label]: overlays.no_verificados,
          [CAPA_CONFIG.riesgo.label]: overlays.riesgo,
          [CAPA_CONFIG.capacitacion.label]: overlays.capacitacion,
          [CAPA_CONFIG.dirigentes.label]: overlays.dirigentes,
        },
        { collapsed: true }
      )
      .addTo(map);

    mapRef.current = map;
    layerGroupsRef.current = overlays;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = require("leaflet");
    if (!map) return;

    Object.keys(layerGroupsRef.current).forEach((capaId) => {
      const group = layerGroupsRef.current[capaId];
      if (!group) return;
      group.clearLayers();
      const puntos = capas[capaId] ?? [];
      const config = CAPA_CONFIG[capaId];
      const color = config?.color ?? "#6B7280";
      puntos.forEach((p) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 10,
          fillColor: color,
          color: "#fff",
          weight: 2,
          fillOpacity: 0.9,
        });
        const html = buildPopupContent(p.info);
        marker.bindPopup(html, { maxWidth: 340 });
        marker.addTo(group);
      });
    });
  }, [capas]);

  return (
    <div className="relative w-full">
      <div className="absolute top-2 left-2 z-[1000] flex flex-wrap gap-2 rounded-lg bg-white/95 px-3 py-2 shadow-md">
        {Object.entries(CAPA_CONFIG).map(([id, { color, label }]) => (
          <span key={id} className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <span
              className="h-3 w-3 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        className="h-[480px] w-full rounded-xl overflow-hidden border border-yapo-gray-dark z-0"
      />
    </div>
  );
}
