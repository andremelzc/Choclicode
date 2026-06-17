import asyncio
import os
from dotenv import load_dotenv

# Configurar Python path para que pueda importar 'app'
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings
from services.bedrock_rag_service import get_bedrock_rag_service

async def test_rag():
    load_dotenv()
    settings = get_settings()
    
    print("Iniciando Bedrock RAG Service...")
    service = get_bedrock_rag_service(settings)
    
    query = "busco un grupo de ia"
    print(f"\nPregunta: {query}")
    
    try:
        result = await service.run(query)
        print("\nResultado Exitoso:")
        print(f"Intent: {result['intent']}")
        print(f"UI Type: {result['ui_type']}")
        print(f"Answer: {result['answer']}")
        print(f"UI Data: {result['ui_data']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_rag())
