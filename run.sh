#!/bin/bash
# Railway/Render/fly.io unified start script
set -e
cd "$(dirname "$0")/truthlens"

# Build frontend
echo "Building frontend..."
cd frontend && npm install && npm run build && cd ..

# Start backend (serves built frontend as static files)
echo "Starting TruthLens on port ${PORT:-8000}..."
cd backend
source .venv/bin/activate 2>/dev/null || pip install -r requirements.txt
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
