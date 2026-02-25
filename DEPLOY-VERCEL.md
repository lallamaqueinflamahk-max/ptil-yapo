# Actualizar GitHub y Vercel

**Estado reciente:** Hay 2 commits locales listos (UX + fixes de build). El `git push` desde esta máquina falla por error de SSH en Windows (*couldn't create signal pipe, Win32 error 5*). Podés subir a GitHub y desplegar así:

---

## Opción A: Subir a GitHub y que Vercel se actualice solo

1. En la carpeta del proyecto, subí los commits a GitHub **desde tu PC** (terminal o GitHub Desktop):
   ```bash
   git push origin main
   ```
   Si falla por SSH, probá con HTTPS:
   ```bash
   git remote set-url origin https://github.com/USUARIO/REPO.git
   git push origin main
   ```
   O usá **GitHub Desktop** / **GitHub CLI** (`gh auth login` y luego `git push`).

2. Si el repo está conectado a Vercel, el deploy se dispara solo con cada push a `main`.

---

## Opción B: Actualizar solo Vercel (sin push)

Si no podés hacer `git push` (credenciales/SSH), podés actualizar Vercel **directo desde tu PC** con la CLI.

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
*(El build estaba fallando por orden de `useEffect`/`alertasZona` y por `useSearchParams` sin Suspense; ya está corregido en los últimos commits.)*

---

**Nota:** El remote de Git quedó en **SSH** (`git@github.com:lallamaqueinflamahk-max/ptil-yapo.git`). Si más adelante configurás una llave SSH en GitHub, `git push origin main` debería funcionar y Vercel también se actualizará con cada push. Si preferís usar HTTPS de nuevo:
```bash
git remote set-url origin https://github.com/lallamaqueinflamahk-max/ptil-yapo.git
```
