# Design System SENTINEL360

**SENTINEL360** es el nombre del *design system* (tokens, componentes, reglas de color e interacción).  
**Territorio Command** es el nombre del *producto* que la interfaz muestra al usuario (dashboard, módulos, marca).

**Producto:** Software de control territorial, métricas, auditoría y poder institucional.  
**Objetivo:** Documento técnico único, accionable, que garantice coherencia visual y de interacción en toda la experiencia.  
**Sensación final:** Sala de control — todo comunica estado, nada es decorativo; el usuario tiene el control.

---

## 1. Principios rectores

| Principio | Definición | Implicación |
|-----------|------------|-------------|
| **Nada decorativo** | Cada elemento de UI tiene una función: informar estado, permitir acción o establecer jerarquía. No se usan colores, iconos ni animaciones “por estética”. | Revisar cada pantalla: si un color no comunica estado/riesgo/control, sustituir por neutral o eliminar. |
| **Color semántico** | Un solo significado por color en todo el producto. Verde = éxito/OK; ámbar = advertencia; rojo = riesgo/crítico; azul = control/acción; gris = neutral/dato. | No inventar nuevos significados; no usar rojo para “destacar” si no es riesgo. |
| **Jerarquía clara** | En 5 segundos el usuario debe saber: qué es lo más importante (estado del territorio, alertas críticas), qué es secundario (métricas de contexto) y qué es acción (CTAs, filtros). | Títulos, peso visual y orden de bloques siguen esta prioridad; el hero y el primer bloque responden a “¿qué debo hacer?”. |
| **Datos accionables** | Cada número o lista debe poder llevar a una acción: filtrar, ver en mapa, contactar, revisar. Los KPIs son clickeables; las tablas son centros de acción. | Evitar “solo lectura” sin CTA o sin relación con filtros/mapa. |
| **Transparencia y autoridad** | La auditoría y las alertas transmiten “todo queda registrado” y “nada pasa desapercibido”. La UI refuerza control institucional sin parecer agresiva. | Uso consistente de bordes de control, copy de confianza y presencia visual de auditoría y alertas. |

---

## 2. Sistema de color semántico

### 2.1 Paleta principal

| Rol | Token | Hex | Uso único |
|-----|--------|-----|-----------|
| **Control** | `semantic-control` | `#1E3A8A` | Navegación activa, CTAs principales, filtros activos, “yo tengo el control”. |
| **Éxito** | `semantic-success` | `#0D9488` | Dentro de rango, OK, completado, meta alcanzada, semáforo verde. |
| **Advertencia** | `semantic-warning` | `#B45309` | Revisar pronto, atención, no crítico, semáforo amarillo. |
| **Riesgo** | `semantic-danger` | `#B91C1C` | Actuar ya, crítico, alerta, semáforo rojo. |
| **Neutral** | `semantic-neutral` | `#475569` | Dato sin juicio, secundario, deshabilitado, ejes y leyendas. |

Regla: **un color = un significado en todo el producto.** No usar éxito para “cantidad” sin estado (usar neutral).

### 2.2 Paleta secundaria (fondos y bordes)

| Token | Hex | Uso |
|-------|-----|-----|
| `semantic-control-hover` | `#1E40AF` | Hover de botones/nav de control. |
| `semantic-success-bg` | `#CCFBF1` | Fondo de card/fila OK. |
| `semantic-success-border` | `#0D9488` | Borde indicador OK. |
| `semantic-warning-bg` | `#FEF3C7` | Fondo atención. |
| `semantic-warning-border` | `#B45309` | Borde atención. |
| `semantic-danger-bg` | `#FEE2E2` | Fondo crítico. |
| `semantic-danger-border` | `#B91C1C` | Borde crítico. |
| `semantic-neutral-bg` | `#F1F5F9` | Fondo zona neutra. |
| `semantic-neutral-border` | `#94A3B8` | Bordes neutros. |

### 2.3 Aplicación por contexto

