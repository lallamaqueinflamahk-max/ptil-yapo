# Auditoría: UI y facilidad de uso para Operadores YAPÓ (cazatalentos)

## 1. Resumen ejecutivo

Los operadores YAPÓ son **cazatalentos** que validan oficios in situ, toman verificaciones por geofencing y reciben incentivos por aprobaciones. Esta auditoría revisa qué tienen hoy, qué falta y qué mejorar para que puedan hacer mejor su trabajo.

---

## 2. Lo que ya existe (flujo actual)

| Función | Estado | Ubicación |
|--------|--------|-----------|
| Perfil operador (cédula + seccional) | OK | Dashboard Operador → formulario inicial |
| Alertas en zona (geofencing por seccional) | OK | `/api/operador/alertas?cedula=...` |
| Tomar verificación (primero que llega, gana) | OK | Botón "Tomar Verificación" por alerta |
| Validaciones pendientes de dictamen | OK | Lista con APROBADO / OBSERVACIÓN / RECHAZADO / DERIVAR |
| Dictamen (APROBADO, APROBADO/OBSERVACIÓN, RECHAZADO, DERIVAR CAPACITACIÓN) | OK | Botones por ítem |
| Re-enviar mensaje de bienvenida (WhatsApp) | OK | Por ítem aprobado |
| Comisión por validación (ej. 5.000 Gs) | OK | Mostrada en hero; mensaje "+ X Gs ganados" |
| Carga directa (Vía B) | Parcial | Link a `/?operador=1` → RegisterForm en flujo operador |
| Evidencia visual (foto con herramientas / falta equipamiento) | Parcial | Mencionado en UI; falta subida de foto en dictamen |

---

## 3. Faltantes críticos para cazatalentos

### 3.1 Encontrar personas en su zona

- **Geolocalización:** Hoy el filtro es por **seccional** (número). No hay mapa ni radio en km; no se muestra “cercanía” del operador al suscriptor.
- **Sugerencia:** Mapa de alertas en su zona (pins por ficha), filtro por “radio en km” desde el operador, y/o lista ordenada por distancia si se guardan lat/lng de la ficha.
- **Datos:** Las fichas ya tienen `gpsLat`, `gpsLng`; falta exponerlos en API de alertas (opcional por privacidad) y consumirlos en un mapa en el dashboard operador.

### 3.2 Calificación como cazatalentos

- No existe hoy un **score o rating** del operador (ej. por aprobaciones, tiempo de respuesta, rechazos).
- **Sugerencia:** KPI operador: cantidad de tomas, aprobados, rechazados, derivados; opcionalmente un “nivel” o badge (ej. Bronce / Plata / Oro) y mostrarlo en su perfil y en el dashboard.

### 3.3 Medio de pago e incentivos

- La comisión se **muestra** (ej. 5.000 Gs por aprobación) pero no hay integración de pago.
- **Billetera YAPÓ (landing con billetera incorporada):**
  - Cuenta operador: saldo acumulado por comisiones.
  - Depósitos con las seguridades requeridas (KYC según normativa, registro de movimientos, estados de cuenta).
  - Flujo: “Comisiones ganadas” → “Retirar a Billetera YAPÓ” → saldo disponible y retiro a cuenta bancaria o uso en la app.
- **Billetera Mango (Tu Financiera):**
  - Opción alternativa: retiro a Mango en lugar de (o además de) Billetera YAPÓ.
  - Misma trazabilidad y seguridad que para la billetera propia.

### 3.4 Carga directa del suscriptor (Vía B)

- **Problema reportado:** Completar todos los datos y pulsar “Enviar registro” y “no hace nada”.
- **Causas probables:**
  - En flujo operador el paso 3 exige: Gestor de zona, Cargo gestor, Seccional Nro. y **Cédula del Operador YAPÓ**. Si falta uno, el botón queda deshabilitado y el clic no hace nada.
  - Error del API (ej. 400) solo se muestra en toast; si el usuario no lo ve, parece que “no pasa nada”.
- **Mejoras ya sugeridas en código:**
  - Mostrar en pantalla por qué el botón está deshabilitado (ej. “Completá: gestor, cargo, seccional y cédula del operador”).
  - Mostrar el error del API en un banner en el formulario, no solo en toast.
