#!/bin/bash

# i18n Audit Script - Comprehensive Hardcoded String Detection
# Scans all frontend apps for hardcoded strings that should be localized

set -e

WORKSPACE_ROOT="/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo"
OUTPUT_FILE="$WORKSPACE_ROOT/i18n-audit-report.txt"

echo "🔍 Starting Comprehensive i18n Audit"
echo "=================================================="
echo ""
echo "Scanning: web, minside, backoffice, monitoring, saas-admin, docs-learning"
echo ""

# Clear previous report
> "$OUTPUT_FILE"

echo "# i18n Audit Report - $(date)" >> "$OUTPUT_FILE"
echo "================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to scan an app
scan_app() {
  local APP_NAME=$1
  local APP_PATH=$2
  
  echo "📱 Scanning: $APP_NAME..."
  echo "" >> "$OUTPUT_FILE"
  echo "## App: $APP_NAME" >> "$OUTPUT_FILE"
  echo "Path: $APP_PATH" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 1: JSX text content (>Text<)
  echo "### Pattern 1: JSX Text Content" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" ">[A-ZÆØÅ][a-zA-ZæøåÆØÅ\s]{2,}<" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 2: String literals in props (label, title, placeholder, etc.)
  echo "### Pattern 2: Props with Hardcoded Strings" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" -E "(label|title|placeholder|description|text|heading|message)=[\"\'][A-ZÆØÅ][^\"\']*[\"\']" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 3: Error/success messages
  echo "### Pattern 3: Error/Success Messages" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.ts" -E "(error|success|warning|info)[\s]*[:=][\s]*[\"'][A-ZÆØÅ][^\"']*[\"']" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 4: Button text
  echo "### Pattern 4: Button Text" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" -E "<Button[^>]*>[\s]*[A-ZÆØÅ][a-zA-ZæøåÆØÅ\s]{2,}[\s]*</Button>" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 5: Table headers
  echo "### Pattern 5: Table Headers" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" -E "<(th|Table\.HeaderCell)[^>]*>[A-ZÆØÅ][^<]*</(th|Table\.HeaderCell)>" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 6: Heading text
  echo "### Pattern 6: Heading Text" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" -E "<(h[1-6]|Heading)[^>]*>[A-ZÆØÅ][^<]*</(h[1-6]|Heading)>" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 7: Norwegian-specific characters (æ, ø, å)
  echo "### Pattern 7: Norwegian Text (æ, ø, å)" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.jsx" --include="*.ts" "[æøåÆØÅ]" "$APP_PATH" 2>/dev/null | grep -v "node_modules" | grep -v ".test." | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Pattern 8: Alert/Toast/Notification messages
  echo "### Pattern 8: Alert/Toast Messages" >> "$OUTPUT_FILE"
  grep -rn --include="*.tsx" --include="*.ts" -E "(toast|alert|notify)[\s]*\([^)]*[\"'][A-ZÆØÅ][^\"']*[\"']" "$APP_PATH" 2>/dev/null | head -50 >> "$OUTPUT_FILE" || echo "No matches" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  echo "================================================" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
}

# Scan each app
scan_app "Web" "$WORKSPACE_ROOT/apps/web/src"
scan_app "MinSide" "$WORKSPACE_ROOT/apps/minside/src"
scan_app "Backoffice" "$WORKSPACE_ROOT/apps/backoffice/src"
scan_app "Monitoring" "$WORKSPACE_ROOT/apps/monitoring/src"
scan_app "SaaS Admin" "$WORKSPACE_ROOT/apps/saas-admin/src"
scan_app "Docs Learning" "$WORKSPACE_ROOT/apps/docs-learning/src"

echo "" >> "$OUTPUT_FILE"
echo "# Summary" >> "$OUTPUT_FILE"
echo "================================================" >> "$OUTPUT_FILE"
echo "Total apps scanned: 6" >> "$OUTPUT_FILE"
echo "Report generated: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo ""
echo "✅ Audit complete!"
echo "📄 Report saved to: $OUTPUT_FILE"
echo ""
echo "To view the report:"
echo "  cat $OUTPUT_FILE"
echo "  or"
echo "  code $OUTPUT_FILE"
