#!/bin/bash
# verify-boundaries.sh
# Checks that platform packages don't import from @digilist/*
# This ensures clean separation between platform (generic) and domain (business-specific) layers

set -e

echo "=============================================="
echo "Platform Package Boundary Verification"
echo "=============================================="
echo ""
echo "Checking that platform packages don't import from @digilist/*..."
echo ""

# Define platform package directories
PLATFORM_DIRS=(
  "packages/platform"
  "packages/enterprise"
  "packages/governance"
)

# Check if any platform directories exist
EXISTING_DIRS=""
for dir in "${PLATFORM_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    EXISTING_DIRS="$EXISTING_DIRS $dir"
  fi
done

if [ -z "$EXISTING_DIRS" ]; then
  echo "INFO: No platform package directories found yet."
  echo "Directories checked: ${PLATFORM_DIRS[*]}"
  echo ""
  echo "OK: No violations (no platform packages exist)"
  exit 0
fi

echo "Scanning directories:$EXISTING_DIRS"
echo ""

# Search for @digilist imports in platform packages
VIOLATIONS=$(grep -r "@digilist" $EXISTING_DIRS --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".d.ts" | grep -v "// @digilist" | grep -v "boundary-check.ts" | grep -v "term-check.ts" || true)

if [ -n "$VIOLATIONS" ]; then
  echo "=============================================="
  echo "ERROR: Platform packages contain @digilist imports!"
  echo "=============================================="
  echo ""
  echo "Platform packages must NOT import from @digilist/* packages."
  echo "This maintains clean separation between:"
  echo "  - Platform layer (generic, reusable)"
  echo "  - Domain layer (@digilist/* - business-specific)"
  echo ""
  echo "Violations found:"
  echo "----------------------------------------------"
  echo "$VIOLATIONS"
  echo "----------------------------------------------"
  echo ""

  # Count violations
  TOTAL=$(echo "$VIOLATIONS" | wc -l | tr -d ' ')
  echo "Total violations: $TOTAL"
  echo ""
  echo "To fix: Replace @digilist/* imports with @xala/* or @xalatechnologies/* equivalents"
  exit 1
fi

echo "OK: No platform → domain violations found"
echo ""
echo "All platform packages maintain proper boundaries."
exit 0
