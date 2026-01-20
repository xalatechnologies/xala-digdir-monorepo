/**
 * Booking Availability Policy Tests
 * 
 * Unit tests for booking availability rules calculation
 * Tests pure business logic without database
 */

import { describe, it, expect, beforeEach } from 'vitest';

// =============================================================================
// POLICY TYPES (would normally import from @xala/api)
// =============================================================================

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface BookingPolicy {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  allowOverlapping: boolean;
  requireApproval: boolean;
  cancellationDeadlineHours: number;
}

interface AvailabilityResult {
  available: boolean;
  reason?: string;
  reasonKey?: string;
}

// =============================================================================
// POLICY IMPLEMENTATION (simplified for testing)
// =============================================================================

function checkSlotAvailability(
  slot: TimeSlot,
  existingBookings: TimeSlot[],
  policy: BookingPolicy,
  now: Date = new Date()
): AvailabilityResult {
  // Check minimum advance booking
  const hoursUntilStart = (slot.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilStart < policy.minAdvanceHours) {
    return {
      available: false,
      reason: `Booking must be made at least ${policy.minAdvanceHours} hours in advance`,
      reasonKey: 'policy.booking.min_advance_not_met',
    };
  }

  // Check maximum advance booking
  const daysUntilStart = hoursUntilStart / 24;
  if (daysUntilStart > policy.maxAdvanceDays) {
    return {
      available: false,
      reason: `Booking cannot be made more than ${policy.maxAdvanceDays} days in advance`,
      reasonKey: 'policy.booking.max_advance_exceeded',
    };
  }

  // Check duration limits
  const durationMinutes = (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60);
  if (durationMinutes < policy.minDurationMinutes) {
    return {
      available: false,
      reason: `Minimum booking duration is ${policy.minDurationMinutes} minutes`,
      reasonKey: 'policy.booking.min_duration_not_met',
    };
  }
  if (durationMinutes > policy.maxDurationMinutes) {
    return {
      available: false,
      reason: `Maximum booking duration is ${policy.maxDurationMinutes} minutes`,
      reasonKey: 'policy.booking.max_duration_exceeded',
    };
  }

  // Check for overlapping bookings
  if (!policy.allowOverlapping) {
    const hasConflict = existingBookings.some(existing => {
      return slot.startTime < existing.endTime && slot.endTime > existing.startTime;
    });
    if (hasConflict) {
      return {
        available: false,
        reason: 'Time slot conflicts with existing booking',
        reasonKey: 'policy.slot.already_booked',
      };
    }
  }

  return { available: true };
}

function canCancelBooking(
  bookingStart: Date,
  policy: BookingPolicy,
  now: Date = new Date()
): AvailabilityResult {
  const hoursUntilStart = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilStart < policy.cancellationDeadlineHours) {
    return {
      available: false,
      reason: `Cancellation deadline is ${policy.cancellationDeadlineHours} hours before booking`,
      reasonKey: 'policy.cancellation.deadline_passed',
    };
  }

  return { available: true };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Booking Availability Policy', () => {
  const defaultPolicy: BookingPolicy = {
    minAdvanceHours: 2,
    maxAdvanceDays: 90,
    minDurationMinutes: 30,
    maxDurationMinutes: 480,
    allowOverlapping: false,
    requireApproval: false,
    cancellationDeadlineHours: 24,
  };

  const now = new Date('2026-01-20T10:00:00Z');

  describe('Advance booking rules', () => {
    it('should reject booking with insufficient advance notice', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-01-20T11:00:00Z'), // 1 hour from now
        endTime: new Date('2026-01-20T12:00:00Z'),
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.booking.min_advance_not_met');
    });

    it('should accept booking with sufficient advance notice', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-01-20T14:00:00Z'), // 4 hours from now
        endTime: new Date('2026-01-20T15:00:00Z'),
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(true);
    });

    it('should reject booking too far in advance', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-06-01T10:00:00Z'), // > 90 days
        endTime: new Date('2026-06-01T11:00:00Z'),
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.booking.max_advance_exceeded');
    });
  });

  describe('Duration limits', () => {
    it('should reject booking shorter than minimum duration', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-01-21T10:00:00Z'),
        endTime: new Date('2026-01-21T10:15:00Z'), // 15 minutes
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.booking.min_duration_not_met');
    });

    it('should reject booking longer than maximum duration', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-01-21T08:00:00Z'),
        endTime: new Date('2026-01-21T18:00:00Z'), // 10 hours = 600 minutes
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.booking.max_duration_exceeded');
    });

    it('should accept booking within duration limits', () => {
      const slot: TimeSlot = {
        startTime: new Date('2026-01-21T10:00:00Z'),
        endTime: new Date('2026-01-21T12:00:00Z'), // 2 hours
      };

      const result = checkSlotAvailability(slot, [], defaultPolicy, now);

      expect(result.available).toBe(true);
    });
  });

  describe('Conflict detection', () => {
    it('should detect overlapping bookings', () => {
      const existingBooking: TimeSlot = {
        startTime: new Date('2026-01-21T10:00:00Z'),
        endTime: new Date('2026-01-21T12:00:00Z'),
      };

      const newSlot: TimeSlot = {
        startTime: new Date('2026-01-21T11:00:00Z'), // overlaps
        endTime: new Date('2026-01-21T13:00:00Z'),
      };

      const result = checkSlotAvailability(newSlot, [existingBooking], defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.slot.already_booked');
    });

    it('should allow adjacent bookings (no overlap)', () => {
      const existingBooking: TimeSlot = {
        startTime: new Date('2026-01-21T10:00:00Z'),
        endTime: new Date('2026-01-21T12:00:00Z'),
      };

      const newSlot: TimeSlot = {
        startTime: new Date('2026-01-21T12:00:00Z'), // starts when other ends
        endTime: new Date('2026-01-21T14:00:00Z'),
      };

      const result = checkSlotAvailability(newSlot, [existingBooking], defaultPolicy, now);

      expect(result.available).toBe(true);
    });
  });

  describe('Cancellation policy', () => {
    it('should allow cancellation before deadline', () => {
      const bookingStart = new Date('2026-01-22T10:00:00Z'); // 48 hours away

      const result = canCancelBooking(bookingStart, defaultPolicy, now);

      expect(result.available).toBe(true);
    });

    it('should reject cancellation after deadline', () => {
      const bookingStart = new Date('2026-01-20T20:00:00Z'); // 10 hours away

      const result = canCancelBooking(bookingStart, defaultPolicy, now);

      expect(result.available).toBe(false);
      expect(result.reasonKey).toBe('policy.cancellation.deadline_passed');
    });
  });
});
