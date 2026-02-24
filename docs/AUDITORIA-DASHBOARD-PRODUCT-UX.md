# Auditoría de producto y UX del dashboard Yapó

**Rol:** Head of Product + Lead UI/UX Designer  
**Alcance:** Dashboard (home, maestro, pro, operador, capacitación) con foco en decisión y control.

---

## 1. Evaluación por dimensiones

### Jerarquía visual

| Hallazgo | Severidad |
|----------|-----------|
| **Todo tiene peso similar.** Métricas globales, indicadores clave, alertas, mapas y tablas compiten con el mismo nivel de título (h2) y cards. No hay un “primer vistazo” claro: ¿qué debo mirar en 5 segundos? | Alta |
| **Hero genérico.** El PageHero da contexto pero no prioriza una métrica ni una acción. No hay un “número que duele” ni un CTA principal. | Media |
| **Scroll largo sin anclas.** En Maestro hay muchas secciones en columna; no hay resumen sticky ni “estado del territorio en una línea” que persista. | Media |
| **Alertas no destacan sobre el ruido.** El panel de alertas está al mismo nivel visual que KPIs y cards; en una pantalla llena, lo crítico no sobresale. | Alta |

### Uso del color

| Hallazgo | Severidad |
|----------|-----------|
| **Paleta amplia sin sistema.** Se usan verde, rojo, ámbar, azul, violeta, esmeralda para métricas y cards. Falta regla clara: “rojo = acción urgente”, “verde = OK”, “amarillo = revisar”. | Media |
| **“En vivo” y animaciones.** El punto pulsante y el brillo en indicadores clave suman sensación de tiempo real, pero el resto de la página no refuerza esa idea (ej. timestamps visibles, indicador de última actualización cerca de cada bloque). | Baja |
| **Gradientes por KPI.** Los fondos en gradiente por indicador ayudan a diferenciar, pero en móvil 5 chips de color pueden saturar. | Baja |

### Lectura de métricas

| Hallazgo | Severidad |
|----------|-----------|
| **Métricas globales solo informan.** Total votantes, seccionales, concejales activos, eventos hoy son números estáticos: no hay link a desglose, no hay tendencia (↑↓), no hay meta. El usuario no sabe “¿esto está bien o mal?”. | Alta |
| **Indicadores clave sin acción.** Los 5 KPIs con anillo (Lealtad, Riesgo, Formalización, Concentración, Suscriptores) no son clicables. No llevan a filtro, a lista ni a mapa. “Concentración de Poder · ALERTA” no tiene botón “Ver quiénes” o “Ver en mapa”. | Alta |
| **Sin metas ni benchmarks.** No se muestra “objetivo 80%” ni “vs. mes anterior”. La decisión “¿actúo o no?” depende de conocimiento externo. | Alta |

### Interacción real vs elementos pasivos

| Elemento | ¿Interactivo? | ¿Lleva a decisión/acción? |
|----------|----------------|----------------------------|
| Métricas globales (4 números) | No | No |
| Indicadores clave (5 anillos) | Hover only | No |
| Panel de alertas | Sí: clic → filtra mapa/tabla; silenciar | Parcial: filtra pero no hay “Resolver” o “Asignar” |
| Mapa interactivo avanzado | Sí: clic seccional → panel detalle; capas; estado | Sí: ver detalle y contacto WhatsApp |
| Mapa multicapa (calor) | Capas on/off | Solo exploración |
| Mapa por estado (suscriptores/dirigentes) | Clic punto → popup WhatsApp | Sí: contacto directo |
| Control seccionales (tabla) | Clic fila → sincroniza mapa; WhatsApp | Sí: contacto y foco en seccional |
| Donut Leales / Barra Seguidores | Clic → filtra dashboard | Sí |
| Tabla con sparklines | Clic fila → filtra por seccional | Sí |
| Evolución temporal (líneas) | Período 30/60/90; leyenda clickeable | Parcial: no queda claro si clic en gráfico hace algo útil |
| Embudo idoneidad | “Derivar capacitación” (si existe) | Sí si está implementado |
| Comparar concejales | Modal → comparar | Sí |
| Simular escenario | Modal dice “en una próxima versión” | No (decorativo) |
| Cobertura en territorio (puntos) | Solo lectura | No |
| Dirigentes · Datos y contacto | WhatsApp por fila | Sí |
| Acciones por seccional | Texto sugerido (rojo/amarillo/verde) | Sugiere pero no ejecuta (no asigna visita ni crea tarea) |
| Oferta de valor (4 viñetas) | No | No (informativo) |

### Sensación de control y poder

| Hallazgo | Severidad |
|----------|-----------|
| **Mucho “ver”, poco “hacer”.** El usuario puede filtrar, ver detalle y contactar por WhatsApp, pero no puede “marcar como revisado”, “asignar responsable” ni “programar visita” desde el dashboard. La sensación de control es de visibilidad, no de ejecución. | Alta |
| **Filtros cruzados bien.** setChartFilter y filtro por seccional/líder enlazan mapa, tabla y gráficos. Eso sí da sensación de control sobre la vista. | Positivo |
| **Sin resumen de “qué hacer hoy”.** No hay bloque tipo “3 alertas críticas, 2 seccionales sin contacto, 5 pendientes de dictamen” con links directos. | Alta |

