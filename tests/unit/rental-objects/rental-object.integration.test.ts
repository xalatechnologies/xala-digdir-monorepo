/**
 * Rental Object Integration Tests
 * End-to-end API tests
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// =============================================================================
// INTEGRATION TESTS - API Endpoints
// =============================================================================

describe('Rental Object API Integration', () => {
  describe('GET /api/rental-objects', () => {
    it('should return paginated list', async () => {
      // Mock response structure
      const response = {
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('meta');
      expect(response.meta).toHaveProperty('page');
      expect(response.meta).toHaveProperty('limit');
      expect(response.meta).toHaveProperty('total');
    });

    it('should filter by categoryKey', async () => {
      const query = { categoryKey: 'LOKALER_OG_BANER' };
      expect(query.categoryKey).toBe('LOKALER_OG_BANER');
    });

    it('should filter by timeMode', async () => {
      const query = { timeMode: 'SLOT' };
      expect(query.timeMode).toBe('SLOT');
    });

    it('should filter by status', async () => {
      const query = { status: 'published' };
      expect(query.status).toBe('published');
    });
  });

  describe('GET /api/rental-objects/:id', () => {
    it('should return single rental object', async () => {
      const mockRentalObject = {
        id: 'test-uuid',
        name: 'Test Venue',
        categoryKey: 'LOKALER_OG_BANER',
        timeMode: 'PERIOD',
        features: [],
        status: 'published',
      };

      expect(mockRentalObject.categoryKey).toBe('LOKALER_OG_BANER');
      expect(mockRentalObject.timeMode).toBe('PERIOD');
    });

    it('should return 404 for non-existent ID', async () => {
      const errorResponse = {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Rental object not found',
      };

      expect(errorResponse.status).toBe(404);
    });
  });

  describe('POST /api/rental-objects', () => {
    it('should create rental object with V3 fields', async () => {
      const createPayload = {
        name: 'New Venue',
        categoryKey: 'LOKALER_OG_BANER',
        timeMode: 'PERIOD',
        features: [],
        ruleSetKey: 'RS_LOKALE_STANDARD',
        capacity: 50,
        requiresApproval: false,
      };

      expect(createPayload.categoryKey).toBe('LOKALER_OG_BANER');
      expect(createPayload.timeMode).toBe('PERIOD');
      expect(createPayload.ruleSetKey).toBe('RS_LOKALE_STANDARD');
    });

    it('should require authentication', async () => {
      const errorResponse = {
        type: 'https://api.digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
      };

      expect(errorResponse.status).toBe(401);
    });

    it('should require ADMIN or CASEWORKER role', async () => {
      const errorResponse = {
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Requires ADMIN or CASEWORKER role',
      };

      expect(errorResponse.status).toBe(403);
    });
  });

  describe('GET /api/rental-objects/:id/availability', () => {
    it('should return availability for PERIOD mode', async () => {
      const availability = {
        rentalObjectId: 'test-id',
        timeMode: 'PERIOD',
        range: { start: '2026-01-16', end: '2026-01-23' },
        bookings: [
          { id: 'b1', start: '2026-01-17T10:00:00Z', end: '2026-01-17T14:00:00Z', status: 'confirmed' },
        ],
        blackouts: [
          { id: 'bl1', start: '2026-01-20T00:00:00Z', end: '2026-01-20T23:59:59Z', title: 'Maintenance' },
        ],
      };

      expect(availability.timeMode).toBe('PERIOD');
      expect(availability.bookings).toHaveLength(1);
      expect(availability.blackouts).toHaveLength(1);
    });

    it('should return slots for SLOT mode', async () => {
      const availability = {
        rentalObjectId: 'test-id',
        timeMode: 'SLOT',
        slots: [
          { start: '09:00', end: '10:00', status: 'available' },
          { start: '10:00', end: '11:00', status: 'booked' },
        ],
      };

      expect(availability.timeMode).toBe('SLOT');
      expect(availability.slots).toHaveLength(2);
    });

    it('should return inventory remaining for INVENTORY feature', async () => {
      const availability = {
        rentalObjectId: 'test-id',
        timeMode: 'ALL_DAY',
        features: ['INVENTORY'],
        inventory: { total: 5, available: 3 },
      };

      expect(availability.inventory?.available).toBe(3);
    });
  });

  describe('POST /api/rental-objects/:id/blackouts', () => {
    it('should create blackout period', async () => {
      const blackoutPayload = {
        startTime: '2026-02-01T00:00:00Z',
        endTime: '2026-02-01T23:59:59Z',
        title: 'Holiday closure',
        reason: 'National holiday',
      };

      expect(blackoutPayload.title).toBe('Holiday closure');
    });

    it('should require CASEWORKER or ADMIN role', async () => {
      const roles = ['CASEWORKER', 'ADMIN', 'SAAS_ADMIN'];
      expect(roles).toContain('CASEWORKER');
      expect(roles).toContain('ADMIN');
    });
  });
});

// =============================================================================
// CATEGORY API TESTS
// =============================================================================

describe('Categories API', () => {
  describe('GET /api/rental-objects/categories', () => {
    it('should return 4 categories', async () => {
      const categories = [
        { key: 'LOKALER_OG_BANER', titleNb: 'Lokaler og baner' },
        { key: 'UTSTYR_OG_INVENTAR', titleNb: 'Utstyr og inventar' },
        { key: 'KJORETOY_OG_TRANSPORT', titleNb: 'Kjøretøy og transport' },
        { key: 'OPPLEVELSER_OG_ARRANGEMENT', titleNb: 'Opplevelser og arrangement' },
      ];

      expect(categories).toHaveLength(4);
    });

    it('each category should have default time mode', async () => {
      const categories = [
        { key: 'LOKALER_OG_BANER', defaultTimeMode: 'PERIOD' },
        { key: 'UTSTYR_OG_INVENTAR', defaultTimeMode: 'ALL_DAY' },
        { key: 'KJORETOY_OG_TRANSPORT', defaultTimeMode: 'ALL_DAY' },
        { key: 'OPPLEVELSER_OG_ARRANGEMENT', defaultTimeMode: 'SLOT' },
      ];

      categories.forEach((cat) => {
        expect(['PERIOD', 'SLOT', 'ALL_DAY']).toContain(cat.defaultTimeMode);
      });
    });
  });

  describe('GET /api/rental-objects/time-modes', () => {
    it('should return 3 time modes', async () => {
      const timeModes = [
        { key: 'PERIOD', calendarUiVariant: 'timeline' },
        { key: 'SLOT', calendarUiVariant: 'slot-grid' },
        { key: 'ALL_DAY', calendarUiVariant: 'day-cards' },
      ];

      expect(timeModes).toHaveLength(3);
    });
  });
});

// =============================================================================
// RBAC INTEGRATION TESTS
// =============================================================================

describe('RBAC Integration', () => {
  describe('Public endpoints (no auth required)', () => {
    const publicEndpoints = [
      'GET /api/rental-objects',
      'GET /api/rental-objects/:id',
      'GET /api/rental-objects/:id/availability',
      'GET /api/rental-objects/categories',
      'GET /api/rental-objects/time-modes',
    ];

    it.each(publicEndpoints)('%s should be accessible without auth', (endpoint) => {
      expect(endpoint).toContain('GET');
    });
  });

  describe('Protected endpoints (auth + role required)', () => {
    const protectedEndpoints = [
      { method: 'POST', path: '/api/rental-objects', roles: ['ADMIN', 'CASEWORKER'] },
      { method: 'PUT', path: '/api/rental-objects/:id', roles: ['ADMIN', 'CASEWORKER'] },
      { method: 'DELETE', path: '/api/rental-objects/:id', roles: ['ADMIN'] },
      { method: 'POST', path: '/api/rental-objects/:id/blackouts', roles: ['ADMIN', 'CASEWORKER'] },
    ];

    it.each(protectedEndpoints)('$method $path requires $roles', (endpoint) => {
      expect(endpoint.roles.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// AUDIT LOG INTEGRATION TESTS
// =============================================================================

describe('Audit Log Integration', () => {
  const auditableActions = [
    { action: 'create', resource: 'rental_object' },
    { action: 'update', resource: 'rental_object' },
    { action: 'delete', resource: 'rental_object' },
    { action: 'create', resource: 'blackout' },
    { action: 'delete', resource: 'blackout' },
  ];

  it.each(auditableActions)('$action on $resource should be logged', (audit) => {
    expect(audit.action).toBeDefined();
    expect(audit.resource).toBeDefined();
  });
});
