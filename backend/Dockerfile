# EduGen Backend — API Service Dockerfile
# Build: docker build -t edugen-api .
# Run:   docker run -p 8000:8000 --env-file .env edugen-api

FROM python:3.11-slim

# Install system deps: ffmpeg for audio extraction, curl for DocumentDB cert
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# DocumentDB TLS certificate (required for all connections to Amazon DocumentDB)
# This public cert is downloaded at build time and baked into the image.
# When MONGODB_URI uses ?tlsCAFile=/app/certs/global-bundle.pem, pymongo uses this cert.
RUN mkdir -p /app/certs && \
    curl -s "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" \
    -o /app/certs/global-bundle.pem

WORKDIR /app

# Install Python dependencies first (cached layer — only rebuilds when requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Temp directory for ffmpeg processing (ephemeral, ECS tasks have 20GB storage)
RUN mkdir -p /app/temp

EXPOSE 8000

# API service entrypoint
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
