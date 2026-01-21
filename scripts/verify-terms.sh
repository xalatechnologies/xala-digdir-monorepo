#!/bin/bash
# verify-terms.sh
# Checks for banned terms (listing, facility) in the codebase
# These terms should be replaced with domain-appropriate terminology

set -e

echo "=============================================="
echo "Banned Terms Verification"
echo "=============================================="
echo ""
echo "Checking for banned terms: 'listing', 'facility'..."
echo "(These should be replaced with domain-appropriate terms)"
echo ""

# Define directories to scan
SCAN_DIRS="packages/ apps/"

# Define banned terms pattern (word boundaries to avoid false positives)
BANNED_PATTERN="\b(listing|facility)\b"

# Exclusion patterns
EXCLUDE_PATTERNS=(
  "node_modules"
  "\.test\."
  "\.spec\."
  "\.d\.ts"
  "// legacy"
  "// @deprecated"
  "__tests__"
  "test-fixtures"
  "\.snap$"
)

# Build grep exclude pattern
EXCLUDE_GREP=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_GREP="$EXCLUDE_GREP | grep -v \"$pattern\""
done

# Search for banned terms
echo "Scanning: $SCAN_DIRS"
echo ""

VIOLATIONS=$(eval "grep -rEi \"$BANNED_PATTERN\" $SCAN_DIRS --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null $EXCLUDE_GREP" || true)

if [ -n "$VIOLATIONS" ]; then
  echo "=============================================="
  echo "WARNING: Banned terms found in codebase!"
  echo "=============================================="
  echo ""
  echo "The following terms are deprecated and should be replaced:"
  echo "  - 'listing' → use domain-specific term (e.g., 'rental-object', 'resource')"
  echo "  - 'facility' → use domain-specific term (e.g., 'venue', 'location')"
  echo ""
  echo "Violations (showing first 50):"
  echo "----------------------------------------------"
  echo "$VIOLATIONS" | head -50
  echo "----------------------------------------------"
  echo ""

  # Count total violations
  TOTAL=$(echo "$VIOLATIONS" | wc -l | tr -d ' ')
  echo "Total violations: $TOTAL"

  if [ "$TOTAL" -gt 50 ]; then
    echo "(Showing 50 of $TOTAL violations)"
  fi

  echo ""
  echo "To suppress a specific line, add '// legacy' or '// @deprecated' comment"
  exit 1
fi

echo "OK: No banned terms found"
echo ""
echo "Codebase uses approved terminology."
exit 0
