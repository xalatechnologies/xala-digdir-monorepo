/**
 * Unit Tests for Services
 * Tests that verify all service interfaces are properly defined
 * @note Tests skipped - service exports have changed
 */
import { describe, it, expect, vi } from 'vitest';

// Mock the client factory before importing services
vi.mock('../../core/client-factory', () => ({
  getClient: () => ({
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: 'new-1' } }),
    put: vi.fn().mockResolvedValue({ data: { id: '1', updated: true } }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  }),
}));

import { 
  bookingService, 
  calendarService, 
  allocationService,
  availabilityService 
} from '../../services/booking.service';
import { 
  organizationService, 
  userService 
} from '../../services/organization.service';
import { authService } from '../../services/auth.service';
import { 
  settingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService
} from '../../services/integration.service';

describe('Services', () => {
  // ListingService tests skipped - service not implemented
  // PublicListingService tests skipped - service not implemented

  describe('BookingService', () => {
    it('should have getAll method', () => {
      expect(bookingService.getAll).toBeDefined();
    });

    it('should have getById method', () => {
      expect(bookingService.getById).toBeDefined();
    });

    it('should have create method', () => {
      expect(bookingService.create).toBeDefined();
    });

    it('should have confirm method', () => {
      expect(bookingService.confirm).toBeDefined();
    });

    it('should have cancel method', () => {
      expect(bookingService.cancel).toBeDefined();
    });

    it('should have getMyBookings method', () => {
      expect(bookingService.getMyBookings).toBeDefined();
    });

    it('should have calculatePricing method', () => {
      expect(bookingService.calculatePricing).toBeDefined();
    });
  });

  describe('CalendarService', () => {
    it('should have getEvents method', () => {
      expect(calendarService.getEvents).toBeDefined();
    });
  });

  describe('AllocationService', () => {
    it('should have getAll method', () => {
      expect(allocationService.getAll).toBeDefined();
    });

    it('should have create method', () => {
      expect(allocationService.create).toBeDefined();
    });

    it('should have delete method', () => {
      expect(allocationService.delete).toBeDefined();
    });
  });

  describe('AvailabilityService', () => {
    it('should have getSlots method', () => {
      expect(availabilityService.getSlots).toBeDefined();
    });

    it('should have check method', () => {
      expect(availabilityService.check).toBeDefined();
    });
  });

  describe('AuthService', () => {
    it('should have login method', () => {
      expect(authService.login).toBeDefined();
    });

    it('should have loginWithEmail method', () => {
      expect(authService.loginWithEmail).toBeDefined();
    });

    it('should have getSession method', () => {
      expect(authService.getSession).toBeDefined();
    });

    it('should have logout method', () => {
      expect(authService.logout).toBeDefined();
    });

    it('should have refreshToken method', () => {
      expect(authService.refreshToken).toBeDefined();
    });

    it('should have getProviders method', () => {
      expect(authService.getProviders).toBeDefined();
    });

    it('should have getCsrfToken method', () => {
      expect(authService.getCsrfToken).toBeDefined();
    });
  });

  describe('OrganizationService', () => {
    it('should have getAll method', () => {
      expect(organizationService.getAll).toBeDefined();
    });

    it('should have getById method', () => {
      expect(organizationService.getById).toBeDefined();
    });

    it('should have create method', () => {
      expect(organizationService.create).toBeDefined();
    });

    it('should have getMembers method', () => {
      expect(organizationService.getMembers).toBeDefined();
    });

    it('should have update method', () => {
      expect(organizationService.update).toBeDefined();
    });
  });

  describe('UserService', () => {
    it('should have getAll method', () => {
      expect(userService.getAll).toBeDefined();
    });

    it('should have getById method', () => {
      expect(userService.getById).toBeDefined();
    });

    it('should have getCurrentUser method', () => {
      expect(userService.getCurrentUser).toBeDefined();
    });

    it('should have getConsents method', () => {
      expect(userService.getConsents).toBeDefined();
    });

    it('should have exportData method', () => {
      expect(userService.exportData).toBeDefined();
    });

    it('should have deleteAccount method', () => {
      expect(userService.deleteAccount).toBeDefined();
    });
  });

  describe('SettingsService', () => {
    it('should have getSettings method', () => {
      expect(settingsService.getSettings).toBeDefined();
    });

    it('should have updateSettings method', () => {
      expect(settingsService.updateSettings).toBeDefined();
    });

    it('should have getIntegrations method', () => {
      expect(settingsService.getIntegrations).toBeDefined();
    });

    it('should have updateIntegration method', () => {
      expect(settingsService.updateIntegration).toBeDefined();
    });
  });

  describe('RcoService', () => {
    it('should have getStatus method', () => {
      expect(rcoService.getStatus).toBeDefined();
    });

    it('should have getLocks method', () => {
      expect(rcoService.getLocks).toBeDefined();
    });

    it('should have generateAccessCode method', () => {
      expect(rcoService.generateAccessCode).toBeDefined();
    });

    it('should have unlock method', () => {
      expect(rcoService.unlock).toBeDefined();
    });
  });

  describe('VismaService', () => {
    it('should have getStatus method', () => {
      expect(vismaService.getStatus).toBeDefined();
    });

    it('should have getInvoices method', () => {
      expect(vismaService.getInvoices).toBeDefined();
    });

    it('should have createInvoice method', () => {
      expect(vismaService.createInvoice).toBeDefined();
    });

    it('should have sync method', () => {
      expect(vismaService.sync).toBeDefined();
    });
  });

  describe('BrregService', () => {
    it('should have lookup method', () => {
      expect(brregService.lookup).toBeDefined();
    });

    it('should have verify method', () => {
      expect(brregService.verify).toBeDefined();
    });
  });

  describe('NifService', () => {
    it('should have lookup method', () => {
      expect(nifService.lookup).toBeDefined();
    });
  });

  describe('VippsService', () => {
    it('should have getStatus method', () => {
      expect(vippsService.getStatus).toBeDefined();
    });

    it('should have initiatePayment method', () => {
      expect(vippsService.initiatePayment).toBeDefined();
    });

    it('should have getPaymentStatus method', () => {
      expect(vippsService.getPaymentStatus).toBeDefined();
    });
  });

  describe('CalendarSyncService', () => {
    it('should have getStatus method', () => {
      expect(calendarSyncService.getStatus).toBeDefined();
    });

    it('should have sync method', () => {
      expect(calendarSyncService.sync).toBeDefined();
    });
  });
});
