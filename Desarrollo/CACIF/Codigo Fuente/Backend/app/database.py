"""Conexion a PostgreSQL con SQLAlchemy async.

Provee el engine, la sesion y el dependency injectable get_db.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

from sqlalchemy import NullPool

engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False, 
    future=True,
    poolclass=NullPool,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0
    }
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Clase base para todos los modelos ORM."""
    pass


async def get_db():
    """Dependency de FastAPI que provee una sesion de base de datos."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
