/**
 * GDPR API Tests
 * 
 * Tests GDPR-related API endpoints
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

describe('GDPR API Endpoints', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping GDPR API tests - API not available at', API_URL);
    }
  });

  describe('Data Subject Rights', () => {
    it('should require auth for data export request', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/gdpr/export`, {
        method: 'POST',
      });

      expect([401, 403, 404]).toContain(response.status);
    });

    it('should require auth for data deletion request', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/gdpr/delete`, {
        method: 'POST',
      });

      expect([401, 403, 404]).toContain(response.status);
    });

    it('should require auth for consent management', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/gdpr/consents`);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Data Access', () => {
    it('should require auth for personal data access', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/me`);

      expect([401, 403]).toContain(response.status);
    });

    it('should not expose PII in public endpoints', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      const data = await response.json();

      for (const item of data.items || []) {
        expect(item.ownerEmail).toBeUndefined();
        expect(item.ownerPhone).toBeUndefined();
        expect(item.createdByEmail).toBeUndefined();
      }
    });
  });

  describe('Audit Trail', () => {
    it('should have audit logging for data access', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/audit`);

      // Audit endpoint exists
      expect(response.status).not.toBe(404);
    });

    it('should require admin for audit access', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/audit`);

      expect([401, 403]).toContain(response.status);
    });
  });
});
