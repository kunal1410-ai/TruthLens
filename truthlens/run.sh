#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=============================================="
echo " Starting TruthLens Misinformation Triage App"
echo "=============================================="

# Check if python virtualenv exists
if [ ! -d "backend/.venv" ]; then
    echo "Creating virtualenv..."
    uv venv backend/.venv --python 3.11 || python3 -m venv backend/.venv
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

# Ensure frontend is built so FastAPI can serve it directly
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend bundle..."
    cd frontend && npm install && npm run build && cd ..
fi

echo "TruthLens is starting on: http://127.0.0.1:8000"
echo "API Docs available at:   http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop."

backend/.venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
