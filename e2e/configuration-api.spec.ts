/**
 * Configuration API E2E Tests
 * Tests the configuration endpoints against a running API server
 */
import { test, expect } from '@playwright/test';

// API base URL - adjust for your environment
const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

// Test tenant ID
const TEST_TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

// Helper to make API requests
async function apiRequest(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
    headers?: Record<string, string>;
  } = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': TEST_TENANT_ID,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return {
    status: response.status,
    data: await response.json().catch(() => null),
  };
}

test.describe('Configuration API E2E Tests', () => {
  // =========================================================================
  // Categories Tests
  // =========================================================================

  test.describe('Categories Endpoints', () => {
    test('GET /api/categories should return all categories', async () => {
      const response = await apiRequest('/api/categories');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);

      // Check category structure
      const category = response.data.data[0];
      expect(category).toHaveProperty('code');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('enabled');
    });

    test('GET /api/categories with includeSubcategories should include subcategories', async () => {
      const response = await apiRequest('/api/categories?includeSubcategories=true');

      expect(response.status).toBe(200);
      const categoryWithSubs = response.data.data.find(
        (c: any) => c.subcategories && c.subcategories.length > 0
      );

      if (categoryWithSubs) {
        expect(Array.isArray(categoryWithSubs.subcategories)).toBe(true);
        expect(categoryWithSubs.subcategories[0]).toHaveProperty('code');
      }
    });

    test('GET /api/categories/:code should return specific category', async () => {
      const response = await apiRequest('/api/categories/LOKALER_OG_BANER');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('code', 'LOKALER_OG_BANER');
      expect(response.data.data).toHaveProperty('name');
    });

    test('GET /api/categories/:code should return 404 for non-existent category', async () => {
      const response = await apiRequest('/api/categories/NONEXISTENT_CATEGORY');

      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
    });

    test('GET /api/categories/:code/subcategories should return subcategories', async () => {
      const response = await apiRequest('/api/categories/LOKALER_OG_BANER/subcategories');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  // =========================================================================
  // Time Modes Tests
  // =========================================================================

  test.describe('Time Modes Endpoints', () => {
    test('GET /api/time-modes should return all time modes', async () => {
      const response = await apiRequest('/api/time-modes');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);

      // Check time mode structure
      const timeMode = response.data.data[0];
      expect(timeMode).toHaveProperty('code');
      expect(timeMode).toHaveProperty('name');
    });

    test('GET /api/time-modes/:code should return specific time mode', async () => {
      const response = await apiRequest('/api/time-modes/SLOT');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('code', 'SLOT');
    });

    test('GET /api/time-modes/:code should return 404 for non-existent time mode', async () => {
      const response = await apiRequest('/api/time-modes/NONEXISTENT');

      expect(response.status).toBe(404);
    });
  });

  // =========================================================================
  // Pricing Units Tests
  // =========================================================================

  test.describe('Pricing Units Endpoints', () => {
    test('GET /api/pricing-units should return all pricing units', async () => {
      const response = await apiRequest('/api/pricing-units');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);

      // Check pricing unit structure
      const pricingUnit = response.data.data[0];
      expect(pricingUnit).toHaveProperty('code');
      expect(pricingUnit).toHaveProperty('name');
      expect(pricingUnit).toHaveProperty('symbol');
    });

    test('GET /api/pricing-units/:code should return specific pricing unit', async () => {
      const response = await apiRequest('/api/pricing-units/HOUR');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('code', 'HOUR');
    });
  });

  // =========================================================================
  // Statuses Tests
  // =========================================================================

  test.describe('Statuses Endpoints', () => {
    test('GET /api/statuses/rental-object should return rental object statuses', async () => {
      const response = await apiRequest('/api/statuses/rental-object');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('GET /api/statuses/booking should return booking statuses', async () => {
      const response = await apiRequest('/api/statuses/booking');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  // =========================================================================
  // Schema Enum Tests
  // =========================================================================

  test.describe('Schema Enum Endpoints', () => {
    test('GET /api/schema/enums should return all valid enum values', async () => {
      const response = await apiRequest('/api/schema/enums');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');

      const enums = response.data.data;
      expect(enums).toHaveProperty('categories');
      expect(enums).toHaveProperty('timeModes');
      expect(enums).toHaveProperty('pricingUnits');
      expect(enums).toHaveProperty('rentalObjectStatuses');
      expect(enums).toHaveProperty('bookingStatuses');

      // Validate arrays
      expect(Array.isArray(enums.categories)).toBe(true);
      expect(Array.isArray(enums.timeModes)).toBe(true);
      expect(Array.isArray(enums.pricingUnits)).toBe(true);

      // Validate expected values
      expect(enums.categories).toContain('LOKALER_OG_BANER');
      expect(enums.timeModes).toContain('SLOT');
      expect(enums.pricingUnits).toContain('HOUR');
    });
  });

  // =========================================================================
  // Integrations Tests
  // =========================================================================

  test.describe('Integrations Endpoints', () => {
    test('GET /api/configuration/integrations should return integrations for tenant', async () => {
      const response = await apiRequest('/api/configuration/integrations');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('GET /api/configuration/integrations should fail without tenant ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/configuration/integrations`, {
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // Validation Integration Tests
  // =========================================================================

  test.describe('Schema Validation Integration', () => {
    test('Category codes from /api/schema/enums should match /api/categories', async () => {
      const [enumsResponse, categoriesResponse] = await Promise.all([
        apiRequest('/api/schema/enums'),
        apiRequest('/api/categories'),
      ]);

      expect(enumsResponse.status).toBe(200);
      expect(categoriesResponse.status).toBe(200);

      const enumCodes = enumsResponse.data.data.categories;
      const categoryCodes = categoriesResponse.data.data.map((c: any) => c.code);

      // All enum codes should exist in categories
      for (const code of enumCodes) {
        expect(categoryCodes).toContain(code);
      }
    });

    test('Time mode codes from /api/schema/enums should match /api/time-modes', async () => {
      const [enumsResponse, timeModesResponse] = await Promise.all([
        apiRequest('/api/schema/enums'),
        apiRequest('/api/time-modes'),
      ]);

      expect(enumsResponse.status).toBe(200);
      expect(timeModesResponse.status).toBe(200);

      const enumCodes = enumsResponse.data.data.timeModes;
      const timeModeCodes = timeModesResponse.data.data.map((t: any) => t.code);

      for (const code of enumCodes) {
        expect(timeModeCodes).toContain(code);
      }
    });
  });

  // =========================================================================
  // Public Categories Tests
  // =========================================================================

  test.describe('Public Categories Endpoint', () => {
    test('GET /api/public/categories should return categories (no auth required)', async () => {
      const response = await fetch(`${API_BASE_URL}/api/public/categories`, {
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // =========================================================================
  // Health Check
  // =========================================================================

  test.describe('API Health', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
    });
  });
});
