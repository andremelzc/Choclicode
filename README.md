# CACIF — Chatbot de Investigaciones FISI

Chatbot web con arquitectura **RAG** para la Unidad de Investigacion de la FISI-UNMSM. Responde consultas de estudiantes sobre grupos de investigacion, convocatorias, tramites de tesis y normativa academica.

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Cristobal Rojas, Mihael Jhire | Desarrollador / Tester |
| Mantari Flores, Fabrizio Armando | Arquitecto de Software / DBA |
| Melendez Cava, Andre Ivan | Project Manager / Diseñador UX |
| Solis Cunza, Miguel Alonso | Desarrollador / Analista QA |

**Empresa:** Choclicode | **Cliente:** FISI-UNMSM | **Sponsor:** Rosario Zapata (Secretaria UI-FISI)

---

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│  FRONTEND — React + Tailwind (Vercel)           │
│  SPA conversacional, JWT auth, responsive       │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│  BACKEND — FastAPI + Python 3.11 (Render)       │
│  API REST, Intent Classifier, Chat Manager      │
│  Auth Middleware (JWT HS256)                     │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  IA & DATOS                                     │
│  Google Gemini (LLM + Embeddings 1536d)         │
│  Azure AI Search (busqueda vectorial)           │
│  Supabase / PostgreSQL 16 (historial, usuarios) │
└─────────────────────────────────────────────────┘
```

---

## Stack Tecnologico

| Categoria | Tecnologia | Rol |
|-----------|------------|-----|
| Frontend | React 18 + Tailwind 3 | SPA del chatbot |
| Backend | FastAPI (Python 3.11) | API REST asincrona |
| IA / RAG | LangChain + Google Gemini | Pipeline RAG |
| Busqueda vectorial | Azure AI Search | Embeddings + similitud coseno |
| Base de datos | Supabase (PostgreSQL 16) | Historial, usuarios, auditoria |
| Deploy Frontend | Vercel | Hosting SPA |
| Deploy Backend | Render (Docker) | Hosting API |
| Testing | Pytest + Vitest | Unit tests backend/frontend |
| CI/CD | GitHub Actions | Tests automatizados + deploy |

---

## Flujo RAG

```
Pregunta del usuario
    │
    ▼
Auth (JWT) ──── invalido ──▶ 401
    │
    ▼
Intent Classifier ──▶ CU01 | CU02 | CU03 | CU04
    │
    ▼
Embedding (Gemini) ──▶ Vector 1536d
    │
    ▼
Azure AI Search (top-K, umbral > 0.75)
    │
    ▼
Prompt aumentado con chunks
    │
    ▼
Gemini LLM ──▶ Respuesta en español academico
    │
    ▼
Guardar en Supabase + retornar al frontend
```

---

## Casos de Uso

| CU | Nombre | Descripcion |
|----|--------|-------------|
| CU01 | Orientacion y Seleccion de GI | Busqueda de grupos por palabras clave, lineas de investigacion, matchmaking |
| CU02 | Gestion de Convocatorias | Vacantes, cronogramas, enlace para postular |
| CU03 | Asesoria Administrativa | Tramites de tesis, convalidacion PPP, beneficios academicos |
| CU04 | Marco Normativo | Derechos de miembros, oficialidad de grupos, normativa antiplagio |

---

## Estructura del Repositorio

```
Choclicode/
├── .github/workflows/       # CI/CD (ci.yml, cd.yml, reportes)
├── Desarrollo/CACIF/
│   ├── Analisis/            # Casos de uso, requisitos, documento de negocio
│   ├── Codigo Fuente/
│   │   ├── Backend/         # FastAPI + motor RAG
│   │   └── Frontend/        # React SPA
│   ├── Diseño/              # Arquitectura, mockups, prompts RAG
│   └── Gestion/             # Plan de pruebas, project charter
├── Documentos/              # Plan de gestion de configuracion
└── Linea Base/              # Snapshots de artefactos por hito
```

---

## CI/CD

| Workflow | Trigger | Funcion |
|----------|---------|---------|
| `ci.yml` | PR a `main` | Tests completos (backend + frontend). Bloquea merge si fallan. |
| `cd.yml` | Push a `main` | Tests + deploy: Frontend a Vercel, Backend a Render. |

Ver [GUIA-CICD.md](GUIA-CICD.md) para instrucciones de configuracion.

---

## Modelo de Datos

```
ESTUDIANTE ──1:N──▶ CONVERSACION ──1:N──▶ MENSAJE ──1:N──▶ FUENTE_CITADA
                                                                  │
