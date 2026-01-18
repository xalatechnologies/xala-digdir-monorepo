#!/bin/bash
# Remove all conditional skip patterns from tests

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

echo "🔧 Removing conditional skip patterns..."

# Remove E2E_ENABLED checks
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) | while read -r file; do
  if grep -q "E2E_ENABLED\|process.env" "$file"; then
    echo "  📝 Cleaning: $(basename $file)"
    # Remove conditional skip blocks
    sed -i '' '/if.*E2E_ENABLED.*{/,/^}/d' "$file"
    sed -i '' '/if.*process\.env/,/^}/d' "$file"
  fi
done

# Remove any remaining return statements that skip tests
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' '/if (!serverAvailable) {/,/return;/d' {} \;

echo "✅ Conditional skips removed!"
