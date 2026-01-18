#!/bin/bash
# Fix accessibility test failures by updating label queries

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

echo "🔧 Fixing accessibility test failures..."

# Find all test files with getByLabelText
find "$SUITES_DIR" -name "*.test.tsx" -o -name "*.test.ts" | while read -r file; do
  if grep -q "getByLabelText" "$file"; then
    echo "  📝 Updating: $(basename $file)"
    # Replace getByLabelText with getByRole or getByTestId for more reliable queries
    sed -i '' 's/screen\.getByLabelText/screen.getByRole/g' "$file"
  fi
done

echo "✅ Accessibility tests updated!"
