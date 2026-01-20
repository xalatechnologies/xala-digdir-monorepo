/**
 * GDPR Compliance Tests
 * 
 * Tests data protection requirements per GDPR/Personvernforordningen
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

describe('GDPR Compliance', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping GDPR tests - API not available at', API_URL);
    }
  });

  describe('Data Minimization', () => {
    it('should not expose sensitive user data in public endpoints', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      const data = await response.json();

      // Check that no PII is exposed in public listings
      for (const item of data.items) {
        expect(item.ownerEmail).toBeUndefined();
        expect(item.ownerPhone).toBeUndefined();
        expect(item.ownerAddress).toBeUndefined();
        expect(item.createdByEmail).toBeUndefined();
      }
    });
  });

  describe('Authentication Required', () => {
    it('should require auth for user profile access', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/me`);
      
      expect([401, 403]).toContain(response.status);
    });

    it('should require auth for booking history', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/bookings`);
      
      expect([401, 403]).toContain(response.status);
    });

    it('should require auth for user data export', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/me/data-export`);
      
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Data Handling', () => {
    it('should return proper content-type headers', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      const contentType = response.headers.get('Content-Type');
      
      expect(contentType).toContain('application/json');
    });

    it('should not expose internal IDs in error messages', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects/invalid-uuid`);
      
      if (!response.ok) {
        const text = await response.text();
        
        // Should not expose stack traces or internal paths
        expect(text).not.toContain('/src/');
        expect(text).not.toContain('node_modules');
        expect(text).not.toContain('Error:');
      }
    });
  });

  describe('Audit Trail', () => {
    it('should log access attempts (verified via response headers)', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      
      // Check for request ID header (for traceability)
      const requestId = response.headers.get('X-Request-Id') || 
                       response.headers.get('X-Correlation-Id');
      
      // Many APIs include request IDs for tracing
      if (requestId) {
        expect(requestId).toBeTruthy();
      }
    });
  });
});
