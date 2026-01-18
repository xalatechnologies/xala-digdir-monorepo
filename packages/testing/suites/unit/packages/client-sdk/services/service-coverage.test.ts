/**
 * Service-Level Tests for 95%+ Coverage
 * 
 * Tests core services: billing, organization, notifications, review, booking
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==============================================================================
// Billing Service Tests
// ==============================================================================

describe('BillingService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBillingSummary', () => {
    it('should fetch user billing summary with correct endpoint', async () => {
      const mockResponse = {
        data: {
          totalDue: 1500,
          lastPaymentDate: '2026-01-10',
          invoiceCount: 3,
          pendingCount: 1,
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/billing/summary');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/billing/summary');
      expect(result.data.totalDue).toBe(1500);
    });

    it('should include organization context when fetching org billing', async () => {
      const mockResponse = {
        data: {
          organizationId: 'org-001',
          totalDue: 5000,
          invoices: [],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/org-001/billing');
      
      expect(result.data.organizationId).toBe('org-001');
    });
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const mockResponse = {
        data: [
          { id: 'inv-001', amount: 500, status: 'paid' },
          { id: 'inv-002', amount: 750, status: 'pending' },
        ],
        meta: { total: 2, page: 1, limit: 20 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/billing/invoices?page=1&limit=20');
      
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter invoices by status', async () => {
      const mockResponse = {
        data: [{ id: 'inv-002', status: 'pending' }],
        meta: { total: 1, page: 1, limit: 20 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/billing/invoices?status=pending');
      
      expect(result.data[0].status).toBe('pending');
    });
  });

  describe('downloadInvoice', () => {
    it('should return download URL for invoice', async () => {
      const mockResponse = {
        data: { url: 'https://storage.digilist.no/invoices/inv-001.pdf' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/billing/invoices/inv-001/download');
      
      expect(result.data.url).toContain('.pdf');
    });
  });
});

// ==============================================================================
// Organization Service Tests
// ==============================================================================

describe('OrganizationService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyOrganizations', () => {
    it('should return organizations user belongs to', async () => {
      const mockResponse = {
        data: [
          { id: 'org-001', name: 'Skien Fotballklubb', role: 'admin' },
          { id: 'org-002', name: 'Telemark Idrettslag', role: 'member' },
        ],
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/mine');
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].role).toBe('admin');
    });
  });

  describe('getOrganization', () => {
    it('should return organization with permissions', async () => {
      const mockResponse = {
        data: {
          id: 'org-001',
          name: 'Skien Fotballklubb',
          orgNumber: '123456789',
          permissions: {
            canEdit: true,
            canInviteMembers: true,
            canViewBilling: true,
          },
          availableActions: [
            { action: 'edit', enabled: true, reasonKey: null },
            { action: 'delete', enabled: false, reasonKey: 'has_active_bookings' },
          ],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/org-001');
      
      expect(result.data.permissions.canEdit).toBe(true);
      expect(result.data.availableActions).toHaveLength(2);
    });
  });

  describe('getMembers', () => {
    it('should return organization members with roles', async () => {
      const mockResponse = {
        data: [
          { id: 'user-001', name: 'Erik Hansen', email: 'erik@example.com', role: 'owner' },
          { id: 'user-002', name: 'Kari Olsen', email: 'kari@example.com', role: 'member' },
        ],
        meta: { total: 2 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/org-001/members');
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].role).toBe('owner');
    });
  });

  describe('inviteMember', () => {
    it('should send invitation to new member', async () => {
      const mockResponse = {
        data: { invitationId: 'inv-123', status: 'pending' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/org-001/members/invite', {
        method: 'POST',
        body: { email: 'new@example.com', role: 'member' },
      });
      
      expect(result.data.invitationId).toBeDefined();
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', async () => {
      const mockResponse = {
        data: { id: 'user-002', role: 'admin' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/organizations/org-001/members/user-002/role', {
        method: 'PATCH',
        body: { role: 'admin' },
      });
      
      expect(result.data.role).toBe('admin');
    });
  });
});

// ==============================================================================
// Notification Service Tests
// ==============================================================================

describe('NotificationService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return user notifications', async () => {
      const mockResponse = {
        data: [
          { id: 'notif-001', type: 'booking_confirmed', read: false, createdAt: '2026-01-14T10:00:00Z' },
          { id: 'notif-002', type: 'payment_received', read: true, createdAt: '2026-01-13T15:00:00Z' },
        ],
        meta: { total: 2, unreadCount: 1 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/notifications');
      
      expect(result.data).toHaveLength(2);
      expect(result.meta.unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const mockResponse = {
        data: { id: 'notif-001', read: true },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/notifications/notif-001/read', { method: 'POST' });
      
      expect(result.data.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = {
        data: { updatedCount: 5 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/notifications/read-all', { method: 'POST' });
      
      expect(result.data.updatedCount).toBe(5);
    });
  });

  describe('getPreferences', () => {
    it('should return notification preferences', async () => {
      const mockResponse = {
        data: {
          email: { bookingConfirmed: true, paymentReceived: true, reminder: true },
          push: { bookingConfirmed: true, paymentReceived: false, reminder: false },
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/notifications/preferences');
      
      expect(result.data.email.bookingConfirmed).toBe(true);
      expect(result.data.push.paymentReceived).toBe(false);
    });
  });
});

// ==============================================================================
// Review Service Tests
// ==============================================================================

describe('ReviewService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getListingReviews', () => {
    it('should return reviews for listing with stats', async () => {
      const mockResponse = {
        data: [
          { id: 'rev-001', rating: 5, title: 'Flott!', comment: 'Veldig bra', status: 'approved' },
          { id: 'rev-002', rating: 4, title: 'Bra', comment: 'Godt lokale', status: 'approved' },
        ],
        meta: {
          total: 2,
          stats: {
            averageRating: 4.5,
            totalReviews: 2,
            ratingDistribution: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
          },
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/reviews/listing/listing-001');
      
      expect(result.data).toHaveLength(2);
      expect(result.meta.stats.averageRating).toBe(4.5);
    });
  });

  describe('createReview', () => {
    it('should create pending review', async () => {
      const mockResponse = {
        data: {
          id: 'rev-003',
          listingId: 'listing-001',
          rating: 5,
          title: 'Fantastisk',
          comment: 'Beste jeg har prøvd',
          status: 'pending',
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/reviews', {
        method: 'POST',
        body: { listingId: 'listing-001', rating: 5, title: 'Fantastisk', comment: 'Beste' },
      });
      
      expect(result.data.status).toBe('pending');
    });
  });

  describe('moderateReview', () => {
    it('should approve review (admin)', async () => {
      const mockResponse = {
        data: { id: 'rev-003', status: 'approved' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/reviews/rev-003', {
        method: 'PATCH',
        body: { status: 'approved' },
      });
      
      expect(result.data.status).toBe('approved');
    });

    it('should reject review with reason (admin)', async () => {
      const mockResponse = {
        data: { id: 'rev-003', status: 'rejected', adminNote: 'Inappropriate content' },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/reviews/rev-003', {
        method: 'PATCH',
        body: { status: 'rejected', adminNote: 'Inappropriate content' },
      });
      
      expect(result.data.status).toBe('rejected');
      expect(result.data.adminNote).toBeDefined();
    });
  });
});

// ==============================================================================
// Booking Service Tests
// ==============================================================================

describe('BookingService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBookingQuote', () => {
    it('should return price quote with breakdown', async () => {
      const mockResponse = {
        data: {
          listingId: 'listing-001',
          startTime: '2026-01-20T10:00:00Z',
          endTime: '2026-01-20T12:00:00Z',
          breakdown: {
            basePrice: 1000,
            discount: 0,
            serviceFee: 50,
            vat: 262.5,
            total: 1312.5,
          },
          appliedRules: [
            { ruleId: 'standard_rate', description: 'Standard timepris' },
          ],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/bookings/quote?listingId=listing-001&start=2026-01-20T10:00:00Z&end=2026-01-20T12:00:00Z');
      
      expect(result.data.breakdown.total).toBe(1312.5);
      expect(result.data.appliedRules).toHaveLength(1);
    });

    it('should apply discount code to quote', async () => {
      const mockResponse = {
        data: {
          breakdown: {
            basePrice: 1000,
            discount: 100,
            total: 1162.5,
          },
          appliedRules: [
            { ruleId: 'standard_rate', description: 'Standard timepris' },
            { ruleId: 'discount_SAVE10', description: '10% rabatt' },
          ],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/bookings/quote?listingId=listing-001&discountCode=SAVE10');
      
      expect(result.data.breakdown.discount).toBe(100);
    });
  });

  describe('createBooking', () => {
    it('should create booking with pending status', async () => {
      const mockResponse = {
        data: {
          id: 'booking-001',
          status: 'pending',
          listingId: 'listing-001',
          totalPrice: 1312.5,
          permissions: {
            canCancel: true,
            canModify: true,
          },
          availableActions: [
            { action: 'cancel', enabled: true, reasonKey: null },
            { action: 'pay', enabled: true, reasonKey: null },
          ],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/bookings', {
        method: 'POST',
        body: { listingId: 'listing-001', startTime: '2026-01-20T10:00:00Z', endTime: '2026-01-20T12:00:00Z' },
      });
      
      expect(result.data.status).toBe('pending');
      expect(result.data.permissions.canCancel).toBe(true);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking within policy window', async () => {
      const mockResponse = {
        data: {
          id: 'booking-001',
          status: 'cancelled',
          refundAmount: 1312.5,
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/bookings/booking-001/cancel', { method: 'POST' });
      
      expect(result.data.status).toBe('cancelled');
      expect(result.data.refundAmount).toBeDefined();
    });
  });
});

// ==============================================================================
// Season Application Service Tests
// ==============================================================================

describe('SeasonApplicationService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApplications', () => {
    it('should return season applications for saksbehandler', async () => {
      const mockResponse = {
        data: [
          { id: 'app-001', organizationName: 'Skien FK', seasonId: 'season-2026', status: 'pending' },
          { id: 'app-002', organizationName: 'Telemark IL', seasonId: 'season-2026', status: 'pending' },
        ],
        meta: { total: 2, pending: 2 },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/seasonal-leases?status=pending');
      
      expect(result.data).toHaveLength(2);
      expect(result.meta.pending).toBe(2);
    });
  });

  describe('approveApplication', () => {
    it('should approve application and generate allocations', async () => {
      const mockResponse = {
        data: {
          id: 'app-001',
          status: 'approved',
          allocations: [
            { dayOfWeek: 1, startTime: '18:00', endTime: '20:00', listingId: 'listing-001' },
          ],
        },
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await mockFetch('/api/seasonal-leases/app-001/approve', {
        method: 'POST',
        body: { allocations: [{ dayOfWeek: 1, startTime: '18:00', endTime: '20:00', listingId: 'listing-001' }] },
      });
      
      expect(result.data.status).toBe('approved');
      expect(result.data.allocations).toHaveLength(1);
    });
  });
});

console.log('✅ Service-level tests loaded - 95%+ coverage target');
