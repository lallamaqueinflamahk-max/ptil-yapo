"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

const OPERADOR_CEDULA_KEY = "operador_yapo_cedula";
const CENTRO_ASUNCION: [number, number] = [-25.2637, -57.5759];

interface PuntoAlerta {
  id: string;
  nombreTrabajador: string;
  oficio: string;
  whatsapp: string;
  gpsLat: number | null;
  gpsLng: number | null;
}

export default function OperadorMapaPage() {
  const [cedula, setCedula] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<PuntoAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    const c = typeof window !== "undefined" ? localStorage.getItem(OPERADOR_CEDULA_KEY) : null;
    setCedula(c);
  }, []);

  useEffect(() => {
    if (!cedula) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/operador/alertas?cedula=${encodeURIComponent(cedula)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.alertas) {
          setAlertas(
            data.alertas.map((a: { id: string; nombreTrabajador: string; oficio: string; whatsapp: string; gpsLat: number | null; gpsLng: number | null }) => ({
              id: a.id,
              nombreTrabajador: a.nombreTrabajador,
              oficio: a.oficio,
              whatsapp: a.whatsapp,
              gpsLat: a.gpsLat,
              gpsLng: a.gpsLng,
            }))
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cedula]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || loading) return;

    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");

    const map = L.map(mapContainerRef.current).setView(CENTRO_ASUNCION, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const markers: { remove(): void }[] = [];
    const puntosConGps = alertas.filter((a) => a.gpsLat != null && a.gpsLng != null);
    if (puntosConGps.length > 0) {
      puntosConGps.forEach((p) => {
        const m = L.marker([p.gpsLat, p.gpsLng])
          .addTo(map)
          .bindPopup(`<strong>${p.nombreTrabajador}</strong><br/>${p.oficio}<br/>WhatsApp: ${p.whatsapp}`);
        markers.push(m);
      });
      const first = puntosConGps[0];
      if (first?.gpsLat != null && first?.gpsLng != null) {
        map.setView([first.gpsLat, first.gpsLng], 14);
      }
    }

    mapRef.current = map;
    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [loading, alertas.map((a) => a.id + (a.gpsLat ?? "") + (a.gpsLng ?? "")).join(",")]);

  if (!cedula) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-4">Ingresá tu perfil de operador en la página principal para ver el mapa.</p>
        <Link href="/dashboard/operador" className="text-yapo-blue font-medium inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver al panel del operador
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-yapo-blue flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Dónde buscar trabajadores
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Mapa simple: cada pin es un suscriptor pendiente de validación en tu zona. Tocá el pin para ver nombre y WhatsApp.
          </p>
        </div>
        <Link
          href="/dashboard/operador"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yapo-blue text-white text-sm font-medium hover:bg-yapo-blue/90"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      {loading ? (
        <div className="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">Cargando mapa…</div>
      ) : (
        <div ref={mapContainerRef} className="h-[450px] w-full rounded-xl border-2 border-gray-200 overflow-hidden" />
      )}

      {!loading && alertas.length === 0 && (
        <p className="text-center text-gray-600 text-sm">No hay alertas en tu zona. Cuando aparezcan, se verán en el mapa.</p>
      )}
      {!loading && alertas.length > 0 && (
        <p className="text-center text-gray-600 text-sm">
          {alertas.filter((a) => a.gpsLat != null && a.gpsLng != null).length} de {alertas.length} con ubicación en el mapa.
        </p>
      )}
    </div>
  );
}
