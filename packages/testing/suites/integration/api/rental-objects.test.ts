/**
 * Rental Objects API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Objects API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects', () => {
    it('should return list', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.meta).toBeDefined();
    });

    it('should support limit parameter', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?limit=5`);
      expect(response.ok).toBe(true);
    });

    it('should support offset parameter', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?offset=0`);
      expect(response.ok).toBe(true);
    });

    it('should include meta pagination info', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      const data = await response.json();
      
      expect(data.meta).toBeDefined();
      expect(data.meta.total).toBeDefined();
    });
  });

  describe('GET /api/rental-objects/:id', () => {
    it('should return 404 for non-existent ID', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000`);
      expect([404, 400]).toContain(response.status);
    });
  });
});
