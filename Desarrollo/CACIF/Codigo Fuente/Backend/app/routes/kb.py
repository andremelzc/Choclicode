"""Router de Knowledge Base /api/kb.

Endpoints para gestion interna de FAQs validadas (no chunking crudo).
- POST /api/kb/faqs      -> Crear FAQ y generar embedding
- PUT  /api/kb/faqs/:id  -> Actualizar FAQ
- GET  /api/kb/faqs      -> Listar FAQs con filtros
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.schemas import FAQCreate, FAQUpdate, FAQResponse

router = APIRouter(prefix="/kb", tags=["knowledge-base"])

# ── Almacenamiento en memoria (MVP) ────────────────────────────────
# En produccion, las FAQs se almacenan en Azure AI Search con embeddings.
# Este store en memoria permite probar los endpoints sin dependencia externa.
_faq_store: dict[str, dict] = {}


@router.post("/faqs", response_model=FAQResponse, status_code=201)
async def create_faq(
    payload: FAQCreate,
    _current_user: dict = Depends(get_current_user),
):
    """Crear una FAQ validada.

    Flujo segun EBC seccion 3.2:
    1. Recibir la FAQ en formato JSON estructurado
    2. Generar embedding de la pregunta con Gemini
    3. Insertar en Azure AI Search con metadatos (caso_uso, tema)

    MVP: almacena en memoria sin generar embedding real.
    """
    faq_id = str(uuid.uuid4())

    faq_data = {
        "id": faq_id,
        "caso_uso": payload.caso_uso,
        "tema": payload.tema,
        "pregunta": payload.pregunta,
        "respuesta": payload.respuesta,
        "fuente_documento": payload.fuente_documento,
        "pagina_inicio": payload.pagina_inicio,
        "pagina_fin": payload.pagina_fin,
    }

    # TODO: Generar embedding con Embedder y subir a Azure AI Search
    # embedding = embedder.embed(payload.pregunta)
    # azure_search_client.upload_documents([{...faq_data, "embedding": embedding}])

    _faq_store[faq_id] = faq_data

    return FAQResponse(**faq_data)


@router.put("/faqs/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: str,
    payload: FAQUpdate,
    _current_user: dict = Depends(get_current_user),
):
    """Actualizar una FAQ existente.

    Util para actualizar cronogramas, requisitos o cualquier dato
    que cambie con el tiempo sin necesidad de regenerar toda la base.
    """
    if faq_id not in _faq_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ no encontrada",
        )

    faq = _faq_store[faq_id]

    # Actualizar solo los campos provistos
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        faq[key] = value

    # TODO: Re-generar embedding si la pregunta cambio
    # if "pregunta" in update_data:
    #     new_embedding = embedder.embed(faq["pregunta"])
    #     azure_search_client.merge_or_upload_documents([{...faq, "embedding": new_embedding}])

    _faq_store[faq_id] = faq

    return FAQResponse(**faq)


@router.get("/faqs", response_model=list[FAQResponse])
async def list_faqs(
    caso_uso: Optional[str] = Query(None, description="Filtrar por caso de uso: CU01, CU02, CU03, CU04"),
    tema: Optional[str] = Query(None, description="Filtrar por tema"),
    _current_user: dict = Depends(get_current_user),
):
    """Listar FAQs para revision manual.

    Acepta filtros opcionales por caso_uso y tema.
    """
    results = list(_faq_store.values())

    if caso_uso:
        results = [f for f in results if f["caso_uso"] == caso_uso]

    if tema:
        results = [f for f in results if tema.lower() in f["tema"].lower()]

    return [FAQResponse(**f) for f in results]
