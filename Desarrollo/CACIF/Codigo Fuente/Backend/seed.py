
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import engine, async_session
from app.models import Estudiante

async def seed_data():
    print("🚀 Iniciando carga de datos de prueba (Seed)...")
    
    async with async_session() as session:
        async with session.begin():
            # 1. Crear un Estudiante de prueba vinculado a Supabase Auth
            auth_id = uuid.UUID("a28b548a-32ca-4c16-9e81-b0b0e465d78d")
            stmt = select(Estudiante).where(Estudiante.id == auth_id)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                test_student = Estudiante(
                    id=auth_id,
                    university_code="20210001",
                    full_name="Estudiante de Prueba",
                    email="prueba@unmsm.edu.pe",
                    is_active=True
                )
                session.add(test_student)
                print(f"✅ Estudiante vinculado a Auth ID {auth_id} creado.")

                print("✅ Convocatoria y cronograma (CU02) creados.")

        await session.commit()
    
    print("✨ Proceso de Seed finalizado con éxito.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
