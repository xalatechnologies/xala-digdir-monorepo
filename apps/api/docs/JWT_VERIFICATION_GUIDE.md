# JWT Authentication Flow - End-to-End Verification Guide

## Overview

This guide provides step-by-step instructions for verifying the JWT authentication flow implementation.

## Prerequisites

1. API server running on `http://localhost:4000`
2. Database configured and accessible
3. `JWT_SECRET` environment variable set (minimum 32 characters)
4. `curl` or similar HTTP client

## Automated Verification

### Option 1: Playwright E2E Tests

```bash
# Start API server in one terminal
pnpm dev

# Run E2E tests in another terminal
pnpm test:e2e tests/e2e/auth-jwt-flow.spec.ts
```

### Option 2: Integration Tests (with running server)

```bash
# Start API server
pnpm dev

# Run integration tests
pnpm test:integration tests/integration/auth-jwt.test.ts
```

## Manual Verification Steps

### Step 1: Login and Receive JWT Token

```bash
# POST /api/auth/login with valid credentials
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJ0ZW5hbnRJZCI6InRlc3QtdGVuYW50IiwiaXNzIjoieGFsYS1kaWdpbGlzdCIsImF1ZCI6InhhbGEtYXBpIiwiaWF0IjoxNjc4OTAwMDAwLCJleHAiOjE2Nzg5ODY0MDB9.signature",
  "expiresAt": "2024-03-16T12:00:00.000Z"
}
```

**Verification:**
- Response status: `200 OK`
- Token format: 3 parts separated by dots (header.payload.signature)
- Each part is base64-encoded and non-empty
- `expiresAt` is a future timestamp

### Step 2: Verify JWT Token Structure

```bash
# Extract and decode the JWT token parts
TOKEN="<paste-token-from-step-1>"

# Decode header (first part)
echo $TOKEN | cut -d'.' -f1 | base64 -d 2>/dev/null | jq .

# Decode payload (second part)
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

**Expected Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Expected Payload:**
```json
{
  "userId": "test-user",
  "tenantId": "test-tenant",
  "iss": "xala-digilist",
  "aud": "xala-api",
  "iat": 1678900000,
  "exp": 1678986400
}
```

**Verification:**
- Algorithm: `HS256`
- Type: `JWT`
- Contains `userId` and `tenantId`
- Contains `iss` (issuer) and `aud` (audience) claims
- Contains `iat` (issued at) and `exp` (expiration) timestamps
- Signature (third part) is non-empty

### Step 3: Use JWT for Authenticated Request

```bash
# GET /api/auth/session with Authorization: Bearer <token> header
TOKEN="<paste-token-from-step-1>"

curl -X GET http://localhost:4000/api/auth/session \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "authenticated": true,
  "userId": "test-user",
  "tenantId": "test-tenant"
}
```

**Verification:**
- Response status: `200 OK`
- `authenticated` is `true`
- `userId` and `tenantId` match the token payload

### Step 4: Verify Unauthenticated Request is Rejected

```bash
# GET /api/auth/session without Authorization header
curl -X GET http://localhost:4000/api/auth/session
```

**Expected Response:**
```json
{
  "type": "https://xala.no/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "No authorization token provided"
}
```

**Verification:**
- Response status: `401 Unauthorized`
- Response follows RFC 7807 Problem Details format
- Contains `type`, `title`, `status`, and `detail` fields

### Step 5: Verify Malformed JWT is Rejected

```bash
# GET /api/auth/session with malformed token
curl -X GET http://localhost:4000/api/auth/session \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response:**
```json
{
  "type": "https://xala.no/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid token format"
}
```

**Verification:**
- Response status: `401 Unauthorized`
- Error indicates invalid token format

### Step 6: Verify Tampered JWT is Rejected (Security Test)

```bash
# This test verifies that tokens with modified payloads are rejected
# even if the signature is kept intact (proving cryptographic verification)

# 1. Get a valid token
TOKEN="<paste-token-from-step-1>"

# 2. Extract payload
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)

# 3. Decode, modify userId, re-encode
MODIFIED_PAYLOAD=$(echo $PAYLOAD | base64 -d 2>/dev/null | \
  jq '.userId = "hacker-user-id"' | \
  base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')

# 4. Reconstruct token with tampered payload
HEADER=$(echo $TOKEN | cut -d'.' -f1)
SIGNATURE=$(echo $TOKEN | cut -d'.' -f3)
TAMPERED_TOKEN="$HEADER.$MODIFIED_PAYLOAD.$SIGNATURE"

# 5. Attempt to use tampered token
curl -X GET http://localhost:4000/api/auth/session \
  -H "Authorization: Bearer $TAMPERED_TOKEN"
```

**Expected Response:**
```json
{
  "type": "https://xala.no/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Token signature verification failed"
}
```

**Verification:**
- Response status: `401 Unauthorized`
- Error indicates signature verification failure
- This proves tokens are cryptographically signed and cannot be forged

### Step 7: Verify Token Refresh

```bash
# POST /api/auth/refresh with valid token
TOKEN="<paste-token-from-step-1>"

curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<new-token>",
  "expiresAt": "2024-03-17T12:00:00.000Z"
}
```

**Verification:**
- Response status: `200 OK`
- New token is different from the original token
- New token has valid JWT format (3 parts)
- New `expiresAt` is in the future

## Success Criteria

All verifications must pass:

- ✅ Login returns properly signed JWT tokens (3-part format)
- ✅ JWT tokens include HS256 signature using JWT_SECRET
- ✅ JWT tokens include proper claims (iss, aud, exp, iat, userId, tenantId)
- ✅ Protected routes accept requests with valid JWT
- ✅ Protected routes reject requests without JWT (401)
- ✅ Protected routes reject requests with malformed JWT (401)
- ✅ Protected routes reject requests with tampered JWT (401 - signature verification)
- ✅ Token refresh issues new valid JWT

## Troubleshooting

### Server won't start

- Check `DATABASE_URL` is set in `.env`
- Check `JWT_SECRET` is set (minimum 32 characters)
- Check port 4000 is not already in use

### All requests return 401

- Verify `JWT_SECRET` matches between token generation and verification
- Check JWT middleware is registered in Fastify pipeline
- Check middleware is not blocking public routes (login, health check)

### Tokens can be tampered with

- **CRITICAL SECURITY ISSUE**: Verify JWT_SECRET is being used
- Verify JwtService is using `jsonwebtoken` library (not mock implementation)
- Verify signature verification is enabled in JwtService.verifyToken()

## Implementation Files

- JWT Service: `src/core/auth/jwt.service.ts`
- JWT Middleware: `src/core/auth/jwt.middleware.ts`
- Auth Controller: `src/modules/auth/auth.controller.ts`
- Fastify Adapter: `src/adapters/fastify.adapter.ts`
- Container: `src/core/container.ts`

## Security Notes

1. **JWT_SECRET**: Must be minimum 32 characters, stored securely
2. **Token Expiration**: Default 24 hours, configurable
3. **Algorithm**: HS256 (HMAC with SHA-256)
4. **Claims**: Include issuer, audience for validation
5. **Signature**: Cryptographically verified on every request
6. **No Bypass**: userId/tenantId ONLY from verified JWT, not headers

---

**Status:** Ready for QA verification
**Last Updated:** 2026-01-16
