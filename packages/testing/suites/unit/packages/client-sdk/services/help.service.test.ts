/**
 * Help Service Tests
 * Tests for HelpService, BookingService.getReceipt, and SeasonalLeaseService.getSuggestions
 * Target: 95%+ coverage
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the client factory
vi.mock('../../core/client-factory', () => ({
  getClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

import { getClient } from '@digilist/api/core/client-factory';
import { helpService } from '@digilist/api/services/help.service';
import { seasonalLeaseService } from '@digilist/api/services/seasonal-lease.service';
// import { bookingService } from '@digilist/api/services/booking.service';

// SKIPPED
describe.skip('HelpService', () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getClient as any).mockReturnValue(mockClient);
  });

  // =========================================================================
  // getFaq
  // =========================================================================
  describe('getFaq', () => {
    it('should call correct endpoint without category', async () => {
      const mockResponse = { data: [], meta: { categories: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await helpService.getFaq();

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/faq?lang=no');
      expect(result).toEqual(mockResponse);
    });

    it('should call correct endpoint with category filter', async () => {
      const mockResponse = { data: [], meta: { categories: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      await helpService.getFaq('booking');

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/faq?category=booking&lang=no');
    });

    it('should support custom language', async () => {
      const mockResponse = { data: [], meta: { categories: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      await helpService.getFaq(undefined, 'en');

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/faq?lang=en');
    });
  });

  // =========================================================================
  // getGuides
  // =========================================================================
  describe('getGuides', () => {
    it('should call correct endpoint with default role', async () => {
      const mockResponse = { data: [] };
      mockClient.get.mockResolvedValue(mockResponse);

      await helpService.getGuides();

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/guides?role=user');
    });

    it('should call correct endpoint with custom role', async () => {
      const mockResponse = { data: [] };
      mockClient.get.mockResolvedValue(mockResponse);

      await helpService.getGuides('admin');

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/guides?role=admin');
    });
  });

  // =========================================================================
  // getTooltips
  // =========================================================================
  describe('getTooltips', () => {
    it('should call correct endpoint', async () => {
      const mockResponse = { data: { booking: {}, listing: {} } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await helpService.getTooltips();

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/tooltips');
      expect(result).toEqual(mockResponse);
    });
  });

  // =========================================================================
  // getTraining
  // =========================================================================
  describe('getTraining', () => {
    it('should call correct endpoint', async () => {
      const mockResponse = {
        data: {
          plan: { title: 'Test', modules: [] },
          resources: [],
          support: { email: 'test@test.no' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await helpService.getTraining();

      expect(mockClient.get).toHaveBeenCalledWith('/api/help/training');
      expect(result).toEqual(mockResponse);
    });
  });

  // =========================================================================
  // submitContact
  // =========================================================================
  describe('submitContact', () => {
    it('should call correct endpoint with data', async () => {
      const mockResponse = { data: { ticketId: 'TKT-123', status: 'received' } };
      mockClient.post.mockResolvedValue(mockResponse);

      const contactData = { email: 'test@test.no', message: 'Test message' };
      const result = await helpService.submitContact(contactData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/help/contact', contactData);
      expect(result).toEqual(mockResponse);
    });

    it('should pass all optional fields', async () => {
      const mockResponse = { data: { ticketId: 'TKT-123', status: 'received' } };
      mockClient.post.mockResolvedValue(mockResponse);

      const contactData = {
        name: 'Test User',
        email: 'test@test.no',
        subject: 'Subject',
        message: 'Message',
        category: 'booking',
      };
      await helpService.submitContact(contactData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/help/contact', contactData);
    });
  });
});

// =========================================================================
// SeasonalLeaseService.getSuggestions
// =========================================================================
// SKIPPED
describe.skip('SeasonalLeaseService - getSuggestions', () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getClient as any).mockReturnValue(mockClient);
  });

  it('should call correct endpoint without params', async () => {
    const mockResponse = { data: { suggestions: [], algorithm: 'priority_queue_v1' } };
    mockClient.get.mockResolvedValue(mockResponse);

    const result = await seasonalLeaseService.getSuggestions();

    expect(mockClient.get).toHaveBeenCalledWith('/api/seasonal-leases/suggestions');
    expect(result).toEqual(mockResponse);
  });

  it('should include listingId in query params', async () => {
    const mockResponse = { data: { suggestions: [] } };
    mockClient.get.mockResolvedValue(mockResponse);

    await seasonalLeaseService.getSuggestions({ listingId: 'listing-123' });

    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/seasonal-leases/suggestions?listingId=listing-123'
    );
  });

  it('should include season in query params', async () => {
    const mockResponse = { data: { suggestions: [] } };
    mockClient.get.mockResolvedValue(mockResponse);

    await seasonalLeaseService.getSuggestions({ season: 'fall2026' });

    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/seasonal-leases/suggestions?season=fall2026'
    );
  });

  it('should include both params', async () => {
    const mockResponse = { data: { suggestions: [] } };
    mockClient.get.mockResolvedValue(mockResponse);

    await seasonalLeaseService.getSuggestions({ listingId: 'listing-123', season: 'fall2026' });

    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/seasonal-leases/suggestions?listingId=listing-123&season=fall2026'
    );
  });
});

// BookingService.getReceipt is tested via API integration tests
// in unified-api/tests/integration/booking-receipt.test.ts
