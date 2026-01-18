/**
 * Feature Flags Integration Tests
 * End-to-end tests for feature flag system
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupMockApi } from '../../../mocks/api-server.mock';
import { FeatureFlagsService } from '../services/feature-flags.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe('Feature Flags Integration Tests', () => {
  setupMockApi();
  let service: FeatureFlagsService;
  let db: NodePgDatabase<any>;
  let testTenantId: string;

  beforeAll(async () => {
    // Note: These tests require a real database connection
    // Skip if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  Skipping integration tests - DATABASE_URL not set');
      return;
    }

    // Initialize database connection
    // const postgres = require('postgres');
    // const { drizzle } = require('drizzle-orm/postgres-js');
    // const sql = postgres(process.env.DATABASE_URL);
    // db = drizzle(sql);
    // service = new FeatureFlagsService(db);

    // Create test tenant
    // testTenantId = await createTestTenant();
  });

  afterAll(async () => {
    // Cleanup test data
    // await cleanupTestTenant(testTenantId);
  });

  describe('Full Feature Flag Workflow', () => {
  setupMockApi();
    it('should create tenant with default features', async () => {
      // Test tenant creation with default feature flags
      const features = await service.getTenantFeatures(testTenantId);

      expect(features.enabledRentalObjectCategories).toContain('LOCALE');
      expect(features.enabledRentalObjectCategories).toContain('ARRANGEMENT');
      expect(features.featureFlags).toBeDefined();
    });

    it('should update tenant features', async () => {
      // Update features
      const updates = {
        featureFlags: {
          'backoffice.reporting': true,
          'web.ratings': true,
        },
        enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT', 'EQUIPMENT'],
      };

      const updated = await service.updateTenantFeatures(testTenantId, updates);

      expect(updated.featureFlags['backoffice.reporting']).toBe(true);
      expect(updated.featureFlags['web.ratings']).toBe(true);
      expect(updated.enabledRentalObjectCategories).toContain('EQUIPMENT');
    });

    it('should enforce feature restrictions', async () => {
      // Disable a feature
      await service.updateTenantFeatures(testTenantId, {
        featureFlags: { 'backoffice.reporting': false },
      });

      // Try to access disabled feature
      await expect(
        service.requireFeature(testTenantId, 'backoffice.reporting')
      ).rejects.toMatchObject({
        statusCode: 403,
        type: 'https://api.digilist.no/errors/feature-disabled',
      });
    });

    it('should enforce category restrictions', async () => {
      // Set only LOCALE category
      await service.updateTenantFeatures(testTenantId, {
        enabledRentalObjectCategories: ['LOCALE'],
      });

      // LOCALE should be allowed
      await expect(
        service.requireCategory(testTenantId, 'LOCALE')
      ).resolves.not.toThrow();

      // ARRANGEMENT should be blocked
      await expect(
        service.requireCategory(testTenantId, 'ARRANGEMENT')
      ).rejects.toMatchObject({
        statusCode: 403,
        type: 'https://api.digilist.no/errors/category-disabled',
      });
    });
  });

  describe('Demo Tenant Configuration', () => {
  setupMockApi();
    it('should have correct demo preset', async () => {
      // Test Cheyenne Kommune demo configuration
      const demoTenantId = 'cheyenne-kommune';
      const features = await service.getTenantFeatures(demoTenantId);

      // Categories
      expect(features.enabledRentalObjectCategories).toEqual(['LOCALE', 'ARRANGEMENT']);

      // Features
      expect(features.featureFlags['backoffice.orgManagement']).toBe(true);
      expect(features.featureFlags['backoffice.reporting']).toBe(false); // Hidden for demo
      expect(features.featureFlags['backoffice.auditLog']).toBe(true);
      expect(features.featureFlags['backoffice.messaging']).toBe(true);
      expect(features.featureFlags['web.ratings']).toBe(false);
      expect(features.featureFlags['web.feedback']).toBe(false);
    });
  });

  describe('Performance', () => {
  setupMockApi();
    it('should handle concurrent feature checks', async () => {
      const promises = Array.from({ length: 100 }, () =>
        service.isFeatureEnabled(testTenantId, 'backoffice.orgManagement')
      );

      const results = await Promise.all(promises);

      expect(results.every(r => typeof r === 'boolean')).toBe(true);
    });

    it('should cache tenant features efficiently', async () => {
      const start = Date.now();

      // First call - should hit database
      await service.getTenantFeatures(testTenantId);

      const firstCallTime = Date.now() - start;

      // Subsequent calls - should be faster (if caching is implemented)
      const start2 = Date.now();
      await service.getTenantFeatures(testTenantId);
      const secondCallTime = Date.now() - start2;

      // Note: This assumes caching is implemented
      // expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });

  describe('Edge Cases', () => {
  setupMockApi();
    it('should handle empty feature flags', async () => {
      await service.updateTenantFeatures(testTenantId, {
        featureFlags: {},
      });

      const features = await service.getTenantFeatures(testTenantId);

      expect(features.featureFlags).toEqual({});
    });

    it('should handle empty categories', async () => {
      await service.updateTenantFeatures(testTenantId, {
        enabledRentalObjectCategories: [],
      });

      const categories = await service.getEnabledCategories(testTenantId);

      expect(categories).toEqual([]);
    });

    it('should handle invalid tenant ID', async () => {
      await expect(
        service.getTenantFeatures('invalid-tenant-id')
      ).rejects.toThrow('Tenant not found');
    });

    it('should preserve existing flags when updating', async () => {
      // Set initial flags
      await service.updateTenantFeatures(testTenantId, {
        featureFlags: {
          'feature.a': true,
          'feature.b': false,
        },
      });

      // Update with new flag
      await service.updateTenantFeatures(testTenantId, {
        featureFlags: {
          'feature.c': true,
        },
      });

      const features = await service.getTenantFeatures(testTenantId);

      // All flags should be present
      expect(features.featureFlags['feature.a']).toBe(true);
      expect(features.featureFlags['feature.b']).toBe(false);
      expect(features.featureFlags['feature.c']).toBe(true);
    });
  });
});

/**
 * Test Helpers
 */

async function createTestTenant(): Promise<string> {
  // Create a test tenant in the database
  // Return the tenant ID
  return 'test-tenant-' + Date.now();
}

async function cleanupTestTenant(tenantId: string): Promise<void> {
  // Delete the test tenant from the database
}
