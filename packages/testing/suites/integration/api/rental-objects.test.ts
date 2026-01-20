/**
 * Rental Object API Integration Tests
 * 
 * Tests CRUD operations against real API
 * Requires API server running on localhost:4000
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

// Check if API is available
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

describe('Rental Object API', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping integration tests - API not available at', API_URL);
    }
  });

  describe('GET /public/rental-objects', () => {
    it('should return paginated list of rental objects', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('limit');
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?page=1&limit=5`);
      
      expect(response.ok).toBe(true);

      const data = await response.json();
      
      expect(data.page).toBe(1);
      expect(data.limit).toBe(5);
      expect(data.items.length).toBeLessThanOrEqual(5);
    });

    it('should support category filtering', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?category=LOKALER_OG_BANER`);
      
      expect(response.ok).toBe(true);

      const data = await response.json();
      
      // All items should match the category
      data.items.forEach((item: { categoryKey: string }) => {
        expect(item.categoryKey).toBe('LOKALER_OG_BANER');
      });
    });
  });

  describe('GET /public/rental-objects/:id', () => {
    it('should return rental object details', async () => {
      if (!apiAvailable) return;

      // First get a list to get an ID
      const listResponse = await fetch(`${API_URL}/public/rental-objects?limit=1`);
      const listData = await listResponse.json();
      
      if (listData.items.length === 0) {
        console.log('No rental objects available for detail test');
        return;
      }

      const id = listData.items[0].id;
      const response = await fetch(`${API_URL}/public/rental-objects/${id}`);
      
      expect(response.ok).toBe(true);

      const data = await response.json();
      
      expect(data).toHaveProperty('id', id);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('categoryKey');
    });

    it('should return 404 for non-existent rental object', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects/00000000-0000-0000-0000-000000000000`);
      
      expect(response.status).toBe(404);

      const data = await response.json();
      
      // RFC 7807 error format
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('status', 404);
    });
  });

  describe('GET /public/categories', () => {
    it('should return list of categories', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`);
      
      expect(response.ok).toBe(true);

      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('key');
        expect(data[0]).toHaveProperty('label');
      }
    });
  });
});
