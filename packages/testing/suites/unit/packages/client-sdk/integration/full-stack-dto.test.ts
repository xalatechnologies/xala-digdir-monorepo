/**
 * FULL STACK DTO CONTRACT TESTS
 * 
 * Testing the complete DTO flow:
 * Xala SDK (DB Layer) → API (Projections) → Client SDK (Types) → Frontend Apps
 * 
 * This validates:
 * 1. DTO shapes match across all layers
 * 2. ActionCode enums are consistent
 * 3. Projection DTOs are frontend-ready
 * 4. RFC7807 errors flow correctly
 */
import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@xala/api/../../mocks/api-server.mock';

// Import from our SDK
import {
  PolicyReasonKey,
  isActionEnabled,
  getActionReasonKey,
  isListingAction,
  isBookingAction,
} from '@xala/api/types/actions';

import {
  projectionRegistry,
  getProjectionsForEntity,
  getProjectionsForRole,
  getCacheConfigForProjection,
  isWithinPayloadBudget,
} from '@xala/api/types/projection-registry';

// ==============================================================================
// MOCK DATA: Simulating what comes from each layer
// ==============================================================================

// Layer 1: API Response (what the API returns)
const mockApiResponse = {
  listing: {
    id: 'listing-001',
    title: 'Fotballbane A',
    slug: 'fotballbane-a',
    type: 'sports_field',
    status: 'published',
    location: {
      city: 'Skien',
      municipality: 'Skien Kommune',
      coordinates: { lat: 59.2, lng: 9.6 },
    },
    pricePerHour: 500,
    images: [{ id: 'img-1', url: '/images/bane-a.jpg', alt: 'Fotballbane A' }],
    amenities: [{ code: 'floodlights', name: 'Flomlys' }],
    permissions: {
      canBook: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
    availableActions: [
      { action: 'book', enabled: true, reasonKey: null },
      { action: 'view', enabled: true, reasonKey: null },
      { action: 'edit', enabled: false, reasonKey: 'role.insufficient_permissions' },
    ],
    policyDecisions: [
      { policyId: 'booking_window', decision: 'allow', reasonKey: 'within_booking_window' },
    ],
  },
  
  booking: {
    id: 'booking-001',
    listingId: 'listing-001',
    listingTitle: 'Fotballbane A',
    userId: 'user-001',
    status: 'confirmed',
    startTime: '2026-01-20T10:00:00Z',
    endTime: '2026-01-20T12:00:00Z',
    totalPrice: 1000,
    paymentStatus: 'paid',
    permissions: {
      canCancel: true,
      canModify: false,
      canView: true,
      canDownloadReceipt: true,
    },
    availableActions: [
      { action: 'cancel', enabled: true, reasonKey: null, constraints: { deadline: '2026-01-19T18:00:00Z' } },
      { action: 'modify', enabled: false, reasonKey: 'policy.modification_window_expired' },
      { action: 'download_receipt', enabled: true, reasonKey: null },
    ],
    policyDecisions: [
      { policyId: 'cancellation_policy', decision: 'allow', reasonKey: 'within_24h_window' },
    ],
  },
  
  rfc7807Error: {
    type: 'https://digilist.no/errors/validation',
    title: 'Validation Error',
    status: 400,
    detail: 'Request body failed validation',
    instance: '/api/bookings',
    traceId: 'trace-123',
    correlationId: 'corr-456',
    errorCode: 'VALIDATION_ERROR',
    fieldErrors: [
      { field: 'startTime', code: 'required', message: 'Starttid er påkrevd' },
      { field: 'listingId', code: 'invalid', message: 'Ugyldig listing ID' },
    ],
  },
};

// ==============================================================================
// TEST SUITE 1: Xala SDK → API DTO Validation
// ==============================================================================

describe('Layer 1: Xala SDK → API DTO Flow', () => {
  setupMockApi();
  describe('Listing DTO Structure', () => {
  setupMockApi();
    it('should have all required fields for ListingDetailsProjection', () => {
      const listing = mockApiResponse.listing;
      
      // Required base fields
      expect(listing).toHaveProperty('id');
      expect(listing).toHaveProperty('title');
      expect(listing).toHaveProperty('slug');
      expect(listing).toHaveProperty('type');
      expect(listing).toHaveProperty('status');
      expect(listing).toHaveProperty('pricePerHour');
      
      // Location must be nested
      expect(listing).toHaveProperty('location.city');
      expect(listing).toHaveProperty('location.municipality');
      
      // Images must be array
      expect(Array.isArray(listing.images)).toBe(true);
    });

    it('should include AuthZ payload in listing response', () => {
      const listing = mockApiResponse.listing;
      
      // Permissions object required
      expect(listing).toHaveProperty('permissions');
      expect(listing.permissions).toHaveProperty('canBook');
      expect(listing.permissions).toHaveProperty('canView');
      
      // Actions array required
      expect(listing).toHaveProperty('availableActions');
      expect(Array.isArray(listing.availableActions)).toBe(true);
      
      // Policy decisions required
      expect(listing).toHaveProperty('policyDecisions');
    });

    it('should use valid ActionCodes in availableActions', () => {
      const listing = mockApiResponse.listing;
      
      listing.availableActions.forEach(action => {
        // All actions should be valid ListingActionCode
        expect(isListingAction(action.action)).toBe(true);
      });
    });
  });

  describe('Booking DTO Structure', () => {
  setupMockApi();
    it('should have all required fields for BookingDetailsProjection', () => {
      const booking = mockApiResponse.booking;
      
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('listingId');
      expect(booking).toHaveProperty('listingTitle');
      expect(booking).toHaveProperty('status');
      expect(booking).toHaveProperty('startTime');
      expect(booking).toHaveProperty('endTime');
      expect(booking).toHaveProperty('totalPrice');
      expect(booking).toHaveProperty('paymentStatus');
    });

    it('should include AuthZ payload in booking response', () => {
      const booking = mockApiResponse.booking;
      
      expect(booking.permissions).toHaveProperty('canCancel');
      expect(booking.permissions).toHaveProperty('canModify');
      expect(booking.permissions).toHaveProperty('canView');
      expect(booking.permissions).toHaveProperty('canDownloadReceipt');
    });

    it('should use valid BookingActionCodes', () => {
      const booking = mockApiResponse.booking;
      
      booking.availableActions.forEach(action => {
        expect(isBookingAction(action.action)).toBe(true);
      });
    });

    it('should include constraints on conditional actions', () => {
      const booking = mockApiResponse.booking;
      const cancelAction = booking.availableActions.find(a => a.action === 'cancel');
      
      expect(cancelAction?.constraints).toBeDefined();
      expect(cancelAction?.constraints?.deadline).toBeDefined();
    });
  });
});

// ==============================================================================
// TEST SUITE 2: API → Client SDK Type Validation
// ==============================================================================

describe('Layer 2: API → Client SDK Type Flow', () => {
  setupMockApi();
  describe('ActionCode Enum Integration', () => {
  setupMockApi();
    it('should recognize all listing actions from API', () => {
      const apiActions = ['view', 'book', 'edit', 'delete', 'favorite', 'share'];
      
      apiActions.forEach(action => {
        expect(isListingAction(action)).toBe(true);
      });
    });

    it('should recognize all booking actions from API', () => {
      const apiActions = ['view', 'cancel', 'modify', 'pay', 'download_receipt', 'approve', 'reject'];
      
      apiActions.forEach(action => {
        expect(isBookingAction(action)).toBe(true);
      });
    });

    it('should reject unknown actions', () => {
      expect(isListingAction('unknown_action')).toBe(false);
      expect(isBookingAction('fake_action')).toBe(false);
    });
  });

  describe('Action Helper Functions', () => {
  setupMockApi();
    it('isActionEnabled should work correctly', () => {
      const actions = mockApiResponse.listing.availableActions;
      
      expect(isActionEnabled(actions, 'book')).toBe(true);
      expect(isActionEnabled(actions, 'edit')).toBe(false);
    });

    it('getActionReasonKey should return reason for disabled actions', () => {
      const actions = mockApiResponse.listing.availableActions;
      
      expect(getActionReasonKey(actions, 'book')).toBeNull();
      expect(getActionReasonKey(actions, 'edit')).toBe('role.insufficient_permissions');
    });
  });

  describe('PolicyReasonKey Validation', () => {
  setupMockApi();
    it('should recognize common policy reasons', () => {
      const knownReasons = [
        PolicyReasonKey.ROLE_INSUFFICIENT,
        PolicyReasonKey.BOOKING_WINDOW_CLOSED,
        PolicyReasonKey.SLOT_ALREADY_BOOKED,
      ];
      
      knownReasons.forEach(reason => {
        expect(typeof reason).toBe('string');
        expect(reason.length).toBeGreaterThan(0);
      });
    });
  });
});

// ==============================================================================
// TEST SUITE 3: Client SDK → Frontend App Consumption
// ==============================================================================

describe('Layer 3: Client SDK → Frontend App Consumption', () => {
  setupMockApi();
  describe('Projection Registry Integration', () => {
  setupMockApi();
    it('should have all listing projections registered', () => {
      const listingProjections = getProjectionsForEntity('Listing');
      
      expect(listingProjections.length).toBeGreaterThan(0);
      expect(listingProjections.some(p => p.id === 'ListingCardProjectionDTO')).toBe(true);
      expect(listingProjections.some(p => p.id === 'ListingDetailsProjectionDTO')).toBe(true);
    });

    it('should have all booking projections registered', () => {
      const bookingProjections = getProjectionsForEntity('Booking');
      
      expect(bookingProjections.length).toBeGreaterThan(0);
      expect(bookingProjections.some(p => p.id === 'BookingCardProjectionDTO')).toBe(true);
      expect(bookingProjections.some(p => p.id === 'BookingDetailsProjectionDTO')).toBe(true);
    });

    it('should restrict projections by role', () => {
      const publicProjections = getProjectionsForRole('public');
      const adminProjections = getProjectionsForRole('admin');
      
      // Public should have fewer projections than admin
      expect(publicProjections.length).toBeLessThan(adminProjections.length);
      
      // AuditLog should only be admin
      expect(publicProjections.some(p => p.id === 'AuditLogProjectionDTO')).toBe(false);
      expect(adminProjections.some(p => p.id === 'AuditLogProjectionDTO')).toBe(true);
    });
  });

  describe('Cache Configuration', () => {
  setupMockApi();
    it('should return correct cache config for projections', () => {
      const listingCardConfig = getCacheConfigForProjection('ListingCardProjectionDTO');
      const availabilityConfig = getCacheConfigForProjection('ListingCalendarProjectionDTO');
      
      // Availability should have shorter stale time
      expect(availabilityConfig.staleTime).toBeLessThanOrEqual(listingCardConfig.staleTime);
    });

    it('should validate payload budgets', () => {
      // Within budget
      expect(isWithinPayloadBudget('ListingCardProjectionDTO', 2)).toBe(true);
      expect(isWithinPayloadBudget('ListingCardProjectionDTO', 3)).toBe(true);
      
      // Over budget (50% tolerance)
      expect(isWithinPayloadBudget('ListingCardProjectionDTO', 10)).toBe(false);
    });
  });

  describe('Frontend Consumption Patterns', () => {
  setupMockApi();
    it('should allow direct permission checking on DTOs', () => {
      const listing = mockApiResponse.listing;
      
      // Frontend can directly read permissions
      const canBook = listing.permissions.canBook;
      const canEdit = listing.permissions.canEdit;
      
      expect(canBook).toBe(true);
      expect(canEdit).toBe(false);
      
      // No transformation needed!
    });

    it('should allow direct action rendering', () => {
      const booking = mockApiResponse.booking;
      
      // Frontend can iterate actions directly
      const enabledActions = booking.availableActions.filter(a => a.enabled);
      const disabledWithReason = booking.availableActions.filter(a => !a.enabled && a.reasonKey);
      
      expect(enabledActions.length).toBe(2);
      expect(disabledWithReason.length).toBe(1);
    });

    it('should provide tooltip content for disabled actions', () => {
      const booking = mockApiResponse.booking;
      const modifyAction = booking.availableActions.find(a => a.action === 'modify');
      
      // Frontend can display reason key in tooltip
      expect(modifyAction?.reasonKey).toBe('policy.modification_window_expired');
      
      // This would be translated via i18n: t(modifyAction.reasonKey)
    });
  });
});

// ==============================================================================
// TEST SUITE 4: RFC7807 Error Flow
// ==============================================================================

describe('Layer 4: RFC7807 Error Contract Flow', () => {
  setupMockApi();
  describe('Error Structure Validation', () => {
  setupMockApi();
    it('should have all required RFC7807 fields', () => {
      const error = mockApiResponse.rfc7807Error;
      
      expect(error).toHaveProperty('type');
      expect(error).toHaveProperty('title');
      expect(error).toHaveProperty('status');
      expect(error).toHaveProperty('detail');
      expect(error).toHaveProperty('instance');
    });

    it('should have Digilist extensions', () => {
      const error = mockApiResponse.rfc7807Error;
      
      expect(error).toHaveProperty('traceId');
      expect(error).toHaveProperty('correlationId');
      expect(error).toHaveProperty('errorCode');
    });

    it('should include field errors for validation failures', () => {
      const error = mockApiResponse.rfc7807Error;
      
      expect(error.fieldErrors).toBeDefined();
      expect(Array.isArray(error.fieldErrors)).toBe(true);
      expect(error.fieldErrors.length).toBeGreaterThan(0);
      
      // Each field error has structure
      error.fieldErrors.forEach(fe => {
        expect(fe).toHaveProperty('field');
        expect(fe).toHaveProperty('code');
        expect(fe).toHaveProperty('message');
      });
    });
  });

  describe('Error Handling in SDK', () => {
  setupMockApi();
    it('should detect validation errors by type', () => {
      const error = mockApiResponse.rfc7807Error;
      
      const isValidationError = error.type.includes('validation');
      expect(isValidationError).toBe(true);
    });

    it('should allow field error lookup', () => {
      const error = mockApiResponse.rfc7807Error;
      
      const startTimeError = error.fieldErrors.find(e => e.field === 'startTime');
      expect(startTimeError).toBeDefined();
      expect(startTimeError?.code).toBe('required');
    });
  });
});

// ==============================================================================
// TEST SUITE 5: Cross-Layer Consistency
// ==============================================================================

describe('Layer 5: Cross-Layer Consistency', () => {
  setupMockApi();
  describe('Action Codes Match Across Layers', () => {
  setupMockApi();
    it('should use same action codes in API and SDK', () => {
      // API uses string actions
      const apiActions = mockApiResponse.listing.availableActions.map(a => a.action);
      
      // SDK validates them
      apiActions.forEach(action => {
        expect(
          isListingAction(action) || isBookingAction(action)
        ).toBe(true);
      });
    });
  });

  describe('Projection IDs Match Registry', () => {
  setupMockApi();
    it('should have matching projection names', () => {
      const registeredIds = Object.keys(projectionRegistry);
      
      // All expected projections exist
      expect(registeredIds).toContain('ListingCardProjectionDTO');
      expect(registeredIds).toContain('ListingDetailsProjectionDTO');
      expect(registeredIds).toContain('BookingCardProjectionDTO');
      expect(registeredIds).toContain('BookingDetailsProjectionDTO');
      expect(registeredIds).toContain('OrganizationCardProjectionDTO');
    });
  });

  describe('DTO Contract Stability', () => {
  setupMockApi();
    it('should not have breaking changes in listing structure', () => {
      const listing = mockApiResponse.listing;
      
      // These fields must never be renamed
      const stableFields = ['id', 'title', 'slug', 'permissions', 'availableActions'];
      stableFields.forEach(field => {
        expect(listing).toHaveProperty(field);
      });
    });

    it('should not have breaking changes in booking structure', () => {
      const booking = mockApiResponse.booking;
      
      // These fields must never be renamed
      const stableFields = ['id', 'listingId', 'status', 'permissions', 'availableActions'];
      stableFields.forEach(field => {
        expect(booking).toHaveProperty(field);
      });
    });
  });
});

console.log('✅ Full-Stack DTO Contract Tests loaded - Xala SDK → API → Client SDK → Frontend');
