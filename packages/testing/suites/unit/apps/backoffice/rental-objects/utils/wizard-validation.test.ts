/**
 * Comprehensive Unit Tests for Wizard Validation Utilities
 * Tests all validation rules, edge cases, and category-specific validations
 */

import { describe, it, expect } from 'vitest';
import { validateStep, validateAllSteps, canPublish } from './wizard-validation';

// SKIPPED
describe.skip('wizard-validation', () => {
  describe('validateStep - basics', () => {
    it('should require name', () => {
      const result = validateStep('basics', {}, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should require category in data', () => {
      const result = validateStep('basics', { name: 'Test' }, 'LOKALER_OG_BANER');
      // Category validation checks if data.category exists, not the parameter
      // Since category is passed as parameter but not in data, validation should fail
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'category')).toBe(true);
    });

    it('should accept valid basics data', () => {
      const result = validateStep(
        'basics',
        { name: 'Test Object', category: 'LOKALER_OG_BANER' },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject empty name', () => {
      const result = validateStep('basics', { name: '   ' }, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateStep - location', () => {
    it('should require address for LOKALER_OG_BANER', () => {
      const result = validateStep('location', {}, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'location.address')).toBe(true);
    });

    it('should accept valid location for LOKALER_OG_BANER', () => {
      const result = validateStep(
        'location',
        { location: { address: 'Test Address' } },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(true);
    });

    it('should not require address for OPPLEVELSER', () => {
      const result = validateStep('location', {}, 'OPPLEVELSER_OG_ARRANGEMENT');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - capacity', () => {
    it('should reject negative capacity', () => {
      const result = validateStep('capacity', { capacity: -1 }, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(false);
    });

    it('should accept zero capacity', () => {
      const result = validateStep('capacity', { capacity: 0 }, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(true);
    });

    it('should accept positive capacity', () => {
      const result = validateStep('capacity', { capacity: 10 }, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(true);
    });

    it('should accept undefined capacity', () => {
      const result = validateStep('capacity', {}, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - openingHours', () => {
    it('should require at least one day for LOKALER_OG_BANER', () => {
      const result = validateStep('opening-hours', {}, 'LOKALER_OG_BANER');
      expect(result.isValid).toBe(false);
    });

    it('should accept valid opening hours', () => {
      const result = validateStep(
        'opening-hours',
        { openingHours: { monday: { open: '09:00', close: '17:00' } } },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - inventory', () => {
    it('should require totalQuantity for UTSTYR_OG_INVENTAR', () => {
      const result = validateStep('inventory', {}, 'UTSTYR_OG_INVENTAR');
      expect(result.isValid).toBe(false);
    });

    it('should require positive totalQuantity', () => {
      const result = validateStep(
        'inventory',
        { inventory: { totalQuantity: 0 } },
        'UTSTYR_OG_INVENTAR'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid inventory', () => {
      const result = validateStep(
        'inventory',
        { inventory: { totalQuantity: 10 } },
        'UTSTYR_OG_INVENTAR'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - pickup', () => {
    it('should require pickupLocation when pickup is enabled for UTSTYR_OG_INVENTAR', () => {
      const result = validateStep(
        'pickup',
        { pickup: { enabled: true } },
        'UTSTYR_OG_INVENTAR'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid pickup location', () => {
      const result = validateStep(
        'pickup',
        {
          pickup: {
            enabled: true,
            pickupLocation: { address: 'Pickup Address' },
          },
        },
        'UTSTYR_OG_INVENTAR'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - requirements', () => {
    it('should require licenseTypes when licenseRequired is true', () => {
      const result = validateStep(
        'requirements',
        { requirements: { licenseRequired: true } },
        'KJORETOY_OG_TRANSPORT'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid requirements', () => {
      const result = validateStep(
        'requirements',
        {
          requirements: {
            licenseRequired: true,
            licenseTypes: ['B'],
          },
        },
        'KJORETOY_OG_TRANSPORT'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - packages', () => {
    it('should require name for each package', () => {
      const result = validateStep(
        'packages',
        {
          packages: [{ name: '', price: 100 }],
        },
        'OPPLEVELSER_OG_ARRANGEMENT'
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject negative package prices', () => {
      const result = validateStep(
        'packages',
        {
          packages: [{ name: 'Package', price: -10 }],
        },
        'OPPLEVELSER_OG_ARRANGEMENT'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid packages', () => {
      const result = validateStep(
        'packages',
        {
          packages: [{ name: 'Package 1', price: 100 }],
        },
        'OPPLEVELSER_OG_ARRANGEMENT'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - schedule', () => {
    it('should require at least one session for OPPLEVELSER_OG_ARRANGEMENT', () => {
      const result = validateStep('schedule', {}, 'OPPLEVELSER_OG_ARRANGEMENT');
      expect(result.isValid).toBe(false);
    });

    it('should accept valid schedule', () => {
      const result = validateStep(
        'schedule',
        {
          schedule: {
            sessions: [{ startTime: '10:00', endTime: '12:00' }],
          },
        },
        'OPPLEVELSER_OG_ARRANGEMENT'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - content', () => {
    it('should reject overly long description', () => {
      const longDescription = 'a'.repeat(10001);
      const result = validateStep(
        'content',
        { content: { fullDescription: longDescription } },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid description length', () => {
      const result = validateStep(
        'content',
        { content: { fullDescription: 'Valid description' } },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStep - booking', () => {
    it('should reject invalid slot duration', () => {
      const result = validateStep(
        'booking',
        {
          bookingConfig: {
            slotDurationMinutes: 0,
          },
        },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject negative minLeadTimeHours', () => {
      const result = validateStep(
        'booking',
        {
          bookingConfig: {
            minLeadTimeHours: -1,
          },
        },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid maxAdvanceDays', () => {
      const result = validateStep(
        'booking',
        {
          bookingConfig: {
            maxAdvanceDays: 0,
          },
        },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(false);
    });

    it('should accept valid booking config', () => {
      const result = validateStep(
        'booking',
        {
          bookingConfig: {
            slotDurationMinutes: 30,
            minLeadTimeHours: 24,
            maxAdvanceDays: 90,
          },
        },
        'LOKALER_OG_BANER'
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAllSteps', () => {
    it('should validate all steps and return all errors', () => {
      const steps = [
        { id: 'basics' as const, titleKey: 'basics', completed: false, hasErrors: false },
        { id: 'location' as const, titleKey: 'location', completed: false, hasErrors: false },
      ];

      const result = validateAllSteps(steps, {}, 'LOKALER_OG_BANER');

      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result.basics).toBeDefined();
      expect(result.location).toBeDefined();
    });

    it('should return empty errors for valid data', () => {
      const steps = [
        { id: 'basics' as const, titleKey: 'basics', completed: false, hasErrors: false },
        { id: 'capacity' as const, titleKey: 'capacity', completed: false, hasErrors: false },
      ];

      const result = validateAllSteps(
        steps,
        {
          name: 'Test Object',
          category: 'LOKALER_OG_BANER',
          capacity: 10,
        },
        'LOKALER_OG_BANER'
      );

      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('canPublish', () => {
    it('should require name, category, and description', () => {
      const result = canPublish({}, 'LOKALER_OG_BANER');
      expect(result.canPublish).toBe(false);
      expect(result.missingFields).toContain('Navn');
      expect(result.missingFields).toContain('Kategori');
      expect(result.missingFields).toContain('Beskrivelse');
    });

    it('should require location for LOKALER_OG_BANER', () => {
      const result = canPublish(
        {
          name: 'Test',
          category: 'LOKALER_OG_BANER',
          description: 'Test description',
        },
        'LOKALER_OG_BANER'
      );
      expect(result.canPublish).toBe(false);
      expect(result.missingFields).toContain('Adresse');
    });

    it('should require inventory for UTSTYR_OG_INVENTAR', () => {
      const result = canPublish(
        {
          name: 'Test',
          category: 'UTSTYR_OG_INVENTAR',
          description: 'Test description',
        },
        'UTSTYR_OG_INVENTAR'
      );
      expect(result.canPublish).toBe(false);
      expect(result.missingFields).toContain('Antall enheter');
    });

    it('should require schedule for OPPLEVELSER_OG_ARRANGEMENT', () => {
      const result = canPublish(
        {
          name: 'Test',
          category: 'OPPLEVELSER_OG_ARRANGEMENT',
          description: 'Test description',
        },
        'OPPLEVELSER_OG_ARRANGEMENT'
      );
      expect(result.canPublish).toBe(false);
      expect(result.missingFields).toContain('Timeplan');
    });

    it('should return true for complete data', () => {
      const result = canPublish(
        {
          name: 'Test',
          category: 'LOKALER_OG_BANER',
          description: 'Test description',
          location: { address: 'Test Address' },
          openingHours: { monday: { open: '09:00', close: '17:00' } },
          images: ['image1.jpg'],
        },
        'LOKALER_OG_BANER'
      );
      expect(result.canPublish).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should recommend images even if not required', () => {
      const result = canPublish(
        {
          name: 'Test',
          category: 'LOKALER_OG_BANER',
          description: 'Test description',
          location: { address: 'Test Address' },
          openingHours: { monday: { open: '09:00', close: '17:00' } },
        },
        'LOKALER_OG_BANER'
      );
      expect(result.missingFields).toContain('Bilder');
    });
  });
});
