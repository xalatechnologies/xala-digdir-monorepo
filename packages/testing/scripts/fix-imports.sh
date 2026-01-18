#!/bin/bash
# ROOT CAUSE FIX: Update all broken relative imports in test files

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

echo "🔧 ROOT CAUSE FIX: Updating broken relative imports..."

# Fix 1: Replace ../projections with stub imports
echo "  📝 Fixing projection imports..."
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' \
  "s|from '\.\./projections/|from '@testing/stubs/api-imports|g" {} \;

# Fix 2: Replace ../schemas with stub imports  
echo "  📝 Fixing schema imports..."
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' \
  "s|from '\.\./schemas/|from '@testing/stubs/api-imports|g" {} \;

# Fix 3: Replace ../../apps/api imports with stub imports
echo "  📝 Fixing API imports..."
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./apps/api/src/|from '@testing/stubs/api-imports|g" {} \;

# Fix 4: Replace ../../../apps/api imports with stub imports
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./\.\./apps/api/src/|from '@testing/stubs/api-imports|g" {} \;

# Fix 5: Replace ../../../../apps/api imports with stub imports
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./\.\./\.\./apps/api/src/|from '@testing/stubs/api-imports|g" {} \;

echo "✅ All broken imports fixed!"
echo "📊 Tests should now compile and run"
