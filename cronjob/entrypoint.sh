#!/bin/bash
set -e

echo "[STARTUP] Running initial weather fetch"
python /app/main.py || echo "[WARN] Initial fetch had issues, continuing with scheduler"

echo "[STARTUP] Starting supercronic scheduler"
exec supercronic /etc/crontab
