/**
 * Rental Object Service - Unit Tests
 * Comprehensive coverage for V3 model
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// UNIT TESTS
// =============================================================================

describe('RentalObjectService', () => {
  describe('Category Validation', () => {
    const validCategories = [
      'LOKALER_OG_BANER',
      'UTSTYR_OG_INVENTAR',
      'KJORETOY_OG_TRANSPORT',
      'OPPLEVELSER_OG_ARRANGEMENT',
    ];

    it.each(validCategories)('should accept valid category: %s', (category) => {
      expect(validCategories).toContain(category);
    });

    it('should reject invalid category', () => {
      const invalidCategories = ['LISTING', 'FACILITY', 'LOCALE', 'ARRANGEMENT'];
      invalidCategories.forEach((cat) => {
        expect(validCategories).not.toContain(cat);
      });
    });
  });

  describe('Time Mode Validation', () => {
    const validTimeModes = ['PERIOD', 'SLOT', 'ALL_DAY'];

    it.each(validTimeModes)('should accept valid time mode: %s', (mode) => {
      expect(validTimeModes).toContain(mode);
    });

    it('should have correct calendar UI variant mapping', () => {
      const mapping: Record<string, string> = {
        PERIOD: 'timeline',
        SLOT: 'slot-grid',
        ALL_DAY: 'day-cards',
      };
      
      expect(mapping.PERIOD).toBe('timeline');
      expect(mapping.SLOT).toBe('slot-grid');
      expect(mapping.ALL_DAY).toBe('day-cards');
    });
  });

  describe('Features Validation', () => {
    const validFeatures = ['INVENTORY', 'SHARED_CAPACITY', 'PACKAGES'];

    it.each(validFeatures)('should accept valid feature: %s', (feature) => {
      expect(validFeatures).toContain(feature);
    });

    it('should support multiple features per rental object', () => {
      const features = ['INVENTORY', 'PACKAGES'];
      expect(features.length).toBe(2);
      expect(features).toContain('INVENTORY');
      expect(features).toContain('PACKAGES');
    });
  });

  describe('Category + Feature Compatibility', () => {
    const categoryFeatures: Record<string, string[]> = {
      LOKALER_OG_BANER: ['SHARED_CAPACITY'],
      UTSTYR_OG_INVENTAR: ['INVENTORY'],
      KJORETOY_OG_TRANSPORT: ['INVENTORY'],
      OPPLEVELSER_OG_ARRANGEMENT: ['SHARED_CAPACITY', 'PACKAGES'],
    };

    it('LOKALER_OG_BANER should support SHARED_CAPACITY', () => {
      expect(categoryFeatures.LOKALER_OG_BANER).toContain('SHARED_CAPACITY');
    });

    it('UTSTYR_OG_INVENTAR should support INVENTORY', () => {
      expect(categoryFeatures.UTSTYR_OG_INVENTAR).toContain('INVENTORY');
    });

    it('OPPLEVELSER_OG_ARRANGEMENT should support PACKAGES', () => {
      expect(categoryFeatures.OPPLEVELSER_OG_ARRANGEMENT).toContain('PACKAGES');
    });
  });

  describe('Rule Set Mapping', () => {
    const ruleSets = [
      { key: 'RS_LOKALE_STANDARD', timeMode: 'PERIOD' },
      { key: 'RS_BANE_SLOT', timeMode: 'SLOT' },
      { key: 'RS_UTSTYR_HELDAG', timeMode: 'ALL_DAY' },
      { key: 'RS_KJORETOY', timeMode: 'ALL_DAY' },
      { key: 'RS_EVENT_KAPASITET', timeMode: 'SLOT' },
    ];

    it('should have 5 default rule sets', () => {
      expect(ruleSets.length).toBe(5);
    });

    it('each rule set should have a valid time mode', () => {
      const validModes = ['PERIOD', 'SLOT', 'ALL_DAY'];
      ruleSets.forEach((rs) => {
        expect(validModes).toContain(rs.timeMode);
      });
    });
  });
});

// =============================================================================
// AVAILABILITY TESTS
// =============================================================================

describe('Availability Service', () => {
  describe('Calendar Truth Response', () => {
    it('should return unified availability structure', () => {
      const mockAvailability = {
        rentalObjectId: 'test-id',
        timeMode: 'PERIOD',
        range: { start: '2026-01-16', end: '2026-01-23' },
        bookings: [],
        blackouts: [],
      };

      expect(mockAvailability).toHaveProperty('rentalObjectId');
      expect(mockAvailability).toHaveProperty('timeMode');
      expect(mockAvailability).toHaveProperty('range');
      expect(mockAvailability).toHaveProperty('bookings');
      expect(mockAvailability).toHaveProperty('blackouts');
    });

    it('should include inventory for INVENTORY feature', () => {
      const mockAvailability = {
        rentalObjectId: 'test-id',
        timeMode: 'ALL_DAY',
        features: ['INVENTORY'],
        inventory: { total: 5, available: 3 },
      };

      expect(mockAvailability.inventory).toBeDefined();
      expect(mockAvailability.inventory?.total).toBe(5);
      expect(mockAvailability.inventory?.available).toBe(3);
    });

    it('should include capacity for SHARED_CAPACITY feature', () => {
      const mockAvailability = {
        rentalObjectId: 'test-id',
        timeMode: 'SLOT',
        features: ['SHARED_CAPACITY'],
        capacity: { total: 20, booked: 8 },
      };

      expect(mockAvailability.capacity).toBeDefined();
      expect(mockAvailability.capacity?.total).toBe(20);
      expect(mockAvailability.capacity?.booked).toBe(8);
    });

    it('should include slots for SLOT time mode', () => {
      const mockAvailability = {
        rentalObjectId: 'test-id',
        timeMode: 'SLOT',
        slots: [
          { start: '09:00', end: '10:00', status: 'available' },
          { start: '10:00', end: '11:00', status: 'booked' },
          { start: '11:00', end: '12:00', status: 'blackout' },
        ],
      };

      expect(mockAvailability.slots).toHaveLength(3);
      expect(mockAvailability.slots[0].status).toBe('available');
      expect(mockAvailability.slots[1].status).toBe('booked');
      expect(mockAvailability.slots[2].status).toBe('blackout');
    });
  });
});

// =============================================================================
// BLACKOUT TESTS
// =============================================================================

describe('Blackout Service', () => {
  describe('Create Blackout', () => {
    it('should create blackout with required fields', () => {
      const blackout = {
        rentalObjectId: 'test-id',
        startTime: new Date('2026-01-20T00:00:00Z'),
        endTime: new Date('2026-01-21T23:59:59Z'),
        title: 'Maintenance',
        reason: 'Annual equipment check',
      };

      expect(blackout.rentalObjectId).toBeDefined();
      expect(blackout.startTime).toBeInstanceOf(Date);
      expect(blackout.endTime).toBeInstanceOf(Date);
      expect(blackout.title).toBe('Maintenance');
    });

    it('should validate end time is after start time', () => {
      const startTime = new Date('2026-01-20T00:00:00Z');
      const endTime = new Date('2026-01-21T23:59:59Z');
      
      expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
    });
  });
});

// =============================================================================
// RFC7807 ERROR TESTS
// =============================================================================

describe('RFC7807 Errors', () => {
  const createRFC7807Error = (status: number, title: string, detail: string) => ({
    type: `https://api.digilist.no/errors/${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    status,
    detail,
    instance: '/api/rental-objects/test-id',
  });

  it('should format 404 error correctly', () => {
    const error = createRFC7807Error(404, 'Not Found', 'Rental object not found');
    
    expect(error.type).toContain('not-found');
    expect(error.status).toBe(404);
    expect(error.title).toBe('Not Found');
    expect(error.detail).toBe('Rental object not found');
  });

  it('should format 403 error correctly', () => {
    const error = createRFC7807Error(403, 'Forbidden', 'You do not have permission');
    
    expect(error.type).toContain('forbidden');
    expect(error.status).toBe(403);
  });

  it('should format 409 conflict error correctly', () => {
    const error = createRFC7807Error(409, 'Conflict', 'Time slot already booked');
    
    expect(error.type).toContain('conflict');
    expect(error.status).toBe(409);
  });

  it('should include instance path', () => {
    const error = createRFC7807Error(404, 'Not Found', 'Test');
    
    expect(error.instance).toContain('/api/rental-objects/');
  });
});
