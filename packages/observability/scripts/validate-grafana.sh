#!/bin/bash
# Validate Grafana Dashboards
# This script validates all Grafana dashboard JSON files

set -e

echo "🔍 Validating Grafana Dashboards..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find all dashboard JSON files
DASHBOARD_FILES=$(find grafana/dashboards -name "*.json" 2>/dev/null || true)

if [ -z "$DASHBOARD_FILES" ]; then
    echo -e "${YELLOW}⚠️  No dashboard files found${NC}"
    exit 0
fi

VALID_COUNT=0
INVALID_COUNT=0

for dashboard in $DASHBOARD_FILES; do
    echo "📊 Checking $dashboard..."
    
    # Validate JSON syntax
    if ! jq empty "$dashboard" 2>/dev/null; then
        echo -e "${RED}  ❌ Invalid JSON syntax${NC}"
        INVALID_COUNT=$((INVALID_COUNT + 1))
        continue
    fi
    
    # Check required fields
    MISSING_FIELDS=()
    
    if ! jq -e '.uid' "$dashboard" >/dev/null 2>&1; then
        MISSING_FIELDS+=("uid")
    fi
    
    if ! jq -e '.title' "$dashboard" >/dev/null 2>&1; then
        MISSING_FIELDS+=("title")
    fi
    
    if ! jq -e '.panels' "$dashboard" >/dev/null 2>&1; then
        MISSING_FIELDS+=("panels")
    fi
    
    if [ ${#MISSING_FIELDS[@]} -gt 0 ]; then
        echo -e "${RED}  ❌ Missing required fields: ${MISSING_FIELDS[*]}${NC}"
        INVALID_COUNT=$((INVALID_COUNT + 1))
        continue
    fi
    
    # Check for datasource variable
    if ! jq -e '.templating.list[] | select(.name == "DS_PROMETHEUS")' "$dashboard" >/dev/null 2>&1; then
        echo -e "${YELLOW}  ⚠️  Missing DS_PROMETHEUS datasource variable${NC}"
    fi
    
    echo -e "${GREEN}  ✅ Valid dashboard${NC}"
    VALID_COUNT=$((VALID_COUNT + 1))
done

echo ""
echo "📈 Validation Summary:"
echo "  Valid: $VALID_COUNT"
echo "  Invalid: $INVALID_COUNT"

if [ $INVALID_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Some dashboards failed validation${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All dashboards are valid!${NC}"
