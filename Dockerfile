# Use official Python runtime as base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        curl \
        tesseract-ocr \
        libtesseract-dev \
        pkg-config \
        libcairo2-dev \
        libpango1.0-dev \
        libjpeg-dev \
        libpng-dev \
        libpoppler-cpp-dev \
        poppler-utils \
        zlib1g-dev \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Install Whisper-specific dependencies
RUN pip install --no-cache-dir openai-whisper

# Copy project
COPY backend/ .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

# Create uploads directory
RUN mkdir -p uploads \
    && chmod 755 uploads

# Expose ports
EXPOSE 8000 9090

# Run the application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]