# Conexión a base de datos real

El dashboard está preparado para conmutar de **datos mock** a **BD real** sin cambiar la lógica de la UI. Esta guía indica qué tocar y en qué orden.

---

## 1. Variable de entorno

```env
# Opcional; por defecto usa mock
DATA_SOURCE=db
```

Cuando `DATA_SOURCE=db`, los servicios en `lib/services/` deben leer de Prisma (u otro cliente) en lugar de generar datos en memoria.

---

## 2. Configuración de territorio

- **Archivo:** `lib/config/territory.ts`
- **Hoy:** `getTerritoryConfig()` devuelve valores por defecto (Asunción, Capital, etc.).
- **Con BD:** Opcionalmente leer por `ORGANIZACION_ID` o tenant desde una tabla `Tenant` / `Organizacion` y devolver `TerritoryConfig` (nombreCiudad, circunscripcion, organizacion, totalSeccionales).

---

## 3. Servicios y qué reemplazar

| Servicio | Archivo | Función | Origen actual | Con BD |
|----------|---------|---------|----------------|--------|
| Maestro | `lib/services/maestro.ts` | `getMaestroData()` | `lib/data/seccionales2026`, mapaCapasData, auditoria | Prisma: Seccional, agregados (votantes, concejales), EventoAuditoria; capas desde BD o servicio. |
| Auditoría | `lib/services/auditoria.ts` | `getEventosAuditoria()` | Mock en memoria | `prisma.eventoAuditoria.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })`. Modelo alineado con `lib/types/dashboard.ts` (EventoAuditoria). |
| Contexto KPIs | `lib/services/contextoKpis.ts` | `getContextoKPIs()` | Mock (seccionales, seguidores, eventosHoy) | Agregar totalVotantes, eventosHoy (count EventoAuditoria hoy), listadoSeccionales, seguidoresPorConcejales desde Prisma. |
| Evolución | `lib/services/evolucion.ts` | `getSerieEvolucion(dias, filter)` | Mock por día | Tabla de hechos o agregados por fecha (validados, leales, verificados, derivaciones); filter = seccional/ranking para filtrar. |
| Mapa seccional | `lib/services/mapaSeccional.ts` | `getDetalleSeccional(numero)` | Mock (KPIs y alertas derivados de numero) | `prisma.seccional.findUnique` + KPIs desde agregados; alertas desde reglas o tabla Alertas por seccional. |

---

## 4. Esquema de referencia

Ver **docs/SENTINEL360-ESQUEMA-BD.md** y el schema Prisma correspondiente:

- **EventoAuditoria:** id, tipo, entidad, entidadId, usuario, mensaje, createdAt (y opcional usuarioId, ip, userAgent).
- **Seccional:** id, numero, nombre, barrio, titular, rangoId, lat, lng, contacto, etc.
- **Subscriptor, Verificacion, EstadoLealtadSubscriptor** para agregados de validados, leales, etc.

---

## 5. Orden sugerido de conexión

1. **Eventos de auditoría**  
   Escribir en `EventoAuditoria` en cada acción relevante (login, CRUD, exportación). Leer en `getEventosAuditoria()` cuando `DATA_SOURCE=db`.

2. **Maestro: listado de seccionales**  
   Reemplazar `buildListadoSeccionales()` por query a Seccional + cálculo de estado (o vista/agregado). Mantener la forma `ListadoSeccionalItem` en `lib/types/dashboard.ts`.

3. **Contexto KPIs y alertas**  
   `getContextoKPIs()` con datos desde Prisma (conteos, listado seccionales, seguidores por concejal). Las reglas en `lib/alertas/reglas.ts` no cambian; solo el contexto.

4. **Evolución temporal**  
   Crear tabla o vista de agregados por día (validados, leales, verificados) y leer en `getSerieEvolucion()`.

5. **Detalle seccional**  
   KPIs y alertas por seccional desde BD o desde reglas que usen datos reales.

---

## 6. Respuestas de API

Todas las rutas que usan servicios ya devuelven **lastUpdated** (ISO string) cuando aplica. La UI (ej. PageHero en maestro) muestra "Actualizado HH:MM" si existe. Al conectar BD, se puede seguir devolviendo el timestamp de la consulta o del último cambio relevante.

---

## 7. Parametrizar ámbito (Asunción / otro territorio)

- **API Maestro** ya devuelve `scope: { nombreCiudad, circunscripcion, totalSeccionales }` desde `getTerritoryConfig()`.
- **PageHero** en maestro usa `data.scope` para mostrar "Asunción · 45 seccionales" (o el ámbito que devuelva la API).
- Para otros usos de "Asunción" en copy (Hero, README, mensajes): cuando haya multi-tenant, se puede inyectar `nombreCiudad` desde config o desde la respuesta de una API de contexto (ej. `/api/config/territory`).

---

## 8. Tipos compartidos

- **lib/types/dashboard.ts:** `MaestroApiResponse`, `EventoAuditoria`, `ListadoSeccionalItem`, `ScopeInfo`, `DetalleSeccional`, `AlertasApiResponse`, `EvolucionApiResponse`.  
- Alinear los modelos Prisma con estos tipos (o mapear en el servicio) para que las rutas sigan devolviendo el mismo contrato a la UI.
