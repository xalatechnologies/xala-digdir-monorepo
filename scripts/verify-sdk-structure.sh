#!/bin/bash

# SDK Structure Verification Script
# Verifies the client-sdk package has all required domain services
#
# Checks:
# 1. All domain services exist in packages/client-sdk/src/services/
# 2. Required services: booking.service, calendar.service, pricing.service,
#    allocations.service, favorites.service
# 3. Service exports are properly configured in index.ts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory and workspace root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"

# SDK services directory
SDK_SERVICES_DIR="$WORKSPACE_ROOT/packages/client-sdk/src/services"
SDK_INDEX="$SDK_SERVICES_DIR/index.ts"

# Counters
ERRORS=0
WARNINGS=0

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  SDK Structure Verification Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Workspace: $WORKSPACE_ROOT"
echo "SDK Services: $SDK_SERVICES_DIR"
echo "Started: $(date)"
echo ""

# ==============================================================================
# Pre-flight Check: Verify SDK package exists
# ==============================================================================
if [ ! -d "$SDK_SERVICES_DIR" ]; then
    echo -e "${RED}FATAL: SDK services directory not found!${NC}"
    echo "Expected: $SDK_SERVICES_DIR"
    exit 1
fi

# ==============================================================================
# Check 1: Required Domain Services
# ==============================================================================
echo -e "${YELLOW}[CHECK 1] Required Domain Services${NC}"
echo "Verifying all required services exist..."
echo ""

# List of required services (filename without extension)
REQUIRED_SERVICES=(
    "booking.service"
    "calendar.service"
    "pricing.service"
    "allocations.service"
    "favorites.service"
)

# Additional important services to verify
IMPORTANT_SERVICES=(
    "rental-object.service"
    "auth.service"
    "user.service"
    "organization.service"
    "notification.service"
    "audit.service"
    "dashboard.service"
    "season.service"
    "seasonal-lease.service"
)

MISSING_REQUIRED=0
MISSING_IMPORTANT=0

echo "  Required services:"
for service in "${REQUIRED_SERVICES[@]}"; do
    SERVICE_FILE="$SDK_SERVICES_DIR/$service.ts"
    if [ -f "$SERVICE_FILE" ]; then
        echo -e "    ${GREEN}[OK]${NC} $service.ts"
    else
        echo -e "    ${RED}[MISSING]${NC} $service.ts"
        ((MISSING_REQUIRED++)) || true
        ((ERRORS++)) || true
    fi
done

echo ""
echo "  Important services:"
for service in "${IMPORTANT_SERVICES[@]}"; do
    SERVICE_FILE="$SDK_SERVICES_DIR/$service.ts"
    if [ -f "$SERVICE_FILE" ]; then
        echo -e "    ${GREEN}[OK]${NC} $service.ts"
    else
        echo -e "    ${YELLOW}[MISSING]${NC} $service.ts"
        ((MISSING_IMPORTANT++)) || true
        ((WARNINGS++)) || true
    fi
done

echo ""

if [ "$MISSING_REQUIRED" -eq 0 ]; then
    echo -e "${GREEN}  PASS: All required services present${NC}"
else
    echo -e "${RED}  FAIL: Missing $MISSING_REQUIRED required services${NC}"
fi

if [ "$MISSING_IMPORTANT" -gt 0 ]; then
    echo -e "${YELLOW}  WARNING: Missing $MISSING_IMPORTANT important services${NC}"
fi
echo ""

# ==============================================================================
# Check 2: Service Index Exports
# ==============================================================================
echo -e "${YELLOW}[CHECK 2] Service Index Exports${NC}"
echo "Verifying services are exported from index.ts..."
echo ""

if [ ! -f "$SDK_INDEX" ]; then
    echo -e "${RED}  FAIL: index.ts not found at $SDK_INDEX${NC}"
    ((ERRORS++)) || true
else
    MISSING_EXPORTS=0

    for service in "${REQUIRED_SERVICES[@]}"; do
        # Extract service name for export check (e.g., "booking" from "booking.service")
        SERVICE_NAME="${service%.service}"

        # Check if service is exported (various patterns)
        if grep -qE "export.*from.*['\"]./$service['\"]|export.*${SERVICE_NAME}Service|export.*\* from.*['\"]./$service['\"]" "$SDK_INDEX" 2>/dev/null; then
            echo -e "    ${GREEN}[EXPORTED]${NC} $service"
        else
            echo -e "    ${YELLOW}[NOT EXPORTED]${NC} $service"
            ((MISSING_EXPORTS++)) || true
            ((WARNINGS++)) || true
        fi
    done

    echo ""

    if [ "$MISSING_EXPORTS" -eq 0 ]; then
        echo -e "${GREEN}  PASS: All required services are exported${NC}"
    else
        echo -e "${YELLOW}  WARNING: $MISSING_EXPORTS services may not be exported from index${NC}"
    fi
