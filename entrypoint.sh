#!/bin/sh
set -e

echo "=== DaRI AI Picture Mirror & Arcade Backend Starting ==="

# Run Alembic migrations if DB_HOST is configured
if [ -n "$DB_HOST" ]; then
    echo "Running database migrations against $DB_HOST..."
    alembic upgrade head || {
        echo "WARNING: Alembic migration reported an error or is already up-to-date."
    }
fi

echo "Starting Uvicorn HTTP server on 0.0.0.0:8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

