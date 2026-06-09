# Pendientes Técnicos — Backend y Frontend (Código)
> Chatbot FISI-RAG · Control de Defectos de Código
> Casos de prueba: CU01, CU02, CU03 y CU04

Este documento detalla exclusivamente los **defectos de software (bugs de código)** identificados en las pruebas de control de calidad (`CACIF-RE01` y `CACIF-RE02`), junto con los pasos específicos y archivos afectados para su resolución. Los problemas correspondientes a datos faltantes o curación de la base de conocimientos (RAG) se gestionan fuera del código del sistema.

---

## BUG-003 · Fallo en flujo de Matchmaking (CP-003)

**Afecta:** CU01 / RF03  
**Severidad:** Alta · **Prioridad:** Alta  
**Componentes Afectados:** 
- `Frontend/src/features/chat/components/ChatInput.tsx` (Componentes de flujo de Matchmaking)
- [Backend/prompts/prompts.py](Backend/prompts/prompts.py)

**Descripción:**  
El bot no detecta la intención de iniciar el cuestionario de perfil cuando el usuario hace una consulta genérica del tipo "¿qué grupo me recomiendas?". En lugar de lanzar el flujo interactivo (≤ 3 preguntas de perfil → recomendación con código GI-XX), responde con texto genérico sobre la normativa institucional.

**Plan de Acción (Arquitectura Stateless):**
Dado que el motor RAG actual es *stateless* (no guarda historial conversacional), el flujo de matchmaking debe gestionarse principalmente desde el **Frontend** para evitar múltiples llamadas al API que pierdan el contexto:
- [x] **Frontend (UI):** Implementar un flujo visual guiado (asistente, chatbot stepper o mini-formulario) que, al detectar la intención de recomendación, formule localmente 3 preguntas clave sin consultar al backend en cada paso:
  - *¿Qué áreas de tecnología te interesan más? (Ej: IA, Desarrollo Web, Ciberseguridad).*
  - *¿Qué lenguajes de programación o herramientas dominas? (Ej: Python, React).*
  - *¿Prefieres un enfoque orientado al desarrollo práctico o a la investigación teórica?*
- [x] **Integración Frontend a Backend:** Tras recolectar las respuestas del cuestionario local, el Frontend empaquetará los datos y enviará **una única petición consolidada** al API (Ej: *"Matchmaking: Intereses: IA, Lenguajes: Python, Enfoque: Práctico. Recomienda el grupo más adecuado."*).
- [x] **Backend (`Backend/prompts/prompts.py`):** Actualizar el `CACIF_SYSTEM_PROMPT` para que, al recibir esta consulta consolidada, el LLM entregue directamente la recomendación del grupo ideal (incluyendo ID GI-XX, coordinador y línea de investigación) basándose estrictamente en las FAQs.

---

## BUG-004 · Alucinación en consultas con tecnologías inexistentes (CP-004)

**Afecta:** CU01 / RF01 (Unhappy Path — Excepción EX1)  
**Severidad:** Media · **Prioridad:** Media  
**Componentes Afectados:**
- [Backend/prompts/prompts.py](Backend/prompts/prompts.py)

**Descripción:**  
Ante una consulta con una tecnología absurda o inexistente, el LLM intenta forzar su encaje en las líneas oficiales de la FISI citando normativa universitaria, en lugar de responder con el mensaje controlado de excepción EX1.

**Plan de Acción:**
- [x] **Backend (`Backend/prompts/prompts.py`):** Modificar la regla 7 (`EX1`) en el `CACIF_SYSTEM_PROMPT` para que sea más restrictiva e imperativa:
  - *"Regla EX1 (CU01): Si el usuario consulta por una tecnología, herramienta o grupo que NO esté de manera explícitamente en el contexto de las FAQs proporcionadas, responde obligatoriamente indicando que no cuentas con información sobre esa tecnología en las líneas de investigación oficiales de la FISI, y sugiere explorar el portal institucional. NO intentes relacionarla con normativa o líneas de investigación no alineadas."*

