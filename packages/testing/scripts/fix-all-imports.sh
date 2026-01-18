#!/bin/bash
# Fix ALL imports - convert to aliases and resolve all issues
set -e

TESTING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUITES_DIR="$TESTING_DIR/suites"

# Convert contracts imports
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./\.\./contracts/src|from '@digilist/contracts|g" {} \;

# Convert client-sdk imports  
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./\.\./packages/client-sdk/src|from '@digilist/client-sdk|g" {} \;
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./packages/client-sdk/src|from '@digilist/client-sdk|g" {} \;

# Convert database-schema imports
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./\.\./packages/database-schema/src|from '@digilist/database-schema|g" {} \;

# Convert all API imports to stubs
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '@testing/stubs/api-imports.*'|from '@testing/stubs/api-imports'|g" {} \;

# Remove all describe.skip
find "$SUITES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/describe\.skip(/describe(/g' {} \;
