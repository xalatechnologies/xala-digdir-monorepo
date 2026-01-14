/**
 * Unit Tests for Bulk Booking Service Methods
 * Tests all bulk operation methods added to BookingService
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a mock client with methods
const mockClient = {
  get: vi.fn().mockResolvedValue({ data: [] }),
  post: vi.fn().mockResolvedValue({ data: { id: 'new-1' } }),
  put: vi.fn().mockResolvedValue({ data: [] }),
  delete: vi.fn().mockResolvedValue({ success: true }),
  patch: vi.fn().mockResolvedValue({ data: {} }),
};

// Mock the client factory before importing services
vi.mock('../../core/client-factory', () => ({
  getClient: () => mockClient,
}));

import { bookingService } from '../../services/booking.service';

describe('BookingService - Bulk Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bulkConfirm', () => {
    it('should call PUT /api/bookings/bulk/confirm with ids array', async () => {
      const testIds = ['booking-1', 'booking-2', 'booking-3'];
      const mockResponse = {
        data: [
          { id: 'booking-1', status: 'confirmed' },
          { id: 'booking-2', status: 'confirmed' },
          { id: 'booking-3', status: 'confirmed' },
        ]
      };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkConfirm(testIds);

      expect(mockClient.put).toHaveBeenCalledTimes(1);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/confirm',
        { ids: testIds }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty ids array', async () => {
      const mockResponse = { data: [] };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkConfirm([]);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/confirm',
        { ids: [] }
      );
      expect(result.data).toEqual([]);
    });

    it('should return SingleResponse<Booking[]>', async () => {
      const mockResponse = { data: [{ id: 'booking-1', status: 'confirmed' }] };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkConfirm(['booking-1']);

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('bulkReject', () => {
    it('should call PUT /api/bookings/bulk/reject with ids and optional reason', async () => {
      const testIds = ['booking-1', 'booking-2'];
      const testReason = 'Ikke tilgjengelig';
      const mockResponse = {
        data: [
          { id: 'booking-1', status: 'rejected' },
          { id: 'booking-2', status: 'rejected' },
        ]
      };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkReject(testIds, testReason);

      expect(mockClient.put).toHaveBeenCalledTimes(1);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/reject',
        { ids: testIds, reason: testReason }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should work without reason parameter', async () => {
      const testIds = ['booking-1'];
      const mockResponse = { data: [{ id: 'booking-1', status: 'rejected' }] };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      await bookingService.bulkReject(testIds);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/reject',
        { ids: testIds, reason: undefined }
      );
    });

    it('should return SingleResponse<Booking[]>', async () => {
      const mockResponse = { data: [{ id: 'booking-1', status: 'rejected' }] };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkReject(['booking-1']);

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('bulkCancel', () => {
    it('should call PUT /api/bookings/bulk/cancel with ids and required reason', async () => {
      const testIds = ['booking-1', 'booking-2', 'booking-3'];
      const testReason = 'Facility closed for maintenance';
      const mockResponse = {
        data: [
          { id: 'booking-1', status: 'cancelled' },
          { id: 'booking-2', status: 'cancelled' },
          { id: 'booking-3', status: 'cancelled' },
        ]
      };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkCancel(testIds, testReason);

      expect(mockClient.put).toHaveBeenCalledTimes(1);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/cancel',
        { ids: testIds, reason: testReason }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should require reason parameter (TypeScript)', () => {
      // TypeScript compile-time check - reason is required
      // @ts-expect-error - reason parameter is required
      bookingService.bulkCancel(['booking-1']);

      // This should compile fine
      bookingService.bulkCancel(['booking-1'], 'Valid reason');
    });

    it('should return SingleResponse<Booking[]>', async () => {
      const mockResponse = { data: [{ id: 'booking-1', status: 'cancelled' }] };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.bulkCancel(['booking-1'], 'Test reason');

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('batchReschedule', () => {
    it('should call PUT /api/bookings/bulk/reschedule with ids, startTime, and endTime', async () => {
      const testIds = ['booking-1', 'booking-2'];
      const testStartTime = '2026-01-20T10:00:00Z';
      const testEndTime = '2026-01-20T12:00:00Z';
      const mockResponse = {
        data: [
          { id: 'booking-1', startTime: testStartTime, endTime: testEndTime },
          { id: 'booking-2', startTime: testStartTime, endTime: testEndTime },
        ]
      };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.batchReschedule(testIds, testStartTime, testEndTime);

      expect(mockClient.put).toHaveBeenCalledTimes(1);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/reschedule',
        { ids: testIds, startTime: testStartTime, endTime: testEndTime }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle ISO 8601 datetime strings', async () => {
      const testIds = ['booking-1'];
      const testStartTime = '2026-02-15T14:30:00.000Z';
      const testEndTime = '2026-02-15T16:30:00.000Z';
      const mockResponse = { data: [{ id: 'booking-1' }] };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      await bookingService.batchReschedule(testIds, testStartTime, testEndTime);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/bookings/bulk/reschedule',
        { ids: testIds, startTime: testStartTime, endTime: testEndTime }
      );
    });

    it('should return SingleResponse<Booking[]>', async () => {
      const mockResponse = { data: [{ id: 'booking-1', status: 'confirmed' }] };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await bookingService.batchReschedule(
        ['booking-1'],
        '2026-01-20T10:00:00Z',
        '2026-01-20T12:00:00Z'
      );

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Bulk operations error handling', () => {
    it('should propagate errors from client for bulkConfirm', async () => {
      const testError = new Error('Network error');
      mockClient.put.mockRejectedValueOnce(testError);

      await expect(bookingService.bulkConfirm(['booking-1']))
        .rejects
        .toThrow('Network error');
    });

    it('should propagate errors from client for bulkReject', async () => {
      const testError = new Error('Validation error');
      mockClient.put.mockRejectedValueOnce(testError);

      await expect(bookingService.bulkReject(['booking-1'], 'reason'))
        .rejects
        .toThrow('Validation error');
    });

    it('should propagate errors from client for bulkCancel', async () => {
      const testError = new Error('Authorization error');
      mockClient.put.mockRejectedValueOnce(testError);

      await expect(bookingService.bulkCancel(['booking-1'], 'reason'))
        .rejects
        .toThrow('Authorization error');
    });

    it('should propagate errors from client for batchReschedule', async () => {
      const testError = new Error('Invalid date range');
      mockClient.put.mockRejectedValueOnce(testError);

      await expect(
        bookingService.batchReschedule(['booking-1'], '2026-01-20T10:00:00Z', '2026-01-20T12:00:00Z')
      )
        .rejects
        .toThrow('Invalid date range');
    });
  });

  describe('Bulk operations consistency', () => {
    it('all bulk methods should use PUT requests', () => {
      bookingService.bulkConfirm(['1']);
      bookingService.bulkReject(['1']);
      bookingService.bulkCancel(['1'], 'reason');
      bookingService.batchReschedule(['1'], 'start', 'end');

      expect(mockClient.put).toHaveBeenCalledTimes(4);
      expect(mockClient.post).not.toHaveBeenCalled();
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('all bulk methods should use /bulk/ path prefix', async () => {
      await bookingService.bulkConfirm(['1']);
      await bookingService.bulkReject(['1']);
      await bookingService.bulkCancel(['1'], 'reason');
      await bookingService.batchReschedule(['1'], 'start', 'end');

      const calls = mockClient.put.mock.calls;
      expect(calls[0][0]).toContain('/bulk/');
      expect(calls[1][0]).toContain('/bulk/');
      expect(calls[2][0]).toContain('/bulk/');
      expect(calls[3][0]).toContain('/bulk/');
    });
  });
});
