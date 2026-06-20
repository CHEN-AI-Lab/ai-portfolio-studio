#!/usr/bin/env bash
set -euo pipefail

echo "=== AI Portfolio Studio Setup ==="

# Check Node.js
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 20 ]; then
  echo "Error: Node.js >=20 required (found: $(node -v 2>/dev/null || echo 'not installed'))"
  exit 1
fi

# Check pnpm
if ! command -v pnpm &>/dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

# Install deps
echo "Installing dependencies..."
pnpm install

# Check .env.local
if [ ! -f apps/web/.env.local ]; then
  echo ""
  echo "⚠️  .env.local not found. Copy from .env.example:"
  echo "  cp apps/web/.env.example apps/web/.env.local"
  echo "  Then fill in the required values."
fi

echo ""
echo "✅ Setup complete. Run:"
echo "  pnpm dev          # Start development server"
echo "  pnpm build        # Production build"
echo "  pnpm lint         # Lint check"
echo "  pnpm test         # Run tests"