- **KPIs:** Fondo y borde según estado (success/warning/danger/neutral); el número en el color del estado.
- **Mapas:** Puntos/círculos por seccional: verde = OK, ámbar = Atención, rojo = Crítico. Leyenda con los mismos tres.
- **Tablas:** Chip de estado con bg + texto + borde del mismo rol; fila seleccionada con borde izquierdo `semantic-control`.
- **Alertas:** Card con borde y fondo según nivel (danger/warning/neutral); icono y título del mismo color.
- **Botones primarios / nav activa:** `semantic-control`; hover `semantic-control-hover`.

### 2.4 Implementación

- Variables CSS en `:root` (`app/globals.css`) con prefijo `--semantic-*`.
- Tailwind: `colors.semantic.*` en `tailwind.config.ts` mapeando a esas variables.
- Clases: `text-semantic-success`, `bg-semantic-danger-bg`, `border-semantic-warning-border`, etc.

---

## 3. Tipografía

### 3.1 Familia

- **Principal:** Inter (o variable `--font-inter`) para UI y datos. Legible en tamaños pequeños y con números tabulares.
- **Fallback:** `system-ui, sans-serif`.

### 3.2 Escala (Tailwind por defecto, ajustar si se define escala custom)

| Uso | Clase | Tamaño aprox. | Peso | Ejemplo |
|-----|--------|----------------|------|---------|
| Título de página | `text-xl` / `text-2xl` | 20–24 px | `font-bold` | Estrategia territorial |
| Título de sección | `text-lg` | 18 px | `font-semibold` | Alertas, Registro de auditoría |
| Subtítulo / descripción | `text-sm` | 14 px | `font-medium` / `normal` | Copy de confianza, descripción de card |
| Cuerpo / tabla | `text-sm` | 14 px | `normal` | Celdas, mensajes |
| Auxiliar / leyenda | `text-xs` | 12 px | `font-medium` / `normal` | Chips, “Actualizado a las 14:32” |
| Número KPI primario | `text-2xl` / `text-3xl` | 24–30 px | `font-bold` | 78%, 35.720 |
| Número KPI secundario | `text-lg` | 18 px | `font-bold` | Eventos hoy |

### 3.3 Pesos

- **Bold (700):** Valores de KPI, títulos de página, etiquetas de alerta crítica.
- **Semibold (600):** Títulos de sección, botones, chips, cabeceras de tabla.
- **Medium (500):** Subtítulos, labels, texto de confianza.
- **Normal (400):** Cuerpo, celdas, descripciones.

### 3.4 Números

- Usar **tabular-nums** (`font-feature-settings` o clase) en columnas numéricas y KPIs para que no “salten” al cambiar dígitos.
- Formato local: `toLocaleString('es-PY')` para miles y decimales; porcentajes con 0–1 decimal según contexto.
- Unidades: junto al valor con espacio fino si hace falta (ej. “35 720”, “78 %”).

### 3.5 Contraste y accesibilidad

- Texto sobre fondo blanco: mínimo `#475569` (neutral) para cuerpo; títulos en `gray-900`.
- Texto sobre fondos semánticos (success-bg, danger-bg): usar el color sólido del rol (success, danger) para el texto, no gris.

---

## 4. Grid, spacing y layout

### 4.1 Contenedor principal

- **Max-width:** 1400 px (o 1440 px) centrado para dashboard.
- **Padding horizontal:** 16 px móvil, 24 px tablet/desktop (`px-4` / `px-6`).

### 4.2 Grid

- **Columnas:** 12 columnas en desktop; en móvil, bloques a ancho completo.
- **Gap entre cards/secciones:** 24 px (`gap-6`) o 32 px (`gap-8`) según densidad.
- **Cards en grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (o 4) para listas de KPIs o herramientas.

### 4.3 Espaciado (escala 4 px)

| Token | Valor | Uso |
|-------|--------|-----|
| `1` | 4 px | Separación entre icono y texto en botón. |
| `2` | 8 px | Padding interno pequeño (chip, badge). |
| `3` | 12 px | Padding de celda, espacio entre label y valor. |
| `4` | 16 px | Padding de card pequeño, gap en flex. |
| `5` | 20 px | Padding de card estándar. |
| `6` | 24 px | Separación entre secciones, gap de grid. |
| `8` | 32 px | Separación entre bloques mayores. |

### 4.4 Layout de página tipo “sala de control”