fi
echo ""

# ==============================================================================
# Check 3: Service Structure Validation
# ==============================================================================
echo -e "${YELLOW}[CHECK 3] Service Structure Validation${NC}"
echo "Checking service files follow correct patterns..."
echo ""

STRUCTURE_ISSUES=0

for service in "${REQUIRED_SERVICES[@]}"; do
    SERVICE_FILE="$SDK_SERVICES_DIR/$service.ts"

    if [ -f "$SERVICE_FILE" ]; then
        # Check for class export or service object export
        if grep -qE "export (class|const).*Service|export default" "$SERVICE_FILE" 2>/dev/null; then
            # Check for BaseService extension or proper service pattern
            if grep -qE "extends BaseService|createService|Service\s*=\s*{" "$SERVICE_FILE" 2>/dev/null; then
                echo -e "    ${GREEN}[VALID]${NC} $service.ts - follows service pattern"
            else
                echo -e "    ${YELLOW}[WARN]${NC} $service.ts - may not extend BaseService"
                ((WARNINGS++)) || true
            fi
        else
            echo -e "    ${YELLOW}[WARN]${NC} $service.ts - no service export found"
            ((STRUCTURE_ISSUES++)) || true
            ((WARNINGS++)) || true
        fi
    fi
done

echo ""

if [ "$STRUCTURE_ISSUES" -eq 0 ]; then
    echo -e "${GREEN}  PASS: Service structure looks correct${NC}"
else
    echo -e "${YELLOW}  WARNING: $STRUCTURE_ISSUES services may have structure issues${NC}"
fi
echo ""

# ==============================================================================
# Check 4: Service Dependencies
# ==============================================================================
echo -e "${YELLOW}[CHECK 4] Service Dependencies${NC}"
echo "Checking for base service and common imports..."
echo ""

# Check for base.service.ts
if [ -f "$SDK_SERVICES_DIR/base.service.ts" ]; then
    echo -e "    ${GREEN}[OK]${NC} base.service.ts exists"
else
    echo -e "    ${RED}[MISSING]${NC} base.service.ts - required for service base class"
    ((ERRORS++)) || true
fi

# Check if services import from sdk-core correctly
SDK_CORE_IMPORTS=$(grep -rl --include="*.ts" "@xala/sdk-core\|@xalatechnologies/platform/sdk" "$SDK_SERVICES_DIR" 2>/dev/null | wc -l | tr -d ' ')
if [ "$SDK_CORE_IMPORTS" -gt 0 ]; then
    echo -e "    ${GREEN}[OK]${NC} $SDK_CORE_IMPORTS services import from sdk-core/platform"
else
    echo -e "    ${YELLOW}[WARN]${NC} No services import from sdk-core (may use local utilities)"
    ((WARNINGS++)) || true
fi

echo ""

# ==============================================================================
# Check 5: Service Count Summary
# ==============================================================================
echo -e "${YELLOW}[CHECK 5] Service Count Summary${NC}"
echo "Counting all services in SDK..."
echo ""

# Count total service files
TOTAL_SERVICES=$(find "$SDK_SERVICES_DIR" -name "*.service.ts" -type f | wc -l | tr -d ' ')
echo "  Total service files: $TOTAL_SERVICES"

# List all services
echo ""
echo "  All services found:"
find "$SDK_SERVICES_DIR" -name "*.service.ts" -type f -exec basename {} \; | sort | while read -r svc; do
    echo "    - $svc"
done

echo ""

# ==============================================================================
# Summary
# ==============================================================================
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Total services: $TOTAL_SERVICES"
echo "Errors:         $ERRORS"
echo "Warnings:       $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}FAILED: SDK structure issues detected!${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    echo ""
    echo "To create a missing service:"
    echo "  1. Create file: packages/client-sdk/src/services/<name>.service.ts"
    echo "  2. Extend BaseService or follow existing service patterns"
    echo "  3. Export from packages/client-sdk/src/services/index.ts"
    echo ""
    exit 1
else
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}PASSED with warnings${NC}"
        echo "Consider reviewing the warnings above."
    else
        echo -e "${GREEN}PASSED: SDK structure is correct!${NC}"
    fi
    exit 0
fi
