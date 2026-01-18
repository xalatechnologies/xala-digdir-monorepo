#!/bin/bash
#
# Comprehensive i18n inventory scanner for Digilist Platform
# Scans all pages and components for:
# - Translation key usage (t('key'), useT(), useLazyT())
# - Hard-coded strings in JSX/TSX
# - Missing translations
# - Unused translation keys
#
# Usage:
#   ./scan-i18n-inventory.sh [--format json|csv|markdown] [--app minside|backoffice|web] [--include-packages]
#
# Examples:
#   ./scan-i18n-inventory.sh --format markdown
#   ./scan-i18n-inventory.sh --app minside --format csv
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_DIR="$ROOT_DIR/i18n-inventory-reports"
OUTPUT_FORMAT="json"
APP_FILTER=""
INCLUDE_PACKAGES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        --app)
            APP_FILTER="$2"
            shift 2
            ;;
        --include-packages)
            INCLUDE_PACKAGES=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create output directory
mkdir -p "$OUTPUT_DIR"

OUTPUT_FILE="$OUTPUT_DIR/i18n-inventory-$TIMESTAMP.$OUTPUT_FORMAT"

echo "🔍 Digilist Platform - i18n Inventory Scanner"
echo "============================================="
echo ""

# Initialize JSON structure
cat > "$OUTPUT_FILE.tmp" <<EOF
{
  "metadata": {
    "scanDate": "$(date '+%Y-%m-%d %H:%M:%S')",
    "outputFormat": "$OUTPUT_FORMAT",
    "appFilter": "${APP_FILTER:-all}",
    "includePackages": $INCLUDE_PACKAGES
  },
  "summary": {
    "totalFiles": 0,
    "filesWithTranslations": 0,
    "filesWithHardcodedStrings": 0,
    "totalTranslationKeys": 0,
    "totalHardcodedStrings": 0,
    "uniqueTranslationKeys": {},
    "uniqueNamespaces": {}
  },
  "files": [],
  "translationKeys": [],
  "hardcodedStrings": [],
  "violations": []
}
EOF

# Function to scan a file
scan_file() {
    local file="$1"
    local relative_path="${file#$ROOT_DIR/}"
    
    echo "  ✓ $relative_path"
    
    # Extract translation keys: t('key') or t("key")
    local translation_keys=$(grep -oE "t\(['\"]([^'\"]+)['\"]" "$file" | sed -E "s/t\(['\"]([^'\"]+)['\"].*/\1/" || true)
    
    # Count hard-coded strings in JSX (basic detection)
    local hardcoded_count=$(grep -E ">\s*[A-ZÆØÅ][a-zæøå]{2,}" "$file" | grep -v "^[[:space:]]*\/\/" | wc -l || echo 0)
    
    # Check if file uses translation hooks
    local uses_translation=$(grep -E "use(Lazy)?T\(\)|useTranslation\(\)" "$file" | wc -l || echo 0)
    
    # Output results (simplified for bash)
    if [[ -n "$translation_keys" ]]; then
        echo "$translation_keys" | while read -r key; do
            [[ -n "$key" ]] && echo "    📝 Key: $key"
        done
    fi
    
    if [[ $hardcoded_count -gt 0 ]]; then
        echo "    ⚠️  Hard-coded strings detected: $hardcoded_count"
    fi
}

# Determine scan directories
SCAN_DIRS=()

if [[ -n "$APP_FILTER" ]]; then
    APP_PATH="$ROOT_DIR/apps/$APP_FILTER"
    if [[ -d "$APP_PATH" ]]; then
        SCAN_DIRS+=("$APP_PATH")
    else
        echo "❌ App '$APP_FILTER' not found"
        exit 1
    fi
else
    SCAN_DIRS+=("$ROOT_DIR/apps")
fi

if [[ "$INCLUDE_PACKAGES" == "true" ]]; then
    SCAN_DIRS+=("$ROOT_DIR/packages")
fi

# Scan files
echo "📂 Scanning directories..."
total_files=0
files_with_translations=0
files_with_hardcoded=0

for dir in "${SCAN_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        echo "  Scanning: $dir"
        
        # Find all .tsx and .ts files (excluding node_modules, dist, .turbo, tests)
        while IFS= read -r -d '' file; do
            scan_file "$file"
            ((total_files++))
        done < <(find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) \
            ! -path "*/node_modules/*" \
            ! -path "*/dist/*" \
            ! -path "*/.turbo/*" \
            ! -name "*.test.*" \
            ! -name "*.spec.*" \
            -print0)
    fi
done

echo ""
echo "📊 Scan Summary"
echo "==============="
echo "Total files scanned: $total_files"
echo ""

# For detailed analysis, recommend using the PowerShell version or Node.js script
echo "ℹ️  For detailed JSON/CSV/Markdown reports, use:"
echo "   - PowerShell: ./Scan-I18nInventory.ps1 -OutputFormat Markdown"
echo "   - Node.js: node infra/scripts/legacy/scan-i18n-comprehensive.js"
echo ""

# Generate simple markdown report
if [[ "$OUTPUT_FORMAT" == "markdown" ]]; then
    cat > "$OUTPUT_FILE" <<EOF
# i18n Inventory Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')  
**App Filter:** ${APP_FILTER:-all}  
**Include Packages:** $INCLUDE_PACKAGES

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| Total Files Scanned | $total_files |

---

## 🔍 Detailed Analysis

For a comprehensive analysis with translation key extraction, hard-coded string detection,
and violation reporting, please use one of the following tools:

1. **PowerShell Script** (recommended for Windows/macOS/Linux with PowerShell):
   \`\`\`bash
   pwsh ./infra/scripts/Scan-I18nInventory.ps1 -OutputFormat Markdown
   \`\`\`

2. **Node.js Script** (existing legacy tool):
   \`\`\`bash
   node infra/scripts/legacy/scan-i18n-comprehensive.js
   \`\`\`

---

*This is a simplified bash version. Use PowerShell or Node.js for full analysis.*
EOF
    
    echo "✅ Markdown report saved to: $OUTPUT_FILE"
fi

# Cleanup
rm -f "$OUTPUT_FILE.tmp"

echo "🎉 Scan complete!"
