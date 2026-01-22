#!/bin/bash

# Domain Boundary Verification Script
# Verifies architectural boundaries and compliance rules for Digilist
#
# Checks:
# 1. No platform source path references (../platform/src, etc.)
# 2. SDK-first compliance (no direct fetch/axios in apps)
# 3. Domain terminology (no "facility" usage, use "rentalObject")

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

# Counters
ERRORS=0
WARNINGS=0

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Domain Boundary Verification Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Workspace: $WORKSPACE_ROOT"
echo "Started: $(date)"
echo ""

# ==============================================================================
# Check 1: No Platform Source Path References
# ==============================================================================
echo -e "${YELLOW}[CHECK 1] Platform Source Path References${NC}"
echo "Scanning for forbidden platform source path references..."
echo ""

PLATFORM_PATH_PATTERNS=(
    "../platform/src"
    "../../platform/src"
    "../../../platform/src"
    "@xalatechnologies/platform/src"
    "packages/platform/src"
)

PLATFORM_PATH_VIOLATIONS=0

for pattern in "${PLATFORM_PATH_PATTERNS[@]}"; do
    # Search in apps directory, excluding node_modules
    MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        "$pattern" "$WORKSPACE_ROOT/apps" 2>/dev/null | grep -v "node_modules" || true)

    if [ -n "$MATCHES" ]; then
        echo -e "${RED}  VIOLATION: Found '$pattern' in:${NC}"
        echo "$MATCHES" | while read -r file; do
            echo "    - $file"
            ((PLATFORM_PATH_VIOLATIONS++)) || true
        done
    fi
done

# Also check for relative imports to platform internals
RELATIVE_PLATFORM_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
    -E "from ['\"]\.\..*platform.*['\"]" "$WORKSPACE_ROOT/apps" 2>/dev/null | grep -v "node_modules" || true)

if [ -n "$RELATIVE_PLATFORM_MATCHES" ]; then
    echo -e "${RED}  VIOLATION: Found relative imports to platform:${NC}"
    echo "$RELATIVE_PLATFORM_MATCHES" | while read -r file; do
        echo "    - $file"
        ((PLATFORM_PATH_VIOLATIONS++)) || true
    done
fi

if [ "$PLATFORM_PATH_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}  PASS: No platform source path references found${NC}"
else
    echo -e "${RED}  FAIL: Found $PLATFORM_PATH_VIOLATIONS platform path violations${NC}"
    ((ERRORS++)) || true
fi
echo ""

# ==============================================================================
# Check 2: SDK-First Compliance (No direct fetch/axios in apps)
# ==============================================================================
echo -e "${YELLOW}[CHECK 2] SDK-First Compliance${NC}"
echo "Scanning for forbidden direct API calls in apps..."
echo ""

SDK_VIOLATIONS=0

# Check for direct fetch() calls (excluding SDK and test files)
FETCH_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
    -E "fetch\s*\(" "$WORKSPACE_ROOT/apps" 2>/dev/null | \
    grep -v "node_modules" | \
    grep -v "\.test\." | \
    grep -v "\.spec\." | \
    grep -v "mock" || true)

if [ -n "$FETCH_MATCHES" ]; then
    # Filter out legitimate uses (service workers, etc.)
    REAL_FETCH_VIOLATIONS=""
    while IFS= read -r file; do
        # Check if it's an actual API fetch (not a type definition or comment)
        if grep -q "fetch\s*\(\s*['\"\`]" "$file" 2>/dev/null; then
            REAL_FETCH_VIOLATIONS="$REAL_FETCH_VIOLATIONS$file"$'\n'
        fi
    done <<< "$FETCH_MATCHES"

    if [ -n "$REAL_FETCH_VIOLATIONS" ]; then
        echo -e "${RED}  VIOLATION: Direct fetch() calls found:${NC}"
        echo "$REAL_FETCH_VIOLATIONS" | while read -r file; do
            if [ -n "$file" ]; then
                echo "    - $file"
                ((SDK_VIOLATIONS++)) || true
            fi
        done
    fi
fi

# Check for axios imports
AXIOS_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
    -E "import.*from ['\"]axios['\"]|require\(['\"]axios['\"]" "$WORKSPACE_ROOT/apps" 2>/dev/null | \
    grep -v "node_modules" || true)

if [ -n "$AXIOS_MATCHES" ]; then
    echo -e "${RED}  VIOLATION: Axios imports found (use SDK instead):${NC}"
    echo "$AXIOS_MATCHES" | while read -r file; do
        echo "    - $file"
        ((SDK_VIOLATIONS++)) || true
    done
