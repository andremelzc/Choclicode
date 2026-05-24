FROM python:3.11-slim

# Evita archivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1

# Logs instantáneos
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar proyecto
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]