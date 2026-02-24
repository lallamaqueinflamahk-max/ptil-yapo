# Auditoría de la interfaz completa — SENTINEL360

**Alcance:** Interfaz completa del sistema (Design System SENTINEL360 + producto Territorio Command / PTIL YAPÓ).  
**Objetivo:** Evaluar qué comunica el poder visual, KPIs críticos, redundancias, claridad y control jerárquico; proponer mejoras finales.

---

## 1. ¿Qué comunica el poder visual?

### Lo que hoy transmite

| Elemento | Mensaje percibido |
|----------|-------------------|
| **Header** | Marca “Territorio Command” + tagline; nav en azul control (#1E3A8A); sensación de producto único y “en mando”. |
| **Color semántico** | Verde = OK, ámbar = atención, rojo = riesgo, azul = control. Bien alineado al Design System en KPIs, chips de estado, alertas y mapa. |
| **Estado del territorio (Maestro)** | Bloque “X críticos · Y atención · Z OK” + CTA “Ver en riesgo en el mapa”. Comunica **visibilidad** y **prioridad por impacto**. |
| **Banner de alertas** | Si hay críticas/atención: bloque destacado con borde y fondo danger/warning; “Ver alertas →”. Refuerza **urgencia**. |
| **KPIs con anillo y “En vivo”** | Progreso, tendencia y punto pulsante comunican **datos en tiempo real** y **decisión** (clic → filtrar/navegar). |
| **Mapas con semáforo** | Puntos por estado (OK / Atención / Crítico) transmiten **control territorial** y **qué actuar**. |
| **Auditoría** | “Registro de auditoría” con borde de control y timeline: **transparencia** y “todo queda registrado”. |

### Lo que se debilita

- **Fondo de página (`body`):** Gradiente decorativo (azul → amarillo → naranja → rojo) en `globals.css` contradice el principio SENTINEL360 de “nada decorativo” y puede competir con el significado del color semántico (rojo = riesgo).
- **Doble identidad:** En copy aparece “Territorio Command”; en README y mensajes internos “YAPÓ / PTIL”. La interfaz no aclara si SENTINEL360 es el nombre del design system o del producto; el usuario ve “Territorio Command”.
- **Páginas “huérfanas”:** `/dashboard/graficos`, `/dashboard/tabla-operativa`, `/dashboard/mapa-control`, `/dashboard/alertas-persistente` no están en el NAV principal. El poder visual de “una sola sala de mando” se fragmenta: no es obvio que existan ni cuándo usarlas frente a Maestro (que ya concentra mapa, gráficos y tabla).

**Resumen:** El poder visual comunica **control, visibilidad y prioridad por impacto** donde el Design System está aplicado (estado del territorio, alertas, KPIs accionables, mapa, auditoría). Se debilita por fondo decorativo, doble identidad de marca y rutas secundarias no integradas en la jerarquía de navegación.

---

## 2. ¿Qué KPIs son críticos?

### Críticos (deben estar siempre visibles y accionables)

| KPI | Dónde | Por qué es crítico |
|-----|--------|---------------------|
| **Seccionales en riesgo** (crítico + atención) | Maestro: bloque “Estado del territorio” + KPIs estratégicos | Responde “¿qué debo mirar primero?”. CTA “Ver en mapa” cierra el ciclo decisión → acción. |
| **Índice de Lealtad** | Home (KPIDynamic desde API) y Maestro (KPIActionCard) | Indicador estratégico; umbrales verde/amarillo/rojo; drill-down a Pro. |
| **Riesgo Político** | API KPIs + Maestro | Invertido (bajo = bien); conectado a mapa y seccionales. |
| **Nivel de Formalización** | API KPIs + Maestro | Trazabilidad PTIL; enlace a capacitación y dictámenes. |
| **Concentración de Poder** | API KPIs + Maestro | Alerta cuando pocos líderes concentran poder; debe llevar a “Ver líderes” o ranking. |
| **Pendientes de dictamen / derivaciones** | Home (card idoneidad) + Capacitación | Acción directa: “Ir a capacitación” o “Revisar pendientes”. |

### Importantes pero secundarios

- **Total votantes, Seccionales, Concejales activos, Eventos hoy:** Contexto territorial; en Home son estáticos (KPICard con link a Maestro). Deberían tener al menos tendencia o “Ver desglose”.
- **Suscriptores activos hoy:** Útil para operación; menos crítico que riesgo y formalización.
- **Afiliados leales / Operadores:** Relevantes en Pro y Operador; no necesitan ser el foco en Resumen si ya están en sus módulos.

### Lo que sobra o duplica

- **Dos capas de “métricas” en Home:** “Indicadores clave” (KPIDynamic desde API) y “Métricas principales” (4 KPICard estáticos). Se solapan en mensaje; uno podría ser “Resumen numérico” y el otro “Acciones rápidas” con CTAs explícitos.
- **KPIs repetidos entre Home y Maestro:** Lealtad, Riesgo, Formalización aparecen en ambos. No es malo si Home es resumen y Maestro es detalle, pero el usuario puede no distinguir “resumen” vs “vista accionable”.

**Resumen:** Los KPIs críticos son **estado del territorio (riesgo)**, **Lealtad**, **Riesgo Político**, **Formalización**, **Concentración de Poder** y **pendientes de dictamen**. Lo que sobra es duplicación de mensaje en Home (dos bloques de métricas) y KPIs estáticos sin tendencia ni CTA.

---

## 3. ¿Qué sobra?

| Elemento | Dónde | Motivo |
|----------|--------|--------|
| **Fondo gradiente del `body`** | `app/globals.css` | Decorativo; contradice “nada decorativo” y puede confundir con semántica de color. |
| **Modal “Simular escenario”** | Maestro | Texto “En una próxima versión / Disponible próximamente”; no ejecuta acción. Genera expectativa sin valor. |
| **Botón “Simular escenario”** en hero de Maestro | Siempre visible (deshabilitado o con modal vacío) | Ruido visual; mejor ocultar o un solo CTA “Próximamente” en pie de página. |
| **Oferta de valor (4 viñetas)** | Home, final de página | Copy de producto útil para marketing; en dashboard compite con métricas y no es accionable. Conviene colapsable o en “Sobre el producto”. |
| **Páginas duplicadas en función** | `/dashboard/graficos`, `/dashboard/tabla-operativa`, `/dashboard/mapa-control` | Maestro ya agrupa mapa, gráficos y tabla con filtro cruzado. Estas rutas repiten contenido sin aportar jerarquía clara; o se integran como pestañas/vistas dentro de Maestro o se elimina su entrada si no están en NAV. |
| **Cobertura en territorio (lista “Cubierta / Sin responsable”)** | Si es solo simulado sin “Asignar” | Elemento pasivo; mejor quitar hasta tener acción real o convertir “Sin responsable” en CTA “Asignar”. |
| **Doble sistema de botones** | `.btn-yapo` (gradiente ámbar/naranja) vs `Button` SENTINEL (control azul) | Dos lenguajes visuales para primario; debilita coherencia. Unificar a un solo primario (p. ej. control azul) salvo excepciones justificadas. |

**Resumen:** Sobra lo decorativo (fondo, modal simular), lo no accionable (oferta de valor como bloque plano, cobertura sin asignar), la duplicación de vistas (graficos/tabla-operativa/mapa-control vs Maestro) y la dualidad de estilos de botón primario.

---

## 4. ¿Dónde mejorar claridad?

| Área | Problema | Mejora propuesta |
|------|----------|-------------------|
| **Navegación** | Solo 6 ítems en NAV; graficos, tabla-operativa, mapa-control, alertas-persistente no aparecen. | Decidir: o se añaden como sub-ítems (Territorio → Gráficos / Tabla / Mapa) o se eliminan como rutas independientes y todo se accede desde Maestro con pestañas o secciones. |
| **“Resumen ejecutivo” vs “Maestro”** | Home es resumen; Maestro es “Estrategia territorial”. No siempre está claro que Maestro es el “centro de mando” con mapa + KPIs + tabla + alertas. | En copy o hero: “Desde aquí controlás mapa, seccionales y alertas” o “Vista de sala de mando”. En NAV, considerar “Sala de mando” o “Territorio (mapa + datos)”. |
| **Filtro activo vs filtro por URL** | Maestro tiene `?filter=riesgo` (query) y `chartFilter` (estado global). Dos orígenes de filtro. | Unificar: que el filtro de URL sincronice con el store (chartFilter) al cargar, y que setChartFilter actualice la URL (opcional) para compartir vista. |
| **Indicadores clave (Home)** | Los 5 KPIs de la API no son clicables en Home (KPIDynamic con onDrillDown lleva a otra página, no filtra el dashboard). | En Home, si el usuario no está en Maestro, el drill-down está bien; pero dejar explícito “Ver en Territorio” o “Abrir en mapa”. En Maestro, ya son accionables. |
| **Alertas: revisada vs resuelta** | PanelAlertas tiene “Marcar como revisada” (localStorage) pero no “Resuelta” ni asignación real. | Clarificar en UI: “Revisada” = “Ya lo vi”; opcional “Asignar a” aunque sea mock. Evitar que “revisada” suene a “resuelta”. |
| **Leyenda de mapas** | Mapa de calor: no siempre está explicado “más oscuro = más validados” (o la métrica que sea). | Leyenda fija en el mapa: “Intensidad = validados por zona” (o la fórmula breve). |
| **Accesibilidad y nombres** | Algunos botones solo con icono en móvil (shortLabel en NAV). | Asegurar aria-label y, si es posible, tooltip en iconos sin texto. |
| **SENTINEL360 vs Territorio Command** | Usuario ve “Territorio Command”; desarrollador ve “SENTINEL360” en tokens y docs. | En documentación: “SENTINEL360 = Design System; Territorio Command = producto”. En UI no es necesario mostrar “SENTINEL360” salvo en /sentinel-ui (catálogo). |

**Resumen:** Mejorar claridad en: relación NAV ↔ rutas secundarias, rol de Maestro como sala de mando, unificación de filtros (URL + store), CTAs de KPIs en Home, ciclo de alertas (revisada ≠ resuelta), leyendas de mapas y consistencia de nombres (design system vs producto).

---

## 5. ¿Cómo se percibe el control jerárquico?

### Estructura actual

- **Nivel 1 — NAV:** Resumen ejecutivo, Estrategia territorial (Maestro), Estructura y equipos (Pro), Operación de campo (Operador), Idoneidad y formación (Capacitación), Administración. Todos al mismo nivel visual.
- **Nivel 2 — Dentro de cada módulo:** Hero (título, confianza, ámbito) → Estado del territorio / Alertas (en Maestro) → KPIs → Mapas / Gráficos / Tablas. No hay un “supervisor” que indique “primero mirá esto”.
- **Control real:** En Maestro el orden ya ayuda: Estado del territorio → Banner alertas → Panel alertas → KPIs estratégicos → Mapas → Gráficos → Tablas. La jerarquía de contenido es correcta; lo que falta es que en **Resumen (Home)** la jerarquía sea igual de clara (qué es lo primero que debo hacer hoy).

### Percepción

- **Positivo:** En Maestro la secuencia “estado → alertas → KPIs → mapa → tablas” transmite control: primero el resumen, luego la acción. El CTA “Ver X en riesgo en el mapa” y los KPIs con “Ver en mapa” / “Ir a capacitación” refuerzan que **el usuario tiene el mando**.
- **Negativo:** En Home no hay un único “estado del territorio” ni “qué hacer hoy”; las métricas y los accesos rápidos compiten. No hay un rol explícito (ej. “Sos dirección” → esto; “Sos operador” → aquello); la jerarquía es por pantalla, no por persona.
- **Admin:** Está al mismo nivel que los módulos operativos; no se percibe como “configuración separada”. Aceptable si el público incluye admins que entran por el mismo dashboard.

**Resumen:** El control jerárquico se percibe bien **dentro de Maestro** (estado → alertas → KPIs → mapas/tablas/gráficos). Se percibe **débil en Home** (falta un “estado del día” o “acciones prioritarias” único) y **plano en la NAV** (todos los módulos al mismo nivel, sin indicar “centro de mando” vs “módulos de apoyo”).

---

## 6. Propuestas de mejora finales

### 6.1 Prioridad alta

1. **Un solo “Estado del día” en Home**  
   Bloque arriba (debajo del hero): “X críticos · Y atención · Z OK” + CTA “Ver en Territorio” (→ Maestro con filtro riesgo). Mismo concepto que en Maestro pero como resumen ejecutivo.

2. **Quitar o unificar lo decorativo y lo no accionable**  
   - Fondo: sustituir gradiente del `body` por color sólido o gris muy suave (`#F8FAFC` ya usado en layout).  
   - Modal “Simular escenario”: ocultar botón del hero hasta que exista; o un solo enlace “Próximamente” en pie.  
   - Oferta de valor: sección colapsable “Sobre el producto” o mover al final sin competir con métricas.

3. **Integrar rutas secundarias en la jerarquía**  
   - Opción A: Añadir en NAV bajo “Territorio” sub-ítems: Gráficos, Tabla operativa, Mapa (o pestañas dentro de Maestro).  
   - Opción B: Eliminar rutas independientes y que Maestro sea la única entrada a mapa/gráficos/tabla; enlaces internos “Solo gráficos” = scroll o ancla dentro de Maestro.

4. **Un solo estilo de botón primario**  
   Usar `semantic-control` (azul) como primario en todo el dashboard; reservar `.btn-yapo-primary` (gradiente ámbar) para landing o flujos específicos (ej. inscripción), no para la sala de control.

### 6.2 Prioridad media

5. **KPIs en Home con CTA explícito**  
   En “Indicadores clave”, que cada KPI tenga al menos un enlace: “Ver en Territorio”, “Ver en mapa” o “Ir a Capacitación”, con el mismo criterio que en Maestro.

6. **Alertas: diferenciar “Revisada” y “Resuelta”**  
   Si el backend lo permite, “Marcar como revisada” y “Resolver” (o “Cerrar”) con trazabilidad. En copy: “Revisada” = “Ya lo vi”; “Resuelta” = “Cerrada / Atendida”.

7. **Filtro único (URL + store)**  
   En Maestro (y vistas que usen chartFilter), que `?filter=...` al cargar inicialice el store, y opcionalmente que setChartFilter actualice la URL para poder compartir enlace con filtro aplicado.

8. **Leyenda en mapa de calor**  
   Texto corto fijo: “Intensidad = validados (o la métrica) por zona”. Mismo criterio en otros mapas temáticos.

### 6.3 Prioridad baja

9. **Nombre del producto y design system**  
   Dejar “Territorio Command” en la UI; en documentación interna dejar explícito “SENTINEL360 = design system; Territorio Command = producto”.

10. **Rol o “para quién” en Home**  
    Si en el futuro hay roles (dirección, operador, admin), un bloque tipo “Vista para: Dirección” con atajos a “Estado del territorio” y “Alertas”; opcional.

11. **Cobertura en territorio**  
    Si sigue siendo simulado, añadir al menos un CTA “Asignar” (mock) en “Sin responsable” para que el patrón sea accionable; o quitar hasta tener backend.

---

## 7. Checklist de cierre (por pantalla)

- [ ] **Home:** ¿Hay un único “Estado del día” o “Acciones prioritarias” con CTA a Maestro/alertas?
- [ ] **Maestro:** ¿Estado del territorio + alertas están arriba? ¿KPIs son clicables y filtran mapa/tabla?
- [ ] **Todas:** ¿El color comunica solo estado (éxito/atención/riesgo/control)? ¿Hay elementos puramente decorativos?
- [ ] **NAV:** ¿Las rutas que existen (graficos, tabla-operativa, mapa-control) están integradas o eliminadas?
- [ ] **Alertas:** ¿Se distingue “revisada” de “resuelta” y hay CTA claro (Ver en mapa, Asignar)?
- [ ] **Botones:** ¿Un solo lenguaje de botón primario (control azul) en dashboard?

---

*Auditoría basada en: Design System SENTINEL360, `lib/copy/dashboard.ts`, layout y páginas del dashboard, API de KPIs, componentes KPIActionCard, PanelAlertas, MapaControlDashboard, y documento AUDITORIA-DASHBOARD-PRODUCT-UX.md.*
