/**
 * Integration tests for BookingService, CalendarService, and AvailabilityService
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BookingService, CalendarService, AvailabilityService } from './booking.service';
import { initializeClient, resetClient } from '../core/client-factory';
import type { Booking } from '../types/booking';

// Mock booking data
const mockBooking: Booking = {
  id: 'booking-123',
  tenantId: 'tenant-abc',
  listingId: 'listing-456',
  userId: 'user-789',
  status: 'confirmed',
  startTime: '2024-01-15T09:00:00Z',
  endTime: '2024-01-15T11:00:00Z',
  totalPrice: 1000,
  currency: 'NOK',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    mockFetch.mockReset();
    initializeClient({
      baseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
    service = new BookingService();
  });

  afterEach(() => {
    resetClient();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch paginated bookings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [mockBooking],
          meta: { total: 1, page: 1, limit: 10 },
        }),
      });

      const result = await service.getAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('booking-123');
    });

    it('should filter by status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
      });

      await service.getAll({ status: 'pending' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('status=pending');
    });

    it('should filter by date range', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
      });

      await service.getAll({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('startDate=2024-01-01');
      expect(url).toContain('endDate=2024-01-31');
    });
  });

  describe('getById', () => {
    it('should fetch single booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockBooking }),
      });

      const result = await service.getById('booking-123');

      expect(result.data.id).toBe('booking-123');
      expect(result.data.status).toBe('confirmed');
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const newBooking = {
        listingId: 'listing-456',
        startTime: '2024-02-01T10:00:00Z',
        endTime: '2024-02-01T12:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { ...mockBooking, ...newBooking, status: 'pending' },
        }),
      });

      const result = await service.create(newBooking);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(result.data.listingId).toBe('listing-456');
    });
  });

  describe('confirm', () => {
    it('should confirm pending booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { ...mockBooking, status: 'confirmed' },
        }),
      });

      const result = await service.confirm('booking-123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/booking-123/confirm');
      expect(options.method).toBe('PUT');
      expect(result.data.status).toBe('confirmed');
    });
  });

  describe('cancel', () => {
    it('should cancel booking', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { ...mockBooking, status: 'cancelled' },
        }),
      });

      const result = await service.cancel('booking-123', {
        reason: 'User requested cancellation',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/booking-123/cancel');
      expect(options.method).toBe('PUT');
    });
  });

  describe('complete', () => {
    it('should mark booking as completed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { ...mockBooking, status: 'completed' },
        }),
      });

      const result = await service.complete('booking-123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/booking-123/complete');
    });
  });

  describe('calculatePricing', () => {
    it('should calculate booking pricing', async () => {
      const mockPricing = {
        basePrice: 500,
        duration: 2,
        subtotal: 1000,
        vatAmount: 250,
        total: 1250,
        currency: 'NOK',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPricing }),
      });

      const result = await service.calculatePricing(
        'listing-456',
        '2024-01-15T09:00:00Z',
        '2024-01-15T11:00:00Z'
      );

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/pricing');
      expect(url).toContain('listingId=listing-456');
      expect(result.data.total).toBe(1250);
    });
  });

  describe('getMyBookings', () => {
    it('should fetch current user bookings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [mockBooking],
          meta: { total: 1 },
        }),
      });

      const result = await service.getMyBookings();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/my');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getRecurring', () => {
    it('should fetch recurring bookings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [],
          meta: { total: 0 },
        }),
      });

      await service.getRecurring();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/recurring');
    });
  });
});

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(() => {
    mockFetch.mockReset();
    initializeClient({
      baseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
    service = new CalendarService();
  });

  afterEach(() => {
    resetClient();
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch calendar events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Meeting Room Booking',
          start: '2024-01-15T09:00:00Z',
          end: '2024-01-15T11:00:00Z',
          type: 'booking',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockEvents }),
      });

      const result = await service.getEvents({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/calendar/events');
      expect(result.data).toHaveLength(1);
    });

    it('should filter by listing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await service.getEvents({ listingId: 'listing-456' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('listingId=listing-456');
    });
  });
});

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(() => {
    mockFetch.mockReset();
    initializeClient({
      baseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
    service = new AvailabilityService();
  });

  afterEach(() => {
    resetClient();
    vi.clearAllMocks();
  });

  describe('getSlots', () => {
    it('should fetch available time slots', async () => {
      const mockSlots = [
        { startTime: '09:00', endTime: '10:00', available: true, price: 500 },
        { startTime: '10:00', endTime: '11:00', available: false },
        { startTime: '11:00', endTime: '12:00', available: true, price: 500 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockSlots }),
      });

      const result = await service.getSlots({
        listingId: 'listing-456',
        date: '2024-01-15',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/availability/slots');
      expect(result.data).toHaveLength(3);
      expect(result.data[0].available).toBe(true);
    });

    it('should support custom duration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await service.getSlots({
        listingId: 'listing-456',
        date: '2024-01-15',
        duration: 120, // 2 hours
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('duration=120');
    });
  });

  describe('check', () => {
    it('should check availability for time range', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { available: true },
        }),
      });

      const result = await service.check({
        listingId: 'listing-456',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/availability/check');
      expect(result.data.available).toBe(true);
    });

    it('should return conflicts when not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            available: false,
            conflicts: [
              { startTime: '2024-01-15T10:00:00Z', endTime: '2024-01-15T12:00:00Z' },
            ],
          },
        }),
      });

      const result = await service.check({
        listingId: 'listing-456',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      });

      expect(result.data.available).toBe(false);
      expect(result.data.conflicts).toHaveLength(1);
    });
  });
});
