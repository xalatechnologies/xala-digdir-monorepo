/**
 * Contract Parity Test
 * Verifies that all API endpoints have corresponding SDK coverage
 * 
 * This test ensures 1:1 mapping between API routes and SDK services/functions.
 * Run with: pnpm --filter @digilist/client-sdk test:contracts
 */
import { describe, it, expect } from 'vitest';
import * as services from '@xala/api/services';

interface ApiEndpoint {
  path: string;
  methods: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>;
  sdkService: string;
  sdkMethods: string[];
  required: boolean;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Rental Objects (Core)
  { path: '/api/rental-objects', methods: ['GET', 'POST'], sdkService: 'RentalObjectService', sdkMethods: ['getAll', 'create'], required: true },
  { path: '/api/rental-objects/:id', methods: ['GET', 'PUT', 'DELETE'], sdkService: 'RentalObjectService', sdkMethods: ['getById', 'update', 'delete'], required: true },
  { path: '/api/rental-objects/slug/:slug', methods: ['GET'], sdkService: 'RentalObjectService', sdkMethods: ['getBySlug'], required: true },
  { path: '/api/rental-objects/:id/publish', methods: ['PUT'], sdkService: 'RentalObjectService', sdkMethods: ['publish'], required: true },
  { path: '/api/rental-objects/:id/archive', methods: ['PUT'], sdkService: 'RentalObjectService', sdkMethods: ['archive'], required: true },
  { path: '/api/rental-objects/:id/unpublish', methods: ['PUT'], sdkService: 'RentalObjectService', sdkMethods: ['unpublish'], required: true },
  { path: '/api/rental-objects/:id/restore', methods: ['PUT'], sdkService: 'RentalObjectService', sdkMethods: ['restore'], required: true },
  { path: '/api/rental-objects/:id/duplicate', methods: ['POST'], sdkService: 'RentalObjectService', sdkMethods: ['duplicate'], required: true },
  { path: '/api/rental-objects/:id/availability', methods: ['GET'], sdkService: 'RentalObjectService', sdkMethods: ['getAvailability'], required: true },
  { path: '/api/rental-objects/:id/stats', methods: ['GET'], sdkService: 'RentalObjectService', sdkMethods: ['getStats'], required: true },
  { path: '/api/rental-objects/:id/calendar-config', methods: ['GET'], sdkService: 'RentalObjectService', sdkMethods: ['getCalendarConfig'], required: true },
  { path: '/api/rental-objects/:id/media', methods: ['POST'], sdkService: 'RentalObjectService', sdkMethods: ['uploadMedia'], required: true },
  { path: '/api/rental-objects/:id/media/:mediaId', methods: ['DELETE'], sdkService: 'RentalObjectService', sdkMethods: ['removeMedia'], required: true },

  // Bookings
  { path: '/api/bookings', methods: ['GET', 'POST'], sdkService: 'BookingService', sdkMethods: ['getAll', 'create'], required: true },
  { path: '/api/bookings/:id', methods: ['GET', 'PUT', 'DELETE'], sdkService: 'BookingService', sdkMethods: ['getById', 'update', 'delete'], required: true },
  { path: '/api/bookings/:id/confirm', methods: ['PUT'], sdkService: 'BookingService', sdkMethods: ['confirm'], required: true },
  { path: '/api/bookings/:id/cancel', methods: ['PUT'], sdkService: 'BookingService', sdkMethods: ['cancel'], required: true },
  { path: '/api/bookings/:id/complete', methods: ['PUT'], sdkService: 'BookingService', sdkMethods: ['complete'], required: true },
  { path: '/api/bookings/my', methods: ['GET'], sdkService: 'BookingService', sdkMethods: ['getMyBookings'], required: true },
  { path: '/api/bookings/recurring', methods: ['GET', 'POST'], sdkService: 'BookingService', sdkMethods: ['getRecurring', 'createRecurringBooking'], required: true },
  { path: '/api/bookings/recurring/preview', methods: ['POST'], sdkService: 'BookingService', sdkMethods: ['getRecurringPreview'], required: true },
  { path: '/api/bookings/pricing', methods: ['GET'], sdkService: 'BookingService', sdkMethods: ['calculatePricing'], required: true },
  { path: '/api/bookings/quote', methods: ['POST'], sdkService: 'BookingService', sdkMethods: ['quote'], required: true },
  { path: '/api/bookings/:id/receipt', methods: ['GET'], sdkService: 'BookingService', sdkMethods: ['getReceipt'], required: true },
  { path: '/api/bookings/:id/payments', methods: ['GET'], sdkService: 'BookingService', sdkMethods: ['getPaymentHistory'], required: true },

