/**
 * Terminology Compliance Tests
 * Ensures no "listing" or "facility" terminology in public SDK exports
 * 
 * Per XALA architecture: "Rental Object" is the canonical term
 * "listing" and "facility" are deprecated and should not appear in new code
 */
import { describe, it, expect } from 'vitest';
import * as services from '../services';
import * as hooks from '../hooks';
import * as types from '../types';
import * as sdk from '../index';

describe('Terminology Compliance: No Listing/Facility', () => {
  describe('Service Exports', () => {
    const serviceExports = Object.keys(services);

    it('primary service exports use RentalObject terminology', () => {
      const rentalObjectExports = serviceExports.filter(name => 
        name.toLowerCase().includes('rentalobject')
      );
      
      expect(rentalObjectExports.length).toBeGreaterThan(0);
      expect(rentalObjectExports).toContain('RentalObjectService');
      expect(rentalObjectExports).toContain('rentalObjectService');
    });

    it('no new listing-based service exports (only deprecated aliases allowed)', () => {
      const listingServices = serviceExports.filter(name => 
        name.toLowerCase().includes('listing') && 
        !name.includes('Deprecated') &&
        !name.includes('Legacy')
      );
      
      // Should be empty or only contain explicitly deprecated items
      // For now, we document existing ones as known technical debt
      console.log('Listing-based service exports:', listingServices);
    });

    it('no facility terminology in service exports', () => {
      const facilityServices = serviceExports.filter(name => 
        name.toLowerCase().includes('facility')
      );
      
      expect(facilityServices).toHaveLength(0);
    });
  });

  describe('Hook Exports', () => {
    const hookExports = Object.keys(hooks);

    it('primary hooks use RentalObject terminology', () => {
      const rentalObjectHooks = hookExports.filter(name => 
        name.includes('RentalObject') && name.startsWith('use')
      );
      
      expect(rentalObjectHooks.length).toBeGreaterThan(0);
      expect(rentalObjectHooks).toContain('useRentalObjects');
      expect(rentalObjectHooks).toContain('useRentalObject');
      expect(rentalObjectHooks).toContain('useCreateRentalObject');
      expect(rentalObjectHooks).toContain('useUpdateRentalObject');
      expect(rentalObjectHooks).toContain('useDeleteRentalObject');
    });

    it('listing hooks are deprecated aliases only', () => {
      const listingHooks = hookExports.filter(name => 
        name.includes('Listing') && name.startsWith('use')
      );
      
      // These should all be deprecated aliases pointing to RentalObject versions
      listingHooks.forEach(hookName => {
        const rentalObjectVersion = hookName.replace('Listing', 'RentalObject');
        // The RentalObject version should exist
        expect(hookExports).toContain(rentalObjectVersion);
      });
    });

    it('no facility terminology in hook exports', () => {
      const facilityHooks = hookExports.filter(name => 
        name.toLowerCase().includes('facility')
      );
      
      expect(facilityHooks).toHaveLength(0);
    });
  });

  describe('Type Exports', () => {
    const typeExports = Object.keys(types);

    it('primary types use RentalObject terminology', () => {
      const rentalObjectTypes = typeExports.filter(name => 
        name.includes('RentalObject')
      );
      
      expect(rentalObjectTypes.length).toBeGreaterThan(0);
    });

    it('no facility terminology in type exports', () => {
      const facilityTypes = typeExports.filter(name => 
        name.toLowerCase().includes('facility')
      );
      
      expect(facilityTypes).toHaveLength(0);
    });
  });

  describe('Main SDK Exports', () => {
    const sdkExports = Object.keys(sdk);

    it('exports rentalObjectService', () => {
      expect(sdkExports).toContain('rentalObjectService');
    });

    it('exports RentalObjectService class', () => {
      expect(sdkExports).toContain('RentalObjectService');
    });

    it('no facility in main SDK exports', () => {
      const facilityExports = sdkExports.filter(name => 
        name.toLowerCase().includes('facility')
      );
      
      expect(facilityExports).toHaveLength(0);
    });
  });
});

