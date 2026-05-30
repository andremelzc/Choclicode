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

- [x] `POST /api/chat/message`
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:** `{ "conversation_id": "uuid", "content": "Quiero unirme a un grupo" }`
  - **Lógica Principal (Flujo RAG-QA según EBC):**
    1. **Guardado Inicial:** Registrar el mensaje del usuario en la tabla `Mensaje`.
    2. **Recuperación Vectorial:** Consultar la **Knowledge Base de AWS Bedrock**.
    3. **Síntesis con LLM:** Tomar los fragmentos recuperados y pasarlos como contexto al prompt de Gemini (Structured Outputs) para que genere una respuesta.
    4. **Detección de Interfaz (UI):** 
       - Si Gemini detecta el intent **CU01 (Búsqueda de GI)**, el backend adjunta al JSON `ui_type: 'matchmaking_cards'` y empaqueta `cards_data`.
       - Si Gemini detecta el intent **CU02 (Concursos/Convocatorias)**, el backend adjunta `ui_type: 'convocatoria_cards'` y empaqueta `contest_data`.
       - Si Gemini detecta el intent **CU03 (Trámites/Grados)**, el backend adjunta `ui_type: 'stepper_cards'` y empaqueta un JSON con el flujo paso a paso.
       - Si Gemini detecta el intent **CU04 (Normativa)**, el backend adjunta `ui_type: 'citation_cards'` y empaqueta un JSON con el artículo normativo destacado.
    5. **Guardado Final y Persistencia de UI:** *Solo si el usuario NO es invitado*, registrar la respuesta en la tabla `Mensaje`. Se deben guardar obligatoriamente las columnas `ui_type` (VARCHAR) y `ui_data` (JSONB).
  - **Response:** Objeto `Message` del asistente (incluyendo `ui_type`, `cards_data`, `contest_data` y `cited_sources`).

---

## 3. Tareas Core para el Desarrollador Backend (TODO)

1. **Infraestructura:**
   - [x] Configurar proyecto Python (FastAPI).
   - [x] Configurar conexión a PostgreSQL (Supabase).
   - [x] Provisionar recurso de **AWS Bedrock Knowledge Base**.
   - [x] Obtener API Key de **Google Gemini**.

2. **Lógica RAG-QA:**
   - [x] Implementar el orquestador del Chat (`POST /api/chat/message`). Conectado con RAG real de AWS y Gemini.
   - [x] Afinar el Prompt del LLM (System Instruction) para obligarlo a usar Structured Outputs (JSON) y detectar automáticamente el `intent_type`.
   - [x] **CU03:** Forzar al LLM a devolver obligatoriamente 4 secciones específicas para trámites de tesis mediante reglas adicionales en el System Prompt.
   - [x] **CU03:** Enviar el esquema completo y exacto de `stepper_cards` (`id`, `procedure_name`, `estimated_time`, `cost`, `requirements`, `steps`) en el modelo de datos de Pydantic.
   - [x] **CU04:** Agregar regla EX4 al System Prompt para manejar alertas formales por grupos no oficiales y por exceso de similitud (>20%).
   - [x] **CU04:** Enviar el esquema completo y exacto de `citation_cards` (`id`, `document_name`, `article_number`, `exact_quote`, `explanation`, `page`, `link`) en el modelo de Pydantic.

3. **Modificaciones a Futuro (Siguientes Pasos):**
   - [ ] Habilitar Streaming (Server-Sent Events) para que el bot escriba en tiempo real (requerirá rediseñar cómo se devuelven los JSONs de `cards_data`).
   - [ ] Agregar validación estricta de dominios permitidos (CORS) para entornos de producción.
   - [ ] Implementar manejo de caché en Redis para las preguntas más frecuentes y acelerar el response time.
   - [ ] **Optimización RAG/LLM:** Implementar Enrutamiento Dinámico (*Intent-Based Prompting*) para inyectar solo las reglas y el esquema correspondiente al Caso de Uso detectado, ahorrando tokens y reduciendo alucinaciones.
   - [ ] **Optimización RAG/LLM:** Migrar el esquema genérico actual (`ui_data`) hacia un enfoque de *Function Calling* (Herramientas), mejorando la velocidad y reduciendo el consumo de tokens de salida.
   - [ ] **Optimización RAG/LLM:** Habilitar *Prompt Caching* en la API de Gemini/Bedrock para las partes estáticas del `System Prompt`.
