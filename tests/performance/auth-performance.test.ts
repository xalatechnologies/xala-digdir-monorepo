/**
 * Authentication Performance Tests
 *
 * Performance benchmarks for authentication and RBAC operations:
 * - Login latency
 * - Session validation speed
 * - Concurrent authentication requests
 * - RBAC check performance
 * - Logout latency
 * - Cookie parsing overhead
 *
 * Performance targets:
 * - P50: < 100ms for session validation
 * - P95: < 200ms for session validation
 * - P99: < 500ms for session validation
 * - Login: < 1000ms end-to-end
 * - Logout: < 500ms end-to-end
 * - Concurrent requests: 100 req/s without errors
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

const SKIP_INTEGRATION = process.env.CI !== 'true';
const describeOrSkip = SKIP_INTEGRATION ? describe.skip : describe;

// Original import:
// import { describe, it, expect, beforeAll } from 'vitest';
import type { TestContext } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const TEST_TENANT_ID = 'test-tenant';

/**
 * Performance measurement helper
 */
async function measureLatency<T>(
  fn: () => Promise<T>,
  iterations: number = 1
): Promise<{ avg: number; p50: number; p95: number; p99: number; results: T[] }> {
  const latencies: number[] = [];
  const results: T[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    latencies.push(end - start);
    results.push(result);
  }

  latencies.sort((a, b) => a - b);

  return {
    avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p95: latencies[Math.floor(latencies.length * 0.95)],
    p99: latencies[Math.floor(latencies.length * 0.99)],
    results,
  };
}

