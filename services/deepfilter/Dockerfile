# syntax=docker/dockerfile:1
FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libsndfile1 \
    libasound2-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV TORCH_HOME=/app/models/torch

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt

COPY main.py .

RUN mkdir -p /app/models/torch

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
