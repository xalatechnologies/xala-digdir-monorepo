# Enterprise Authentication Validation Plan

## Objective
Validate the complete authentication system is production-ready with proper JWT structure, tenant validation, feature flags, and subscription management.

## Critical Requirements

### 1. JWT Token Structure
The JWT payload MUST contain:
- ✅ `userId` - User identifier
- ✅ `tenantId` - Tenant identifier for multi-tenancy
- ✅ `email` - User email
- ✅ `role` - User role (admin, case_handler, user, etc.)
- ✅ `iat` - Issued at timestamp
- ✅ `exp` - Expiration timestamp (15 min for access token)
- ⏳ `featureFlags` - Tenant feature flags (TODO)
- ⏳ `subscription` - Tenant subscription tier (TODO)
- ⏳ `permissions` - User permissions array (TODO)

### 2. Cookie Security
All cookies MUST have:
- ✅ `HttpOnly` flag (except CSRF token)
- ✅ `Secure` flag (production only)
- ✅ `SameSite=Lax`
- ✅ Domain scoped to `.digilist.no`
- ✅ Proper path scoping (refresh token on `/api/auth/refresh`)

### 3. Session Validation
- ✅ Session endpoint reads JWT from `dl_at` cookie
- ✅ Middleware extracts user/tenant from JWT
- ✅ Database validates user exists
- ⏳ Tenant validation and feature flag loading
- ⏳ Subscription tier validation

### 4. Refresh Token Flow
- ✅ Refresh token stored in database (hashed with SHA-256)
- ✅ Refresh endpoint rotates tokens
- ✅ Old refresh tokens invalidated
- ⏳ Test refresh token expiry (7 days)
- ⏳ Test concurrent refresh handling

### 5. Security Measures
- ✅ CSRF token in separate cookie
- ✅ HTTP-only prevents XSS
- ✅ SameSite prevents CSRF
- ✅ Short-lived access tokens (15 min)
- ✅ Long-lived refresh tokens (7 days)
- ⏳ Rate limiting on auth endpoints
- ⏳ Brute force protection

## Test Plan

### Phase 1: JWT Structure Validation
```bash
# 1. Decode JWT after login
# 2. Verify all required claims present
# 3. Verify signature with JWT_SECRET
# 4. Verify expiry is 15 minutes
```

### Phase 2: Cookie Security Validation
```bash
# 1. Check HttpOnly flag
# 2. Check Secure flag (production)
# 3. Check SameSite=Lax
# 4. Check domain=.digilist.no
# 5. Check path scoping
```

### Phase 3: Session Flow Validation
```bash
# 1. Demo login → get cookies
# 2. Call /api/auth/session with cookies
# 3. Verify user data returned
# 4. Verify tenant data loaded
# 5. Verify feature flags loaded (TODO)
```

### Phase 4: Refresh Token Validation
```bash
# 1. Wait for access token to expire (or mock time)
# 2. Call /api/auth/refresh with refresh token cookie
# 3. Verify new access token issued
# 4. Verify old refresh token invalidated
# 5. Verify session continues seamlessly
```

### Phase 5: Multi-Tenant Validation
```bash
# 1. Login as Skien tenant user
# 2. Verify tenantId in JWT
# 3. Verify tenant-scoped data access
# 4. Login as Porsgrunn tenant user
# 5. Verify data isolation
```

### Phase 6: Feature Flag Validation (TODO)
```bash
# 1. Load tenant feature flags
# 2. Include in JWT payload
# 3. Validate frontend can read flags
# 4. Test feature toggle on/off
```

### Phase 7: Subscription Validation (TODO)
```bash
# 1. Load tenant subscription tier
# 2. Include in JWT payload
# 3. Validate access control based on tier
# 4. Test feature limits per tier
```

## Current Status

### ✅ Completed
1. JWT generation with userId, tenantId, role
2. HTTP-only cookie setup
3. Cookie security flags
4. Session validation endpoint
5. Auth middleware registration
6. Refresh token database storage

### ⏳ In Progress
1. Testing JWT structure
2. Validating session flow end-to-end

### ❌ TODO
1. Feature flags in JWT
2. Subscription info in JWT
3. Tenant validation in middleware
4. Comprehensive E2E tests
5. Load testing
6. Security penetration testing

## Next Steps

1. **Immediate**: Test current auth flow works
2. **Short-term**: Add feature flags to JWT
3. **Short-term**: Add subscription to JWT
4. **Medium-term**: Comprehensive test suite
5. **Long-term**: Security audit & penetration testing

## Success Criteria

Authentication system is production-ready when:
- ✅ All JWT claims present and valid
- ✅ All security flags correct
- ✅ Session validation works
- ✅ Refresh flow works
- ✅ Multi-tenant isolation works
- ⏳ Feature flags work
- ⏳ Subscription validation works
- ❌ Load tested (1000+ concurrent users)
- ❌ Security tested (penetration test)
- ❌ Monitored in production (metrics/alerts)
