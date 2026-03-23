#!/bin/bash
set -e

echo "Running database seed..."
python seed_data.py || echo "Seed failed or skipped (non-fatal)"

echo "Starting Wakeeli backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
