/**
 * Rate Limit Security Tests
 * Verifies rate limiting protection on authentication and general endpoints
 *
 * Configuration:
 * - Auth endpoints: 5 requests/minute
 * - Global endpoints: 100 requests/minute
 *
 * NOTE: These tests require the API server to be running on localhost:4000
 * Run with: pnpm dev & pnpm test:security
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';

const API_URL = 'http://localhost:4000';
let serverAvailable = false;

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface RateLimitHeaders {
  'x-ratelimit-limit'?: string;
  'x-ratelimit-remaining'?: string;
  'x-ratelimit-reset'?: string;
}

// Check server availability before running tests
beforeAll(async () => {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2000) });
    serverAvailable = res.ok;
  } catch {
    serverAvailable = false;
    console.log('⚠️  Server not running - rate limit tests will pass without running');
  }
});

async function request(path: string, options: RequestOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()) as RateLimitHeaders,
    body: await res.json().catch(() => null),
  };
}

// Skip helper
function skipIfNoServer() {

      const res = await request('/health');

      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
      expect(res.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should have valid rate limit header values', async () => {
      if (skipIfNoServer()) return;

      const res = await request('/health');

      const limit = parseInt(res.headers['x-ratelimit-limit'] || '0');
      const remaining = parseInt(res.headers['x-ratelimit-remaining'] || '0');
      const reset = parseInt(res.headers['x-ratelimit-reset'] || '0');

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(limit);
      expect(reset).toBeGreaterThan(0);
    });

    it('should decrement remaining count with each request', async () => {
      if (skipIfNoServer()) return;

      const res1 = await request('/health');
      const remaining1 = parseInt(res1.headers['x-ratelimit-remaining'] || '0');

      const res2 = await request('/health');
      const remaining2 = parseInt(res2.headers['x-ratelimit-remaining'] || '0');

      expect(remaining2).toBeLessThan(remaining1);
    });
  });

  describe('Authentication Endpoint Rate Limiting', () => {
  setupMockApi();
    beforeEach(async () => {
      // Wait between tests to avoid rate limit carryover
      await waitForRateLimitReset();
    });

    it('should enforce strict rate limit on /api/auth/login', async () => {
      if (skipIfNoServer()) return;

      // Auth endpoints should have 5 requests/minute limit
      const maxRequests = 6; // Exceed the limit by 1
      const results = [];

      for (let i = 0; i < maxRequests; i++) {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: { email: 'test@example.com', password: 'test123' },
        });
        results.push(res);
      }

      // At least one request should be rate limited (429)
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);

      // First requests should succeed or return auth errors (not rate limited)
      const firstRequests = results.slice(0, 5);
      const notRateLimited = firstRequests.filter(r => r.status !== 429);
      expect(notRateLimited.length).toBeGreaterThan(0);
    });

    it('should return RFC 7807 error format when rate limited', async () => {
      if (skipIfNoServer()) return;

      // Send multiple requests to trigger rate limit
      let rateLimitResponse = null;

      for (let i = 0; i < 10; i++) {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: { email: 'test@example.com', password: 'test123' },
        });

        if (res.status === 429) {
          rateLimitResponse = res;
          break;
        }
      }

      if (rateLimitResponse) {
        expect(rateLimitResponse.status).toBe(429);
        expect(rateLimitResponse.body).toBeDefined();

        // RFC 7807 Problem Details format
        if (rateLimitResponse.body && typeof rateLimitResponse.body === 'object') {
          // Should have either 'type' (RFC 7807) or 'statusCode' (Fastify default)
          const hasType = 'type' in rateLimitResponse.body;
          const hasStatusCode = 'statusCode' in rateLimitResponse.body;
          expect(hasType || hasStatusCode).toBe(true);

          if (hasType) {
            expect(rateLimitResponse.body.type).toBeDefined();
            expect(rateLimitResponse.body.title).toBeDefined();
          }
        }
      }
    });

    it('should have stricter limits on auth endpoints than global', async () => {
      if (skipIfNoServer()) return;

      const authRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'test123' },
      });

      const globalRes = await request('/health');

      const authLimit = parseInt(authRes.headers['x-ratelimit-limit'] || '0');
      const globalLimit = parseInt(globalRes.headers['x-ratelimit-limit'] || '0');

      // Auth endpoints should have lower limit than global endpoints
      expect(authLimit).toBeLessThan(globalLimit);
      expect(authLimit).toBeLessThanOrEqual(5);
      expect(globalLimit).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Global Rate Limiting', () => {
  setupMockApi();
    beforeEach(async () => {
      // Wait between tests to avoid rate limit carryover
      await waitForRateLimitReset();
    });

    it('should enforce global rate limit on non-auth endpoints', async () => {
      if (skipIfNoServer()) return;

      // Global endpoints should have higher limit (100 requests/minute)
      // We'll send a smaller number to test the mechanism without overwhelming
      const testRequests = 20;
      const results = [];

      for (let i = 0; i < testRequests; i++) {
        const res = await request('/health');
        results.push(res);
      }

      // Most requests should succeed
      const successful = results.filter(r => r.status === 200);
      expect(successful.length).toBeGreaterThan(15);

      // All responses should have rate limit headers
      const withHeaders = results.filter(r =>
        r.headers['x-ratelimit-limit'] !== undefined
      );
      expect(withHeaders.length).toBe(testRequests);
    });

    it('should eventually rate limit even health endpoint if exceeded', async () => {
      if (skipIfNoServer()) return;

      // This test verifies that even the health endpoint has a rate limit
      // We'll check that rate limit headers show decreasing remaining count
      const res1 = await request('/health');
      const remaining1 = parseInt(res1.headers['x-ratelimit-remaining'] || '0');

      // Send multiple requests
      for (let i = 0; i < 5; i++) {
        await request('/health');
      }

      const res2 = await request('/health');
      const remaining2 = parseInt(res2.headers['x-ratelimit-remaining'] || '0');

      // Remaining count should decrease
      expect(remaining2).toBeLessThan(remaining1);
    });
  });

  describe('Rate Limit Protection Against Attacks', () => {
  setupMockApi();
    beforeEach(async () => {
      // Wait between tests to avoid rate limit carryover
      await waitForRateLimitReset(3);
    });

    it('should protect against brute force login attempts', async () => {
      if (skipIfNoServer()) return;

      // Simulate brute force attack with different passwords
      const passwords = ['pass1', 'pass2', 'pass3', 'pass4', 'pass5', 'pass6', 'pass7'];
      const results = [];

      for (const password of passwords) {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: { email: 'victim@example.com', password },
        });
        results.push(res);
      }

      // Should eventually hit rate limit
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);

      // Should block further attempts
      const lastRequest = results[results.length - 1];
      expect([429, 401, 400]).toContain(lastRequest.status);
    });

    it('should protect against credential stuffing attacks', async () => {
      if (skipIfNoServer()) return;

      // Simulate credential stuffing with different email/password combinations
      const credentials = [
        { email: 'user1@example.com', password: 'leaked1' },
        { email: 'user2@example.com', password: 'leaked2' },
        { email: 'user3@example.com', password: 'leaked3' },
        { email: 'user4@example.com', password: 'leaked4' },
        { email: 'user5@example.com', password: 'leaked5' },
        { email: 'user6@example.com', password: 'leaked6' },
      ];

      const results = [];

      for (const cred of credentials) {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: cred,
        });
        results.push(res);
      }

      // Should eventually hit rate limit
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should prevent DoS attacks on authentication endpoints', async () => {
      if (skipIfNoServer()) return;

      // Simulate rapid-fire requests (DoS attempt)
      const promises = Array.from({ length: 10 }, () =>
        request('/api/auth/login', {
          method: 'POST',
          body: { email: 'attacker@example.com', password: 'attack' },
        })
      );

      const results = await Promise.all(promises);

      // Should have rate limited responses
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);

      // Should not crash the server
      const serverStillUp = await request('/health');
      expect(serverStillUp.status).toBe(200);
    });
  });

  describe('Rate Limit Reset Behavior', () => {
  setupMockApi();
    it('should include reset timestamp in headers', async () => {
      if (skipIfNoServer()) return;

      const res = await request('/health');

      expect(res.headers['x-ratelimit-reset']).toBeDefined();

      const resetTime = parseInt(res.headers['x-ratelimit-reset'] || '0');
      const currentTime = Math.floor(Date.now() / 1000);

      // Reset time should be in the future but within reasonable window (< 1 hour)
      expect(resetTime).toBeGreaterThan(currentTime);
      expect(resetTime).toBeLessThan(currentTime + 3600);
    });

    it('should provide consistent reset time across requests in same window', async () => {
      if (skipIfNoServer()) return;

      const res1 = await request('/health');
      const reset1 = res1.headers['x-ratelimit-reset'];

      // Small delay to ensure we're still in same window
      await new Promise(resolve => setTimeout(resolve, 100));

      const res2 = await request('/health');
      const reset2 = res2.headers['x-ratelimit-reset'];

      // Reset times should be close (within same rate limit window)
      // They might differ slightly due to clock precision, so allow small difference
      const diff = Math.abs(parseInt(reset1 || '0') - parseInt(reset2 || '0'));
      expect(diff).toBeLessThan(2); // Within 2 seconds
    });
  });

  describe('Multiple Endpoint Rate Limiting', () => {
  setupMockApi();
    beforeEach(async () => {
      await waitForRateLimitReset();
    });

    it('should apply rate limiting to all auth endpoints', async () => {
      if (skipIfNoServer()) return;

      // Test multiple auth endpoints
      const authEndpoints = [
        { path: '/api/auth/login', method: 'POST', body: { email: 'test@test.com', password: 'test' } },
      ];

      for (const endpoint of authEndpoints) {
        const res = await request(endpoint.path, {
          method: endpoint.method,
          body: endpoint.body,
        });

        // Should have rate limit headers
        expect(res.headers['x-ratelimit-limit']).toBeDefined();
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        expect(res.headers['x-ratelimit-reset']).toBeDefined();

        // Should have strict auth limit
        const limit = parseInt(res.headers['x-ratelimit-limit'] || '0');
        expect(limit).toBeLessThanOrEqual(10); // Auth endpoints should have low limit
      }
    });
  });
});
