# ==============================================================================
# Production Dockerfile for DaRI AI Picture Mirror Backend
# Optimized for Amazon ECS Fargate and Amazon ECR
# Base Image: Python 3.12 Slim
# ==============================================================================

FROM python:3.12-slim-bookworm

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

WORKDIR /app

# Install security updates and lightweight curl utility for container health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system group and user for secure least-privilege execution
RUN groupadd --system --gid 1001 appuser && \
    useradd --system --uid 1001 --gid appuser --shell /bin/false --no-create-home appuser

# Install Python dependencies first to take advantage of Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and adjust ownership
COPY --chown=appuser:appuser . .

# Ensure entrypoint is executable and has Unix line endings
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Switch execution context to non-root user
USER appuser

# Document that the container listens on port 8000
EXPOSE 8000

# Container health probe used by Docker daemon and ECS container agent
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Execute entrypoint to run migrations and launch Uvicorn
ENTRYPOINT ["/app/entrypoint.sh"]
