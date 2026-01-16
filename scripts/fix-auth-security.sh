#!/bin/bash

# Auth Security Fix Script
# Disables mock authentication in all production apps
# Ensures session cookie is the ONLY authentication source

set -e

echo "========================================="
echo "🔒 Fixing Authentication Security Issues"
echo "========================================="
echo ""

# Define apps to fix
APPS=("minside" "backoffice" "saas-admin" "tenant-admin")

for APP in "${APPS[@]}"; do
  echo "📝 Fixing $APP..."
  
  AUTH_PROVIDER="apps/$APP/src/providers/AuthProvider.tsx"
  
  if [ ! -f "$AUTH_PROVIDER" ]; then
    echo "   ⚠️  Auth provider not found, skipping..."
    continue
  fi
  
  # Backup original file
  cp "$AUTH_PROVIDER" "$AUTH_PROVIDER.backup"
  
  # Check what mock auth setting it has
  if grep -q "USE_MOCK_AUTH = true" "$AUTH_PROVIDER"; then
    echo "   ❌ Found hardcoded USE_MOCK_AUTH = true"
    # Replace hardcoded true with false
    sed -i '' 's/const USE_MOCK_AUTH = true;/const USE_MOCK_AUTH = false; \/\/ SECURITY: Disabled for production/' "$AUTH_PROVIDER"
    echo "   ✅ Disabled mock auth"
  elif grep -q "USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH" "$AUTH_PROVIDER"; then
    echo "   ⚠️  Using environment variable (VITE_USE_MOCK_AUTH)"
    # Change to always false
    sed -i '' 's/const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH.*/const USE_MOCK_AUTH = false; \/\/ SECURITY: Disabled for production/' "$AUTH_PROVIDER"
    echo "   ✅ Hardcoded to false (ignoring env var)"
  elif grep -q "USE_MOCK_AUTH = false" "$AUTH_PROVIDER"; then
    echo "   ✅ Already set to false"
  else
    echo "   ⚠️  USE_MOCK_AUTH not found, skipping..."
  fi
  
  echo ""
done

echo "========================================="
echo "✅ Authentication security fixes complete"
echo "========================================="
echo ""
echo "Summary of changes:"
echo "  • Disabled USE_MOCK_AUTH in all apps"
echo "  • Backups created with .backup extension"
echo ""
echo "Next steps:"
echo "  1. Review changes in each app"
echo "  2. Test authentication flow"
echo "  3. Deploy updated apps"
echo ""
