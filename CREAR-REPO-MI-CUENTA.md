# Crear repo en tu cuenta (lallamaqueinflamahk-max)

## 1. Crear el repositorio en GitHub

1. Entrá a **https://github.com/new**
2. Iniciá sesión con **lallamaqueinflamahk-max** si no lo estás.
3. Configurá:
   - **Repository name:** por ejemplo `ptil-yapo` o `yap-territorial` (el que prefieras).
   - **Description:** opcional, ej. "Programa Territorial de Idoneidad Laboral - Dashboard PTIL".
   - **Public.**
   - **No marques** "Add a README file" (ya tenés código local).
4. Clic en **Create repository**.

## 2. Apuntar tu proyecto al nuevo repo y subir

En la terminal, desde la carpeta del proyecto:

```powershell
cd "c:\Users\lalla\yap--Programa-Territorial-de-idoneidad-Laboral-PTIL--main"

# Guardar el repo original por si lo necesitás después (opcional)
git remote rename origin upstream

# Agregar tu repo como origin (reemplazá NOMBRE-DEL-REPO por el que creaste, ej. ptil-yapo)
git remote add origin https://github.com/lallamaqueinflamahk-max/NOMBRE-DEL-REPO.git

# Subir tu rama main
git push -u origin main
```

Si preferís **reemplazar** el origin (y no guardar el de richitexx07):

```powershell
cd "c:\Users\lalla\yap--Programa-Territorial-de-idoneidad-Laboral-PTIL--main"

git remote set-url origin https://github.com/lallamaqueinflamahk-max/NOMBRE-DEL-REPO.git

git push -u origin main
```

Reemplazá **NOMBRE-DEL-REPO** por el nombre exacto del repo que creaste en el paso 1.

## 3. Vercel (opcional)

Si querés desplegar en Vercel con este repo:

1. Entrá a https://vercel.com y vinculá tu cuenta de GitHub.
2. "Add New Project" y elegí el repo **lallamaqueinflamahk-max/NOMBRE-DEL-REPO**.
3. Configurá el proyecto (framework Next.js se detecta solo) y deploy.
