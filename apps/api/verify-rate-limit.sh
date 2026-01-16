#!/bin/bash

# Comprehensive Rate Limit Verification Script
# This script performs the manual verification steps outlined in the spec

echo "================================================================"
echo "MANUAL RATE LIMIT VERIFICATION"
echo "================================================================"
echo ""
echo "Configuration:"
echo "  - API Server: http://localhost:4000"
echo "  - Auth Endpoint: POST /api/auth/login"
echo "  - Expected Rate Limit: 5 requests/minute for auth endpoints"
echo "  - Expected Rate Limit: 100 requests/minute for global endpoints"
echo ""

# Test a working endpoint to verify rate limiting is active
echo "================================================================"
echo "TEST 1: Verify Rate Limiting on Working Endpoint (/health)"
echo "================================================================"
echo ""

HEALTH_RESPONSE=$(curl -s -i http://localhost:4000/health 2>&1)
echo "Sample /health response headers:"
echo "$HEALTH_RESPONSE" | grep -E "HTTP|ratelimit|retry-after" | head -10
echo ""

# Check if rate limit headers are present
if echo "$HEALTH_RESPONSE" | grep -qi "x-ratelimit"; then
  echo "✓ Rate limit headers FOUND on /health endpoint"
  echo ""
  echo "Header values:"
  echo "$HEALTH_RESPONSE" | grep -i "x-ratelimit"
  echo ""
else
  echo "✗ Rate limit headers NOT FOUND on /health endpoint"
  echo ""
  echo "NOTE: Headers may not be configured to show on all responses."
  echo "Proceeding to test rate limit enforcement..."
  echo ""
fi

# Test auth endpoint rate limiting
echo "================================================================"
echo "TEST 2: Verify Rate Limiting on Auth Endpoint"
echo "================================================================"
echo ""
echo "Sending 6 requests to POST /api/auth/login..."
echo "Expected: First 5 should process, 6th should return 429"
echo ""

for i in 1 2 3 4 5 6; do
  echo "---Request $i---"
  RESPONSE=$(curl -s -i -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' 2>&1)

  # Extract HTTP status line
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP" | head -1)

  # Extract status code
  STATUS_CODE=$(echo "$HTTP_STATUS" | grep -o "[0-9]\{3\}" | head -1)

  # Check for rate limit headers
  RATE_HEADERS=$(echo "$RESPONSE" | grep -i "x-ratelimit" || echo "")

  echo "Status: $HTTP_STATUS"

  if [ -n "$RATE_HEADERS" ]; then
    echo "Rate limit headers:"
    echo "$RATE_HEADERS"
  fi

  # Check if this is the limiting response
  if [ "$STATUS_CODE" = "429" ]; then
    echo "✓ Rate limit triggered! Got 429 status code"
    echo ""
    echo "Response body:"
    echo "$RESPONSE" | tail -5
    echo ""
  elif [ "$i" -eq 6 ]; then
    echo "✗ Expected 429 on 6th request but got $STATUS_CODE"
    echo ""
  fi

  # Small delay between requests
  sleep 0.3
done

echo "================================================================"
echo "TEST 3: Verify 429 Response Format (RFC 7807 Compliance)"
echo "================================================================"
echo ""

# Send requests until we get a 429
echo "Sending requests until rate limit is exceeded..."
MAX_ATTEMPTS=10
for attempt in $(seq 1 $MAX_ATTEMPTS); do
  RESPONSE=$(curl -s -i -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"verify@test.com","password":"verify"}' 2>&1)

  STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP" | grep -o "[0-9]\{3\}" | head -1)

  if [ "$STATUS_CODE" = "429" ]; then
    echo "✓ Got 429 response on attempt $attempt"
    echo ""
    echo "Full response:"
    echo "$RESPONSE"
    echo ""

    # Check for RFC 7807 fields
    BODY=$(echo "$RESPONSE" | tail -1)
    if echo "$BODY" | grep -q "\"type\""; then
      echo "✓ Response contains 'type' field (RFC 7807)"
    fi
    if echo "$BODY" | grep -q "\"title\""; then
      echo "✓ Response contains 'title' field (RFC 7807)"
    fi
    if echo "$BODY" | grep -q "\"status\""; then
      echo "✓ Response contains 'status' field (RFC 7807)"
    fi

    break
  fi

  sleep 0.3
done

if [ "$STATUS_CODE" != "429" ]; then
  echo "⚠  Could not trigger 429 within $MAX_ATTEMPTS attempts"
  echo "   This might indicate:"
  echo "   - Rate limiting is not active"
  echo "   - Rate limit is higher than expected"
  echo "   - Previous requests have timed out and limit was reset"
fi

echo ""
echo "================================================================"
echo "VERIFICATION SUMMARY"
echo "================================================================"
echo ""
echo "Please verify the following manually:"
echo ""
echo "✓ Check 1: Rate limit headers (X-RateLimit-*) present"
echo "✓ Check 2: First N requests succeed with 200/401/422/500"
echo "✓ Check 3: Subsequent requests return 429 status code"
echo "✓ Check 4: 429 response is RFC 7807 compliant"
echo "✓ Check 5: Rate limit resets after time window"
echo ""
echo "================================================================"
