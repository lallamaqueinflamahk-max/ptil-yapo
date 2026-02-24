# Módulo de auditoría — UX para sistemas auditables

**Principio:** Transmitir **control**, **transparencia** y **autoridad**. Todo queda registrado; el usuario debe sentir que el sistema vigila y que nada pasa desapercibido.

---

## 1. Objetivos de percepción

| Valor | Cómo se transmite |
|-------|--------------------|
| **Control** | Timeline vivo, actualización automática, filtros inmediatos. "Yo (o el sistema) tengo el control del registro." |
| **Transparencia** | Eventos visibles con tipo, usuario, entidad y hora. Sin zonas opacas; todo auditable. |
| **Autoridad** | Título y copy que refuerzan "Registro de auditoría", "Todo queda registrado". Presencia visual fuerte (borde, ícono de vigilancia). |

Objetivo: **Que el usuario sienta que todo está vigilado.**

---

## 2. Diseño del timeline

- **Estructura:** Línea vertical continua (o secuencia de segmentos) con eventos como nodos. Cada evento es una tarjeta compacta alineada a la línea, con un **punto de color** según el tipo de evento.
- **Orden:** Siempre **más reciente primero** (arriba). Sin paginación confusa; scroll para ver más.
- **Nodo por evento:** 
  - Indicador izquierdo: círculo relleno con el color del tipo (o franja vertical).
  - Contenido: mensaje, usuario, entidad, hora relativa ("Hace 2 min") + hora absoluta en tooltip o secundaria.
- **"En vivo":** Indicador visible (punto pulsante + texto "En vivo" o "Actualizado hace X s") que refuerza que el registro se actualiza solo.
- **Refresh manual:** Botón de actualizar sin esconder; refuerza control.

---

## 3. Colores por tipo de evento

| Tipo | Color semántico | Justificación |
|------|-----------------|---------------|
| **CREACION** | `semantic-success` | Alta positiva (algo se creó). |
| **ACTUALIZACION** | `semantic-control` | Cambio bajo supervisión. |
| **CAMBIO_ESTADO** | `semantic-warning` | Revisar; puede afectar flujos. |
| **CAMBIO_ROL** | `semantic-warning` o `semantic-danger` | Sensible; cambio de permisos. |
| **EXPORTACION** | `semantic-control` o `semantic-danger` | Acción de alto impacto; trazabilidad. |
| **LOGIN** | `semantic-neutral` | Informativo. |
| **LOGOUT** | `semantic-neutral` | Informativo. |

Cada tipo tiene **fondo suave** y **borde o punto** del mismo color para identificación rápida.

---

## 4. Jerarquía de eventos

| Nivel | Tipos | Tratamiento visual |
|-------|--------|---------------------|
| **Alta** | EXPORTACION, CAMBIO_ROL | Opcional: tarjeta con borde más marcado o ícono de atención. Aparecen primero si se ordena por "impacto". |
| **Media** | ACTUALIZACION, CAMBIO_ESTADO | Estándar. |
| **Baja** | CREACION, LOGIN, LOGOUT | Estándar; no atenuar (transparencia). |

Por defecto el orden es **temporal** (más reciente primero). Opcional: toggle "Ordenar por impacto" que sube EXPORTACION/CAMBIO_ROL al inicio del listado visible.

---

## 5. Filtros rápidos

- **Por tipo:** Chips "Todos" + un chip por cada tipo de evento (con el color correspondiente). Clic = filtrar; activo = relleno, inactivo = borde. **Sin dropdown** para no esconder opciones.
- **Por entidad (opcional):** Si hay muchas entidades, un segundo nivel de chips o un filtro compacto "Entidad: Todas | Usuario | Seccional | …".
- **Persistencia:** El filtro puede persistir en sesión (localStorage) para que al volver la vista siga igual.

---

## 6. Relación con alertas y KPIs

- **KPI "Eventos hoy":** Ya enlaza a la sección de auditoría (scroll a `#auditoria`). El número de "Eventos hoy" debe coincidir conceptualmente con los eventos del día mostrados en el timeline (misma fuente de verdad).
- **Alertas:** Los eventos de auditoría pueden **disparar o alimentar** alertas (ej. muchas EXPORTACION en poco tiempo, CAMBIO_ROL). No es obligatorio enlazar cada evento a una alerta; la relación es "el mismo sistema que vigila eventos alimenta indicadores y alertas".
- **Copy en el módulo:** Una línea breve: "Estos eventos alimentan los indicadores y las alertas del dashboard." con enlace a la sección de alertas (scroll a `#alertas`) refuerza la conexión.

---

## 7. Imposible de ignorar visualmente

- **Contenedor:** Borde izquierdo grueso en color de control (`semantic-control`) o un marco con doble borde que destaque el bloque.
- **Título:** "Registro de auditoría" o "Auditoría · Todo queda registrado" con ícono de escudo o ojo (vigilancia).
- **Posición:** Colocado en flujo principal (no al final colapsado); el KPI "Eventos hoy" ya lleva aquí.
- **Indicador en vivo:** Siempre visible cuando hay refresh automático (punto verde pulsante + "En vivo" o "Actualizado hace X s").

---

## 8. Resumen de implementación

| Elemento | Implementación |
|----------|----------------|
| Timeline | Línea vertical + tarjetas con punto de color por tipo; orden más reciente primero. |
| Colores por tipo | Mapa TIPO → { bg, border, stripe } con tokens semánticos. |
| Jerarquía | Orden por defecto temporal; opcional "impacto" (EXPORTACION, CAMBIO_ROL primero). |
| Filtros | Chips por tipo (Todos + uno por tipo); activo con color de tipo. |
| En vivo | Indicador "En vivo" + refresh automático; botón Actualizar visible. |
| Autoridad | Título "Registro de auditoría", copy "Todo queda registrado", borde de control. |
| Conexión KPIs/alertas | KPI Eventos hoy → scroll a #auditoria; línea + enlace "Alimenta indicadores y alertas" → #alertas. |

Objetivo final: **que el usuario sienta que todo está vigilado** y que el registro es transparente y bajo control.

---

## 9. Implementación actual (referencia)

- **Header de autoridad:** Borde izquierdo `semantic-control`, ícono ShieldCheck, título "Registro de auditoría", subtítulo "Todo queda registrado". Indicador "En vivo" con punto pulsante y botón Actualizar.
- **Timeline:** Línea vertical (`bg-semantic-neutral-border`) con eventos en tarjetas; cada evento tiene punto de color (`dot`) y borde izquierdo por tipo. Orden: más reciente primero.
- **Colores por tipo:** CREACION=success, ACTUALIZACION/EXPORTACION=control, LOGIN/LOGOUT=neutral, CAMBIO_ESTADO/CAMBIO_ROL=warning. Cada tipo con `bg`, `border`, `dot` y `chip` (para filtro activo).
- **Filtros rápidos:** Chips "Todos" + un chip por tipo; activo con color del tipo (chip), inactivo borde gris.
- **Conexión alertas/KPIs:** Texto "Estos eventos alimentan los indicadores y las alertas del dashboard" con enlace a `#alertas`. El KPI "Eventos hoy" en maestro hace scroll a `#auditoria`.
