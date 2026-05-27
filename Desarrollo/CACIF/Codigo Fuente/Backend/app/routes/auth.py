"""Router de autenticacion /api/auth.

Endpoints:
- POST /api/auth/login  -> Login con codigo universitario
- POST /api/auth/guest  -> Acceso como invitado (sin DB)
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import create_access_token
from app.models import Estudiante
from app.schemas import LoginRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Autenticacion con codigo universitario.

    MVP: el password debe coincidir con el university_code.
    Busca al estudiante en la tabla Estudiante por su codigo.
    Si no existe o la contraseña no coincide, rechaza con 401.
    """
    # Validar password == university_code (regla MVP del BACKEND_TODO)
    if payload.password != payload.university_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # Buscar estudiante en la BD
    result = await db.execute(
        select(Estudiante).where(
            Estudiante.university_code == payload.university_code,
            Estudiante.is_active == True,
        )
    )
    estudiante = result.scalar_one_or_none()

    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Estudiante no encontrado o cuenta inactiva",
        )

    # Generar JWT
    token = create_access_token(
        data={
            "sub": str(estudiante.id),
            "university_code": estudiante.university_code,
            "full_name": estudiante.full_name,
            "role": "estudiante",
        }
    )

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(estudiante.id),
            university_code=estudiante.university_code,
            full_name=estudiante.full_name,
            rol="estudiante",
        ),
    )


@router.post("/guest", response_model=AuthResponse)
async def login_as_guest():
    """Acceso como invitado sin credenciales.

    Genera un JWT temporal con role='invitado'.
    No se asocia a ninguna tabla relacional.
    El token sirve para validar que la peticion viene del frontend oficial
    y para aplicar rate limiting (max 5 preguntas por invitado).
    """
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"

    token = create_access_token(
        data={
            "sub": guest_id,
            "university_code": "Invitado",
            "full_name": "Usuario Invitado",
            "role": "invitado",
        }
    )

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=guest_id,
            university_code="Invitado",
            full_name="Usuario Invitado",
            rol="invitado",
        ),
    )
