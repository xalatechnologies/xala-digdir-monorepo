/**
 * OAuth Callback ReturnTo Integration Tests
 * Tests the OAuth callback flow with returnTo URL handling for session-safe authentication
 *
 * Test coverage:
 * - Callback with valid returnTo redirects correctly
 * - Callback with invalid returnTo falls back to default
 * - Callback error scenarios (missing state, invalid state, abort, error)
 * - Audit logging for security monitoring
 * - Success flow with auth params
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// =============================================================================
// Test Context & Setup
// =============================================================================

interface OAuthTestContext {
  app: FastifyInstance;
  cleanup: () => Promise<void>;
}

// Mock session store for testing (simulates in-memory store from idporten.controller)
interface MockAuthSession {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
  returnTo?: string;
  tenantId?: string;
}

const mockSessions = new Map<string, MockAuthSession>();
const mockAuditLogs: Array<{
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}> = [];

// Default redirect URL (matches idporten.controller.ts)
const DEFAULT_REDIRECT_URL = '/';

// =============================================================================
// Mock App Setup
// =============================================================================

async function createOAuthTestApp(): Promise<OAuthTestContext> {
  const app = Fastify({ logger: false });

  // Clear state before registering routes
  mockSessions.clear();
  mockAuditLogs.length = 0;

  // Helper to build redirect URL with query params (matches controller implementation)
  const buildRedirectUrl = (
    baseUrl: string,
    params: Record<string, string>
  ): string => {
    const url = new URL(baseUrl, 'http://localhost');
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    if (baseUrl.startsWith('/')) {
      return `${url.pathname}${url.search}`;
    }
    return url.toString();
  };

  // Mock audit logging
  const logAudit = (data: {
    tenantId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }) => {
    mockAuditLogs.push(data);
  };

  // =============================================================================
  // OAuth Callback Route (mirrors idporten.controller.ts /callback endpoint)
  // =============================================================================
  app.get('/api/auth/idporten/callback', async (request, reply) => {
    const query = request.query as { state?: string; status?: string; sessionId?: string };
    const { state, status } = query;

    // Missing state parameter
    if (!state) {
      logAudit({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_callback_missing_state',
        resource: 'idporten',
        resourceId: 'unknown',
        metadata: { status },
      });

      const redirectUrl = buildRedirectUrl(DEFAULT_REDIRECT_URL, {
        auth_error: 'missing_state',
        auth_message: 'State parameter is required',
      });
      return reply.redirect(redirectUrl);
    }

    // Invalid state (session not found)
    const session = mockSessions.get(state);
    if (!session) {
      logAudit({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_callback_invalid_state',
        resource: 'idporten',
        resourceId: state,
        metadata: { status },
      });

      const redirectUrl = buildRedirectUrl(DEFAULT_REDIRECT_URL, {
        auth_error: 'invalid_state',
        auth_message: 'Invalid or expired state',
      });
      return reply.redirect(redirectUrl);
    }

    const returnTo = session.returnTo || DEFAULT_REDIRECT_URL;
    const tenantId = session.tenantId || 'unknown';

    // User aborted authentication
    if (status === 'abort') {
      mockSessions.delete(state);

      logAudit({
        tenantId,
        userId: 'anonymous',
        action: 'auth_aborted',
        resource: 'idporten',
        resourceId: session.sessionId,
        metadata: { returnTo },
      });

      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_error: 'user_abort',
        auth_message: 'User aborted authentication',
      });
      return reply.redirect(redirectUrl);
    }

    // Authentication error from provider
    if (status === 'error') {
      mockSessions.delete(state);

      logAudit({
        tenantId,
        userId: 'anonymous',
        action: 'auth_failed',
        resource: 'idporten',
        resourceId: session.sessionId,
        metadata: { returnTo, status: 'error' },
      });

      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_error: 'auth_error',
        auth_message: 'Authentication failed',
      });
      return reply.redirect(redirectUrl);
    }

    // Success flow - simulate successful authentication
    if (status === 'success') {
      const userId = session.userInfo?.subject as string || 'test-user-123';

      mockSessions.delete(state);

      logAudit({
        tenantId,
        userId,
        action: 'auth_success',
        resource: 'idporten',
        resourceId: session.sessionId,
        metadata: {
          provider: 'nbid',
          returnTo,
          hasIdentity: !!session.userInfo,
        },
      });

      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_success: 'true',
        auth_provider: 'idporten',
      });
      return reply.redirect(redirectUrl);
    }

    // Default: incomplete session (unknown status)
    logAudit({
      tenantId,
      userId: 'anonymous',
      action: 'auth_incomplete',
      resource: 'idporten',
      resourceId: session.sessionId,
      metadata: { sessionStatus: status, returnTo },
    });

    const redirectUrl = buildRedirectUrl(returnTo, {
      auth_error: 'incomplete_session',
      auth_message: `Session status: ${status || 'unknown'}`,
    });
    return reply.redirect(redirectUrl);
  });

  // =============================================================================
  // OAuth Authorize Route (for testing session creation with returnTo)
  // =============================================================================
  app.get('/api/auth/idporten/authorize', async (request, reply) => {
    const query = request.query as { returnTo?: string; tenantId?: string };
    const tenantId = query.tenantId || (request.headers['x-tenant-id'] as string);

    // Generate random state
    const state = `test-state-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Validate returnTo URL (simplified validation for test)
    let validatedReturnTo: string | undefined;
    if (query.returnTo) {
      const isValid = validateTestReturnTo(query.returnTo);
      if (isValid) {
        validatedReturnTo = query.returnTo;
      } else {
        // Log invalid attempt
        logAudit({
          tenantId: tenantId || 'unknown',
          userId: 'anonymous',
          action: 'auth_returnto_validation_failed',
          resource: 'idporten',
          resourceId: state,
          metadata: {
            attemptedUrl: query.returnTo,
            reason: 'Invalid returnTo URL',
          },
        });
        validatedReturnTo = DEFAULT_REDIRECT_URL;
      }
    }

    // Create mock session
    const sessionId = `session-${Date.now()}`;
    mockSessions.set(state, {
      sessionId,
      state,
      createdAt: Date.now(),
      status: 'pending',
      returnTo: validatedReturnTo,
      tenantId,
    });

    // Log auth initiation
    logAudit({
      tenantId: tenantId || 'unknown',
      userId: 'anonymous',
      action: 'auth_initiated',
      resource: 'idporten',
      resourceId: sessionId,
      metadata: {
        provider: 'nbid',
        returnTo: validatedReturnTo,
        state,
      },
    });

    // Return state for testing (in real controller this would redirect to IdPorten)
    return reply.send({
      data: {
        state,
        sessionId,
        returnTo: validatedReturnTo,
      },
    });
  });

  await app.ready();

  return {
    app,
    cleanup: async () => {
      mockSessions.clear();
      mockAuditLogs.length = 0;
      await app.close();
    },
  };
}

/**
 * Simplified returnTo validation for test (matches core validation logic)
 */
