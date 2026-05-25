"""Punto de entrada del backend CACIF.

Crea la app FastAPI, configura CORS y registra los routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router

app = FastAPI(
    title="CACIF Backend API",
    description="Chatbot para la Atención de Consultas de Investigaciones de la FISI",
    version="0.1.0",
)

# -- CORS ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Routers ----------------------------------------------------------
app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


# ── Health check ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "CACIF Backend funcionando", "version": "0.1.0"}
