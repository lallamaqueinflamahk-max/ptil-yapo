# Auditoría estratégica del sistema diseñado

**Alcance:** Dashboard (maestro, pro, operador, capacitación), alertas, auditoría, tablas, mapas, KPIs y documentación UX/Producto.  
**Preguntas:** Valor real, control del poder, infalsificabilidad, vendibilidad, escalabilidad país.  
**Salida:** Mejoras finales priorizadas.

---

## 1. ¿Dónde genera valor real?

| Área | Valor real | Evidencia en el diseño |
|------|------------|------------------------|
| **Un solo lugar para decidir** | La dirección ve territorio, riesgo, contacto y tendencia sin cambiar de herramienta. | Mapa + tablas + gráficos conectados por `chartFilter`; clic en gráfico/tabla filtra mapa y KPIs. |
| **Priorización por impacto** | "Qué atender primero" en segundos, no por orden alfabético. | Tablas ordenadas por estado (Crítico → Atención → OK) y por validados; chips semánticos; KPIs con estado y acción. |
| **Contacto directo** | Reducir fricción entre ver un problema y actuar. | WhatsApp por seccional, dirigente y operador desde el dashboard; botón "Ver en mapa" + scroll. |
| **Alertas accionables** | Cada alerta explica causa, consecuencia y acción; no es ruido. | Panel con porQué, consecuencia (opcional), accionSugerida; clic en alerta filtra mapa/KPIs; "Ver en mapa". |
| **Auditoría visible** | Refuerza que las acciones quedan registradas y alimentan indicadores. | Timeline vivo por tipo de evento; enlace "alimenta indicadores y alertas"; KPI "Eventos hoy" → auditoría. |
| **Operador en territorio** | Tomar verificación y dar dictamen desde el celular, con alertas por zona. | Vista operador con alertas por cédula/seccional, "Tomar verificación", dictamen; geofencing (mock). |
| **Idoneidad y trazabilidad** | Derivaciones y certificaciones para cumplimiento normativo (SNPP/SINAFOCAL). | Módulo capacitación; embudo con "Derivar Capacitación" y "Ver listado"; copy de trazabilidad. |

**Limitaciones actuales:** Muchos datos son **mock** (maestro, alertas, evolución, mapa-seccional). El valor real se materializa cuando las APIs lean de la **misma fuente de verdad** (BD) que operadores y procesos reales.

---

## 2. ¿Dónde se controla el poder?

| Mecanismo | Dónde está | Fortaleza / Gaps |
|-----------|------------|-------------------|
| **Concentración de poder** | Alerta cuando un concejal/líder concentra >35% de seguidores; KPI "Concentración de Poder" con estado danger y "Ver líderes". | **Bueno:** Visibilidad y priorización. **Gap:** No hay flujo para "redistribuir" o asignar cuotas desde la UI; es informativo. |
| **Roles y acceso** | Esquema BD (UserRole: SUPER_ADMIN, MAESTRO, PRO, OPERADOR, CAPACITACION); navegación por perfil. | **Bueno:** Modelo claro. **Gap:** No hay UI de administración de roles ni de "quién ve qué"; permisos por ruta no documentados en esta auditoría. |
| **Asignación de alertas** | Panel de alertas: "Asignar" a Operador de zona / Coordinador (persistido en localStorage). | **Bueno:** Refuerza responsabilidad. **Gap:** Mock; no persiste en BD ni notifica al asignado. |
| **Orden por impacto en tablas** | Crítico primero; estado y validados como palancas de decisión. | **Bueno:** El poder de decidir "qué mirar" está en criterios de impacto, no en orden alfabético. |
| **Auditoría de acciones sensibles** | Eventos EXPORTACION, CAMBIO_ROL con color de advertencia; registro por usuario y entidad. | **Bueno:** Transparencia. **Gap:** Eventos hoy son mock; en producción debe persistir en EventoAuditoria con usuario real. |

**Resumen:** El poder se **controla sobre todo con visibilidad y priorización**. Falta cerrar el loop: **asignar responsable**, **limitar por rol** en backend, y **notificar** al asignado.

---

## 3. ¿Qué lo hace imposible de falsificar?

