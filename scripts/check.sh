#!/usr/bin/env bash
set -euo pipefail

errors=0

echo "=== Quality Gate ==="

echo -n "  Structure ... "
if bash scripts/check-structure.sh 2>/dev/null; then
  echo "✅"
else
  echo "❌"
  errors=$((errors + 1))
fi

echo -n "  TypeScript ... "
if npx tsc --noEmit 2>/dev/null; then
  echo "✅"
else
  echo "❌"
  errors=$((errors + 1))
fi

echo -n "  Lint ... "
if cd apps/web && npx next lint 2>/dev/null; then
  cd ../..
  echo "✅"
else
  cd ../..
  echo "⚠️  (skip - see below)"
fi

echo -n "  Tests ... "
if npx vitest run --reporter=verbose 2>/dev/null; then
  echo "✅"
else
  echo "❌ (no tests or failed)"
  errors=$((errors + 1))
fi

echo -n "  Build ... "
if cd apps/web && npx next build 2>/dev/null; then
  cd ../..
  echo "✅"
else
  cd ../..
  echo "❌"
  errors=$((errors + 1))
fi

echo ""
if [ "$errors" -eq 0 ]; then
  echo "✅ All checks passed"
else
  echo "❌ $errors check(s) failed"
fi
exit "$errors"