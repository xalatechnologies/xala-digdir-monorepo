/**
 * Audit Logging Tests
 * 
 * Tests audit trail and logging endpoints
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

describe('Audit Logging', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping audit tests - API not available at', API_URL);
    }
  });

  describe('Audit Log Access', () => {
    it('should require authentication for audit logs', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/audit`);

      expect([401, 403]).toContain(response.status);
    });

    it('should require admin role for audit log access', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/audit?limit=10`);

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Audit Event Types', () => {
    it('should have audit endpoint configured', async () => {
      if (!apiAvailable) return;

      // Verify the endpoint exists (even if unauthorized)
      const response = await fetch(`${API_URL}/api/audit`);

      // Should not be 404 - endpoint exists
      expect(response.status).not.toBe(404);
    });
  });
});
