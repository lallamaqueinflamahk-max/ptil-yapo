# Mapa como motor del dashboard — Arquitectura UX

El mapa **controla** KPIs, gráficos y tablas. No es un visor: es el lugar donde se decide **dónde actuar** y **por qué**.

---

## 1. Principio rector

**El mapa explica dónde actuar y por qué.**

- Cada interacción en el mapa (clic, filtro de estado, capa, zoom) debe tener **repercusión** en el resto del dashboard.
- Las métricas y tablas deben poder **filtrarse por lo que el mapa muestra** (vista actual, seccional elegida, zona).
- El mapa debe **reaccionar** a filtros globales (KPI, ranking, estado) para mantener una sola fuente de verdad visual.

---

## 2. Interacciones clave

| Interacción | Comportamiento | Efecto en el dashboard |
|-------------|----------------|-------------------------|
| **Hover** sobre seccional | Tooltip con nombre, barrio, titular, validados, estado (semáforo). Sin cambiar filtros. | Ninguno. Solo preview. |
| **Clic** en seccional | Zoom a la seccional, panel lateral con KPIs locales, evolución y contacto. **Filtro global:** `chartFilter = { type: "seccional", value, label }`. | Tablas y gráficos se filtran por esa seccional; KPIs secundarios pueden mostrar "en seccional X". |
| **Clic** en "Estado" (OK / Atención / Crítico) | Filtro local del mapa: solo se muestran seccionales de ese estado. **Opcional:** elevar a filtro global para que KPIs y tabla reflejen "solo en riesgo". | Si se sincroniza con contexto: tabla y KPIs muestran solo ese estado. |
| **Clic** en capa (Leales, Riesgo, etc.) | Activa/desactiva la capa de puntos (suscriptores/dirigentes) sobre el mapa. No cambia filtro de seccionales. | Ninguno en métricas; el mapa muestra u oculta esa dimensión. |
| **Zoom in/out** | Cambia nivel de zoom. Por nivel: agregación o detalle (ver §4). | Si hay **vista como zona**: KPIs/tabla pueden filtrar por "seccionales en vista actual". |
| **Pan (arrastrar)** | Cambia el viewport. | Igual que zoom: si está activo "filtrar por vista", la lista y KPIs reflejan lo visible. |
| **Cerrar panel** (seccional) | `onSeccionalSelect(null)` → `resetChartFilter()`. | Dashboard vuelve a vista global. |

---

## 3. Capas semánticas activables

Las capas son **semánticas**: cada una responde una pregunta.

| Capa | Pregunta | Qué muestra | Color semántico |
|------|----------|-------------|-----------------|
| **Leales** | ¿Dónde hay adherentes leales? | Puntos (personas/agregados) | Éxito (verde) |
| **Riesgo** | ¿Dónde hay población en riesgo? | Puntos | Riesgo (rojo) |
| **Capacitación** | ¿Dónde hay demanda de capacitación? | Puntos | Advertencia (ámbar) |
| **Dirigentes** | ¿Dónde están los referentes? | Puntos | Control (azul/violeta) |
| **Verificación** | ¿Dónde hay pendientes de verificación? | Puntos (no verificados) | Advertencia (ámbar) |
| **Estado (OK / Atención / Crítico)** | ¿Qué seccionales requieren acción? | Filtro sobre seccionales (círculos con número) | Semáforo (verde / amarillo / rojo) |

**Regla:** Las capas no son decorativas. Si una capa está activa, el usuario puede **tomar una decisión** con esa información (ej. "ir a capacitar ahí", "contactar al dirigente").

---

## 4. Comportamiento por nivel de zoom

| Nivel (ej. Leaflet zoom) | Comportamiento | Qué muestra |
|--------------------------|----------------|-------------|
| **10–11** (ciudad) | Vista de conjunto. Seccionales como puntos con número (validados). Opcional: **zonas de influencia** (polígonos suavizados) con color por estado. | Dónde están los focos de riesgo/éxito en la ciudad. |
| **12–14** (barrios) | Puntos de seccionales más claros; capas de personas (leales, riesgo, etc.) visibles. Tooltip al hover. | Detalle por barrio; clic abre panel seccional. |
| **15+** (calle) | Máximo detalle. Puntos de capas (dirigentes, suscriptores) individuales si hay datos. | Acción muy local: contacto, visita. |

**Vista como zona:** En zoom 10–12, el **viewport** (bounds actuales) puede considerarse "zona seleccionada". Si el dashboard tiene "filtrar por vista del mapa", las tablas y KPIs muestran solo seccionales que intersectan ese viewport. Así el mapa **controla** qué métricas se ven.

---

## 5. Zonas de influencia (no solo puntos)

**Objetivo:** Que el mapa muestre **áreas** de influencia, no solo puntos sueltos.

