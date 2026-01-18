#!/bin/bash
# Script to remove all .skip from test files

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

echo "🔧 Removing all .skip from test files..."

# Count before
BEFORE=$(grep -r "describe\.skip\|it\.skip\|test\.skip" "$SUITES_DIR" 2>/dev/null | wc -l | tr -d ' ')
echo "  Found $BEFORE skip statements"

# Remove all .skip statements
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) -exec sed -i '' 's/describe\.skip(/describe(/g; s/it\.skip(/it(/g; s/test\.skip(/test(/g' {} \;

# Count after
AFTER=$(grep -r "describe\.skip\|it\.skip\|test\.skip" "$SUITES_DIR" 2>/dev/null | wc -l | tr -d ' ')

echo "✅ Removed $((BEFORE - AFTER)) skip statements!"
echo "  Remaining: $AFTER"

if [ "$AFTER" -eq 0 ]; then
  echo "🎉 All skips removed! 0 skipped tests remaining."
else
  echo "⚠️  Some skips remain (may be in comments or strings)"
fi
