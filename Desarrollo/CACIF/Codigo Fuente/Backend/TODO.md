# TODO y Esquema Backend - Sistema CACIF

Basado en la arquitectura del Frontend actual, el modelo de datos (`CACIF-MD.pdf`) y las directrices del documento **CACIF-EBC**, aquí tienes el esquema definitivo para la construcción del Backend.

Este documento sirve como un mapa de ruta exacto para el equipo de backend.

## 1. Módulo de Autenticación (`/api/auth`)

- [x] `POST /api/auth/login`
  - **Body:** `{ "email": "usuario@unmsm.edu.pe", "password": "..." }`
  - **Lógica:** 
    - Se autentica directamente comparando el password hasheado (Bcrypt) contra la tabla `auth.users` de Supabase.
    - Se usa el enfoque BFF (Backend-for-Frontend) para no exponer las llaves de Supabase en el cliente.
  - **Response:** `{ "token": "jwt_string", "user": { "id": "uuid", "university_code": "23200107", "full_name": "...", "role": "estudiante" } }`

- [x] `POST /api/auth/guest`
  - **Lógica:** No requiere credenciales. Genera un token sin conexión a la base de datos (stateless) para probar el bot.
  - *Aclaración sobre invitados:* Al ser una sesión temporal, **no se guardará historial en la base de datos**. El `jwt_temp` solo sirve para que el backend valide que la petición viene del frontend oficial (evitando abuso de la API pública) y opcionalmente para aplicar "Rate Limiting" (ej. máximo 5 preguntas por invitado), pero no se asociará a ninguna tabla relacional.
  - **Response:** `{ "token": "jwt_temp", "user": { "id": "guest_uuid", "role": "invitado" } }`

---

## 2. Módulo de Chat y Conversaciones (`/api/chat`)

- [x] `GET /api/chat/conversations`
  - **Headers:** `Authorization: Bearer <token>`
  - **Lógica:** Recuperar el historial de conversaciones del estudiante activo.
  - **Response:** `Conversation[]` (id, intent_type, title, started_at, total_messages).

- [x] `POST /api/chat/conversations`
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:** `{ "title": "Búsqueda de grupos", "intent_type": "CU00" }`
  - **Lógica:** Crear una nueva conversación vacía y asignarla al `student_id`.
  - **Response:** Objeto `Conversation` creado.
  
- [x] `GET /api/chat/conversations/:conversationId/messages`
  - **Headers:** `Authorization: Bearer <token>`
  - **Lógica:** Recuperar el historial de mensajes de una conversación específica.
  - **Response:** `Message[]` ordenados cronológicamente.

- [ ] `POST /api/chat/message` *(Mock implementado, falta lógica RAG real)*
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:** `{ "conversation_id": "uuid", "content": "Quiero unirme a un grupo" }`
  - **Lógica Principal (Flujo RAG-QA según EBC):**
    1. **Guardado Inicial:** Registrar el mensaje del usuario en la tabla `Mensaje`.
    2. **Generación de Embedding:** Convertir el `content` (pregunta del usuario o atajo de UI) a un vector usando Google Gemini Embeddings.
    3. **Búsqueda Vectorial:** Consultar el índice de **Azure AI Search**. Buscar similitud vectorial contra el campo `pregunta` de las FAQs indexadas.
    4. **Síntesis con LLM:** Tomar el "Top-k" de FAQs recuperadas y pasarlas como contexto al prompt de Gemini para que genere una respuesta.
    5. **Detección de Interfaz (UI):** 
       - Si Gemini detecta el intent **CU01 (Búsqueda de GI)**, el backend adjunta al JSON `ui_type: 'matchmaking_cards'` y empaqueta `cards_data`.
       - Si Gemini detecta el intent **CU02 (Concursos/Convocatorias)**, el backend adjunta `ui_type: 'convocatoria_cards'` y empaqueta `contest_data`.
       - Si Gemini detecta el intent **CU03 (Trámites/Grados)**, el backend adjunta `ui_type: 'stepper_cards'` (o `requirement_cards`) y empaqueta un JSON con el flujo paso a paso o la lista de requisitos formales para mantener la UX estructurada.
       - Si Gemini detecta el intent **CU04 (Normativa)**, el backend adjunta `ui_type: 'citation_cards'` y empaqueta un JSON con el artículo normativo destacado, incluyendo un enlace directo al PDF oficial y la página, en lugar de mezclarlo como texto plano.
    6. **Guardado Final y Persistencia de UI:** *Solo si el usuario NO es invitado*, registrar la respuesta en la tabla `Mensaje`. Se deben guardar obligatoriamente las columnas `ui_type` (VARCHAR) y `ui_data` (JSONB) para que el Frontend pueda reconstruir las tarjetas enriquecidas al cargar el historial.
  - **Response:** Objeto `Message` del asistente (incluyendo `ui_type`, `cards_data`, `contest_data` y `cited_sources`).

---

## 3. Módulo de Knowledge Base / FAQs (`/api/kb`) (Uso Interno/Admin)

El sistema no hace chunking crudo de PDFs en tiempo de ejecución, sino que utiliza **FAQs validadas**.

- [x] `POST /api/kb/faqs`
  - **Body:** El esquema JSON definido en la sección 3.2 del EBC.
  - **Lógica:** Generar el `embedding` con Gemini e insertar en **Azure AI Search**.

- [x] `PUT /api/kb/faqs/:faq_id`
  - **Lógica:** Actualizar una FAQ (por ejemplo, cambios de cronogramas).

- [x] `GET /api/kb/faqs`
  - **Query Params:** `?caso_uso=CU03&tema=requisitos_tesis`
  - **Lógica:** Listar FAQs para revisión manual.

---

## 4. Tareas Core para el Desarrollador Backend (TODO)

1. **Infraestructura:**
   - [x] Configurar proyecto Node.js/Python (NestJS o FastAPI).
   - [x] Configurar conexión a PostgreSQL.
   - [x] Provisionar recurso de **Azure AI Search** y crear el índice `cacif-qa-index`. (Archivos listos)
   - [x] Obtener API Key de **Google Gemini**.

2. **Lógica RAG-QA:**
   - [ ] Implementar script de **ingesta masiva**: Leer JSON con FAQs, generar embeddings y subir a Azure AI Search en batch. *(Pendiente de ejecución)*
   - [ ] Implementar el orquestador del Chat (`POST /api/chat/message`). *(Actualizado con Mock JSONB persistente, falta conectar RAG real de AWS y Gemini)*
   - [ ] Afinar el Prompt del LLM (System Instruction) para obligarlo a usar Structured Outputs (JSON) y detectar automáticamente el `intent_type` de la conversación en lugar de depender de palabras clave.

3. **Modificaciones a Futuro (Siguientes Pasos):**
   - [ ] Habilitar Streaming (Server-Sent Events) para que el bot escriba en tiempo real (requerirá rediseñar cómo se devuelven los JSONs de `cards_data`).
   - [ ] Agregar validación estricta de dominios permitidos (CORS) para entornos de producción.
   - [ ] Implementar manejo de caché en Redis para las preguntas más frecuentes y acelerar el response time.
