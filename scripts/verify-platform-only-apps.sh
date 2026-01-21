#!/bin/bash
# verify-platform-only-apps.sh
# Verifies that platform-only apps have NO @digilist/* imports
#
# Platform-only apps are applications that should work purely with
# platform packages (@xalatechnologies/*, @xala/*) without any
# domain-specific dependencies.
#
# These apps can be deployed for ANY domain, not just Digilist.

set -e

echo "=============================================="
echo "Platform-Only Apps Verification"
echo "=============================================="
echo ""
echo "Verifying that platform-only apps have no @digilist/* imports..."
echo ""

# Define platform-only apps that must NOT import @digilist/*
# These apps should work with ANY domain, not just Digilist
PLATFORM_ONLY_APPS="apps/monitoring-global apps/docs-global apps/saas-admin"

# Track which apps exist
EXISTING_APPS=""
MISSING_APPS=""

for app in $PLATFORM_ONLY_APPS; do
  if [ -d "$app" ]; then
    EXISTING_APPS="$EXISTING_APPS $app"
  else
    MISSING_APPS="$MISSING_APPS $app"
  fi
done

if [ -z "$EXISTING_APPS" ]; then
  echo "INFO: No platform-only apps found yet."
  echo "Apps checked: $PLATFORM_ONLY_APPS"
  echo ""
  echo "OK: No violations (no platform-only apps exist)"
  exit 0
fi

echo "Platform-only apps to verify:"
for app in $EXISTING_APPS; do
  echo "  - $app"
done
echo ""

if [ -n "$MISSING_APPS" ]; then
  echo "Note: Some platform-only apps don't exist yet:"
  for app in $MISSING_APPS; do
    echo "  - $app (not found)"
  done
  echo ""
fi

VIOLATIONS=""
VIOLATION_COUNT=0
APPS_WITH_VIOLATIONS=""

# Check each platform-only app
for app in $EXISTING_APPS; do
  APP_NAME=$(basename "$app")

  # Check in src directory if it exists
  if [ -d "$app/src" ]; then
    SEARCH_DIR="$app/src"
  else
    SEARCH_DIR="$app"
  fi

  echo "Checking $APP_NAME..."

  # Find @digilist/* imports
  APP_VIOLATIONS=$(grep -rn "@digilist" "$SEARCH_DIR" \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --include="*.jsx" \
    2>/dev/null | \
    grep -v "node_modules" | \
    grep -v ".d.ts" | \
    grep -v "// @digilist-allowed" | \
    grep -v "// platform-exempt" || true)

  # Also check package.json for @digilist/* dependencies
  if [ -f "$app/package.json" ]; then
    PKG_VIOLATIONS=$(grep "@digilist" "$app/package.json" 2>/dev/null | \
      grep -v "// @digilist-allowed" || true)
    if [ -n "$PKG_VIOLATIONS" ]; then
      APP_VIOLATIONS="$APP_VIOLATIONS
$app/package.json: $PKG_VIOLATIONS"
    fi
  fi

  if [ -n "$APP_VIOLATIONS" ]; then
    VIOLATIONS="$VIOLATIONS
=== $APP_NAME ===
$APP_VIOLATIONS"
    APP_COUNT=$(echo "$APP_VIOLATIONS" | grep -v "^$" | wc -l | tr -d ' ')
    VIOLATION_COUNT=$((VIOLATION_COUNT + APP_COUNT))
    APPS_WITH_VIOLATIONS="$APPS_WITH_VIOLATIONS $APP_NAME"
    echo "  Found $APP_COUNT violations"
  else
    echo "  OK"
  fi
done

echo ""

# Trim leading newlines
VIOLATIONS=$(echo "$VIOLATIONS" | sed '/^$/d')

if [ $VIOLATION_COUNT -gt 0 ]; then
  echo "=============================================="
  echo "ERROR: Platform-only apps contain @digilist/* imports!"
  echo "=============================================="
  echo ""
  echo "Platform-only apps must NOT depend on @digilist/* packages."
  echo "These apps should be domain-agnostic and work with any platform domain."
  echo ""
  echo "Apps with violations:$APPS_WITH_VIOLATIONS"
  echo ""
  echo "Forbidden packages:"
  echo "  - @digilist/client-sdk"
  echo "  - @digilist/ui"
  echo "  - @digilist/contracts"
  echo "  - @digilist/domain"
  echo "  - @digilist/runtime"
  echo "  - @digilist/database-schema"
  echo ""
  echo "Violations found:"
  echo "----------------------------------------------"
  echo "$VIOLATIONS" | head -100
  echo "----------------------------------------------"
  echo ""
  echo "Total violations: $VIOLATION_COUNT"

  if [ $VIOLATION_COUNT -gt 100 ]; then
    echo "Showing first 100 of $VIOLATION_COUNT violations"
  fi

  echo ""
  echo "To fix:"
  echo "  1. Replace @digilist/* imports with @xalatechnologies/* or @xala/* equivalents"
  echo "  2. Use platform patterns instead of domain-specific components"
  echo "  3. If a domain import is truly necessary, add '// platform-exempt' comment"
  echo ""
  echo "Platform-only apps should use:"
  echo "  - @xalatechnologies/platform/* for UI, auth, config, etc."
  echo "  - @xala/* for SDK core, contracts, i18n, etc."
  echo ""
  exit 1
fi

echo "=============================================="
echo "OK: All platform-only apps are domain-agnostic"
echo "=============================================="
echo ""
echo "Verified apps:"
for app in $EXISTING_APPS; do
  echo "  - $app"
done
echo ""
echo "All platform-only apps can be deployed for any domain."
exit 0