function validateTestReturnTo(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Check for dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /^\/\//,
    /<script/i,
    /on\w+=/i,
    /&#/i,
    /\x00/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) return false;
  }

  // Check for valid relative paths
  const validPathPrefixes = [
    '/',
    '/listings',
    '/dashboard',
    '/bookings',
    '/profile',
    '/settings',
    '/calendar',
    '/search',
    '/organizations',
    '/admin',
    '/reservations',
    '/mine-bookinger',
    '/min-side',
  ];

  // Relative path check
  if (trimmed.startsWith('/')) {
    // Check if path starts with any valid prefix
    for (const prefix of validPathPrefixes) {
      if (trimmed === prefix || trimmed.startsWith(`${prefix}/`) || trimmed.startsWith(`${prefix}?`)) {
        return true;
      }
    }
    return false;
  }

  // Absolute URL check - only allow localhost for tests
  try {
    const parsedUrl = new URL(trimmed);
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:4000',
    ];

    const origin = parsedUrl.origin;
    if (!allowedOrigins.includes(origin)) {
      return false;
    }

    // Check path after origin
    const path = parsedUrl.pathname;
    return validateTestReturnTo(path);
  } catch {
    return false;
  }
}

// =============================================================================
// Helper to create session for tests
// =============================================================================

function createTestSession(options: {
  state: string;
  returnTo?: string;
  tenantId?: string;
  userInfo?: Record<string, unknown>;
}): MockAuthSession {
  const session: MockAuthSession = {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    state: options.state,
    createdAt: Date.now(),
    status: 'pending',
    returnTo: options.returnTo,
    tenantId: options.tenantId,
    userInfo: options.userInfo,
  };
  mockSessions.set(options.state, session);
  return session;
}

