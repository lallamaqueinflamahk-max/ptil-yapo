"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { MapPin, Users, TrendingUp, PieChart, BarChart3, Table2, X, GitCompare, AlertTriangle, BarChart2, MessageCircle, ClipboardList, ShieldCheck, GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";
import DashboardCard from "@/components/dashboard/DashboardCard";
import AyudaHerramienta from "@/components/dashboard/AyudaHerramienta";
import ControlSeccionales from "@/components/dashboard/ControlSeccionales";
import AuditoriaTimeline from "@/components/dashboard/AuditoriaTimeline";
import PanelAlertas from "@/components/dashboard/PanelAlertas";
import KPIActionCard from "@/components/dashboard/KPIActionCard";
import { FilterButton, ActionButton } from "@/components/dashboard/SmartButtons";
import { useDashboardCharts } from "@/context/DashboardChartContext";
import LineChartDynamic from "@/components/charts/LineChartDynamic";
import BarChartRanking from "@/components/charts/BarChartRanking";
import DonutChartStates from "@/components/charts/DonutChartStates";
import TableWithSparklines from "@/components/charts/TableWithSparklines";
import EmbudoIdoneidad from "@/components/charts/EmbudoIdoneidad";
import type { HeatmapPoint, LegendItem } from "@/components/MapaCalorAsuncion";
import type { SeccionalRow } from "@/components/dashboard/ControlSeccionales";
import type { EventoAuditoria } from "@/components/dashboard/AuditoriaTimeline";
import { getAllPuntosMapaCapas } from "@/lib/data/mapaCapasData";
import type { PuntoMapa } from "@/lib/types/mapaCapas";
import type { InfoDirigente } from "@/lib/types/mapaCapas";
import { PAGES, OFERTA_VALOR } from "@/lib/copy/dashboard";
import PageHero from "@/components/dashboard/PageHero";
import {
  buildDefaultHeatmap,
  buildPuntosCalor,
  buildSeccionalesMapa,
  buildSeccionalesParaMapaAvanzado,
  buildDonutLealesData,
  buildTablaSeccionalesConSpark,
} from "./maestroData";

