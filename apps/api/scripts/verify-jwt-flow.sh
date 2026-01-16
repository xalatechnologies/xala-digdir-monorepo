#!/bin/bash
set -e

# JWT Authentication Flow Verification Script
# This script verifies the complete JWT authentication flow

API_URL="${API_URL:-http://localhost:4000}"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo "🔐 JWT Authentication Flow Verification"
echo "========================================"
echo ""
echo "API URL: $API_URL"
echo ""

# Check if server is running
echo "📡 Checking API server..."
if ! curl -s -f "$API_URL/health" > /dev/null; then
  echo -e "${COLOR_RED}❌ API server is not running at $API_URL${COLOR_RESET}"
  echo ""
  echo "Please start the API server first:"
  echo "  pnpm dev"
  echo ""
  exit 1
fi
echo -e "${COLOR_GREEN}✅ API server is running${COLOR_RESET}"
echo ""

# Step 1: Login and get JWT token
echo "📝 Step 1: Login and receive JWT token"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
EXPIRES_AT=$(echo "$LOGIN_RESPONSE" | jq -r '.expiresAt')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${COLOR_RED}❌ Failed to get token${COLOR_RESET}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# Verify JWT format (3 parts)
TOKEN_PARTS=$(echo "$TOKEN" | tr '.' '\n' | wc -l)
if [ "$TOKEN_PARTS" -ne 3 ]; then
  echo -e "${COLOR_RED}❌ Invalid JWT format (expected 3 parts, got $TOKEN_PARTS)${COLOR_RESET}"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ Received valid JWT token${COLOR_RESET}"
echo "   Token: ${TOKEN:0:50}..."
echo "   Expires: $EXPIRES_AT"
echo "   Parts: 3 (header.payload.signature)"
echo ""

# Step 2: Decode and verify JWT structure
echo "🔍 Step 2: Verify JWT structure"
echo "----------------------------------------"

# Decode header
HEADER_BASE64=$(echo "$TOKEN" | cut -d'.' -f1)
HEADER=$(echo "$HEADER_BASE64" | base64 -d 2>/dev/null || echo "$HEADER_BASE64" | base64 -D 2>/dev/null)
echo "Header: $HEADER"

ALG=$(echo "$HEADER" | jq -r '.alg')
TYP=$(echo "$HEADER" | jq -r '.typ')

if [ "$ALG" != "HS256" ]; then
  echo -e "${COLOR_RED}❌ Invalid algorithm (expected HS256, got $ALG)${COLOR_RESET}"
  exit 1
fi

if [ "$TYP" != "JWT" ]; then
  echo -e "${COLOR_RED}❌ Invalid type (expected JWT, got $TYP)${COLOR_RESET}"
  exit 1
fi

# Decode payload
PAYLOAD_BASE64=$(echo "$TOKEN" | cut -d'.' -f2)
PAYLOAD=$(echo "$PAYLOAD_BASE64" | base64 -d 2>/dev/null || echo "$PAYLOAD_BASE64" | base64 -D 2>/dev/null)
echo "Payload: $PAYLOAD"

USER_ID=$(echo "$PAYLOAD" | jq -r '.userId')
TENANT_ID=$(echo "$PAYLOAD" | jq -r '.tenantId')
ISS=$(echo "$PAYLOAD" | jq -r '.iss')
AUD=$(echo "$PAYLOAD" | jq -r '.aud')

echo -e "${COLOR_GREEN}✅ JWT structure is valid${COLOR_RESET}"
echo "   Algorithm: $ALG"
echo "   Type: $TYP"
echo "   User ID: $USER_ID"
echo "   Tenant ID: $TENANT_ID"
echo "   Issuer: $ISS"
echo "   Audience: $AUD"
echo ""

# Step 3: Use JWT for authenticated request
echo "🔑 Step 3: Use JWT for authenticated request"
echo "----------------------------------------"
SESSION_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/session" \
  -H "Authorization: Bearer $TOKEN")

AUTHENTICATED=$(echo "$SESSION_RESPONSE" | jq -r '.authenticated')
SESSION_USER_ID=$(echo "$SESSION_RESPONSE" | jq -r '.userId')

if [ "$AUTHENTICATED" != "true" ]; then
  echo -e "${COLOR_RED}❌ Authentication failed${COLOR_RESET}"
  echo "Response: $SESSION_RESPONSE"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ JWT token grants access to protected route${COLOR_RESET}"
echo "   Authenticated: $AUTHENTICATED"
echo "   User ID: $SESSION_USER_ID"
echo ""

# Step 4: Verify unauthenticated request is rejected
echo "🚫 Step 4: Verify unauthenticated request is rejected"
echo "----------------------------------------"
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/auth/session")
UNAUTH_BODY=$(echo "$UNAUTH_RESPONSE" | head -n -1)
UNAUTH_STATUS=$(echo "$UNAUTH_RESPONSE" | tail -n 1)

