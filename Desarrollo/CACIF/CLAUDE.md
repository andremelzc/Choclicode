# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CACIF is an AI-powered academic chatbot for FISI (Facultad de Ingeniería de Sistemas e Informática, UNMSM). It helps students with:
- **CU01** – Finding/matching research groups (matchmaking)
- **CU02** – Research contest and open-position announcements
- **CU03** – Thesis/graduation administrative procedures
- **CU04** – Normative framework and regulations

The system uses RAG (Retrieval-Augmented Generation): Google Gemini for embeddings and LLM synthesis, Azure AI Search as the vector store (index: `cacif-qa-index`), and a PostgreSQL database hosted on Supabase.

---

## Commands

### Backend (`Codigo Fuente/Backend`)

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run development server (from Backend directory)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest tests/test_auth.py          # single test file
pytest -k "test_login"             # single test by name
pytest --asyncio-mode=auto         # for async tests
```

Required `.env` file at `Codigo Fuente/Backend/.env`:
```
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=...
GEMINI_API_KEY=...
AZURE_SEARCH_ENDPOINT=...
AZURE_SEARCH_API_KEY=...
```

### Frontend (`Codigo Fuente/Frontend`)

```bash
npm install
npm run dev       # starts Vite dev server on port 5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint
npm run preview   # preview production build
```

Optional `.env` at `Codigo Fuente/Frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```
Without it, the API client defaults to `http://localhost:8000/api`.

### Docker (full stack)

```bash
# From Codigo Fuente/
docker compose up --build
```

Backend on port 8000, Frontend on port 5173.

---

## Architecture

### Backend

```
app/
  main.py          # FastAPI app factory; registers 3 routers under /api
  config.py        # Pydantic-settings singleton (get_settings())
  database.py      # Async SQLAlchemy engine + get_db() dependency
  dependencies.py  # JWT creation/decode; get_current_user() dependency
  models.py        # ORM models: Estudiante, Conversacion, Mensaje,
                   #   DocumentoNormativo, ChunkNormativo, FuenteCitada
  schemas.py       # Pydantic schemas (request/response)
  routes/
    auth.py        # POST /api/auth/login, POST /api/auth/guest
    chat.py        # Conversation CRUD + POST /api/chat/message (RAG pipeline)
    kb.py          # Internal FAQ management (in-memory MVP)

embeddings/embedder.py     # Gemini text-embedding-004 (1536 dims)
vectorstore/vector_db.py   # Abstract VectorDB interface (not yet wired to Azure)
services/rag_service.py    # RAGService orchestrator (complete, not yet called by routes)
prompts/prompts.py         # CACIF_SYSTEM_PROMPT + PromptManager
log/tracer.py              # NDJSON request/response tracing
```

**Authentication flow:** `/api/auth/login` queries `auth.users` directly (Supabase BFF pattern) using raw `bcrypt` to verify the password, then issues a JWT. `/api/auth/guest` issues a stateless JWT with `role=invitado` — guest sessions are never persisted to the database.

**RAG pipeline (current state):** `POST /api/chat/message` contains a keyword-based mock that detects intent and returns hardcoded `ui_type` + structured data. The real `RAGService` in `services/rag_service.py` is complete but **not yet wired** to this route — that is the main pending backend task (see `TODO.md`).

**`ui_type` values and their meaning:**
| Value | Intent | Frontend component |
|---|---|---|
| `text` | CU00/CU03 | Plain message bubble |
| `matchmaking_cards` | CU01 | Research group cards |
| `convocatoria_cards` | CU02 | Contest/announcement cards |
| `stepper_cards` | CU03 | Step-by-step procedure (not yet built) |
| `citation_cards` | CU04 | Normative citation block (not yet built) |

The `Mensaje` model stores `ui_type` (VARCHAR) and `ui_data` (JSONB) so rich UI cards are reconstructable from chat history.

**Database:** NullPool is used intentionally (`poolclass=NullPool`) together with disabled prepared statement cache — required for compatibility with Supabase's PgBouncer connection pooling.

### Frontend

```
src/
  App.tsx                    # Router: /, /login, /chat (protected)
  services/api.ts            # Axios instance; injects Bearer token from localStorage
  features/
    auth/
      context/AuthContext.tsx # Session in React state + localStorage (cacif_token, cacif_user)
      components/ProtectedRoute.tsx
      services/auth.service.ts
    chat/
      components/            # MessageList, MessageBubble, ChatInput, ChatHeader, ActionChips
      services/chat.service.ts  # Calls /api/chat/* endpoints
      services/rag.service.ts
  components/
    layout/                  # Sidebar, TopHeader, Footer
    ui/                      # Input, Card, Badge, Button, Avatar
  types/                     # auth.ts, chat.ts, rag.ts
```

**State management:** No external store (no Zustand/Redux). Auth state lives in `AuthContext`; chat state is local to the chat page component.

**Styling:** Tailwind CSS v4. The design token palette is defined in `src/index.css` via `@theme`. Always use semantic tokens — never raw hex or default Tailwind palette colors:
- `bg-background`, `bg-sidebar`, `bg-surface` – layout layers
- `bg-chatbot` – assistant message bubbles
- `text-foreground`, `text-muted-foreground` – text hierarchy
- `border-border`, `border-primary-500`, `border-glow` – borders/chips

**API client:** `src/services/api.ts` exports a single `api` Axios instance with base URL from `VITE_API_URL`. The request interceptor reads `cacif_token` from localStorage and injects the `Authorization: Bearer` header automatically. The response interceptor logs 401s but does not auto-redirect yet.

### Database (Supabase / PostgreSQL)

SQL scripts are in `Codigo Fuente/DB/` and `Codigo Fuente/Frontend/database/`:
- `01_tables.sql` – schema with `pgvector` extension (embeddings are `VECTOR(1536)`)
- `02_rls_policies.sql` – Row Level Security
- `03_functions_and_triggers.sql` – DB triggers

The `students` table PK references `auth.users(id)` — user creation must go through Supabase Auth, then a matching row in `public.students`.

`conversations.intent_type` starts as `CU00` and is updated to the detected intent after the first meaningful message.