---

## 2. Elementos planos o decorativos

1. **Métricas globales (Total votantes, Seccionales, Concejales activos, Eventos hoy):** Cards estáticas, sin link ni tendencia. Decorativas en tanto no cambian comportamiento.
2. **Indicadores clave (5 anillos):** Visualmente ricos, pero sin clic ni drill-down. “En vivo” aporta sensación, no función.
3. **Modal “Simular escenario”:** Texto explícito: “en una próxima versión”. Es un placeholder, no una acción.
4. **Cobertura en territorio (puntos de verificación):** Lista simulada “Cubierta / Sin responsable” sin acciones (asignar, editar, notificar).
5. **Oferta de valor (4 viñetas):** Copy útil para producto, pero en dashboard es contenido estático al final de la página.
6. **“Actualización cada 10 s” y “Cobertura: X seccionales”:** Refuerzan confianza pero no son accionables.

---

## 3. KPIs que informan pero no accionan

| KPI | Problema | Impacto |
|-----|----------|---------|
| Total votantes / Seccionales / Concejales / Eventos hoy | Solo número, sin link ni contexto (meta, tendencia). | El usuario no sabe qué hacer con el número. |
| Índice de Lealtad 78% | No clicable; no lleva a lista “quién compone ese 78%” ni a mapa. | No se puede profundizar ni actuar por segmento. |
| Riesgo Político 24% (+12%) | No hay “Ver seccionales en riesgo” ni “Ver en mapa” desde la card. | La reacción depende de recordar ir al mapa o a la tabla. |
| Formalización Laboral 63% | “En proceso: 1.240” no es link a derivaciones o capacitación. | Oportunidad perdida de llevar a la acción. |
| Concentración de Poder · ALERTA 2 líderes > 40% | Texto de alerta sin botón “Ver líderes” o “Ver seccionales”. | La alerta no se convierte en siguiente paso. |
| Total Suscriptores (número + %)** | Solo lectura. | No lleva a listado ni a filtros. |

---

## 4. Gráficos que no generan decisiones

| Gráfico | Qué hace hoy | Qué falta para decidir |
|---------|----------------|--------------------------|
| Evolución temporal (30/60/90 días) | Muestra series en el tiempo; leyenda clickeable. | Clic en punto de la línea no filtra por fecha; no hay “bajar a seccionales de este día”. |
| Mapa multicapa (calor + seccionales) | Exploración visual. | No hay “exportar zona” ni “crear grupo de seccionales” ni anotaciones. |
| Donut Leales / Barra Seguidores | Clic filtra dashboard. | Bien encaminado; podría sumar “Comparar estos dos” desde el mismo gráfico. |

---

## 5. Mapas subutilizados

| Mapa | Uso actual | Subutilización |
|------|------------|----------------|
| Mapa interactivo avanzado | Capas, estado, clic → panel con KPIs y WhatsApp. | No hay “centrar en mi zona” ni “solo seccionales con alertas”; no se pueden guardar vistas ni compartir enlace con filtro. |
| Mapa multicapa | Calor + puntos. | Sin clic en zona de calor que filtre seccionales de esa área; sin leyenda de valores (qué significa “más caliente”). |
| Mapa por estado (suscriptores/dirigentes) | Popup con WhatsApp. | No hay panel lateral tipo “lista de personas en esta zona”; no hay agregación “X dirigentes en 2 km”. |

---

## 6. Lista de problemas críticos (resumen)

1. **No hay jerarquía de “lo más importante primero”.** Métricas, alertas y mapas compiten al mismo nivel; no existe un “estado del territorio en una línea” ni un CTA principal.
2. **KPIs clave no son accionables.** Los 5 indicadores con anillo y las 4 métricas globales no tienen drill-down ni links; las alertas en las cards no llevan a “Ver en mapa” o “Ver lista” desde el mismo bloque.
3. **Alertas no escalan a acción.** Clic en alerta filtra el mapa/tabla (bien), pero no hay “Marcar como revisada”, “Asignar a” ni “Crear tarea”; el usuario puede silenciar pero no cerrar el ciclo.
4. **“Qué hacer hoy” inexistente.** No hay resumen ejecutivo tipo “3 críticos, 5 en atención, 2 sin contacto” con links directos a mapa/tabla/capacitación.
5. **Métricas sin meta ni tendencia.** No se muestra objetivo ni comparación (vs. ayer/mes); no se puede evaluar “¿estamos bien?”.
6. **Simular escenario y Cobertura en territorio son decorativos.** No ejecutan acciones ni permiten asignar responsables.
7. **Mapas sin shortcuts de decisión.** No hay “solo con alertas” ni “guardar vista” ni “compartir enlace”; el calor no está ligado a acciones por zona.

---

## 7. Impacto de cada problema en la toma de decisiones