describeOrSkip('Authentication Performance Tests', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    // Create initial session for validation tests
    const response = await fetch(`${API_URL}/api/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'admin',
        tenantId: TEST_TENANT_ID,
      }),
    });

    sessionCookie = response.headers.get('set-cookie') || '';
  });

  describe('Login Performance', () => {
    it('should complete login within 1 second (P95)', async () => {
      const stats = await measureLatency(
        async () => {
          const response = await fetch(`${API_URL}/api/auth/test-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'admin',
              tenantId: TEST_TENANT_ID,
            }),
          });
          return response.ok;
        },
        20
      );

      console.log('Login latency:', stats);
      expect(stats.p95).toBeLessThan(1000);
      expect(stats.avg).toBeLessThan(500);
    });

    it('should handle concurrent logins without degradation', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch(`${API_URL}/api/auth/test-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'admin',
            tenantId: TEST_TENANT_ID,
          }),
        })
      );

      const start = performance.now();
      const responses = await Promise.all(promises);
      const end = performance.now();

      const allSuccessful = responses.every(r => r.ok);
      expect(allSuccessful).toBe(true);

      const totalTime = end - start;
      const avgTime = totalTime / concurrentRequests;
      console.log(`Concurrent logins (${concurrentRequests}):`, {
        totalTime,
        avgTime,
      });

      // Should handle all requests within reasonable time
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Session Validation Performance', () => {
    it('should validate session in < 100ms (P50)', async () => {
      const stats = await measureLatency(
        async () => {
          const response = await fetch(`${API_URL}/api/auth/session`, {
            headers: {
              Cookie: sessionCookie,
            },
          });
          return response.ok;
        },
        50
      );

      console.log('Session validation latency:', stats);
      expect(stats.p50).toBeLessThan(100);
      expect(stats.p95).toBeLessThan(200);
      expect(stats.p99).toBeLessThan(500);
    });

    it('should handle high-frequency session validations', async () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        await fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: sessionCookie,
          },
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      console.log(`High-frequency validation (${iterations} requests):`, {
        totalTime,
        avgTime,
        throughput: (iterations / totalTime) * 1000,
      });

      expect(avgTime).toBeLessThan(200);
    });

    it('should maintain performance under concurrent session validations', async () => {
      const concurrentRequests = 50;
      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: sessionCookie,
          },
        })
      );

      const start = performance.now();
      const responses = await Promise.all(promises);
      const end = performance.now();

      const allSuccessful = responses.every(r => r.ok);
      expect(allSuccessful).toBe(true);

      const totalTime = end - start;
      const avgTime = totalTime / concurrentRequests;
      console.log(`Concurrent validations (${concurrentRequests}):`, {
        totalTime,
        avgTime,
        throughput: (concurrentRequests / totalTime) * 1000,
      });

      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('RBAC Permission Check Performance', () => {
    it('should retrieve permissions quickly', async () => {
      const stats = await measureLatency(
        async () => {
          const response = await fetch(`${API_URL}/api/auth/session`, {
            headers: {
              Cookie: sessionCookie,
            },
          });
          const data = await response.json();
          return data.data.permissions;
        },
        30
      );

      console.log('Permission retrieval latency:', stats);
      expect(stats.avg).toBeLessThan(150);
      expect(stats.p95).toBeLessThan(300);
    });

    it('should handle permission checks for all roles efficiently', async () => {
      const roles = ['admin', 'saksbehandler', 'user', 'citizen'];
      const sessions = new Map<string, string>();

      // Create sessions for all roles
      for (const role of roles) {
        const response = await fetch(`${API_URL}/api/auth/test-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role,
            tenantId: TEST_TENANT_ID,
          }),
        });
        sessions.set(role, response.headers.get('set-cookie') || '');
      }

      // Measure permission checks for each role
      const start = performance.now();
      for (const [role, cookie] of sessions.entries()) {
        await fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: cookie,
          },
        });
      }
      const end = performance.now();

      const avgTime = (end - start) / roles.length;
      console.log('Per-role permission check:', { avgTime });

      expect(avgTime).toBeLessThan(200);
    });
  });

  describe('Logout Performance', () => {
    it('should complete logout within 500ms (P95)', async () => {
      // Create multiple sessions for logout testing
      const sessions: string[] = [];
      for (let i = 0; i < 20; i++) {
        const response = await fetch(`${API_URL}/api/auth/test-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'admin',
            tenantId: TEST_TENANT_ID,
          }),
        });
        sessions.push(response.headers.get('set-cookie') || '');
      }

      const stats = await measureLatency(
        async () => {
          const cookie = sessions.pop();
          const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Cookie: cookie || '',
            },
          });
          return response.ok;
        },
        20
      );

      console.log('Logout latency:', stats);
      expect(stats.p95).toBeLessThan(500);
      expect(stats.avg).toBeLessThan(300);
    });
  });

  describe('Cookie Parsing Overhead', () => {
    it('should parse session cookie efficiently', async () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        await fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: sessionCookie,
          },
        });
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      console.log('Cookie parsing overhead:', { avgTime });
      expect(avgTime).toBeLessThan(100);
    });

    it('should handle large cookie headers without degradation', async () => {
      // Create cookie header with multiple cookies
      const largeCookieHeader = `${sessionCookie}; other_cookie_1=value1; other_cookie_2=value2; other_cookie_3=value3`;

      const stats = await measureLatency(
        async () => {
          const response = await fetch(`${API_URL}/api/auth/session`, {
            headers: {
              Cookie: largeCookieHeader,
            },
          });
          return response.ok;
        },
        30
      );

      console.log('Large cookie header parsing:', stats);
      expect(stats.avg).toBeLessThan(150);
    });
  });

  describe('Database Query Performance', () => {
    it('should retrieve user data efficiently', async () => {
      const stats = await measureLatency(
        async () => {
          const response = await fetch(`${API_URL}/api/auth/session`, {
            headers: {
              Cookie: sessionCookie,
            },
          });
          const data = await response.json();
          return data.data.user;
        },
        50
      );

      console.log('User data retrieval:', stats);
      expect(stats.avg).toBeLessThan(100);
      expect(stats.p95).toBeLessThan(200);
    });
  });

  describe('Throughput Tests', () => {
    it('should handle 100 requests per second', async () => {
      const duration = 5000; // 5 seconds
      const targetRps = 100;
      const expectedRequests = (duration / 1000) * targetRps;

      let completedRequests = 0;
      let errors = 0;

      const start = Date.now();
      const promises: Promise<void>[] = [];

      while (Date.now() - start < duration) {
        const promise = fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: sessionCookie,
          },
        })
          .then(response => {
            if (response.ok) completedRequests++;
            else errors++;
          })
          .catch(() => {
            errors++;
          });

        promises.push(promise);

        // Wait to maintain target RPS
        await new Promise(resolve => setTimeout(resolve, 1000 / targetRps));
      }

      await Promise.all(promises);

      const actualRps = completedRequests / (duration / 1000);
      const errorRate = errors / (completedRequests + errors);

      console.log('Throughput test:', {
        completedRequests,
        errors,
        actualRps,
        errorRate,
      });

      expect(actualRps).toBeGreaterThan(80); // Allow 20% variance
      expect(errorRate).toBeLessThan(0.01); // < 1% error rate
    });
  });

  describe('Resource Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const iterations = 1000;

      // Measure initial memory (if available)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      for (let i = 0; i < iterations; i++) {
        await fetch(`${API_URL}/api/auth/session`, {
          headers: {
            Cookie: sessionCookie,
          },
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log('Memory usage:', {
        initialMemory,
        finalMemory,
        memoryIncrease,
      });

      // Memory increase should be minimal (< 10MB)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});