---

## BUG-005 · Error de renderizado en UI de convocatorias (CP-006)

**Afecta:** CU02 / RF04  
**Severidad:** Alta · **Prioridad:** Alta  
**Componentes Afectados:**
- [Backend/services/bedrock_rag_service.py](Backend/services/bedrock_rag_service.py)
- [Frontend/src/features/chat/components/MessageBubble.tsx](Frontend/src/features/chat/components/MessageBubble.tsx)

**Descripción:**  
Al mostrar resultados de convocatorias, aparecen etiquetas vacías al final del mensaje (`"Tipo:"`, `"Premio:"`, `"Documentos..."`). Esto indica que el componente de UI está intentando renderizar campos de un objeto `contest_data` que llega nulo o con propiedades mal mapeadas desde el backend.

**Plan de Acción:**
- [ ] **Backend (`Backend/services/bedrock_rag_service.py`):** El modelo Pydantic `StructuredAssistantResponse` no especifica las llaves requeridas para el objeto `contest_data` en el campo `ui_data`. Se debe actualizar la descripción del campo en Pydantic para indicarle explícitamente al LLM el esquema que espera el Frontend:
  - *Modificar la descripción de `ui_data` en `StructuredAssistantResponse` para `convocatoria_cards`:*
    `Para convocatoria_cards, la llave 'contest_data' debe contener una lista de objetos con: 'id', 'status_badge', 'status_label', 'title', 'contest_type', 'requirements' (lista de strings), 'prize', 'required_documents', 'apply_url', y 'timeline_events' (lista de objetos con 'title', 'date', 'status').`
- [ ] **Frontend (`Frontend/src/features/chat/components/MessageBubble.tsx`):** Añadir guardas preventivas en el renderizado del componente (líneas 121-213) para asegurar que si campos como `contest_type`, `prize` o `required_documents` no vienen provistos por el backend, se renderice un fallback legible (ej. "No especificado") en lugar de etiquetas vacías o nulas.

---

## BUG-007 · Clasificador de intenciones confunde CU01 con CU02 (CP-008)

**Afecta:** CU02 / RF06  
**Severidad:** Alta · **Prioridad:** Media  
**Componentes Afectados:**
- [Backend/services/bedrock_rag_service.py](Backend/services/bedrock_rag_service.py)

**Descripción:**  
Cuando el usuario consulta sobre postulación a un grupo específico, el clasificador de intenciones lo enruta al flujo de orientación general (CU01) en lugar del flujo de convocatorias (CU02). La palabra clave "postular" está siendo asociada incorrectamente de forma global o confundiendo al LLM.

**Plan de Acción:**
- [ ] **Backend (`Backend/services/bedrock_rag_service.py`):** Si bien en la clase `BedrockRAGService` el clasificador de intenciones final está delegado a la propiedad `intent_type` en el output estructurado de Gemini, la consulta recibe un `SystemMessage` general. Debemos:
  - Actualizar el modelo Pydantic y las instrucciones del SystemMessage (`CACIF_SYSTEM_PROMPT`) para desambiguar explícitamente: *"Si la consulta del usuario incluye términos como 'postular', 'inscribirme', 'vacantes', o 'postulación' hacia un grupo específico (ej. GI-XX o nombre del grupo), clasifica el caso obligatoriamente como CU02 (Convocatorias) y NO como CU01."*

---

## BUG-008 · El RAG no detecta convocatorias vencidas (CP-009, CP-010)

**Afecta:** CU02 / RF04, RF05  
**Severidad:** Alta · **Prioridad:** Alta  
**Componentes Afectados:**
- [Backend/services/bedrock_rag_service.py](Backend/services/bedrock_rag_service.py)

**Descripción:**  
El sistema no puede determinar si una convocatoria sigue activa o ya cerró, porque el motor RAG no tiene conocimiento de la fecha actual. Al consultar por una fecha límite que ya pasó (CP-010), el LLM asume que aún es válida o simplemente recita el texto sin advertir que ya venció, permitiendo flujos que deberían estar bloqueados.

