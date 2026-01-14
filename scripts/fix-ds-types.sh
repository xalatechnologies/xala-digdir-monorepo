#!/bin/bash

# Fix common @xala/ds type errors in backoffice app

set -e

BACKOFFICE_DIR="./apps/backoffice/src"

echo "Fixing @xala/ds type errors..."

# Fix 1: TextField -> Textfield (import statement)
echo "1. Fixing TextField -> Textfield imports..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/import.*TextField.*from.*@xala\/ds/import { Textfield } from "@xala\/ds"/g' \
  -e 's/TextField/Textfield/g'

# Fix 2: Stack gap -> spacing
echo "2. Fixing Stack gap -> spacing..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/<Stack gap={/<Stack spacing={/g' \
  -e 's/<Stack gap=/<Stack spacing=/g'

# Fix 3: Stack direction="row" -> direction="horizontal"
echo "3. Fixing Stack direction values..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/direction="row"/direction="horizontal"/g' \
  -e 's/direction="column"/direction="vertical"/g'

# Fix 4: Button size prop (remove it)
echo "4. Removing Button size prop..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/ size="[^"]*"//g' \
  -e 's/ size={[^}]*}//g'

# Fix 5: Dropdown.Content -> Dropdown.List
echo "5. Fixing Dropdown.Content -> Dropdown.List..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/<Dropdown\.Content>/<Dropdown.List>/g' \
  -e 's/<\/Dropdown\.Content>/<\/Dropdown.List>/g'

# Fix 6: Dropdown.Menu -> appropriate structure
echo "6. Fixing Dropdown.Menu references..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/<Dropdown\.Menu>/<Dropdown.List>/g' \
  -e 's/<\/Dropdown\.Menu>/<\/Dropdown.List>/g'

# Fix 7: Alert severity -> data-color
echo "7. Fixing Alert severity -> data-color..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/severity="/data-color="/g' \
  -e 's/severity={/data-color={/g'

# Fix 8: Spinner size prop (remove it)
echo "8. Removing Spinner size prop..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/<Spinner size="[^"]*"/<Spinner/g' \
  -e 's/<Spinner size={[^}]*}/<Spinner/g'

# Fix 9: Drawer open prop -> isOpen
echo "9. Fixing Drawer open -> isOpen..."
find "$BACKOFFICE_DIR" -type f -name "*.tsx" | xargs sed -i '' \
  -e 's/<Drawer open=/<Drawer isOpen=/g'

echo "✅ Common fixes applied. Manual fixes still needed for:"
echo "  - Textfield missing label/aria-label"
echo "  - DTO optional property issues"
echo "  - Missing imports (icons, services)"
echo "  - Complex Dropdown structures"
echo ""
echo "Run 'cd apps/backoffice && pnpm build' to see remaining errors"
