# Auditoría UX – PTIL YAPÓ
## Framework: 7 Leyes de Silicon Valley + Matriz de Fricción

**Fecha:** 2026  
**Alcance:** Landing, registro de suscriptor, verificación de estado, dashboard operador, dashboard resumen, flujos staff.

---

## 1. RESUMEN EJECUTIVO

- **Estado general:** **Bueno, con fricciones críticas en registro y oportunidades claras de mejora.** La jerarquía visual, la coherencia de marca (YAPÓ) y el carnet certificado están bien resueltos. El formulario de inscripción es largo y el mensaje “qué pasa después” (validador vs. validación automática) no está explícito.

- **3 problemas críticos identificados:**
  1. **Formulario de inscripción con demasiados campos** repartidos en 3 pasos (identidad, oficio/selfie/GPS, respaldo político). Riesgo alto de abandono según ley de Bezos (campos mínimos 3–5).
  2. **Botones por debajo de 48px de altura** en varias pantallas (40px, 44px) en dashboard operador y otros; en mobile incumplen área táctil mínima recomendada.
  3. **Falta de mensaje pre-submit** que explique al usuario si se le asignará un Operador YAPÓ o si pasará a validación automática (certificación/parámetros). Aumenta incertidumbre y abandono.

- **3 quick wins (bajo esfuerzo, alto impacto):**
  1. Añadir un **bloque de 2–3 líneas** antes del botón “Enviar registro” que diga: “Si tenés certificación y cumplís los parámetros, tu inscripción se valida automáticamente. Si no, un Operador YAPÓ de tu zona te contactará para la verificación.”
  2. **Subir altura mínima de botones** a 48px en todo el producto (clase global o variante `.btn-yapo-touch`) y aplicarla en operador y verificar.
  3. **Celebración post-registro:** al mostrar el código de verificación, añadir un breve mensaje de éxito tipo “¡Listo! Guardá este código” + icono/animación sutil (check grande o confetti discreto) para reforzar recompensa (dopamina).

---

## 2. SCORECARD UX (0–100)

| Dimensión            | Puntuación | Comentario breve |
|----------------------|------------|-------------------|
| **Usabilidad**       | 18/25      | Flujos claros (3 caminos, 3 pasos), pero formulario largo; falta mensaje “qué pasa después”; verificar sin sugerencias. |
| **Performance**      | 20/25      | Next.js, SWR, imágenes con Next/Image; no se observan skeletons en listas; LCP depende de hero + imágenes. |
| **Diseño visual**    | 20/25      | Buena jerarquía, paleta YAPÓ consistente, carnet legible; algunos botones pequeños y contraste en textos secundarios mejorable. |
| **Psicología/Engagement** | 16/25 | Hay feedback (toast, steps, estados loading); poca recompensa variable y poca sensación de “logro” al completar registro; notificaciones operador bien planteadas. |
| **TOTAL**            | **74/100** | Bueno. Priorizar reducción de fricción en registro y refuerzo de recompensa e información pre-submit. |

---

## 3. MATRIZ DE PRIORIDADES

| Prioridad | Problema | Solución | Esfuerzo | Impacto | Owner |
|-----------|----------|----------|----------|----------|--------|
| **P0** | Formulario con muchos campos obligatorios (pasos 1–3) aumenta abandono | Reducir obligatorios al mínimo (nombre, cédula, WhatsApp, oficio, selfie, GPS); mover resto a “opcional” o paso posterior; considerar autocompletado (navegador/datos guardados) | Alto | Crítico | Producto + Dev |
| **P0** | Botones &lt;48px en mobile (operador, verificar, maestro) | Definir `.btn-yapo-touch { min-height: 48px }` y aplicarla en CTAs secundarios y terciarios; auditar todos los `min-h-[40px]` y `min-h-[44px]` | Bajo | Alto (accesibilidad + conversión) | Dev |
| **P0** | Usuario no sabe si tendrá validador o validación automática | Añadir texto fijo antes de “Enviar registro”: 1–2 frases explicando “con certificación → validación automática; sin certificación → Operador YAPÓ de tu zona” | Bajo | Alto | Producto + Copy |
| **P1** | Poca sensación de recompensa al completar registro | Refuerzo visual al éxito: mensaje “¡Inscripción enviada!” + icono grande o animación sutil; opcional: “Descargar comprobante” o “Consultar estado” directo | Medio | Alto | Dev |
| **P1** | Verificar: solo input manual de código, sin sugerencias | Mantener input; añadir texto de ayuda (“Lo encontrás en el mensaje que te enviamos”) y, si hay historial reciente en el dispositivo, “Códigos recientes” (localStorage) | Medio | Medio | Dev |
| **P1** | Sin skeleton/loading en listas del dashboard | Añadir skeleton cards o filas en dashboard resumen y operador mientras SWR carga (evitar “salto” de contenido) | Medio | Medio | Dev |
| **P2** | Breadcrumbs en flujos profundos (ej. operador → mapa) | Añadir breadcrumb “Dashboard > Operador > Mapa” en layout o en la página del mapa | Bajo | Medio | Dev |
| **P2** | ~~Contraste en textos secundarios (grises)~~ | **Hecho:** textos secundarios pasados a `text-gray-600`/`text-gray-700`; clase `.text-readable-muted` en globals.css; pre-submit y celebración con copy afinado. | — | — | — |
| **P2** | Sin “Consultar estado” destacado en landing | Añadir en Header o Hero un CTA secundario “Consultar mi estado” que lleve a `/verificar` | Bajo | Medio | Dev |

