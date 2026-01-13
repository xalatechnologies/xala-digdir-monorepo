/**
 * Integration tests for ListingService
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ListingService, PublicListingService } from './listing.service';
import { initializeClient, resetClient } from '../core/client-factory';
import type { Listing } from '../types/listing';

// Mock listing data
const mockListing: Listing = {
  id: 'listing-123',
  tenantId: 'tenant-abc',
  name: 'Test Meeting Room',
  slug: 'test-meeting-room',
  type: 'SPACE',
  status: 'published',
  images: ['https://example.com/image1.jpg'],
  pricing: {
    basePrice: 500,
    currency: 'NOK',
    unit: 'hour',
  },
  capacity: 20,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ListingService', () => {
  let service: ListingService;

  beforeEach(() => {
    mockFetch.mockReset();
    initializeClient({
      baseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
    service = new ListingService();
  });

  afterEach(() => {
    resetClient();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch paginated listings', async () => {
      const mockResponse = {
        data: [mockListing],
        meta: { total: 1, page: 1, limit: 10 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getAll();

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('listing-123');
    });

    it('should pass query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
      });

      await service.getAll({ status: 'published', type: 'SPACE' });

      expect(mockFetch).toHaveBeenCalledOnce();
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('status=published');
      expect(callUrl).toContain('type=SPACE');
    });
  });

  describe('getById', () => {
    it('should fetch single listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockListing }),
      });

      const result = await service.getById('listing-123');

      expect(result.data.id).toBe('listing-123');
      expect(result.data.name).toBe('Test Meeting Room');
    });
  });

  describe('getBySlug', () => {
    it('should fetch listing by slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockListing }),
      });

      const result = await service.getBySlug('test-meeting-room');

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('/slug/test-meeting-room');
      expect(result.data.slug).toBe('test-meeting-room');
    });
  });

  describe('create', () => {
    it('should create a new listing', async () => {
      const newListing = {
        name: 'New Room',
        type: 'SPACE' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ...mockListing, ...newListing } }),
      });

      await service.create(newListing);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual(newListing);
    });
  });

  describe('update', () => {
    it('should update existing listing', async () => {
      const updates = { name: 'Updated Room' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ...mockListing, ...updates } }),
      });

      const result = await service.update('listing-123', updates);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/listing-123');
      expect(options.method).toBe('PUT');
    });
  });

  describe('delete', () => {
    it('should delete listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.delete('listing-123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/listing-123');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('publish', () => {
    it('should publish listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.publish('listing-123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/listing-123/publish');
      expect(options.method).toBe('PUT');
    });
  });

  describe('archive', () => {
    it('should archive listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await service.archive('listing-123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/listing-123/archive');
      expect(options.method).toBe('PUT');
    });
  });

  describe('getAvailability', () => {
    it('should fetch listing availability', async () => {
      const mockAvailability = {
        listingId: 'listing-123',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        blockedSlots: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockAvailability }),
      });

      const result = await service.getAvailability('listing-123', {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/listing-123/availability');
      expect(result.data.listingId).toBe('listing-123');
    });
  });

  describe('getStats', () => {
    it('should fetch listing statistics', async () => {
      const mockStats = {
        listingId: 'listing-123',
        totalBookings: 50,
        totalRevenue: 25000,
        averageRating: 4.5,
        utilizationRate: 0.75,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockStats }),
      });

      const result = await service.getStats('listing-123');

      expect(result.data.totalBookings).toBe(50);
      expect(result.data.utilizationRate).toBe(0.75);
    });
  });
});

describe('PublicListingService', () => {
  let service: PublicListingService;

  beforeEach(() => {
    mockFetch.mockReset();
    initializeClient({
      baseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
    service = new PublicListingService();
  });

  afterEach(() => {
    resetClient();
    vi.clearAllMocks();
  });

  describe('getListings', () => {
    it('should fetch public listings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockListing], meta: { total: 1 } }),
      });

      const result = await service.getListings();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/public/listings');
      expect(result.data).toHaveLength(1);
    });

    it('should support filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
      });

      await service.getListings({ city: 'Oslo', type: 'SPACE' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('city=Oslo');
      expect(url).toContain('type=SPACE');
    });
  });

  describe('getListing', () => {
    it('should fetch single public listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockListing }),
      });

      const result = await service.getListing('listing-123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/public/listings/listing-123');
      expect(result.data.id).toBe('listing-123');
    });
  });

  describe('getCategories', () => {
    it('should fetch categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Meeting Rooms' },
        { id: '2', name: 'Sports Facilities' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockCategories }),
      });

      const result = await service.getCategories();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Meeting Rooms');
    });
  });

  describe('getCities', () => {
    it('should fetch cities', async () => {
      const mockCities = [
        { name: 'Oslo', slug: 'oslo' },
        { name: 'Bergen', slug: 'bergen' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockCities }),
      });

      const result = await service.getCities();

      expect(result.data).toHaveLength(2);
    });
  });

  describe('getFeatured', () => {
    it('should fetch featured listings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [mockListing] }),
      });

      const result = await service.getFeatured();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/public/featured');
      expect(result.data).toHaveLength(1);
    });
  });
});
