#!/bin/bash
# Validate Prometheus Configuration and Rules
# This script validates all Prometheus configuration files

set -e

echo "🔍 Validating Prometheus Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if promtool is available
if ! command -v promtool &> /dev/null; then
    echo -e "${YELLOW}⚠️  promtool not found. Installing via Docker...${NC}"
    PROMTOOL="docker run --rm -v $(pwd):/workspace -w /workspace prom/prometheus:latest promtool"
else
    PROMTOOL="promtool"
fi

# Validate main Prometheus configuration
echo "📋 Validating prometheus.yml..."
if $PROMTOOL check config prometheus/prometheus.yml; then
    echo -e "${GREEN}✅ prometheus.yml is valid${NC}"
else
    echo -e "${RED}❌ prometheus.yml validation failed${NC}"
    exit 1
fi

# Validate all rule files
echo ""
echo "📏 Validating Prometheus rules..."
RULE_FILES=$(find prometheus/rules -name "*.yml" -o -name "*.yaml" 2>/dev/null || true)

if [ -z "$RULE_FILES" ]; then
    echo -e "${YELLOW}⚠️  No rule files found${NC}"
else
    for rule_file in $RULE_FILES; do
        echo "  Checking $rule_file..."
        if $PROMTOOL check rules "$rule_file"; then
            echo -e "${GREEN}  ✅ $rule_file is valid${NC}"
        else
            echo -e "${RED}  ❌ $rule_file validation failed${NC}"
            exit 1
        fi
    done
fi

echo ""
echo -e "${GREEN}🎉 All Prometheus configurations are valid!${NC}"
