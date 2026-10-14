# Use a lightweight Python base
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Verba
RUN pip install --no-cache-dir goldenverba

# Expose the internal port
EXPOSE 8000

# Run Verba and bind to all interfaces
CMD ["verba", "start", "--host", "0.0.0.0", "--port", "8000"]