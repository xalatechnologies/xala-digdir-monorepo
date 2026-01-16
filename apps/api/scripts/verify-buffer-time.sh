#!/bin/bash

# Buffer Time Enforcement Verification Script
# Checks that all components for buffer time enforcement are in place

set -e

echo "🔍 Verifying Buffer Time Enforcement Implementation"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

check_file() {
  local file=$1
  local description=$2

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description - File not found: $file"
    ((FAILED++))
  fi
}

check_pattern() {
  local file=$1
  local pattern=$2
  local description=$3

  if [ -f "$file" ]; then
    if grep -q "$pattern" "$file"; then
      echo -e "${GREEN}✓${NC} $description"
      ((PASSED++))
    else
      echo -e "${RED}✗${NC} $description - Pattern not found in $file"
      ((FAILED++))
    fi
  else
    echo -e "${RED}✗${NC} $description - File not found: $file"
    ((FAILED++))
  fi
}

echo "📦 Backend Components"
echo "-------------------"
check_pattern "apps/api/src/database/schema/index.ts" "bufferTimeMinutes" "Buffer time field in schema"
check_pattern "apps/api/src/modules/booking/booking.service.ts" "bufferTimeMinutes" "Buffer time validation in booking service"
check_pattern "apps/api/src/modules/availability/availability.controller.ts" "bufferTimeMinutes" "Buffer time check in availability controller"
echo ""

echo "🎨 Frontend Components"
echo "--------------------"
check_pattern "apps/backoffice/src/features/calendar/components/ConflictIndicator.tsx" "bufferTimeMinutes" "Buffer time visualization in calendar"
check_pattern "apps/backoffice/src/features/calendar/hooks/useConflictDetection.ts" "bufferMinutes" "Buffer time detection in hook"
check_pattern "apps/web/src/features/listing-details/components/Sidebar/components/BookingCartSidebar.tsx" "lastUpdated" "Last-updated timestamp in web"
echo ""

echo "🧪 Test Components"
echo "----------------"
check_file "apps/api/tests/integration/buffer-time-enforcement.test.ts" "Integration test for buffer time"
check_pattern "e2e/real-time-booking-conflicts.spec.ts" "verify buffer time enforcement end-to-end" "E2E test for buffer time"
echo ""

echo "📝 Documentation"
echo "--------------"
check_file ".auto-claude/specs/030-real-time-availability-with-conflict-prevention/buffer-time-verification.md" "Verification documentation"
echo ""

echo "=================================================="
echo ""
echo -e "Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All buffer time components are in place!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start development environment: pnpm dev"
  echo "2. Run integration test: cd apps/api && API_URL=http://localhost:3000 pnpm test -- buffer-time-enforcement.test.ts"
  echo "3. Run E2E test: pnpm test:e2e -- real-time-booking-conflicts.spec.ts"
  echo "4. See detailed verification steps in: .auto-claude/specs/030-real-time-availability-with-conflict-prevention/buffer-time-verification.md"
  exit 0
else
  echo -e "${RED}✗ Some components are missing. Please check the implementation.${NC}"
  exit 1
fi
