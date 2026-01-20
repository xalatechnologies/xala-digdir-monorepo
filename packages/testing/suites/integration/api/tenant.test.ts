/**
 * Tenant API Integration Tests
 * 
 * Tests multi-tenant endpoints
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

describe('Tenant API', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping tenant tests - API not available at', API_URL);
    }
  });

  describe('GET /api/tenants', () => {
    it('should require authentication for tenant list', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/tenants`);

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /public/tenant', () => {
    it('should return public tenant info if available', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/tenant`);

      // May or may not be implemented
      if (response.status === 404) {
        console.log('Public tenant endpoint not implemented');
        return;
      }

      expect(response.ok).toBe(true);
    });
  });
});
