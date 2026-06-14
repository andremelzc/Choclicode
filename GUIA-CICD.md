# Guia de Configuracion CI/CD

## Arquitectura del Pipeline

```
                    ┌──────────────────────────────────────────┐
                    │            REPOSITORIO GITHUB            │
                    └──────────────────┬───────────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
          Pull Request a main                         Push a main
                 │                                           │
           ┌─────┴─────┐                             ┌──────┴──────┐
           │  ci.yml    │                             │   cd.yml    │
           │  CI Gate   │                             │  CI + CD    │
           └─────┬─────┘                             └──────┬──────┘
                 │                                           │
      ┌──────────┴──────────┐                    ┌───────────┴──────────┐
      │                     │                    │                      │
  Backend Tests      Frontend Tests         Tests pasan            Tests fallan
      │                     │                    │                      │
      └──────────┬──────────┘             ┌──────┴──────┐          ❌ Se detiene
                 │                        │             │
          Resumen en PR            Deploy Frontend  Deploy Backend
                                   (Vercel)         (Render)
```

---

## Workflows

| Archivo | Trigger | Funcion |
|---------|---------|---------|
| `ci.yml` | PR hacia `main` | Ejecuta tests completos. Bloquea el merge si fallan. |
| `cd.yml` | Push a `main` (post-merge) | Ejecuta tests y, si pasan, despliega Frontend a Vercel y Backend a Render en paralelo. |
| `report-config-status.yml` | Manual (`workflow_dispatch`) | Genera reporte de estado de contabilidad de la configuracion. |
| `report-version.yml` | Manual (`workflow_dispatch`) | Genera reporte de versionado de un item especifico. |

---

## Configuracion Requerida

### 1. Secrets de GitHub

Ir a **GitHub > Settings > Secrets and variables > Actions** y agregar:

| Secret | Descripcion | Como obtenerlo |
|--------|-------------|----------------|
| `VERCEL_TOKEN` | Token de API de Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) > Create Token |
| `RENDER_DEPLOY_HOOK_URL` | URL del Deploy Hook de Render | Ver seccion 3 |

---

### 2. Configurar Vercel (Frontend)

#### 2.1 Obtener el token

1. Ir a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. **Create Token**
3. Nombre: `github-actions-deploy`
4. Scope: seleccionar el team/cuenta del proyecto
5. Copiar el token y guardarlo como secret `VERCEL_TOKEN` en GitHub

#### 2.2 Vincular el proyecto

Si el proyecto no esta vinculado, ejecutar localmente:

```bash
npm install -g vercel
cd "Desarrollo/CACIF/Codigo Fuente/Frontend"
vercel link
```

Esto genera `.vercel/project.json` con `orgId` y `projectId`. El comando `vercel pull` del workflow los usa automaticamente.

#### 2.3 Desactivar auto-deploy de Vercel

Esto es **critico**. Sin esto, Vercel despliega en cada push sin esperar los tests.

1. Ir al proyecto en [vercel.com](https://vercel.com)
2. **Settings > Git**
3. Desactivar los deploys automaticos para la rama `main`

> **Nota:** Si no encuentras la opcion, puedes desconectar la integracion de GitHub completamente desde Vercel. El workflow `cd.yml` se encarga del deploy via CLI.

---

### 3. Configurar Render (Backend)

#### 3.1 Crear el Deploy Hook

1. Ir al servicio del backend en [dashboard.render.com](https://dashboard.render.com)
2. **Settings > Deploy Hook**
3. Click en **Create Deploy Hook**
4. Copiar la URL generada (tiene formato `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)
5. Guardar como secret `RENDER_DEPLOY_HOOK_URL` en GitHub

#### 3.2 Desactivar auto-deploy de Render

1. Ir al servicio del backend en Render
2. **Settings > Build & Deploy**
3. En **Auto-Deploy**, seleccionar **No**

> **Nota:** Si dejas auto-deploy activado, Render desplegara en cada push sin esperar los tests, igual que con Vercel.

---

### 4. Branch Protection en GitHub

Esto bloquea el merge del PR si los tests no pasan.

1. Ir a **GitHub > Settings > Branches**
2. **Add branch ruleset** (o Add rule)
3. Branch name pattern: `main`
4. Activar **Require status checks to pass before merging**
5. Agregar estos checks como requeridos:
   - `🐍 Backend — Full Test Suite`
   - `⚛️ Frontend — Full Test Suite + Build`
6. (Opcional) Activar **Require branches to be up to date before merging**
7. Guardar

---

## Verificacion

### Probar CI (gate de PR)

1. Crear rama desde `main`
2. Hacer un cambio y push
3. Crear PR hacia `main`
4. Verificar que `🔒 CI — Pull Request` se ejecuta
5. Si los tests pasan → merge habilitado
6. Si fallan → merge bloqueado

### Probar CD (deploy)

1. Mergear un PR a `main`
2. Verificar que `🚀 CD — Deploy a Produccion` se ejecuta
3. Verificar los jobs de deploy:
   - `🌐 Deploy Frontend — Vercel` → verificar en dashboard de Vercel
   - `🖥️ Deploy Backend — Render` → verificar en dashboard de Render

---

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| Vercel: "Project not found" | Ejecutar `vercel link` localmente y verificar que `.vercel/project.json` existe |
| Vercel: "Invalid token" | Verificar que `VERCEL_TOKEN` esta correcto en GitHub Secrets |
| Render: deploy no se activa | Verificar que `RENDER_DEPLOY_HOOK_URL` esta correcto y el servicio esta activo |
| Render: deploy hook retorna 4xx | Regenerar el deploy hook en Render y actualizar el secret |
| PR se puede mergear sin tests | Configurar branch protection rules (seccion 4) |
| Workflow no se ejecuta | Verificar que el archivo esta en `.github/workflows/` con sintaxis YAML valida |
| Vercel/Render despliegan sin esperar tests | Desactivar auto-deploy en ambas plataformas (secciones 2.3 y 3.2) |

---

## Estructura final

```
.github/workflows/
├── ci.yml                      # PR → main: tests (gate para merge)
├── cd.yml                      # Push a main: tests + deploy (Vercel + Render)
├── report-config-status.yml    # Manual: reporte de configuracion
└── report-version.yml          # Manual: reporte de versionado
```
