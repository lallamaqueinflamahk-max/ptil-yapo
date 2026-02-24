# Sistema de alertas — Diseño para sistemas críticos (finanzas / seguridad)

**Principio:** Ninguna alerta debe pasar desapercibida. Nivel visual inmediato, causa y consecuencia claras, acción concreta, filtrado y priorización, y conexión directa con KPIs y mapa.

---

## 1. Nivel visual inmediato (info, atención, crítico)

| Nivel   | Significado       | Color semántico        | Uso en UI |
|---------|-------------------|------------------------|-----------|
| **Crítico** | Actuar ya         | `semantic-danger`     | Borde izquierdo grueso rojo, fondo rojo muy suave, icono de alerta, chip "Crítico". No reducir opacidad. |
| **Atención** | Revisar pronto  | `semantic-warning`     | Borde izquierdo ámbar, fondo ámbar suave, chip "Atención". |
| **Info**    | Conocer / planificar | `semantic-control` o `semantic-neutral` | Borde azul o gris, fondo neutro, chip "Info". |

**Regla:** En menos de 3 segundos el usuario debe distinguir "crítico" del resto sin leer texto. Siempre orden: **Crítico → Atención → Info**.

---

## 2. Estructura de cada alerta: causa, consecuencia, acción

| Campo              | Propósito | Ejemplo |
|--------------------|-----------|--------|
| **Causa (porQué)** | Por qué se disparó la alerta (dato/umbral). | "El 32% de las seccionales está por debajo del mínimo de validados (200)." |
| **Consecuencia**   | Qué implica si no se actúa (opcional).     | "Aumenta el riesgo territorial y la desbalance de cobertura." |
| **Acción sugerida**| Qué hacer de forma concreta.              | "Reforzar trabajo de base en seccionales con menor validación; revisar con titular de zona." |

En la UI: bloques claros **Causa** → **Consecuencia** (si existe) → **→ Acción** (destacado, CTA si aplica).

---

## 3. Filtrado y priorización

- **Filtro por nivel:** Chips "Todos | Crítico | Atención | Info" con color semántico; activo = relleno, inactivo = borde.
- **Filtro por tipo:** Riesgo político, Baja actividad, Concentración, Inflación datos (según `TipoAlerta`).
- **Orden por defecto:** Siempre por severidad (crítico primero, luego atención, luego info). Dentro del mismo nivel, por fecha (más reciente primero) o por entidad afectada.
- **Priorización visual:** Las críticas no se colapsan ni se ocultan; el banner superior refleja el conteo y lleva al panel.

---

## 4. Conexión con KPIs y mapa

- **Clic en la alerta:** Si tiene `filterKey`, se llama `setChartFilter({ type, value, label })` → el mapa centra/resalta la entidad, los KPIs y tablas filtran.
- **Banner de alertas:** Muestra "X críticas · Y en atención"; clic = scroll al panel de alertas (`#alertas`).
- **Acción "Ver en mapa":** Texto o botón explícito en cada alerta con `filterKey`; mismo efecto que el clic en la tarjeta.
- **Panel de detalle del mapa:** Al abrir una seccional, mostrar "Alertas activas" de esa seccional (ya existe en `PanelSeccionalDetalle`).

---

## 5. Ubicación estratégica en el dashboard

| Ubicación        | Rol |
|------------------|-----|
| **Banner bajo hero/estado** | Siempre visible cuando hay críticas o atención; clic → panel. No ocultar si hay críticas. |
| **Panel de alertas**        | Segundo bloque relevante (después del estado del territorio / KPIs); id `alertas` para deep link y scroll. |
| **Header (opcional)**      | Badge con número de críticas (ej. "3") que lleve al panel; solo si hay críticas. |
| **Mapa**                   | Seccionales con alertas pueden llevar indicador (punto o capa); clic en seccional muestra alertas en panel lateral. |

Objetivo: el usuario no tiene que "buscar" las alertas; el flujo natural (estado → banner → panel) las pone delante.

---

## 6. Comportamiento en tiempo real

- **Refresh:** `refreshInterval` (ej. 30 s) para re-fetch de la API de alertas; sin recargar toda la página.
- **Indicador "En vivo":** Pequeño indicador en el panel ("Actualizado hace X s" o "En vivo") que refuerce que los datos se actualizan.
- **Orden estable:** Tras cada carga, reordenar por severidad y fecha; las alertas ya revisadas/silenciadas no vuelven a aparecer (localStorage).
- **Sin duplicar ruido:** Si una alerta es silenciada, no mostrarla de nuevo en la misma sesión; el panel puede mostrar "X silenciadas" o un enlace "Restablecer silenciadas" para poder verlas de nuevo.

---

## 7. Resumen de implementación

| Elemento | Implementación |
|----------|----------------|
| Nivel visual | `NIVEL_ALERTA_STYLE` con clases semánticas; tarjeta con `border-l-4` por nivel; chip con color. |
| Causa / Consecuencia / Acción | `porQue` (causa), `consecuencia` (opcional en tipo), `accionSugerida` (acción); bloques etiquetados en PanelAlertas. |
| Filtros | Filtro por nivel y tipo (API query params); chips con estado activo semántico. |
| Prioridad | Orden en backend por severidad; en cliente ordenar por nivel (critico → warning → info) y fecha. |
| Conexión mapa/KPIs | `handleClickAlerta` → `setChartFilter`; banner con scroll a `#alertas`; botón "Ver en mapa" en alerta. |
| Ubicación | Banner debajo de estado; panel con id `alertas`; opcional badge en header. |
| Tiempo real | `refreshInterval` en SWR; texto "Actualizado hace X s" o "En vivo" en el panel. |

Objetivo final: **que ninguna alerta pase desapercibida** y que cada una lleve a una acción concreta o al contexto correcto (mapa/KPI).

---

## 8. Implementación actual (referencia)

- **Tipos:** `Alerta` tiene `porQue` (causa), `consecuencia` (opcional), `accionSugerida` (acción). `NIVEL_ALERTA_STYLE` con colores semánticos y `stripe` para borde izquierdo.
- **PanelAlertas:** Orden por prioridad (crítico → atención → info) y luego por fecha. Tarjeta con `border-l-4` semántico por nivel; bloques Causa, Consecuencia (si existe), → Acción. Filtros por nivel (chips con color semántico) y tipo. Indicador "En vivo". Clic en alerta → `setChartFilter` (mapa y KPIs). "Ver en mapa" explícito cuando hay `filterKey`.
- **Banner (maestro):** Si hay críticas usa `semantic-danger-bg/border`; si solo atención usa `semantic-warning`. Clic → scroll a `#alertas`.
- **Reglas:** Ejemplo de `consecuencia` en alerta de riesgo político (seccionales con baja base).
