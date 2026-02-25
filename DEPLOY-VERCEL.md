# Actualizar Vercel sin usar GitHub

Si no podés hacer `git push` (problemas de credenciales), podés actualizar Vercel **directo desde tu PC** con la CLI de Vercel.

## Pasos

1. **Abrir una terminal** en la carpeta del proyecto:
   ```bash
   cd c:\Users\lalla\yap--Programa-Territorial-de-idoneidad-Laboral-PTIL--main
   ```

2. **Instalar dependencias** (por si faltan):
   ```bash
   npm install
   ```

3. **Iniciar sesión en Vercel** (solo la primera vez):
   ```bash
   npx vercel login
   ```
   Te va a abrir el navegador para que entres con tu cuenta de Vercel.

4. **Desplegar a producción** (esto actualiza tu sitio en Vercel):
   ```bash
   npm run deploy:vercel
   ```
   O directamente:
   ```bash
   npx vercel --prod
   ```

   La primera vez puede preguntar si linkear el proyecto a un proyecto existente en Vercel: elegí el proyecto **ptil-yapo** (o el nombre que tenga tu app en Vercel).

Listo: con eso Vercel vuelve a construir y publicar el sitio con el código actual de tu carpeta.

---

**Nota:** El remote de Git quedó en **SSH** (`git@github.com:lallamaqueinflamahk-max/ptil-yapo.git`). Si más adelante configurás una llave SSH en GitHub, `git push origin main` debería funcionar y Vercel también se actualizará con cada push. Si preferís usar HTTPS de nuevo:
```bash
git remote set-url origin https://github.com/lallamaqueinflamahk-max/ptil-yapo.git
```
