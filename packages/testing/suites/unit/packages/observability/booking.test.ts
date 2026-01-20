/**
 * Booking Metrics Tests
 * Tests booking metric recording functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordBookingCreated,
  recordBookingConflict,
  recordBookingApproval,
  recordBookingCancellation,
  withBookingMetrics,
} from './booking';
import { prometheusExporter } from '@digilist/api/exporters/prometheus';

// SKIPPED
describe.skip('Booking Metrics', () => {
  beforeEach(() => {
    prometheusExporter.resetMetrics();
  });

  describe('recordBookingCreated', () => {
    it('should record successful booking creation', () => {
      recordBookingCreated('SINGLE_SLOT', 'success', 0.234, 'tenant-123');

      const metrics = prometheusExporter.getMetric('booking_created_total');
      expect(metrics).toBeDefined();
    });

    it('should record failed booking creation', () => {
      recordBookingCreated('IN_GAME', 'failure', 0.123, 'tenant-456');

      const metrics = prometheusExporter.getMetric('booking_created_total');
      expect(metrics).toBeDefined();
    });

    it('should record booking conflict', () => {
      recordBookingCreated('RECURRING', 'conflict', 0.456, 'tenant-789');

      const metrics = prometheusExporter.getMetric('booking_created_total');
      expect(metrics).toBeDefined();
    });

    it('should record duration for successful bookings', () => {
      recordBookingCreated('SINGLE_SLOT', 'success', 1.234, 'tenant-123');

      const durationMetrics = prometheusExporter.getMetric('booking_creation_duration_seconds');
      expect(durationMetrics).toBeDefined();
    });
  });

  describe('recordBookingConflict', () => {
    it('should record SINGLE_SLOT conflict', () => {
      recordBookingConflict('SINGLE_SLOT', 'tenant-123');

      const metrics = prometheusExporter.getMetric('booking_conflicts_total');
      expect(metrics).toBeDefined();
    });

    it('should record IN_GAME conflict', () => {
      recordBookingConflict('IN_GAME', 'tenant-456');

      const metrics = prometheusExporter.getMetric('booking_conflicts_total');
      expect(metrics).toBeDefined();
    });

    it('should record RECURRING conflict', () => {
      recordBookingConflict('RECURRING', 'tenant-789');

      const metrics = prometheusExporter.getMetric('booking_conflicts_total');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordBookingApproval', () => {
    it('should record booking approval', () => {
      recordBookingApproval('approve', 'tenant-123');

      const metrics = prometheusExporter.getMetric('booking_approvals_total');
      expect(metrics).toBeDefined();
    });

    it('should record booking rejection', () => {
      recordBookingApproval('reject', 'tenant-456');

      const metrics = prometheusExporter.getMetric('booking_approvals_total');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordBookingCancellation', () => {
    it('should record user cancellation', () => {
      recordBookingCancellation('user', 'tenant-123');

      const metrics = prometheusExporter.getMetric('booking_cancellations_total');
      expect(metrics).toBeDefined();
    });

    it('should record admin cancellation', () => {
      recordBookingCancellation('admin', 'tenant-456');

      const metrics = prometheusExporter.getMetric('booking_cancellations_total');
      expect(metrics).toBeDefined();
    });

    it('should record system cancellation', () => {
      recordBookingCancellation('system', 'tenant-789');

      const metrics = prometheusExporter.getMetric('booking_cancellations_total');
      expect(metrics).toBeDefined();
    });

    it('should record conflict cancellation', () => {
      recordBookingCancellation('conflict', 'tenant-123');

      const metrics = prometheusExporter.getMetric('booking_cancellations_total');
      expect(metrics).toBeDefined();
    });
  });

  describe('withBookingMetrics', () => {
    it('should wrap successful booking operation', async () => {
      const mockBooking = async () => {
        return { id: 'booking-123', status: 'confirmed' };
      };

      const result = await withBookingMetrics('SINGLE_SLOT', 'tenant-123', mockBooking);

      expect(result).toEqual({ id: 'booking-123', status: 'confirmed' });

      const metrics = prometheusExporter.getMetric('booking_created_total');
      expect(metrics).toBeDefined();
    });

    it('should wrap failed booking operation', async () => {
      const mockBooking = async () => {
        throw new Error('Booking failed');
      };

      await expect(
        withBookingMetrics('IN_GAME', 'tenant-456', mockBooking)
      ).rejects.toThrow('Booking failed');

      const metrics = prometheusExporter.getMetric('booking_created_total');
      expect(metrics).toBeDefined();
    });

    it('should detect and record conflicts', async () => {
      const mockBooking = async () => {
        throw new Error('Booking conflict detected');
      };

      await expect(
        withBookingMetrics('RECURRING', 'tenant-789', mockBooking)
      ).rejects.toThrow('Booking conflict detected');

      const conflictMetrics = prometheusExporter.getMetric('booking_conflicts_total');
      expect(conflictMetrics).toBeDefined();
    });

    it('should measure booking operation duration', async () => {
      const mockBooking = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { id: 'booking-456' };
      };

      await withBookingMetrics('SINGLE_SLOT', 'tenant-123', mockBooking);

      const durationMetrics = prometheusExporter.getMetric('booking_creation_duration_seconds');
      expect(durationMetrics).toBeDefined();
    });
  });
});
