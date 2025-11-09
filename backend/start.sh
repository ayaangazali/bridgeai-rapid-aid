#!/bin/bash
# BridgeAI Backend Startup Script

cd "$(dirname "$0")"
echo "🚀 Starting BridgeAI FastAPI Backend..."
venv/bin/python -m uvicorn main:app --reload --port 4000 --host 0.0.0.0
