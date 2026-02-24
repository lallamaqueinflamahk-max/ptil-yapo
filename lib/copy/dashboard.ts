/**
 * Copy y configuración del producto premium.
 * Territorio Command: SaaS para partidos políticos, gobiernos locales,
 * consultoras y organizaciones territoriales.
 * Cada pantalla justifica su existencia con valor estratégico y profesional.
 */

export const PRODUCT = {
  name: "Territorio Command",
  shortName: "Command",
  tagline: "Inteligencia territorial para decisiones estratégicas",
  byline: "Confiable · Estratégico · Profesional · Escalable",
  /** Una línea para venta: a quién va dirigido */
  audience:
    "Partidos políticos, gobiernos locales, consultoras y organizaciones territoriales",
} as const;

export const NAV = [
  {
    href: "/dashboard",
    label: "Resumen ejecutivo",
    shortLabel: "Resumen",
    icon: "LayoutDashboard",
    justification: "Visión consolidada y KPIs para la toma de decisiones.",
  },
  {
    href: "/dashboard/maestro",
    label: "Estrategia territorial",
    shortLabel: "Territorio",
    icon: "MapPin",
    justification: "Mapas, riesgo político, seccionales y auditoría para dirección y gobiernos.",
  },
  {
    href: "/dashboard/graficos",
    label: "Gráficos",
    shortLabel: "Gráficos",
    icon: "BarChart3",
    justification: "Gráficos de evolución, rankings y embudo de idoneidad.",
  },
  {
    href: "/dashboard/tabla-operativa",
    label: "Tabla operativa",
    shortLabel: "Tabla",
    icon: "Table2",
    justification: "Tabla operativa con filtros y mapa.",
  },
  {
    href: "/dashboard/mapa-control",
    label: "Mapa de control",
    shortLabel: "Mapa",
    icon: "MapPin",
    justification: "Mapa de seccionales y estado.",
  },
  {
    href: "/dashboard/pro",
    label: "Estructura y equipos",
    shortLabel: "Equipos",
    icon: "Users",
    justification: "Liderazgos, operadores y rendimiento para coordinación y seguimiento.",
  },
  {
    href: "/dashboard/operador",
    label: "Operación de campo",
    shortLabel: "Campo",
    icon: "UserCheck",
    justification: "Validaciones, dictámenes y alertas por zona para equipos en territorio.",
  },
  {
    href: "/dashboard/capacitacion",
    label: "Idoneidad y formación",
    shortLabel: "Capacitación",
    icon: "GraduationCap",
    justification: "Derivaciones y certificaciones para cumplimiento normativo y trazabilidad.",
  },
  {
    href: "/dashboard/admin",
    label: "Administración",
    shortLabel: "Admin",
    icon: "Settings",
    justification: "Configuración, usuarios y seguridad del producto.",
  },
] as const;

/** Por pantalla: título, subtítulo, línea de confianza y para quién justifica la pantalla */
export const PAGES = {
  home: {
    title: "Resumen ejecutivo",
    subtitle: "Visión consolidada para la toma de decisiones",
    trust: "Datos en tiempo real · Una sola fuente de verdad",
    forWho: "Dirección, coordinación y equipos que necesitan el estado global del territorio",
    sections: {
      kpis: "Indicadores clave",
      main: "Métricas principales",
      idoneidad: "Idoneidad y formación",
      quickAccess: "Módulos del producto",
    },
  },
  maestro: {
    title: "Estrategia territorial",
    subtitle: "Mapas, riesgo político, seccionales y auditoría para decisiones de alcance",
    trust: "Actualización automática · Conectado a mapas, KPIs y alertas",
    forWho: "Dirección política, gobiernos locales y equipos de estrategia territorial",
  },
  pro: {
    title: "Estructura y equipos",
    subtitle: "Liderazgos, operadores y rendimiento para coordinación y seguimiento",
    trust: "Rankings y métricas alineados a la estrategia",
    forWho: "Coordinadores, referentes territoriales y responsables de equipos",
  },
  operador: {
    title: "Operación de campo",
    subtitle: "Validaciones, dictámenes y alertas por zona para equipos en territorio",
    trust: "Geolocalización y alertas en tiempo real",
    forWho: "Operadores YAPÓ y equipos que validan y dictaminan en el terreno",
  },
  capacitacion: {
    title: "Idoneidad y formación",
    subtitle: "Derivaciones y certificaciones para cumplimiento normativo y trazabilidad",
    trust: "Trazabilidad SNPP / SINAFOCAL y estándares",
    forWho: "Responsables de formación y cumplimiento de idoneidad laboral",
  },
  admin: {
    title: "Administración",
    subtitle: "Configuración, usuarios y seguridad del producto",
    trust: "Control de acceso y auditoría",
    forWho: "Administradores y responsables de la instancia del producto",
  },
} as const;

/** Oferta de valor (sin nombres propios) para landing o dashboard */
export const OFERTA_VALOR = [
  "Organiza y moviliza votantes por zona y seccional — cada eslabón de la cadena sabe exactamente qué hacer y dónde.",
  "Comunicación directa con afiliados — el mensaje llega a toda la Capital sin intermediarios y en segundos.",
  "Panel de control en tiempo real — la dirección y el equipo ven el avance de todas las seccionales desde un solo lugar. Sin sorpresas, sin puntos ciegos.",
  "Cobertura en territorio — cada punto de verificación con responsable asignado, cada trabajador acompañado.",
] as const;

/** Textos para cards de acceso rápido (home): título, descripción y valor en una línea */
export const QUICK_ACCESS = {
  maestro: {
    title: "Estrategia territorial",
    description: "Mapas, seccionales, riesgo y auditoría",
    value: "Para dirección y gobiernos",
  },
  pro: {
    title: "Estructura y equipos",
    description: "Liderazgos, operadores y rendimiento",
    value: "Para coordinación",
  },
  operador: {
    title: "Operación de campo",
    description: "Validaciones y alertas por zona",
    value: "Para equipos en territorio",
  },
  capacitacion: {
    title: "Idoneidad y formación",
    description: "Derivaciones y certificaciones",
    value: "Para cumplimiento normativo",
  },
} as const;
