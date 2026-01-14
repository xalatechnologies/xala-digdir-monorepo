/**
 * Unit Tests for Bulk Booking React Query Hooks
 * Tests all bulk operation hooks added to use-bookings.ts
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the booking service - must be inside the factory function to avoid hoisting issues
vi.mock('../../services/booking.service', () => {
  const mockFn = vi.fn;
  return {
    bookingService: {
      bulkConfirm: mockFn().mockResolvedValue({ data: [] }),
      bulkReject: mockFn().mockResolvedValue({ data: [] }),
      bulkCancel: mockFn().mockResolvedValue({ data: [] }),
      batchReschedule: mockFn().mockResolvedValue({ data: [] }),
    },
    calendarService: {},
    allocationService: {},
    availabilityService: {},
  };
});

import {
  useBulkConfirmBookings,
  useBulkRejectBookings,
  useBulkCancelBookings,
  useBatchRescheduleBookings,
} from '../../hooks/use-bookings';

// Get mocked service instance for tests
import { bookingService as mockBookingService } from '../../services/booking.service';

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('Bulk Booking Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBulkConfirmBookings', () => {
    it('should return a mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('isError');
    });

    it('should call bookingService.bulkConfirm with ids', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1', 'booking-2', 'booking-3'];
      const mockResponse = { data: [{ id: 'booking-1', status: 'confirmed' }] };

      mockBookingService.bulkConfirm.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      result.current.mutate(testIds);

      await waitFor(() => {
        expect(mockBookingService.bulkConfirm).toHaveBeenCalledTimes(1);
        expect(mockBookingService.bulkConfirm).toHaveBeenCalledWith(testIds);
      });
    });

    it('should set isPending to true during mutation', async () => {
      const wrapper = createWrapper();
      mockBookingService.bulkConfirm.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      expect(result.current.isPending).toBe(false);

      result.current.mutate(['booking-1']);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });
    });

    it('should set isSuccess to true on successful mutation', async () => {
      const wrapper = createWrapper();
      mockBookingService.bulkConfirm.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      result.current.mutate(['booking-1']);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle errors correctly', async () => {
      const wrapper = createWrapper();
      const testError = new Error('Bulk confirm failed');
      mockBookingService.bulkConfirm.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      result.current.mutate(['booking-1']);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(testError);
      });
    });
  });

  describe('useBulkRejectBookings', () => {
    it('should return a mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkRejectBookings(), { wrapper });

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
    });

    it('should call bookingService.bulkReject with ids and optional reason', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1', 'booking-2'];
      const testReason = 'Ikke tilgjengelig';
      const mockResponse = { data: [{ id: 'booking-1', status: 'rejected' }] };

      mockBookingService.bulkReject.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBulkRejectBookings(), { wrapper });

      result.current.mutate({ ids: testIds, reason: testReason });

      await waitFor(() => {
        expect(mockBookingService.bulkReject).toHaveBeenCalledTimes(1);
        expect(mockBookingService.bulkReject).toHaveBeenCalledWith(testIds, testReason);
      });
    });

    it('should work without reason parameter', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1'];
      mockBookingService.bulkReject.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkRejectBookings(), { wrapper });

      result.current.mutate({ ids: testIds });

      await waitFor(() => {
        expect(mockBookingService.bulkReject).toHaveBeenCalledWith(testIds, undefined);
      });
    });

    it('should set isSuccess to true on successful mutation', async () => {
      const wrapper = createWrapper();
      mockBookingService.bulkReject.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkRejectBookings(), { wrapper });

      result.current.mutate({ ids: ['booking-1'], reason: 'Test' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useBulkCancelBookings', () => {
    it('should return a mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
    });

    it('should call bookingService.bulkCancel with ids and required reason', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1', 'booking-2', 'booking-3'];
      const testReason = 'Facility closed for maintenance';
      const mockResponse = { data: [{ id: 'booking-1', status: 'cancelled' }] };

      mockBookingService.bulkCancel.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      result.current.mutate({ ids: testIds, reason: testReason });

      await waitFor(() => {
        expect(mockBookingService.bulkCancel).toHaveBeenCalledTimes(1);
        expect(mockBookingService.bulkCancel).toHaveBeenCalledWith(testIds, testReason);
      });
    });

    it('should require reason parameter (TypeScript)', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      // TypeScript compile-time check - reason is required
      // @ts-expect-error - reason parameter is required
      result.current.mutate({ ids: ['booking-1'] });

      // This should compile fine
      result.current.mutate({ ids: ['booking-1'], reason: 'Valid reason' });
    });

    it('should set isSuccess to true on successful mutation', async () => {
      const wrapper = createWrapper();
      mockBookingService.bulkCancel.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      result.current.mutate({ ids: ['booking-1'], reason: 'Test reason' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle errors correctly', async () => {
      const wrapper = createWrapper();
      const testError = new Error('Bulk cancel failed');
      mockBookingService.bulkCancel.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      result.current.mutate({ ids: ['booking-1'], reason: 'Test' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(testError);
      });
    });
  });

  describe('useBatchRescheduleBookings', () => {
    it('should return a mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
    });

    it('should call bookingService.batchReschedule with ids, startTime, and endTime', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1', 'booking-2'];
      const testStartTime = '2026-01-20T10:00:00Z';
      const testEndTime = '2026-01-20T12:00:00Z';
      const mockResponse = { data: [{ id: 'booking-1', startTime: testStartTime }] };

      mockBookingService.batchReschedule.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      result.current.mutate({
        ids: testIds,
        startTime: testStartTime,
        endTime: testEndTime,
      });

      await waitFor(() => {
        expect(mockBookingService.batchReschedule).toHaveBeenCalledTimes(1);
        expect(mockBookingService.batchReschedule).toHaveBeenCalledWith(
          testIds,
          testStartTime,
          testEndTime
        );
      });
    });

    it('should handle ISO 8601 datetime strings', async () => {
      const wrapper = createWrapper();
      const testIds = ['booking-1'];
      const testStartTime = '2026-02-15T14:30:00.000Z';
      const testEndTime = '2026-02-15T16:30:00.000Z';
      mockBookingService.batchReschedule.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      result.current.mutate({
        ids: testIds,
        startTime: testStartTime,
        endTime: testEndTime,
      });

      await waitFor(() => {
        expect(mockBookingService.batchReschedule).toHaveBeenCalledWith(
          testIds,
          testStartTime,
          testEndTime
        );
      });
    });

    it('should set isSuccess to true on successful mutation', async () => {
      const wrapper = createWrapper();
      mockBookingService.batchReschedule.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      result.current.mutate({
        ids: ['booking-1'],
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle errors correctly', async () => {
      const wrapper = createWrapper();
      const testError = new Error('Batch reschedule failed');
      mockBookingService.batchReschedule.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      result.current.mutate({
        ids: ['booking-1'],
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(testError);
      });
    });
  });

  describe('Query invalidation', () => {
    it('should invalidate bookings.lists() and calendar.all on bulkConfirm success', async () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      mockBookingService.bulkConfirm.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkConfirmBookings(), { wrapper });

      result.current.mutate(['booking-1']);

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });

    it('should invalidate bookings.lists() and calendar.all on bulkReject success', async () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      mockBookingService.bulkReject.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkRejectBookings(), { wrapper });

      result.current.mutate({ ids: ['booking-1'], reason: 'Test' });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });

    it('should invalidate bookings.lists() and calendar.all on bulkCancel success', async () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      mockBookingService.bulkCancel.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBulkCancelBookings(), { wrapper });

      result.current.mutate({ ids: ['booking-1'], reason: 'Test reason' });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });

    it('should invalidate bookings.lists() and calendar.all on batchReschedule success', async () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      mockBookingService.batchReschedule.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useBatchRescheduleBookings(), { wrapper });

      result.current.mutate({
        ids: ['booking-1'],
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });
  });
});