DOCUMENTO_NORMATIVO ──1:N──▶ CHUNK_NORMATIVO ◄────────────────────┘
```

6 tablas en PostgreSQL 16: `estudiante`, `conversacion`, `mensaje`, `documento_normativo`, `chunk_normativo`, `fuente_citada`.

---

## Seguridad

| Capa | Control |
|------|---------|
| Autenticacion | Mock JWT (HS256) para MVP; SSO UNMSM OAuth 2.0 post-MVP |
| Autorizacion | Middleware JWT en cada endpoint protegido |
| Transito | HTTPS obligatorio (TLS automatico via Vercel/Render) |
| Secrets | Variables de entorno, nunca en el repositorio |
| Datos | Historial asociado a `user_id` con Supabase RLS |

---

## Metricas de Calidad RAG

| Metrica | Objetivo |
|---------|----------|
| Tiempo de respuesta | < 20s |
| Score de similitud | > 0.75 coseno |
| Respuestas con fuente citada | > 85% |
| Alucinaciones | < 10% |

---

## Cronograma

| Hito | Fecha | Entregables |
|------|-------|-------------|
| Analisis | 10/05/2026 | Project Charter, Documento de Negocio, Requisitos, CU01-CU04 |
| Diseño | 18/05/2026 | Arquitectura, DER, Mockups, Base de Conocimientos, Logs |
| Desarrollo | 04/06/2026 | Codigo fuente frontend + backend + motor RAG |
| QA | 11/06/2026 | Reportes de ejecucion, Metricas IA, Validacion, Backlog |
| Deploy | 18/06/2026 | Manual Tecnico, Manual de Usuario, Acta de Cierre |

---

## Lineas Base

| LB | Hito | Fecha |
|----|------|-------|
| LB-1 | Analisis completo | 10/05/2026 |
| LB-2 | Diseño completo | 18/05/2026 |
| LB-3 | Desarrollo completado | 04/06/2026 |
| LB-4 | QA aprobado | 11/06/2026 |
| LB-5 | Despliegue y cierre | 18/06/2026 |

---

## Artefactos del Proyecto

| Fase | Artefacto | Codigo |
|------|-----------|--------|
| Analisis | Project Charter | `CACIF-PC.docx` |
| Analisis | Matriz de Requisitos | `CACIF-MR.xlsx` |
| Analisis | Requisitos No Funcionales | `CACIF-RNF.xlsx` |
| Analisis | Documento de Negocio | `CACIF-DN.docx` |
| Analisis | Casos de Uso 01-04 | `CACIF-CU01.docx` — `CACIF-CU04.docx` |
| Diseño | Documento de Arquitectura | `CACIF-DAS.docx` |
| Diseño | Diagrama Entidad-Relacion | `CACIF-DER.docx` |
| Diseño | Base de Conocimiento | `CACIF-BDC.docx` |
| Diseño | Logs y Trazabilidad | `CACIF-ELT.docx` |
| Diseño | Mockups Web | `CACIF-DIUX.docx` |
| Diseño | Matriz de Casos de Prueba | `CACIF-CP.xlsx` |
| Desarrollo | Reportes de Ejecucion | `CACIF-REP-01.xlsx`, `CACIF-REP-02.xlsx` |
| QA | Metricas IA | `CACIF-RMIA.xlsx` |
| QA | Informe de Validacion | `CACIF-IV.docx` |
| QA | Backlog de Errores | `CACIF-BE.xlsx` |
| QA | Acta de QA | `CACIF-AQA.docx` |
| Despliegue | Manual Tecnico | `CACIF-MT.docx` |
| Despliegue | Manual de Usuario | `CACIF-MUS.docx` |
| Despliegue | Acta de Cierre | `CACIF-AC.docx` |
| Config. | Plan de Gestion de Configuracion | `CACIF-PGC.docx` |

---

## Contacto

| Rol | Nombre |
|-----|--------|
| Project Manager | Andre Melendez Cava |
| Sponsor | Rosario Zapata (Secretaria UI-FISI) |
| Unidad de Investigacion | investigacion.fisi@unmsm.edu.pe |

---

<div align="center">

**CACIF** · Choclicode · 2026
*FISI — UNMSM*

</div>
