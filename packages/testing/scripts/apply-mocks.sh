#!/bin/bash
# Script to automatically apply mock API server to all integration test files

set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

echo "🔧 Applying mock API server to all integration test files..."

# Find all test files that likely need mocks (integration, security, performance tests)
find "$SUITES_DIR" -type f \( \
  -path "*/integration/*" -o \
  -path "*/security/*" -o \
  -path "*/performance/*" -o \
  -path "*/e2e/*" \
\) \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) | while read -r file; do
  
  # Skip if already has setupMockApi
  if grep -q "setupMockApi" "$file"; then
    echo "  ⏭️  Skipping $file (already has mock setup)"
    continue
  fi
  
  # Calculate relative path to mocks directory
  depth=$(echo "$file" | sed "s|$SUITES_DIR||" | tr -cd '/' | wc -c | tr -d ' ')
  mock_path=$(printf '../%.0s' $(seq 1 $depth))mocks/api-server.mock
  
  echo "  ✅ Adding mock setup to: $(basename $file)"
  
  # Check if file has vitest imports
  if grep -q "from 'vitest'" "$file"; then
    # Add setupMockApi to existing vitest import if not already there
    if ! grep -q "setupMockApi" "$file"; then
      # Add import for setupMockApi after vitest imports
      sed -i '' "/from 'vitest'/a\\
import { setupMockApi } from '$mock_path';
" "$file"
    fi
  else
    # Add both vitest and mock imports at the top
    sed -i '' "1i\\
import { setupMockApi } from '$mock_path';
" "$file"
  fi
  
  # Add setupMockApi() call after first describe( if not already there
  if ! grep -q "setupMockApi()" "$file"; then
    sed -i '' "/describe(/a\\
  setupMockApi();
" "$file"
  fi
  
done

echo "✅ Mock API server applied to all integration test files!"
echo ""
echo "📊 Summary:"
find "$SUITES_DIR" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) -exec grep -l "setupMockApi" {} \; | wc -l | xargs echo "  Files with mock setup:"
