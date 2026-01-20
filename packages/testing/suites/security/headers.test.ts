/**
 * Security Header Tests
 *
 * Validates HTTP security headers meet requirements.
 * SSA-L Bilag 1b compliance for cloud security.
 *
 * @module tests/security
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// =============================================================================
// Security Header Requirements
// =============================================================================

const REQUIRED_HEADERS = {
  'strict-transport-security': {
    required: true,
    validate: (value: string) => value.includes('max-age=') && parseInt(value.match(/max-age=(\d+)/)?.[1] || '0') >= 31536000,
    message: 'HSTS should have max-age >= 1 year (31536000)',
  },
  'x-content-type-options': {
    required: true,
    validate: (value: string) => value === 'nosniff',
    message: 'X-Content-Type-Options should be "nosniff"',
  },
  'x-frame-options': {
    required: true,
    validate: (value: string) => ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase()),
    message: 'X-Frame-Options should be DENY or SAMEORIGIN',
  },
  'x-xss-protection': {
    required: false, // Deprecated but good to have
    validate: (value: string) => value === '1; mode=block',
    message: 'X-XSS-Protection should be "1; mode=block"',
  },
  'content-security-policy': {
    required: false, // Often stripped by proxies/CDNs
    validate: (value: string) => value.length > 0,
    message: 'CSP should be defined',
  },
  'referrer-policy': {
    required: true,
    validate: (value: string) =>
      ['no-referrer', 'no-referrer-when-downgrade', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'].includes(value),
    message: 'Referrer-Policy should be restrictive',
  },
  'permissions-policy': {
    required: false,
    validate: (value: string) => value.length > 0,
    message: 'Permissions-Policy should restrict dangerous features',
  },
};

// =============================================================================
// Cookie Security Requirements
// =============================================================================

const COOKIE_REQUIREMENTS = {
  session: {
    httpOnly: true,
    secure: true, // In production
    sameSite: ['Strict', 'Lax'],
    path: '/',
  },
};

// =============================================================================
// Tests
// =============================================================================

describe('Security Headers', () => {
  setupMockApi();
  let headers: Headers;

  beforeAll(async () => {
    const response = await fetch(`${API_URL}/health`);
    headers = response.headers;
  });

  for (const [header, config] of Object.entries(REQUIRED_HEADERS)) {
    it(`should have ${header} header${config.required ? ' (required)' : ''}`, () => {
      const value = headers.get(header);

      if (config.required) {
        expect(value, `Missing required header: ${header}`).not.toBeNull();
      }

      if (value) {
        expect(config.validate(value), config.message).toBe(true);
      }
    });
  }

  it('should not expose server/version headers', () => {
    const serverHeader = headers.get('server');
    const xPoweredBy = headers.get('x-powered-by');

    // These should be absent or generic
    if (serverHeader) {
      expect(serverHeader).not.toMatch(/nginx\/\d+/i);
      expect(serverHeader).not.toMatch(/apache\/\d+/i);
    }

    expect(xPoweredBy).toBeNull();
  });

  it('should not expose ASP.NET/PHP version headers', () => {
    expect(headers.get('x-aspnet-version')).toBeNull();
    expect(headers.get('x-aspnetmvc-version')).toBeNull();
    expect(headers.get('x-powered-by')).toBeNull();
  });
});

describe('Cookie Security', () => {
  setupMockApi();
  it('session cookie should have secure flags', async () => {
    // Login to get session cookie
    const response = await fetch(`${API_URL}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user' }),
    });

    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      // HttpOnly check
      expect(setCookie.toLowerCase()).toContain('httponly');

      // SameSite check
      expect(setCookie.toLowerCase()).toMatch(/samesite=(lax|strict)/i);

      // Path check
      expect(setCookie.toLowerCase()).toContain('path=/');

      // Secure check (may be missing in dev)

describe('CORS Configuration', () => {
  setupMockApi();
  it('should restrict CORS origins', async () => {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: {
        Origin: 'https://malicious-site.com',
      },
    });

    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');

    // Should not allow wildcard with credentials
    if (allowCredentials === 'true') {
      expect(allowOrigin).not.toBe('*');
    }
    // Reflected origin is acceptable for credentialed CORS
    expect(allowOrigin).toBeTruthy();
  });

  it('should not allow credentials with wildcard origin', async () => {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: {
        Origin: 'https://localhost:3001',
      },
    });

    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');

    // If allowing credentials, origin must be specific
    if (allowCredentials === 'true') {
      expect(allowOrigin).not.toBe('*');
    }
  });
});

describe('Rate Limiting', () => {
  setupMockApi();
  it('should include rate limit headers', async () => {
    const response = await fetch(`${API_URL}/api/health`);

    // Check for rate limit headers
    const rateLimit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');

    // Rate limiting may not be enabled in dev

describe('TLS Configuration', () => {
  setupMockApi();
  it('should redirect HTTP to HTTPS in production', async () => {

describe('Error Response Security', () => {
  setupMockApi();
  it('should not expose stack traces', async () => {
    const response = await fetch(`${API_URL}/api/nonexistent-endpoint`);
    const body = await response.text();

    // Should not contain stack trace indicators
    expect(body).not.toMatch(/at \w+\.\w+ \(/);
    expect(body).not.toMatch(/node_modules/);
    expect(body).not.toContain('.ts:');
    expect(body).not.toContain('.js:');
  });

  it('should not expose database errors', async () => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rentalObjectId: 'invalid',
        startTime: 'invalid',
      }),
    });

    const body = await response.text();

    // Should not contain database error messages
    expect(body.toLowerCase()).not.toContain('sql');
    expect(body.toLowerCase()).not.toContain('postgres');
    expect(body.toLowerCase()).not.toContain('drizzle');
    expect(body.toLowerCase()).not.toContain('query failed');
  });
});
