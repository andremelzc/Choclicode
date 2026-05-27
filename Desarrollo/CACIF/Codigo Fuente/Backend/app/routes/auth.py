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
    """Autenticacion con Supabase Auth (DB Direct).
    
    Verifica el password contra la tabla auth.users usando bcrypt.
    Luego busca el Estudiante asociado a ese ID.
    """
    from sqlalchemy import text
    import bcrypt

    # Consultar auth.users
    query = text("SELECT id, encrypted_password FROM auth.users WHERE email = :email")
    result = await db.execute(query, {"email": payload.email})
    auth_user = result.fetchone()

    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # Verificar password con bcrypt directamente para evitar bugs de passlib
    password_bytes = payload.password.encode('utf-8')
    hash_bytes = auth_user.encrypted_password.encode('utf-8')
    
    if not bcrypt.checkpw(password_bytes, hash_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # Buscar estudiante en la BD
    result = await db.execute(
        select(Estudiante).where(
            Estudiante.id == auth_user.id,
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
