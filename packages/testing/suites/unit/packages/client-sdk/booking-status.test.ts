/**
 * Booking Status Enum Tests
 * Validates the 8 canonical booking statuses across all layers
 */

import { describe, it, expect } from 'vitest';

// BookingStatus type definition for testing
type BookingStatus =
  | 'pending'
  | 'pending_approval'
  | 'approved'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired';

// SKIPPED
describe.skip('BookingStatus Enum - SDK Types', () => {
  /**
   * Canonical 8 booking statuses per docs/booking/inventory-booking-modes-and-rules.md
   */
  const CANONICAL_STATUSES: BookingStatus[] = [
    'pending',
    'pending_approval',
    'approved',
    'confirmed',
    'rejected',
    'cancelled',
    'completed',
    'expired',
  ];

  it('should have exactly 8 canonical statuses', () => {
    expect(CANONICAL_STATUSES).toHaveLength(8);
  });

  it('should include all required workflow states', () => {
    expect(CANONICAL_STATUSES).toContain('pending');
    expect(CANONICAL_STATUSES).toContain('pending_approval');
    expect(CANONICAL_STATUSES).toContain('approved');
    expect(CANONICAL_STATUSES).toContain('confirmed');
    expect(CANONICAL_STATUSES).toContain('rejected');
    expect(CANONICAL_STATUSES).toContain('cancelled');
    expect(CANONICAL_STATUSES).toContain('completed');
    expect(CANONICAL_STATUSES).toContain('expired');
  });

  it('should NOT include deprecated "denied" status', () => {
    expect(CANONICAL_STATUSES).not.toContain('denied');
  });

  describe('Status Transitions - State Machine Validation', () => {
    // Per docs/booking-approvals/state-machine.md
    const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
      pending: ['pending_approval', 'confirmed', 'cancelled'],
      pending_approval: ['approved', 'rejected', 'expired', 'cancelled'],
      approved: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      rejected: [], // Terminal state
      cancelled: [], // Terminal state
      completed: [], // Terminal state
      expired: [], // Terminal state
    };

    it.each([
      ['pending', 'pending_approval', true],
      ['pending', 'confirmed', true],
      ['pending', 'cancelled', true],
      ['pending_approval', 'approved', true],
      ['pending_approval', 'rejected', true],
      ['approved', 'confirmed', true],
      ['confirmed', 'completed', true],
      // Invalid transitions
      ['pending', 'completed', false],
      ['rejected', 'approved', false],
      ['completed', 'pending', false],
      ['cancelled', 'confirmed', false],
    ])(
      'transition from %s to %s should be %s',
      (from, to, shouldBeValid) => {
        const fromStatus = from as BookingStatus;
        const toStatus = to as BookingStatus;
        const validTargets = VALID_TRANSITIONS[fromStatus];
        const isValid = validTargets.includes(toStatus);
        expect(isValid).toBe(shouldBeValid);
      }
    );

    it('terminal states should have no valid transitions', () => {
      const terminalStates: BookingStatus[] = ['rejected', 'cancelled', 'completed', 'expired'];
      
      for (const state of terminalStates) {
        expect(VALID_TRANSITIONS[state]).toEqual([]);
      }
    });
  });

  describe('Status Labels - i18n Keys', () => {
    const STATUS_I18N_KEYS: Record<BookingStatus, string> = {
      pending: 'booking.status.pending',
      pending_approval: 'booking.status.pending_approval',
      approved: 'booking.status.approved',
      confirmed: 'booking.status.confirmed',
      rejected: 'booking.status.rejected',
      cancelled: 'booking.status.cancelled',
      completed: 'booking.status.completed',
      expired: 'booking.status.expired',
    };

    it('should have i18n key for each status', () => {
      for (const status of CANONICAL_STATUSES) {
        expect(STATUS_I18N_KEYS[status]).toBeDefined();
        expect(STATUS_I18N_KEYS[status]).toContain('booking.status.');
      }
    });
  });

  describe('Status Colors - UI Badge Mapping', () => {
    type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';
    
    const STATUS_BADGE_VARIANTS: Record<BookingStatus, BadgeVariant> = {
      pending: 'neutral',
      pending_approval: 'warning',
      approved: 'info',
      confirmed: 'success',
      rejected: 'danger',
      cancelled: 'neutral',
      completed: 'success',
      expired: 'neutral',
    };

    it('should map each status to a badge variant', () => {
      for (const status of CANONICAL_STATUSES) {
        expect(STATUS_BADGE_VARIANTS[status]).toBeDefined();
      }
    });

    it('positive states should use success variant', () => {
      expect(STATUS_BADGE_VARIANTS.confirmed).toBe('success');
      expect(STATUS_BADGE_VARIANTS.completed).toBe('success');
    });

    it('negative states should use danger variant', () => {
      expect(STATUS_BADGE_VARIANTS.rejected).toBe('danger');
    });

    it('waiting states should use warning variant', () => {
      expect(STATUS_BADGE_VARIANTS.pending_approval).toBe('warning');
    });
  });
});

// SKIPPED
describe.skip('BookingStatus - Type Safety', () => {
  it('should correctly type a booking object', () => {
    interface MockBooking {
      id: string;
      status: BookingStatus;
    }

    const booking: MockBooking = {
      id: 'test-123',
      status: 'confirmed',
    };

    expect(booking.status).toBe('confirmed');
  });

  it('should work with status filter arrays', () => {
    const activeStatuses: BookingStatus[] = ['pending', 'pending_approval', 'approved', 'confirmed'];
    const terminalStatuses: BookingStatus[] = ['rejected', 'cancelled', 'completed', 'expired'];

    expect(activeStatuses).toHaveLength(4);
    expect(terminalStatuses).toHaveLength(4);
    
    // All statuses should be covered
    expect([...activeStatuses, ...terminalStatuses]).toHaveLength(8);
  });
});
