"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  UserCheck,
  GraduationCap,
  Award,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PAGES, QUICK_ACCESS, PRODUCT, OFERTA_VALOR } from "@/lib/copy/dashboard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import KPICard from "@/components/dashboard/KPICard";
import PageHero from "@/components/dashboard/PageHero";
import KPIDynamic from "@/components/dashboard/KPIDynamic";
import type { KPIDef, KPIVariant } from "@/app/api/dashboard/kpis/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getEstadoCounts(listado: { estado?: string }[] | undefined) {
  if (!listado?.length) return { countRed: 0, countYellow: 0, countGreen: 0, countRiesgo: 0 };
  const countRed = listado.filter((s) => s.estado === "red").length;
  const countYellow = listado.filter((s) => s.estado === "yellow").length;
  const countGreen = listado.filter((s) => s.estado === "green").length;
  return { countRed, countYellow, countGreen, countRiesgo: countRed + countYellow };
}

export default function DashboardControlRoomPage() {
  const router = useRouter();
  const [ofertaExpandida, setOfertaExpandida] = useState(false);
  const { data: maestro } = useSWR("/api/dashboard/maestro", fetcher, { refreshInterval: 15000 });
  const { data: pro } = useSWR("/api/dashboard/pro", fetcher, { refreshInterval: 15000 });
  const { data: kpisData } = useSWR<{ kpis: (KPIDef & { variant?: KPIVariant })[] }>(
    "/api/dashboard/kpis",
    fetcher,
    { refreshInterval: 15000 }
  );
  const { data: derivacionesData } = useSWR(
    "/api/idoneidad/derivaciones",
    fetcher,
    { refreshInterval: 15000 }
  );
  const { data: certificacionesData } = useSWR(
    "/api/idoneidad/certificaciones",
    fetcher,
    { refreshInterval: 15000 }
  );

  const estadoTerritorio = useMemo(
    () => getEstadoCounts(maestro?.listadoSeccionales),
    [maestro?.listadoSeccionales]
  );

  const handleKpiDrillDown = (kpi: KPIDef & { variant?: KPIVariant }) => {
    const url = kpi.filterKey
      ? `${kpi.drillDownPath}?filter=${encodeURIComponent(kpi.filterKey)}`
      : kpi.drillDownPath;
    router.push(url);
  };

  const getKpiActionLabel = (kpi: KPIDef) => {
    if (kpi.drillDownPath === "/dashboard/maestro") return "Ver en Territorio";
    if (kpi.drillDownPath === "/dashboard/capacitacion") return "Ir a Capacitación";
    if (kpi.drillDownPath === "/dashboard/pro") return "Ver equipos";
    return "Ver detalle";
  };

  const kpis = useMemo(() => {
    const totalVotantes = maestro?.totalVotantes ?? 0;
    const seccionales = maestro?.seccionales ?? 0;
    const concejalesActivos = maestro?.concejalesActivos ?? 0;
    const eventosHoy = maestro?.eventosHoy ?? 0;
    const afiliadosLeales = pro?.afiliadosLeales ?? 0;
    const operadores = pro?.operadores ?? 0;
    const derivaciones = derivacionesData?.total ?? 0;
    const certificaciones = certificacionesData?.total ?? 0;
    const pendientes = (derivacionesData?.derivaciones ?? []).filter(
      (d: { estado: string }) => d.estado === "PENDIENTE"
    ).length;

    return {
      totalVotantes,
      seccionales,
      concejalesActivos,
      eventosHoy,
      afiliadosLeales,
      operadores,
      derivaciones,
      certificaciones,
      pendientesCapacitacion: pendientes,
    };
  }, [maestro, pro, derivacionesData, certificacionesData]);

  const { home } = PAGES;

  return (
    <div className="space-y-8">
      <PageHero
        title={home.title}
        subtitle={home.subtitle}
        trust={home.trust}
        forWho={home.forWho}
      />

      {/* Estado del día: primer vistazo + CTA a Territorio */}
      <div className="rounded-2xl border-2 border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado del territorio</span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden />
              <strong className="text-red-700">{estadoTerritorio.countRed}</strong> crítico{estadoTerritorio.countRed !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-amber-500" aria-hidden />
              <strong className="text-amber-800">{estadoTerritorio.countYellow}</strong> atención
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden />
              <strong className="text-green-800">{estadoTerritorio.countGreen}</strong> OK
            </span>
          </div>
          <Link
            href={estadoTerritorio.countRiesgo > 0 ? "/dashboard/maestro?filter=riesgo" : "/dashboard/maestro"}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#1E40AF] transition-colors"
          >
            Ver en Territorio
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>

      <section aria-label={home.sections.kpis}>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          {home.sections.kpis}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpisData?.kpis ? (
            kpisData.kpis.map((kpi) => (
              <KPIDynamic
                key={kpi.id}
                kpi={kpi}
                onDrillDown={handleKpiDrillDown}
                actionLabel={getKpiActionLabel(kpi)}
                animate
              />
            ))
          ) : (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-[14px] border border-dash-blue/15 bg-dash-blue/5 p-4 sm:p-5 h-[120px] animate-pulse"
                  aria-hidden
                />
              ))}
            </>
          )}
        </div>
      </section>

      <section aria-label={home.sections.main}>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          {home.sections.main}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            value={kpis.totalVotantes}
            label="Total votantes"
            sublabel="Base territorial"
            variant="blue"
            icon={<Users className="w-5 h-5" />}
            href="/dashboard/maestro"
          />
          <KPICard
            value={kpis.seccionales}
            label="Seccionales"
            sublabel="Ámbito operativo"
            variant="blue"
            icon={<MapPin className="w-5 h-5" />}
            href="/dashboard/maestro"
          />
          <KPICard
            value={kpis.afiliadosLeales}
            label="Afiliados leales"
            sublabel="Pro"
            variant="green"
            icon={<TrendingUp className="w-5 h-5" />}
            href="/dashboard/pro"
          />
          <KPICard
            value={kpis.operadores}
            label="Operadores YAPÓ"
            sublabel="Caza talentos activos"
            variant="green"
            icon={<UserCheck className="w-5 h-5" />}
            href="/dashboard/operador"
          />
        </div>
      </section>

      <section aria-label={home.sections.idoneidad}>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          {home.sections.idoneidad}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            value={kpis.derivaciones}
            label="Derivaciones a capacitación"
            sublabel="Total registradas"
            variant="yellow"
            icon={<GraduationCap className="w-5 h-5" />}
            href="/dashboard/capacitacion"
          />
          <KPICard
            value={kpis.pendientesCapacitacion}
            label="Pendientes de dictamen"
            sublabel="En curso"
            variant={kpis.pendientesCapacitacion > 0 ? "yellow" : "neutral"}
            icon={<Activity className="w-5 h-5" />}
            href="/dashboard/capacitacion"
          />
          <KPICard
            value={kpis.certificaciones}
            label="Certificaciones registradas"
            sublabel="SNPP / SINAFOCAL / Otro"
            variant="green"
            icon={<Award className="w-5 h-5" />}
            href="/dashboard/capacitacion"
          />
        </div>
      </section>

      {/* Módulos del producto — cada uno justifica su existencia */}
      <section aria-label={home.sections.quickAccess}>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          {home.sections.quickAccess}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard href="/dashboard/maestro" interactive>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{QUICK_ACCESS.maestro.title}</p>
                  <p className="text-xs text-gray-700">{QUICK_ACCESS.maestro.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{QUICK_ACCESS.maestro.value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </DashboardCard>

          <DashboardCard href="/dashboard/pro" interactive>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{QUICK_ACCESS.pro.title}</p>
                  <p className="text-xs text-gray-700">{QUICK_ACCESS.pro.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{QUICK_ACCESS.pro.value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </DashboardCard>

          <DashboardCard href="/dashboard/operador" interactive>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{QUICK_ACCESS.operador.title}</p>
                  <p className="text-xs text-gray-700">{QUICK_ACCESS.operador.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{QUICK_ACCESS.operador.value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </DashboardCard>

          <DashboardCard href="/dashboard/capacitacion" interactive>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{QUICK_ACCESS.capacitacion.title}</p>
                  <p className="text-xs text-gray-700">{QUICK_ACCESS.capacitacion.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{QUICK_ACCESS.capacitacion.value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </DashboardCard>
        </div>
      </section>

      {/* Sobre el producto: colapsable para no competir con métricas */}
      <section aria-label="Sobre el producto" className="pt-4 border-t border-gray-200/80">
        <button
          type="button"
          onClick={() => setOfertaExpandida(!ofertaExpandida)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 rounded-lg"
        >
          {PRODUCT.name} — para quién es
          {ofertaExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {ofertaExpandida && (
          <div className="mt-3 space-y-2 max-w-2xl mx-auto text-center">
            <p className="text-xs text-gray-600">
              {PRODUCT.name} está diseñado para {PRODUCT.audience}. Cada módulo responde a un rol y a una necesidad estratégica.
            </p>
            <ul className="text-xs text-gray-600 list-disc list-inside text-left inline-block space-y-1">
              {OFERTA_VALOR.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Micro-alerta si hay pendientes */}
      {kpis.pendientesCapacitacion > 0 && (
        <DashboardCard interactive={false}>
          <div className="p-4 flex items-center gap-3 rounded-[14px] bg-dash-yellow/8 border border-dash-yellow/25">
            <AlertTriangle className="w-5 h-5 text-dash-yellow shrink-0" />
            <div>
              <p className="font-medium text-dash-blue">
                {kpis.pendientesCapacitacion} derivación{kpis.pendientesCapacitacion !== 1 ? "es" : ""} pendiente{kpis.pendientesCapacitacion !== 1 ? "s" : ""} de dictamen
              </p>
              <p className="text-sm text-dash-muted">
                Revisá el panel de Capacitación para actualizar estados.
              </p>
            </div>
            <Link
              href="/dashboard/capacitacion"
              className="ml-auto btn-yapo min-h-[48px] px-4 text-sm bg-dash-yellow text-white hover:bg-dash-yellow/90 rounded-xl font-medium transition-all duration-dashboard shrink-0"
            >
              Ir a capacitación
            </Link>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
