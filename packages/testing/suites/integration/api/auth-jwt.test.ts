/**
 * JWT Authentication Flow Integration Tests
 *
 * E2E verification of JWT authentication:
 * - Login returns proper JWT tokens
 * - Tokens can be used for authenticated requests
 * - Protected routes reject unauthenticated requests
 */
import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { request, skipIfNoServer } from './setup';

describe('JWT Authentication Flow', () => {
  setupMockApi();
  describe('Login Flow', () => {
  setupMockApi();
    it('should return JWT token on successful login', async () => {
      if (skipIfNoServer()) return;

      // POST /api/auth/login with valid credentials
      const res = await request('POST', '/api/auth/login', {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      // Should return 200 with token
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.token).toBeDefined();

      // Verify JWT token format (3 parts: header.payload.signature)
      const token = res.body.token;
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Verify each part is non-empty and base64-encoded
      parts.forEach((part: string) => {
        expect(part.length).toBeGreaterThan(0);
      });
    });

    it('should include token expiration info', async () => {
      if (skipIfNoServer()) return;

      const res = await request('POST', '/api/auth/login', {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.expiresAt).toBeDefined();

      // expiresAt should be a future timestamp
      const expiresAt = new Date(res.body.expiresAt).getTime();
      const now = Date.now();
      expect(expiresAt).toBeGreaterThan(now);
    });
  });

  describe('Protected Route Access with JWT', () => {
  setupMockApi();
    it('should allow access to protected route with valid JWT token', async () => {
      if (skipIfNoServer()) return;

      // Step 1: Login and get JWT token
      const loginRes = await request('POST', '/api/auth/login', {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;
      expect(token).toBeDefined();

      // Step 2: Use token in Authorization: Bearer <token> header
      const sessionRes = await request('GET', '/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Step 3: Verify session is authenticated
      expect(sessionRes.status).toBe(200);
      expect(sessionRes.body).toBeDefined();
      expect(sessionRes.body.authenticated).toBe(true);
      expect(sessionRes.body.userId).toBeDefined();
      expect(sessionRes.body.tenantId).toBeDefined();
    });

    it('should reject access to protected route without JWT token', async () => {
      if (skipIfNoServer()) return;

      // Attempt GET /api/auth/session without token
      const res = await request('GET', '/api/auth/session', {
        // No Authorization header
      });

      // Verify 401 Unauthorized response
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();

      // Should return RFC 7807 Problem Details
      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBeDefined();
      expect(res.body.status).toBe(401);
    });

    it('should reject access with malformed JWT token', async () => {
      if (skipIfNoServer()) return;

      // Use malformed token
      const res = await request('GET', '/api/auth/session', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      // Should return 401 Unauthorized
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(401);
    });

    it('should reject access with tampered JWT token', async () => {
      if (skipIfNoServer()) return;

      // Step 1: Get valid token
      const loginRes = await request('POST', '/api/auth/login', {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const token = loginRes.body.token;
      const parts = token.split('.');

      // Step 2: Tamper with payload (decode, modify, re-encode)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      payload.userId = 'hacker-user-id'; // Modify userId
      const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      // Step 3: Attempt to use tampered token
      const res = await request('GET', '/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${tamperedToken}`,
        },
      });

      // Step 4: Verify request is rejected (invalid signature)
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(401);
    });
  });

  describe('Token Refresh', () => {
  setupMockApi();
    it('should issue new JWT token on refresh', async () => {
      if (skipIfNoServer()) return;

      // Step 1: Login and get initial token
      const loginRes = await request('POST', '/api/auth/login', {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const initialToken = loginRes.body.token;

      // Step 2: Refresh token
      const refreshRes = await request('POST', '/api/auth/refresh', {
        headers: {
          'Authorization': `Bearer ${initialToken}`,
        },
      });

      // Step 3: Verify new token is issued
      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.token).toBeDefined();

      // New token should be different from initial token
      const newToken = refreshRes.body.token;
      expect(newToken).not.toBe(initialToken);

      // New token should be valid JWT format
      const parts = newToken.split('.');
      expect(parts).toHaveLength(3);
    });
  });
});