| Elemento | Estado actual | Para ser infalsificable |
|----------|----------------|--------------------------|
| **EventoAuditoria** | Esquema con tipo, usuario, entidad, entidadId, payload, IP/user-agent. Eventos en UI son mock. | Persistir todo evento relevante en BD; no permitir borrado por usuarios; opcional firma/hash por evento. |
| **Subscriptor** | Esquema con codigoSeguridad, codigoVerificacion únicos. | Códigos generados por sistema; no editables por usuario; usados en verificaciones. |
| **Verificacion** | Esquema con resultado y proveedor (ej. Incode, Incognia). | Integración real con proveedores; resultado inmutable una vez cerrado. |
| **Alertas** | Reglas basadas en KPIs; filtros por nivel/tipo. | Mismas reglas sobre datos reales; auditoría de "quién silenció qué" si se persiste. |
| **KPIs y gráficos** | Cálculos sobre datos de API (hoy mock). | Una sola fuente de verdad (BD); sin edición manual de totales; auditoría de exportaciones. |

**Resumen:** El **diseño** (auditoría, esquema BD, códigos únicos, verificaciones) **apoya** la infalsificabilidad. Lo que falta es **implementación en producción**: BD real, auditoría persistente, verificaciones reales y política de no borrado de eventos.

---

## 4. ¿Qué lo hace vendible?

| Elemento | Dónde está | Comentario |
|----------|------------|------------|
| **Oferta de valor** | OFERTA_VALOR: organización por zona, comunicación directa, panel en tiempo real, cobertura con responsable. | Claro y orientado a resultado; colapsable en dashboard para no competir con métricas. |
| **Confianza** | PAGES.trust ("Actualización automática", "Conectado a mapas, KPIs y alertas", "Trazabilidad SNPP/SINAFOCAL"). | Refuerza seriedad y trazabilidad. |
| **Audiencia** | PRODUCT.audience: partidos, gobiernos locales, consultoras, organizaciones territoriales. | Permite venta B2B y B2G. |
| **Terminología neutral** | Yapó no partidaria; "puntos de verificación", "responsable", "cobertura en territorio". | Amplía uso a distintos clientes sin atarse a un solo partido. |
| **Múltiples perfiles** | Maestro (estrategia), Pro (equipos), Operador (campo), Capacitación (idoneidad), Admin. | Precio por módulo o por rol posible. |
| **UX de control** | Alertas con causa/consecuencia/acción; auditoría "Todo queda registrado"; tablas como centros de acción. | Transmite control y transparencia; diferencial para compradores exigentes. |

**Gaps para venta:** Casos de éxito, precios/planes, comparativa con "hojas de cálculo + WhatsApp", demo guiada o trial, y material que enfatice **infalsificabilidad** y **escalabilidad a nivel país** como argumentos comerciales.

---

## 5. ¿Qué lo hace escalable a nivel país?

| Aspecto | Estado actual | Para escalar a país |
|---------|----------------|----------------------|
| **Territorio** | Seccionales y datos ligados a una circunscripción (ej. Capital/Asunción en datos y copy). | Modelo **Organización → Circunscripción → Seccionales**; copy y mapas parametrizados por ámbito; múltiples organizaciones (multi-tenant). |
| **APIs** | Rutas por dashboard (maestro, pro, operador) y por dominio (idoneidad, alertas). | Mantener APIs por contexto; añadir filtro por organización/circunscripción y por rol; caché y paginación donde haga falta. |
| **Umbrales y reglas** | Umbrales de alertas en código (reglas.ts); seccionales en datos estáticos. | Configuración por instancia o por organización (umbrales, mínimos, % concentración); datos territoriales desde BD o servicio. |
| **Idioma y locale** | Textos en español (es-PY en fechas). | i18n para otros países/idiomas; locale en preferencias o por organización. |
| **Auditoría y cumplimiento** | Tipos de evento y esquema listos; eventos mock. | Misma tabla EventoAuditoria para todas las instancias; retención y exportación para reguladores por país. |

**Resumen:** El **esquema (SENTINEL360)** y la **separación por APIs y roles** permiten escalar. Lo que falta es **multi-tenancy** explícito (organización/país/circunscripción), **configuración de umbrales** por instancia y **datos territoriales** no hardcodeados a Asunción.

---

## 6. Mejoras finales propuestas

### 6.1 Prioridad alta (valor + control + infalsificabilidad)

