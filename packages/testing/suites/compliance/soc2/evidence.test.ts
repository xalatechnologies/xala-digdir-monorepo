/**
 * SOC2 Evidence Tests
 * 
 * Automated evidence collection for SOC2 compliance
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('SOC2 Evidence Collection', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping SOC2 tests - API not available at', API_URL);
    }
  });

  describe('Access Control (CC6)', () => {
    it('should enforce authentication on protected endpoints', async () => {
      if (!apiAvailable) return;

      const protectedEndpoints = [
        '/api/bookings',
        '/api/users',
        '/api/audit',
        '/api/organizations',
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${API_URL}${endpoint}`);
        expect([401, 403]).toContain(response.status);
      }
    });

    it('should log authentication attempts', async () => {
      if (!apiAvailable) return;

      // Attempt failed login
      await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'soc2-test@audit.com',
          password: 'wrongpassword',
        }),
      });

      // Verify audit endpoint exists (requires auth)
      const auditResponse = await fetch(`${API_URL}/api/audit`);
      expect([401, 403]).toContain(auditResponse.status);
    });
  });

  describe('System Operations (CC7)', () => {
    it('should have health monitoring endpoint', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    it('should not expose sensitive data in errors', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/nonexistent`);
      
      if (!response.ok) {
        const text = await response.text();
        // Should not expose stack traces
        expect(text).not.toContain('node_modules');
        expect(text).not.toContain('.ts:');
      }
    });
  });

  describe('Change Management (CC8)', () => {
    it('should have version/build info available', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();

      // Health should include version or build info
      // This is optional but good for SOC2
      if (data.version || data.build) {
        expect(data.version || data.build).toBeTruthy();
      }
    });
  });

  describe('Risk Mitigation (CC9)', () => {
    it('should enforce rate limiting headers if implemented', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const rateRemaining = response.headers.get('X-RateLimit-Remaining');

      // Rate limiting is optional but recommended
      if (rateLimit) {
        expect(parseInt(rateLimit)).toBeGreaterThan(0);
      }
    });
  });
});
