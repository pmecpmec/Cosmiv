# Use official Python image
FROM python:3.12-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
  ffmpeg \
  unzip \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Create temp directory for processing
RUN mkdir -p /tmp/processing

# Expose port 8000 for FastAPI
EXPOSE 8000

# Command to run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
