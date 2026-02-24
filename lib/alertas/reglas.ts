/**
 * Reglas KPI para alertas automáticas.
 * Umbrales configurables; en producción pueden venir de BD o env.
 */

import type { Alerta, Severidad, TipoAlerta } from "./types";
import { severidadANivel } from "./types";

const UMBRALES = {
  /** Eventos mínimos en el día para considerar actividad sana */
  EVENTOS_HOY_MIN: 5,
  /** Porcentaje máximo del total de seguidores que puede tener un solo concejal (concentración) */
  CONCENTRACION_CONCEJAL_PCT_MAX: 35,
  /** Porcentaje máximo del total de validados en una seccional (posible inflación) */
  SECCIONAL_PCT_MAX: 25,
  /** Seccionales con validados por debajo de este valor disparan baja actividad */
  VALIDADOS_MIN_POR_SECCIONAL: 200,
  /** Porcentaje de seccionales "inactivas" (bajo mínimo) que dispara alerta */
  SECCIONALES_INACTIVAS_PCT_ALERTA: 30,
} as const;

export interface ContextoKPIs {
  totalVotantes: number;
  eventosHoy: number;
  seccionales: number;
  listadoSeccionales: Array< { numero: number; nombre: string; cantidadValidados: number } >;
  seguidoresPorConcejales: Array< { nombre: string; seguidores: number } >;
  lealesPorLideres?: Array< { nombre: string; valor: number } >;
}

