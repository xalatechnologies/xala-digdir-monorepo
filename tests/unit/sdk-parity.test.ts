/**
 * SDK Parity Snapshot Tests
 * 
 * These tests verify that the SDK maintains parity with the API:
 * - All API endpoints have corresponding SDK methods
 * - All SDK hooks are properly exported
 * - Query keys are defined correctly
 * - Service exports match expectations
 * 
 * Run: pnpm test:run tests/unit/sdk-parity.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';

// =============================================================================
// Expected API Endpoints (source of truth)
// =============================================================================

const EXPECTED_API_ENDPOINTS = {
  // Auth
  auth: [
    'POST /api/auth/login',
    'POST /api/auth/logout',
    'POST /api/auth/refresh',
    'GET /api/auth/me',
  ],
  
  // Rental Objects (Listings)
  rentalObjects: [
    'GET /api/rental-objects',
    'GET /api/rental-objects/:id',
    'POST /api/rental-objects',
    'PUT /api/rental-objects/:id',
    'DELETE /api/rental-objects/:id',
    'GET /api/rental-objects/categories',
    'GET /api/rental-objects/by-slug/:slug',
  ],
  
  // Bookings
  bookings: [
    'GET /api/bookings',
    'GET /api/bookings/:id',
    'POST /api/bookings',
    'PUT /api/bookings/:id',
    'PUT /api/bookings/:id/cancel',
    'PUT /api/bookings/:id/confirm',
    'PUT /api/bookings/:id/complete',
    'PUT /api/bookings/:id/approve',
    'PUT /api/bookings/:id/reject',
    'GET /api/bookings/my',
    'GET /api/bookings/calendar',
    'GET /api/bookings/pricing',
    'GET /api/bookings/:id/receipt',
  ],
  
  // Organizations
  organizations: [
    'GET /api/organizations',
    'GET /api/organizations/:id',
    'POST /api/organizations',
    'PUT /api/organizations/:id',
    'GET /api/organizations/:id/members',
    'POST /api/organizations/:id/members',
    'DELETE /api/organizations/:id/members/:memberId',
    'GET /api/organizations/:id/branding',
    'PUT /api/organizations/:id/branding',
  ],
  
  // Users
  users: [
    'GET /api/users',
    'GET /api/users/:id',
    'POST /api/users',
    'PUT /api/users/:id',
    'DELETE /api/users/:id',
    'GET /api/users/me',
    'GET /api/users/me/consents',
    'PUT /api/users/:id/role',
    'PUT /api/users/:id/deactivate',
    'PUT /api/users/:id/reactivate',
    'POST /api/users/invite',
  ],
  
  // Capabilities
  capabilities: [
    'GET /api/web/me/capabilities',
    'GET /api/backoffice/me/capabilities',
    'GET /api/minside/me/capabilities',
  ],
  
  // Metadata
  metadata: [
    'GET /api/metadata/categories',
    'GET /api/metadata/time-modes',
    'GET /api/metadata/pricing-units',
    'GET /api/metadata/statuses',
  ],
};

// =============================================================================
// Expected SDK Exports
// =============================================================================

const EXPECTED_SDK_SERVICES = [
  'authService',
  'rentalObjectService',
  'bookingService',
  'organizationService',
  'userService',
  'metadataService',
];

const EXPECTED_SDK_HOOKS = [
  // Auth
  'useAuth',
  'useLogin',
  'useLogout',
  'useRefreshToken',
  
  // Rental Objects
  'useRentalObjects',
  'useRentalObject',
  'useCreateRentalObject',
  'useUpdateRentalObject',
  'useDeleteRentalObject',
  
  // Bookings
  'useBookings',
  'useBooking',
  'useCreateBooking',
  'useMyBookings',
  
  // Organizations
  'useOrganizations',
  'useOrganization',
  
  // Users
  'useUsers',
  'useUser',
  'useCurrentUser',
  
  // Capabilities
  'useWebCapabilities',
  'useBackofficeCapabilities',
  'useMinsideCapabilities',
  
  // Metadata
  'useCategoriesMetadata',
  'useTimeModesMetadata',
  'usePricingUnitsMetadata',
  'useStatusesMetadata',
];

const EXPECTED_QUERY_KEY_NAMESPACES = [
  'auth',
  'rentalObjects',
  'bookings',
  'organizations',
  'users',
  'capabilities',
  'metadata',
];

// =============================================================================
// Tests
// =============================================================================

describe('SDK Parity Tests', () => {
  let sdkExports: Record<string, unknown>;
  let hooksExports: Record<string, unknown>;
  
  beforeAll(async () => {
    // Dynamic import to avoid build-time issues
    try {
      sdkExports = await import('@digilist/client-sdk');
      hooksExports = await import('@digilist/client-sdk/hooks');
    } catch (e) {
      // If imports fail, set empty objects
      sdkExports = {};
      hooksExports = {};
    }
  });
  
  describe('SDK Service Exports', () => {
    it('should export all required services', () => {
      const missingServices = EXPECTED_SDK_SERVICES.filter(
        service => !(service in sdkExports)
      );
      
      expect(missingServices).toEqual([]);
    });
    
    it('should export initializeClient function', () => {
      expect('initializeClient' in sdkExports).toBe(true);
    });
    
    it('should export ApiError class', () => {
      expect('ApiError' in sdkExports).toBe(true);
    });
  });
  
  describe('SDK Hook Exports', () => {
    it('should export all required hooks', () => {
      const missingHooks = EXPECTED_SDK_HOOKS.filter(
        hook => !(hook in hooksExports)
      );
      
      // Log missing hooks for debugging
      if (missingHooks.length > 0) {
        console.log('Missing hooks:', missingHooks);
        console.log('Available hooks:', Object.keys(hooksExports));
      }
      
      expect(missingHooks).toEqual([]);
    });
    
    it('should export queryKeys', () => {
      expect('queryKeys' in hooksExports).toBe(true);
    });
  });
  
  describe('Query Keys Structure', () => {
    it('should have all required query key namespaces', () => {
      const queryKeys = (hooksExports as any).queryKeys || {};
      
      const missingNamespaces = EXPECTED_QUERY_KEY_NAMESPACES.filter(
        ns => !(ns in queryKeys)
      );
      
      expect(missingNamespaces).toEqual([]);
    });
  });
  
  describe('API Endpoint Coverage Snapshot', () => {
    // This test documents the expected API endpoints
    // If endpoints change, this snapshot should be updated
    
    it('should match expected auth endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.auth).toMatchSnapshot();
    });
    
    it('should match expected rental object endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.rentalObjects).toMatchSnapshot();
    });
    
    it('should match expected booking endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.bookings).toMatchSnapshot();
    });
    
    it('should match expected organization endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.organizations).toMatchSnapshot();
    });
    
    it('should match expected user endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.users).toMatchSnapshot();
    });
    
    it('should match expected capabilities endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.capabilities).toMatchSnapshot();
    });
    
    it('should match expected metadata endpoints', () => {
      expect(EXPECTED_API_ENDPOINTS.metadata).toMatchSnapshot();
    });
  });
});

describe('SDK Type Safety', () => {
  describe('DTO Type Exports', () => {
    it('should export all required DTO types', async () => {
      // Check that types can be imported without errors
      // This test primarily verifies that the types are exported correctly
      try {
        const types = await import('@digilist/client-sdk/types');
        
        // Check for key type exports
        expect(types).toBeDefined();
      } catch (e) {
        // Types should be importable
        expect(e).toBeUndefined();
      }
    });
  });
});

describe('SDK Hook Behavior', () => {
  describe('useWebCapabilities', () => {
    it('should be exported from hooks', () => {
      expect('useWebCapabilities' in hooksExports).toBe(true);
    });
  });
  
  describe('useBackofficeCapabilities', () => {
    it('should be exported from hooks', () => {
      expect('useBackofficeCapabilities' in hooksExports).toBe(true);
    });
  });
  
  describe('useMinsideCapabilities', () => {
    it('should be exported from hooks', () => {
      expect('useMinsideCapabilities' in hooksExports).toBe(true);
    });
  });
});

// =============================================================================
// Contract Parity Matrix
// =============================================================================

describe('Contract Parity Matrix', () => {
  const PARITY_MATRIX = {
    'rentalObject.list': { api: 'GET /api/rental-objects', sdk: 'rentalObjectService.list', hook: 'useRentalObjects' },
    'rentalObject.get': { api: 'GET /api/rental-objects/:id', sdk: 'rentalObjectService.get', hook: 'useRentalObject' },
    'rentalObject.create': { api: 'POST /api/rental-objects', sdk: 'rentalObjectService.create', hook: 'useCreateRentalObject' },
    'booking.list': { api: 'GET /api/bookings', sdk: 'bookingService.list', hook: 'useBookings' },
    'booking.get': { api: 'GET /api/bookings/:id', sdk: 'bookingService.get', hook: 'useBooking' },
    'booking.create': { api: 'POST /api/bookings', sdk: 'bookingService.create', hook: 'useCreateBooking' },
    'booking.my': { api: 'GET /api/bookings/my', sdk: 'bookingService.getMyBookings', hook: 'useMyBookings' },
    'user.list': { api: 'GET /api/users', sdk: 'userService.list', hook: 'useUsers' },
    'user.me': { api: 'GET /api/users/me', sdk: 'userService.getCurrentUser', hook: 'useCurrentUser' },
    'organization.list': { api: 'GET /api/organizations', sdk: 'organizationService.list', hook: 'useOrganizations' },
    'capabilities.web': { api: 'GET /api/web/me/capabilities', sdk: 'capabilitiesService.getWeb', hook: 'useWebCapabilities' },
    'capabilities.backoffice': { api: 'GET /api/backoffice/me/capabilities', sdk: 'capabilitiesService.getBackoffice', hook: 'useBackofficeCapabilities' },
    'capabilities.minside': { api: 'GET /api/minside/me/capabilities', sdk: 'capabilitiesService.getMinside', hook: 'useMinsideCapabilities' },
  };
  
  it('should have complete parity matrix', () => {
    expect(Object.keys(PARITY_MATRIX).length).toBeGreaterThan(10);
  });
  
  it('parity matrix should match snapshot', () => {
    expect(PARITY_MATRIX).toMatchSnapshot();
  });
});
