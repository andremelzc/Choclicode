# 🤖 CACIF — Chatbot para la Atención de Consultas de Investigaciones de la FISI

> **Chatbot web inteligente basado en arquitectura RAG** para estudiantes y docentes de la Facultad de Ingeniería de Sistemas e Informática (FISI) — Universidad Nacional Mayor de San Marcos (UNMSM)

---

## 👥 Equipo — "Galácticos" · Choclicode · 2026-1

| Nombre | Rol en el Proyecto |
|---|---|
| **Cristobal Rojas, Mihael Jhire** | Desarrollador / Tester |
| **Mantari Flores, Fabrizio Armando** | Arquitecto de Software / DBA |
| **Melendez Cava, Andre Ivan** | Project Manager / Diseñador UX |
| **Solis Cunza, Miguel Alonso** | Desarrollador / AnalistaQA |

**Empresa:** Choclicode  
**Cliente:** Facultad de Ingeniería de Sistemas e Informática — UNMSM  
**Sponsor:** Rosario Zapata (Secretaria de la Unidad de Investigación, FISI)

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Contexto de Negocio](#-contexto-de-negocio)
3. [Casos de Uso del Sistema](#-casos-de-uso-del-sistema)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Flujo del Pipeline RAG](#-flujo-del-pipeline-rag)
6. [Stack Tecnológico](#-stack-tecnológico)
7. [Estructura del Repositorio](#-estructura-del-repositorio)
8. [Índice de Documentos](#-índice-de-documentos)
9. [Modelo de Datos](#-modelo-de-datos)
10. [Diseño UI/UX](#-diseño-uiux)
11. [Base de Conocimientos](#-base-de-conocimientos)
12. [Logs y Trazabilidad](#-logs-y-trazabilidad)
13. [Gestión de la Configuración](#-gestión-de-la-configuración)
14. [Cronograma e Hitos](#-cronograma-e-hitos)
15. [Presupuesto](#-presupuesto)
16. [Artefactos del Proyecto](#-artefactos-del-proyecto)

---

## 🎯 Descripción del Proyecto

**CACIF** es una aplicación web de tipo chatbot basada en arquitectura **RAG (Retrieval-Augmented Generation)** que permite a cualquier usuario consultar información sobre investigaciones de la FISI de manera interactiva, en lenguaje natural, las 24 horas del día.

### Problema que resuelve

La Unidad de Investigación de la FISI recibía consultas repetitivas de estudiantes sobre grupos de investigación, convocatorias, trámites de tesis y normativa académica, generando una alta carga operativa en la secretaría. La información estaba dispersa en múltiples canales (redes sociales, correo, tablones físicos) y no había un canal centralizado de atención.

### Solución

Un chatbot conversacional que:
- Responde consultas en lenguaje natural 24/7
- Recupera información oficial desde una base de conocimientos estructurada (reglamentos, fichas de GI, directivas)
- Guía a los estudiantes a través de 4 flujos especializados según su intención
- Reduce la carga operativa de la secretaría al automatizar respuestas frecuentes

---

## 🏢 Contexto de Negocio

La FISI-UNMSM gestiona actualmente 4 procesos críticos de manera **100% manual**:

| Proceso | Responsable | Frecuencia | Problema Principal |
|---|---|---|---|
| **PROC-001** Difusión de Convocatorias | Secretaria | ≥5 correos/mes por convocatoria | Monitoreo manual del portal VRIP, sin automatización |
| **PROC-002** Publicación de Artículos | Secretaria | Mensual (Mar, Abr, May, Jun, Jul, Nov) | Cruce manual de datos en Excel desde el RAIS |
| **PROC-003** Monitoreo de Proyectos | Secretaria | Continuo + a demanda | Base de datos interna en Excel sin integración oficial |
| **PROC-004** Difusión de Actividades | Secretaria | Según surjan actividades | Proceso de aprobación manual con la Decana |

El CACIF automatiza la **capa de atención informativa** de estos procesos, absolviendo las consultas frecuentes sin intervención humana.

---

## 🧩 Casos de Uso del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA CACIF                                │
│                                                                 │
│   ┌──────────┐    ┌───────────────────────────────────────┐    │
│   │          │───▶│  CU01 · Orientación y Selección de GI │    │
│   │          │    │  Buscar grupos por palabras clave,     │    │
│   │          │    │  líneas de investigación o matchmaking │    │
│   │          │    └───────────────────────────────────────┘    │
│   │          │                                                  │
│   │ ESTU-    │    ┌───────────────────────────────────────┐    │
│   │ DIANTE   │───▶│  CU02 · Gestión de Convocatorias      │    │
│   │          │    │  Ver vacantes, cronogramas y enlace    │    │
│   │          │    │  directo para postular                 │    │
│   │          │    └───────────────────────────────────────┘    │
│   │          │                                                  │
│   │  (Actor  │    ┌───────────────────────────────────────┐    │
│   │ principal│───▶│  CU03 · Asesoría Administrativa       │    │
│   │   )      │    │  Trámites de tesis, convalidación PPP  │    │
│   │          │    │  y beneficios académicos               │    │
│   │          │    └───────────────────────────────────────┘    │
│   │          │                                                  │
│   │          │    ┌───────────────────────────────────────┐    │
│   │          │───▶│  CU04 · Marco Normativo                │    │
│   │          │    │  Derechos de miembros, oficialidad     │    │
│   └──────────┘    │  de grupos y normativa antiplagio      │    │
│                   └───────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Detalle por Caso de Uso

| CU | Nombre | RF Cubiertos | Descripción |
|---|---|---|---|
| **CU01** | Orientación y Selección de GI | RF01, RF02, RF03 | Búsqueda por palabras clave, filtrado por línea de investigación y matchmaking de perfil del estudiante con grupos activos |
| **CU02** | Gestión de Convocatorias | RF04, RF05, RF06 | Consulta de vacantes y perfiles requeridos, visualización de cronogramas y redirección al proceso de postulación |
| **CU03** | Asesoría Administrativa para Tesistas | RF07, RF08, RF09 | Guía de registro de plan de tesis (máx. 2 autores), convalidación de horas de investigación como PPP y beneficios académicos |
| **CU04** | Consultor de Derechos y Marco Normativo | RF10, RF11, RF12 | Categorías de miembros (titular/adherente/estudiante), normativa PIDS/Turnitin (máx. 20% similitud) y verificación de oficialidad de grupos |

---

## 🏛️ Arquitectura del Sistema

El sistema adopta una **arquitectura en capas** con un núcleo de procesamiento basado en el patrón RAG:

```
┌──────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                       │
│                                                              │
│   React.js SPA (PWA)  ◄──────────────────────────────────   │
│   · Interfaz de chat conversacional                          │
│   · Mock JWT para MVP (SSO UNMSM planificado post-MVP)       │
│   · Historial de conversaciones                              │
│   · Diseño responsive: Mobile / Tablet / Desktop            │
│                                                              │
│   Desplegado en: Vercel (free tier)                         │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS / TLS
┌──────────────────────────▼───────────────────────────────────┐
│                   CAPA DE APLICACIÓN (Backend)               │
│                                                              │
│   ┌────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│   │  API Gateway   │  │ Intent          │  │    Chat     │  │
│   │  FastAPI       │  │ Classifier      │  │   Manager   │  │
│   │  (Rate limit,  │  │ (detecta CU01   │  │ (sesiones,  │  │
│   │   CORS)        │  │  CU02 CU03 CU04)│  │  historial) │  │
│   └────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                              │
│   Auth Middleware (JWT HS256) — FastAPI Depends             │
│   Desplegado en: Render (Docker container)                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   CAPA DE IA Y DATOS                         │
│                                                              │
│   ┌──────────────────┐        ┌────────────────────────────┐ │
│   │  Google Gemini   │        │    Azure AI Search         │ │
│   │  (LLM + Embed.)  │◄──────▶│    (Base vectorial FAQs    │ │
│   │  gemini-1.5-flash│        │     + embeddings 1536 dims)│ │
│   └──────────────────┘        └────────────────────────────┘ │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  Supabase / PostgreSQL 16                            │   │
│   │  (Historial conversaciones, usuarios, mensajes,      │   │
│   │   chunks normativos, fuentes citadas)                │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   Base normativa: PDFs procesados offline con               │
│   PyMuPDF / Unstructured → Azure AI Search                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo del Pipeline RAG

```
Usuario escribe consulta
         │
         ▼
┌────────────────────┐
│  POST /chat        │
│  (API Gateway)     │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐     Token inválido
│  Auth Middleware   │────────────────────▶  401 Unauthorized
│  (Valida JWT)      │
└────────┬───────────┘
         │ Token OK
         ▼
┌────────────────────┐
│  Intent Classifier │──▶ Detecta: CU01 | CU02 | CU03 | CU04
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Generar Embedding │
│  (Google Gemini)   │──▶  Vector 1536 dimensiones
└────────┬───────────┘
         │
         ▼
┌────────────────────┐     Score < 0.75
│  Azure AI Search   │────────────────────▶  WARN: score_bajo
│  (Top-K chunks,    │                        Respuesta con
│   similitud coseno │                        confianza baja
│   umbral > 0.75)   │
└────────┬───────────┘
         │ Chunks relevantes recuperados
         ▼
┌────────────────────┐
│  Construir prompt  │
│  aumentado con     │
│  chunks + contexto │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐     Timeout > 20s
│  Google Gemini LLM │────────────────────▶  ERROR: llm_timeout
│  (Genera respuesta │                        Mensaje controlado
│   en español       │                        al usuario
│   académico)       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Chat Manager      │──▶  Retorna respuesta al frontend
│  + Supabase        │──▶  Guarda historial en PostgreSQL
└────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión | Rol |
|---|---|---|---|
| Frontend | React.js | 18.x | SPA del chatbot |
| Frontend | Tailwind CSS | 3.x | Estilos responsive |
| Backend | Python | 3.11 | Lenguaje principal |
| Backend | FastAPI | 0.110+ | API REST asíncrona |
| IA / RAG | LangChain | 0.2+ | Orquestación del pipeline |
| IA / LLM | Google Gemini API | gemini-1.5-flash | Generación de texto y embeddings |
| Búsqueda vectorial | Azure AI Search | Free tier | Almacenamiento de embeddings |
| Base de datos | Supabase (PostgreSQL 16) | Cloud free | Historial y auditoría |
| Procesam. PDF | PyMuPDF / Unstructured | Latest | Ingesta offline de reglamentos |
| Contenedores | Docker | 24+ | Empaquetado del backend |
| Deploy Frontend | Vercel | — | Hosting + CI/CD frontend |
| Deploy Backend | Render | — | Hosting del backend FastAPI |
| Control de versiones | GitHub | — | Repositorio + CI/CD |
| Testing | Pytest + Playwright | Latest | Pruebas unitarias y E2E |

---

## 📁 Estructura del Repositorio

<!-- REPO-STRUCTURE-START -->

```
📁 Choclicode/
├── 📄 README.md
├── 📁 Desarrollo/
│   └── 📁 CACIF/
│       ├── 📁 Analisis/
│       │   ├── 📄 CACIF-CU01.docx
│       │   ├── 📄 CACIF-CU02.docx
│       │   ├── 📄 CACIF-CU03.docx
│       │   ├── 📄 CACIF-CU04.docx
│       │   ├── 📄 CACIF-DN.docx
│       │   ├── 📄 CACIF-MR.xlsx
│       │   └── 📄 CACIF-RNF.xlsx
│       ├── 📁 Cronograma/
│       │   └── 📄 CACIF-CP.xlsx
│       ├── 📁 Diseño/
│       │   ├── 📄 CACIF-CPRAG.docx
│       │   ├── 📄 CACIF-DA.docx
│       │   ├── 📄 CACIF-EBC.docx
│       │   ├── 📄 CACIF-ELT.docx
│       │   └── 📄 CACIF-MD.docx
│       └── 📁 Gestión/
│           └── 📄 CACIF-PC.docx
├── 📁 Documentos/
│   └── 📁 Planes/
│       └── 📄 CACIF-PGC.docx
└── 📁 Linea Base/
    └── 📁 CACIF/
        └── 📁 Linea Base 01/
            ├── 📄 CACIF-CU01.docx
            ├── 📄 CACIF-CU02.docx
            ├── 📄 CACIF-CU03.docx
            ├── 📄 CACIF-CU04.docx
            ├── 📄 CACIF-DN.docx
            ├── 📄 CACIF-MR.xlsx
            ├── 📄 CACIF-PC.docx
            └── 📄 CACIF-RNF.xlsx
```

> 🤖 *Estructura generada automáticamente vía GitHub Actions.*

<!-- REPO-STRUCTURE-END -->

> **Nota sobre la nomenclatura:** Todos los artefactos siguen el estándar definido en el Plan de Gestión de Configuración:
> - `[Acrónimo Proyecto]-[Acrónimo Ítem].[Extensión]` → ej. `CACIF-DAS.docx`
> - Cuando el ítem se instancia por elemento: `[Acrónimo Proyecto]-[Acrónimo Ítem][NN]` → ej. `CACIF-CU01.docx`

---

## 📋 Índice de Documentos

<!-- DOCS-INDEX-START -->

| Tipo | Cantidad |
|---|---|
| 📝 Documentos Word (.docx) | **19** |
| 📊 Hojas de cálculo (.xlsx) | **5** |
| 📄 **Total** | **24** |


#### 📁 `Desarrollo/CACIF/Analisis/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📝 | `CACIF-CU01.docx` | 2026-05-10 | Miguel Solis |
| 📝 | `CACIF-CU02.docx` | 2026-05-10 | Mantari Flores Fabrizio Armando |
| 📝 | `CACIF-CU03.docx` | 2026-05-07 | andremelzc |
| 📝 | `CACIF-CU04.docx` | 2026-05-10 | Mihael Cristobal |
| 📝 | `CACIF-DN.docx` | 2026-05-14 | andremelzc |
| 📊 | `CACIF-MR.xlsx` | 2026-05-03 | Miguel Solis |
| 📊 | `CACIF-RNF.xlsx` | 2026-05-09 | Mantari Flores Fabrizio Armando |

#### 📁 `Desarrollo/CACIF/Cronograma/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📊 | `CACIF-CP.xlsx` | 2026-05-14 | andremelzc |

#### 📁 `Desarrollo/CACIF/Diseño/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📝 | `CACIF-CPRAG.docx` | 2026-05-14 | Miguel Solis |
| 📝 | `CACIF-DA.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-DI.docx` | 2026-05-17 | Mihael Cristobal |
| 📝 | `CACIF-EBC.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-ELT.docx` | 2026-05-13 | Mantari Flores Fabrizio Armando |
| 📝 | `CACIF-MD.docx` | 2026-05-14 | andremelzc |

#### 📁 `Desarrollo/CACIF/Gestión/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📝 | `CACIF-PC.docx` | 2026-05-14 | andremelzc |

#### 📁 `Documentos/Planes/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📝 | `CACIF-PGC.docx` | 2026-05-16 | Mihael Cristobal |

#### 📁 `Linea Base/CACIF/Linea Base 01/`

| | Documento | Última modificación | Autor |
|---|---|---|---|
| 📝 | `CACIF-CU01.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-CU02.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-CU03.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-CU04.docx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-DN.docx` | 2026-05-14 | andremelzc |
| 📊 | `CACIF-MR.xlsx` | 2026-05-14 | andremelzc |
| 📝 | `CACIF-PC.docx` | 2026-05-14 | andremelzc |
| 📊 | `CACIF-RNF.xlsx` | 2026-05-14 | andremelzc |

> 🤖 *Índice generado automáticamente vía GitHub Actions.*

<!-- DOCS-INDEX-END -->

---

## 🗄️ Modelo de Datos

El modelo relacional en **PostgreSQL 16** cubre 6 tablas principales:

```
ESTUDIANTE                    DOCUMENTO_NORMATIVO
───────────────────           ─────────────────────────
PK  id (UUID)                 PK  id (UUID)
    university_code               name (VARCHAR 300)
    full_name                     type (ENUM: reglamento│
    email                               resolucion│directiva)
    created_at                    official_code
    is_active                     source_url
    │                             published_at
    │ 1:N                         is_active
    ▼                             ingested_at
CONVERSACION                        │
────────────────────                │ 1:N
PK  id (UUID)                       ▼
FK  student_id               CHUNK_NORMATIVO
    intent_type (ENUM:        ──────────────────────────
      CU01│CU02│CU03│CU04)   PK  id (UUID)
    started_at               FK  document_id
    closed_at (nullable)         source_document
    total_messages               start_page / end_page
    │                            content (TEXT ~512 tokens)
    │ 1:N                        embedding (VECTOR 1536)
    ▼                            version
MENSAJE                          valid_from
─────────────────                created_at
PK  id (UUID)                        │
FK  conversation_id                  │ N:1 (vía FUENTE_CITADA)
    role (ENUM: user│assistant)      │
    content (TEXT)           FUENTE_CITADA
    tokens_used              ─────────────────────────
    rag_confidence           PK  id (UUID)
    sent_at                  FK  message_id
    │                        FK  chunk_id
    │ 1:N                        position (orden en contexto)
    ▼                            similarity_score (coseno)
    └──────────────────────▶ FUENTE_CITADA
```

---

## 🎨 Diseño UI/UX

### Identidad Visual

El sistema adopta una **identidad oscura y profesional**, coherente con el contexto académico universitario.

**Paleta de colores:**

| Rol | Hex | Uso |
|---|---|---|
| Fondo principal | `#0D1117` / `#111827` | Fondo de página y sidebar |
| Superficie card | `#1E2A3A` / `#1F2937` | Cards de respuesta del chatbot |
| Acento primario | `#5C6BC0` / `#6366F1` | Botones, logo, tags activos |
| Texto principal | `#FFFFFF` / `#F9FAFB` | Títulos y mensajes |
| Alerta crítica | `#7F1D1D` | Restricciones normativas |
| Alerta advertencia | `#78350F` | Alcance limitado |
| Confirmación | `#064E3B` | Siguiente paso exitoso |
| Estado operativo | `#10B981` | Indicador verde activo |

**Tipografía:** Inter / System-UI en variantes Regular, Semibold y Bold (12px – 16px)

### Pantallas Principales

| Pantalla | Descripción |
|---|---|
| **Login** | Autenticación con código de estudiante + contraseña institucional. Mock JWT para MVP |
| **Home / Nueva Conversación** | Mensaje de bienvenida + 4 botones de acceso rápido (uno por CU) |
| **Chat CU01** | Cards de grupos con coordinador, línea de investigación y filtros seleccionables |
| **Chat CU02** | Cards de convocatorias con vacantes, cronograma visual y botón CTA para postular |
| **Chat CU03** | Guía administrativa con alertas normativas, checklist de documentos y formularios descargables |
| **Chat CU04** | Verificación de oficialidad con número de resolución, tabla de categorías y política de similitud |

### Breakpoints Responsive

| Dispositivo | Rango | Estrategia |
|---|---|---|
| Mobile | < 768px | Sidebar oculto (menú hamburguesa), botones en columna vertical, input fijo al fondo |
| Tablet | 768px – 1023px | Sidebar compacto (72px, solo iconos), grid 2x2 para botones rápidos |
| Desktop | ≥ 1024px | Layout completo con sidebar expandido |

---

## 📚 Base de Conocimientos

CACIF adopta una **arquitectura QA** (pares pregunta-respuesta) en lugar de RAG clásico con chunks crudos:

```
┌─────────────────────────────────────────────────────┐
│  GENERACIÓN DE FAQs (proceso offline)               │
│                                                     │
│  Reglamentos PDF ──▶ Gemini (prompt estructurado)   │
│                           │                         │
│                           ▼                         │
│                    FAQs en JSON ──▶ Revisión manual  │
│                                        │            │
│                                        ▼            │
│                               Azure AI Search       │
│                               (embedding + índice)  │
└───────────────────────────┬─────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│  CONSULTA EN TIEMPO REAL                            │
│                                                     │
│  Pregunta del usuario                               │
│       │                                             │
│       ▼                                             │
│  Embedding de la pregunta                           │
│       │                                             │
│       ▼                                             │
│  Búsqueda semántica en Azure AI Search              │
│  (filtra por caso_uso + similitud vectorial)        │
│       │                                             │
│       ▼                                             │
│  FAQs más similares recuperadas                     │
│       │                                             │
│       ▼                                             │
│  Gemini sintetiza en tono conversacional            │
│  con cita a fuente + contacto de referencia         │
└─────────────────────────────────────────────────────┘
```

### Documentos Fuente

| ID | Documento | CUs | FAQs estimadas |
|---|---|---|---|
| DOC-01 | Reglamento General de Grupos de Investigación UNMSM | CU01, CU04 | 15–20 |
| DOC-02 | Fichas de Grupos de Investigación FISI | CU01 | ~10 (1 por GI) |
| DOC-03 | Directivas de convocatorias activas | CU02 | 8–12 |
| DOC-04 | Reglamento de Grados y Títulos FISI | CU03 | 20–25 |
| DOC-05 | Manual de Procedimientos del Tesista FISI | CU03 | 10–15 |
| DOC-06 | RR N° 000947-2026-R (Directiva PIDS / Turnitin) | CU04 | 8–10 |
| DOC-07 | Estatuto Universitario UNMSM — artículos de investigación | CU03, CU04 | 5–8 |

---

## 📊 Logs y Trazabilidad

Todos los eventos del sistema se registran en formato **JSON estructurado (NDJSON)**:

```json
{
  "timestamp": "2026-05-12T14:32:01.452Z",
  "level":     "INFO",
  "service":   "cacif-backend",
  "event":     "consulta_recibida",
  "session_id":"a1b2c3d4",
  "user_id":   "uuid-estudiante",
  "intent":    "CU03",
  "latencia_ms": 0
}
```

### Niveles de Log

| Nivel | Cuándo | Ejemplo en CACIF |
|---|---|---|
| `DEBUG` | Desarrollo y diagnóstico | Embedding generado, prompt construido |
| `INFO` | Eventos normales | Consulta recibida, respuesta enviada |
| `WARN` | Inesperado pero no crítico | Score RAG < 0.75, latencia > 15s |
| `ERROR` | Fallos que requieren atención | LLM timeout, fallo BD, JWT inválido |

### Cadena de Trazabilidad

Toda consulta es rastreable de extremo a extremo usando `session_id`:

```
[auth] sesion_iniciada
   │
   └─▶ [chat-manager] consulta_recibida
           │
           └─▶ [chat-manager] intent_clasificado → CU03
                   │
                   └─▶ [rag-engine] embedding_generado (1536 dims)
                           │
                           └─▶ [rag-engine] chunks_recuperados (top_k=5, score=0.91)
                                   │
                                   └─▶ [rag-engine] llm_respuesta_ok (10.2s)
                                           │
                                           └─▶ [chat-manager] respuesta_enviada
                                                   │
                                                   └─▶ [db] historial_guardado
```

---

## ⚙️ Gestión de la Configuración

### Herramienta Seleccionada: GitHub ✅

Elegida por benchmarking ponderado frente a GitLab, Bitbucket, GitKraken y Mercurial:

| Herramienta | Puntaje (sobre 5) |
|---|---|
| **GitHub** | **4.65** ✅ |
| GitLab | 4.10 |
| Bitbucket | 3.10 |
| Mercurial | 2.60 |
| GitKraken | 2.50 |

### Estrategia de Ramas

```
main  ←──── (solo versiones validadas por QA)
  │
  ├── develop  ←──── (integración continua del equipo)
  │     │
  │     ├── feature/CU01-matchmaking
  │     ├── feature/CU02-convocatorias
  │     ├── feature/CU03-asesoria-tesistas
  │     └── feature/CU04-marco-normativo
  │
  └── hotfix/  ←──── (correcciones urgentes en producción)
```

### Líneas Base del Proyecto

| Línea Base | Hito Asociado | Fecha |
|---|---|---|
| LB-1 | Análisis completo (CUs + Matriz de Requisitos) | 10/05/2026 |
| LB-2 | Diseño completo (Arquitectura + DER + Mockups) | 18/05/2026 |
| LB-3 | Desarrollo completado | 04/06/2026 |
| LB-4 | QA aprobado | 11/06/2026 |
| LB-5 | Despliegue y cierre | 18/06/2026 |

---

## 📅 Cronograma e Hitos

```
Abr 2026          May 2026                         Jun 2026
    │                 │                                 │
28/04        10/05   18/05              04/06   11/06  18/06
  │            │       │                 │        │      │
  ▼            ▼       ▼                 ▼        ▼      ▼
[INICIO]  [HITO 1] [HITO 2]         [HITO 3] [HITO 4] [HITO 5]
Kick-off  Análisis  Diseño          Desarrollo   QA    Deploy
                                                        Cierre
```

| Hito | Entregables Clave |
|---|---|
| **Hito 1 · Análisis** | Project Charter, Documento de Negocio, Matriz de Requisitos, CU01–CU04 |
| **Hito 2 · Diseño** | Arquitectura de Software, Diagrama ER, Mockups UI/UX, Base de Conocimientos, Logs |
| **Hito 3 · Desarrollo** | Código fuente frontend + backend + motor RAG desplegado |
| **Hito 4 · QA** | Reportes de ejecución, Métricas IA, Informe de Validación, Backlog de Errores |
| **Hito 5 · Despliegue** | Manual Técnico, Manual de Usuario, Acta de Cierre |

---

## 💰 Presupuesto

| Concepto | Horas | Monto (US$) |
|---|---|---|
| Kick-off y Project Charter | 16 h | $400 |
| Levantamiento de requerimientos | 58 h | $1,044 |
| Diseño de arquitectura y modelo de datos | 34 h | $856 |
| Diseño UI/UX y Mockups | 16 h | $256 |
| Diseño de Prompts RAG y Plan de Pruebas | 18 h | $356 |
| Configuración del entorno y repositorio | 4 h | $100 |
| Implementación del motor IA (RAG) | 20 h | $440 |
| Implementación de CU01–CU04 | 64 h | $1,344 |
| Ejecución de pruebas y corrección de bugs | 38 h | $664 |
| Evaluación de métricas IA y validación | 28 h | $553 |
| Manuales técnico y de usuario | 16 h | $368 |
| Despliegue y acta de cierre | 17 h | $389 |
| **Total Línea Base** | **329 h** | **$6,770** |
| Reserva de Contingencia (10%) | — | $677 |
| Reserva de Gestión (10%) | — | $677 |
| **Total Presupuesto** | — | **$8,124** |

---

## 📦 Artefactos del Proyecto

Lista completa de ítems de configuración según el Plan de GCS:

| Fase | Tipo | Artefacto | Nomenclatura |
|---|---|---|---|
| Análisis | Soporte | Project Charter | `CACIF-PC.docx` |
| Análisis | Evolución | Matriz de Requisitos Funcionales | `CACIF-MR.xlsx` |
| Análisis | Evolución | Requisitos No Funcionales | `CACIF-RNF.xlsx` |
| Análisis | Evolución | Documento de Negocio | `CACIF-DN.docx` |
| Análisis | Evolución | Caso de Uso 01 | `CACIF-CU01.docx` |
| Análisis | Evolución | Caso de Uso 02 | `CACIF-CU02.docx` |
| Análisis | Evolución | Caso de Uso 03 | `CACIF-CU03.docx` |
| Análisis | Evolución | Caso de Uso 04 | `CACIF-CU04.docx` |
| Diseño | Evolución | Documento de Arquitectura de Software | `CACIF-DAS.docx` |
| Diseño | Evolución | Diagrama Entidad-Relación | `CACIF-DER.docx` |
| Diseño | Fuente | Base de Conocimiento | `CACIF-BDC.docx` |
| Diseño | Evolución | Especificación de Logs y Trazabilidad | `CACIF-ELT.docx` |
| Diseño | Evolución | Mockups Web | `CACIF-DIUX.docx` |
| Diseño | Evolución | Matriz de Casos de Prueba | `CACIF-CP.xlsx` |
| Desarrollo | Soporte | Reporte de Ejecución 01 | `CACIF-REP-01.xlsx` |
| Desarrollo | Soporte | Reporte de Ejecución 02 | `CACIF-REP-02.xlsx` |
| QA y Calidad | Soporte | Reporte de Métricas IA | `CACIF-RMIA.xlsx` |
| QA y Calidad | Soporte | Informe de Validación Integral | `CACIF-IV.docx` |
| QA y Calidad | Soporte | Backlog de Errores | `CACIF-BE.xlsx` |
| QA y Calidad | Soporte | Acta de QA | `CACIF-AQA.docx` |
| Despliegue | Soporte | Manual Técnico | `CACIF-MT.docx` |
| Despliegue | Soporte | Manual de Usuario | `CACIF-MUS.docx` |
| Despliegue | Soporte | Acta de Cierre | `CACIF-AC.docx` |
| Config. | Soporte | Plan de Gestión de Configuración | `CACIF-PGC.docx` |

---

## 🔒 Seguridad

| Capa | Control | Herramienta |
|---|---|---|
| Autenticación | Mock JWT (HS256) para MVP; SSO UNMSM OAuth 2.0 planificado post-MVP | FastAPI + JWT |
| Autorización | Middleware JWT en cada endpoint protegido | FastAPI Depends |
| Datos en tránsito | HTTPS obligatorio | Vercel + Render (TLS automático) |
| Variables sensibles | Secrets de entorno, nunca en el repositorio | Render Secrets / Vercel Env |
| Historial de chat | Asociado al `user_id`; cada registro lleva el ID del estudiante | Supabase RLS |
| Perímetro | Firewall básico institucional | Configuración de red UNMSM |

---

## 📈 Criterios de Calidad del RAG

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Tiempo de respuesta | < 20 segundos | Logs del backend (`latencia_ms`) |
| Score de similitud mínimo | > 0.75 coseno | Umbral configurable en el RAG Handler |
| Tasa de respuestas con fuente citada | > 85% | Revisión manual por QA |
| Alucinaciones detectadas | < 10% | Revisión periódica con dataset de referencia |

---

## 📞 Contacto del Proyecto

| Rol | Nombre | Contacto de referencia |
|---|---|---|
| Project Manager | Andre Melendez Cava | Equipo Galácticos — Choclicode |
| Sponsor / Cliente | Rosario Zapata | Secretaria de Investigación FISI-UNMSM |
| Unidad de Investigación | — | investigacion.fisi@unmsm.edu.pe |

---

<div align="center">

**CACIF** · Choclicode · 2026  
*Facultad de Ingeniería de Sistemas e Informática — UNMSM*

</div>
