#!/bin/bash

# Rate Limit Manual Verification Script
# Tests rate limiting on authentication endpoints

echo "=== RATE LIMIT MANUAL VERIFICATION ==="
echo ""
echo "Test Configuration:"
echo "  - Global limit: 100 requests/minute"
echo "  - Auth endpoints limit: 5 requests/minute"
echo "  - Target endpoint: /health (for testing)"
echo ""

# Test 1: Verify rate limit headers are present
echo "=== Test 1: Verify Rate Limit Headers ==="
echo "Sending request to /health endpoint..."
RESPONSE=$(curl -s -i http://localhost:4000/health 2>&1)
echo "$RESPONSE" | grep -i "x-ratelimit"
if echo "$RESPONSE" | grep -qi "x-ratelimit"; then
  echo "✓ Rate limit headers found"
else
  echo "✗ Rate limit headers NOT found"
fi
echo ""

# Test 2: Send multiple requests and check status codes
echo "=== Test 2: Testing Rate Limit Enforcement ==="
echo "Sending 6 rapid requests to /api/auth/login..."
echo ""

for i in 1 2 3 4 5 6; do
  echo "Request $i:"
  RESPONSE=$(curl -s -i -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' 2>&1)

  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP" | head -1)
  RATE_HEADERS=$(echo "$RESPONSE" | grep -i "x-ratelimit" || echo "No rate limit headers")

  echo "  Status: $HTTP_CODE"
  echo "  Rate Limit Headers:"
  echo "$RATE_HEADERS" | sed 's/^/    /'
  echo ""

  # Small delay between requests
  sleep 0.2
done

echo "=== Test 3: Verification Summary ==="
echo ""
echo "Expected behavior:"
echo "  1. All responses should include X-RateLimit-* headers"
echo "  2. First 5 requests should get 200/401/422/500 (not 429)"
echo "  3. 6th request should get 429 Too Many Requests"
echo "  4. Error response should be RFC 7807 compliant"
echo ""
echo "Manual verification complete."
