"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import DashboardCard from "@/components/dashboard/DashboardCard";
import {
  BookOpen,
  PieChart,
  Table,
  CheckCircle2,
  AlertCircle,
  Award,
  Send,
  Loader2,
} from "lucide-react";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import DonutChartStates from "@/components/charts/DonutChartStates";
import { PAGES } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type EstadoDerivacion = "PENDIENTE" | "EN_CURSO" | "COMPLETADO";
type TipoCertificacion = "SNPP" | "SINAFOCAL" | "OTRO";

interface DerivacionItem {
  id: string;
  fichaId: string;
  codigoVerificacion: string;
  nombreCompleto: string;
  oficioPrincipal: string;
  grupoOrigen: string;
  estado: EstadoDerivacion;
  fechaDerivacion: string;
  createdAt: string;
}

interface CertificacionItem {
  id: string;
  fichaId: string;
  codigoVerificacion?: string;
  nombreCompleto?: string;
  oficioPrincipal?: string;
  tipo: string;
  institucion: string;
  fechaEmision: string;
  numeroTitulo?: string | null;
  createdAt: string;
}

export default function DashboardCapacitacionPage() {
  const { chartFilter, resetChartFilter } = useDashboardCharts();
  const [certForm, setCertForm] = useState({
    codigoVerificacion: "",
    tipo: "SNPP" as TipoCertificacion,
    institucion: "",
    fechaEmision: "",
    numeroTitulo: "",
  });
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [updatingDerivacionId, setUpdatingDerivacionId] = useState<string | null>(null);

  const { data: dashboardData } = useSWR("/api/dashboard/capacitacion", fetcher, {
    refreshInterval: 10000,
  });
  const { data: derivacionesData, mutate: mutateDerivaciones } = useSWR<{
    derivaciones: DerivacionItem[];
    total: number;
  }>("/api/idoneidad/derivaciones", fetcher, { refreshInterval: 15000 });
  const { data: certificacionesData, mutate: mutateCertificaciones } = useSWR<{
    certificaciones: CertificacionItem[];
    total: number;
  }>("/api/idoneidad/certificaciones", fetcher, { refreshInterval: 15000 });

  const contadoresPorOficio = dashboardData?.contadoresPorOficio ?? [
    { oficio: "Albañiles", cantidad: 1280 },
    { oficio: "Plomeros", cantidad: 940 },
    { oficio: "Electricistas", cantidad: 730 },
    { oficio: "Limpieza", cantidad: 615 },
  ];
  const matrizReforma = dashboardData?.matrizReforma ?? [
    { label: "Certificados", valor: 80, color: "#22C55E" },
    { label: "Necesita capacitación", valor: 20, color: "#EF4444" },
  ];
  const donutMatrizData = matrizReforma.map((d: { label: string; valor: number; color: string }) => ({
    name: d.label,
    value: d.valor,
    color: d.color,
  }));

  const derivaciones = derivacionesData?.derivaciones ?? [];
  const certificaciones = certificacionesData?.certificaciones ?? [];

  const handleCambiarEstadoDerivacion = async (id: string, estado: EstadoDerivacion) => {
    setUpdatingDerivacionId(id);
    try {
      const res = await fetch(`/api/idoneidad/derivaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al actualizar");
      await mutateDerivaciones();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingDerivacionId(null);
    }
  };

  const handleRegistrarCertificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);
    if (!certForm.codigoVerificacion.trim()) {
      setCertError("El código de verificación es obligatorio.");
      return;
    }
    if (!certForm.institucion.trim()) {
      setCertError("La institución es obligatoria.");
      return;
    }
    if (!certForm.fechaEmision.trim()) {
      setCertError("La fecha de emisión es obligatoria.");
      return;
    }
    setCertSubmitting(true);
    try {
      const res = await fetch("/api/idoneidad/certificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoVerificacion: certForm.codigoVerificacion.trim().toUpperCase(),
          tipo: certForm.tipo,
          institucion: certForm.institucion.trim(),
          fechaEmision: certForm.fechaEmision.trim(),
          numeroTitulo: certForm.numeroTitulo.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al registrar");
      setCertForm({ codigoVerificacion: "", tipo: "SNPP", institucion: "", fechaEmision: "", numeroTitulo: "" });
      await mutateCertificaciones();
    } catch (err) {
      setCertError(err instanceof Error ? err.message : "No se pudo registrar la certificación.");
    } finally {
      setCertSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        title={PAGES.capacitacion.title}
        subtitle={PAGES.capacitacion.subtitle}
        trust={PAGES.capacitacion.trust}
        forWho={PAGES.capacitacion.forWho}
      />
      {chartFilter && (
        <div className="rounded-[14px] border border-dash-yellow/30 bg-dash-yellow/10 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium text-dash-blue">
            Filtro desde gráfico: <span className="font-semibold">{chartFilter.label ?? chartFilter.value}</span>. Doble clic para restablecer.
          </p>
          <button type="button" onClick={resetChartFilter} className="text-sm font-medium text-dash-blue hover:underline">
            Restablecer vista
          </button>
        </div>
      )}

      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Contadores por Oficio</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {contadoresPorOficio.map((item: { oficio: string; cantidad: number }) => (
              <div
                key={item.oficio}
                className="rounded-xl bg-yapo-gray p-4 border border-yapo-gray-dark"
              >
                <p className="text-2xl font-bold text-yapo-blue">{item.cantidad.toLocaleString("es-PY")}</p>
                <p className="text-sm text-gray-600">{item.oficio}</p>
              </div>
            ))}
          </div>
      </DashboardCard>

      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-8 h-8 text-dash-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Matriz de Reforma</h2>
          </div>
          <DonutChartStates
            data={donutMatrizData}
            title=""
            chartId="capacitacion-matriz"
            filterType="state"
            height={260}
          />
      </DashboardCard>

      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-8 h-8 text-dash-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Derivaciones a capacitación</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Trabajadores derivados automáticamente (Grupo C / Grupo B sin certificación). Total: {derivaciones.length}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yapo-gray-dark">
                  <th className="text-left py-2 font-semibold text-yapo-blue">Trabajador</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Oficio</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Grupo</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Estado</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Fecha derivación</th>
                  <th className="text-right py-2 font-semibold text-yapo-blue">Acción</th>
                </tr>
              </thead>
              <tbody>
                {derivaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No hay derivaciones registradas.
                    </td>
                  </tr>
                ) : (
                  derivaciones.map((d) => (
                    <tr key={d.id} className="border-b border-yapo-gray">
                      <td className="py-3">{d.nombreCompleto}</td>
                      <td className="py-3">{d.oficioPrincipal}</td>
                      <td className="py-3">{d.grupoOrigen}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            d.estado === "COMPLETADO"
                              ? "bg-green-100 text-green-800"
                              : d.estado === "EN_CURSO"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {d.estado === "COMPLETADO" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {d.estado}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {new Date(d.fechaDerivacion).toLocaleDateString("es-PY")}
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={d.estado}
                          onChange={(e) => {
                          const nuevo = e.target.value as EstadoDerivacion;
                          if (nuevo !== d.estado) handleCambiarEstadoDerivacion(d.id, nuevo);
                        }}
                          disabled={updatingDerivacionId === d.id}
                          className="text-sm border border-yapo-gray-dark rounded px-2 py-1 bg-white text-yapo-blue"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_CURSO">En curso</option>
                          <option value="COMPLETADO">Completado</option>
                        </select>
                        {updatingDerivacionId === d.id && (
                          <Loader2 className="inline-block w-4 h-4 ml-1 animate-spin text-yapo-blue" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </DashboardCard>

      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-dash-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Registrar certificación</h2>
          </div>
          <form onSubmit={handleRegistrarCertificacion} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de verificación *</label>
              <input
                type="text"
                value={certForm.codigoVerificacion}
                onChange={(e) => setCertForm((f) => ({ ...f, codigoVerificacion: e.target.value }))}
                className="w-full border border-yapo-gray-dark rounded-lg px-3 py-2"
                placeholder="Ej. ABC123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={certForm.tipo}
                onChange={(e) => setCertForm((f) => ({ ...f, tipo: e.target.value as TipoCertificacion }))}
                className="w-full border border-yapo-gray-dark rounded-lg px-3 py-2"
              >
                <option value="SNPP">SNPP</option>
                <option value="SINAFOCAL">SINAFOCAL</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
              <input
                type="text"
                value={certForm.institucion}
                onChange={(e) => setCertForm((f) => ({ ...f, institucion: e.target.value }))}
                className="w-full border border-yapo-gray-dark rounded-lg px-3 py-2"
                placeholder="Nombre de la institución"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de emisión *</label>
              <input
                type="date"
                value={certForm.fechaEmision}
                onChange={(e) => setCertForm((f) => ({ ...f, fechaEmision: e.target.value }))}
                className="w-full border border-yapo-gray-dark rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de título (opcional)</label>
              <input
                type="text"
                value={certForm.numeroTitulo}
                onChange={(e) => setCertForm((f) => ({ ...f, numeroTitulo: e.target.value }))}
                className="w-full border border-yapo-gray-dark rounded-lg px-3 py-2"
                placeholder="Nº de título"
              />
            </div>
            {certError && <p className="text-sm text-red-600">{certError}</p>}
            <button
              type="submit"
              disabled={certSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-yapo-blue text-white rounded-lg hover:bg-yapo-blue/90 disabled:opacity-60"
            >
              {certSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Registrar certificación
            </button>
          </form>
      </DashboardCard>

      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Table className="w-8 h-8 text-dash-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Certificaciones registradas</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Total: {certificaciones.length}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yapo-gray-dark">
                  <th className="text-left py-2 font-semibold text-yapo-blue">Trabajador</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Oficio</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Tipo</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Institución</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Fecha emisión</th>
                  <th className="text-left py-2 font-semibold text-yapo-blue">Nº título</th>
                </tr>
              </thead>
              <tbody>
                {certificaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No hay certificaciones registradas.
                    </td>
                  </tr>
                ) : (
                  certificaciones.map((c) => (
                    <tr key={c.id} className="border-b border-yapo-gray">
                      <td className="py-3">{c.nombreCompleto ?? c.codigoVerificacion ?? "—"}</td>
                      <td className="py-3">{c.oficioPrincipal ?? "—"}</td>
                      <td className="py-3">{c.tipo}</td>
                      <td className="py-3">{c.institucion}</td>
                      <td className="py-3">{c.fechaEmision}</td>
                      <td className="py-3">{c.numeroTitulo ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </DashboardCard>
    </div>
  );
}
