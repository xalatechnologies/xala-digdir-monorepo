# Enterprise Authentication Manual Verification Checklist
**Generated:** 2026-01-16T21:38:11+01:00

## Quick Verification Commands

Run these commands to manually verify each component:

### 1. Verify Cookie Configuration
```bash
# Check cookie names and settings
grep -n "dl_at\|dl_rt\|dl_csrf" apps/api/src/config/cookies.ts

# Verify expiry times
grep -n "maxAge:" apps/api/src/config/cookies.ts

# Verify httpOnly settings
grep -n "httpOnly" apps/api/src/config/cookies.ts
```

### 2. Verify JWT Service
```bash
# Check JWT algorithm
grep -n "HS256" apps/api/src/core/auth/jwt.service.ts

# Verify secret validation
grep -n "secret.length < 32" apps/api/src/core/auth/jwt.service.ts

# Check issuer/audience
grep -n "issuer\|audience" apps/api/src/core/auth/jwt.service.ts
```

### 3. Verify Session Service
```bash
# Check SHA-256 hashing
grep -n "sha256" apps/api/src/modules/auth/session.service.ts

# Verify token rotation
grep -n "rotateRefreshToken" apps/api/src/modules/auth/session.service.ts

# Check revocation support
grep -n "revokeSession" apps/api/src/modules/auth/session.service.ts
```

### 4. Verify CSRF Protection
```bash
# Check double-submit pattern
grep -n "csrfCookie\|csrfHeader" apps/api/src/middleware/csrf.middleware.ts

# Verify origin validation
grep -n "ALLOWED_ORIGINS" apps/api/src/middleware/csrf.middleware.ts

# Check exemptions
grep -n "api/auth" apps/api/src/middleware/csrf.middleware.ts
```

### 5. Verify Database Schema
```bash
# Check sessions table
grep -A 20 "export const sessions" apps/api/src/database/schema/index.ts

# Verify indexes
grep -n "sessions_.*_idx" apps/api/src/database/schema/index.ts
```

## Manual Test Checklist

### ✅ Cookie Configuration
- [ ] Access token named `dl_at` with 15-minute expiry
- [ ] Refresh token named `dl_rt` with 7-day expiry
- [ ] CSRF token named `dl_csrf` with 7-day expiry
- [ ] Refresh token path-scoped to `/api/auth/refresh`
- [ ] All tokens use httpOnly (except CSRF)
- [ ] All tokens use SameSite=lax
- [ ] Production domain set to `.digilist.no`
- [ ] Secure flag enabled in production

### ✅ JWT Validation
- [ ] Uses HS256 algorithm
- [ ] Validates secret length (>= 32 chars)
- [ ] Includes issuer validation
- [ ] Includes audience validation
- [ ] Payload contains userId and tenantId
- [ ] Payload includes subscription info
- [ ] Payload includes feature flags
- [ ] Handles expired token errors
- [ ] Handles invalid signature errors

### ✅ Session Management
- [ ] Refresh tokens hashed with SHA-256
- [ ] Tokens are 32 bytes (256 bits)
- [ ] Implements automatic token rotation
- [ ] Old refresh token invalidated on rotation
- [ ] Supports session revocation
- [ ] Tracks user agent and IP address
- [ ] Has revocation reason tracking
- [ ] Implements session expiry cleanup

### ✅ CSRF Protection
- [ ] Double-submit cookie pattern implemented
- [ ] Origin header validation
- [ ] Referer header fallback validation
- [ ] Skips CSRF for safe methods (GET, HEAD, OPTIONS)
- [ ] Exempts login endpoints
- [ ] Exempts refresh endpoint (path-scoped cookie)
- [ ] Strict origin allowlist (no wildcards)
- [ ] Separate dev/production origin lists

### ✅ Authentication Flow
- [ ] Login sets all three cookies
- [ ] Tokens never returned in response body
- [ ] Session validation uses cookie
- [ ] Refresh rotates both tokens
- [ ] Logout clears all cookies
- [ ] Logout revokes database sessions
- [ ] All events audited (login, logout, refresh)

### ✅ Security Features
- [ ] HTTP-only cookies prevent XSS
- [ ] Short-lived access tokens (15 min)
- [ ] One-time use refresh tokens
- [ ] Path-scoped refresh prevents CSRF
- [ ] SHA-256 prevents token reversal
- [ ] Automatic rotation limits theft window
- [ ] Session revocation for security events
- [ ] Comprehensive audit logging

### ✅ Database Schema
- [ ] Sessions table has all required columns
- [ ] Unique constraint on refresh token hash
- [ ] Indexes on user, tenant, token hash, expiry
- [ ] Foreign keys with cascade delete
- [ ] Revocation timestamp and reason columns

### ✅ Production Readiness
- [ ] Environment-specific configuration
- [ ] Error handling with i18n
- [ ] RFC 7807 Problem Details format
- [ ] Comprehensive logging
- [ ] Performance optimized (indexed queries)
- [ ] No sensitive data in logs or responses

## Expected Results

All checkboxes should be ✅ for production readiness.

## Quick File Verification

Run this to verify all critical files exist:
```bash
ls -la apps/api/src/config/cookies.ts
ls -la apps/api/src/core/auth/jwt.service.ts
ls -la apps/api/src/modules/auth/session.service.ts
ls -la apps/api/src/modules/auth/auth.controller.ts
ls -la apps/api/src/middleware/csrf.middleware.ts
ls -la apps/api/src/database/schema/index.ts
```

All files should exist and contain the expected implementation.
