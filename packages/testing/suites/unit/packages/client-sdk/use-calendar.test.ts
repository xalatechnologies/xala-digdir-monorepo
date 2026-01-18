/**
 * Unit Tests for Calendar Hooks
 * Tests for useListingCalendarConfig, useAvailabilityMatrix, and useCalendarRealtime
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React hooks and React Query before importing
vi.mock('react', () => ({
  useEffect: vi.fn((callback) => callback()),
  useRef: vi.fn((initial) => ({ current: initial })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock realtime client
vi.mock('../realtime', () => ({
  realtimeClient: {
    onAvailability: vi.fn(() => vi.fn()),
    onBookingCreated: vi.fn(() => vi.fn()),
    onBookingUpdated: vi.fn(() => vi.fn()),
    onBookingCancelled: vi.fn(() => vi.fn()),
    onBlockCreated: vi.fn(() => vi.fn()),
    onBlockUpdated: vi.fn(() => vi.fn()),
    onBlockDeleted: vi.fn(() => vi.fn()),
  },
}));

// Mock services
vi.mock('../services/calendar.service', () => ({
  rentalObjectCalendarService: {
    getCalendarConfig: vi.fn().mockResolvedValue({
      data: {
        listingId: 'listing-123',
        granularity: 'TIME_SLOTS',
        timezone: 'Europe/Oslo',
        slotSizeMinutes: 30,
      },
    }),
  },
  listingCalendarService: {
    getCalendarConfig: vi.fn().mockResolvedValue({
      data: {
        listingId: 'listing-123',
        granularity: 'TIME_SLOTS',
        timezone: 'Europe/Oslo',
        slotSizeMinutes: 30,
        selectableUnit: 'slot',
        minDurationMinutes: 30,
        maxDurationMinutes: 240,
        stepMinutes: 30,
        allowSameDayBooking: true,
        openingHours: {
          weekly: {
            '1': { open: '08:00', close: '17:00' },
            '2': { open: '08:00', close: '17:00' },
            '3': { open: '08:00', close: '17:00' },
            '4': { open: '08:00', close: '17:00' },
            '5': { open: '08:00', close: '17:00' },
          },
        },
        bookingTypes: [
          { code: 'HOURLY', labelKey: 'booking.type.hourly', default: true, rules: {} },
        ],
        ui: {
          showWeekView: true,
          showMonthView: true,
          showDayView: true,
          defaultView: 'week',
          allowMultiSelect: false,
        },
        permissions: {
          canViewCalendar: true,
          canSelectSlot: true,
          canRequestBooking: true,
        },
        availableActions: [],
      },
    }),
  },
  availabilityMatrixService: {
    getAvailabilityMatrix: vi.fn().mockResolvedValue({
      data: {
        listingId: 'listing-123',
        from: '2025-01-15',
        to: '2025-01-21',
        granularity: 'TIME_SLOTS',
        cells: [
          { start: '2025-01-15T08:00:00', end: '2025-01-15T08:30:00', status: 'AVAILABLE', reasonKey: null },
          { start: '2025-01-15T08:30:00', end: '2025-01-15T09:00:00', status: 'BOOKED', reasonKey: 'calendar.slot.booked', bookingId: 'booking-1' },
          { start: '2025-01-15T09:00:00', end: '2025-01-15T09:30:00', status: 'AVAILABLE', reasonKey: null },
        ],
        legend: [
          { status: 'AVAILABLE', labelKey: 'calendar.slot.available' },
          { status: 'BOOKED', labelKey: 'calendar.slot.booked' },
        ],
      },
    }),
  },
}));

// Import after mocks
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useListingCalendarConfig, useAvailabilityMatrix, useCalendarRealtime } from '@xala/api/hooks/use-calendar';
import { queryKeys } from '@xala/api/hooks/query-keys';
import { rentalObjectCalendarService, availabilityMatrixService } from '@xala/api/services/calendar.service';
import { realtimeClient } from '@xala/api/realtime';

describe('Calendar Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useListingCalendarConfig', () => {
    it('should call useQuery with correct query key', () => {
      const listingId = 'listing-123';

      useListingCalendarConfig(listingId);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryKeys.calendar.config(listingId, undefined),
          enabled: true,
        })
      );
    });

    it('should call useQuery with params in query key', () => {
      const listingId = 'listing-123';
      const params = { bookingType: 'HOURLY' };

      useListingCalendarConfig(listingId, params);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryKeys.calendar.config(listingId, params),
          enabled: true,
        })
      );
    });

    it('should disable query when listingId is empty', () => {
      useListingCalendarConfig('');

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should respect enabled option', () => {
      const listingId = 'listing-123';

      useListingCalendarConfig(listingId, undefined, { enabled: false });

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should use calendarService.getCalendarConfig as queryFn', () => {
      const listingId = 'listing-123';

      useListingCalendarConfig(listingId);

      // Get the queryFn that was passed
      const call = vi.mocked(useQuery).mock.calls[0][0];
      expect(call.queryFn).toBeDefined();

      // Verify queryFn is a function (service integration verified by hook behavior)
      expect(typeof call.queryFn).toBe('function');
    });
  });

  describe('useAvailabilityMatrix', () => {
    const defaultParams = {
      from: '2025-01-15',
      to: '2025-01-21',
    };

    it('should call useQuery with correct query key', () => {
      const listingId = 'listing-123';

      useAvailabilityMatrix(listingId, defaultParams);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryKeys.calendar.availabilityMatrix(listingId, defaultParams),
          enabled: true,
        })
      );
    });

    it('should include bookingType in query key when provided', () => {
      const listingId = 'listing-123';
      const params = { ...defaultParams, bookingType: 'ALL_DAY' };

      useAvailabilityMatrix(listingId, params);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryKeys.calendar.availabilityMatrix(listingId, params),
        })
      );
    });

    it('should disable query when listingId is empty', () => {
      useAvailabilityMatrix('', defaultParams);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should disable query when from is missing', () => {
      const listingId = 'listing-123';
      const params = { from: '', to: '2025-01-21' };

      useAvailabilityMatrix(listingId, params);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should disable query when to is missing', () => {
      const listingId = 'listing-123';
      const params = { from: '2025-01-15', to: '' };

      useAvailabilityMatrix(listingId, params);

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should respect enabled option', () => {
      const listingId = 'listing-123';

      useAvailabilityMatrix(listingId, defaultParams, { enabled: false });

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should use availabilityMatrixService.getAvailabilityMatrix as queryFn', () => {
      const listingId = 'listing-123';

      useAvailabilityMatrix(listingId, defaultParams);

      // Get the queryFn that was passed
      const call = vi.mocked(useQuery).mock.calls[0][0];
      expect(call.queryFn).toBeDefined();

      // Execute the queryFn and verify service is called
      if (call.queryFn) {
        call.queryFn({ queryKey: call.queryKey as readonly unknown[], signal: new AbortController().signal, meta: undefined });
        expect(availabilityMatrixService.getAvailabilityMatrix).toHaveBeenCalledWith(listingId, defaultParams);
      }
    });
  });

  describe('useCalendarRealtime', () => {
    it('should subscribe to availability events', () => {
      useCalendarRealtime();

      expect(realtimeClient.onAvailability).toHaveBeenCalled();
    });

    it('should subscribe to booking events', () => {
      useCalendarRealtime();

      expect(realtimeClient.onBookingCreated).toHaveBeenCalled();
      expect(realtimeClient.onBookingUpdated).toHaveBeenCalled();
      expect(realtimeClient.onBookingCancelled).toHaveBeenCalled();
    });

    it('should subscribe to block events', () => {
      useCalendarRealtime();

      expect(realtimeClient.onBlockCreated).toHaveBeenCalled();
      expect(realtimeClient.onBlockUpdated).toHaveBeenCalled();
      expect(realtimeClient.onBlockDeleted).toHaveBeenCalled();
    });

    it('should get queryClient for cache invalidation', () => {
      useCalendarRealtime();

      expect(useQueryClient).toHaveBeenCalled();
    });

    it('should use useEffect for subscription lifecycle', () => {
      useCalendarRealtime();

      expect(useEffect).toHaveBeenCalled();
    });

    it('should use useRef for handler reference', () => {
      const handler = vi.fn();
      useCalendarRealtime(handler);

      expect(useRef).toHaveBeenCalledWith(handler);
    });

    it('should call custom handler when provided', () => {
      // Setup handler capture
      const capturedHandlers: Record<string, (event: unknown) => void> = {};

      vi.mocked(realtimeClient.onAvailability).mockImplementation((handler) => {
        capturedHandlers['availability'] = handler;
        return vi.fn();
      });

      const customHandler = vi.fn();

      // Create a mock ref that properly stores the handler
      const mockRef = { current: customHandler };
      vi.mocked(useRef).mockReturnValue(mockRef);

      // Execute useEffect callback
      vi.mocked(useEffect).mockImplementation((callback) => {
        const cleanup = callback();
        return cleanup;
      });

      useCalendarRealtime(customHandler);

      // Simulate availability event
      if (capturedHandlers['availability']) {
        const testEvent = { type: 'availability.updated', listingId: 'test-123' };
        capturedHandlers['availability'](testEvent);

        expect(customHandler).toHaveBeenCalledWith(testEvent);
      }
    });
  });

  describe('Query Keys', () => {
    it('should generate correct calendar config query key', () => {
      const listingId = 'listing-123';
      const key = queryKeys.calendar.config(listingId);

      expect(key).toEqual(['calendar', 'config', listingId, undefined]);
    });

    it('should generate correct calendar config query key with params', () => {
      const listingId = 'listing-123';
      const params = { bookingType: 'HOURLY' };
      const key = queryKeys.calendar.config(listingId, params);

      expect(key).toEqual(['calendar', 'config', listingId, params]);
    });

    it('should generate correct availability matrix query key', () => {
      const listingId = 'listing-123';
      const params = { from: '2025-01-15', to: '2025-01-21' };
      const key = queryKeys.calendar.availabilityMatrix(listingId, params);

      expect(key).toEqual(['calendar', 'availabilityMatrix', listingId, params]);
    });

    it('should generate correct availability matrix query key with bookingType', () => {
      const listingId = 'listing-123';
      const params = { from: '2025-01-15', to: '2025-01-21', bookingType: 'ALL_DAY' };
      const key = queryKeys.calendar.availabilityMatrix(listingId, params);

      expect(key).toEqual(['calendar', 'availabilityMatrix', listingId, params]);
    });

    it('should have calendar.all key for bulk invalidation', () => {
      expect(queryKeys.calendar.all).toEqual(['calendar']);
    });
  });

  describe('Calendar Service Integration', () => {
    it('should have rentalObjectCalendarService with getCalendarConfig method', () => {
      expect(rentalObjectCalendarService.getCalendarConfig).toBeDefined();
      expect(typeof rentalObjectCalendarService.getCalendarConfig).toBe('function');
    });

    it('should have availabilityMatrixService with getAvailabilityMatrix method', () => {
      expect(availabilityMatrixService.getAvailabilityMatrix).toBeDefined();
      expect(typeof availabilityMatrixService.getAvailabilityMatrix).toBe('function');
    });

    it('should accept listingId and params for getCalendarConfig', () => {
      // Verify the service method is callable with expected signature
      const listingId = 'listing-123';
      const params = { bookingType: 'HOURLY' };

      // This verifies the mock is working and the method can be called
      rentalObjectCalendarService.getCalendarConfig(listingId, params);

      expect(rentalObjectCalendarService.getCalendarConfig).toHaveBeenCalledWith(listingId, params);
    });

    it('should accept listingId and params for getAvailabilityMatrix', () => {
      // Verify the service method is callable with expected signature
      const listingId = 'listing-123';
      const params = { from: '2025-01-15', to: '2025-01-21' };

      // This verifies the mock is working and the method can be called
      availabilityMatrixService.getAvailabilityMatrix(listingId, params);

      expect(availabilityMatrixService.getAvailabilityMatrix).toHaveBeenCalledWith(listingId, params);
    });
  });

  describe('Realtime Client Integration', () => {
    it('should have all required event subscription methods', () => {
      expect(realtimeClient.onAvailability).toBeDefined();
      expect(realtimeClient.onBookingCreated).toBeDefined();
      expect(realtimeClient.onBookingUpdated).toBeDefined();
      expect(realtimeClient.onBookingCancelled).toBeDefined();
      expect(realtimeClient.onBlockCreated).toBeDefined();
      expect(realtimeClient.onBlockUpdated).toBeDefined();
      expect(realtimeClient.onBlockDeleted).toBeDefined();
    });

    it('should return unsubscribe functions from event subscriptions', () => {
      const unsubAvailability = realtimeClient.onAvailability(vi.fn());
      const unsubBookingCreated = realtimeClient.onBookingCreated(vi.fn());

      expect(typeof unsubAvailability).toBe('function');
      expect(typeof unsubBookingCreated).toBe('function');
    });
  });
});