- **Zona por seccional:** Cada seccional puede tener un polígono (o buffer alrededor del punto) que represente su "área de influencia". Color del polígono = estado (OK / Atención / Crítico). Así se ve **dónde** hay problema, no solo un círculo.
- **Zona agregada:** Agrupaciones (ej. "Norte", "Centro") como polígonos con métrica agregada (ej. total validados, % riesgo). Útil en zoom bajo.
- **Implementación:** Requiere datos geo (GeoJSON por seccional o por zona). Mientras tanto, el **viewport** (bounds) puede usarse como proxy: "seccionales en vista" = zona actual.

---

## 6. Evolución temporal en el mapa

**Objetivo:** Ver **cómo cambia** el territorio en el tiempo.

- **Slider o selector de fecha:** "Ver mapa en: Hoy | Hace 7 días | Hace 30 días". El mapa muestra estado/capas de esa fecha (o diferencia).
- **Capa "Evolución":** Color por variación (ej. verde = mejoró, rojo = empeoró, gris = sin cambio) en los últimos N días.
- **Tooltip con sparkline:** En el panel de seccional o en tooltip, minigráfico de evolución (validados, leales, etc.) en el tiempo.

La **línea de tiempo** del dashboard (30/60/90 días) puede ser la misma que alimenta esta capa, para que mapa y gráficos compartan el mismo rango.

---

## 7. Relación mapa ↔ métricas

### El mapa controla al dashboard

| Acción en el mapa | Efecto en KPIs / tablas / gráficos |
|-------------------|-------------------------------------|
| Clic en seccional | Filtro global por seccional: tabla resalta fila, gráficos pueden filtrar por esa seccional si aplica. |
| Filtro "Estado" (Crítico/Atención) | Si está sincronizado con contexto: solo seccionales en ese estado; KPIs "Seccionales en riesgo" y tabla reflejan el mismo conjunto. |
| Vista (bounds) como zona | Opcional: KPIs muestran "en vista actual: X seccionales, Y validados"; tabla solo filas en vista. |

### El dashboard controla al mapa

| Filtro global (KPI, ranking, estado) | Efecto en el mapa |
|-------------------------------------|-------------------|
| `chartFilter = { type: "ranking", value: "Sosa" }` | Mapa recibe `selectedRanking`; puede resaltar o filtrar seccionales asociadas a ese líder. |
| `chartFilter = { type: "seccional", value: "12" }` | Mapa recibe `selectedNumero`; centra y abre panel de esa seccional. |
| "Solo seccionales en riesgo" (soloRiesgo) | Mapa recibe solo seccionales rojas/amarillas; las dibuja; filtro Estado puede pre-seleccionarse. |
| `timeRangeDays` (30/60/90) | Si el mapa tiene capa de evolución, usa ese rango para colorear variación. |

**Fuente de verdad:** El **contexto** (chartFilter, timeRangeDays, y opcionalmente mapViewState) es la fuente de verdad. El mapa es **consumidor** de filtros y **productor** de filtros (al hacer clic en seccional o, en el futuro, al elegir "filtrar por vista").

---

## 8. Resumen: el mapa como motor

1. **Controla:** Clic en seccional → filtro global → tabla y gráficos reaccionan.
2. **Capas semánticas:** Cada capa responde una pregunta; activar/desactivar sin decoración.
3. **Reacciona a filtros globales:** Recibe ranking, seccional seleccionada, soloRiesgo, y opcionalmente bounds.
4. **Evolución temporal:** Misma ventana de tiempo que el dashboard; capa o tooltip con evolución (futuro).
5. **Zonas de influencia:** Polígonos por seccional o agregados; mientras tanto, "seccionales en vista" como zona.

Con esto, el mapa explica **dónde** actuar (seccional o zona) y **por qué** (estado, capas, evolución), y el resto del dashboard refleja esa decisión.

---

## 9. Implementación actual (referencia)

- **Contexto (`DashboardChartContext`):** `mapViewState: { bounds, zoom } | null` y `setMapViewState`. El mapa actualiza la vista en cada `moveend`; el dashboard puede filtrar por "en vista".
- **Mapa (`MapaInteractivoAvanzado`):** Prop `onMapViewChange(bounds, zoom)` llamada al mover/zoom; en maestro se conecta a `setMapViewState`.
- **Maestro:** Muestra "En vista actual: X seccionales" cuando hay `mapViewState`, calculando cuántas seccionales caen dentro de los bounds. Clic en seccional sigue enviando `setChartFilter({ type: "seccional", ... })` para que tabla y KPIs reaccionen.
- **Próximos pasos:** Filtrar tabla por seccionales en vista cuando el usuario active "Solo vista del mapa"; zonas de influencia (polígonos); capa de evolución temporal.
