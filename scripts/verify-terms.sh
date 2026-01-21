#!/bin/bash
# verify-terms.sh
# Checks for banned terms in PLATFORM packages only
# Domain packages (@digilist/*) ARE allowed to use these terms
#
# Banned terms in platform packages:
# - "listing" -> use "rentalObject" or generic terms
# - "facility" -> use "amenity" or generic terms
# - "booking" -> platform-agnostic, but domain-specific in this context
#
# This ensures platform packages remain domain-agnostic

set -e

echo "=============================================="
echo "Platform Banned Terms Verification"
echo "=============================================="
echo ""
echo "Checking for banned terms in PLATFORM packages only..."
echo "(Domain packages @digilist/* are excluded)"
echo ""

# Define platform package directories to check for banned terms
# These packages must NOT contain domain-specific terminology
PLATFORM_DIRS=(
  "packages/platform"
  "packages/enterprise"
  "packages/governance"
  "packages/sdk-core"
  "packages/contracts"
  "packages/auth"
  "packages/config"
  "packages/i18n"
  "packages/observability"
  "packages/runtime"
)

# Define banned terms (domain-specific terminology)
# These should NOT appear in platform packages
BANNED_TERMS=(
  "listing"
  "facility"
)

# Patterns to exclude from scanning
EXCLUDE_PATTERNS=(
  "node_modules"
  "\.test\."
  "\.spec\."
  "\.d\.ts"
  "__tests__"
  "test-fixtures"
  "\.snap$"
  "// legacy"
  "// @deprecated"
  "// term-allowed"
  "\.md$"
  "CHANGELOG"
  "README"
  "package\.json"
)

# Track which directories exist
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

echo "Scanning platform directories:$EXISTING_DIRS"
echo ""
echo "Banned terms: ${BANNED_TERMS[*]}"
echo ""

VIOLATIONS=""
VIOLATION_COUNT=0

# Build banned terms pattern
BANNED_PATTERN=""
for term in "${BANNED_TERMS[@]}"; do
  if [ -z "$BANNED_PATTERN" ]; then
    BANNED_PATTERN="\b${term}\b"
  else
    BANNED_PATTERN="${BANNED_PATTERN}|\b${term}\b"
  fi
done

# Search for banned terms in each platform package
for dir in $EXISTING_DIRS; do
  if [ -d "$dir/src" ]; then
    SEARCH_DIR="$dir/src"
  else
    SEARCH_DIR="$dir"
  fi

  # Find violations - case insensitive search for banned terms
  DIR_VIOLATIONS=$(grep -rniE "$BANNED_PATTERN" "$SEARCH_DIR" \
    --include="*.ts" \
    --include="*.tsx" \
    2>/dev/null | \
    grep -v "node_modules" | \
    grep -v ".d.ts" | \
    grep -v "\.test\." | \
    grep -v "\.spec\." | \
    grep -v "__tests__" | \
    grep -v "// legacy" | \
    grep -v "// @deprecated" | \
    grep -v "// term-allowed" | \
    grep -v "\.md:" | \
    grep -v "README" | \
    grep -v "CHANGELOG" || true)

  if [ -n "$DIR_VIOLATIONS" ]; then
    VIOLATIONS="$VIOLATIONS"$'\n'"$DIR_VIOLATIONS"
    DIR_COUNT=$(echo "$DIR_VIOLATIONS" | wc -l | tr -d ' ')
    VIOLATION_COUNT=$((VIOLATION_COUNT + DIR_COUNT))
  fi
done

# Trim leading newlines
VIOLATIONS=$(echo "$VIOLATIONS" | sed '/^$/d')

if [ $VIOLATION_COUNT -gt 0 ]; then
  echo "=============================================="
  echo "ERROR: Banned terms found in platform packages!"
  echo "=============================================="
  echo ""
  echo "Platform packages must NOT contain domain-specific terminology."
  echo "This ensures platform code can be reused across different domains."
  echo ""
  echo "Banned terms and replacements:"
  echo "  - 'listing' -> use generic terms like 'resource', 'item', 'entity'"
  echo "  - 'facility' -> use generic terms like 'amenity', 'feature', 'attribute'"
  echo ""
  echo "Violations found:"
  echo "----------------------------------------------"
  echo "$VIOLATIONS" | head -50
  echo "----------------------------------------------"
  echo ""
  echo "Total violations: $VIOLATION_COUNT"

  if [ $VIOLATION_COUNT -gt 50 ]; then
    echo "(Showing first 50 of $VIOLATION_COUNT violations)"
  fi

  echo ""
  echo "To fix:"
  echo "  1. Replace domain-specific terms with generic equivalents"
  echo "  2. Move domain-specific code to @digilist/* packages"
  echo "  3. If term is used in a generic context, add '// term-allowed' comment"
  echo ""
  exit 1
fi

echo "OK: No banned terms found in platform packages"
echo ""
echo "Verified directories:"
for dir in $EXISTING_DIRS; do
  echo "  - $dir"
done
echo ""
echo "All platform packages use domain-agnostic terminology."
exit 0
