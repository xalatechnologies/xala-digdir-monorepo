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

    # Search in apps and domain packages, excluding:
    # - node_modules, dist (build artifacts)
    # - test files
    # - .d.ts files (may contain legitimate type unions)
    TERM_MATCHES=$(grep -rln --include="*.ts" --include="*.tsx" \
        -w "$banned" "$WORKSPACE_ROOT/apps" "$WORKSPACE_ROOT/packages/client-sdk/src" 2>/dev/null | \
        grep -v "node_modules" | \
        grep -v "/dist/" | \
        grep -v "\.test\." | \
        grep -v "\.spec\." | \
        grep -v "\.d\.ts$" || true)

    # Filter out legitimate uses (deprecated aliases, enum type definitions, physical facility comments)
    REAL_VIOLATIONS=""
    if [ -n "$TERM_MATCHES" ]; then
        while IFS= read -r file; do
            # Check if file contains @deprecated near the banned term (within 3 lines above)
            # This handles JSDoc deprecation comments
            FILE_HAS_DEPRECATED_ALIAS=false
            if grep -B3 -w "$banned" "$file" 2>/dev/null | grep -q "@deprecated"; then
                FILE_HAS_DEPRECATED_ALIAS=true
            fi

            # Get the matching lines
            LINES=$(grep -n -w "$banned" "$file" 2>/dev/null || true)

            # Check each line for legitimate uses
            HAS_VIOLATION=false
            while IFS= read -r line; do
                # Skip empty lines
                if [ -z "$line" ]; then
                    continue
                fi

                # Skip if this file has a deprecated alias for this term
                if [ "$FILE_HAS_DEPRECATED_ALIAS" = true ]; then
                    # Check if this specific line is part of the deprecated field/alias
                    if echo "$line" | grep -qE "facilities\??\s*:|\bfacilities\b.*="; then
                        continue
                    fi
                fi

                # Skip if it's a deprecated alias (inline)
                if echo "$line" | grep -q "@deprecated"; then
                    continue
                fi

                # Skip if it's a type/enum value definition (e.g., 'FACILITY' | 'EQUIPMENT', type X = 'FACILITY')
                if echo "$line" | grep -qE "'$banned'\s*\||\|\s*'$banned'|type\s+\w+\s*=.*'$banned'|:\s*'$banned'"; then
                    continue
                fi

                # Skip if it's a RentalObjectType enum comparison or switch case
                if echo "$line" | grep -qE "===\s*'$banned'|case\s*'$banned'|RentalObjectType\.$banned"; then
                    continue
                fi

                # Skip if FACILITY is used as a rental object type category (legitimate enum value)
                # This is a valid RentalObjectType: 'FACILITY' | 'EQUIPMENT' | 'EVENT' | 'OTHER'
                # Patterns include: type definitions, comparisons, mappings, comments about types
                if [ "$banned" = "FACILITY" ]; then
                    # Skip type definitions and unions
                    if echo "$line" | grep -qE "'FACILITY'\s*\||\|\s*'FACILITY'|RentalObjectType"; then
                        continue
                    fi
                    # Skip map/object keys and values
                    if echo "$line" | grep -qE "FACILITY\s*:|:\s*'FACILITY'|===\s*'FACILITY'|'FACILITY',"; then
                        continue
                    fi
                    # Skip comments that reference FACILITY as a type
                    if echo "$line" | grep -qE "//.*FACILITY|FACILITY.*type|venues/FACILITY|\* FACILITY"; then
                        continue
                    fi
                fi

                # Skip if it's about physical facility access (smart locks, doors)
                if echo "$line" | grep -qiE "facility (access|door|lock|entry|building)"; then
                    continue
                fi

                # Skip if it's about sports/physical facilities as buildings
                if echo "$line" | grep -qiE "sports facilities|conference facilities|physical facilities"; then
                    continue
                fi

                # Skip if it's a config object key for a rental object type
                if echo "$line" | grep -qE "\[$banned\]:|$banned\s*:.*\{"; then
                    continue
                fi

                # This is a real violation
                HAS_VIOLATION=true
                break
            done <<< "$LINES"

            if [ "$HAS_VIOLATION" = true ]; then
                REAL_VIOLATIONS="$REAL_VIOLATIONS$file"$'\n'
            fi
        done <<< "$TERM_MATCHES"
    fi

    if [ -n "$REAL_VIOLATIONS" ]; then
        echo -e "${RED}  VIOLATION: Banned term '$banned' found (use '$correct' instead):${NC}"
        echo "$REAL_VIOLATIONS" | head -10 | while read -r file; do
            if [ -n "$file" ]; then
                echo "    - $file"
            fi
        done
        TERMINOLOGY_VIOLATIONS=$((TERMINOLOGY_VIOLATIONS + 1))

        # Show count if more than 10
        TOTAL_MATCHES=$(echo "$REAL_VIOLATIONS" | grep -c . || echo 0)
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
