#!/usr/bin/env bash
# Snapshot the local cognee state into deploy_data/ for baking into the Docker image.
# Run AFTER all ingest batches are done and with the backend server STOPPED
# (ladybug keeps a WAL; copying mid-write risks a torn snapshot).
set -euo pipefail

cd "$(dirname "$0")"
COGNEE_PKG=".venv/lib/python3.11/site-packages/cognee"

if pgrep -f "uvicorn main:app" > /dev/null; then
  echo "ERROR: backend server is running — stop it first (data files are live)." >&2
  exit 1
fi

rm -rf deploy_data
mkdir -p deploy_data
cp -R "${COGNEE_PKG}/.data_storage" deploy_data/data_storage
cp -R "${COGNEE_PKG}/.cognee_system" deploy_data/cognee_system

echo "Exported:"
du -sh deploy_data/*