| Problema | Impacto en decisión |
|----------|----------------------|
| Jerarquía plana | El decisor no sabe por dónde empezar; pierde tiempo escaneando. |
| KPIs no accionables | Ve que “algo está mal” (ej. concentración de poder) pero no tiene un clic para ir a la lista/mapa; la decisión se retrasa. |
| Alertas sin cierre | Las alertas se silencian o se ignoran; no queda trazabilidad de “quién revisó qué”. |
| Sin “qué hacer hoy” | No hay priorización explícita; cada usuario interpreta solo por experiencia. |
| Sin meta ni tendencia | No se puede decidir “priorizar esto” con criterio objetivo. |
| Elementos decorativos | Ruido visual y expectativa frustrada (“simular” no hace nada). |
| Mapas sin shortcuts | Más clics y más tiempo para llegar a “las seccionales que me importan”. |

---

## 8. Recomendaciones de alto impacto (visual y funcional)

### Jerarquía y “primer vistazo”

- **Añadir un bloque “Estado del territorio”** arriba (debajo del hero): 1 línea con “X en riesgo · Y en atención · Z OK” y un CTA principal (ej. “Ver X en riesgo” → mapa filtrado). Que sea lo primero que se ve.
- **Elevar las alertas:** Mover el panel de alertas más arriba o sacar las críticas a un banner/sticky (“3 alertas críticas — Ver”), con estilo que destaque (borde/color) sobre el resto.
- **Hero con un número clave:** En Maestro, que el hero o la primera card destaque una sola métrica (ej. “Seccionales en riesgo: 5”) con link a mapa filtrado.

### KPIs que accionan

- **Hacer clicables los 5 indicadores clave:** Cada card debe tener al menos un link: “Ver en mapa”, “Ver lista” o “Ver detalle”. Ej.: “Concentración de Poder · ALERTA” → botón “Ver líderes” que lleve a ranking o mapa.
- **Métricas globales con link:** “Total votantes” → desglose o mapa; “Eventos hoy” → timeline o lista. Añadir variación (↑/↓) y, si hay meta, “X% del objetivo”.
- **Un solo “drill-down” consistente:** Al hacer clic en un KPI, aplicar el filtro en mapa + tabla y, si aplica, scroll suave al mapa o a la tabla.

### Alertas que cierran el ciclo

- **Acción desde la alerta:** Junto a “Ver en mapa” (ya existe vía setChartFilter), añadir “Marcar como revisada” (con fecha y opcionalmente usuario) o “Asignar a [nombre]”. Aunque sea mock, define el patrón.
- **Resumen de alertas en el hero o sticky:** “3 críticas, 2 atención” con link al panel de alertas filtrado.

### “Qué hacer hoy”

- **Card “Acciones prioritarias”** (o integrar en “Acciones por seccional”): Lista corta: “Contactar a X seccionales en riesgo”, “Y pendientes de dictamen”, “Z sin responsable en territorio”. Cada ítem con link directo (mapa, tabla, capacitación).
- **Número visible de “pendientes de dictamen”** en home/maestro con link a capacitación (en home ya existe; en maestro se puede repetir o enlazar desde indicadores).

### Mapas que deciden

- **Filtro rápido en mapa interactivo:** Chip o botón “Solo con alertas” / “Solo en riesgo” que aplique estadoFilter y, si existe, capa de alertas.
- **Leyenda del mapa de calor:** Texto breve (“Más oscuro = más validados” o similar) y, si es posible, clic en zona de calor que filtre seccionales en ese bounding box.
- **Guardar vista (futuro):** “Guardar vista actual” (filtros + centro/zoom) y “Compartir enlace” para alinear al equipo.

### Reducir ruido

- **Quitar o reemplazar “Simular escenario”** hasta que exista la función; si se deja, que sea un CTA deshabilitado con tooltip “Próximamente”.
- **Cobertura en territorio:** Si sigue siendo simulado, convertir al menos “Sin responsable” en lista con botón “Asignar” (aunque sea mock) para que el patrón sea accionable.
- **Oferta de valor:** Mantenerla en una sola sección colapsable o al final; no competir con métricas y alertas en la parte alta.

---

## 9. Priorización sugerida (orden de implementación)

1. **Estado del territorio + CTA** (arriba) y **alertas críticas destacadas** — impacto inmediato en “qué mirar primero”.
2. **KPIs clicables** (indicadores clave + métricas globales con link/tendencia) — cada número lleva a un siguiente paso.
3. **“Acciones prioritarias”** o refuerzo de “Acciones por seccional” con links directos — cierra la brecha entre “saber” y “hacer”.
4. **Acción en alertas** (marcar revisada / asignar) — cierre de ciclo y trazabilidad.
5. **Mapa: “Solo con alertas”** y leyenda de calor — menos clics para decidir por territorio.
6. **Metas y tendencias** en métricas — criterio objetivo para priorizar.

---

*Documento generado a partir de revisión del código y flujos del dashboard (maestro, home, componentes de mapa, alertas y KPIs).*
