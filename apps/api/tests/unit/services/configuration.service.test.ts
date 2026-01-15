/**
 * Configuration Service Unit Tests
 * Tests business logic with mocked repository
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigurationService } from '../../../src/modules/configuration/configuration.service';
import { createMockAdapters, setupTestHooks } from '../../setup';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let mockRepository: any;

  setupTestHooks();

  // Mock category data
  const mockCategories = [
    {
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
    },
    {
      id: 'cat-2',
      code: 'UTSTYR_OG_INVENTAR',
      name: 'Utstyr og inventar',
      nameEn: 'Equipment and inventory',
      description: 'Equipment for rent',
      icon: 'package',
      sortOrder: 2,
      enabled: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSubcategories = [
    {
      id: 'subcat-1',
      categoryId: 'cat-1',
      code: 'IDRETTSHALL',
      name: 'Idrettshall',
      nameEn: 'Sports hall',
      sortOrder: 1,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTimeModes = [
    {
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
    },
  ];

  const mockPricingUnits = [
    {
      id: 'pu-1',
      code: 'HOUR',
      name: 'Per time',
      nameEn: 'Per hour',
      symbol: 'kr/t',
      sortOrder: 1,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockRepository = {
      // Categories
      findAllCategories: vi.fn().mockResolvedValue(mockCategories),
      findCategoryByCode: vi.fn().mockImplementation((code: string) =>
        Promise.resolve(mockCategories.find((c) => c.code === code) || null)
      ),
      findCategoryById: vi.fn().mockImplementation((id: string) =>
        Promise.resolve(mockCategories.find((c) => c.id === id) || null)
      ),
      createCategory: vi.fn().mockImplementation((data: any) =>
        Promise.resolve({ id: 'new-cat-id', ...data, createdAt: new Date(), updatedAt: new Date() })
      ),
      updateCategory: vi.fn().mockImplementation((id: string, data: any) =>
        Promise.resolve({ ...mockCategories[0], ...data, updatedAt: new Date() })
      ),
      deleteCategory: vi.fn().mockResolvedValue(true),

      // Subcategories
      findSubcategoriesByCategory: vi.fn().mockResolvedValue(mockSubcategories),
      findSubcategoryByCode: vi.fn().mockImplementation((categoryId: string, code: string) =>
        Promise.resolve(mockSubcategories.find((s) => s.code === code) || null)
      ),
      createSubcategory: vi.fn().mockImplementation((data: any) =>
        Promise.resolve({ id: 'new-subcat-id', ...data, createdAt: new Date(), updatedAt: new Date() })
      ),
      updateSubcategory: vi.fn(),
      deleteSubcategory: vi.fn().mockResolvedValue(true),

      // Time modes
      findAllTimeModes: vi.fn().mockResolvedValue(mockTimeModes),
      findTimeModeByCode: vi.fn().mockImplementation((code: string) =>
        Promise.resolve(mockTimeModes.find((t) => t.code === code) || null)
      ),
      createTimeMode: vi.fn(),
      updateTimeMode: vi.fn(),
      deleteTimeMode: vi.fn().mockResolvedValue(true),

      // Pricing units
      findAllPricingUnits: vi.fn().mockResolvedValue(mockPricingUnits),
      findPricingUnitByCode: vi.fn().mockImplementation((code: string) =>
        Promise.resolve(mockPricingUnits.find((p) => p.code === code) || null)
      ),
      createPricingUnit: vi.fn(),
      updatePricingUnit: vi.fn(),
      deletePricingUnit: vi.fn().mockResolvedValue(true),

      // Statuses
      findAllRentalObjectStatuses: vi.fn().mockResolvedValue([]),
      findAllBookingStatuses: vi.fn().mockResolvedValue([]),

      // Configurations
      findAllConfigurations: vi.fn().mockResolvedValue([]),
      findConfiguration: vi.fn().mockResolvedValue(null),
      upsertConfiguration: vi.fn(),
      deleteConfiguration: vi.fn().mockResolvedValue(true),

      // Integrations
      listIntegrations: vi.fn().mockResolvedValue([]),
      getIntegration: vi.fn().mockResolvedValue(null),
      updateIntegration: vi.fn(),
      updateIntegrationStatus: vi.fn(),
    };

    service = new ConfigurationService(mockRepository);
  });

  // =========================================================================
  // Categories Tests
  // =========================================================================

  describe('getCategories', () => {
    it('should return all enabled categories', async () => {
      const result = await service.getCategories(false, true);

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('LOKALER_OG_BANER');
      expect(mockRepository.findAllCategories).toHaveBeenCalledWith(true);
    });

    it('should include subcategories when requested', async () => {
      const result = await service.getCategories(true, true);

      expect(result).toHaveLength(2);
      expect(mockRepository.findSubcategoriesByCategory).toHaveBeenCalled();
    });

    it('should return all categories including disabled when enabledOnly is false', async () => {
      await service.getCategories(false, false);

      expect(mockRepository.findAllCategories).toHaveBeenCalledWith(false);
    });
  });

  describe('getCategoryByCode', () => {
    it('should return category when found', async () => {
      const result = await service.getCategoryByCode('LOKALER_OG_BANER');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('LOKALER_OG_BANER');
    });

    it('should return null when category not found', async () => {
      const result = await service.getCategoryByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('createCategory', () => {
    it('should create category with valid data', async () => {
      const newCategory = {
        code: 'NEW_CATEGORY',
        name: 'New Category',
        nameEn: 'New Category EN',
        sortOrder: 3,
      };

      const result = await service.createCategory(newCategory);

      expect(result.code).toBe('NEW_CATEGORY');
      expect(mockRepository.createCategory).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update existing category', async () => {
      const updateData = { name: 'Updated Name' };

      const result = await service.updateCategory('cat-1', updateData);

      expect(result).not.toBeNull();
      expect(mockRepository.updateCategory).toHaveBeenCalledWith('cat-1', updateData);
    });

    it('should return null when category not found', async () => {
      mockRepository.findCategoryById.mockResolvedValue(null);
      mockRepository.updateCategory.mockResolvedValue(null);

      const result = await service.updateCategory('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('should delete existing category', async () => {
      const result = await service.deleteCategory('cat-1');

      expect(result).toBe(true);
      expect(mockRepository.deleteCategory).toHaveBeenCalledWith('cat-1');
    });

    it('should return false when category not found', async () => {
      mockRepository.deleteCategory.mockResolvedValue(false);

      const result = await service.deleteCategory('nonexistent');

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // Validation Helper Tests
  // =========================================================================

  describe('isValidCategoryCode', () => {
    it('should return true for valid enabled category', async () => {
      const result = await service.isValidCategoryCode('LOKALER_OG_BANER');

      expect(result).toBe(true);
    });

    it('should return false for invalid category', async () => {
      const result = await service.isValidCategoryCode('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('isValidTimeModeCode', () => {
    it('should return true for valid time mode', async () => {
      const result = await service.isValidTimeModeCode('SLOT');

      expect(result).toBe(true);
    });

    it('should return false for invalid time mode', async () => {
      const result = await service.isValidTimeModeCode('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('isValidPricingUnitCode', () => {
    it('should return true for valid pricing unit', async () => {
      const result = await service.isValidPricingUnitCode('HOUR');

      expect(result).toBe(true);
    });

    it('should return false for invalid pricing unit', async () => {
      const result = await service.isValidPricingUnitCode('INVALID');

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // Time Modes Tests
  // =========================================================================

  describe('getTimeModes', () => {
    it('should return all enabled time modes', async () => {
      const result = await service.getTimeModes(true);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('SLOT');
    });
  });

  describe('getTimeModeByCode', () => {
    it('should return time mode when found', async () => {
      const result = await service.getTimeModeByCode('SLOT');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('SLOT');
    });

    it('should return null when time mode not found', async () => {
      const result = await service.getTimeModeByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // Pricing Units Tests
  // =========================================================================

  describe('getPricingUnits', () => {
    it('should return all enabled pricing units', async () => {
      const result = await service.getPricingUnits(true);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('HOUR');
    });
  });

  describe('getPricingUnitByCode', () => {
    it('should return pricing unit when found', async () => {
      const result = await service.getPricingUnitByCode('HOUR');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('HOUR');
    });

    it('should return null when pricing unit not found', async () => {
      const result = await service.getPricingUnitByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // Valid Codes Tests
  // =========================================================================

  describe('getValidCategoryCodes', () => {
    it('should return all valid category codes', async () => {
      const result = await service.getValidCategoryCodes();

      expect(result).toContain('LOKALER_OG_BANER');
      expect(result).toContain('UTSTYR_OG_INVENTAR');
    });
  });

  describe('getValidTimeModeCodes', () => {
    it('should return all valid time mode codes', async () => {
      const result = await service.getValidTimeModeCodes();

      expect(result).toContain('SLOT');
    });
  });

  describe('getValidPricingUnitCodes', () => {
    it('should return all valid pricing unit codes', async () => {
      const result = await service.getValidPricingUnitCodes();

      expect(result).toContain('HOUR');
    });
  });

  // =========================================================================
  // Integrations Tests
  // =========================================================================

  describe('listIntegrations', () => {
    it('should return integrations for tenant', async () => {
      mockRepository.listIntegrations.mockResolvedValue([
        { id: 'int-1', provider: 'idporten', name: 'ID-porten', status: 'active' },
      ]);

      const result = await service.listIntegrations('tenant-123');

      expect(result).toHaveLength(1);
      expect(mockRepository.listIntegrations).toHaveBeenCalledWith('tenant-123');
    });
  });

  describe('getIntegration', () => {
    it('should return integration when found', async () => {
      mockRepository.getIntegration.mockResolvedValue({
        id: 'int-1',
        provider: 'idporten',
        name: 'ID-porten',
        status: 'active',
      });

      const result = await service.getIntegration('tenant-123', 'idporten');

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('idporten');
    });

    it('should return null when integration not found', async () => {
      const result = await service.getIntegration('tenant-123', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('testIntegration', () => {
    it('should return null when integration not found', async () => {
      const result = await service.testIntegration('tenant-123', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return test result for unknown provider', async () => {
      mockRepository.getIntegration.mockResolvedValue({
        id: 'int-1',
        provider: 'unknown',
        config: {},
      });

      const result = await service.testIntegration('tenant-123', 'unknown');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(false);
      expect(result?.message).toContain('not implemented');
    });
  });
});
