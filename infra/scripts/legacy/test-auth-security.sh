#!/bin/bash

################################################################################
# Enterprise Authentication Security Test Suite
# Tests all authentication flows, cookie security, token validation, and more
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-https://api.digilist.no}"
TENANT_ID="${TENANT_ID:-f47ac10b-58cc-4372-a567-0e02b2c3d479}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
DEMO_TOKEN="${DEMO_TOKEN:-}"

# Test results
PASSED=0
FAILED=0
WARNINGS=0

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
    echo -e "${YELLOW}Testing:${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARNING:${NC} $1"
    ((WARNINGS++))
}

print_summary() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Passed:${NC}   $PASSED"
    echo -e "${RED}Failed:${NC}   $FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

################################################################################
# Test 1: Cookie Security Configuration
################################################################################

test_cookie_security() {
    print_header "TEST 1: Cookie Security Configuration"

    print_test "Cookie names are short and opaque"
    # Check cookie names don't leak information
    if grep -q "dl_at\|dl_rt\|dl_csrf" apps/api/src/config/cookies.ts; then
        print_pass "Cookie names are secure (dl_at, dl_rt, dl_csrf)"
    else
        print_fail "Cookie names may leak information"
    fi

    print_test "Access token has short lifetime (≤1 hour)"
    ACCESS_MAXAGE=$(grep -A 1 "ACCESS:" apps/api/src/config/cookies.ts | grep "maxAge" | grep -oE "[0-9]+")
    if [ "$ACCESS_MAXAGE" -le 3600 ]; then
        print_pass "Access token lifetime is $ACCESS_MAXAGE seconds (≤1 hour)"
    else
        print_fail "Access token lifetime is $ACCESS_MAXAGE seconds (>1 hour) - Security risk!"
    fi

    print_test "Refresh token has reasonable lifetime (≤30 days)"
    REFRESH_MAXAGE=$(grep -A 1 "REFRESH:" apps/api/src/config/cookies.ts | grep "maxAge" | grep -oE "[0-9]+")
    if [ "$REFRESH_MAXAGE" -le 2592000 ]; then
        print_pass "Refresh token lifetime is $REFRESH_MAXAGE seconds (≤30 days)"
    else
        print_warn "Refresh token lifetime is $REFRESH_MAXAGE seconds (>30 days)"
    fi

    print_test "Cookies use HttpOnly flag (XSS protection)"
    if grep -q "httpOnly: cookieType !== 'CSRF'" apps/api/src/config/cookies.ts; then
        print_pass "Access and refresh tokens are HttpOnly"
    else
        print_fail "HttpOnly not properly configured"
    fi

    print_test "Cookies use Secure flag in production"
    if grep -q "secure: isProduction" apps/api/src/config/cookies.ts; then
        print_pass "Secure flag enabled in production"
    else
        print_fail "Secure flag not configured"
    fi

    print_test "Cookies use SameSite=Lax (CSRF protection)"
    if grep -q "sameSite: 'lax'" apps/api/src/config/cookies.ts; then
        print_pass "SameSite=Lax configured"
    else
        print_fail "SameSite not properly configured"
    fi

    print_test "Cookie domain configured for SSO (.digilist.no)"
    if grep -q "domain: isProduction ? '.digilist.no' : undefined" apps/api/src/config/cookies.ts; then
        print_pass "Cookie domain supports cross-subdomain SSO"
    else
        print_fail "Cookie domain not configured for SSO"
    fi
}

################################################################################
# Test 2: JWT Token Security
################################################################################

test_jwt_security() {
    print_header "TEST 2: JWT Token Security"

    print_test "JWT secret key has minimum length (32 chars)"
    if grep -q "secret.length < 32" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT secret key length validation enforced"
    else
        print_fail "JWT secret key length not validated"
    fi

    print_test "JWT uses secure algorithm (HS256)"
    if grep -q "algorithm: jwt.Algorithm = 'HS256'" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT uses HS256 algorithm"
    else
        print_warn "JWT algorithm may not be secure"
    fi

    print_test "JWT includes tenant ID validation"
    if grep -q "validateTenant" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT tenant validation implemented"
    else
        print_fail "JWT tenant validation missing"
    fi

    print_test "JWT includes subscription validation"
    if grep -q "validateSubscription" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT subscription validation implemented"
    else
        print_fail "JWT subscription validation missing"
    fi

    print_test "JWT payload includes feature flags"
    if grep -q "featureFlags" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT payload includes feature flags"
    else
        print_warn "JWT payload missing feature flags"
    fi

    print_test "JWT includes issuer and audience claims"
    if grep -q "issuer: this.issuer" apps/api/src/core/auth/jwt.service.ts && \
       grep -q "audience: this.audience" apps/api/src/core/auth/jwt.service.ts; then
        print_pass "JWT issuer and audience claims configured"
    else
        print_fail "JWT issuer/audience claims missing"
    fi
}