fi

# Check for direct XMLHttpRequest
XHR_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
    "new XMLHttpRequest" "$WORKSPACE_ROOT/apps" 2>/dev/null | \
    grep -v "node_modules" || true)

if [ -n "$XHR_MATCHES" ]; then
    echo -e "${RED}  VIOLATION: XMLHttpRequest usage found (use SDK instead):${NC}"
    echo "$XHR_MATCHES" | while read -r file; do
        echo "    - $file"
        ((SDK_VIOLATIONS++)) || true
    done
fi

if [ "$SDK_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}  PASS: No direct API call violations found${NC}"
else
    echo -e "${RED}  FAIL: Found $SDK_VIOLATIONS SDK-first violations${NC}"
    ((ERRORS++)) || true
fi
echo ""

# ==============================================================================
# Check 3: Domain Terminology (no "facility", use "rentalObject")
# ==============================================================================
echo -e "${YELLOW}[CHECK 3] Domain Terminology Compliance${NC}"
echo "Scanning for banned terminology..."
echo ""

TERMINOLOGY_VIOLATIONS=0

# Function to check banned term
check_banned_term() {
    local banned="$1"
    local correct="$2"

    # Search in apps and domain packages
    TERM_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
        -w "$banned" "$WORKSPACE_ROOT/apps" "$WORKSPACE_ROOT/packages/client-sdk" 2>/dev/null | \
        grep -v "node_modules" | \
        grep -v "\.test\." | \
        grep -v "\.spec\." || true)

    if [ -n "$TERM_MATCHES" ]; then
        echo -e "${RED}  VIOLATION: Banned term '$banned' found (use '$correct' instead):${NC}"
        echo "$TERM_MATCHES" | head -10 | while read -r file; do
            echo "    - $file"
        done
        TERMINOLOGY_VIOLATIONS=$((TERMINOLOGY_VIOLATIONS + 1))

        # Show count if more than 10
        TOTAL_MATCHES=$(echo "$TERM_MATCHES" | wc -l | tr -d ' ')
        if [ "$TOTAL_MATCHES" -gt 10 ]; then
            echo "    ... and $((TOTAL_MATCHES - 10)) more files"
        fi
    fi
}

# Check banned terms (facility -> rentalObject)
check_banned_term "facility" "rentalObject"
check_banned_term "facilities" "rentalObjects"
check_banned_term "Facility" "RentalObject"
check_banned_term "Facilities" "RentalObjects"
check_banned_term "FACILITY" "RENTAL_OBJECT"
check_banned_term "FACILITIES" "RENTAL_OBJECTS"

# Also check for "listing" which should be "rentalObject" in domain context
LISTING_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
    -E "\blistings?\b" "$WORKSPACE_ROOT/apps" "$WORKSPACE_ROOT/packages/client-sdk" 2>/dev/null | \
    grep -v "node_modules" | \
    grep -v "\.test\." | \
    grep -v "\.spec\." | \
    grep -v "listing.service" || true)

# Note: "listing" may be acceptable in some contexts, so this is a warning
if [ -n "$LISTING_MATCHES" ]; then
    echo -e "${YELLOW}  WARNING: 'listing' term found (consider using 'rentalObject'):${NC}"
    echo "$LISTING_MATCHES" | head -5 | while read -r file; do
        echo "    - $file"
        ((WARNINGS++)) || true
    done

    TOTAL_LISTING=$(echo "$LISTING_MATCHES" | wc -l | tr -d ' ')
    if [ "$TOTAL_LISTING" -gt 5 ]; then
        echo "    ... and $((TOTAL_LISTING - 5)) more files"
    fi
fi

if [ "$TERMINOLOGY_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}  PASS: No banned terminology found${NC}"
else
    echo -e "${RED}  FAIL: Found $TERMINOLOGY_VIOLATIONS terminology violations${NC}"
    ((ERRORS++)) || true
fi
echo ""

# ==============================================================================
# Summary
# ==============================================================================
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}FAILED: Domain boundary violations detected!${NC}"
    echo ""
    echo "Please fix the violations above before committing."
    echo ""
    echo "Common fixes:"
    echo "  - Platform paths: Import from '@xalatechnologies/platform' subpaths"
    echo "  - SDK-first: Use '@digilist/client-sdk' services instead of fetch/axios"
    echo "  - Terminology: Replace 'facility' with 'rentalObject'"
    echo ""
    exit 1
else
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}PASSED with warnings${NC}"
    else
        echo -e "${GREEN}PASSED: All domain boundary checks passed!${NC}"
    fi
    exit 0
fi
