/**
 * Booking Approval Flow Tests
 * 
 * Tests booking approval workflow logic
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// TYPES
// =============================================================================

type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
type ApprovalAction = 'approve' | 'reject' | 'request_changes';

interface Booking {
  id: string;
  status: BookingStatus;
  requiresApproval: boolean;
  approvedBy?: string;
  rejectedReason?: string;
}

interface ApprovalResult {
  success: boolean;
  newStatus: BookingStatus;
  error?: string;
}

// =============================================================================
// APPROVAL LOGIC
// =============================================================================

function canTransitionTo(currentStatus: BookingStatus, targetStatus: BookingStatus): boolean {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['cancelled', 'completed'],
    rejected: [], // Terminal state
    cancelled: [], // Terminal state
    completed: [], // Terminal state
  };

  return transitions[currentStatus]?.includes(targetStatus) ?? false;
}

function processApproval(booking: Booking, action: ApprovalAction, actorId: string): ApprovalResult {
  if (!booking.requiresApproval) {
    return { success: false, newStatus: booking.status, error: 'Booking does not require approval' };
  }

  if (booking.status !== 'pending') {
    return { success: false, newStatus: booking.status, error: 'Only pending bookings can be approved/rejected' };
  }

  switch (action) {
    case 'approve':
      return { success: true, newStatus: 'approved' };
    case 'reject':
      return { success: true, newStatus: 'rejected' };
    case 'request_changes':
      return { success: true, newStatus: 'pending' };
    default:
      return { success: false, newStatus: booking.status, error: 'Invalid action' };
  }
}

function canUserApprove(userRole: string, bookingOrgId: string, userOrgId: string): boolean {
  // SAAS_ADMIN and ADMIN can approve any booking
  if (['SAAS_ADMIN', 'ADMIN'].includes(userRole)) {
    return true;
  }

  // ORG_ADMIN can approve bookings in their organization
  if (userRole === 'ORG_ADMIN' && bookingOrgId === userOrgId) {
    return true;
  }

  // CASEWORKER can approve bookings in their organization
  if (userRole === 'CASEWORKER' && bookingOrgId === userOrgId) {
    return true;
  }

  return false;
}

// =============================================================================
// TESTS
// =============================================================================

describe('Booking Approval Flow', () => {
  describe('State transitions', () => {
    it('should allow pending -> approved transition', () => {
      expect(canTransitionTo('pending', 'approved')).toBe(true);
    });

    it('should allow pending -> rejected transition', () => {
      expect(canTransitionTo('pending', 'rejected')).toBe(true);
    });

    it('should allow pending -> cancelled transition', () => {
      expect(canTransitionTo('pending', 'cancelled')).toBe(true);
    });

    it('should allow approved -> completed transition', () => {
      expect(canTransitionTo('approved', 'completed')).toBe(true);
    });

    it('should not allow rejected -> approved transition', () => {
      expect(canTransitionTo('rejected', 'approved')).toBe(false);
    });

    it('should not allow completed -> cancelled transition', () => {
      expect(canTransitionTo('completed', 'cancelled')).toBe(false);
    });
  });

  describe('Approval processing', () => {
    it('should approve pending booking', () => {
      const booking: Booking = {
        id: '1',
        status: 'pending',
        requiresApproval: true,
      };

      const result = processApproval(booking, 'approve', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('approved');
    });

    it('should reject pending booking', () => {
      const booking: Booking = {
        id: '1',
        status: 'pending',
        requiresApproval: true,
      };

      const result = processApproval(booking, 'reject', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('rejected');
    });

    it('should not approve non-pending booking', () => {
      const booking: Booking = {
        id: '1',
        status: 'approved',
        requiresApproval: true,
      };

      const result = processApproval(booking, 'approve', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('pending');
    });

    it('should not process booking that does not require approval', () => {
      const booking: Booking = {
        id: '1',
        status: 'pending',
        requiresApproval: false,
      };

      const result = processApproval(booking, 'approve', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not require approval');
    });
  });

  describe('Authorization', () => {
    it('should allow ADMIN to approve any booking', () => {
      expect(canUserApprove('ADMIN', 'org-1', 'org-2')).toBe(true);
    });

    it('should allow SAAS_ADMIN to approve any booking', () => {
      expect(canUserApprove('SAAS_ADMIN', 'org-1', 'org-2')).toBe(true);
    });

    it('should allow ORG_ADMIN to approve their org bookings', () => {
      expect(canUserApprove('ORG_ADMIN', 'org-1', 'org-1')).toBe(true);
    });

    it('should not allow ORG_ADMIN to approve other org bookings', () => {
      expect(canUserApprove('ORG_ADMIN', 'org-1', 'org-2')).toBe(false);
    });

    it('should allow CASEWORKER to approve their org bookings', () => {
      expect(canUserApprove('CASEWORKER', 'org-1', 'org-1')).toBe(true);
    });

    it('should not allow CITIZEN to approve', () => {
      expect(canUserApprove('CITIZEN', 'org-1', 'org-1')).toBe(false);
    });
  });
});