################################################################################
# Test 3: Session Management
################################################################################

test_session_management() {
    print_header "TEST 3: Session Management"

    print_test "Refresh tokens stored as SHA-256 hashes"
    if grep -q "createHash('sha256')" apps/api/src/modules/auth/session.service.ts; then
        print_pass "Refresh tokens hashed with SHA-256"
    else
        print_fail "Refresh tokens not properly hashed"
    fi

    print_test "Refresh token rotation (one-time use)"
    if grep -q "rotateRefreshToken" apps/api/src/modules/auth/session.service.ts; then
        print_pass "Refresh token rotation implemented"
    else
        print_fail "Refresh token rotation missing"
    fi

    print_test "Session revocation support"
    if grep -q "revokeSession" apps/api/src/modules/auth/session.service.ts && \
       grep -q "revokeUserSessions" apps/api/src/modules/auth/session.service.ts; then
        print_pass "Session revocation implemented"
    else
        print_fail "Session revocation missing"
    fi

    print_test "Automatic expired session cleanup"
    if grep -q "cleanupExpiredSessions" apps/api/src/modules/auth/session.service.ts; then
        print_pass "Expired session cleanup implemented"
    else
        print_warn "Automatic session cleanup missing"
    fi

    print_test "Cryptographically secure token generation"
    if grep -q "randomBytes(32)" apps/api/src/modules/auth/session.service.ts; then
        print_pass "Tokens generated with crypto.randomBytes"
    else
        print_fail "Tokens not cryptographically secure"
    fi
}

################################################################################
# Test 4: Authentication Middleware
################################################################################

test_auth_middleware() {
    print_header "TEST 4: Authentication Middleware"

    print_test "Middleware extracts JWT from cookies"
    if grep -q "request.cookies\[COOKIE_CONFIG.ACCESS.name\]" apps/api/src/middleware/auth-cookie.middleware.ts; then
        print_pass "Middleware reads HTTP-only cookies"
    else
        print_fail "Middleware not reading cookies"
    fi

    print_test "Middleware validates tenant ID"
    if grep -q "validateTenant: true" apps/api/src/middleware/auth-cookie.middleware.ts; then
        print_pass "Middleware validates tenant ID"
    else
        print_fail "Middleware skips tenant validation"
    fi

    print_test "Middleware validates subscription"
    if grep -q "validateSubscription: true" apps/api/src/middleware/auth-cookie.middleware.ts; then
        print_pass "Middleware validates subscription"
    else
        print_fail "Middleware skips subscription validation"
    fi

    print_test "Middleware attaches user context to request"
    if grep -q "request.*userId\|request.*tenantId\|request.*subscription" apps/api/src/middleware/auth-cookie.middleware.ts; then
        print_pass "Middleware attaches user context"
    else
        print_fail "Middleware doesn't attach user context"
    fi
}

################################################################################
# Test 5: CORS Configuration
################################################################################

test_cors_configuration() {
    print_header "TEST 5: CORS Configuration"

    print_test "CORS allows credentials"
    if grep -q "credentials: true" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "CORS credentials enabled for cookies"
    else
        print_fail "CORS credentials not enabled"
    fi

    print_test "CORS origin whitelist configured"
    if grep -q "allowedOrigins" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "CORS origin whitelist configured"
    else
        print_warn "CORS may allow all origins"
    fi

    print_test "CORS allows required headers"
    if grep -q "X-Tenant-Id" apps/api/src/adapters/fastify.adapter.ts && \
       grep -q "Authorization" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "CORS allows required headers"
    else
        print_fail "CORS headers not properly configured"
    fi

    print_test "CORS exposes Set-Cookie header"
    if grep -q "exposedHeaders.*Set-Cookie" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "CORS exposes Set-Cookie header"
    else
        print_warn "Set-Cookie header may not be exposed"
    fi
}

################################################################################
# Test 6: Rate Limiting
################################################################################

test_rate_limiting() {
    print_header "TEST 6: Rate Limiting"

    print_test "Rate limiting configured"
    if grep -q "@fastify/rate-limit" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "Rate limiting enabled"
    else
        print_fail "Rate limiting not configured"
    fi

    print_test "Auth endpoints have stricter rate limits"
    if grep -q "authEndpoints\|authRateLimitConfig" apps/api/src/adapters/fastify.adapter.ts; then
        print_pass "Auth endpoints have stricter limits"
    else
        print_warn "Auth endpoints may not have special rate limits"
    fi
}

################################################################################
# Test 7: OAuth Callback Handler
################################################################################

