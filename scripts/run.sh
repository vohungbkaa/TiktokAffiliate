#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Applying database migrations..."
npx prisma migrate deploy
npx prisma generate

if [ ! -d .venv ]; then
  echo "Creating Python virtualenv..."
  python3 -m venv .venv
fi

if ! .venv/bin/python crawler/check_scrapling.py >/dev/null 2>&1; then
  echo "Installing crawler dependencies..."
  .venv/bin/pip install -r crawler/requirements.txt
fi

echo "Starting web app..."
echo "Open http://localhost:3000, or the alternate port printed by Next.js."
npm run dev
