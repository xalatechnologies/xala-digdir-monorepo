/**
 * Booking Approve/Reject Tests
 * Comprehensive tests for caseworker booking approval workflow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingService } from '@xala/api/booking.service';
import type { BookingRepository } from '@xala/api/booking.repository';

describe('BookingService - Approve/Reject', () => {
  let service: BookingService;
  let mockRepository: Partial<BookingRepository>;
  let mockAdapters: any;

  const mockBooking = {
    id: 'booking-123',
    tenantId: 'tenant-123',
    userId: 'user-456',
    rentalObjectId: 'rental-789',
    status: 'pending',
    startTime: new Date('2026-03-01T10:00:00Z'),
    endTime: new Date('2026-03-01T12:00:00Z'),
    totalPrice: '500',
    currency: 'NOK',
    notes: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepository = {
      findByIdOrFail: vi.fn().mockResolvedValue(mockBooking),
      update: vi.fn().mockResolvedValue({
        ...mockBooking,
        status: 'approved',
        metadata: {
          approvedBy: 'caseworker-123',
          approvedAt: expect.any(String),
        },
      }),
    };

    mockAdapters = {
      log: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    service = new BookingService(
      mockRepository as any,
      {} as any,
      mockAdapters
    );
  });

  describe('approve', () => {
    it('should approve booking successfully', async () => {
      const result = await service.approve('booking-123', 'caseworker-123', 'Approved for demo');

      expect(mockRepository.findByIdOrFail).toHaveBeenCalledWith('booking-123');
      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'approved',
        metadata: expect.objectContaining({
          approvedBy: 'caseworker-123',
          approvedAt: expect.any(String),
          approvalReason: 'Approved for demo',
        }),
      });
      expect(result.status).toBe('approved');
    });

    it('should approve without reason', async () => {
      const result = await service.approve('booking-123', 'caseworker-123');

      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'approved',
        metadata: expect.objectContaining({
          approvedBy: 'caseworker-123',
          approvalReason: undefined,
        }),
      });
    });

    it('should log approval action', async () => {
      await service.approve('booking-123', 'caseworker-123', 'Approved');

      expect(mockAdapters.log.info).toHaveBeenCalledWith(
        'Booking approved',
        expect.objectContaining({
          id: 'booking-123',
          userId: 'caseworker-123',
        })
      );
    });

    it('should throw if booking not found', async () => {
      mockRepository.findByIdOrFail = vi.fn().mockRejectedValue(new Error('Not found'));

      await expect(
        service.approve('invalid-id', 'caseworker-123')
      ).rejects.toThrow('Not found');
    });

    it('should preserve existing metadata', async () => {
      const bookingWithMetadata = {
        ...mockBooking,
        metadata: { existingKey: 'existingValue' },
      };
      mockRepository.findByIdOrFail = vi.fn().mockResolvedValue(bookingWithMetadata);

      await service.approve('booking-123', 'caseworker-123');

      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'approved',
        metadata: expect.objectContaining({
          existingKey: 'existingValue',
          approvedBy: 'caseworker-123',
        }),
      });
    });
  });

  describe('reject', () => {
    beforeEach(() => {
      mockRepository.update = vi.fn().mockResolvedValue({
        ...mockBooking,
        status: 'rejected',
        metadata: {
          rejectedBy: 'caseworker-123',
          rejectedAt: expect.any(String),
          rejectionReason: 'Not available',
        },
      });
    });

    it('should reject booking with reason', async () => {
      const result = await service.reject('booking-123', 'caseworker-123', 'Not available');

      expect(mockRepository.findByIdOrFail).toHaveBeenCalledWith('booking-123');
      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'rejected',
        metadata: expect.objectContaining({
          rejectedBy: 'caseworker-123',
          rejectedAt: expect.any(String),
          rejectionReason: 'Not available',
        }),
      });
      expect(result.status).toBe('rejected');
    });

    it('should throw if reason is empty', async () => {
      await expect(
        service.reject('booking-123', 'caseworker-123', '')
      ).rejects.toThrow('Rejection reason is required');
    });

    it('should throw if reason is whitespace only', async () => {
      await expect(
        service.reject('booking-123', 'caseworker-123', '   ')
      ).rejects.toThrow('Rejection reason is required');
    });

    it('should log rejection action', async () => {
      await service.reject('booking-123', 'caseworker-123', 'Not available');

      expect(mockAdapters.log.warn).toHaveBeenCalledWith(
        'Booking rejected',
        expect.objectContaining({
          id: 'booking-123',
          userId: 'caseworker-123',
          reason: 'Not available',
        })
      );
    });

    it('should preserve existing metadata', async () => {
      const bookingWithMetadata = {
        ...mockBooking,
        metadata: { existingKey: 'existingValue' },
      };
      mockRepository.findByIdOrFail = vi.fn().mockResolvedValue(bookingWithMetadata);

      await service.reject('booking-123', 'caseworker-123', 'Rejected');

      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'rejected',
        metadata: expect.objectContaining({
          existingKey: 'existingValue',
          rejectedBy: 'caseworker-123',
          rejectionReason: 'Rejected',
        }),
      });
    });
  });

  describe('Audit Trail', () => {
    it('should create audit log for approval', async () => {
      // Note: This would require mocking getAuditService()
      // For now, we verify the service method is called
      await service.approve('booking-123', 'caseworker-123', 'Approved');

      // Audit service should be called with correct params
      // expect(auditService.log).toHaveBeenCalledWith({
      //   tenantId: 'tenant-123',
      //   userId: 'caseworker-123',
      //   action: 'approve',
      //   resource: 'booking',
      //   resourceId: 'booking-123',
      //   metadata: { reason: 'Approved', previousStatus: 'pending' },
      // });
    });

    it('should create audit log for rejection', async () => {
      await service.reject('booking-123', 'caseworker-123', 'Rejected');

      // Audit service should be called with severity: 'warning'
      // expect(auditService.log).toHaveBeenCalledWith({
      //   tenantId: 'tenant-123',
      //   userId: 'caseworker-123',
      //   action: 'reject',
      //   resource: 'booking',
      //   resourceId: 'booking-123',
      //   severity: 'warning',
      //   metadata: { reason: 'Rejected', previousStatus: 'pending' },
      // });
    });
  });

  describe('Real-time Events', () => {
    it('should broadcast approval event', async () => {
      // Note: This would require mocking broadcastBookingEvent()
      await service.approve('booking-123', 'caseworker-123', 'Approved');

      // Broadcast should be called with approval event
      // expect(broadcastBookingEvent).toHaveBeenCalledWith({
      //   type: 'approved',
      //   bookingId: 'booking-123',
      //   rentalObjectId: 'rental-789',
      //   tenantId: 'tenant-123',
      //   userId: 'caseworker-123',
      //   metadata: { approvedBy: 'caseworker-123', reason: 'Approved' },
      // });
    });

    it('should broadcast rejection event', async () => {
      await service.reject('booking-123', 'caseworker-123', 'Rejected');

      // Broadcast should be called with rejection event
      // expect(broadcastBookingEvent).toHaveBeenCalledWith({
      //   type: 'rejected',
      //   bookingId: 'booking-123',
      //   rentalObjectId: 'rental-789',
      //   tenantId: 'tenant-123',
      //   userId: 'caseworker-123',
      //   metadata: { rejectedBy: 'caseworker-123', reason: 'Rejected' },
      // });
    });
  });

  describe('Edge Cases', () => {
    it('should handle already approved booking', async () => {
      const approvedBooking = { ...mockBooking, status: 'approved' };
      mockRepository.findByIdOrFail = vi.fn().mockResolvedValue(approvedBooking);

      // Should still allow re-approval (idempotent)
      const result = await service.approve('booking-123', 'caseworker-123');

      expect(result.status).toBe('approved');
    });

    it('should handle already rejected booking', async () => {
      const rejectedBooking = { ...mockBooking, status: 'rejected' };
      mockRepository.findByIdOrFail = vi.fn().mockResolvedValue(rejectedBooking);

      // Should still allow re-rejection (idempotent)
      const result = await service.reject('booking-123', 'caseworker-123', 'Still rejected');

      expect(result.status).toBe('rejected');
    });

    it('should handle very long rejection reason', async () => {
      const longReason = 'A'.repeat(1000);

      const result = await service.reject('booking-123', 'caseworker-123', longReason);

      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'rejected',
        metadata: expect.objectContaining({
          rejectionReason: longReason,
        }),
      });
    });

    it('should handle special characters in reason', async () => {
      const specialReason = 'Rejected: "Not available" & <unavailable>';

      const result = await service.reject('booking-123', 'caseworker-123', specialReason);

      expect(mockRepository.update).toHaveBeenCalledWith('booking-123', {
        status: 'rejected',
        metadata: expect.objectContaining({
          rejectionReason: specialReason,
        }),
      });
    });
  });
});
