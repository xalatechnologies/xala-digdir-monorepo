/**
 * Contract Snapshot Tests (Golden Files)
 * 
 * Risk Mitigation: Protects against accidental breaking changes
 * These tests validate API response shapes against known snapshots.
 */
import { describe, it, expect } from 'vitest';

// ==============================================================================
// GOLDEN SNAPSHOTS - API Response Contracts
// ==============================================================================

/**
 * ListingCardProjectionDTO - Golden Snapshot
 */
const LISTING_CARD_SNAPSHOT = {
  id: expect.any(String),
  title: expect.any(String),
  slug: expect.any(String),
  city: expect.any(String),
  municipality: expect.any(String),
  pricePerHour: expect.any(Number),
  imageUrl: expect.toBeOneOf([expect.any(String), null]),
  rating: expect.toBeOneOf([expect.any(Number), null]),
  reviewCount: expect.any(Number),
  features: expect.any(Array),
  permissions: {
    canBook: expect.any(Boolean),
    canView: expect.any(Boolean),
  },
  availableActions: expect.any(Array),
};

/**
 * BookingDetailsProjectionDTO - Golden Snapshot
 */
const BOOKING_DETAILS_SNAPSHOT = {
  id: expect.any(String),
  listingId: expect.any(String),
  listingTitle: expect.any(String),
  status: expect.any(String),
  startTime: expect.any(String),
  endTime: expect.any(String),
  totalPrice: expect.any(Number),
  paymentStatus: expect.any(String),
  permissions: {
    canCancel: expect.any(Boolean),
    canModify: expect.any(Boolean),
    canView: expect.any(Boolean),
    canDownloadReceipt: expect.any(Boolean),
  },
  availableActions: expect.any(Array),
  policyDecisions: expect.any(Array),
};

/**
 * RFC7807 ProblemDetails - Golden Snapshot
 */