---

## 4. AUDITORÍA POR LAS 7 LEYES

### 1️⃣ Economía del esfuerzo (Ley de Bezos)

| Criterio | Estado | Nota |
|----------|--------|------|
| Clics para acción principal (inscribirse) | ⚠️ | 1 clic a “Registrarme” pero luego 3 pasos y muchos campos |
| Autocompletado en formularios | ❌ | No hay autocompletado explícito (sí navegador en inputs estándar) |
| Campos obligatorios mínimos (3–5) | ❌ | Muchos obligatorios: nombre, cédula, WhatsApp, oficio, selfie, GPS, gestor, cargo, seccional; en operador además cédula operador |
| One-click para tareas frecuentes | ⚠️ | Operador tiene “Tomar Verificación” en un clic; registro no |
| Niveles de profundidad &lt;3 | ✅ | Home → Registro (modal); Dashboard → 1 nivel (operador, maestro, etc.) |
| Atajos de teclado | ❌ | No ofrecidos |
| Onboarding &lt;60 s | ❌ | Registro completo lleva varios minutos |

**Recomendación:** Reducir obligatorios a “identidad + contacto + oficio + selfie + GPS” y mover “respaldo político” (gestor, seccional, cargo) a opcional o a un solo bloque con valores por defecto.

---

### 2️⃣ Diseño predictivo y personalización

| Criterio | Estado | Nota |
|----------|--------|------|
| “Recomendado para ti” | ❌ | No aplica en producto actual |
| Contenido por hora/ubicación | ⚠️ | Operador ve alertas por seccional (geofencing); no hay adaptación por hora |
| Filtros en tiempo real | ✅ | Dashboards con SWR y filtros sin recarga completa |
| Suggested searches | ❌ | Verificar: solo input de código |
| Sistema aprende de interacción | ❌ | No hay personalización por uso |
| Notificaciones predictivas | ⚠️ | Operador tiene notificaciones de alertas; no hay push/email configurado en auditoría |

**Recomendación:** En `/verificar`, si el usuario ya consultó antes, mostrar “Último código: XXX” (localStorage) como atajo.

---

### 3️⃣ Familiaridad y patrones (Jakob Nielsen)

| Criterio | Estado | Nota |
|----------|--------|------|
| Iconos convencionales | ✅ | Lucide: lupa, usuario, mapa, campana, etc. |
| Nav principal estándar | ✅ | Header top; dashboard con nav horizontal |
| Botones de acción consistentes | ✅ | `.btn-yapo-primary` para principal; outline para secundario |
| Logo → home | ✅ | Logo YAPÓ en hero; en dashboard link a /dashboard |
| Formularios orden lógico | ✅ | Nombre → cédula → contacto → oficio → respaldo |
| Breadcrumbs en profundidad | ❌ | Falta en operador/mapa y en pasos del registro |

**Recomendación:** Añadir breadcrumb en páginas de segundo nivel (ej. Operador > Mapa).

---

### 4️⃣ Generación de dopamina (recompensa)

| Criterio | Estado | Nota |
|----------|--------|------|
| Micro-animaciones en éxito | ⚠️ | Hay transiciones (hover, scale); no hay confetti ni checkmark grande al enviar registro |
| Streaks/rachas | ❌ | No aplica |
| FOMO en notificaciones | ⚠️ | Operador ve “Tiempo para tomar” (countdown); se puede reforzar |
| Pull-to-refresh | ❌ | No implementado en listas |
| Celebración en logros | ⚠️ | Carnet “YAPÓ Certificado” en verificar está bien; falta refuerzo al completar registro |
| Progreso con barras/círculos | ✅ | Stepper de 3 pasos en registro |
| Social proof en tiempo real | ❌ | No hay “X personas se inscribieron hoy” |

