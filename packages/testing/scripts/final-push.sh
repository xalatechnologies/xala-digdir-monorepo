#!/bin/bash
# Final push to 100% - fix all remaining issues

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

# Run tests and capture output
cd "$TESTING_DIR"
DATABASE_URL="postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_test" \
  pnpm test 2>&1 | tee /tmp/test-full-output.txt

# Extract stats
PASSING=$(grep "Tests" /tmp/test-full-output.txt | tail -1 | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
FAILING=$(grep "Tests" /tmp/test-full-output.txt | tail -1 | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+")
SKIPPED=$(grep "Tests" /tmp/test-full-output.txt | tail -1 | grep -oE "[0-9]+ skipped" | grep -oE "[0-9]+")

echo ""
echo "========================================="
echo "FINAL TEST RESULTS"
echo "========================================="
echo "✅ Passing: $PASSING"
echo "❌ Failing: $FAILING"
echo "⏭️  Skipped: $SKIPPED"
echo "========================================="

if [ "$FAILING" -eq 0 ] && [ "$SKIPPED" -eq 0 ]; then
  echo "🎉 100% SUCCESS - ALL TESTS PASSING!"
  exit 0
else
  echo "⚠️  Not yet at 100% - continuing work..."
  exit 1
fi
