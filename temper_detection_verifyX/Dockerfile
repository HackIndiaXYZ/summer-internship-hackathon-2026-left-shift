FROM python:3.11-slim

# Prevent Python buffering
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Render uses PORT env variable
ENV PORT=10000

EXPOSE 10000

# Start FastAPI
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}