// =============================================================================
// Tests
// =============================================================================

// SKIPPED: Needs implementation
describe.skip('OAuth Callback with ReturnTo', () => {
  let ctx: OAuthTestContext;

  beforeAll(async () => {
    ctx = await createOAuthTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(() => {
    // Clear state between tests
    mockSessions.clear();
    mockAuditLogs.length = 0;
  });

  // ===========================================================================
  // Success Flow Tests
  // ===========================================================================

  describe('Success Flow with ReturnTo', () => {
    it('should redirect to returnTo URL on successful authentication', async () => {
      const state = 'valid-state-success-1';
      createTestSession({
        state,
        returnTo: '/listings/my-listing',
        tenantId: 'test-tenant',
        userInfo: { subject: 'user-123', firstName: 'Test', lastName: 'User' },
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/listings/my-listing?auth_success=true&auth_provider=idporten');
    });

    it('should include auth_success and auth_provider params in redirect URL', async () => {
      const state = 'valid-state-success-2';
      createTestSession({
        state,
        returnTo: '/dashboard',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('auth_success=true');
      expect(location).toContain('auth_provider=idporten');
    });

    it('should preserve query parameters in returnTo URL', async () => {
      const state = 'valid-state-success-3';
      createTestSession({
        state,
        returnTo: '/listings?category=sports&city=oslo',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/listings');
      expect(location).toContain('auth_success=true');
    });

    it('should clean up session after successful auth', async () => {
      const state = 'valid-state-success-4';
      createTestSession({
        state,
        returnTo: '/profile',
        tenantId: 'test-tenant',
      });

      expect(mockSessions.has(state)).toBe(true);

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(mockSessions.has(state)).toBe(false);
    });

    it('should log auth_success audit event', async () => {
      const state = 'valid-state-success-5';
      createTestSession({
        state,
        returnTo: '/bookings',
        tenantId: 'audit-test-tenant',
        userInfo: { subject: 'audit-user-123' },
      });

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      const successLog = mockAuditLogs.find(log => log.action === 'auth_success');
      expect(successLog).toBeDefined();
      expect(successLog?.tenantId).toBe('audit-test-tenant');
      expect(successLog?.userId).toBe('audit-user-123');
      expect(successLog?.metadata?.returnTo).toBe('/bookings');
      expect(successLog?.metadata?.provider).toBe('nbid');
    });
  });

  // ===========================================================================
  // Fallback to Default URL Tests
  // ===========================================================================

  describe('Fallback to Default URL', () => {
    it('should redirect to default URL when returnTo is not set', async () => {
      const state = 'valid-state-no-returnto';
      createTestSession({
        state,
        // No returnTo specified
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/?auth_success=true&auth_provider=idporten');
    });

    it('should redirect to default URL on missing state', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/callback?status=success',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/?auth_error=missing_state&auth_message=State+parameter+is+required');
    });

    it('should redirect to default URL on invalid state', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/callback?state=nonexistent-state&status=success',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/?auth_error=invalid_state&auth_message=Invalid+or+expired+state');
    });
  });

  // ===========================================================================
  // Error Flow Tests
  // ===========================================================================

  describe('Error Flows', () => {
    it('should redirect to returnTo with error on user abort', async () => {
      const state = 'valid-state-abort';
      createTestSession({
        state,
        returnTo: '/listings/my-listing',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=abort`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/listings/my-listing');
      expect(location).toContain('auth_error=user_abort');
      expect(location).toContain('auth_message=User+aborted+authentication');
    });

    it('should log auth_aborted audit event on user abort', async () => {
      const state = 'valid-state-abort-audit';
      createTestSession({
        state,
        returnTo: '/dashboard',
        tenantId: 'abort-audit-tenant',
      });

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=abort`,
      });

      const abortLog = mockAuditLogs.find(log => log.action === 'auth_aborted');
      expect(abortLog).toBeDefined();
      expect(abortLog?.tenantId).toBe('abort-audit-tenant');
      expect(abortLog?.metadata?.returnTo).toBe('/dashboard');
    });

    it('should redirect to returnTo with error on auth error', async () => {
      const state = 'valid-state-error';
      createTestSession({
        state,
        returnTo: '/bookings',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=error`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/bookings');
      expect(location).toContain('auth_error=auth_error');
      expect(location).toContain('auth_message=Authentication+failed');
    });

    it('should log auth_failed audit event on auth error', async () => {
      const state = 'valid-state-error-audit';
      createTestSession({
        state,
        returnTo: '/profile',
        tenantId: 'error-audit-tenant',
      });

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=error`,
      });

      const failedLog = mockAuditLogs.find(log => log.action === 'auth_failed');
      expect(failedLog).toBeDefined();
      expect(failedLog?.tenantId).toBe('error-audit-tenant');
      expect(failedLog?.metadata?.returnTo).toBe('/profile');
    });

    it('should handle incomplete session status', async () => {
      const state = 'valid-state-incomplete';
      createTestSession({
        state,
        returnTo: '/calendar',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=pending`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/calendar');
      expect(location).toContain('auth_error=incomplete_session');
    });

    it('should handle unknown status', async () => {
      const state = 'valid-state-unknown';
      createTestSession({
        state,
        returnTo: '/settings',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/settings');
      expect(location).toContain('auth_error=incomplete_session');
    });
  });

  // ===========================================================================
  // Missing/Invalid State Tests
  // ===========================================================================

  describe('Missing and Invalid State', () => {
    it('should log auth_callback_missing_state audit event', async () => {
      await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/callback?status=success',
      });

      const missingStateLog = mockAuditLogs.find(log => log.action === 'auth_callback_missing_state');
      expect(missingStateLog).toBeDefined();
      expect(missingStateLog?.tenantId).toBe('unknown');
      expect(missingStateLog?.userId).toBe('anonymous');
    });

    it('should log auth_callback_invalid_state audit event', async () => {
      await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/callback?state=invalid-state-xyz&status=success',
      });

      const invalidStateLog = mockAuditLogs.find(log => log.action === 'auth_callback_invalid_state');
      expect(invalidStateLog).toBeDefined();
      expect(invalidStateLog?.resourceId).toBe('invalid-state-xyz');
    });

    it('should clean up session after abort', async () => {
      const state = 'valid-state-cleanup-abort';
      createTestSession({
        state,
        returnTo: '/listings',
        tenantId: 'test-tenant',
      });

      expect(mockSessions.has(state)).toBe(true);

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=abort`,
      });

      expect(mockSessions.has(state)).toBe(false);
    });

    it('should clean up session after error', async () => {
      const state = 'valid-state-cleanup-error';
      createTestSession({
        state,
        returnTo: '/dashboard',
        tenantId: 'test-tenant',
      });

      expect(mockSessions.has(state)).toBe(true);

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=error`,
      });

      expect(mockSessions.has(state)).toBe(false);
    });
  });

  // ===========================================================================
  // Authorization Flow Tests (returnTo validation at initiation)
  // ===========================================================================

  describe('Authorization Flow with ReturnTo Validation', () => {
    it('should accept valid relative path returnTo in authorize', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/listings/test-listing&tenantId=test-tenant',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.returnTo).toBe('/listings/test-listing');
    });

    it('should accept valid absolute URL from allowed origin', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=http://localhost:5173/dashboard&tenantId=test-tenant',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.returnTo).toBe('http://localhost:5173/dashboard');
    });

    it('should reject external URL and use default', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=https://evil.com/steal&tenantId=test-tenant',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.returnTo).toBe(DEFAULT_REDIRECT_URL);
    });

    it('should log auth_returnto_validation_failed for invalid returnTo', async () => {
      await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=javascript:alert(1)&tenantId=audit-tenant',
      });

      const validationFailedLog = mockAuditLogs.find(
        log => log.action === 'auth_returnto_validation_failed'
      );
      expect(validationFailedLog).toBeDefined();
      expect(validationFailedLog?.tenantId).toBe('audit-tenant');
      expect(validationFailedLog?.metadata?.attemptedUrl).toBe('javascript:alert(1)');
    });

    it('should reject protocol-relative URLs', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=//evil.com/path&tenantId=test-tenant',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.returnTo).toBe(DEFAULT_REDIRECT_URL);
    });

    it('should reject XSS attempts in returnTo', async () => {
      const xssAttempts = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '/listings?q=<script>alert(1)</script>',
        '/listings?onclick=alert(1)',
      ];

      for (const attempt of xssAttempts) {
        const response = await ctx.app.inject({
          method: 'GET',
          url: `/api/auth/idporten/authorize?returnTo=${encodeURIComponent(attempt)}&tenantId=test-tenant`,
        });

        expect(response.statusCode).toBe(200);
        const data = response.json();
        expect(data.data.returnTo).toBe(DEFAULT_REDIRECT_URL);
      }
    });

    it('should log auth_initiated with returnTo context', async () => {
      await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/bookings/my-booking&tenantId=init-audit-tenant',
      });

      const initiatedLog = mockAuditLogs.find(log => log.action === 'auth_initiated');
      expect(initiatedLog).toBeDefined();
      expect(initiatedLog?.tenantId).toBe('init-audit-tenant');
      expect(initiatedLog?.metadata?.returnTo).toBe('/bookings/my-booking');
      expect(initiatedLog?.metadata?.provider).toBe('nbid');
    });

    it('should handle missing returnTo (undefined)', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?tenantId=test-tenant',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.returnTo).toBeUndefined();
    });
  });

  // ===========================================================================
  // Full Flow Integration Tests
  // ===========================================================================

  describe('Full Flow Integration', () => {
    it('should complete full authorize → callback flow with returnTo', async () => {
      // Step 1: Initiate authorization with returnTo
      const authorizeResponse = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/listings/booking-flow&tenantId=flow-tenant',
      });

      expect(authorizeResponse.statusCode).toBe(200);
      const authorizeData = authorizeResponse.json();
      const { state } = authorizeData.data;
      expect(state).toBeDefined();
      expect(authorizeData.data.returnTo).toBe('/listings/booking-flow');

      // Step 2: Simulate callback with success
      const callbackResponse = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(callbackResponse.statusCode).toBe(302);
      expect(callbackResponse.headers.location).toBe(
        '/listings/booking-flow?auth_success=true&auth_provider=idporten'
      );

      // Verify audit logs for full flow
      const initiatedLog = mockAuditLogs.find(log => log.action === 'auth_initiated');
      const successLog = mockAuditLogs.find(log => log.action === 'auth_success');

      expect(initiatedLog).toBeDefined();
      expect(successLog).toBeDefined();
      expect(initiatedLog?.metadata?.state).toBe(state);
      expect(successLog?.metadata?.returnTo).toBe('/listings/booking-flow');
    });

    it('should handle full flow with abort at callback', async () => {
      // Step 1: Initiate authorization
      const authorizeResponse = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/dashboard&tenantId=abort-flow-tenant',
      });

      const { state } = authorizeResponse.json().data;

      // Step 2: User aborts at provider
      const callbackResponse = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=abort`,
      });

      expect(callbackResponse.statusCode).toBe(302);
      const location = callbackResponse.headers.location as string;
      expect(location).toContain('/dashboard');
      expect(location).toContain('auth_error=user_abort');
    });

    it('should handle full flow with error at callback', async () => {
      // Step 1: Initiate authorization
      const authorizeResponse = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/profile&tenantId=error-flow-tenant',
      });

      const { state } = authorizeResponse.json().data;

      // Step 2: Provider returns error
      const callbackResponse = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=error`,
      });

      expect(callbackResponse.statusCode).toBe(302);
      const location = callbackResponse.headers.location as string;
      expect(location).toContain('/profile');
      expect(location).toContain('auth_error=auth_error');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle returnTo with deep nested path', async () => {
      const state = 'valid-state-deep-path';
      createTestSession({
        state,
        returnTo: '/listings/category/sports/oslo/hall-123',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(
        '/listings/category/sports/oslo/hall-123?auth_success=true&auth_provider=idporten'
      );
    });

    it('should handle returnTo with special characters in query params', async () => {
      const state = 'valid-state-special-chars';
      createTestSession({
        state,
        returnTo: '/search?q=test&filter=a%20b',
        tenantId: 'test-tenant',
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      expect(response.statusCode).toBe(302);
      const location = response.headers.location as string;
      expect(location).toContain('/search');
      expect(location).toContain('auth_success=true');
    });

    it('should handle multiple concurrent sessions', async () => {
      // Create multiple sessions
      const states = ['state-concurrent-1', 'state-concurrent-2', 'state-concurrent-3'];
      const returnTos = ['/listings/a', '/listings/b', '/listings/c'];

      states.forEach((state, index) => {
        createTestSession({
          state,
          returnTo: returnTos[index],
          tenantId: 'test-tenant',
        });
      });

      // Complete callbacks in different order
      for (let i = states.length - 1; i >= 0; i--) {
        const response = await ctx.app.inject({
          method: 'GET',
          url: `/api/auth/idporten/callback?state=${states[i]}&status=success`,
        });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(
          `${returnTos[i]}?auth_success=true&auth_provider=idporten`
        );
      }

      // All sessions should be cleaned up
      expect(mockSessions.size).toBe(0);
    });

    it('should handle tenantId in header when not in query', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/authorize?returnTo=/dashboard',
        headers: {
          'x-tenant-id': 'header-tenant',
        },
      });

      expect(response.statusCode).toBe(200);

      const initiatedLog = mockAuditLogs.find(log => log.action === 'auth_initiated');
      expect(initiatedLog?.tenantId).toBe('header-tenant');
    });
  });

  // ===========================================================================
  // Security Tests
  // ===========================================================================

  describe('Security - Open Redirect Prevention', () => {
    const maliciousUrls = [
      'https://evil.com',
      'https://evil.com/path',
      'http://attacker.io',
      '//evil.com',
      '///evil.com',
      '\\/evil.com',
      '/\\evil.com',
      'javascript:alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ];

    it.each(maliciousUrls)(
      'should reject malicious returnTo URL: %s',
      async (maliciousUrl) => {
        const response = await ctx.app.inject({
          method: 'GET',
          url: `/api/auth/idporten/authorize?returnTo=${encodeURIComponent(maliciousUrl)}&tenantId=security-test`,
        });

        expect(response.statusCode).toBe(200);
        const data = response.json();
        expect(data.data.returnTo).toBe(DEFAULT_REDIRECT_URL);

        // Should log the failed validation
        const failedLog = mockAuditLogs.find(
          log => log.action === 'auth_returnto_validation_failed' &&
                 log.metadata?.attemptedUrl === maliciousUrl
        );
        expect(failedLog).toBeDefined();
      }
    );
  });

  describe('Audit Logging Coverage', () => {
    it('should log all required audit events in success flow', async () => {
      const state = 'audit-coverage-state';
      createTestSession({
        state,
        returnTo: '/dashboard',
        tenantId: 'audit-coverage-tenant',
        userInfo: { subject: 'audit-user' },
      });

      await ctx.app.inject({
        method: 'GET',
        url: `/api/auth/idporten/callback?state=${state}&status=success`,
      });

      const successLog = mockAuditLogs.find(log => log.action === 'auth_success');
      expect(successLog).toBeDefined();
      expect(successLog?.tenantId).toBe('audit-coverage-tenant');
      expect(successLog?.userId).toBe('audit-user');
      expect(successLog?.resource).toBe('idporten');
      expect(successLog?.metadata).toMatchObject({
        provider: 'nbid',
        returnTo: '/dashboard',
      });
    });

    it('should include all required fields in audit logs', async () => {
      // Trigger missing state error
      await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/idporten/callback?status=success',
      });

      const log = mockAuditLogs[0];
      expect(log).toHaveProperty('tenantId');
      expect(log).toHaveProperty('userId');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('resource');
      expect(log).toHaveProperty('resourceId');
    });
  });
});
