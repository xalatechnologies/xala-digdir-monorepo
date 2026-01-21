#!/bin/bash
# verify-packages.sh
# Verifies all @xalatechnologies/* packages can be built and packed
# This ensures packages are ready for publishing to npm

set -e

echo "=============================================="
echo "Package Build & Pack Verification"
echo "=============================================="
echo ""
echo "Verifying all @xalatechnologies/* packages can be built and packed..."
echo ""

# Find all packages with @xalatechnologies scope
PACKAGES=$(find packages -maxdepth 2 -name "package.json" -exec grep -l '"@xalatechnologies/' {} \; 2>/dev/null || true)

if [ -z "$PACKAGES" ]; then
  echo "INFO: No @xalatechnologies/* packages found yet."
  echo ""
  echo "Looking for packages in: packages/*/package.json"
  echo ""
  echo "OK: No packages to verify"
  exit 0
fi

echo "Found @xalatechnologies/* packages:"
echo "----------------------------------------------"
for pkg in $PACKAGES; do
  PKG_NAME=$(grep -o '"name": *"@xalatechnologies/[^"]*"' "$pkg" | sed 's/"name": *"//' | sed 's/"$//')
  PKG_DIR=$(dirname "$pkg")
  echo "  - $PKG_NAME ($PKG_DIR)"
done
echo "----------------------------------------------"
echo ""

# Track results
FAILED_BUILDS=()
FAILED_PACKS=()
SUCCESSFUL=()

for pkg in $PACKAGES; do
  PKG_DIR=$(dirname "$pkg")
  PKG_NAME=$(grep -o '"name": *"@xalatechnologies/[^"]*"' "$pkg" | sed 's/"name": *"//' | sed 's/"$//')

  echo "----------------------------------------------"
  echo "Verifying: $PKG_NAME"
  echo "Directory: $PKG_DIR"
  echo "----------------------------------------------"

  # Check if package has build script
  HAS_BUILD=$(grep -c '"build":' "$pkg" || true)

  if [ "$HAS_BUILD" -gt 0 ]; then
    echo "  [1/2] Building package..."
    if (cd "$PKG_DIR" && pnpm build > /dev/null 2>&1); then
      echo "        ✓ Build successful"
    else
      echo "        ✗ Build FAILED"
      FAILED_BUILDS+=("$PKG_NAME")
      continue
    fi
  else
    echo "  [1/2] No build script, skipping build step"
  fi

  # Try to pack the package (dry-run)
  echo "  [2/2] Packing package (dry-run)..."
  if (cd "$PKG_DIR" && pnpm pack --dry-run > /dev/null 2>&1); then
    echo "        ✓ Pack successful"
    SUCCESSFUL+=("$PKG_NAME")
  else
    echo "        ✗ Pack FAILED"
    FAILED_PACKS+=("$PKG_NAME")
  fi

  echo ""
done

# Summary
echo "=============================================="
echo "Verification Summary"
echo "=============================================="
echo ""

if [ ${#SUCCESSFUL[@]} -gt 0 ]; then
  echo "✓ Successful (${#SUCCESSFUL[@]}):"
  for pkg in "${SUCCESSFUL[@]}"; do
    echo "    - $pkg"
  done
  echo ""
fi

if [ ${#FAILED_BUILDS[@]} -gt 0 ]; then
  echo "✗ Build failures (${#FAILED_BUILDS[@]}):"
  for pkg in "${FAILED_BUILDS[@]}"; do
    echo "    - $pkg"
  done
  echo ""
fi

if [ ${#FAILED_PACKS[@]} -gt 0 ]; then
  echo "✗ Pack failures (${#FAILED_PACKS[@]}):"
  for pkg in "${FAILED_PACKS[@]}"; do
    echo "    - $pkg"
  done
  echo ""
fi

# Exit with error if any failures
TOTAL_FAILURES=$((${#FAILED_BUILDS[@]} + ${#FAILED_PACKS[@]}))
if [ $TOTAL_FAILURES -gt 0 ]; then
  echo "ERROR: $TOTAL_FAILURES package(s) failed verification"
  exit 1
fi

echo "OK: All @xalatechnologies/* packages verified successfully"
exit 0