**Recomendación:** Tras “Inscripción guardada”, mostrar mensaje destacado + icono de éxito grande (o animación breve) y opción “Consultar estado ahora” con link a `/verificar?codigo=XXX`.

---

### 5️⃣ Jerarquía visual y atención (Fitts + Gestalt)

| Criterio | Estado | Nota |
|----------|--------|------|
| CTA principal contraste ≥4.5:1 | ✅ | Botones primarios azul oscuro sobre blanco |
| Elementos importantes 1.5x mayores | ⚠️ | Títulos claros; algunos botones pequeños (40–44px) |
| White space en elementos clave | ✅ | Espaciado consistente en cards y secciones |
| Paleta 3–4 colores | ✅ | Azul, naranja, gris, verde/rojo para estados |
| Tipografía 2 familias | ✅ | Sistema por defecto (sans) |
| CTA identificable en &lt;2 s | ✅ | “Registrarme ahora” y “Acceso Staff” visibles |

**Recomendación:** Unificar altura mínima de botones a 48px y revisar contraste de textos grises (WCAG AA).

---

### 6️⃣ Microinteracciones y feedback (Doherty)

| Criterio | Estado | Nota |
|----------|--------|------|
| Estados de botón (hover, active, loading) | ✅ | Hover/active en mayoría; loading en submit y acciones async |
| Transiciones 200–400 ms | ✅ | `duration-200` en Tailwind |
| Skeleton screens | ❌ | No en listas/cards; solo “Cargando…” en mapa operador |
| Errores inline | ✅ | Mensajes bajo inputs y banner en registro |
| Validación en tiempo real | ⚠️ | WhatsApp con validación; no todos los campos |
| Toast para éxito | ✅ | useToast en registro |
| Loading atractivo | ⚠️ | Texto “Procesando…”; podría añadirse spinner o skeleton en botón |

**Recomendación:** Añadir skeletons en dashboard (cards de KPI y listas) y, en submit, spinner o estado “Enviando…” más visible en el botón.

---

### 7️⃣ Psicología de hábitos (Hook Model)

| Criterio | Estado | Nota |
|----------|--------|------|
| Triggers externos | ⚠️ | Operador tiene notificaciones; no hay email/push al suscriptor post-registro (solo mensaje en pantalla) |
| Acción &lt; beneficio percibido | ⚠️ | Registro es costoso en esfuerzo; beneficio (carnet, estado) está claro pero lejano |
| Recompensas variables | ❌ | Recompensa es fija (código + estado) |
| Inversión del usuario | ✅ | Datos personales y selfie mejoran trazabilidad y valor del carnet |
| Ciclo &lt;2 min | ❌ | Registro completo &gt;2 min |
| Investment loops | ⚠️ | Consultar estado con código es un segundo uso; podría incentivarse “Guardar código” o “Añadir a pantalla de inicio” |

**Recomendación:** Reducir pasos/campos para acercar “acción &lt; beneficio” y añadir después del registro CTA “Consultar estado” + “Descargar comprobante” (si aplica) para cerrar el ciclo.

---

## 5. MATRIZ DE FRICCIÓN (RESUMEN)

- **🔴 Crítico:** Formulario largo; botones &lt;48px; falta mensaje “validador vs. automático”.
- **🟠 Alto:** Poca celebración post-registro; verificar sin ayuda/sugerencias; sin skeleton en dashboards.
- **🟡 Medio:** Breadcrumbs; contraste textos secundarios; CTA “Consultar estado” no destacado en landing.
- **🟢 Backlog:** Dark mode, PWA, voice search.

---

## 6. RECOMENDACIONES DE IMPLEMENTACIÓN (PRIORIZADAS)

### P0 – Implementar ya

1. **Texto pre-submit en registro**  
   En `RegisterForm.tsx`, encima del botón “Enviar registro” (step 3), añadir un bloque de 2–3 líneas:  
   *“Si tenés certificación (SNPP/SINAFOCAL, etc.) y cumplís los parámetros, tu inscripción puede validarse automáticamente. Si no, un Operador YAPÓ de tu zona te contactará para coordinar la verificación.”*

2. **Botones mínimos 48px**  
   - En `globals.css` o en componentes: asegurar que todos los botones de acción tengan `min-h-[48px]` (o clase `btn-yapo` ya cumple 56px; revisar variantes `min-h-[40px]` y `min-h-[44px]` en operador, verificar, maestro).  
   - Reemplazar por `min-h-[48px]` o por la clase estándar de botón.

