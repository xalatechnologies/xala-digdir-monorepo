/**
 * Rental Objects API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Objects API', () => {
  beforeAll(async () => {
    // Verify API is running
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /public/rental-objects', () => {
    it('should return paginated list', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects?limit=5`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.items.length).toBeLessThanOrEqual(5);
    });

    it('should support offset parameter', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects?offset=0`);
      expect(response.ok).toBe(true);
    });

    it('should support category filter', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects?category=meeting-room`);
      expect(response.ok).toBe(true);
    });

    it('should return rental object structure', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects?limit=1`);
      const data = await response.json();
      
      if (data.items.length > 0) {
        const item = data.items[0];
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
      }
    });
  });

  describe('GET /public/rental-objects/:id', () => {
    it('should return 404 for non-existent ID', async () => {
      const response = await fetch(`${API_URL}/public/rental-objects/00000000-0000-0000-0000-000000000000`);
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('GET /public/categories', () => {
    it('should return categories list', async () => {
      const response = await fetch(`${API_URL}/public/categories`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