1. **Hero:** Título, subtítulo, línea de confianza, ámbito (ej. “Asunción · 45 seccionales”), “Actualizado HH:MM”, acciones (filtros, botones).
2. **Estado del territorio:** Un solo bloque con conteo Crítico / Atención / OK y CTA principal (“Ver X en riesgo en el mapa”).
3. **Alertas (si hay):** Banner y/o panel con prioridad visual alta.
4. **Contenido principal:** Mapas, KPIs, tablas, gráficos en orden de importancia; cada bloque con título y, si aplica, ayuda.
5. **Auditoría:** Registro visible, con borde de autoridad (control).

---

## 5. Componentes base

### 5.1 KPI (KPIActionCard)

- **Estructura:** Valor prominente + label + tendencia (opcional) + meta (opcional) + anillo de progreso (opcional) + CTA.
- **Estados:** success | warning | danger | neutral | control. Cada estado define bg, border, color del valor y del anillo.
- **Interacción:** Clic en la card ejecuta `onAction` (filtrar, scroll, navegar). Hover: ligera escala y sombra (`hover:scale-[1.02]`, `shadow-card-hover`). Active: `scale-[0.98]`.
- **Jerarquía:** `primary=true` para KPIs principales (valor más grande, más padding). Secundarios más compactos.
- **Indicador “en vivo”:** Punto pulsante (animación `kpi-glow-pulse`) cuando los datos se actualizan automáticamente.

### 5.2 Botones

- **Primario (control):** `bg-semantic-control` (o gradiente de marca), texto blanco, hover más oscuro. Altura mínima 44–56 px en touch.
- **Secundario / outline:** Borde `semantic-control`, texto control; hover relleno control.
- **Semánticos (estado):** Solo si la acción está ligada al estado (ej. “Resolver alerta” en rojo). Por defecto, primario = control.
- **Microinteracción:** Transición 200 ms; hover scale opcional; focus ring visible (accesibilidad).

### 5.3 Tablas

- **Contenedor:** Borde suave, `rounded-xl`, scroll horizontal si hace falta; cabecera sticky.
- **Cabecera:** Fondo gris claro (`bg-gray-50`), texto `font-semibold`, alineación según tipo (numérica a la derecha).
- **Fila:** Borde inferior fino; hover `bg-semantic-control/5`; fila seleccionada `border-l-4 border-l-semantic-control` + `bg-semantic-control/10`.
- **Chips de estado:** `rounded-full`, `text-xs font-semibold`, bg + border + text del rol (success/warning/danger).
- **Acciones por fila:** Columna “Acciones” con botones (Ver en mapa, WhatsApp); `stopPropagation` para no disparar selección de fila.
- **Orden y filtro:** Clic en cabecera = ordenar; filtros rápidos por chips encima de la tabla.

### 5.4 Mapas

- **Puntos por seccional:** Círculo con número (validados); color del borde/relleno = estado (success/warning/danger).
- **Leyenda:** Mismos tres colores + etiquetas “OK”, “Atención”, “Crítico”. Sin añadir significados nuevos al color.
- **Capas temáticas:** Activar/desactivar por chips; si la capa indica “estado”, usar la misma semántica; si es “dato” (ej. calor), usar escala o azul/gris para no confundir con semáforo.
- **Panel de detalle:** Al clic en punto, panel lateral o popover con KPIs locales, contacto (WhatsApp) y alertas activas; estilo consistente con cards (borde, padding).

### 5.5 Alertas

- **Card por alerta:** Borde izquierdo grueso (`border-l-4`) del color del nivel; fondo suave del mismo rol; icono y título en color sólido.
- **Estructura:** Nivel (chip) + tipo + entidad + mensaje + Causa + Consecuencia (opcional) + “→ Acción” + acciones (Marcar revisada, Asignar).
- **Banner superior:** Si hay críticas o atención, banner con fondo/borde danger o warning; clic = scroll al panel de alertas.
- **Filtros:** Chips por nivel (Todos, Crítico, Atención, Info) con color semántico al activar.

### 5.6 Auditoría

