/**
 * Configuration Repository Unit Tests
 * Tests database operations with mocked Drizzle database
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigurationRepository } from '../../../src/modules/configuration/configuration.repository';
import { createMockDb, setupTestHooks } from '../../setup';

describe('ConfigurationRepository', () => {
  let repository: ConfigurationRepository;
  let mockDb: ReturnType<typeof createMockDb>;

  setupTestHooks();

  // Mock data
  const mockCategory = {
    id: 'cat-1',
    code: 'LOKALER_OG_BANER',
    name: 'Lokaler og baner',
    nameEn: 'Spaces and venues',
    description: 'Physical spaces for rent',
    icon: 'building',
    sortOrder: 1,
    enabled: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubcategory = {
    id: 'subcat-1',
    categoryId: 'cat-1',
    code: 'IDRETTSHALL',
    name: 'Idrettshall',
    nameEn: 'Sports hall',
    sortOrder: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeMode = {
    id: 'tm-1',
    code: 'SLOT',
    name: 'Timeslot',
    nameEn: 'Time slot',
    description: 'Book specific time slots',
    icon: 'clock',
    sortOrder: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPricingUnit = {
    id: 'pu-1',
    code: 'HOUR',
    name: 'Per time',
    nameEn: 'Per hour',
    symbol: 'kr/t',
    sortOrder: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDb = createMockDb();
    repository = new ConfigurationRepository(mockDb);
  });

  // =========================================================================
  // Category Tests
  // =========================================================================

  describe('findAllCategories', () => {
    it('should query all enabled categories by default', async () => {
      // Setup mock to return categories
      mockDb.orderBy.mockResolvedValue([mockCategory]);

      const result = await repository.findAllCategories();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should query all categories when enabledOnly is false', async () => {
      mockDb.orderBy.mockResolvedValue([mockCategory, { ...mockCategory, id: 'cat-2', enabled: false }]);

      const result = await repository.findAllCategories(false);

      expect(result).toHaveLength(2);
    });
  });

  describe('findCategoryByCode', () => {
    it('should find category by code', async () => {
      mockDb.limit.mockResolvedValue([mockCategory]);

      const result = await repository.findCategoryByCode('LOKALER_OG_BANER');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('LOKALER_OG_BANER');
    });

    it('should return null when category not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findCategoryByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('findCategoryById', () => {
    it('should find category by id', async () => {
      mockDb.limit.mockResolvedValue([mockCategory]);

      const result = await repository.findCategoryById('cat-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('cat-1');
    });

    it('should return null when category not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findCategoryById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createCategory', () => {
    it('should create category and return it', async () => {
      const newCategory = {
        code: 'NEW_CAT',
        name: 'New Category',
        sortOrder: 5,
      };
      mockDb.returning.mockResolvedValue([{ id: 'new-id', ...newCategory }]);

      const result = await repository.createCategory(newCategory);

      expect(result.code).toBe('NEW_CAT');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update category and return it', async () => {
      const updateData = { name: 'Updated Name' };
      mockDb.returning.mockResolvedValue([{ ...mockCategory, ...updateData }]);

      const result = await repository.updateCategory('cat-1', updateData);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
    });

    it('should return null when category not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await repository.updateCategory('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category and return true', async () => {
      mockDb.returning.mockResolvedValue([mockCategory]);

      const result = await repository.deleteCategory('cat-1');

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return false when category not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await repository.deleteCategory('nonexistent');

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // Subcategory Tests
  // =========================================================================

  describe('findSubcategoriesByCategory', () => {
    it('should find all subcategories for a category', async () => {
      mockDb.orderBy.mockResolvedValue([mockSubcategory]);

      const result = await repository.findSubcategoriesByCategory('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBe('cat-1');
    });
  });

  describe('findSubcategoryByCode', () => {
    it('should find subcategory by category and code', async () => {
      mockDb.limit.mockResolvedValue([mockSubcategory]);

      const result = await repository.findSubcategoryByCode('cat-1', 'IDRETTSHALL');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('IDRETTSHALL');
    });

    it('should return null when subcategory not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findSubcategoryByCode('cat-1', 'NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('createSubcategory', () => {
    it('should create subcategory and return it', async () => {
      const newSubcategory = {
        categoryId: 'cat-1',
        code: 'NEW_SUB',
        name: 'New Subcategory',
        sortOrder: 5,
      };
      mockDb.returning.mockResolvedValue([{ id: 'new-id', ...newSubcategory }]);

      const result = await repository.createSubcategory(newSubcategory);

      expect(result.code).toBe('NEW_SUB');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Time Mode Tests
  // =========================================================================

  describe('findAllTimeModes', () => {
    it('should query all enabled time modes', async () => {
      mockDb.orderBy.mockResolvedValue([mockTimeMode]);

      const result = await repository.findAllTimeModes();

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('SLOT');
    });
  });

  describe('findTimeModeByCode', () => {
    it('should find time mode by code', async () => {
      mockDb.limit.mockResolvedValue([mockTimeMode]);

      const result = await repository.findTimeModeByCode('SLOT');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('SLOT');
    });

    it('should return null when time mode not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findTimeModeByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // Pricing Unit Tests
  // =========================================================================

  describe('findAllPricingUnits', () => {
    it('should query all enabled pricing units', async () => {
      mockDb.orderBy.mockResolvedValue([mockPricingUnit]);

      const result = await repository.findAllPricingUnits();

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('HOUR');
    });
  });

  describe('findPricingUnitByCode', () => {
    it('should find pricing unit by code', async () => {
      mockDb.limit.mockResolvedValue([mockPricingUnit]);

      const result = await repository.findPricingUnitByCode('HOUR');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('HOUR');
    });

    it('should return null when pricing unit not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findPricingUnitByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // Status Tests
  // =========================================================================

  describe('findAllRentalObjectStatuses', () => {
    it('should query all rental object statuses', async () => {
      const mockStatus = { id: 'status-1', code: 'DRAFT', name: 'Draft', enabled: true };
      mockDb.orderBy.mockResolvedValue([mockStatus]);

      const result = await repository.findAllRentalObjectStatuses();

      expect(result).toHaveLength(1);
    });
  });

  describe('findAllBookingStatuses', () => {
    it('should query all booking statuses', async () => {
      const mockStatus = { id: 'status-1', code: 'PENDING', name: 'Pending', enabled: true };
      mockDb.orderBy.mockResolvedValue([mockStatus]);

      const result = await repository.findAllBookingStatuses();

      expect(result).toHaveLength(1);
    });
  });

  // =========================================================================
  // System Configuration Tests
  // =========================================================================

  describe('findAllConfigurations', () => {
    it('should query all configurations without tenant filter', async () => {
      const mockConfig = { id: 'config-1', key: 'app.name', value: 'Test App' };
      mockDb.orderBy.mockResolvedValue([mockConfig]);

      const result = await repository.findAllConfigurations();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
    });

    it('should filter by tenant when provided', async () => {
      const mockConfig = { id: 'config-1', key: 'app.name', value: 'Test App', tenantId: 'tenant-1' };
      mockDb.orderBy.mockResolvedValue([mockConfig]);

      const result = await repository.findAllConfigurations('tenant-1');

      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('findConfiguration', () => {
    it('should find configuration by key', async () => {
      const mockConfig = { id: 'config-1', key: 'app.name', value: 'Test App' };
      mockDb.limit.mockResolvedValue([mockConfig]);

      const result = await repository.findConfiguration('app.name');

      expect(result).not.toBeNull();
      expect(result?.key).toBe('app.name');
    });
  });

  // =========================================================================
  // Integration Tests
  // =========================================================================

  describe('listIntegrations', () => {
    it('should list all integrations for a tenant', async () => {
      const mockIntegration = {
        id: 'int-1',
        tenantId: 'tenant-1',
        provider: 'idporten',
        name: 'ID-porten',
        status: 'active',
        config: { clientId: 'test', clientSecret: 'secret' },
      };
      mockDb.orderBy.mockResolvedValue([mockIntegration]);

      const result = await repository.listIntegrations('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].provider).toBe('idporten');
      // Verify sensitive fields are masked
      expect(result[0].config.clientSecret).toBe('***');
    });
  });

  describe('getIntegration', () => {
    it('should get integration by tenant and provider', async () => {
      const mockIntegration = {
        id: 'int-1',
        tenantId: 'tenant-1',
        provider: 'idporten',
        name: 'ID-porten',
        status: 'active',
        config: { clientId: 'test', clientSecret: 'secret' },
      };
      mockDb.limit.mockResolvedValue([mockIntegration]);

      const result = await repository.getIntegration('tenant-1', 'idporten');

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('idporten');
    });

    it('should return null when integration not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.getIntegration('tenant-1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateIntegration', () => {
    it('should update integration and return it', async () => {
      const existingIntegration = {
        id: 'int-1',
        tenantId: 'tenant-1',
        provider: 'idporten',
        config: { clientId: 'test', clientSecret: 'secret' },
      };
      mockDb.limit.mockResolvedValue([existingIntegration]);
      mockDb.returning.mockResolvedValue([
        { ...existingIntegration, name: 'Updated Name' },
      ]);

      const result = await repository.updateIntegration('tenant-1', 'idporten', { name: 'Updated Name' });

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
    });

    it('should not overwrite masked values', async () => {
      const existingIntegration = {
        id: 'int-1',
        tenantId: 'tenant-1',
        provider: 'idporten',
        config: { clientId: 'test', clientSecret: 'real-secret' },
      };
      mockDb.limit.mockResolvedValue([existingIntegration]);
      mockDb.returning.mockResolvedValue([existingIntegration]);

      // Try to update with masked value
      await repository.updateIntegration('tenant-1', 'idporten', {
        config: { clientId: 'new-id', clientSecret: '***' },
      });

      // The set call should preserve the original secret
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe('maskSensitiveFields', () => {
    it('should mask sensitive fields in config', async () => {
      const mockIntegration = {
        id: 'int-1',
        tenantId: 'tenant-1',
        provider: 'vipps',
        config: {
          clientId: 'test-id',
          clientSecret: 'super-secret',
          apiKey: 'api-key-123',
          subscriptionKey: 'sub-key-456',
          webhookSecret: 'webhook-secret',
        },
      };
      mockDb.limit.mockResolvedValue([mockIntegration]);

      const result = await repository.getIntegration('tenant-1', 'vipps');

      expect(result?.config.clientId).toBe('test-id'); // Not masked
      expect(result?.config.clientSecret).toBe('***');
      expect(result?.config.apiKey).toBe('***');
      expect(result?.config.subscriptionKey).toBe('***');
      expect(result?.config.webhookSecret).toBe('***');
    });
  });
});