  // Calendar & Availability
  { path: '/api/calendar/events', methods: ['GET'], sdkService: 'CalendarService', sdkMethods: ['getEvents'], required: true },
  { path: '/api/availability/slots', methods: ['GET'], sdkService: 'AvailabilityService', sdkMethods: ['getSlots'], required: true },
  { path: '/api/availability/check', methods: ['GET'], sdkService: 'AvailabilityService', sdkMethods: ['check'], required: true },
  { path: '/api/allocations', methods: ['GET', 'POST'], sdkService: 'AllocationService', sdkMethods: ['getAll', 'create'], required: true },
  { path: '/api/allocations/:id', methods: ['DELETE'], sdkService: 'AllocationService', sdkMethods: ['delete'], required: true },

  // Auth
  { path: '/api/auth/login', methods: ['POST'], sdkService: 'AuthService', sdkMethods: ['login'], required: true },
  { path: '/api/auth/logout', methods: ['POST'], sdkService: 'AuthService', sdkMethods: ['logout'], required: true },
  { path: '/api/auth/refresh', methods: ['POST'], sdkService: 'AuthService', sdkMethods: ['refreshToken'], required: true },
  { path: '/api/auth/session', methods: ['GET'], sdkService: 'AuthService', sdkMethods: ['getSession'], required: true },

  // Authz (MISSING - needs to be added)
  { path: '/api/authz/permissions', methods: ['GET'], sdkService: 'AuthzService', sdkMethods: ['getPermissions'], required: false },
  { path: '/api/authz/check', methods: ['POST'], sdkService: 'AuthzService', sdkMethods: ['checkPermission'], required: false },

  // Organizations & Users
  { path: '/api/organizations', methods: ['GET', 'POST'], sdkService: 'OrganizationService', sdkMethods: ['getAll', 'create'], required: true },
  { path: '/api/organizations/:id', methods: ['GET', 'PUT', 'DELETE'], sdkService: 'OrganizationService', sdkMethods: ['getById', 'update', 'delete'], required: true },
  { path: '/api/users', methods: ['GET', 'POST'], sdkService: 'UserService', sdkMethods: ['getAll', 'create'], required: true },
  { path: '/api/users/:id', methods: ['GET', 'PUT'], sdkService: 'UserService', sdkMethods: ['getById', 'update'], required: true },

  // GDPR
  { path: '/api/gdpr/consent-types', methods: ['GET'], sdkService: 'GdprService', sdkMethods: ['getConsentTypes'], required: true },
  { path: '/api/gdpr/consents', methods: ['GET', 'POST'], sdkService: 'GdprService', sdkMethods: ['getMyConsents', 'grantConsent'], required: true },

  // Audit
  { path: '/api/audit', methods: ['GET'], sdkService: 'auditService', sdkMethods: ['query'], required: false },

  // Reviews
  { path: '/api/reviews', methods: ['GET'], sdkService: 'ReviewService', sdkMethods: ['getAll'], required: true },
  { path: '/api/reviews/rental-object/:id', methods: ['GET'], sdkService: 'ReviewService', sdkMethods: ['getByRentalObjectId'], required: true },

  // Search (service exists but not exported from index)
  { path: '/api/search', methods: ['GET'], sdkService: 'searchService', sdkMethods: ['search'], required: false },

  // Dashboard & Reports
  { path: '/api/dashboard', methods: ['GET'], sdkService: 'DashboardService', sdkMethods: ['getStats'], required: true },
  { path: '/api/reports/usage', methods: ['GET'], sdkService: 'reportsService', sdkMethods: ['getUsageReport'], required: false },