const MapaInteractivoAvanzado = dynamic(
  () => import("@/components/dashboard/MapaInteractivoAvanzado"),
  { ssr: false }
);
const MapaMulticapa = dynamic(() => import("@/components/MapaMulticapa"), { ssr: false });
const MapaCapasSuscriptores = dynamic(
  () => import("@/components/MapaCapasSuscriptores"),
  { ssr: false }
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MAP_LEGEND: LegendItem[] = [
  { color: "#DC2626", label: "R1 Estratégico" },
  { color: "#1E3A8A", label: "R2 Operativo" },
  { color: "#059669", label: "R3 Base" },
];

const FILTER_LABELS: Record<string, string> = {
  riesgo: "Riesgo Político",
  concentracion: "Concentración de Poder",
  formalizacion: "Nivel de Formalización",
  "activos-hoy": "Suscriptores activos hoy",
};

function filterFromQuery(filterKey: string | null): { type: "kpi"; value: string; label: string } | null {
  if (!filterKey || !FILTER_LABELS[filterKey]) return null;
  return { type: "kpi", value: filterKey, label: FILTER_LABELS[filterKey] };
}

/** Textos de ayuda por herramienta (mapas y gráficos) */
const AYUDA_METRICAS = {
  titulo: "Métricas globales",
  introduccion: "Resumen numérico del territorio: total de votantes, cantidad de seccionales, concejales activos y eventos del día. Usalo como referencia rápida del alcance del programa.",
  items: [
    { label: "Total votantes", descripcion: "Cantidad total de personas en el padrón consideradas en el PTIL." },
    { label: "Seccionales", descripcion: "Número de seccionales territoriales que participan en el programa." },
    { label: "Concejales activos", descripcion: "Concejales que tienen actividad reciente en el dashboard." },
    { label: "Eventos hoy", descripcion: "Cantidad de eventos o actualizaciones registradas en el día." },
  ],
};
const AYUDA_INDICADORES = {
  titulo: "Indicadores clave",
  introduccion: "KPIs principales con progreso circular. Reflejan índice de lealtad, riesgo político, nivel de formalización laboral, concentración de poder y total de suscriptores. Los colores indican estado (verde = bien, amarillo = atención, rojo = alerta).",
  items: [
    { label: "Índice de Lealtad", descripcion: "Porcentaje de adherentes considerados leales. El círculo muestra el avance hacia la meta." },
    { label: "Riesgo Político", descripcion: "Indicador de riesgo; un valor alto o en aumento (ej. +12%) requiere revisión." },
    { label: "Formalización Laboral", descripcion: "Porcentaje de trabajadores en proceso de formalización; el subtítulo indica cantidad en trámite." },
    { label: "Concentración de Poder", descripcion: "Alerta cuando pocos líderes concentran mucho poder (>40%); conviene diversificar." },
    { label: "Total Suscriptores", descripcion: "Cantidad total de suscriptores y tendencia (ej. +890, 7% de crecimiento)." },
  ],
};
const AYUDA_MAPA_INTERACTIVO = {
  titulo: "Mapa interactivo · Capas, estado y detalle por seccional",
  introduccion: "Mapa de Asunción donde cada punto es una seccional. Podés activar o desactivar capas (Leales, Riesgo, etc.), filtrar por estado (OK, Atención, Crítico) y hacer clic en cualquier punto para ver el detalle y los KPIs de esa seccional. El número dentro del círculo indica la cantidad de validados.",
  items: [
    { label: "Capas (Leales, Riesgo, Capacitación, Dirigentes, Verificación)", descripcion: "Cada chip activa o desactiva una capa de información sobre el mapa. Los colores identifican el tipo de dato. Clic en el chip para alternar." },
    { label: "Estado (Todos, OK, Atención, Crítico)", descripcion: "Filtra qué seccionales se muestran. OK = en rango esperado (verde), Atención = revisar (amarillo), Crítico = prioridad (rojo). Clic en un estado para ver solo esas seccionales." },
    { label: "Puntos con número", descripcion: "Cada círculo es una seccional; el número es la cantidad de validados. El color del círculo indica el estado (semáforo). Pasá el mouse para ver un resumen; clic para abrir el panel de detalle." },
    { label: "Panel de detalle", descripcion: "Al hacer clic en una seccional se abre a la derecha un panel con KPIs locales, evolución y alertas. Cerrá tocando fuera del panel o el botón de cerrar." },
  ],
};
const AYUDA_MAPA_MULTICAPA = {
  titulo: "Mapa multicapa · Calor y seccionales",
  introduccion: "Este mapa combina una capa de calor (intensidad de actividad o concentración por zona) con los puntos de seccionales. Sirve para ver dónde se concentra la acción y cómo se relaciona con las seccionales.",
  items: [
    { label: "Control de capas", descripcion: "Usá el control (arriba a la derecha del mapa) para activar o desactivar la capa de calor y la capa de puntos seccionales. Podés ver ambas a la vez o solo una." },
    { label: "Capa de calor", descripcion: "Muestra zonas con más intensidad (ej. más validados o más actividad). Los colores más cálidos (rojo/naranja) indican mayor valor." },
    { label: "Puntos seccionales", descripcion: "Cada punto es una seccional. La leyenda indica los rangos (R1 Estratégico, R2 Operativo, R3 Base) y sus colores." },
  ],
};
const AYUDA_MAPA_ESTADO = {
  titulo: "Mapa por estado · Suscriptores y dirigentes",
  introduccion: "Mapa que muestra personas (suscriptores, dirigentes) según su estado: leales, no verificados, riesgo, capacitación, dirigentes. Activá las capas que quieras y hacé clic en un punto para ver el detalle de esa persona.",
  items: [
    { label: "Capas (Leales, No verificados, Riesgo, Capacitación, Dirigentes)", descripcion: "Cada capa muestra un tipo de actor territorial. Activá o desactivá según lo que quieras analizar. Podés superponer varias capas." },
    { label: "Clic en un punto", descripcion: "Al hacer clic en un marcador se abre la ficha con la información completa del suscriptor o dirigente (nombre, estado, seccional, etc.)." },
  ],
};
const AYUDA_EVOLUCION = {
  titulo: "Evolución temporal",
  introduccion: "Gráfico de líneas que muestra cómo evolucionan en el tiempo las métricas Validados, Leales y Verificados. Podés elegir el período (30, 60 o 90 días) y hacer clic en la leyenda para mostrar u ocultar cada línea.",
  items: [
    { label: "Botones 30 / 60 / 90 días", descripcion: "Seleccioná el rango de tiempo que querés ver. El gráfico se actualiza con los datos de ese período." },
    { label: "Leyenda (Validados, Leales, Verificados)", descripcion: "Clic en un nombre de la leyenda para ocultar o mostrar esa línea en el gráfico. Útil para comparar solo dos series." },
    { label: "Clic en el gráfico", descripcion: "Un clic filtra el dashboard por esa fecha o valor; doble clic restablece el filtro." },
  ],
};
const AYUDA_EMBUDO = {
  titulo: "Embudo de Idoneidad",
  introduccion: "Muestra las etapas del proceso de idoneidad: cuántos están certificados, en trámite o sin proceso. La meta (ej. 22%) indica el porcentaje objetivo de certificados. El botón «Derivar Capacitación» permite enviar personas a capacitación.",
  items: [
    { label: "Barras por etapa", descripcion: "Cada barra es una etapa (Certificados, En trámite, Sin proceso). El ancho y el número indican la cantidad. Los colores (verde, amarillo, rojo) indican avance o urgencia." },
    { label: "Meta", descripcion: "Porcentaje objetivo de personas certificadas respecto del total. Comparalo con el porcentaje actual de certificados." },
    { label: "Derivar Capacitación", descripcion: "Botón de acción para derivar personas a procesos de capacitación (según flujo definido en el programa)." },
  ],
};
const AYUDA_LEALES = {
  titulo: "Leales por Líderes",
  introduccion: "Gráfico circular que muestra cómo se distribuyen los «leales» entre los distintos líderes o concejales. Sirve para ver quién concentra más adhesión y para filtrar el resto del dashboard por ese líder.",
  items: [
    { label: "Clic en un segmento", descripcion: "Al hacer clic en una porción del gráfico, el resto del dashboard (mapas, tablas) se filtra por ese líder. Útil para ver el territorio o las seccionales asociadas." },
    { label: "Doble clic", descripcion: "Restablece el filtro y volvé a ver todos los datos." },
  ],
};
const AYUDA_SEGUIDORES = {
  titulo: "Seguidores por Concejales",
  introduccion: "Barras que muestran la cantidad de seguidores por concejal. Permite comparar influencia y, al hacer clic en una barra, filtrar el dashboard por ese concejal.",
  items: [
    { label: "Clic en una barra", descripcion: "Filtra el dashboard por ese concejal; los mapas y otras vistas se actualizan según la selección." },
    { label: "Doble clic", descripcion: "Quita el filtro y muestra de nuevo todos los concejales." },
  ],
};
const AYUDA_TABLA_SPARK = {
  titulo: "Seccionales · Tendencia (sparklines)",
  introduccion: "Tabla de seccionales con una minigráfico de tendencia (sparkline) por fila. Permite ver la evolución de cada seccional y, al hacer clic en una fila, filtrar el dashboard por esa seccional.",
  items: [
    { label: "Sparkline", descripcion: "Pequeño gráfico de línea que muestra la tendencia de esa seccional en el tiempo (ej. validados o actividad)." },
    { label: "Clic en una fila", descripcion: "Selecciona esa seccional y actualiza el mapa y otros gráficos según el filtro." },
    { label: "Doble clic", descripcion: "Restablece el filtro." },
  ],
};
const AYUDA_CONTROL_SECC = {
  titulo: "Control de Seccionales",
  introduccion: "Tabla con todas las seccionales: número, nombre, titular, rango, validados y estado. Podés buscar, ordenar por columna y filtrar por rango o por estado (OK, Atención, Crítico). Al hacer clic en una fila, se sincroniza con el mapa y el panel de detalle.",
  items: [
    { label: "Buscar", descripcion: "Escribí en el cuadro de búsqueda para filtrar por nombre, titular, barrio o número de seccional." },
    { label: "Estado (Todos, OK, Atención, Crítico)", descripcion: "Clic en un chip para mostrar solo las seccionales de ese estado. Coincide con los colores del mapa." },
    { label: "Rango (R1, R2, R3)", descripcion: "Filtra por rango estratégico de la seccional." },
    { label: "Clic en una fila", descripcion: "Resalta la seccional en el mapa (si está visible) y permite ver su detalle; el resto del dashboard puede reaccionar a esta selección." },
  ],
};

const PUNTOS_COBERTURA_INICIAL = [
  { id: "p1", zona: "Punto 1 - Centro", estado: "Cubierta", responsable: "Asignado" },
  { id: "p2", zona: "Punto 2 - Sajonia", estado: "Cubierta", responsable: "Asignado" },
  { id: "p3", zona: "Punto 3 - Obrero", estado: "Sin responsable", responsable: "—" },
  { id: "p4", zona: "Punto 4 - Trinidad", estado: "Cubierta", responsable: "Asignado" },
  { id: "p5", zona: "Punto 5 - Zeballos", estado: "Cubierta", responsable: "Asignado" },
  { id: "p6", zona: "Punto 6 - Encarnación", estado: "Sin responsable", responsable: "—" },
] as const;

function CoberturaTerritorioPuntos() {
  const [asignados, setAsignados] = useState<Set<string>>(new Set());
  const puntos = PUNTOS_COBERTURA_INICIAL.map((m) => {
    const asignado = asignados.has(m.id);
    const estado = asignado ? "Cubierta" : m.estado;
    const responsable = asignado ? "Asignado" : m.responsable;
    return { ...m, estado, responsable, asignado };
  });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {puntos.map((m) => (
        <div
          key={m.id}
          className={`rounded-xl border-2 p-3 text-sm ${
            m.estado === "Cubierta" ? "border-green-200 bg-green-50/80" : "border-amber-200 bg-amber-50/80"
          }`}
        >
          <p className="font-semibold text-gray-800">{m.zona}</p>
          <p className={m.estado === "Cubierta" ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>{m.estado}</p>
          <p className="text-dash-muted text-xs mt-0.5">Responsable: {m.responsable}</p>
          {m.estado !== "Cubierta" && (
            <button
              type="button"
              onClick={() => setAsignados((prev) => new Set(prev).add(m.id))}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-yapo-blue text-white hover:bg-blue-800 transition-colors"
            >
              Asignar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DashboardMaestroPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get("filter") ?? undefined;
  const filterLabel = filter ? FILTER_LABELS[filter] ?? filter : null;
  const { chartFilter, setChartFilter, resetChartFilter, mapViewState, setMapViewState } = useDashboardCharts();
  const selectedRanking = chartFilter?.type === "ranking" ? chartFilter.value : null;
  const selectedSeccionalNumero =
    chartFilter?.type === "seccional" ? parseInt(chartFilter.value, 10) : null;
  const urlSyncedRef = useRef(false);

  const [soloRiesgo, setSoloRiesgo] = useState(false);
  const [soloDatosPorcentajes, setSoloDatosPorcentajes] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<"comparar" | null>(null);
  const [compareConcejal1, setCompareConcejal1] = useState("");
  const [compareConcejal2, setCompareConcejal2] = useState("");
  const alertasSectionRef = useRef<HTMLDivElement>(null);
  const mapaSectionRef = useRef<HTMLDivElement>(null);
  const scrollToAlertas = useCallback(() => alertasSectionRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  const scrollToMapa = useCallback(() => mapaSectionRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  useEffect(() => {
    const q = searchParams.get("filter");
    if (q && !urlSyncedRef.current) {
      const next = filterFromQuery(q);
      if (next) setChartFilter(next);
    }
    urlSyncedRef.current = true;
  }, [searchParams, setChartFilter]);

  useEffect(() => {
    if (!urlSyncedRef.current) return;
    const want = chartFilter ? `?filter=${encodeURIComponent(chartFilter.value)}` : "";
    const path = `/dashboard/maestro${want}`;
    if (typeof window !== "undefined" && `${window.location.pathname}${window.location.search}` !== path) {
      router.replace(path, { scroll: false });
    }
  }, [chartFilter, router]);

  const { data, error } = useSWR("/api/dashboard/maestro", fetcher, {
    refreshInterval: 10000,
  });
  const { data: alertasData } = useSWR<{ alertas: { nivel: string }[] }>("/api/dashboard/alertas", fetcher, { refreshInterval: 30000 });

  if (error) {
    return (
      <div className="min-h-screen bg-yapo-gray flex items-center justify-center">
        <p className="text-red-600">Error al cargar datos.</p>
      </div>
    );
  }

  const totalVotantes = data?.totalVotantes ?? 35720;
  const seccionales = data?.seccionales ?? 45;
  const concejalesActivos = data?.concejalesActivos ?? 15;
  const eventosHoy = data?.eventosHoy ?? 0;
  const lealesPorLideres = data?.lealesPorLideres ?? [
    { nombre: "Sosa", valor: 32, color: "#DC2626" },
    { nombre: "Bello", valor: 21, color: "#1E3A8A" },
    { nombre: "Fernández", valor: 15, color: "#059669" },
    { nombre: "Lopez", valor: 14, color: "#6366F1" },
    { nombre: "Otros", valor: 18, color: "#94A3B8" },
  ];
  const seguidoresPorConcejales = data?.seguidoresPorConcejales ?? [
    { nombre: "Sosa", seguidores: 4200, fill: "#DC2626" },
    { nombre: "Lopez", seguidores: 3100, fill: "#1E3A8A" },
    { nombre: "Ruiz", seguidores: 2800, fill: "#3B82F6" },
    { nombre: "Diaz", seguidores: 2500, fill: "#6366F1" },
    { nombre: "Bello", seguidores: 2300, fill: "#059669" },
  ];
  const heatmapPoints: HeatmapPoint[] =
    data?.heatmapPoints?.length ? (data.heatmapPoints as HeatmapPoint[]) : buildDefaultHeatmap();
  const listadoSeccionales: SeccionalRow[] = data?.listadoSeccionales ?? [];
  const eventosAuditoria: EventoAuditoria[] = data?.eventosAuditoria ?? [];
  const capasMapa: Record<string, PuntoMapa[]> = data?.capasMapa ?? getAllPuntosMapaCapas();

  const puntosCalor = buildPuntosCalor(heatmapPoints);
  const seccionalesMapa = buildSeccionalesMapa(listadoSeccionales);
  const seccionalesParaMapaAvanzado = buildSeccionalesParaMapaAvanzado(listadoSeccionales);

  const countRiesgo = (listadoSeccionales ?? []).filter((s) => s.estado === "red" || s.estado === "yellow").length;
  const countRed = (listadoSeccionales ?? []).filter((s) => s.estado === "red").length;
  const countYellow = (listadoSeccionales ?? []).filter((s) => s.estado === "yellow").length;
  const countGreen = (listadoSeccionales ?? []).filter((s) => s.estado === "green").length;
  const alertasCriticas = (alertasData?.alertas ?? []).filter((a) => a.nivel === "critico").length;
  const alertasAtencion = (alertasData?.alertas ?? []).filter((a) => a.nivel === "warning").length;
  const listadoFiltrado = soloRiesgo
    ? (listadoSeccionales ?? []).filter((s) => s.estado === "red" || s.estado === "yellow")
    : (listadoSeccionales ?? []);
  const seccionalesParaMapaAvanzadoFiltrado = soloRiesgo
    ? seccionalesParaMapaAvanzado.filter((s) => s.estado === "red" || s.estado === "yellow")
    : seccionalesParaMapaAvanzado;

  const donutLealesData = buildDonutLealesData(data?.lealesPorLideres ?? []);
  const tablaSeccionalesConSpark = buildTablaSeccionalesConSpark(listadoFiltrado, 12);

  /** Seccionales dentro de la vista actual del mapa (el mapa controla esta zona). */
  const seccionalesEnVista = useMemo(() => {
    if (!mapViewState) return null;
    const [[south, west], [north, east]] = mapViewState.bounds;
    return seccionalesParaMapaAvanzadoFiltrado.filter(
      (s) => s.lat >= south && s.lat <= north && s.lng >= west && s.lng <= east
    ).length;
  }, [mapViewState, seccionalesParaMapaAvanzadoFiltrado]);

  /** Orden por impacto para estado (Crítico → Atención → OK) */
  const estadoSortValue = (estado: string | undefined): number => {
    if (estado === "red") return 0;
    if (estado === "yellow") return 1;
    return 2;
  };

  const tablaSparkColumns = [
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (row: { estado?: string; estadoLabel?: string }) => {
        const e = row.estado ?? "green";
        const label = row.estadoLabel ?? (e === "green" ? "OK" : e === "yellow" ? "Atención" : "Crítico");
        const chipClass =
          e === "green"
            ? "bg-semantic-success-bg text-semantic-success border-semantic-success-border"
            : e === "yellow"
              ? "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border"
              : "bg-semantic-danger-bg text-semantic-danger border-semantic-danger-border";
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${chipClass}`}>
            {label}
          </span>
        );
      },
    },
    { key: "nombre", label: "Seccional", sortable: true },
    { key: "barrio", label: "Barrio", sortable: true },
    {
      key: "cantidadValidados",
      label: "Validados",
      sortable: true,
      numeric: true,
      render: (row: { cantidadValidados?: number }) =>
        (row.cantidadValidados ?? 0).toLocaleString("es-PY"),
    },
  ];

  const pageHeroActions = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterButton
        label="Solo datos y porcentajes"
        active={soloDatosPorcentajes}
        onToggle={setSoloDatosPorcentajes}
        icon={BarChart2}
        aria-label={soloDatosPorcentajes ? "Mostrar mapas" : "Ocultar mapas y mostrar solo datos"}
      />
      <FilterButton
        label="Ver solo seccionales en riesgo"
        active={soloRiesgo}
        onToggle={setSoloRiesgo}
        count={countRiesgo}
        icon={AlertTriangle}
        aria-label={soloRiesgo ? "Quitar filtro de riesgo" : "Ver solo seccionales en riesgo"}
      />
      <ActionButton
        label="Comparar concejales"
        icon={GitCompare}
        variant="secondary"
        onClick={() => setModalAbierto("comparar")}
        aria-label="Abrir comparador de concejales"
      />
      <ActionButton
        label="Activar alerta temprana"
        onClick={async () => {
          await new Promise((r) => setTimeout(r, 600));
        }}
        aria-label="Activar alerta temprana"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {filterLabel && (
        <div className="rounded-[14px] border border-dash-blue/25 bg-dash-blue/8 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium text-dash-blue">
            Vista detallada: <span className="font-semibold">{filterLabel}</span> — mapas, rankings y tablas filtrados por este indicador.
          </p>
          <Link
            href="/dashboard/maestro"
            className="text-sm font-medium text-dash-blue hover:underline"
          >
            Quitar filtro
          </Link>
        </div>
      )}
      {chartFilter && (
        <div className="rounded-[14px] border border-dash-yellow/30 bg-dash-yellow/10 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium text-dash-blue">
            Filtro desde gráfico: <span className="font-semibold">{chartFilter.label ?? chartFilter.value}</span> — el resto del dashboard reacciona. Doble clic en cualquier gráfico para restablecer.
          </p>
          <button
            type="button"
            onClick={resetChartFilter}
            className="text-sm font-medium text-dash-blue hover:underline"
          >
            Restablecer vista
          </button>
        </div>
      )}
      <PageHero
        title={PAGES.maestro.title}
        subtitle={PAGES.maestro.subtitle}
        trust={PAGES.maestro.trust}
        forWho={PAGES.maestro.forWho}
        scope={
          data?.scope
            ? `${data.scope.nombreCiudad} · ${data.scope.totalSeccionales} seccionales`
            : seccionales
              ? `${seccionales} seccionales`
              : undefined
        }
        lastUpdated={
          data?.lastUpdated
            ? new Date(data.lastUpdated).toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })
            : undefined
        }
        actions={pageHeroActions}
      />

      {/* Estado del territorio: primer vistazo + CTA principal */}
      <div className="rounded-2xl border-2 border-yapo-blue/20 bg-gradient-to-r from-slate-50 to-blue-50/50 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Estado del territorio</span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden />
              <strong className="text-red-700">{countRed}</strong> crítico{countRed !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-amber-500" aria-hidden />
              <strong className="text-amber-800">{countYellow}</strong> atención
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden />
              <strong className="text-green-800">{countGreen}</strong> OK
            </span>
          </div>
          {(countRed > 0 || countYellow > 0) && (
            <button
              type="button"
              onClick={() => { setSoloRiesgo(true); scrollToMapa(); }}
              className="btn-yapo btn-yapo-primary min-h-[44px] px-5 text-base"
            >
              Ver {countRed + countYellow} en riesgo en el mapa
            </button>
          )}
        </div>
      </div>

      {/* Banner alertas: nivel visual inmediato; clic lleva al panel y conecta con mapa/KPIs */}
      {(alertasCriticas > 0 || alertasAtencion > 0) && (
        <button
          type="button"
          onClick={scrollToAlertas}
          className={`w-full rounded-xl border-2 px-4 py-3 flex items-center justify-between gap-3 transition-colors text-left ${
            alertasCriticas > 0
              ? "bg-semantic-danger-bg border-semantic-danger-border hover:bg-semantic-danger-bg/90 hover:border-semantic-danger shadow-sm"
              : "bg-semantic-warning-bg border-semantic-warning-border hover:bg-semantic-warning-bg/90 hover:border-semantic-warning"
          }`}
        >
          <span className={`flex items-center gap-2 text-sm font-bold ${alertasCriticas > 0 ? "text-semantic-danger" : "text-semantic-warning"}`}>
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
            {alertasCriticas > 0 && <span>{alertasCriticas} alerta{alertasCriticas !== 1 ? "s" : ""} crítica{alertasCriticas !== 1 ? "s" : ""}</span>}
            {alertasCriticas > 0 && alertasAtencion > 0 && " · "}
            {alertasAtencion > 0 && <span>{alertasAtencion} en atención</span>}
          </span>
          <span className={`text-sm font-semibold shrink-0 ${alertasCriticas > 0 ? "text-semantic-danger" : "text-semantic-warning"}`}>Ver alertas →</span>
        </button>
      )}

      {/* Panel de alertas (elevado: segundo bloque después del estado) */}
      <div id="alertas" ref={alertasSectionRef}>
        <PanelAlertas apiUrl="/api/dashboard/alertas" refreshInterval={30000} maxVisibles={15} />
      </div>

      {/* Modales: Comparar concejales / Simular escenario */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40"
          onClick={() => setModalAbierto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Comparar concejales"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalAbierto(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-dash-muted hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-dash-blue pr-10">Comparar concejales</h3>
            <p className="text-sm text-dash-muted mt-2 mb-4">
              Elegí dos concejales para comparar métricas (leales, seccionales, evolución).
            </p>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Primer concejal</label>
              <select
                value={compareConcejal1}
                onChange={(e) => setCompareConcejal1(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option value="">Elegir concejal…</option>
                {seguidoresPorConcejales.map((c: { nombre: string }) => (
                  <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
              <label className="block text-sm font-medium text-gray-700">Segundo concejal</label>
              <select
                value={compareConcejal2}
                onChange={(e) => setCompareConcejal2(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option value="">Elegir concejal…</option>
                {seguidoresPorConcejales.map((c: { nombre: string }) => (
                  <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAbierto(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (compareConcejal1 && compareConcejal2) setModalAbierto(null);
                }}
                disabled={!compareConcejal1 || !compareConcejal2}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comparar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs estratégicos: dinámicos, accionables, contextuales. Clic filtra el dashboard. */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <TrendingUp className="w-8 h-8 text-semantic-control" />
            <h2 className="text-lg font-semibold text-semantic-control">KPIs estratégicos</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-semantic-success bg-semantic-success-bg px-2 py-1 rounded-full border border-semantic-success-border">
              <span className="kpi-live-dot h-2 w-2 rounded-full bg-semantic-success" aria-hidden />
              En vivo
            </span>
          </div>
          <AyudaHerramienta {...AYUDA_INDICADORES} />
        </div>
        <p className="text-sm text-semantic-neutral mb-5">
          Cada KPI filtra el resto del dashboard al hacer clic. Valor, tendencia y color por estado (éxito / atención / riesgo).
        </p>

        {/* Primarios: 4 KPIs que impulsan la vista */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-semantic-neutral mb-3">Primarios</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIActionCard
              primary
              value={countRed + countYellow}
              label="Seccionales en riesgo"
              trend={{ direction: countRed > 0 ? "up" : "down", value: "vs. semana anterior", positiveIsGood: false }}
              state={countRed + countYellow > 0 ? (countRed > 0 ? "danger" : "warning") : "success"}
              onAction={() => { setSoloRiesgo(true); scrollToMapa(); }}
              actionLabel="Ver en mapa"
              isActive={soloRiesgo}
            />
            <KPIActionCard
              primary
              value={78}
              unit="%"
              label="Índice de Lealtad"
              trend={{ direction: "up", value: "+2 p.p. vs. mes anterior", positiveIsGood: true }}
              state="success"
              meta="Meta 80%"
              progress={78}
              onAction={() => { setChartFilter(null); document.getElementById("leales-lideres")?.scrollIntoView({ behavior: "smooth" }); }}
              actionLabel="Ver por líder"
              isActive={chartFilter?.type === "ranking"}
            />
            <KPIActionCard
              primary
              value={63}
              unit="%"
              label="Formalización Laboral"
              trend={{ direction: "up", value: "1.240 en proceso", positiveIsGood: true }}
              state="warning"
              progress={63}
              onAction={() => { window.location.href = "/dashboard/capacitacion"; }}
              actionLabel="Ir a capacitación"
            />
            <KPIActionCard
              primary
              value={totalVotantes}
              label="Total Suscriptores"
              trend={{ direction: "up", value: "+890 (7%) vs. mes anterior", positiveIsGood: true }}
              state="neutral"
              onAction={() => document.getElementById("control-seccionales")?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver tabla"
            />
          </div>
        </div>

        {/* Secundarios: contexto y métricas de apoyo */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-semantic-neutral mb-3">Secundarios</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KPIActionCard
              value={totalVotantes}
              label="Total votantes"
              trend={{ direction: "up", value: "+3% vs. mes ant.", positiveIsGood: true }}
              state="neutral"
              onAction={() => mapaSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver mapa"
            />
            <KPIActionCard
              value={seccionales}
              label="Seccionales"
              state="control"
              onAction={() => mapaSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver mapa"
            />
            <KPIActionCard
              value={concejalesActivos}
              label="Concejales activos"
              state="neutral"
              onAction={() => document.getElementById("leales-lideres")?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver por líder"
            />
            <KPIActionCard
              value={eventosHoy}
              label="Eventos hoy"
              trend={{ direction: "neutral", value: "últimas 24 h" }}
              state="neutral"
              onAction={() => document.getElementById("auditoria")?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver auditoría"
            />
            <KPIActionCard
              value="2 líderes >40%"
              label="Concentración de Poder"
              state="danger"
              onAction={() => document.getElementById("leales-lideres")?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="Ver líderes"
            />
          </div>
        </div>
      </DashboardCard>

      {/* Indicador tiempo real y cobertura */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-dash-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
          Actualización automática cada 10 s
        </span>
        <span>
          Cobertura: <strong className="text-gray-700">{listadoSeccionales.length}</strong> seccionales con datos
        </span>
      </div>

      {/* Acciones prioritarias: qué hacer hoy con links directos */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">Acciones prioritarias</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Qué hacer hoy. Cada ítem lleva directo al mapa, tabla o módulo correspondiente.
        </p>
        <ul className="space-y-2">
          {countRed > 0 && (
            <li>
              <button
                type="button"
                onClick={() => { setSoloRiesgo(true); document.getElementById("control-seccionales")?.scrollIntoView({ behavior: "smooth" }); }}
                className="w-full flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2.5 text-sm text-left hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span><strong>{countRed}</strong> seccionales en riesgo</span>
                <span className="ml-auto text-red-600 font-medium shrink-0">Contactar por WhatsApp →</span>
              </button>
            </li>
          )}
          {countYellow > 0 && (
            <li>
              <button
                type="button"
                onClick={() => { setSoloRiesgo(true); scrollToMapa(); }}
                className="w-full flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-sm text-left hover:bg-amber-100 transition-colors"
              >
                <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                <span><strong>{countYellow}</strong> seccionales con atención recomendada</span>
                <span className="ml-auto text-amber-700 font-medium shrink-0">Ver en mapa →</span>
              </button>
            </li>
          )}
          <li>
            <Link
              href="/dashboard/capacitacion"
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-sm hover:bg-amber-100 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pendientes de dictamen (capacitación)</span>
              <span className="ml-auto text-amber-700 font-medium shrink-0">Ir a capacitación →</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => scrollToMapa()}
              className="w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-left hover:bg-gray-100 transition-colors"
            >
              <MapPin className="w-4 h-4 text-yapo-blue shrink-0" />
              <span>Mapa y tabla de seccionales: contacto del titular por zona</span>
              <span className="ml-auto text-yapo-blue font-medium shrink-0">Ver mapa →</span>
            </button>
          </li>
        </ul>
      </DashboardCard>

      {/* Dirigentes: datos y contacto a mano */}
      {(() => {
        const dirigentes = (capasMapa.dirigentes ?? []).map((p) => p.info).filter((i): i is InfoDirigente => i.tipo === "dirigente");
        if (dirigentes.length === 0) return null;
        return (
          <DashboardCard interactive={false} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-yapo-blue" />
              <h2 className="text-lg font-semibold text-yapo-blue">Dirigentes · Datos y contacto</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Responsables por seccional. Contacto directo por WhatsApp desde el dashboard.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-yapo-blue">Nombre</th>
                    <th className="text-left py-2 font-semibold text-yapo-blue">Cargo</th>
                    <th className="text-left py-2 font-semibold text-yapo-blue">Seccional</th>
                    <th className="text-left py-2 font-semibold text-yapo-blue">Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {dirigentes.map((d) => (
                    <tr key={d.id} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-800">{d.nombreCompleto}</td>
                      <td className="py-2 text-gray-600">{d.cargo}</td>
                      <td className="py-2 text-gray-600">{d.seccional}</td>
                      <td className="py-2">
                        {d.contacto ? (
                          <a
                            href={`https://wa.me/${d.contacto.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-dash-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        );
      })()}

      {/* Cobertura en territorio: puntos de verificación (terminología neutral Yapó) */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">Cobertura en territorio · Puntos de verificación</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Cada punto con responsable asignado, cada trabajador acompañado. Estado de cobertura por zona (simulado).
        </p>
        <CoberturaTerritorioPuntos />
      </DashboardCard>

      {!soloDatosPorcentajes && (
      <>
      {/* Mapa interactivo avanzado: capas, zoom por seccional, panel con KPIs y alertas */}
      <div ref={mapaSectionRef}>
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">
            Mapa interactivo · Capas, estado y detalle por seccional
          </h2>
          <AyudaHerramienta {...AYUDA_MAPA_INTERACTIVO} />
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Activá/desactivá capas (Leales, Riesgo, Capacitación, Dirigentes, Verificación). Para ver <strong>solo seccionales en riesgo o con alertas</strong>, usá el filtro Estado (Crítico / Atención) en la esquina del mapa o el botón «Ver solo seccionales en riesgo» arriba. Clic en una seccional abre el panel con KPIs y contacto; el mapa controla filtros y vista.
        </p>
        {seccionalesEnVista != null && (
          <p className="text-xs text-semantic-neutral mb-2 font-medium">
            En vista actual: <strong>{seccionalesEnVista}</strong> seccionales — mové el mapa para cambiar la zona; KPIs y tabla pueden filtrar por esta vista.
          </p>
        )}
        <MapaInteractivoAvanzado
          seccionales={seccionalesParaMapaAvanzadoFiltrado}
          capas={capasMapa}
          kpiFilter={filterLabel ?? filter ?? null}
          selectedRanking={selectedRanking}
          height={520}
          selectedNumero={selectedSeccionalNumero}
          onSeccionalSelect={(numero) => {
            if (numero == null) {
              resetChartFilter();
              return;
            }
            const nombre =
              listadoFiltrado.find((s) => s.numero === numero)?.nombre ?? `Seccional ${numero}`;
            const filter = { type: "seccional" as const, value: String(numero), label: nombre };
            setChartFilter(filter);
          }}
          onMapViewChange={(bounds, zoom) => setMapViewState({ bounds, zoom })}
        />
      </DashboardCard>
      </div>

      {/* Mapa multicapa (calor + seccionales) */}
      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Mapa multicapa · Calor y seccionales
            </h2>
            <AyudaHerramienta {...AYUDA_MAPA_MULTICAPA} />
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Usá el control de capas (arriba a la derecha) para activar/desactivar Calor por seccionales y Puntos seccionales.
          </p>
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Leyenda: Intensidad = validados por zona. Más oscuro = mayor concentración.
          </p>
          {puntosCalor.length > 0 ? (
            <MapaMulticapa
              puntosCalor={puntosCalor}
              seccionales={seccionalesMapa}
              legend={MAP_LEGEND}
            />
          ) : (
            <div className="h-[420px] rounded-xl bg-gray-100 flex items-center justify-center text-dash-muted">
              Cargando mapa…
            </div>
          )}
      </DashboardCard>

      {/* Mapa por estado: leales, no verificados, riesgo, capacitación, dirigentes */}
      <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">
              Mapa por estado · Suscriptores y dirigentes
            </h2>
            <AyudaHerramienta {...AYUDA_MAPA_ESTADO} />
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Activá las capas (Leales, No verificados, Riesgo, Capacitación, Dirigentes) y hacé clic en cada punto para ver la información completa del suscriptor o dirigente.
          </p>
          <MapaCapasSuscriptores capas={capasMapa} />
      </DashboardCard>
      </>
      )}

      {/* Evolución temporal: 30 / 60 / 90 días, leyendas clickeables, colores neón */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">Evolución temporal</h2>
          <AyudaHerramienta {...AYUDA_EVOLUCION} />
        </div>
        <LineChartDynamic
          title=""
          chartId="evolucion-maestro"
          height={320}
          dataKeys={[
            { key: "validados", color: "#00B8D4", name: "Validados" },
            { key: "leales", color: "#00E676", name: "Leales" },
            { key: "verificados", color: "#7C4DFF", name: "Verificados" },
          ]}
        />
      </DashboardCard>

      {/* Embudo de Idoneidad (calor) */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-yapo-blue">Embudo de Idoneidad</h2>
          <AyudaHerramienta {...AYUDA_EMBUDO} />
        </div>
        <EmbudoIdoneidad metaPorcentaje={22} height={200} hideTitle />
      </DashboardCard>

      {/* Gráficos dinámicos: donut distribución, barra ranking — clic filtra dashboard, doble clic reset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="leales-lideres">
        <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Leales por Líderes</h2>
            <AyudaHerramienta {...AYUDA_LEALES} />
          </div>
          <DonutChartStates
            data={donutLealesData}
            title=""
            chartId="leales-lideres"
            filterType="ranking"
            height={280}
          />
        </DashboardCard>

        <DashboardCard interactive={false} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-yapo-blue" />
            <h2 className="text-lg font-semibold text-yapo-blue">Seguidores por Concejales</h2>
            <AyudaHerramienta {...AYUDA_SEGUIDORES} />
          </div>
          <BarChartRanking
            data={seguidoresPorConcejales}
            dataKey="nombre"
            barKey="seguidores"
            nameKey="nombre"
            colorKey="fill"
            chartId="seguidores-concejales"
            filterType="ranking"
            height={280}
          />
        </DashboardCard>
      </div>

      {/* Tabla con sparklines: clic fila = filtrar, doble clic = reset */}
      <DashboardCard interactive={false} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Table2 className="w-8 h-8 text-yapo-blue" />
          <h2 className="text-lg font-semibold text-yapo-blue">Seccionales · Tendencia (sparklines)</h2>
          <AyudaHerramienta {...AYUDA_TABLA_SPARK} />
        </div>
        <TableWithSparklines
          data={tablaSeccionalesConSpark}
          columns={tablaSparkColumns}
          sparklineKey="sparkline"
          filterKey="numero"
          filterLabelKey="nombre"
          chartId="tabla-seccionales"
          filterType="seccional"
          searchKeys={["nombre", "barrio"]}
          searchPlaceholder="Buscar por seccional o barrio…"
          defaultSortKey="estado"
          defaultSortDir="desc"
          getSortValue={(row, key) => {
            if (key === "estado") return estadoSortValue((row as { estado?: string }).estado);
            if (key === "cantidadValidados") return (row as { cantidadValidados?: number }).cantidadValidados ?? 0;
            return String((row as Record<string, unknown>)[key as string] ?? "");
          }}
          renderRowActions={(row) => {
            const r = row as { numero?: number; nombre?: string; contacto?: string | null };
            return (
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChartFilter({ type: "seccional", value: String(r.numero ?? ""), label: r.nombre ?? "" });
                    scrollToMapa();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-semantic-control/10 text-semantic-control border border-semantic-control/30 hover:bg-semantic-control/20"
                  title="Ver en mapa"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
                {r.contacto && (
                  <a
                    href={`https://wa.me/${String(r.contacto).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          }}
        />
      </DashboardCard>

      <div id="control-seccionales">
        <ControlSeccionales seccionales={listadoFiltrado} ayuda={AYUDA_CONTROL_SECC} scrollToMap={scrollToMapa} />
      </div>

      {/* Oferta de valor (colapsable, no compite con métricas) */}
      <details className="group rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
        <summary className="list-none p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
          <h2 className="text-lg font-semibold text-yapo-blue inline-flex items-center gap-2">
            <span className="transition-transform group-open:rotate-90">▶</span>
            Qué ofrece esta herramienta
          </h2>
        </summary>
        <div className="px-4 pb-4 pt-0">
          <ul className="space-y-2">
            {OFERTA_VALOR.map((texto, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 font-bold mt-0.5" aria-hidden>✓</span>
                <span>{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <div id="auditoria">
        <AuditoriaTimeline
          eventos={eventosAuditoria}
          refreshInterval={15000}
          apiUrl="/api/dashboard/maestro"
        />
      </div>
    </div>
  );
}
