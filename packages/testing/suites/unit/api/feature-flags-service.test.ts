/**
 * Feature Flags Service Tests
 * Unit tests for tenant feature access control
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeatureFlagsService } from '@xala/api/services/feature-flags.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let mockDb: any;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    slug: 'test-tenant',
    enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT'],
    featureFlags: {
      'backoffice.orgManagement': true,
      'backoffice.reporting': false,
      'web.ratings': true,
    },
  };

  beforeEach(() => {
    mockDb = {
      query: {
        tenants: {
          findFirst: vi.fn().mockResolvedValue(mockTenant),
        },
      },
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };

    service = new FeatureFlagsService(mockDb as unknown as NodePgDatabase<any>);
  });

  describe('getTenantFeatures', () => {
    it('should return tenant features', async () => {
      const result = await service.getTenantFeatures('tenant-123');

      expect(result).toEqual({
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT'],
        featureFlags: {
          'backoffice.orgManagement': true,
          'backoffice.reporting': false,
          'web.ratings': true,
        },
      });
    });

    it('should throw error if tenant not found', async () => {
      mockDb.query.tenants.findFirst.mockResolvedValue(null);

      await expect(service.getTenantFeatures('invalid-id')).rejects.toThrow('Tenant not found');
    });

    it('should use default categories if none set', async () => {
      mockDb.query.tenants.findFirst.mockResolvedValue({
        ...mockTenant,
        enabledRentalObjectCategories: null,
      });

      const result = await service.getTenantFeatures('tenant-123');

      expect(result.enabledRentalObjectCategories).toEqual(['LOCALE', 'ARRANGEMENT']);
    });

    it('should use empty object if no feature flags set', async () => {
      mockDb.query.tenants.findFirst.mockResolvedValue({
        ...mockTenant,
        featureFlags: null,
      });

      const result = await service.getTenantFeatures('tenant-123');

      expect(result.featureFlags).toEqual({});
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', async () => {
      const result = await service.isFeatureEnabled('tenant-123', 'backoffice.orgManagement');

      expect(result).toBe(true);
    });

    it('should return false for disabled feature', async () => {
      const result = await service.isFeatureEnabled('tenant-123', 'backoffice.reporting');

      expect(result).toBe(false);
    });

    it('should return false for non-existent feature', async () => {
      const result = await service.isFeatureEnabled('tenant-123', 'nonexistent.feature');

      expect(result).toBe(false);
    });
  });

  describe('isCategoryEnabled', () => {
    it('should return true for enabled category', async () => {
      const result = await service.isCategoryEnabled('tenant-123', 'LOCALE');

      expect(result).toBe(true);
    });

    it('should return false for disabled category', async () => {
      const result = await service.isCategoryEnabled('tenant-123', 'EQUIPMENT');

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const result = await service.isCategoryEnabled('tenant-123', 'locale');

      expect(result).toBe(false);
    });
  });

  describe('getEnabledCategories', () => {
    it('should return all enabled categories', async () => {
      const result = await service.getEnabledCategories('tenant-123');

      expect(result).toEqual(['LOCALE', 'ARRANGEMENT']);
    });
  });

  describe('requireFeature', () => {
    it('should not throw for enabled feature', async () => {
      await expect(
        service.requireFeature('tenant-123', 'backoffice.orgManagement')
      ).resolves.not.toThrow();
    });

    it('should throw for disabled feature', async () => {
      await expect(
        service.requireFeature('tenant-123', 'backoffice.reporting')
      ).rejects.toMatchObject({
        statusCode: 403,
        type: 'https://api.digilist.no/errors/feature-disabled',
        title: 'Feature Disabled',
      });
    });

    it('should include feature key in error message', async () => {
      try {
        await service.requireFeature('tenant-123', 'backoffice.reporting');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.detail).toContain('backoffice.reporting');
      }
    });
  });

  describe('requireCategory', () => {
    it('should not throw for enabled category', async () => {
      await expect(
        service.requireCategory('tenant-123', 'LOCALE')
      ).resolves.not.toThrow();
    });

    it('should throw for disabled category', async () => {
      await expect(
        service.requireCategory('tenant-123', 'EQUIPMENT')
      ).rejects.toMatchObject({
        statusCode: 403,
        type: 'https://api.digilist.no/errors/category-disabled',
        title: 'Category Disabled',
      });
    });

    it('should include category in error message', async () => {
      try {
        await service.requireCategory('tenant-123', 'EQUIPMENT');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.detail).toContain('EQUIPMENT');
      }
    });
  });

  describe('updateTenantFeatures', () => {
    it('should update feature flags', async () => {
      const updates = {
        featureFlags: {
          'backoffice.reporting': true,
        },
      };

      await service.updateTenantFeatures('tenant-123', updates);

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should merge feature flags with existing', async () => {
      const updates = {
        featureFlags: {
          'backoffice.reporting': true,
          'web.feedback': true,
        },
      };

      await service.updateTenantFeatures('tenant-123', updates);

      const updateCall = mockDb.update().set;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          featureFlags: expect.objectContaining({
            'backoffice.orgManagement': true,
            'backoffice.reporting': true,
            'web.ratings': true,
            'web.feedback': true,
          }),
        })
      );
    });

    it('should update enabled categories', async () => {
      const updates = {
        enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT', 'EQUIPMENT'],
      };

      await service.updateTenantFeatures('tenant-123', updates);

      const updateCall = mockDb.update().set;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT', 'EQUIPMENT'],
        })
      );
    });

    it('should set updatedAt timestamp', async () => {
      const updates = {
        featureFlags: { 'test.feature': true },
      };

      await service.updateTenantFeatures('tenant-123', updates);

      const updateCall = mockDb.update().set;
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should return updated features', async () => {
      const updates = {
        featureFlags: { 'backoffice.reporting': true },
      };

      const result = await service.updateTenantFeatures('tenant-123', updates);

      expect(result.tenantId).toBe('tenant-123');
      expect(result.featureFlags).toBeDefined();
    });
  });
});
