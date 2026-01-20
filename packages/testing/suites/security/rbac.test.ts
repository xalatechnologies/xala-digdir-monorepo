/**
 * RBAC Security Tests
 * 
 * Tests role-based access control enforcement
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

describe('RBAC Security', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping RBAC tests - API not available at', API_URL);
    }
  });

  describe('Admin Endpoints', () => {
    it('should reject unauthenticated access to admin routes', async () => {
      if (!apiAvailable) return;

      const adminEndpoints = [
        '/api/tenants',
        '/api/users',
        '/api/audit',
      ];

      for (const endpoint of adminEndpoints) {
        const response = await fetch(`${API_URL}${endpoint}`);
        expect([401, 403]).toContain(response.status);
      }
    });
  });

  describe('Booking Endpoints', () => {
    it('should reject unauthenticated booking creation', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
        }),
      });

      expect([401, 403]).toContain(response.status);
    });

    it('should reject unauthenticated booking cancellation', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/cancel`, {
        method: 'POST',
      });

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Organization Endpoints', () => {
    it('should reject unauthenticated org management', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/organizations`);

      expect([401, 403]).toContain(response.status);
    });
  });
});