3. **Reducir campos obligatorios**  
   - Producto: definir con negocio el mínimo (ej. nombre, cédula, WhatsApp, oficio, selfie, GPS).  
   - Marcar como opcionales: email, redes, años experiencia, situación, seguro social; o mover “respaldo político” a un solo paso con defaults.  
   - Implementar en `RegisterForm` y en API/validación backend.

### P1 – Esta semana / próximo sprint

4. **Celebración post-registro**  
   Tras `setSubmitSuccess(true)`, mostrar un bloque con icono de check grande (o animación breve), mensaje “¡Inscripción enviada!” y botón o link “Consultar estado” que abra `/verificar` (opcionalmente con código en query).

5. **Skeletons en dashboard**  
   En dashboard resumen y en operador, mientras `!data` de SWR, mostrar cards o filas con `animate-pulse` y estructura similar al contenido final.

6. **Verificar: ayuda y “último código”**  
   En `/verificar`, añadir bajo el input: “El código está en el mensaje que te enviamos al inscribirte.” Si en `localStorage` hay `ultimo_codigo_verificar`, mostrar “Última consulta: [codigo]” como link para reconsultar.

### P2 – Backlog

7. Breadcrumbs en layout o en páginas de segundo nivel.  
8. Revisión de contraste (WCAG AA) en textos grises.  
9. CTA “Consultar mi estado” en Header o Hero (link a `/verificar`).

---

## 7. BENCHMARKS (REFERENCIAL)

- **Portales de empleo / formación (SNPP, SINAFOCAL, portales similares):** suelen tener formularios largos pero con progreso claro y mensaje de “qué sigue”. PTIL puede diferenciarse con menos campos obligatorios y mensaje explícito de “validador vs. automático”.
- **Apps de verificación de identidad (e.g. bancos):** flujos muy guiados, pasos cortos y feedback inmediato (check, siguiente paso). Incorporar más feedback por paso en el registro refuerza confianza.
- **Marketplaces (Uber, Rappi):** onboarding corto y “empezá ya”; PTIL no puede ser tan corto por normativa, pero puede acercarse reduciendo obligatorios y haciendo el primer “logro” (código + carnet) muy visible.

---

## 8. CRITERIO DE CONTRASTE (WCAG) – DOCUMENTACIÓN PARA FUTUROS TEXTOS

Para mantener accesibilidad y cumplir **WCAG 2.1 nivel AA** en textos sobre fondos claros:

### Regla aplicada en PTIL

- **Texto normal (cuerpo, descripciones, etiquetas secundarias):** contraste mínimo **4.5:1** respecto al fondo.
- **Texto grande** (≥ 18px normal o ≥ 14px en negrita): contraste mínimo **3:1**.

### Clases Tailwind recomendadas

| Uso | Clase | Nota |
|-----|--------|------|
| Texto principal (títulos, nombres) | `text-gray-900` | Máximo contraste. |
| Texto secundario legible (descripciones, ayudas) | `text-gray-700` o `text-gray-600` | Cumple ≥ 4.5:1 sobre blanco/gris muy claro. |
| Texto auxiliar (metadatos, “opcional”) | `text-gray-600` | Preferir sobre `text-gray-500` en contenido que deba leerse. |
| **Evitar** en texto que deba leerse | `text-gray-400`, `text-gray-500` | En blanco/gris claro suelen quedar por debajo de 4.5:1. |
| Decorativo / separadores | `text-gray-400` o `text-gray-500` | Solo si el contenido no es necesario para entender la interfaz (ej. “/” en breadcrumb). |

### Clase global en el proyecto

- **`.text-readable-muted`** (en `app/globals.css`): alias de `text-gray-600` para texto secundario que debe ser legible. Usar esta clase cuando el propósito sea “texto de apoyo con buen contraste”.

### Pantallas ya revisadas

- Landing (Header, Hero), Registro (RegisterForm), Verificar, Dashboard resumen, Dashboard layout (breadcrumb, byline), PageHero, **Operador** (lista de notificaciones, dictámenes, historial, billetera), **Operador > Mapa**, **Maestro** (estado del territorio, descripciones de mapas).

### Checklist para nuevas pantallas o componentes

1. Ningún párrafo o etiqueta importante usa `text-gray-400` o `text-gray-500` sobre fondo blanco o `#F8FAFC`/`#F3F4F6`.
2. Textos sobre fondos de color (blue-50, green-50, amber-50) usan tonos oscuros del mismo color (ej. `text-blue-900`, `text-green-800`) o `text-gray-700`/`text-gray-800`.
3. Iconos decorativos que no transmiten información crítica tienen `aria-hidden`.

---

*Documento generado a partir del framework de auditoría UX (7 Leyes de Silicon Valley) aplicado al código y flujos de PTIL YAPÓ.*
