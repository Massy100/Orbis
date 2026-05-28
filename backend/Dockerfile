FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código
COPY . .

EXPOSE 8000

# Comando directo sin entrypoint ni create-superuser
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]