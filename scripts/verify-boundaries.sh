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

# Define platform package directories that must NOT import @digilist/*
# These are @xalatechnologies/* packages (platform layer)
PLATFORM_DIRS=(
  "packages/platform"
  "packages/enterprise"
  "packages/governance"
)

# Also check @xala/* packages (platform facade layer)
# These should remain domain-agnostic
XALA_DIRS=(
  "packages/sdk-core"
  "packages/contracts"
  "packages/auth"
  "packages/config"
  "packages/i18n"
  "packages/observability"
  "packages/runtime"
)

# Combine all platform directories
ALL_PLATFORM_DIRS=("${PLATFORM_DIRS[@]}" "${XALA_DIRS[@]}")

# Track which directories exist
EXISTING_DIRS=""
for dir in "${ALL_PLATFORM_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    EXISTING_DIRS="$EXISTING_DIRS $dir"
  fi
done

if [ -z "$EXISTING_DIRS" ]; then
  echo "INFO: No platform package directories found yet."
  echo "Directories checked: ${ALL_PLATFORM_DIRS[*]}"
  echo ""
  echo "OK: No violations (no platform packages exist)"
  exit 0
fi

echo "Scanning directories:$EXISTING_DIRS"
echo ""

VIOLATIONS=""
VIOLATION_COUNT=0

# Search for @digilist imports in platform packages
for dir in $EXISTING_DIRS; do
  if [ -d "$dir/src" ]; then
    SEARCH_DIR="$dir/src"
  else
    SEARCH_DIR="$dir"
  fi

  # Find violations
  DIR_VIOLATIONS=$(grep -rn "@digilist" "$SEARCH_DIR" \
    --include="*.ts" \
    --include="*.tsx" \
    2>/dev/null | \
    grep -v "node_modules" | \
    grep -v ".d.ts" | \
    grep -v "// @digilist-allowed" | \
    grep -v "// boundary-ok" | \
    grep -v "test" | \
    grep -v "spec" | \
    grep -v "__tests__" || true)

  if [ -n "$DIR_VIOLATIONS" ]; then
    VIOLATIONS="$VIOLATIONS$DIR_VIOLATIONS"$'\n'
    DIR_COUNT=$(echo "$DIR_VIOLATIONS" | wc -l | tr -d ' ')
    VIOLATION_COUNT=$((VIOLATION_COUNT + DIR_COUNT))
  fi
done

if [ $VIOLATION_COUNT -gt 0 ]; then
  echo "=============================================="
  echo "ERROR: Platform packages contain @digilist imports!"
  echo "=============================================="
  echo ""
  echo "Platform packages must NOT import from @digilist/* packages."
  echo "This maintains clean separation between:"
  echo "  - Platform layer (@xalatechnologies/*, @xala/*) - generic, reusable"
  echo "  - Domain layer (@digilist/*) - business-specific"
  echo ""
  echo "Violations found:"
  echo "----------------------------------------------"
  echo "$VIOLATIONS" | head -100
  echo "----------------------------------------------"
  echo ""
  echo "Total violations: $VIOLATION_COUNT"

  if [ $VIOLATION_COUNT -gt 100 ]; then
    echo "(Showing first 100 of $VIOLATION_COUNT violations)"
  fi

  echo ""
  echo "To fix:"
  echo "  1. Replace @digilist/* imports with @xala/* or @xalatechnologies/* equivalents"
  echo "  2. Move domain-specific code to @digilist/* packages"
  echo "  3. If import is intentional, add '// boundary-ok' comment on the same line"
  echo ""
  exit 1
fi

echo "OK: No platform -> domain violations found"
echo ""
echo "Verified directories:"
for dir in $EXISTING_DIRS; do
  echo "  - $dir"
done
echo ""
echo "All platform packages maintain proper boundaries."
exit 0
