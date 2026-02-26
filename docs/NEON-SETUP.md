# Configuración de Neon para PTIL YAPÓ (sin errores de inscripción)

Esta guía deja la base de datos lista para **Vercel** y **local**, para que la inscripción no falle nunca por falta de base.

---

## 1. Crear la base en Neon

1. Entrá a **[neon.tech](https://neon.tech)** y creá una cuenta (o iniciá sesión).
2. **Create a project**:
   - **Project name**: por ejemplo `ptil-yapo`.
   - **Region**: elegí la más cercana (ej. South America o US East).
   - **Postgres version**: la que venga por defecto (16 está bien).
3. Creá el proyecto. Neon te va a mostrar un **connection string**.
4. Copiá la URL que empieza con `postgresql://...` (puede ser **Connection string** o **Pooled connection**). Ejemplo:
   ```txt
   postgresql://usuario:contraseña@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

---

## 2. Variables en Vercel

**Opción A – Un solo comando (recomendado)**  
Si ya tenés `DATABASE_URL` en tu `.env` local (paso 3):

```bash
npm run vercel:env:database
```

Eso sube la variable a Vercel (Production). Después hacé **Redeploy** en Vercel (Deployments → ⋮ → Redeploy).  
Si es la primera vez, antes ejecutá: `npx vercel login` y `npx vercel link` en la carpeta del proyecto.

**Opción B – Manual**

1. Entrá a **[vercel.com](https://vercel.com)** → tu proyecto **ptil-yapo**.
2. **Settings** → **Environment Variables**.
3. Agregá:

   | Name             | Value                    | Environments   |
   |------------------|--------------------------|----------------|
   | `DATABASE_URL`   | (pegá la URL de Neon)    | Production ✅  |

   Si usás Preview, marcá también **Preview** para que los deploys de ramas usen la misma base.

4. **Save** y hacé un **Redeploy** del proyecto (Deployments → ⋮ en el último deploy → Redeploy).

---

## 3. Crear las tablas (solo una vez)

Las tablas se crean con Prisma. Podés hacerlo desde tu máquina con la misma URL de Neon:

1. En la carpeta del proyecto, creá o editá `.env` y poné:
   ```env
   DATABASE_URL="postgresql://..."   # la misma URL que en Vercel
   ```
2. En la terminal:
   ```bash
   npx prisma db push
   ```
   Deberías ver algo como: `Your database is now in sync with your schema.`

A partir de ahí, **no hace falta volver a ejecutar** `db push` salvo que cambies el `schema.prisma`.

---

## 4. Selfies (Vercel Blob) – opcional

Para que las fotos no den error 413:

1. En Vercel → tu proyecto → **Storage** → **Create Database** → **Blob**.
2. Creá el store (ej. "ptil-blob") y enlazalo al proyecto.
3. Vercel agrega solo **BLOB_READ_WRITE_TOKEN**; no tenés que crear nada a mano.

---

## 5. Comprobar que todo funciona

- **En Vercel**: abrí `https://tu-proyecto.vercel.app`, completá el formulario de inscripción y enviá. Deberías ver el mensaje de éxito y el código de verificación.
- **Diagnóstico de la base de datos**:
  - Abrí **https://tu-dominio.vercel.app/api/health** en el navegador (solo comprueba si `DATABASE_URL` está definida; no da 405). Para comprobar también la conexión: **https://tu-dominio.vercel.app/api/health/db** (devuelve `"database":"connected"` si todo está bien).
  - Si **/api/health** da 404 o 405: subí el código a GitHub y hacé Redeploy en Vercel. Mientras tanto podés hacer POST a **/api/subscriptores** con body `{"healthCheck": true}` (p. ej. con Postman o `curl -X POST ... -d '{"healthCheck":true}'`).
  - `"database":"missing"` → agregá `DATABASE_URL` en Vercel → Environment Variables y hacé **Redeploy**.
  - `"database":"configured"` con `connectError` → la variable está pero la conexión falla (URL incorrecta, Neon pausado o tablas no creadas). Revisá la URL, que el proyecto Neon esté activo y ejecutá `npx prisma db push` una vez (paso 3).
- **Si Vercel no te deja guardar la variable ("invalid characters")**: en **Key** escribí a mano solo: `DATABASE_URL` (sin pegar nada, sin espacios). En **Value** pegá la URL de Neon.
- **Si ves "Las tablas no existen"**: ejecutá una vez en tu PC: `npx prisma db push` (con la misma `DATABASE_URL` de Neon en tu `.env`). Ver paso 3.

---

## Resumen de variables

| Variable               | Dónde        | Obligatorio para inscripción |
|------------------------|-------------|------------------------------|
| `DATABASE_URL`         | Vercel + .env local | Sí (Neon)              |
| `BLOB_READ_WRITE_TOKEN`| Vercel (Storage → Blob) | No (pero evita 413 en selfies) |

Con `DATABASE_URL` de Neon configurada en Vercel y las tablas creadas con `prisma db push`, la inscripción no debería volver a fallar por base de datos.