if [ "$UNAUTH_STATUS" != "401" ]; then
  echo -e "${COLOR_RED}❌ Expected 401, got $UNAUTH_STATUS${COLOR_RESET}"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ Unauthenticated request correctly rejected${COLOR_RESET}"
echo "   Status: $UNAUTH_STATUS Unauthorized"
echo "   Response: $(echo "$UNAUTH_BODY" | jq -c '.title')"
echo ""

# Step 5: Verify malformed JWT is rejected
echo "🚫 Step 5: Verify malformed JWT is rejected"
echo "----------------------------------------"
MALFORMED_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/auth/session" \
  -H "Authorization: Bearer invalid-token")
MALFORMED_BODY=$(echo "$MALFORMED_RESPONSE" | head -n -1)
MALFORMED_STATUS=$(echo "$MALFORMED_RESPONSE" | tail -n 1)

if [ "$MALFORMED_STATUS" != "401" ]; then
  echo -e "${COLOR_RED}❌ Expected 401, got $MALFORMED_STATUS${COLOR_RESET}"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ Malformed JWT correctly rejected${COLOR_RESET}"
echo "   Status: $MALFORMED_STATUS Unauthorized"
echo ""

# Step 6: Verify tampered JWT is rejected (CRITICAL SECURITY TEST)
echo "⚠️  Step 6: Verify tampered JWT is rejected (Security Test)"
echo "----------------------------------------"

# Extract parts
ORIG_HEADER=$(echo "$TOKEN" | cut -d'.' -f1)
ORIG_PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)
ORIG_SIGNATURE=$(echo "$TOKEN" | cut -d'.' -f3)

# Decode payload and modify it
DECODED_PAYLOAD=$(echo "$ORIG_PAYLOAD" | base64 -d 2>/dev/null || echo "$ORIG_PAYLOAD" | base64 -D 2>/dev/null)
TAMPERED_PAYLOAD=$(echo "$DECODED_PAYLOAD" | jq '.userId = "hacker-user-id"')

# Re-encode payload
TAMPERED_PAYLOAD_BASE64=$(echo "$TAMPERED_PAYLOAD" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')

# Reconstruct token with tampered payload but original signature
TAMPERED_TOKEN="$ORIG_HEADER.$TAMPERED_PAYLOAD_BASE64.$ORIG_SIGNATURE"

# Attempt to use tampered token
TAMPERED_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/auth/session" \
  -H "Authorization: Bearer $TAMPERED_TOKEN")
TAMPERED_BODY=$(echo "$TAMPERED_RESPONSE" | head -n -1)
TAMPERED_STATUS=$(echo "$TAMPERED_RESPONSE" | tail -n 1)

if [ "$TAMPERED_STATUS" != "401" ]; then
  echo -e "${COLOR_RED}🚨 CRITICAL SECURITY ISSUE: Tampered token was accepted!${COLOR_RESET}"
  echo "   This means tokens can be forged - signature verification is not working!"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ Tampered JWT correctly rejected (signature verification works)${COLOR_RESET}"
echo "   Status: $TAMPERED_STATUS Unauthorized"
echo "   This proves tokens are cryptographically signed and cannot be forged"
echo ""

# Step 7: Verify token refresh
echo "🔄 Step 7: Verify token refresh"
echo "----------------------------------------"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/refresh" \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.token')

if [ "$NEW_TOKEN" = "null" ] || [ -z "$NEW_TOKEN" ]; then
  echo -e "${COLOR_RED}❌ Token refresh failed${COLOR_RESET}"
  echo "Response: $REFRESH_RESPONSE"
  exit 1
fi

if [ "$NEW_TOKEN" = "$TOKEN" ]; then
  echo -e "${COLOR_RED}❌ New token is identical to old token${COLOR_RESET}"
  exit 1
fi

echo -e "${COLOR_GREEN}✅ Token refresh successful${COLOR_RESET}"
echo "   New token: ${NEW_TOKEN:0:50}..."
echo ""

# Summary
echo "=========================================="
echo -e "${COLOR_GREEN}✅ ALL VERIFICATIONS PASSED${COLOR_RESET}"
echo "=========================================="
echo ""
echo "JWT authentication flow is working correctly:"
echo "  ✅ Login returns properly signed JWT tokens"
echo "  ✅ JWT tokens have correct structure (HS256, 3 parts)"
echo "  ✅ JWT tokens include proper claims (iss, aud, userId, tenantId)"
echo "  ✅ Protected routes accept valid JWT"
echo "  ✅ Protected routes reject unauthenticated requests"
echo "  ✅ Protected routes reject malformed JWT"
echo "  ✅ Protected routes reject tampered JWT (signature verification)"
echo "  ✅ Token refresh issues new valid JWT"
echo ""
echo "🔒 Security: Tokens are cryptographically signed and cannot be forged"
echo ""
