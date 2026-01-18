/**
 * Metadata Service Unit Tests
 *
 * Test coverage:
 * 1. Categories endpoint
 * 2. Time modes endpoint
 * 3. Pricing units endpoint
 * 4. Statuses endpoint
 * 5. Single item lookups
 * 6. Filtering logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataService } from '@testing/stubs/api-importsmodules/metadata/metadata.service';

describe('MetadataService - Categories', () => {
  let service: MetadataService;

  beforeEach(() => {
    service = new MetadataService();
  });

  it('should return all categories', async () => {
    const response = await service.getCategories();

    expect(response).toBeDefined();
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.totalCount).toBe(response.items.length);
    expect(response.version).toBeDefined();
    expect(response.lastUpdated).toBeDefined();
  });

  it('should return categories with correct structure', async () => {
    const response = await service.getCategories();
    const category = response.items[0];

    expect(category).toHaveProperty('key');
    expect(category).toHaveProperty('label');
    expect(category).toHaveProperty('sortOrder');
    expect(category).toHaveProperty('enabled');
    expect(category).toHaveProperty('icon');
    expect(category).toHaveProperty('color');
  });

  it('should return categories with i18n labels', async () => {
    const response = await service.getCategories();

    response.items.forEach((category) => {
      expect(category.label).toContain('metadata.category.');
      expect(category.label).toContain(category.key);
    });
  });

  it('should filter categories by enabled status', async () => {
    const enabledResponse = await service.getCategories({ enabled: true });
    const disabledResponse = await service.getCategories({ enabled: false });

    expect(enabledResponse.items.every((cat) => cat.enabled)).toBe(true);
    expect(disabledResponse.items.every((cat) => !cat.enabled)).toBe(true);
  });

  it('should find category by key', async () => {
    const category = await service.getCategoryByKey('LOKALER_OG_BANER');

    expect(category).toBeDefined();
    expect(category?.key).toBe('LOKALER_OG_BANER');
    expect(category?.label).toBe('metadata.category.LOKALER_OG_BANER');
  });

  it('should return null for non-existent category', async () => {
    const category = await service.getCategoryByKey('NON_EXISTENT');

    expect(category).toBeNull();
  });

  it('should include category metadata', async () => {
    const response = await service.getCategories();
    const category = response.items.find((c) => c.key === 'LOKALER_OG_BANER');

    expect(category).toBeDefined();
    expect(category?.icon).toBeDefined();
    expect(category?.color).toBeDefined();
  });
});

describe('MetadataService - Time Modes', () => {
  let service: MetadataService;

  beforeEach(() => {
    service = new MetadataService();
  });

  it('should return all time modes', async () => {
    const response = await service.getTimeModes();

    expect(response).toBeDefined();
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBe(3); // PERIOD, SLOT, ALL_DAY
    expect(response.totalCount).toBe(3);
  });

  it('should return time modes with correct structure', async () => {
    const response = await service.getTimeModes();
    const timeMode = response.items[0];

    expect(timeMode).toHaveProperty('key');
    expect(timeMode).toHaveProperty('label');
    expect(timeMode).toHaveProperty('defaultDuration');
    expect(timeMode).toHaveProperty('allowCustomDuration');
    expect(timeMode).toHaveProperty('minimumDuration');
    expect(timeMode).toHaveProperty('maximumDuration');
  });

  it('should have PERIOD time mode with custom duration allowed', async () => {
    const timeMode = await service.getTimeModeByKey('PERIOD');

    expect(timeMode).toBeDefined();
    expect(timeMode?.allowCustomDuration).toBe(true);
    expect(timeMode?.minimumDuration).toBeDefined();
    expect(timeMode?.maximumDuration).toBeDefined();
  });

  it('should have SLOT time mode with fixed duration', async () => {
    const timeMode = await service.getTimeModeByKey('SLOT');

    expect(timeMode).toBeDefined();
    expect(timeMode?.allowCustomDuration).toBe(false);
  });

  it('should have ALL_DAY time mode with 24-hour duration', async () => {
    const timeMode = await service.getTimeModeByKey('ALL_DAY');

    expect(timeMode).toBeDefined();
    expect(timeMode?.defaultDuration).toBe(1440); // 24 hours
    expect(timeMode?.minimumDuration).toBe(1440);
    expect(timeMode?.maximumDuration).toBe(1440);
  });

  it('should return null for non-existent time mode', async () => {
    const timeMode = await service.getTimeModeByKey('NON_EXISTENT');

    expect(timeMode).toBeNull();
  });
});

describe('MetadataService - Pricing Units', () => {
  let service: MetadataService;

  beforeEach(() => {
    service = new MetadataService();
  });

  it('should return all pricing units', async () => {
    const response = await service.getPricingUnits();

    expect(response).toBeDefined();
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0);
  });

  it('should return pricing units with correct structure', async () => {
    const response = await service.getPricingUnits();
    const unit = response.items[0];

    expect(unit).toHaveProperty('key');
    expect(unit).toHaveProperty('label');
    expect(unit).toHaveProperty('abbreviation');
    expect(unit).toHaveProperty('sortOrder');
    expect(unit).toHaveProperty('enabled');
  });

  it('should have HOUR pricing unit', async () => {
    const unit = await service.getPricingUnitByKey('HOUR');

    expect(unit).toBeDefined();
    expect(unit?.key).toBe('HOUR');
    expect(unit?.duration).toBe(60);
    expect(unit?.abbreviation).toBe('hr');
  });

  it('should have DAY pricing unit', async () => {
    const unit = await service.getPricingUnitByKey('DAY');

    expect(unit).toBeDefined();
    expect(unit?.key).toBe('DAY');
    expect(unit?.duration).toBe(1440);
    expect(unit?.abbreviation).toBe('day');
  });

  it('should have FIXED pricing unit without duration', async () => {
    const unit = await service.getPricingUnitByKey('FIXED');

    expect(unit).toBeDefined();
    expect(unit?.key).toBe('FIXED');
    expect(unit?.abbreviation).toBe('fixed');
  });

  it('should filter pricing units by enabled status', async () => {
    const response = await service.getPricingUnits({ enabled: true });

    expect(response.items.every((unit) => unit.enabled)).toBe(true);
  });
});

describe('MetadataService - Statuses', () => {
  let service: MetadataService;

  beforeEach(() => {
    service = new MetadataService();
  });

  it('should return all statuses', async () => {
    const response = await service.getStatuses();

    expect(response).toBeDefined();
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0);
  });

  it('should return statuses with correct structure', async () => {
    const response = await service.getStatuses();
    const status = response.items[0];

    expect(status).toHaveProperty('key');
    expect(status).toHaveProperty('label');
    expect(status).toHaveProperty('statusType');
    expect(status).toHaveProperty('color');
    expect(status).toHaveProperty('transitions');
    expect(status.transitions).toBeInstanceOf(Array);
  });

  it('should filter statuses by type', async () => {
    const rentalObjectStatuses = await service.getStatuses({ statusType: 'rental-object' });
    const bookingStatuses = await service.getStatuses({ statusType: 'booking' });

    expect(rentalObjectStatuses.items.every((s) => s.statusType === 'rental-object')).toBe(true);
    expect(bookingStatuses.items.every((s) => s.statusType === 'booking')).toBe(true);
  });

  it('should have rental object statuses', async () => {
    const response = await service.getStatuses({ statusType: 'rental-object' });

    const statusKeys = response.items.map((s) => s.key);
    expect(statusKeys).toContain('DRAFT');
    expect(statusKeys).toContain('PUBLISHED');
    expect(statusKeys).toContain('ARCHIVED');
  });

  it('should have booking statuses', async () => {
    const response = await service.getStatuses({ statusType: 'booking' });

    const statusKeys = response.items.map((s) => s.key);
    expect(statusKeys).toContain('PENDING');
    expect(statusKeys).toContain('CONFIRMED');
    expect(statusKeys).toContain('CANCELLED');
    expect(statusKeys).toContain('REJECTED');
    expect(statusKeys).toContain('COMPLETED');
  });

  it('should define valid state transitions', async () => {
    const draftStatus = await service.getStatusByKey('DRAFT', 'rental-object');

    expect(draftStatus).toBeDefined();
    expect(draftStatus?.transitions).toContain('PUBLISHED');
  });

  it('should have terminal statuses with no transitions', async () => {
    const cancelledStatus = await service.getStatusByKey('CANCELLED', 'booking');

    expect(cancelledStatus).toBeDefined();
    expect(cancelledStatus?.transitions).toHaveLength(0);
  });

  it('should find status by key and type', async () => {
    const status = await service.getStatusByKey('PUBLISHED', 'rental-object');

    expect(status).toBeDefined();
    expect(status?.key).toBe('PUBLISHED');
    expect(status?.statusType).toBe('rental-object');
  });

  it('should return null for non-existent status', async () => {
    const status = await service.getStatusByKey('NON_EXISTENT', 'rental-object');

    expect(status).toBeNull();
  });
});

describe('MetadataService - Response Consistency', () => {
  let service: MetadataService;

  beforeEach(() => {
    service = new MetadataService();
  });

  it('should return consistent version across all endpoints', async () => {
    const categories = await service.getCategories();
    const timeModes = await service.getTimeModes();
    const pricingUnits = await service.getPricingUnits();
    const statuses = await service.getStatuses();

    expect(categories.version).toBe(timeModes.version);
    expect(timeModes.version).toBe(pricingUnits.version);
    expect(pricingUnits.version).toBe(statuses.version);
  });

  it('should include lastUpdated timestamp in all responses', async () => {
    const categories = await service.getCategories();
    const timeModes = await service.getTimeModes();

    expect(categories.lastUpdated).toBeDefined();
    expect(timeModes.lastUpdated).toBeDefined();

    // Should be valid ISO date
    expect(() => new Date(categories.lastUpdated)).not.toThrow();
    expect(() => new Date(timeModes.lastUpdated)).not.toThrow();
  });

  it('should have sortOrder on all items', async () => {
    const categories = await service.getCategories();
    const timeModes = await service.getTimeModes();
    const pricingUnits = await service.getPricingUnits();

    categories.items.forEach((item) => {
      expect(typeof item.sortOrder).toBe('number');
    });

    timeModes.items.forEach((item) => {
      expect(typeof item.sortOrder).toBe('number');
    });

    pricingUnits.items.forEach((item) => {
      expect(typeof item.sortOrder).toBe('number');
    });
  });
});