function id(): string {
  return `alt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ahora(): string {
  return new Date().toISOString();
}

/** Riesgo político: seccionales con muy pocos validados, o desbalance de lealtad. */
function evaluarRiesgoPolitico(ctx: ContextoKPIs): Alerta[] {
  const alertas: Alerta[] = [];
  const totalValidados = ctx.listadoSeccionales.reduce((s, sec) => s + sec.cantidadValidados, 0);
  const promedio = totalValidados / Math.max(ctx.listadoSeccionales.length, 1);

  const seccionalesDebajo = ctx.listadoSeccionales.filter(
    (s) => s.cantidadValidados < UMBRALES.VALIDADOS_MIN_POR_SECCIONAL
  );
  const pctInactivas = (seccionalesDebajo.length / Math.max(ctx.listadoSeccionales.length, 1)) * 100;

  if (pctInactivas >= UMBRALES.SECCIONALES_INACTIVAS_PCT_ALERTA) {
    const sev: Severidad = pctInactivas > 50 ? "alta" : "media";
    alertas.push({
      id: id(),
      tipo: "riesgo_politico",
      severidad: sev,
      nivel: severidadANivel(sev),
      titulo: "Alto porcentaje de seccionales con baja base",
      mensaje: `${seccionalesDebajo.length} de ${ctx.listadoSeccionales.length} seccionales tienen menos de ${UMBRALES.VALIDADOS_MIN_POR_SECCIONAL} validados (${pctInactivas.toFixed(0)}%).`,
      porQue: `El ${pctInactivas.toFixed(0)}% de las seccionales está por debajo del mínimo de validados (${UMBRALES.VALIDADOS_MIN_POR_SECCIONAL}), lo que indica debilidad territorial.`,
      consecuencia: "Aumenta el riesgo político y el desbalance de cobertura en el territorio.",
      accionSugerida: "Reforzar trabajo de base en seccionales con menor validación.",
      entidad: "Territorio",
      valorActual: pctInactivas,
      umbral: UMBRALES.SECCIONALES_INACTIVAS_PCT_ALERTA,
      accion: "Reforzar trabajo de base en seccionales con menor validación.",
      createdAt: ahora(),
    });
  }

  const peor = seccionalesDebajo.sort((a, b) => a.cantidadValidados - b.cantidadValidados)[0];
  if (peor && peor.cantidadValidados < promedio * 0.3) {
    alertas.push({
      id: id(),
      tipo: "riesgo_politico",
      severidad: "media",
      nivel: "warning",
      titulo: "Seccional con base muy por debajo del promedio",
      mensaje: `${peor.nombre} tiene ${peor.cantidadValidados} validados (promedio ${Math.round(promedio)}).`,
      porQue: `La cantidad de validados (${peor.cantidadValidados}) está por debajo del 30% del promedio territorial (${Math.round(promedio)}), lo que aumenta el riesgo político en esta zona.`,
      accionSugerida: "Revisar estrategia en esta seccional y coordinar con el titular.",
      entidad: peor.nombre,
      valorActual: peor.cantidadValidados,
      umbral: Math.round(promedio * 0.3),
      accion: "Revisar estrategia en esta seccional.",
      filterKey: { type: "seccional", value: String(peor.numero), label: peor.nombre },
      createdAt: ahora(),
    });
  }

  return alertas;
}

/** Baja actividad: pocos eventos hoy, pocas inscripciones recientes. */
function evaluarBajaActividad(ctx: ContextoKPIs): Alerta[] {
  const alertas: Alerta[] = [];

  if (ctx.eventosHoy < UMBRALES.EVENTOS_HOY_MIN) {
    const sev: Severidad = ctx.eventosHoy === 0 ? "alta" : "media";
    alertas.push({
      id: id(),
      tipo: "baja_actividad",
      severidad: sev,
      nivel: severidadANivel(sev),
      titulo: "Baja actividad en el sistema",
      mensaje: `Solo ${ctx.eventosHoy} eventos registrados hoy (mínimo recomendado: ${UMBRALES.EVENTOS_HOY_MIN}).`,
      porQue: `El número de eventos del día (${ctx.eventosHoy}) está por debajo del umbral de ${UMBRALES.EVENTOS_HOY_MIN}, lo que puede indicar subutilización del sistema por operadores.`,
      accionSugerida: "Verificar que operadores y equipos estén usando el sistema y recordar metas del día.",
      valorActual: ctx.eventosHoy,
      umbral: UMBRALES.EVENTOS_HOY_MIN,
      accion: "Verificar que operadores y equipos estén usando el sistema.",
      createdAt: ahora(),
    });
  }

  const conPocaActividad = ctx.listadoSeccionales.filter(
    (s) => s.cantidadValidados < UMBRALES.VALIDADOS_MIN_POR_SECCIONAL
  ).length;
  if (conPocaActividad >= ctx.listadoSeccionales.length * 0.4) {
    alertas.push({
      id: id(),
      tipo: "baja_actividad",
      severidad: "media",
      nivel: "warning",
      titulo: "Muchas seccionales con poca validación",
      mensaje: `${conPocaActividad} seccionales tienen menos de ${UMBRALES.VALIDADOS_MIN_POR_SECCIONAL} validados.`,
      porQue: `Más del 40% de las seccionales no alcanza el mínimo de validados, lo que debilita la base territorial.`,
      accionSugerida: "Impulsar campañas de registro en esas zonas y priorizar apoyo a titulares.",
      valorActual: conPocaActividad,
      accion: "Impulsar campañas de registro en esas zonas.",
      createdAt: ahora(),
    });
  }

  return alertas;
}

/** Concentración de poder: un concejal/líder concentra demasiado porcentaje. */
function evaluarConcentracionPoder(ctx: ContextoKPIs): Alerta[] {
  const alertas: Alerta[] = [];
  const totalSeguidores = ctx.seguidoresPorConcejales.reduce((s, c) => s + c.seguidores, 0);
  if (totalSeguidores === 0) return alertas;

  const ordenados = [...ctx.seguidoresPorConcejales].sort((a, b) => b.seguidores - a.seguidores);
  const primero = ordenados[0];
  const pct = (primero.seguidores / totalSeguidores) * 100;

  if (pct >= UMBRALES.CONCENTRACION_CONCEJAL_PCT_MAX) {
    const sev: Severidad = pct >= 50 ? "alta" : "media";
    alertas.push({
      id: id(),
      tipo: "concentracion_poder",
      severidad: sev,
      nivel: severidadANivel(sev),
      titulo: "Concentración de seguidores en un concejal",
      mensaje: `${primero.nombre} concentra el ${pct.toFixed(1)}% de los seguidores (${primero.seguidores.toLocaleString("es-PY")} de ${totalSeguidores.toLocaleString("es-PY")}).`,
      porQue: `Un solo concejal supera el ${UMBRALES.CONCENTRACION_CONCEJAL_PCT_MAX}% del total de seguidores, lo que indica desequilibrio en la distribución territorial.`,
      accionSugerida: "Evaluar equilibrio territorial y de liderazgos; considerar redistribución de tareas.",
      entidad: primero.nombre,
      valorActual: pct,
      umbral: UMBRALES.CONCENTRACION_CONCEJAL_PCT_MAX,
      accion: "Evaluar equilibrio territorial y de liderazgos.",
      filterKey: { type: "ranking", value: primero.nombre, label: primero.nombre },
      createdAt: ahora(),
    });
  }

  if (ctx.lealesPorLideres && ctx.lealesPorLideres.length > 0) {
    const totalLeales = ctx.lealesPorLideres.reduce((s, l) => s + l.valor, 0);
    const topLeal = ctx.lealesPorLideres.reduce((a, b) => (a.valor >= b.valor ? a : b));
    const pctLeal = totalLeales > 0 ? (topLeal.valor / totalLeales) * 100 : 0;
    if (pctLeal >= 40) {
      alertas.push({
        id: id(),
        tipo: "concentracion_poder",
        severidad: "media",
        nivel: "warning",
        titulo: "Concentración de lealtad en un líder",
        mensaje: `${topLeal.nombre} concentra ${topLeal.valor}% del indicador de leales.`,
        porQue: `Más del 40% del indicador de leales depende de un solo referente, lo que aumenta la dependencia.`,
        accionSugerida: "Monitorear dependencia de un solo referente y diversificar liderazgos.",
        entidad: topLeal.nombre,
        valorActual: pctLeal,
        umbral: 40,
        accion: "Monitorear dependencia de un solo referente.",
        filterKey: { type: "ranking", value: topLeal.nombre, label: topLeal.nombre },
        createdAt: ahora(),
      });
    }
  }

  return alertas;
}

/** Inflación de datos: una seccional u operador con crecimiento anómalo. */
function evaluarInflacionDatos(ctx: ContextoKPIs): Alerta[] {
  const alertas: Alerta[] = [];
  const totalValidados = ctx.listadoSeccionales.reduce((s, sec) => s + sec.cantidadValidados, 0);
  if (totalValidados === 0) return alertas;

  const porSeccional = ctx.listadoSeccionales
    .map((s) => ({ ...s, pct: (s.cantidadValidados / totalValidados) * 100 }))
    .filter((s) => s.pct >= UMBRALES.SECCIONAL_PCT_MAX)
    .sort((a, b) => b.pct - a.pct);

  if (porSeccional.length > 0) {
    const top = porSeccional[0];
    const sev: Severidad = top.pct >= 40 ? "alta" : "media";
    alertas.push({
      id: id(),
      tipo: "inflacion_datos",
      severidad: sev,
      nivel: severidadANivel(sev),
      titulo: "Posible inflación de datos en seccional",
      mensaje: `${top.nombre} concentra el ${top.pct.toFixed(1)}% de todos los validados (${top.cantidadValidados.toLocaleString("es-PY")}). Revisar si el volumen es consistente con el territorio.`,
      porQue: `Una sola seccional supera el ${UMBRALES.SECCIONAL_PCT_MAX}% del total de validados; puede haber inflación de datos o criterios de registro inconsistentes.`,
      accionSugerida: "Auditar inscripciones de esta seccional y validar en terreno.",
      entidad: top.nombre,
      valorActual: top.pct,
      umbral: UMBRALES.SECCIONAL_PCT_MAX,
      accion: "Auditar inscripciones de esta seccional y validar en terreno.",
      filterKey: { type: "seccional", value: String(top.numero), label: top.nombre },
      createdAt: ahora(),
    });
  }

  const promedio = totalValidados / Math.max(ctx.listadoSeccionales.length, 1);
  const outliers = ctx.listadoSeccionales.filter(
    (s) => s.cantidadValidados > promedio * 2.5
  );
  if (outliers.length >= 2) {
    alertas.push({
      id: id(),
      tipo: "inflacion_datos",
      severidad: "baja",
      nivel: "info",
      titulo: "Desbalance de validados entre seccionales",
      mensaje: `${outliers.length} seccionales superan 2.5 veces el promedio (${Math.round(promedio)}). Verificar consistencia de criterios de registro.`,
      porQue: "Varias seccionales concentran volumen muy por encima del promedio, lo que puede indicar diferencias de criterio o necesidad de auditoría.",
      accionSugerida: "Revisar criterios de validación por seccional y estandarizar procesos.",
      valorActual: outliers.length,
      accion: "Revisar criterios de validación por seccional.",
      createdAt: ahora(),
    });
  }

  return alertas;
}

/** Alertas por seccional: caída de actividad y aumento de riesgo (ej. "Seccional 15: caída 12%..."). */
function evaluarAlertasPorSeccional(ctx: ContextoKPIs): Alerta[] {
  const alertas: Alerta[] = [];
  const totalValidados = ctx.listadoSeccionales.reduce((s, sec) => s + sec.cantidadValidados, 0);
  const promedio = totalValidados / Math.max(ctx.listadoSeccionales.length, 1);

  const enRiesgo = ctx.listadoSeccionales
    .filter((s) => s.cantidadValidados < UMBRALES.VALIDADOS_MIN_POR_SECCIONAL)
    .sort((a, b) => a.cantidadValidados - b.cantidadValidados)
    .slice(0, 5);

  enRiesgo.forEach((s) => {
    const deficit = UMBRALES.VALIDADOS_MIN_POR_SECCIONAL - s.cantidadValidados;
    const pctDebajo = promedio > 0 ? ((promedio - s.cantidadValidados) / promedio) * 100 : 0;
    const variacionMock = Math.min(25, Math.round(pctDebajo * 0.4) || 12);
    alertas.push({
      id: id(),
      tipo: "riesgo_politico",
      severidad: pctDebajo > 50 ? "alta" : "media",
      nivel: pctDebajo > 50 ? "critico" : "warning",
      titulo: `${s.nombre}: caída de actividad y riesgo político`,
      mensaje: `${s.nombre} muestra caída del ${variacionMock}% en actividad y aumento de riesgo político (${s.cantidadValidados} validados, mínimo ${UMBRALES.VALIDADOS_MIN_POR_SECCIONAL}).`,
      porQue: `La seccional tiene ${s.cantidadValidados} validados (${Math.round(pctDebajo)}% por debajo del promedio territorial). La base de datos está por debajo del mínimo recomendado.`,
      accionSugerida: "Coordinar con el titular de la seccional para reforzar registro y validación; revisar mapa y KPIs de la zona.",
      entidad: s.nombre,
      valorActual: s.cantidadValidados,
      umbral: UMBRALES.VALIDADOS_MIN_POR_SECCIONAL,
      accion: "Coordinar con el titular y revisar mapa.",
      filterKey: { type: "seccional", value: String(s.numero), label: s.nombre },
      createdAt: ahora(),
    });
  });

  return alertas;
}

/** Ejecuta todas las reglas y devuelve alertas ordenadas por severidad. */
export function evaluarAlertas(ctx: ContextoKPIs): Alerta[] {
  const ordenSeveridad: Record<Severidad, number> = {
    critica: 0,
    alta: 1,
    media: 2,
    baja: 3,
  };
  const todas = [
    ...evaluarRiesgoPolitico(ctx),
    ...evaluarBajaActividad(ctx),
    ...evaluarAlertasPorSeccional(ctx),
    ...evaluarConcentracionPoder(ctx),
    ...evaluarInflacionDatos(ctx),
  ];
  return todas.sort((a, b) => ordenSeveridad[a.severidad] - ordenSeveridad[b.severidad]);
}
