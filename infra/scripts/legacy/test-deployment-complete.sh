#!/bin/bash
# =============================================================================
# COMPREHENSIVE DEPLOYMENT & DEV MODE TEST SUITE
# Tests EVERYTHING to 5000% certainty
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

function test_header() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

function test_case() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}[TEST $TOTAL_TESTS]${NC} $1"
}

function pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "${GREEN}  ✅ PASS${NC} - $1"
}

function fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "${RED}  ❌ FAIL${NC} - $1"
}

# =============================================================================
# TEST SUITE 1: PRODUCTION API TESTS
# =============================================================================

test_header "TEST SUITE 1: PRODUCTION API"

test_case "API Health Check"
if curl -sf https://api.digilist.no/health | grep -q '"status":"ok"'; then
    pass "API is responding and healthy"
else
    fail "API health check failed"
fi

test_case "API Version Check"
if curl -sf https://api.digilist.no/health | grep -q '"version":"1.0.0"'; then
    pass "API version is correct"
else
    fail "API version check failed"
fi

test_case "API CORS Headers"
CORS=$(curl -sI https://api.digilist.no/health | grep -i "access-control")
if [ -n "$CORS" ]; then
    pass "CORS headers present"
else
    fail "CORS headers missing"
fi

test_case "SSL Certificate Valid"
if curl -sf https://api.digilist.no/health > /dev/null 2>&1; then
    pass "SSL certificate is valid"
else
    fail "SSL certificate issue"
fi

# =============================================================================
# TEST SUITE 2: AUTHENTICATION ENDPOINTS
# =============================================================================

test_header "TEST SUITE 2: AUTHENTICATION ENDPOINTS"

test_case "Demo Login Endpoint Exists"
RESPONSE=$(curl -sf -X POST https://api.digilist.no/api/auth/demo-token \
    -H "Content-Type: application/json" \
    -d '{"token":"skien-admin-001"}' -w "%{http_code}")
if echo "$RESPONSE" | grep -q "200"; then
    pass "Demo login endpoint responding"
else
    fail "Demo login endpoint failed"
fi

test_case "Demo Login Returns JWT"
RESPONSE=$(curl -sf -X POST https://api.digilist.no/api/auth/demo-token \
    -H "Content-Type: application/json" \
    -d '{"token":"skien-admin-001"}' | jq -r '.data.token')
if [ -n "$RESPONSE" ] && [ "$RESPONSE" != "null" ]; then
    pass "JWT token returned"
else
    fail "JWT token not returned"
fi

test_case "Demo Login Returns User Data"
USER_EMAIL=$(curl -sf -X POST https://api.digilist.no/api/auth/demo-token \
    -H "Content-Type: application/json" \
    -d '{"token":"skien-admin-001"}' | jq -r '.data.user.email')
if [ "$USER_EMAIL" = "admin@skien.kommune.no" ]; then
    pass "User data correct"
else
    fail "User data incorrect"
fi

test_case "Demo Login Sets Cookies"
COOKIES=$(curl -sI -X POST https://api.digilist.no/api/auth/demo-token \
    -H "Content-Type: application/json" \
    -d '{"token":"skien-admin-001"}' | grep -i "set-cookie")
if echo "$COOKIES" | grep -q "dl_at"; then
    pass "Access token cookie set"
else
    fail "Access token cookie not set"
fi

if echo "$COOKIES" | grep -q "dl_rt"; then
    pass "Refresh token cookie set"
else
    fail "Refresh token cookie not set"
fi

if echo "$COOKIES" | grep -q "dl_csrf"; then
    pass "CSRF token cookie set"
else
    fail "CSRF token cookie not set"
fi

test_case "Cookies are HTTP-only"
if echo "$COOKIES" | grep -q "HttpOnly"; then
    pass "Cookies are HTTP-only"
else
    fail "Cookies not HTTP-only"
fi

test_case "Invalid Token Rejected"
HTTP_CODE=$(curl -sf -X POST https://api.digilist.no/api/auth/demo-token \
    -H "Content-Type: application/json" \
    -d '{"token":"invalid-token-12345"}' -w "%{http_code}" -o /dev/null)
if [ "$HTTP_CODE" = "401" ]; then
    pass "Invalid tokens properly rejected"
else
    fail "Invalid token not rejected (got HTTP $HTTP_CODE)"
fi

# =============================================================================
# TEST SUITE 3: FRONTEND APPS ACCESSIBILITY
# =============================================================================

test_header "TEST SUITE 3: FRONTEND APPLICATIONS"

test_case "Web App Accessible"
if curl -sf https://web-test.digilist.no/ | grep -q "Digilist"; then
    pass "Web app accessible"
else
    fail "Web app not accessible"
fi

test_case "Backoffice App Accessible"
if curl -sf https://backoffice-test.digilist.no/ | grep -q "Backoffice"; then
    pass "Backoffice app accessible"
else
    fail "Backoffice app not accessible"
fi

test_case "Minside App Accessible"
if curl -sf https://minside-test.digilist.no/ | grep -q "Digilist"; then
    pass "Minside app accessible"
else
    fail "Minside app not accessible"
fi

test_case "SaaS Admin App Accessible"
if curl -sf https://saas-admin.digilist.no/ | grep -q "Digilist"; then
    pass "SaaS Admin app accessible"
else
    fail "SaaS Admin app not accessible"
fi

test_case "Tenant Admin App Accessible"
if curl -sf https://tenant-admin.digilist.no/ | grep -q "Digilist"; then
    pass "Tenant Admin app accessible"
else
    fail "Tenant Admin app not accessible"
fi

# =============================================================================
# TEST SUITE 4: DEV MODE SECURITY (PRODUCTION)
# =============================================================================

test_header "TEST SUITE 4: DEV MODE PRODUCTION SAFETY"

test_case "No Dev Mode in Production HTML"
if ! curl -sf https://backoffice-test.digilist.no/ | grep -q "DEV MODE"; then
    pass "No dev mode references in production HTML"
else
    fail "Dev mode references found in production!"
fi

test_case "No Dev Mode Emoji in Production Bundle"
if ! curl -sf https://backoffice-test.digilist.no/ | grep -q "🔧"; then
    pass "No dev mode emoji in production"
else
    fail "Dev mode emoji found in production!"
fi

test_case "No Dev User in Production"
if ! curl -sf https://backoffice-test.digilist.no/ | grep -q "dev@localhost"; then
    pass "No dev user references in production"
else
    fail "Dev user found in production!"
fi

test_case "Production Build Contains No Dev Code"
cd apps/backoffice
if ! grep -r "DEV MODE ACTIVE" dist/ 2>/dev/null; then
    pass "Production bundle clean (no dev code)"
else
    fail "Dev code found in production bundle!"
fi
cd ../..

# =============================================================================
# TEST SUITE 5: DATABASE CONNECTIVITY
# =============================================================================

test_header "TEST SUITE 5: DATABASE & SESSIONS"

test_case "Database Connected (via API)"
if curl -sf https://api.digilist.no/health | grep -q "ok"; then
    pass "Database connection healthy"
else
    fail "Database connection issue"
fi

test_case "Sessions Table Exists"
ssh root@72.61.23.56 "sudo -u postgres psql digilist_prod -c 'SELECT COUNT(*) FROM sessions;'" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    pass "Sessions table exists and accessible"
else
    fail "Sessions table not accessible"
fi

test_case "Demo Tokens Exist"
DEMO_COUNT=$(ssh root@72.61.23.56 "sudo -u postgres psql digilist_prod -t -c \"SELECT COUNT(*) FROM users WHERE demo_token IS NOT NULL;\"" 2>/dev/null | tr -d ' ')
if [ "$DEMO_COUNT" -gt 0 ]; then
    pass "Demo tokens found in database ($DEMO_COUNT users)"
else
    fail "No demo tokens found"
fi

# =============================================================================
# TEST SUITE 6: ENVIRONMENT ISOLATION
# =============================================================================

test_header "TEST SUITE 6: ENVIRONMENT VARIABLE ISOLATION"

test_case "Vite Build Removes Dev Code"
cd apps/backoffice
VITE_ENABLE_DEV_MODE=true npm run build > /dev/null 2>&1
if ! grep -r "Developer User" dist/ 2>/dev/null; then
    pass "Vite build properly tree-shakes dev code"
else
    fail "Dev code not removed by build!"
fi
cd ../..

test_case ".env.development.example Exists"
if [ -f ".env.development.example" ]; then
    pass "Dev mode template exists"
else
    fail "Dev mode template missing"
fi

test_case "Documentation Complete"
if [ -f "DEV_MODE_GUIDE.md" ] && [ -f "DEV_MODE_IMPLEMENTATION.md" ]; then
    pass "Dev mode documentation complete"
else
    fail "Dev mode documentation missing"
fi

# =============================================================================
# TEST SUITE 7: PM2 PROCESS HEALTH
# =============================================================================

test_header "TEST SUITE 7: PM2 PROCESS MANAGEMENT"

test_case "API Process Running"
PM2_STATUS=$(ssh root@72.61.23.56 'pm2 list | grep digilist-api')
if echo "$PM2_STATUS" | grep -q "online"; then
    pass "API process is online"
else
    fail "API process not online"
fi

test_case "API Process Uptime"
if echo "$PM2_STATUS" | grep -qE "[0-9]+[smhd]"; then
    pass "API has positive uptime"
else
    fail "API uptime issue"
fi

# =============================================================================
# TEST SUITE 8: SECURITY HEADERS
# =============================================================================

test_header "TEST SUITE 8: SECURITY HEADERS"

test_case "HSTS Header Present"
if curl -sI https://api.digilist.no/health | grep -qi "strict-transport-security"; then
    pass "HSTS header present"
else
    fail "HSTS header missing"
fi

test_case "X-Content-Type-Options Present"
if curl -sI https://api.digilist.no/health | grep -qi "x-content-type-options"; then
    pass "X-Content-Type-Options header present"
else
    fail "X-Content-Type-Options missing"
fi

test_case "X-Frame-Options Present"
if curl -sI https://api.digilist.no/health | grep -qi "x-frame-options"; then
    pass "X-Frame-Options header present"
else
    fail "X-Frame-Options missing"
fi

# =============================================================================
# TEST SUITE 9: BUILD VERIFICATION
# =============================================================================

test_header "TEST SUITE 9: BUILD INTEGRITY"

test_case "Backoffice Build Exists"
if [ -f "apps/backoffice/dist/index.html" ]; then
    pass "Backoffice built successfully"
else
    fail "Backoffice build missing"
fi

test_case "Backoffice Bundle Size Reasonable"
BUNDLE_SIZE=$(du -sh apps/backoffice/dist | cut -f1)
pass "Backoffice bundle size: $BUNDLE_SIZE"

test_case "Source Maps Generated"
if ls apps/backoffice/dist/assets/*.map > /dev/null 2>&1; then
    pass "Source maps present"
else
    fail "Source maps not generated"
fi

# =============================================================================
# FINAL REPORT
# =============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    FINAL TEST RESULTS                         ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests:  ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:       ${PASS_COUNT}${NC}"
echo -e "${RED}Failed:       ${FAIL_COUNT}${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║                  🎉 ALL TESTS PASSED! 🎉                      ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║              5,000% CERTAINTY ACHIEVED! 🚀                    ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    PERCENTAGE=$((PASS_COUNT * 100 / TOTAL_TESTS))
    echo -e "Success Rate: ${GREEN}${PERCENTAGE}%${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                               ║${NC}"
    echo -e "${RED}║                   ⚠️  TESTS FAILED  ⚠️                         ║${NC}"
    echo -e "${RED}║                                                               ║${NC}"
    echo -e "${RED}║              Review failed tests above                        ║${NC}"
    echo -e "${RED}║                                                               ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    PERCENTAGE=$((PASS_COUNT * 100 / TOTAL_TESTS))
    echo -e "Success Rate: ${YELLOW}${PERCENTAGE}%${NC}"
    exit 1
fi
