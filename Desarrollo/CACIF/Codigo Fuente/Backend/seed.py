
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import engine, async_session
from app.models import GrupoInvestigacion, Convocatoria, EventoCronograma, Estudiante

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

            # 2. Crear un Grupo de Investigación (CU01)
            stmt = select(GrupoInvestigacion).where(GrupoInvestigacion.name == "Grupo de Inteligencia Artificial - GI AI")
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                grupo = GrupoInvestigacion(
                    name="Grupo de Inteligencia Artificial - GI AI",
                    coordinator="Dr. Alan Turing",
                    description="Grupo dedicado a la investigación en Machine Learning y Procesamiento de Lenguaje Natural.",
                    lines=["Inteligencia Artificial", "NLP", "Computer Vision"],
                    technical_areas=["Python", "PyTorch", "FastAPI"]
                )
                session.add(grupo)
                print("✅ Grupo de investigación (CU01) creado.")

            # 3. Crear una Convocatoria (CU02)
            stmt = select(Convocatoria).where(Convocatoria.title == "Convocatoria 2026-I: Nuevos Miembros")
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                convocatoria = Convocatoria(
                    title="Convocatoria 2026-I: Nuevos Miembros",
                    contest_type="Proyectos de Investigación Docente",
                    status_label="Abierta",
                    status_badge="success",
                    requirements=["Ser estudiante de la FISI", "Tener promedio > 13", "Ganas de aprender"],
                    prize="Certificación oficial de la Unidad de Investigación",
                    required_documents="DNI, Reporte de notas, CV simple",
                    apply_url="https://fisi.unmsm.edu.pe/postula",
                    start_date=datetime.now(timezone.utc),
                    end_date=datetime.now(timezone.utc) + timedelta(days=30)
                )
                session.add(convocatoria)
                await session.flush() # Para obtener el ID de la convocatoria

                # Agregar eventos al cronograma
                eventos = [
                    EventoCronograma(
                        contest_id=convocatoria.id,
                        title="Inicio de postulaciones",
                        event_date=datetime.now(timezone.utc),
                        status="completed"
                    ),
                    EventoCronograma(
                        contest_id=convocatoria.id,
                        title="Cierre de postulaciones",
                        event_date=datetime.now(timezone.utc) + timedelta(days=30),
                        status="current"
                    ),
                    EventoCronograma(
                        contest_id=convocatoria.id,
                        title="Publicación de resultados",
                        event_date=datetime.now(timezone.utc) + timedelta(days=45),
                        status="upcoming"
                    )
                ]
                session.add_all(eventos)
                print("✅ Convocatoria y cronograma (CU02) creados.")

        await session.commit()
    
    print("✨ Proceso de Seed finalizado con éxito.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
