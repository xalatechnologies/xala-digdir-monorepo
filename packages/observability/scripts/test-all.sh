#!/bin/bash
# Run All Tests and Validations
# Comprehensive test suite for observability package

set -e

echo "🧪 Running Comprehensive Test Suite..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test and track result
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}▶ Running: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name passed${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# 1. Unit Tests
run_test "Unit Tests" "pnpm test"

# 2. TypeScript Build
run_test "TypeScript Build" "pnpm build"

# 3. Prometheus Validation
run_test "Prometheus Configuration" "bash scripts/validate-prometheus.sh"

# 4. Grafana Validation
run_test "Grafana Dashboards" "bash scripts/validate-grafana.sh"

# 5. Test Coverage
run_test "Test Coverage" "pnpm test:coverage"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All tests passed!${NC}"