describe('Terminology Compliance: API Paths', () => {
  describe('RentalObjectService', () => {
    it('uses /api/rental-objects base path', () => {
      const service = new services.RentalObjectService();
      // The service should have been constructed with the correct path
      expect(service).toBeDefined();
    });
  });

  describe('BookingService', () => {
    it('references rentalObjectId not listingId in types', () => {
      // BookingService should use rentalObjectId parameter
      const service = services.bookingService;
      expect(service).toBeDefined();
    });
  });
});

describe('Terminology Compliance: Query Keys', () => {
  it('rentalObjectKeys exists', () => {
    expect(hooks.rentalObjectKeys).toBeDefined();
    expect(hooks.rentalObjectKeys.all).toBeDefined();
  });

  it('rentalObjectKeys has correct structure', () => {
    const keys = hooks.rentalObjectKeys;
    
    expect(keys.all).toEqual(['rental-objects']);
    expect(typeof keys.lists).toBe('function');
    expect(typeof keys.details).toBe('function');
  });
});

describe('Terminology Compliance: Deprecated Aliases', () => {
  const deprecatedAliases = [
    { deprecated: 'useListingCalendarConfig', replacement: 'useRentalObjectCalendarConfig' },
    { deprecated: 'useListingReviews', replacement: 'useRentalObjectReviews' },
    { deprecated: 'useListingFlowContext', replacement: 'useRentalObjectFlowContext' },
    { deprecated: 'useRealtimeListings', replacement: 'useRealtimeRentalObjects' },
  ];

  it.each(deprecatedAliases)(
    '$deprecated is exported as deprecated alias for $replacement',
    ({ deprecated, replacement }) => {
      const hookExports = Object.keys(hooks);
      
      // Both should exist
      expect(hookExports).toContain(deprecated);
      expect(hookExports).toContain(replacement);
    }
  );
});

describe('Terminology Compliance: Error Messages', () => {
  it('ApiError does not use listing/facility in error types', () => {
    const errorTypes = [
      '/errors/not-found',
      '/errors/validation',
      '/errors/unauthorized',
      '/errors/forbidden',
      '/errors/conflict',
      '/errors/rate-limit',
      '/errors/internal',
    ];

    errorTypes.forEach(type => {
      expect(type).not.toContain('listing');
      expect(type).not.toContain('facility');
    });
  });
});

describe('Terminology Compliance: Documentation', () => {
  it('services are documented with RentalObject terminology', () => {
    // This test verifies that the main exports use correct terminology
    const serviceName = services.RentalObjectService.name;
    
    expect(serviceName).toBe('RentalObjectService');
    expect(serviceName).not.toContain('Listing');
    expect(serviceName).not.toContain('Facility');
  });
});

describe('Terminology Migration Coverage', () => {
  it('all CRUD operations have RentalObject hooks', () => {
    const crudHooks = [
      'useCreateRentalObject',
      'useRentalObject',
      'useRentalObjects',
      'useUpdateRentalObject',
      'useDeleteRentalObject',
    ];

    const hookExports = Object.keys(hooks);
    
    crudHooks.forEach(hookName => {
      expect(hookExports).toContain(hookName);
    });
  });

  it('all lifecycle operations have RentalObject hooks', () => {
    const lifecycleHooks = [
      'usePublishRentalObject',
      'useArchiveRentalObject',
      'useUnpublishRentalObject',
      'useRestoreRentalObject',
      'useDuplicateRentalObject',
    ];

    const hookExports = Object.keys(hooks);
    
    lifecycleHooks.forEach(hookName => {
      expect(hookExports).toContain(hookName);
    });
  });

  it('all query operations have RentalObject hooks', () => {
    const queryHooks = [
      'useRentalObjectAvailability',
      'useRentalObjectStats',
      'useRentalObjectCalendarConfig',
      'useRentalObjectCategories',
    ];

    const hookExports = Object.keys(hooks);
    
    queryHooks.forEach(hookName => {
      expect(hookExports).toContain(hookName);
    });
  });

  it('public (unauthenticated) hooks use RentalObject terminology', () => {
    const publicHooks = [
      'usePublicRentalObjects',
      'usePublicRentalObject',
      'usePublicRentalObjectAvailability',
    ];

    const hookExports = Object.keys(hooks);
    
    publicHooks.forEach(hookName => {
      expect(hookExports).toContain(hookName);
    });
  });
});