- **Flujo deseado (a implementar):**
  - Tras enviar: guardar registro, mostrar **avatar del suscriptor** (selfie de registro).
  - Mensaje: “Pendiente a aprobación. Gracias por subscribirse al Programa PTIL YAPÓ.”
  - Generar **YAPÓ Credencial** (como cédula digital verificada: nombre, datos personales, estado “Pendiente” o “Verificado”).
  - Hasta que exista comité de validación por idoneidad de oficio: todo queda “Pendiente”; cuando esté el comité, se podrá aprobar automáticamente si cumple requisitos o enviar a validación.

---

## 4. Mejoras sugeridas en la UI de operadores

### 4.1 Dashboard Operador (página actual)

| Mejora | Descripción |
|--------|-------------|
| **Perfil visible siempre** | Mostrar cédula (últimos 4) y seccional en la cabecera o barra fija, no solo al cargar. |
| **Zona de cobertura** | Reemplazar el bloque estático “Zona de cobertura” por un **mapa** con: (1) ubicación del operador si se guarda, (2) alertas en su seccional como pins o lista con distancia si hay coordenadas. |
| **Ordenar alertas** | Si la API devuelve lat/lng: ordenar por distancia al operador y/o mostrar “A X km” en cada ítem. |
| **Carga directa destacada** | El card “Carga directa (Vía B)” debe ser el CTA principal: mismo diseño que “Tomar Verificación”, o más grande, para registrar in situ. |
| **Evidencia visual en dictamen** | Por cada ítem “pendiente de dictamen”: campo para **subir foto** (trabajador con herramientas o indicar “Falta equipamiento”). Guardar URL o base64 en la ficha/evidencia y mostrarla en el historial. |
| **Filtros en historial** | Pestañas o filtros: Solo pendientes / Aprobados / Rechazados / Derivados. |
| **Comisión y billetera** | Sección “Mis comisiones” con total ganado y botón “Ver en Billetera YAPÓ” (cuando exista). Opción “Retirar a Mango” si se integra. |

### 4.2 Flujo Carga directa (RegisterForm en `?operador=1`)

| Mejora | Descripción |
|--------|-------------|
| **Paso 3 obligatorios visibles** | En paso 3, marcar claramente los campos obligatorios (gestor, cargo, seccional, cédula operador) y, si el botón está deshabilitado, mostrar debajo: “Para enviar completá: …”. |
| **Error del servidor en pantalla** | Si el API devuelve 400/500, mostrar el mensaje en un banner rojo arriba del botón “Enviar registro”, además del toast. |
| **Confirmación post-envío** | Tras éxito: mostrar avatar (selfie), mensaje “Pendiente a aprobación. Gracias por subscribirse al Programa PTIL YAPÓ” y opción “Descargar / Ver YAPÓ Credencial”. |
| **YAPÓ Credencial** | Pantalla o PDF descargable: nombre, cédula, foto, estado (Pendiente / Verificado), código de verificación, QR si aplica. |

### 4.3 APIs y datos

| Mejora | Descripción |
|--------|-------------|
| **Alertas con distancia** | Si el operador tiene lat/lng guardados, que `/api/operador/alertas` pueda devolver `distanciaKm` por ficha (y ordenar por distancia). |
| **Score operador** | Endpoint o campos: total tomas, aprobados, rechazados, derivados; opcionalmente “nivel” o badge. Mostrar en dashboard. |
| **Evidencia en dictamen** | PATCH en dictamen que acepte `evidenciaFotoUrl` o base64 y lo guarde en la ficha o tabla de evidencia. |

---

## 5. Priorización sugerida

1. **Inmediato (bug + UX):** Arreglar “Enviar registro no hace nada” (feedback cuando el botón está deshabilitado + error del API visible) y confirmación post-registro con selfie y mensaje “Pendiente a aprobación”.
2. **Corto plazo:** YAPÓ Credencial (vista/PDF con datos y estado); evidencia visual en dictamen (subir foto por ítem).
3. **Medio plazo:** Mapa de zona y alertas; ordenar por distancia; score/calificación del operador.
4. **Producto:** Billetera YAPÓ y opción Billetera Mango (seguridades, depósitos, retiros).

---

## 6. Referencia rápida de archivos

- Dashboard operador: `app/dashboard/operador/page.tsx`
- Formulario registro (carga directa): `components/RegisterForm.tsx`
- API crear ficha: `app/api/subscriptores/route.ts` → `lib/db/crearFicha.ts`
- API alertas operador: `app/api/operador/alertas/route.ts`
- API tomar verificación: `app/api/operador/tomar/route.ts`
- API dictamen: `app/api/operador/dictamen/route.ts`
