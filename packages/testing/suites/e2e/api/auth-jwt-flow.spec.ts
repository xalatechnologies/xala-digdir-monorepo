// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * JWT Authentication Flow E2E Test (Playwright)
 *
 * Full JWT authentication flow verification:
 * 1. Login with credentials → Receive JWT token
 * 2. Use JWT token for authenticated requests
 * 3. Verify protected routes require valid JWT
 * 4. Verify tampered tokens are rejected
 */
import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('JWT Authentication Flow', () => {
  setupMockApi();
  let authToken: string;

  test('Step 1: Login returns valid JWT token', async ({ request }) => {
    // POST /api/auth/login with valid credentials
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify response contains JWT token
    expect(body.token).toBeDefined();
    authToken = body.token;

    // Verify JWT token format (3 parts: header.payload.signature)
    const parts = authToken.split('.');
    expect(parts.length).toBe(3);

    // Verify each part is non-empty base64-encoded string
    parts.forEach((part) => {
      expect(part.length).toBeGreaterThan(0);
      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      expect(part).toMatch(/^[A-Za-z0-9+/=_-]+$/);
    });

    // Verify token expiration is in the future
    expect(body.expiresAt).toBeDefined();
    const expiresAt = new Date(body.expiresAt).getTime();
    const now = Date.now();
    expect(expiresAt).toBeGreaterThan(now);

    console.log('✅ Step 1 PASSED: Login returns valid JWT token');
  });

  test('Step 2: Use JWT token for authenticated request', async ({ request }) => {
    // First, login to get token
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const loginBody = await loginResponse.json();
    const token = loginBody.token;

    // GET /api/auth/session with Authorization: Bearer <token> header
    const sessionResponse = await request.get(`${API_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Verify session is authenticated
    expect(sessionResponse.status()).toBe(200);
    const sessionBody = await sessionResponse.json();

    expect(sessionBody.authenticated).toBe(true);
    expect(sessionBody.userId).toBeDefined();
    expect(sessionBody.tenantId).toBeDefined();

    console.log('✅ Step 2 PASSED: JWT token grants access to protected route');
  });

  test('Step 3: Protected route rejects request without JWT', async ({ request }) => {
    // Attempt GET /api/auth/session without Authorization header
    const response = await request.get(`${API_URL}/api/auth/session`);

    // Verify 401 Unauthorized response
    expect(response.status()).toBe(401);

    const body = await response.json();

    // Verify RFC 7807 Problem Details format
    expect(body.type).toBeDefined();
    expect(body.title).toBeDefined();
    expect(body.status).toBe(401);
    expect(body.detail).toContain('token');

    console.log('✅ Step 3 PASSED: Protected route rejects unauthenticated request');
  });

  test('Step 4: Protected route rejects malformed JWT', async ({ request }) => {
    // Attempt request with malformed token
    const response = await request.get(`${API_URL}/api/auth/session`, {
      headers: {
        'Authorization': 'Bearer invalid-malformed-token',
      },
    });

    // Verify 401 Unauthorized response
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.status).toBe(401);

    console.log('✅ Step 4 PASSED: Malformed JWT is rejected');
  });

  test('Step 5: JWT tokens cannot be tampered with', async ({ request }) => {
    // Step 1: Get valid token
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const loginBody = await loginResponse.json();
    const validToken = loginBody.token;
    const parts = validToken.split('.');

    // Step 2: Decode payload, modify userId, re-encode
    const payloadBase64 = parts[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    // Tamper with payload - change userId to impersonate another user
    payload.userId = 'attacker-user-id-12345';

    // Re-encode payload
    const tamperedPayloadBase64 = Buffer.from(JSON.stringify(payload))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Reconstruct token with tampered payload but original signature
    const tamperedToken = `${parts[0]}.${tamperedPayloadBase64}.${parts[2]}`;

    // Step 3: Attempt to use tampered token
    const response = await request.get(`${API_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${tamperedToken}`,
      },
    });

    // Step 4: Verify request is rejected due to invalid signature
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.status).toBe(401);
    expect(body.detail).toMatch(/invalid|signature|tampered/i);

    console.log('✅ Step 5 PASSED: Tampered JWT tokens are rejected (signature verification works)');
  });

  test('Step 6: Token refresh issues new valid JWT', async ({ request }) => {
    // Step 1: Login to get initial token
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const loginBody = await loginResponse.json();
    const initialToken = loginBody.token;

    // Step 2: Refresh token
    const refreshResponse = await request.post(`${API_URL}/api/auth/refresh`, {
      headers: {
        'Authorization': `Bearer ${initialToken}`,
      },
    });

    // Step 3: Verify new token is issued
    expect(refreshResponse.status()).toBe(200);
    const refreshBody = await refreshResponse.json();

    expect(refreshBody.token).toBeDefined();
    const newToken = refreshBody.token;

    // New token should be different from initial token
    expect(newToken).not.toBe(initialToken);

    // New token should be valid JWT format (3 parts)
    const parts = newToken.split('.');
    expect(parts.length).toBe(3);

    // Step 4: Use new token for authenticated request
    const sessionResponse = await request.get(`${API_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${newToken}`,
      },
    });

    expect(sessionResponse.status()).toBe(200);
    const sessionBody = await sessionResponse.json();
    expect(sessionBody.authenticated).toBe(true);

    console.log('✅ Step 6 PASSED: Token refresh issues new valid JWT');
  });
});
}
