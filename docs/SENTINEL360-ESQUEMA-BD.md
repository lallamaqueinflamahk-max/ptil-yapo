# SENTINEL360 – Esquema de base de datos relacional

## Resumen

Esquema pensado para usuarios jerárquicos, territorio (concejales, seccionales, dirigentes), subscriptores, verificación, idoneidad laboral, estados de lealtad y auditoría.

## Enums

| Enum | Valores | Uso |
|------|---------|-----|
| **UserRole** | SUPER_ADMIN, ADMIN, MAESTRO, PRO, OPERADOR, CAPACITACION | Rol del usuario en el sistema |
| **EstadoVerificacion** | PENDIENTE, EN_REVISION, VERIFICADO, RECHAZADO, TRASPASADO | Estado de la ficha/subscriptor |
| **EstadoLealtad** | ACTIVO, EN_RIESGO, INACTIVO, RETIRADO | Nivel de lealtad del subscriptor |
| **ClasificacionIdoneidad** | GRUPO_A, GRUPO_B, GRUPO_C | Clasificación laboral (certificado / empírico / capacitación) |
| **CargoDirigente** | PRESIDENTE_SECCIONAL, CONVENCIONAL, OTRO | Cargo del dirigente |
| **TipoEventoAuditoria** | LOGIN, LOGOUT, CREACION, ACTUALIZACION, ELIMINACION, EXPORTACION, CAMBIO_ESTADO, CAMBIO_ROL | Tipo de evento auditado |
| **TipoVerificacion** | IDENTIDAD, LABORAL, GEOGRAFICA, BIOMETRICA | Tipo de verificación (KYC, etc.) |

## Entidades y relaciones

```
                    ┌─────────────┐
                    │   Usuario   │
                    │ (jerárquico)│
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Concejal  │  │ Seccional  │  │  Dirigente  │
    └─────┬──────┘  └─────┬──────┘  └──────┬──────┘
          │               │                │
          │   1:N         │ 1:N            │ 1:N
          └───────┬───────┴────────────────┘
                  │
                  ▼
           ┌─────────────┐
           │ Subscriptor │
           └──────┬──────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌─────────────────────┐
│Verificac.│ │EstadoLeal│ │ EventoAuditoria     │
└──────────┘ └──────────┘ └─────────────────────┘
```

### Usuario (jerárquico)

- **Rol** define el nivel de acceso (SUPER_ADMIN → CAPACITACION).
- Opcionalmente vinculado a **un** Concejal, **una** Seccional o **un** Dirigente.
- Una misma persona puede ser Concejal y tener un Usuario con `concejalId`; otro Usuario con rol PRO puede apuntar al mismo Concejal si aplica.

### Concejal

- Representa a un concejal o candidato.
- Tiene muchas **Seccionales** (territorios bajo su influencia) y muchos **Dirigentes** (referentes de zona).

### Seccional

- Unidad territorial (ej. seccional n.º 1, 2, … 45).
- Pertenece opcionalmente a un **Concejal**.
- Tiene muchos **Dirigentes** y muchos **Subscriptores** (inscritos en esa seccional).

### Dirigente

- Presidente de seccional, convencional u otro cargo.
- Pertenece a **una** Seccional y opcionalmente a **un** Concejal.
- Tiene muchos **Subscriptores** (inscritos bajo su referencia) y muchos **EstadoLealtadSubscriptor**.

### Subscriptor

- Ficha de inscripción (como en PTIL).
- **codigoSeguridad** y **codigoVerificacion** únicos.
- **estadoVerificacion** y **clasificacionIdoneidad** (idoneidad laboral).
- Opcionalmente vinculado a **un** Dirigente y **una** Seccional.
- Relaciones 1:N con **Verificacion** y **EstadoLealtadSubscriptor**.

### Verificacion

- Registro de una verificación (identidad, laboral, geográfica, biométrica).
- Siempre asociada a **un** Subscriptor.
- Incluye resultado y proveedor (ej. Incode, Incognia).

### EstadoLealtadSubscriptor

- Estado de lealtad de **un** Subscriptor respecto a **un** Dirigente (o seccional si se amplía).
- Constraint único `(subscriptorId, dirigenteId)` para un solo estado por par.
- Permite puntaje y observación.

### EventoAuditoria

- Registro de acciones (login, CRUD, cambio de estado, etc.).
- Opcionalmente vinculado a **un** Usuario.
- Incluye entidad, id, payload (JSON) e IP/user-agent.

## Cómo usar este esquema

1. **PostgreSQL**  
   El archivo `prisma/sentinel360-schema.prisma` está configurado con `provider = "postgresql"`. Definir `DATABASE_URL` en `.env` con la URL de PostgreSQL.

2. **Activar en el proyecto**  
   - Opción A: reemplazar `prisma/schema.prisma` por el contenido de `sentinel360-schema.prisma`.  
   - Opción B: copiar los `model` y `enum` que necesites al `schema.prisma` actual (por ejemplo, para ir migrando desde el esquema PTIL).

3. **Migraciones**  
   ```bash
   npx prisma migrate dev --name sentinel360_inicial
   npx prisma generate
   ```

4. **SQLite**  
   Si querés usar SQLite, en el schema cambiar `provider = "sqlite"` y `url = env("DATABASE_URL")` (con `file:./dev.db`). Algunos enums se mapean a texto en SQLite.

## Índices

- `EventoAuditoria`: por `usuarioId`, por `(tipo, createdAt)`, por `(entidad, entidadId)`.
- `Verificacion`: por `(subscriptorId, tipo)`.
- `EstadoLealtadSubscriptor`: por `dirigenteId` y `estado`, por `subscriptorId`; único `(subscriptorId, dirigenteId)`.

## Buenas prácticas aplicadas

- **Enums** para dominios fijos (roles, estados, tipos).
- **Claves foráneas** con `onDelete` explícito (Cascade, SetNull).
- **Índices** en FKs y columnas usadas en filtros/ordenación.
- **Unicidad** donde aplica (códigos, email de usuario, par subscriptor-dirigente en lealtad).
- **Auditoría** desacoplada en tabla de eventos.
- **Jerarquía de usuarios** por rol y relación opcional a Concejal/Seccional/Dirigente.