test_oauth_callback() {
    print_header "TEST 7: OAuth Callback Handler"

    print_test "OAuth callback validates state parameter"
    if grep -q "state.*validation\|validateState\|query.state" apps/api/src/modules/auth/idporten-oidc.controller.ts; then
        print_pass "OAuth callback validates state (CSRF protection)"
    else
        print_fail "OAuth callback missing state validation"
    fi

    print_test "OAuth callback stores session state securely"
    if grep -q "sessionStore" apps/api/src/modules/auth/idporten-oidc.controller.ts; then
        print_pass "OAuth session state stored securely"
    else
        print_warn "OAuth session state management unclear"
    fi

    print_test "OAuth callback handles errors gracefully"
    if grep -q "query.error\|error.*occurred" apps/api/src/modules/auth/idporten-oidc.controller.ts; then
        print_pass "OAuth error handling implemented"
    else
        print_warn "OAuth error handling may be incomplete"
    fi
}

################################################################################
# Test 8: Tenant Data Validation
################################################################################

test_tenant_validation() {
    print_header "TEST 8: Tenant Data Validation"

    print_test "Tenant subscription data fetched for JWT"
    if grep -q "getTenantData" apps/api/src/modules/auth/tenant-data.service.ts; then
        print_pass "Tenant data service implemented"
    else
        print_fail "Tenant data not fetched"
    fi

    print_test "Tenant active status validated"
    if grep -q "status.*active\|validateTenant" apps/api/src/modules/auth/tenant-data.service.ts; then
        print_pass "Tenant active status validation implemented"
    else
        print_fail "Tenant status not validated"
    fi

    print_test "Subscription limits included in JWT"
    if grep -q "seatLimits\|maxUsers\|maxListings" apps/api/src/modules/auth/tenant-data.service.ts; then
        print_pass "Subscription limits included in JWT payload"
    else
        print_warn "Subscription limits may not be in JWT"
    fi
}

################################################################################
# Test 9: Frontend SDK Integration
################################################################################

test_frontend_sdk() {
    print_header "TEST 9: Frontend SDK Integration"

    print_test "AuthService has handleOAuthCallback method"
    if grep -q "handleOAuthCallback" packages/client-sdk/src/services/auth.service.ts; then
        print_pass "OAuth callback handler exists in SDK"
    else
        print_fail "OAuth callback handler missing from SDK"
    fi

    print_test "SDK calls correct OAuth callback endpoint"
    if grep -q "/idporten-oidc/callback" packages/client-sdk/src/services/auth.service.ts; then
        print_pass "SDK uses correct OAuth callback endpoint"
    else
        print_fail "SDK may be calling wrong endpoint"
    fi

    print_test "SDK sends credentials with requests"
    if grep -q "credentials: 'include'" packages/sdk-core/src/http/fetch-client.ts; then
        print_pass "SDK includes cookies in requests"
    else
        print_fail "SDK not sending credentials"
    fi

    print_test "AuthProvider passes state parameter"
    if grep -q "state.*parameter\|urlParams.get\('state'\)" packages/auth/src/providers/AuthProvider.tsx; then
        print_pass "AuthProvider extracts state parameter"
    else
        print_warn "AuthProvider may not pass state parameter"
    fi
}

################################################################################
# Test 10: Live API Tests (if API is accessible)
################################################################################

test_live_api() {
    print_header "TEST 10: Live API Tests (Optional)"

    # Check if API is accessible
    if ! curl -s --connect-timeout 5 "$API_URL/api/health" > /dev/null 2>&1; then
        print_warn "API not accessible at $API_URL - skipping live tests"
        return
    fi

    print_test "API health endpoint responds"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
    if [ "$STATUS" = "200" ]; then
        print_pass "API health endpoint is up (HTTP 200)"
    else
        print_fail "API health endpoint returned HTTP $STATUS"
    fi

    print_test "API returns RFC 7807 error format"
    RESPONSE=$(curl -s -H "Content-Type: application/json" "$API_URL/api/auth/session" || true)
    if echo "$RESPONSE" | grep -q "type.*title.*status"; then
        print_pass "API returns RFC 7807 Problem Details format"
    else
        print_warn "API error format may not comply with RFC 7807"
    fi

    print_test "API sets CORS headers"
    CORS_HEADER=$(curl -s -I -H "Origin: https://backoffice.digilist.no" "$API_URL/api/health" | grep -i "access-control-allow-credentials" || true)
    if echo "$CORS_HEADER" | grep -iq "true"; then
        print_pass "API sets CORS credentials header"
    else
        print_warn "CORS credentials header not found"
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  Xala/Digilist Enterprise Authentication Security Test Suite ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo "API URL: $API_URL"
    echo "Tenant ID: $TENANT_ID"
    echo ""

    # Run all tests
    test_cookie_security
    test_jwt_security
    test_session_management
    test_auth_middleware
    test_cors_configuration
    test_rate_limiting
    test_oauth_callback
    test_tenant_validation
    test_frontend_sdk
    test_live_api

    # Print summary
    print_summary
}

# Run tests
main "$@"