**Plan de Acción:**
- [ ] **Backend (`Backend/services/bedrock_rag_service.py`):** En el método `run` de `BedrockRAGService`, modificar la construcción del `HumanMessage` que se envía a Gemini para inyectar dinámicamente la fecha y hora del sistema antes de procesar el contexto.
  - *Ejemplo de inyección:*
    ```python
    import datetime
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    # Inyectar en el prompt: "La fecha actual del sistema es: {current_date}. Usa esta fecha como referencia absoluta para determinar si las convocatorias del contexto están activas o vencidas."
    ```
- [ ] **Backend (`Backend/prompts/prompts.py`):** Asegurar en las directivas que el LLM compare la fecha inyectada con el cronograma y emita un mensaje informativo denegando la postulación si la fecha límite ya expiró.

---

## BUG-010 · Discrepancia de tipos en paginación (start_page, end_page, page)

**Afecta:** CU04 / RF11, RF12 (Y referencias generales del RAG)  
**Severidad:** Media · **Prioridad:** Alta  
**Componentes Afectados:**
- [DB/01_tables.sql](DB/01_tables.sql)
- [Backend/app/models.py](Backend/app/models.py)
- [Backend/app/schemas.py](Backend/app/schemas.py)
- [Frontend/src/types/chat.ts](Frontend/src/types/chat.ts)

**Descripción:**  
Ocurre un error de compatibilidad de tipos porque la base de datos almacena números de página como `INTEGER`, pero las respuestas dinámicas del LLM y del motor RAG de Bedrock retornan cadenas de texto (ej. `"12"`, `"12-b"` o `"ix"`). Esto provoca fallas de compilación en TypeScript y validaciones de Pydantic.

**Plan de Acción:**
- [x] **Base de Datos (`DB/01_tables.sql`):** Cambiar tipo de columnas `start_page` y `end_page` de `INTEGER` a `VARCHAR(50)` en `normative_chunks`.
- [x] **Backend ORM (`Backend/app/models.py`):** Modificar tipo SQLAlchemy a `String(50)` en `ChunkNormativo`.
- [x] **Backend Contract (`Backend/app/schemas.py`):** Cambiar tipos a `Optional[Union[int, str]] = None` en `CitedSourceResponse` and `CitationDataResponse` para permitir ambos tipos sin lanzar excepciones.
- [x] **Frontend Contract (`Frontend/src/types/chat.ts`):** Cambiar tipos a `number | string` en `CitedSource`.

---

## Resumen de Pendientes de Código

| Bug | CP Afectado | Componente Afectado | Estado | Solución Propuesta |
|---|---|---|---|---|
| **BUG-003** | CP-003 | Frontend / `Backend/prompts/prompts.py` | **RESUELTO** | Flujo guiado local en Frontend + prompt consolidado. |
| **BUG-004** | CP-004 | `Backend/prompts/prompts.py` | **RESUELTO** | Regla EX1 estricta en prompt de sistema. |
| **BUG-005** | CP-006 | `Backend/services/bedrock_rag_service.py` / `Frontend/src/features/chat/components/MessageBubble.tsx` | ABIERTO | Definición del esquema Pydantic para `contest_data` + fallbacks de UI. |
| **BUG-007** | CP-008 | `Backend/services/bedrock_rag_service.py` / `Backend/prompts/prompts.py` | ABIERTO | Reglas de desambiguación en el System Prompt para clasificación del LLM. |
| **BUG-008** | CP-009, CP-010 | `Backend/services/bedrock_rag_service.py` | ABIERTO | Inyección dinámica de fecha actual en el prompt para validación cronológica. |
| **BUG-010** | — | Múltiples (SQL / ORM / Schemas / TS Types) | **RESUELTO** | Unificación de tipos a string/varchar para paginación alfanumérica. |