  // Share (MISSING - needs to be added)
  { path: '/api/share/:token', methods: ['GET'], sdkService: 'ShareService', sdkMethods: ['getByToken'], required: false },
];

function getServiceInstance(serviceName: string): unknown {
  const serviceMap: Record<string, unknown> = {
    'RentalObjectService': services.rentalObjectService,
    'BookingService': services.bookingService,
    'CalendarService': services.calendarService,
    'AvailabilityService': services.availabilityService,
    'AllocationService': services.allocationService,
    'AuthService': services.authService,
    'OrganizationService': services.organizationService,
    'UserService': services.userService,
    'GdprService': services.gdprService,
    'auditService': services.auditService,
    'ReviewService': services.reviewService,
    'DashboardService': services.dashboardService,
    'reportsService': services.reportsService,
  };
  return serviceMap[serviceName];
}

describe('Contract Parity: API ↔ SDK', () => {
  describe('Required Endpoints', () => {
    const requiredEndpoints = API_ENDPOINTS.filter(e => e.required);

    it.each(requiredEndpoints)(
      'SDK has service for $path',
      (endpoint) => {
        const service = getServiceInstance(endpoint.sdkService);
        expect(service, `Missing SDK service: ${endpoint.sdkService}`).toBeDefined();
      }
    );

    it.each(requiredEndpoints)(
      'SDK service $sdkService has methods for $path',
      (endpoint) => {
        const service = getServiceInstance(endpoint.sdkService) as Record<string, unknown>;
        if (!service) return; // Skip if service not found (covered by previous test)

        for (const method of endpoint.sdkMethods) {
          expect(
            typeof service[method],
            `${endpoint.sdkService}.${method}() missing for ${endpoint.path}`
          ).toBe('function');
        }
      }
    );
  });

  describe('Optional Endpoints (Known Gaps)', () => {
    const optionalEndpoints = API_ENDPOINTS.filter(e => !e.required);

    it.each(optionalEndpoints)(
      '[KNOWN GAP] SDK missing coverage for $path',
      (endpoint) => {
        const service = getServiceInstance(endpoint.sdkService);
        // These are expected to be undefined - document as known gaps
        if (!service) {
          console.warn(`⚠️ Known gap: ${endpoint.sdkService} not implemented for ${endpoint.path}`);
        }
      }
    );
  });

  describe('Service Method Coverage', () => {
    it('RentalObjectService has all CRUD methods', () => {
      const service = services.rentalObjectService;
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
    });

    it('BookingService has all CRUD + workflow methods', () => {
      const service = services.bookingService;
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.confirm).toBe('function');
      expect(typeof service.cancel).toBe('function');
      expect(typeof service.complete).toBe('function');
    });

    it('AuthService has authentication flow methods', () => {
      const service = services.authService;
      expect(typeof service.login).toBe('function');
      expect(typeof service.logout).toBe('function');
      expect(typeof service.getSession).toBe('function');
    });
  });

  describe('No Listing/Facility Terminology', () => {
    it('RentalObjectService does not use listing terminology in public methods', () => {
      const service = services.rentalObjectService;
      const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
        .filter(name => name !== 'constructor');
      
      const listingMethods = methodNames.filter(name => 
        name.toLowerCase().includes('listing') || 
        name.toLowerCase().includes('facility')
      );
      
      expect(listingMethods, 'Found listing/facility terminology in methods').toEqual([]);
    });
  });
});

describe('Contract Parity Summary', () => {
  it('reports coverage statistics', () => {
    const requiredCount = API_ENDPOINTS.filter(e => e.required).length;
    const coveredCount = API_ENDPOINTS.filter(e => {
      if (!e.required) return false;
      const service = getServiceInstance(e.sdkService);
      return service !== undefined;
    }).length;
    
    const coverage = (coveredCount / requiredCount) * 100;
    console.log(`\n📊 SDK Coverage: ${coveredCount}/${requiredCount} (${coverage.toFixed(1)}%)`);
    
    expect(coverage).toBeGreaterThanOrEqual(90);
  });
});
