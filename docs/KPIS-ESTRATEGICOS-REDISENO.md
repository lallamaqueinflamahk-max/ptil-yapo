# Rediseño de KPIs: dinámicos, accionables y contextuales

Cada KPI invita a **actuar**, no solo a mirar.

---

## Principios

1. **Valor actual** siempre visible y prominente.
2. **Tendencia temporal** (↑/↓ + texto, ej. "+5% vs. mes anterior") para contexto.
3. **Color por estado** (semántico): éxito / advertencia / riesgo / neutral / control.
4. **Clickeable**: un clic filtra el resto del dashboard (mapa, tablas, gráficos).
5. **Jerarquía**: KPIs **primarios** (4) vs **secundarios** (5) con mayor peso visual en primarios.

---

## Componente: KPIActionCard

- **Props:** value, label, trend (direction + value + positiveIsGood), state, meta, progress (anillo 0–100), onAction, actionLabel, primary, isActive, unit.
- **Estado semántico:** success | warning | danger | neutral | control (colores del sistema semántico).
- **Microinteracciones:** hover scale + sombra, active scale down, CTA con flecha que se desplaza al hover, focus ring para accesibilidad.

---

## KPIs estratégicos en Maestro

### Primarios (4)

| KPI | Valor | Tendencia | Estado | Acción al clic |
|-----|--------|-----------|--------|----------------|
| Seccionales en riesgo | countRed + countYellow | vs. semana anterior | danger / warning / success | Filtra solo riesgo + scroll al mapa |
| Índice de Lealtad | 78% | +2 p.p. vs. mes ant. | success | Scroll a Leales por Líderes; si hay filtro ranking, isActive |
| Formalización Laboral | 63% | 1.240 en proceso | warning | Ir a /dashboard/capacitacion |
| Total Suscriptores | totalVotantes | +890 (7%) | neutral | Scroll a tabla seccionales |

### Secundarios (5)

| KPI | Acción al clic |
|-----|----------------|
| Total votantes | Scroll al mapa |
| Seccionales | Scroll al mapa |
| Concejales activos | Scroll a Leales por Líderes |
| Eventos hoy | Scroll a auditoría |
| Concentración de Poder | Scroll a líderes |

---

## Filtrado automático del dashboard

- **Seccionales en riesgo:** al hacer clic se activa `soloRiesgo`; el mapa y la tabla reciben solo seccionales en riesgo (rojo/amarillo). El KPI muestra `isActive` cuando `soloRiesgo` es true.
- **Lealtad / líder:** al hacer clic en un gráfico de líderes se usa `setChartFilter({ type: "ranking", value, label })`; el KPI primario "Índice de Lealtad" puede mostrar `isActive` cuando `chartFilter?.type === "ranking"`.
- El resto de KPIs ejecutan scroll al bloque correspondiente (mapa, tabla, auditoría, capacitación).

---

## Resumen

- **Dinámicos:** valor + tendencia + color que refleja evolución.
- **Accionables:** cada clic hace algo (filtrar o llevar a la sección relevante).
- **Contextuales:** estado semántico y meta donde aplica (ej. Meta 80%).
- **Jerarquía:** primarios más grandes y destacados; secundarios en grid más denso.