- **Contenedor:** Borde de autoridad (`border-l-4 border-l-semantic-control`), título “Registro de auditoría”, subtítulo “Todo queda registrado”.
- **Timeline:** Línea vertical + eventos con punto de color por tipo (CREACION=success, ACTUALIZACION/EXPORTACION=control, etc.).
- **Indicador “En vivo”:** Punto pulsante + texto “En vivo” o “Actualizado hace X s”.
- **Filtros rápidos:** Chips por tipo de evento, no dropdown.

---

## 6. Reglas de interacción y microinteracciones

### 6.1 Filtrado cruzado

- Clic en gráfico (segmento, barra, fila, punto) → `setChartFilter`; mapa, tablas y otros gráficos reaccionan.
- Doble clic en el mismo elemento → restablecer filtro.
- El gráfico o tabla que originó el filtro muestra estado activo (anillo o borde `semantic-control`).

### 6.2 Feedback inmediato

- **Hover:** Transición 200 ms; cambio de fondo o escala ligera; no retrasar tooltips.
- **Clic:** Si la acción es asíncrona, mostrar estado de carga (spinner, disabled) hasta respuesta.
- **Selección de fila/filtro:** Resaltar con borde o fondo en el mismo frame (sin esperar red).

### 6.3 Animaciones funcionales

- **Entrada de gráficos:** Animación de valor/dibujo (ej. Recharts `animationDuration={400}`).
- **KPI “en vivo”:** Punto pulsante suave (keyframes `kpi-glow-pulse`) para indicar datos en tiempo real.
- **No animar:** Cambios de tema, redimensionado de ventana (opcional), ni animaciones que no aporten información.

### 6.4 Accesibilidad

- Focus visible en todos los controles (focus ring con color control o neutro).
- Contraste mínimo AA (4,5:1 texto normal; 3:1 texto grande).
- Labels y aria-labels en iconos y botones; cabeceras de tabla con scope.

---

## 7. Sensación final: “sala de control”

El sistema debe transmitir:

- **Control:** La navegación y los CTAs en azul (control); el usuario sabe que puede filtrar, ver en mapa y actuar.
- **Visibilidad:** Estado del territorio y alertas tienen presencia alta; no se esconden en pestañas o al final del scroll.
- **Transparencia:** Auditoría visible con copy “Todo queda registrado”; indicadores “En vivo” y “Actualizado a las HH:MM”.
- **Prioridad:** Orden por impacto (crítico primero en tablas y alertas); números y colores que responden a “¿está bien o mal?” en segundos.
- **Seriedad:** Sin elementos infantiles o puramente decorativos; tipografía clara, espaciado generoso y bordes definidos.

Checklist de revisión por pantalla:

- [ ] ¿Cada color tiene un significado semántico?
- [ ] ¿El primer vistazo responde a “¿qué debo hacer?” o “¿qué está mal?”?
- [ ] ¿Los KPIs y tablas llevan a una acción (filtrar, mapa, contacto)?
- [ ] ¿Hay indicador de actualización o “en vivo” donde corresponda?
- [ ] ¿La auditoría o las alertas tienen presencia imposible de ignorar cuando aplica?

---

## 8. Resumen de tokens y archivos

| Área | Dónde | Notas |
|------|--------|--------|
| Colores semánticos | `app/globals.css` (`:root`), `tailwind.config.ts` | Variables `--semantic-*`; clases `semantic-*`. |
| Tipografía | `tailwind.config.ts` (fontFamily), clases `text-*`, `font-*` | Inter; escala por defecto Tailwind. |
| Espaciado | Clases Tailwind `p-*`, `gap-*`, `space-*` | Escala 4 px. |
| Sombras | `tailwind.config.ts` (boxShadow: card, card-hover, card-active) | Cards y hover. |
| Botones | `app/globals.css` (`.btn-yapo-*`) y componentes | Altura mínima 56 px; gradientes de marca. |
| KPI | `components/dashboard/KPIActionCard.tsx` | Estados y estilos en STATE_STYLES. |
| Animaciones | `app/globals.css` (kpi-glow-pulse, kpi-ring-draw) | Indicadores en vivo. |

Este documento es la referencia única para diseño e implementación de SENTINEL360. Cualquier desvío (nuevo color sin significado, elemento decorativo) debe justificarse y, si se adopta, actualizar este design system.