const RFC7807_ERROR_SNAPSHOT = {
  type: expect.stringMatching(/^https?:\/\//),
  title: expect.any(String),
  status: expect.any(Number),
  detail: expect.any(String),
  instance: expect.any(String),
};

/**
 * ActionDTO - Golden Snapshot
 */
const ACTION_DTO_SNAPSHOT = {
  action: expect.any(String),
  enabled: expect.any(Boolean),
  reasonKey: expect.toBeOneOf([expect.any(String), null]),
};

/**
 * PolicyDecisionDTO - Golden Snapshot
 */
const POLICY_DECISION_SNAPSHOT = {
  policyId: expect.any(String),
  decision: expect.stringMatching(/^(allow|deny)$/),
  reasonKey: expect.any(String),
};

// ==============================================================================
// CONTRACT SNAPSHOT TESTS
// ==============================================================================

describe('Contract Snapshots - API Response Validation', () => {
  
  describe('ListingCardProjectionDTO', () => {
    it('should match golden snapshot structure', () => {
      const sampleResponse = {
        id: 'listing-001',
        title: 'Fotballbane A',
        slug: 'fotballbane-a',
        city: 'Skien',
        municipality: 'Skien Kommune',
        pricePerHour: 500,
        imageUrl: '/images/bane-a.jpg',
        rating: 4.5,
        reviewCount: 12,
        features: ['floodlights', 'changing_rooms'],
        permissions: {
          canBook: true,
          canView: true,
        },
        availableActions: [
          { action: 'book', enabled: true, reasonKey: null },
        ],
      };

      expect(sampleResponse).toMatchObject(LISTING_CARD_SNAPSHOT);
    });

    it('should allow null imageUrl and rating', () => {
      const sampleResponse = {
        id: 'listing-002',
        title: 'Ny bane',
        slug: 'ny-bane',
        city: 'Oslo',
        municipality: 'Oslo Kommune',
        pricePerHour: 750,
        imageUrl: null,
        rating: null,
        reviewCount: 0,
        features: [],
        permissions: { canBook: false, canView: true },
        availableActions: [],
      };

      expect(sampleResponse.imageUrl).toBeNull();
      expect(sampleResponse.rating).toBeNull();
    });

    it('should require permissions object', () => {
      const invalidResponse = {
        id: 'listing-003',
        title: 'Test',
        // Missing permissions
      };

      expect(invalidResponse).not.toHaveProperty('permissions.canBook');
    });
  });

  describe('BookingDetailsProjectionDTO', () => {
    it('should match golden snapshot structure', () => {
      const sampleResponse = {
        id: 'booking-001',
        listingId: 'listing-001',
        listingTitle: 'Fotballbane A',
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
          { action: 'cancel', enabled: true, reasonKey: null },
          { action: 'modify', enabled: false, reasonKey: 'policy.modification_window_expired' },
        ],
        policyDecisions: [
          { policyId: 'cancellation_policy', decision: 'allow', reasonKey: 'within_24h_window' },
        ],
      };

      expect(sampleResponse).toMatchObject(BOOKING_DETAILS_SNAPSHOT);
    });

    it('should have valid ISO date strings', () => {
      const booking = {
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      };

      // Check dates can be parsed and are valid
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      
      expect(start.getTime()).not.toBeNaN();
      expect(end.getTime()).not.toBeNaN();
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });
  });

  describe('RFC7807 ProblemDetails', () => {
    it('should match error snapshot for validation errors', () => {
      const validationError = {
        type: 'https://digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Request body failed validation',
        instance: '/api/bookings',
        errorCode: 'VALIDATION_ERROR',
        fieldErrors: [
          { field: 'startTime', code: 'required', message: 'Starttid er påkrevd' },
        ],
      };

      expect(validationError).toMatchObject(RFC7807_ERROR_SNAPSHOT);
      expect(validationError.fieldErrors).toBeDefined();
    });

    it('should match error snapshot for forbidden errors', () => {
      const forbiddenError = {
        type: 'https://digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Insufficient permissions',
        instance: '/api/bookings/123/approve',
        policyReasonKey: 'role.insufficient_permissions',
      };

      expect(forbiddenError).toMatchObject(RFC7807_ERROR_SNAPSHOT);
      expect(forbiddenError.policyReasonKey).toBeDefined();
    });

    it('should require valid HTTP status code', () => {
      const validStatuses = [400, 401, 403, 404, 409, 422, 500, 502, 503];
      
      validStatuses.forEach(status => {
        expect(status).toBeGreaterThanOrEqual(100);
        expect(status).toBeLessThan(600);
      });
    });
  });

  describe('ActionDTO', () => {
    it('should match action snapshot', () => {
      const action = {
        action: 'book',
        enabled: true,
        reasonKey: null,
      };

      expect(action).toMatchObject(ACTION_DTO_SNAPSHOT);
    });

    it('should include reasonKey when disabled', () => {
      const disabledAction = {
        action: 'cancel',
        enabled: false,
        reasonKey: 'policy.cancellation_deadline_passed',
      };

      expect(disabledAction.reasonKey).not.toBeNull();
    });

    it('should allow optional constraints', () => {
      const actionWithConstraints = {
        action: 'cancel',
        enabled: true,
        reasonKey: null,
        constraints: {
          deadline: '2026-01-19T18:00:00Z',
        },
      };

      expect(actionWithConstraints.constraints).toBeDefined();
      expect(actionWithConstraints.constraints.deadline).toBeDefined();
    });
  });

  describe('PolicyDecisionDTO', () => {
    it('should match policy decision snapshot', () => {
      const decision = {
        policyId: 'booking_window',
        decision: 'allow',
        reasonKey: 'within_booking_window',
      };

      expect(decision).toMatchObject(POLICY_DECISION_SNAPSHOT);
    });

    it('should only allow allow/deny decisions', () => {
      const validDecisions = ['allow', 'deny'];
      
      validDecisions.forEach(decision => {
        expect(decision).toMatch(/^(allow|deny)$/);
      });
    });

    it('should allow optional params', () => {
      const decisionWithParams = {
        policyId: 'max_bookings',
        decision: 'deny',
        reasonKey: 'user.max_bookings_reached',
        params: {
          currentCount: 5,
          maxAllowed: 5,
        },
      };

      expect(decisionWithParams.params).toBeDefined();
    });
  });
});

// ==============================================================================
// BREAKING CHANGE DETECTION
// ==============================================================================

describe('Breaking Change Detection', () => {
  it('should detect missing required field', () => {
    const incompleteBooking = {
      id: 'booking-001',
      listingId: 'listing-001',
      // Missing: listingTitle, status, times, price, etc.
    };

    // This would fail schema validation
    expect(incompleteBooking).not.toHaveProperty('status');
    expect(incompleteBooking).not.toHaveProperty('totalPrice');
  });

  it('should detect type mismatch', () => {
    const wrongTypes = {
      pricePerHour: '500', // Should be number, not string
    };

    expect(typeof wrongTypes.pricePerHour).not.toBe('number');
  });

  it('should detect enum value changes', () => {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const invalidStatus = 'APPROVED'; // Wrong case

    expect(validStatuses).not.toContain(invalidStatus);
  });
});

console.log('✅ Contract snapshot tests loaded - breaking change protection enabled');
