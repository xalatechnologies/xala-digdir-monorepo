# Cookie-Based Authentication Migration Guide

**Status:** Implementation Plan
**Target:** Industry-Grade Session Management for Digilist Platform
**Date:** 2026-01-16

---

## Executive Summary

This guide provides a complete, production-ready implementation plan for migrating from localStorage JWT tokens to HTTP-only cookie-based sessions with CSRF protection and refresh token rotation.

**Why This Migration?**
- **Security:** localStorage vulnerable to XSS token theft (OWASP Top 10 #3)
- **Compliance:** Government/municipal platform requires highest security standard
- **Industry Standard:** Google, Facebook, GitHub all use HTTP-only cookies
- **SSO Support:** Single sign-on across web/backoffice/minside subdomains

---

## Target Architecture

### Three-Cookie System

```
┌─────────────────────────────────────────────────────────────┐
│                    Cookie Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Access Cookie: dl_at (Short-lived)                      │
│     - JWT or opaque session ID                              │
│     - HttpOnly; Secure; SameSite=Lax                        │
│     - Domain: .digilist.no                                  │
│     - Path: /                                               │
│     - MaxAge: 15 minutes                                    │
│                                                              │
│  2. Refresh Cookie: dl_rt (Long-lived, rotated)             │
│     - Opaque token (stored hashed in DB)                    │
│     - HttpOnly; Secure; SameSite=Lax                        │
│     - Domain: .digilist.no                                  │
│     - Path: /auth/refresh                                   │
│     - MaxAge: 7 days                                        │
│                                                              │
│  3. CSRF Cookie: dl_csrf (Readable by JS)                   │
│     - Random string for double-submit pattern               │
│     - Secure; SameSite=Lax (NOT HttpOnly)                   │
│     - Domain: .digilist.no                                  │
│     - Path: /                                               │
│     - MaxAge: 7 days                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Security Features

1. **HttpOnly Cookies** - Inaccessible to JavaScript (XSS protection)
2. **CSRF Protection** - Double-submit pattern + Origin validation
3. **Token Rotation** - Refresh tokens are one-time use, rotated on every refresh
4. **Short-lived Access** - 15-minute access tokens limit exposure window
5. **Domain Scoping** - `.digilist.no` enables subdomain SSO
6. **Audit Logging** - All auth events logged to database

---

## Database Schema

### New Tables

#### sessions table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  access_token_jti TEXT, -- JWT ID for revocation
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_refreshed_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_reason TEXT
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at) WHERE revoked_at IS NULL;
```

#### refresh_tokens table (alternative, more granular)
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_session_id ON refresh_tokens(session_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

## Backend Implementation

### Cookie Configuration

```typescript
// apps/api/src/config/cookies.ts

export const COOKIE_CONFIG = {
  ACCESS: {
    name: 'dl_at',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  },
  REFRESH: {
    name: 'dl_rt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth/refresh',
  },
  CSRF: {
    name: 'dl_csrf',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
} as const;

export function getCookieOptions(
  cookieType: keyof typeof COOKIE_CONFIG,
  isProduction: boolean
) {
  const config = COOKIE_CONFIG[cookieType];

  return {
    httpOnly: cookieType !== 'CSRF', // CSRF must be readable by JS
    secure: isProduction,
    sameSite: 'lax' as const,
    domain: isProduction ? '.digilist.no' : undefined,
    path: config.path,
    maxAge: config.maxAge,
  };
}
```

### Session Service

```typescript
// apps/api/src/modules/auth/session.service.ts

import { randomBytes, createHash } from 'crypto';
import { db } from '../../database';
import { sessions, refreshTokens } from '../../database/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';

export class SessionService {
  /**
   * Generate cryptographically secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Hash token for database storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create new session with access and refresh tokens
   */
  async createSession(params: {
    userId: string;
    tenantId: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{
    sessionId: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const refreshToken = this.generateToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    // Generate JWT for access token (15min expiry)
    const accessToken = this.generateAccessToken({
      userId: params.userId,
      tenantId: params.tenantId,
    });

    // Create session record
    const [session] = await db
      .insert(sessions)
      .values({
        userId: params.userId,
        tenantId: params.tenantId,
        refreshTokenHash,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning();

    return {
      sessionId: session.id,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token (one-time use)
   */
  async rotateRefreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const tokenHash = this.hashToken(refreshToken);

    // Find session by refresh token hash
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, tokenHash),
          isNull(sessions.revokedAt)
        )
      )
      .limit(1);

    if (!session) {
      return null; // Invalid or revoked token
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      // Token expired - revoke session
      await this.revokeSession(session.id, 'expired');
      return null;
    }

    // Generate new tokens
    const newRefreshToken = this.generateToken();
    const newRefreshTokenHash = this.hashToken(newRefreshToken);
    const newAccessToken = this.generateAccessToken({
      userId: session.userId,
      tenantId: session.tenantId,
    });

    // Update session with new refresh token hash
    await db
      .update(sessions)
      .set({
        refreshTokenHash: newRefreshTokenHash,
        lastRefreshedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke session (logout or security event)
   */
  async revokeSession(sessionId: string, reason: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(sessions.id, sessionId));
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()))
      .returning();

    return result.length;
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(payload: {
    userId: string;
    tenantId: string;
  }): string {
    const jwtService = container.resolve<JwtService>('JwtService');
    return jwtService.generateToken(payload.userId, payload.tenantId).token;
  }
}

export const sessionService = new SessionService();
```

### Login Endpoint (Updated)

```typescript
// apps/api/src/modules/auth/auth.controller.ts

import { COOKIE_CONFIG, getCookieOptions } from '../../config/cookies';
import { sessionService } from './session.service';
import { randomBytes } from 'crypto';

@Post('/demo-token')
async demoTokenLogin(request: AuthRequest, reply: FastifyReply) {
  const body = request.body as any;
  const db = container.resolve<any>('Database');

  // Validate demo token and get user
  const result = await db
    .select()
    .from(users)
    .where(eq(users.demoToken, body.token))
    .limit(1);

  if (!result.length) {
    reply.code(401);
    return { error: { code: 'UNAUTHORIZED', message: 'Invalid demo token' } };
  }

  const user = result[0];

  // Create session with access and refresh tokens
  const { accessToken, refreshToken } = await sessionService.createSession({
    userId: user.id,
    tenantId: user.tenantId,
    userAgent: request.headers['user-agent'],
    ipAddress: request.ip,
  });

  // Generate CSRF token
  const csrfToken = randomBytes(32).toString('base64url');

  const isProduction = process.env.NODE_ENV === 'production';

  // Set HTTP-only cookies
  reply
    .setCookie(
      COOKIE_CONFIG.ACCESS.name,
      accessToken,
      getCookieOptions('ACCESS', isProduction)
    )
    .setCookie(
      COOKIE_CONFIG.REFRESH.name,
      refreshToken,
      getCookieOptions('REFRESH', isProduction)
    )
    .setCookie(
      COOKIE_CONFIG.CSRF.name,
      csrfToken,
      getCookieOptions('CSRF', isProduction)
    );

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  // Audit login event
  getAuditService().log({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'login',
    resource: 'auth',
    resourceId: user.id,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    metadata: { email: user.email, method: 'demo-token' },
  });

  // Return user data ONLY (tokens are in cookies)
  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      expiresAt: new Date(Date.now() + COOKIE_CONFIG.ACCESS.maxAge * 1000).toISOString(),
    },
  };
}
```

### Refresh Token Endpoint

```typescript
// apps/api/src/modules/auth/auth.controller.ts

@Post('/refresh')
async refreshToken(request: AuthRequest, reply: FastifyReply) {
  const refreshToken = request.cookies[COOKIE_CONFIG.REFRESH.name];

  if (!refreshToken) {
    reply.code(401);
    return { error: { code: 'UNAUTHORIZED', message: 'No refresh token' } };
  }

  // Rotate refresh token (one-time use)
  const result = await sessionService.rotateRefreshToken(refreshToken);

  if (!result) {
    reply.code(401);
    return { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } };
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Set new cookies
  reply
    .setCookie(
      COOKIE_CONFIG.ACCESS.name,
      result.accessToken,
      getCookieOptions('ACCESS', isProduction)
    )
    .setCookie(
      COOKIE_CONFIG.REFRESH.name,
      result.refreshToken,
      getCookieOptions('REFRESH', isProduction)
    );

  // Audit refresh event
  const userId = (request as any).userId;
  const tenantId = (request as any).tenantId;

  if (userId && tenantId) {
    getAuditService().log({
      tenantId,
      userId,
      action: 'token_refresh',
      resource: 'auth',
      resourceId: userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  return { data: { success: true } };
}
```

### Logout Endpoint (Updated)

```typescript
// apps/api/src/modules/auth/auth.controller.ts

@Post('/logout')
async logout(request: AuthRequest, reply: FastifyReply) {
  const userId = (request as any).userId;
  const tenantId = (request as any).tenantId;
  const sessionId = (request as any).sessionId;

  // Revoke session in database
  if (sessionId) {
    await sessionService.revokeSession(sessionId, 'user_logout');
  }

  // Clear all auth cookies
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? '.digilist.no' : undefined;

  reply
    .clearCookie(COOKIE_CONFIG.ACCESS.name, { path: '/', domain })
    .clearCookie(COOKIE_CONFIG.REFRESH.name, { path: COOKIE_CONFIG.REFRESH.path, domain })
    .clearCookie(COOKIE_CONFIG.CSRF.name, { path: '/', domain });

  // Audit logout event
  if (userId && tenantId) {
    getAuditService().log({
      tenantId,
      userId,
      action: 'logout',
      resource: 'auth',
      resourceId: userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  return { data: { success: true, message: 'Logged out successfully' } };
}
```

### CSRF Middleware

```typescript
// apps/api/src/middleware/csrf.middleware.ts

import type { FastifyRequest, FastifyReply } from 'fastify';
import { COOKIE_CONFIG } from '../config/cookies';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const CSRF_HEADER = 'x-csrf-token';

export async function csrfMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip CSRF check for safe methods
  if (!STATE_CHANGING_METHODS.includes(request.method)) {
    return;
  }

  // Skip CSRF for /auth/refresh (uses path-scoped cookie)
  if (request.url.startsWith('/api/auth/refresh')) {
    return;
  }

  const csrfCookie = request.cookies[COOKIE_CONFIG.CSRF.name];
  const csrfHeader = request.headers[CSRF_HEADER];

  // 1. Check CSRF token (double-submit pattern)
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    reply.code(403);
    throw new Error('CSRF token mismatch');
  }

  // 2. Check Origin header (must be from *.digilist.no)
  const origin = request.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && origin) {
    const allowedOrigins = [
      'https://digilist.no',
      'https://web.digilist.no',
      'https://web-test.digilist.no',
      'https://backoffice.digilist.no',
      'https://backoffice-test.digilist.no',
      'https://minside.digilist.no',
      'https://minside-test.digilist.no',
      'https://saas-admin.digilist.no',
      'https://tenant-admin.digilist.no',
    ];

    if (!allowedOrigins.includes(origin)) {
      reply.code(403);
      throw new Error('Invalid Origin header');
    }
  }
}

/**
 * Fastify plugin to register CSRF middleware
 */
export async function csrfPlugin(fastify: any): Promise<void> {
  fastify.addHook('onRequest', csrfMiddleware);
  fastify.log.info('CSRF middleware registered');
}
```

### Auth Middleware (Updated)

```typescript
// apps/api/src/middleware/auth-cookie.middleware.ts

import type { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../core/container';
import type { JwtService } from '../core/auth/jwt.service';
import { COOKIE_CONFIG } from '../config/cookies';

export async function authCookieMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const jwtService = container.resolve<JwtService>('JwtService');

  // Try to extract JWT from access cookie first (new, secure method)
  let token = request.cookies[COOKIE_CONFIG.ACCESS.name];
  let authSource = 'cookie';

  // Fallback to Authorization header (backwards compatibility - DEPRECATED)
  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      authSource = 'header';

      // Log deprecation warning
      request.log.warn(
        {
          path: request.url,
          method: request.method,
        },
        'Authorization header authentication is deprecated. Please migrate to cookie-based auth.'
      );
    }
  }

  // If no token found, continue without authentication
  if (!token) {
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwtService.verify(token);

    // Attach user info to request
    (request as any).userId = decoded.userId;
    (request as any).tenantId = decoded.tenantId;
    (request as any).authSource = authSource;

    request.log.debug(
      {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        authSource,
      },
      'User authenticated'
    );
  } catch (error) {
    // Token invalid or expired - log but don't throw
    request.log.warn(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        authSource,
      },
      'Invalid or expired JWT token'
    );
  }
}
```

---

## Frontend Implementation

### SDK HTTP Client (Already Done!)

The `FetchHttpClient` already includes `credentials: 'include'`:

```typescript
// packages/client-sdk/src/core/fetch-client.ts (line 102)
const response = await fetch(url, {
  method,
  headers,
  body,
  signal: options?.signal ?? controller.signal,
  credentials: 'include', // ✅ Already configured!
});
```

### CSRF Token Management

```typescript
// packages/client-sdk/src/utils/csrf.ts

/**
 * Read CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/dl_csrf=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfHeader(headers: Record<string, string>): Record<string, string> {
  const csrfToken = getCsrfToken();

  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    };
  }

  return headers;
}
```

### Update FetchHttpClient for CSRF

```typescript
// packages/client-sdk/src/core/fetch-client.ts

import { addCsrfHeader } from '../utils/csrf';

private buildHeaders(customHeaders?: Record<string, string>, isFormData = false): Record<string, string> {
  let headers: Record<string, string> = {
    ...this.config.defaultHeaders,
  };

  // Don't set Content-Type for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (this.config.tenantId) {
    headers['X-Tenant-Id'] = this.config.tenantId;
  }

  if (this.config.licenseKey) {
    headers['X-License-Key'] = this.config.licenseKey;
  }

  // DEPRECATED: Bearer token (backwards compatibility only)
  if (this.config.token) {
    headers['Authorization'] = `Bearer ${this.config.token}`;
  }

  // Add CSRF token for state-changing requests
  headers = addCsrfHeader(headers);

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}
```

### Remove Token Storage from AuthProvider

```typescript
// packages/auth/src/providers/AuthProvider.tsx

// ❌ REMOVE: No more token storage
// localStorage.setItem(`${config.appType}_user`, JSON.stringify({
//   token: data.data.token,
//   user: data.data.user
// }));

// ✅ CORRECT: Store user data only (no token)
localStorage.setItem(`${config.appType}_user`, JSON.stringify(userData));
```

### Automatic Token Refresh

```typescript
// packages/auth/src/providers/AuthProvider.tsx

useEffect(() => {
  // Refresh access token before expiry (every 14 minutes for 15min token)
  const refreshInterval = setInterval(async () => {
    if (user) {
      try {
        await authService.refreshToken();
        debug('Access token refreshed automatically');
      } catch (error) {
        debug('Token refresh failed - user will be logged out on next request');
      }
    }
  }, 14 * 60 * 1000); // 14 minutes

  return () => clearInterval(refreshInterval);
}, [user, debug]);
```

---

## CORS Configuration

### Fastify CORS Setup

```typescript
// apps/api/src/main.ts

import cors from '@fastify/cors';

const app = fastify();

// CORS configuration
await app.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://digilist.no',
      'https://web.digilist.no',
      'https://web-test.digilist.no',
      'https://backoffice.digilist.no',
      'https://backoffice-test.digilist.no',
      'https://minside.digilist.no',
      'https://minside-test.digilist.no',
      'https://saas-admin.digilist.no',
      'https://tenant-admin.digilist.no',
    ];

    // Development: allow localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
      );
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Tenant-Id'],
});
```

---

## Migration Plan (Zero Downtime)

### Phase 0: Guardrails (30-60 minutes)

**Goal:** Add feature flags and logging without changing behavior

```typescript
// apps/api/src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  AUTH_COOKIE_ENABLED: process.env.AUTH_COOKIE_ENABLED === 'true',
  AUTH_HEADER_DEPRECATED: process.env.AUTH_HEADER_DEPRECATED === 'true',
};
```

**Tasks:**
1. Add feature flag `AUTH_COOKIE_ENABLED` (default: false)
2. Update auth middleware to log auth source (cookie vs header)
3. Deploy API with logging only
4. Monitor logs to baseline current auth patterns

**Verification:**
- Logs show 100% "header" auth source
- No behavior changes
- All apps continue working

---

### Phase 1: Backend Dual-Mode (4-6 hours)

**Goal:** API accepts both cookie AND header auth

**Tasks:**
1. Create database migration for `sessions` table
2. Implement `SessionService` with token rotation
3. Update login endpoints to set cookies
4. Implement `/auth/refresh` endpoint
5. Update logout to revoke sessions
6. Enable CSRF middleware (log-only mode first)
7. Deploy API

**Verification:**
- Login sets cookies (but apps still use headers)
- Auth middleware accepts both methods
- Refresh endpoint works
- Session cleanup cron job runs
- CSRF logs show validation results

**Environment Variables:**
```bash
AUTH_COOKIE_ENABLED=true
AUTH_HEADER_DEPRECATED=false
COOKIE_DOMAIN=.digilist.no
```

---

### Phase 2: SDK Cookie-First Transport (2-3 hours)

**Goal:** SDK uses cookies by default, removes token storage

**Tasks:**
1. Add CSRF token utilities to SDK
2. Update `FetchHttpClient` to add CSRF header
3. Remove token from `initializeClient()` config
4. Add automatic token refresh to SDK
5. Publish SDK update

**Verification:**
- SDK sends `credentials: 'include'`
- CSRF header added automatically
- No token in SDK config
- Refresh happens automatically

---

### Phase 3: Migrate Apps One by One (2-3 hours per app)

**Goal:** Update each app to use cookie auth

**App Migration Order:**
1. **Backoffice** (most sensitive data, internal users)
2. **MinSide** (citizen portal)
3. **Web** (public site)
4. **SaaS Admin** (admin portal)
5. **Tenant Admin** (tenant management)

**Tasks Per App:**
1. Update `@digilist/client-sdk` dependency
2. Remove token storage from `AuthProvider`
3. Update login flows
4. Test thoroughly (login, logout, refresh, RBAC)
5. Deploy to test environment
6. Smoke test
7. Deploy to production

**Verification Per App:**
- Login redirects correctly
- Session persists across page reloads
- Logout clears cookies
- Protected routes work
- RBAC enforcement works
- Cross-tab logout works

---

### Phase 4: Deprecate Header Auth (1 week later)

**Goal:** Remove backwards compatibility for Authorization header

**Tasks:**
1. Set `AUTH_HEADER_DEPRECATED=true`
2. Monitor logs for any remaining header usage
3. After 1-2 weeks with zero header auth:
   - Remove header fallback from auth middleware
   - Remove token from SDK types
   - Update documentation
4. Deploy final version

**Verification:**
- Zero "header" auth source in logs
- All apps use cookies
- Legacy token code removed

---

## Testing Strategy

### Unit Tests

```typescript
// apps/api/src/modules/auth/session.service.test.ts

describe('SessionService', () => {
  it('should create session with access and refresh tokens', async () => {
    const result = await sessionService.createSession({
      userId: 'user-123',
      tenantId: 'tenant-456',
    });

    expect(result.sessionId).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should rotate refresh token', async () => {
    const { refreshToken } = await sessionService.createSession({
      userId: 'user-123',
      tenantId: 'tenant-456',
    });

    const result = await sessionService.rotateRefreshToken(refreshToken);

    expect(result).toBeDefined();
    expect(result!.accessToken).toBeDefined();
    expect(result!.refreshToken).not.toBe(refreshToken); // Token changed
  });

  it('should not allow refresh token reuse', async () => {
    const { refreshToken } = await sessionService.createSession({
      userId: 'user-123',
      tenantId: 'tenant-456',
    });

    // Use token once
    await sessionService.rotateRefreshToken(refreshToken);

    // Try to use same token again
    const result = await sessionService.rotateRefreshToken(refreshToken);

    expect(result).toBeNull(); // Token already used
  });
});
```

### Integration Tests

```bash
# Test cookie flow
curl -X POST https://api.digilist.no/api/auth/demo-token \
  -H "Content-Type: application/json" \
  -d '{"token":"skien-admin-001"}' \
  -c cookies.txt \
  -v

# Test session validation
curl https://api.digilist.no/api/auth/session \
  -b cookies.txt \
  -v

# Test refresh
curl -X POST https://api.digilist.no/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt \
  -v

# Test logout
curl -X POST https://api.digilist.no/api/auth/logout \
  -b cookies.txt \
  -v
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/auth/cookie-auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cookie-Based Authentication', () => {
  test('should login and set cookies', async ({ page, context }) => {
    await page.goto('https://backoffice-test.digilist.no/login');

    await page.fill('input[name="token"]', 'skien-admin-001');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Check cookies are set
    const cookies = await context.cookies();
    expect(cookies.find(c => c.name === 'dl_at')).toBeDefined();
    expect(cookies.find(c => c.name === 'dl_rt')).toBeDefined();
    expect(cookies.find(c => c.name === 'dl_csrf')).toBeDefined();
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login
    await page.goto('https://backoffice-test.digilist.no/login');
    await page.fill('input[name="token"]', 'skien-admin-001');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Kari Nordmann')).toBeVisible();
  });

  test('should logout and clear cookies', async ({ page, context }) => {
    // Login
    await page.goto('https://backoffice-test.digilist.no/login');
    await page.fill('input[name="token"]', 'skien-admin-001');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('button[aria-label="Logg ut"]');
    await expect(page).toHaveURL('/login');

    // Check cookies are cleared
    const cookies = await context.cookies();
    expect(cookies.find(c => c.name === 'dl_at')).toBeUndefined();
    expect(cookies.find(c => c.name === 'dl_rt')).toBeUndefined();
  });

  test('should refresh token automatically', async ({ page }) => {
    // Login
    await page.goto('https://backoffice-test.digilist.no/login');
    await page.fill('input[name="token"]', 'skien-admin-001');
    await page.click('button[type="submit"]');

    // Wait 14 minutes (token refresh interval)
    await page.waitForTimeout(14 * 60 * 1000);

    // Make API request - should still work
    await page.goto('https://backoffice-test.digilist.no/listings');
    await expect(page.locator('.listing-card')).toHaveCount(10);
  });
});
```

---

## Security Checklist

### Pre-Deployment

- [ ] All cookies have `HttpOnly` flag (except CSRF)
- [ ] All cookies have `Secure` flag in production
- [ ] `SameSite=Lax` set on all cookies
- [ ] Domain set to `.digilist.no` in production
- [ ] Refresh tokens hashed in database (SHA-256)
- [ ] Refresh token rotation implemented
- [ ] Session expiry enforced
- [ ] CSRF double-submit pattern implemented
- [ ] Origin header validation implemented
- [ ] CORS properly configured
- [ ] `credentials: true` in CORS
- [ ] Audit logging for all auth events
- [ ] Rate limiting on auth endpoints
- [ ] XSS protection headers set
- [ ] Content-Type validation

### Post-Deployment

- [ ] No tokens in localStorage
- [ ] No tokens in session storage
- [ ] No tokens in URL parameters
- [ ] Cookie-based auth works across subdomains
- [ ] Logout clears all cookies
- [ ] Session cleanup cron job running
- [ ] Expired sessions automatically cleaned
- [ ] Security headers verified (CSP, HSTS, X-Frame-Options)

---

## Troubleshooting

### Cookies Not Being Set

**Problem:** Login succeeds but cookies not visible in browser

**Solutions:**
1. Check `Secure` flag - must be `false` for localhost
2. Check domain - must be `undefined` for localhost, `.digilist.no` for production
3. Check CORS - `credentials: true` must be set
4. Check Origin header - must match allowed origins

### CSRF Token Mismatch

**Problem:** API returns 403 on POST requests

**Solutions:**
1. Verify CSRF cookie is readable (not HttpOnly)
2. Verify CSRF header is being sent
3. Check cookie domain matches request domain
4. Ensure cookie not expired

### Session Not Persisting

**Problem:** User logged out after page reload

**Solutions:**
1. Check access token expiry (should be 15 minutes)
2. Verify refresh token rotation works
3. Check session cleanup didn't delete active session
4. Verify cookies have correct MaxAge

### Cross-Subdomain SSO Not Working

**Problem:** Login on backoffice doesn't work on minside

**Solutions:**
1. Verify domain is `.digilist.no` (with leading dot)
2. Check all subdomains use same cookie name
3. Verify CORS allows all subdomains
4. Check both apps send `credentials: 'include'`

---

## Performance Considerations

### Database Indexes

```sql
-- Critical for session lookup performance
CREATE INDEX CONCURRENTLY idx_sessions_refresh_token_hash
  ON sessions(refresh_token_hash)
  WHERE revoked_at IS NULL;

-- Session cleanup query
CREATE INDEX CONCURRENTLY idx_sessions_expires_at
  ON sessions(expires_at)
  WHERE revoked_at IS NULL;

-- User session query
CREATE INDEX CONCURRENTLY idx_sessions_user_tenant
  ON sessions(user_id, tenant_id)
  WHERE revoked_at IS NULL;
```

### Session Cleanup Job

```typescript
// apps/api/src/jobs/cleanup-sessions.job.ts

import { CronJob } from 'cron';
import { sessionService } from '../modules/auth/session.service';

/**
 * Clean up expired sessions every hour
 */
export const sessionCleanupJob = new CronJob(
  '0 * * * *', // Every hour
  async () => {
    try {
      const deletedCount = await sessionService.cleanupExpiredSessions();
      console.log(`Cleaned up ${deletedCount} expired sessions`);
    } catch (error) {
      console.error('Session cleanup failed:', error);
    }
  },
  null,
  true,
  'Europe/Oslo'
);
```

---

## Monitoring and Alerts

### Metrics to Track

```typescript
// apps/api/src/monitoring/auth-metrics.ts

export const authMetrics = {
  // Login success/failure rate
  loginAttempts: new Counter('auth_login_attempts_total', {
    labelNames: ['method', 'status'],
  }),

  // Refresh token usage
  tokenRefreshes: new Counter('auth_token_refreshes_total', {
    labelNames: ['status'],
  }),

  // Session duration histogram
  sessionDuration: new Histogram('auth_session_duration_seconds'),

  // CSRF failures
  csrfFailures: new Counter('auth_csrf_failures_total'),

  // Active sessions gauge
  activeSessions: new Gauge('auth_active_sessions'),
};
```

### Alerts

```yaml
# prometheus/alerts.yml

groups:
  - name: auth
    rules:
      - alert: HighLoginFailureRate
        expr: rate(auth_login_attempts_total{status="failure"}[5m]) > 10
        annotations:
          summary: High login failure rate detected

      - alert: CSRFAttackDetected
        expr: rate(auth_csrf_failures_total[5m]) > 5
        annotations:
          summary: Potential CSRF attack detected

      - alert: RefreshTokenRotationFailing
        expr: rate(auth_token_refreshes_total{status="failure"}[5m]) > 1
        annotations:
          summary: Refresh token rotation failures
```

---

## Rollback Plan

### Immediate Rollback (< 5 minutes)

If critical issues detected after deployment:

1. **Disable cookie auth feature flag:**
   ```bash
   # Set on API server
   export AUTH_COOKIE_ENABLED=false
   pm2 restart xala-api
   ```

2. **Revert frontend apps:**
   ```bash
   # Deploy previous version
   pnpm deploy:backoffice --version=previous
   ```

3. **Monitor:** Verify all users can log in with header auth

### Data Rollback

If session database corrupted:

```sql
-- Backup before migration
pg_dump -t sessions -t refresh_tokens > sessions_backup.sql

-- Restore if needed
psql -d xala < sessions_backup.sql
```

---

## Success Criteria

### Technical

- [ ] Zero tokens in browser storage (localStorage/sessionStorage)
- [ ] All authentication via HTTP-only cookies
- [ ] CSRF protection active and validated
- [ ] Refresh token rotation working
- [ ] Session cleanup running automatically
- [ ] Cross-subdomain SSO working
- [ ] All E2E tests passing
- [ ] Zero security scanner warnings

### Operational

- [ ] No increase in auth-related errors
- [ ] Login success rate maintained (>99%)
- [ ] Session duration within expected range
- [ ] No performance degradation
- [ ] Audit logs capturing all events
- [ ] Monitoring and alerts configured

### Business

- [ ] No user complaints about auth issues
- [ ] No increase in support tickets
- [ ] Security audit passes
- [ ] GDPR compliance maintained
- [ ] Ready for production security review

---

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 6265 - HTTP State Management (Cookies)](https://datatracker.ietf.org/doc/html/rfc6265)
- [SameSite Cookies Explained](https://web.dev/samesite-cookies-explained/)

---

**Next Steps:**

1. Review this migration guide with team
2. Get approval for implementation timeline (estimated: 15-20 hours total)
3. Schedule migration during low-traffic period
4. Execute Phase 0 (guardrails) first
5. Monitor, test, iterate through each phase

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Status:** Ready for Implementation
