#!/bin/bash

# Design System Violations Auto-Fix Script
# Fixes common hardcoded values with proper Design System tokens

set -e

echo "🔧 Starting Design System violations auto-fix..."

# Function to fix files with sed (cross-platform compatible)
fix_typography() {
  echo "📝 Fixing typography violations..."
  
  # Fix fontWeight: '600' -> var(--ds-font-weight-semibold)
  find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s/fontWeight: '600'/fontWeight: 'var(--ds-font-weight-semibold)'/g" \
    -e "s/fontWeight: \"600\"/fontWeight: 'var(--ds-font-weight-semibold)'/g" \
    -e "s/fontWeight: '500'/fontWeight: 'var(--ds-font-weight-medium)'/g" \
    -e "s/fontWeight: \"500\"/fontWeight: 'var(--ds-font-weight-medium)'/g" \
    -e "s/fontWeight: '400'/fontWeight: 'var(--ds-font-weight-regular)'/g" \
    -e "s/fontWeight: \"400\"/fontWeight: 'var(--ds-font-weight-regular)'/g" \
    {} \;
  
  # Fix fontSize hardcoded values
  find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s/fontSize: '48px'/fontSize: 'var(--ds-font-size-10)'/g" \
    -e "s/fontSize: \"48px\"/fontSize: 'var(--ds-font-size-10)'/g" \
    -e "s/fontSize: '24px'/fontSize: 'var(--ds-font-size-6)'/g" \
    -e "s/fontSize: \"24px\"/fontSize: 'var(--ds-font-size-6)'/g" \
    -e "s/fontSize: '18px'/fontSize: 'var(--ds-font-size-5)'/g" \
    -e "s/fontSize: \"18px\"/fontSize: 'var(--ds-font-size-5)'/g" \
    -e "s/fontSize: '14px'/fontSize: 'var(--ds-font-size-4)'/g" \
    -e "s/fontSize: \"14px\"/fontSize: 'var(--ds-font-size-4)'/g" \
    -e "s/fontSize: '11px'/fontSize: 'var(--ds-font-size-2)'/g" \
    -e "s/fontSize: \"11px\"/fontSize: 'var(--ds-font-size-2)'/g" \
    -e "s/fontSize: '10px'/fontSize: 'var(--ds-font-size-1)'/g" \
    -e "s/fontSize: \"10px\"/fontSize: 'var(--ds-font-size-1)'/g" \
    {} \;
  
  # Fix lineHeight numeric values
  find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s/lineHeight: 1\.6/lineHeight: 'var(--ds-line-height-lg)'/g" \
    -e "s/lineHeight: 1\.5/lineHeight: 'var(--ds-line-height-md)'/g" \
    -e "s/lineHeight: 1\.3/lineHeight: 'var(--ds-line-height-sm)'/g" \
    -e "s/lineHeight: 1\.2/lineHeight: 'var(--ds-line-height-sm)'/g" \
    -e "s/lineHeight: 1,/lineHeight: 'var(--ds-line-height-sm)',/g" \
    -e "s/lineHeight: '1\.5'/lineHeight: 'var(--ds-line-height-md)'/g" \
    {} \;
}

fix_spacing() {
  echo "📏 Fixing spacing violations..."
  
  # Fix common spacing values
  find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s/marginBottom: '4px'/marginBottom: 'var(--ds-spacing-1)'/g" \
    -e "s/marginBottom: \"4px\"/marginBottom: 'var(--ds-spacing-1)'/g" \
    -e "s/marginBottom: '8px'/marginBottom: 'var(--ds-spacing-2)'/g" \
    -e "s/marginBottom: \"8px\"/marginBottom: 'var(--ds-spacing-2)'/g" \
    -e "s/marginBottom: '12px'/marginBottom: 'var(--ds-spacing-3)'/g" \
    -e "s/marginBottom: \"12px\"/marginBottom: 'var(--ds-spacing-3)'/g" \
    -e "s/marginBottom: '16px'/marginBottom: 'var(--ds-spacing-4)'/g" \
    -e "s/marginBottom: \"16px\"/marginBottom: 'var(--ds-spacing-4)'/g" \
    -e "s/marginTop: '8px'/marginTop: 'var(--ds-spacing-2)'/g" \
    -e "s/marginTop: \"8px\"/marginTop: 'var(--ds-spacing-2)'/g" \
    -e "s/marginLeft: '8px'/marginLeft: 'var(--ds-spacing-2)'/g" \
    -e "s/marginLeft: \"8px\"/marginLeft: 'var(--ds-spacing-2)'/g" \
    -e "s/gap: '8px'/gap: 'var(--ds-spacing-2)'/g" \
    -e "s/gap: \"8px\"/gap: 'var(--ds-spacing-2)'/g" \
    -e "s/gap: '16px'/gap: 'var(--ds-spacing-4)'/g" \
    -e "s/gap: \"16px\"/gap: 'var(--ds-spacing-4)'/g" \
    -e "s/padding: '12px'/padding: 'var(--ds-spacing-3)'/g" \
    -e "s/padding: \"12px\"/padding: 'var(--ds-spacing-3)'/g" \
    {} \;
}

fix_border_radius() {
  echo "🔲 Fixing border-radius violations..."
  
  find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s/borderRadius: '4px'/borderRadius: 'var(--ds-border-radius-sm)'/g" \
    -e "s/borderRadius: \"4px\"/borderRadius: 'var(--ds-border-radius-sm)'/g" \
    -e "s/borderRadius: '8px'/borderRadius: 'var(--ds-border-radius-md)'/g" \
    -e "s/borderRadius: \"8px\"/borderRadius: 'var(--ds-border-radius-md)'/g" \
    -e "s/borderRadius: '12px'/borderRadius: 'var(--ds-border-radius-lg)'/g" \
    -e "s/borderRadius: \"12px\"/borderRadius: 'var(--ds-border-radius-lg)'/g" \
    -e "s/borderRadius: '999px'/borderRadius: 'var(--ds-border-radius-full)'/g" \
    -e "s/borderRadius: \"999px\"/borderRadius: 'var(--ds-border-radius-full)'/g" \
    {} \;
}

fix_button_types() {
  echo "🔘 Fixing button type attributes..."
  
  # This one needs more careful handling - just add type="button" where missing
  # We'll skip this for automated fix as it requires AST manipulation
  echo "⚠️  Skipping button type fixes (requires manual review)"
}

# Run all fixes
fix_typography
fix_spacing
fix_border_radius

echo "✅ Design System auto-fix complete!"
echo "📊 Run 'pnpm scan' to verify remaining violations"
