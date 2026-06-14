# Guia de Configuracion CI/CD — Choclicode

## Resumen del Pipeline

```
Rama cualquiera ──PR──> main ──merge──> main
                   │                     │
              ci.yml                 cd.yml
           (tests gate)         (tests + deploy)
```

- **`ci.yml`** — Se ejecuta en cada PR hacia `main`. Corre todos los tests. Si fallan, bloquea el merge.
- **`cd.yml`** — Se ejecuta en cada push a `main` (despues del merge). Corre tests y si pasan, despliega a Vercel.

---

## Pasos para completar la configuracion

### Paso 1: Obtener el Token de Vercel

1. Ir a [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click en **Create Token**
3. Nombre: `github-actions-deploy` (o lo que quieras)
4. Scope: seleccionar el team/cuenta donde esta el proyecto
5. Copiar el token generado (no se vuelve a mostrar)

### Paso 2: Agregar el secret en GitHub

1. Ir al repositorio en GitHub: [https://github.com/andremelzc/Choclicode](https://github.com/andremelzc/Choclicode)
2. **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**
4. Nombre: `VERCEL_TOKEN`
5. Valor: pegar el token del Paso 1
6. Click **Add secret**

### Paso 3: Vincular el proyecto de Vercel (si no esta vinculado)

Si el proyecto de Vercel ya esta conectado al repo via la integracion de GitHub, necesitas el `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`. Para obtenerlos:

1. Instalar Vercel CLI localmente:
   ```bash
   npm install -g vercel
   ```
2. Desde la carpeta del Frontend, ejecutar:
   ```bash
   cd "Desarrollo/CACIF/Codigo Fuente/Frontend"
   vercel link
   ```
3. Esto crea una carpeta `.vercel/` con un archivo `project.json` que contiene:
   ```json
   {
     "orgId": "team_xxxxxxxx",
     "projectId": "prj_xxxxxxxx"
   }
   ```
4. Agregar estos como secrets en GitHub (igual que el Paso 2):
   - `VERCEL_ORG_ID` → el valor de `orgId`
   - `VERCEL_PROJECT_ID` → el valor de `projectId`

> **Nota:** Si `vercel pull` funciona solo con el token (sin necesitar org/project ID como secrets separados), puedes omitir este paso. Prueba primero sin ellos.

### Paso 4: Desactivar el auto-deploy de Vercel

Esto es **critico**. Si no lo haces, Vercel va a desplegar en cada push sin esperar a que pasen los tests.

1. Ir al dashboard de Vercel: [https://vercel.com](https://vercel.com)
2. Seleccionar el proyecto de Choclicode
3. **Settings** > **Git**
4. En la seccion **Deploy Hooks** o **Connected Git Repository**, desactivar los deploys automaticos:
   - Opcion A: **Ignorar el branch `main`** en la configuracion de Git de Vercel
   - Opcion B: Ir a **Settings** > **General** > buscar **"Build & Development Settings"** y en la seccion de Git, desactivar "Auto-deploy"
   - Opcion C: Si no encuentras la opcion, puedes desconectar la integracion de GitHub en Vercel y solo usar el deploy via CLI (que es lo que hace el workflow `cd.yml`)

### Paso 5: Configurar Branch Protection en GitHub

Esto es lo que **bloquea el merge** si los tests fallan en el PR.

1. Ir al repositorio en GitHub
2. **Settings** > **Branches**
3. Click en **Add branch ruleset** (o **Add rule** si usas el formato clasico)
4. Branch name pattern: `main`
5. Activar **Require status checks to pass before merging**
6. Buscar y agregar estos checks:
   - `🐍 Backend — Full Test Suite`
   - `⚛️ Frontend — Full Test Suite + Build`
7. Activar **Require branches to be up to date before merging** (opcional pero recomendado)
8. Guardar

### Paso 6: Commit y push de los cambios

```bash
git add .github/workflows/
git add GUIA-CICD.md
git commit -m "ci: simplificar pipeline CI/CD, eliminar workflows de docs"
git push
```

---

## Verificacion

### Probar el CI (PR gate)
1. Crear una rama nueva desde `main`
2. Hacer un cambio cualquiera y push
3. Crear un PR hacia `main`
4. Verificar que el workflow `🔒 CI — Pull Request` se ejecuta
5. Si los tests pasan, el PR deberia estar habilitado para merge
6. Si fallan, el boton de merge deberia estar bloqueado

### Probar el CD (deploy)
1. Mergear el PR a `main`
2. Verificar que el workflow `🚀 CD — Deploy a Produccion` se ejecuta
3. Deberia correr tests y luego desplegar a Vercel
4. Verificar en el dashboard de Vercel que el deploy se completo

---

## Estructura final de workflows

```
.github/workflows/
├── ci.yml    # PR → main: tests (gate para merge)
└── cd.yml    # Push a main: tests + deploy a Vercel
```

## Troubleshooting

| Problema | Solucion |
|---|---|
| Deploy falla con "Project not found" | Ejecutar `vercel link` y agregar `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` como secrets |
| Deploy falla con "Invalid token" | Verificar que el secret `VERCEL_TOKEN` esta bien configurado |
| PR se puede mergear sin pasar tests | Verificar que los branch protection rules estan configurados (Paso 5) |
| El workflow no se ejecuta | Verificar que el archivo esta en `.github/workflows/` y tiene la sintaxis correcta |
| Vercel sigue desplegando automaticamente | Completar el Paso 4 para desactivar auto-deploy |