| # | Mejora | Dónde | Objetivo |
|---|--------|--------|----------|
| 1 | **Una sola fuente de verdad** | Conectar todas las APIs de dashboard a la BD real (maestro, alertas, evolución, mapa-seccional); eliminar o acotar mocks a "demo". | Que el valor real (decisión, contacto, priorización) se base en datos reales. |
| 2 | **Persistir auditoría** | Escribir en EventoAuditoria cada acción relevante (login, CRUD, cambio de estado, exportación, cambio de rol); timeline que lea de BD. | Hacer el sistema auditado de verdad; base para "imposible de falsificar". |
| 3 | **Asignación de alertas en BD** | Reemplazar localStorage por modelo AlertaAsignacion (alertaId, asignadoA, fecha); notificación al asignado (email o in-app). | Cerrar el loop de control: quién responde por cada alerta. |
| 4 | **Permisos por rol en backend** | Cada API debe validar rol (y opcionalmente organización/circunscripción); rechazar acceso no autorizado. | Control del poder no solo en UI sino en datos. |

### 6.2 Prioridad media (vendible + escalable)

| # | Mejora | Dónde | Objetivo |
|---|--------|--------|----------|
| 5 | **Modelo Organización / Circunscripción** | Esquema BD: Organización (o Tenant), Circunscripción (ej. Asunción, Central); Seccional pertenece a Circunscripción. APIs filtran por contexto del usuario. | Base para multi-país y multi-cliente. |
| 6 | **Umbrales configurables** | Tabla o config por organización: EVENTOS_HOY_MIN, CONCENTRACION_PCT_MAX, VALIDADOS_MIN_POR_SECCIONAL, etc. Reglas de alertas leen de ahí. | Escalar sin tocar código por cada territorio. |
| 7 | **Página o bloque "Para compradores"** | Documento o ruta con: casos de uso, confiabilidad (auditoría, trazabilidad), escalabilidad (multi-territorio), precios/contacto. | Hacer explícito qué lo hace vendible y escalable. |
| 8 | **Admin: usuarios y roles** | UI para listar usuarios, asignar rol, (opcional) vincular a Concejal/Seccional; auditoría de cambios de rol. | Control del poder visible y operable. |

### 6.3 Prioridad menor (pulido y consistencia)

| # | Mejora | Dónde | Objetivo |
|---|--------|--------|----------|
| 9 | **Parametrizar "Asunción"** | Ámbito (ciudad/circunscripción) en config o BD; PageHero y copy que digan "X seccionales" sin hardcodear ciudad. | Preparar copy para otros territorios. |
| 10 | **Exportación auditada** | Cualquier export a Excel/CSV debe generar EventoAuditoria (quién, qué, cuándo); opcional límite por rol. | Refuerzo de transparencia y control. |
| 11 | **Indicador "Última actualización"** | Timestamp visible cerca de KPIs o del hero ("Datos actualizados a las HH:MM"). | Refuerzo de confianza en tiempo real. |

---

## 7. Resumen ejecutivo

- **Valor real:** Está en la **visibilidad unificada**, la **priorización por impacto**, el **contacto directo** y las **alertas accionables**; se maximiza cuando los datos dejan de ser mock y pasan a BD real.
- **Control del poder:** Hoy se ejerce sobre todo por **visibilidad** (concentración de poder, orden por impacto, auditoría visible); falta **asignación persistente**, **permisos en backend** y **notificación al responsable**.
- **Infalsificabilidad:** El **diseño** (auditoría, códigos únicos, verificaciones) la habilita; falta **persistencia real** de eventos, verificaciones con proveedores y política de **no borrado** de auditoría.
- **Vendible:** Lo hacen la **oferta de valor**, la **confianza** (trazabilidad, tiempo real), la **terminología neutral** y los **múltiples perfiles**; faltan **casos de éxito**, **precios** y mensaje claro de **escalabilidad e infalsificabilidad**.
- **Escalable a país:** Lo permiten el **esquema** y las **APIs por contexto**; faltan **multi-tenancy** (Organización/Circunscripción), **umbrales configurables** y **datos territoriales** no atados a una sola ciudad.

Las **mejoras finales** priorizan: (1) datos reales y auditoría persistente, (2) asignación y permisos, (3) modelo multi-territorio y configuración, (4) material comercial y admin de roles, (5) detalle de copy y exportación auditada.
