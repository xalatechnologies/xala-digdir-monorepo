/**
 * Test data fixtures for bookings
 */

export const mockRentalObject = {
  id: 'rental-obj-meeting-room-1',
  title: 'Møterom A (Meeting Room A)',
  status: 'published',
  requiresApproval: true,
  tenantId: 'test-kommune-1',
  availabilityRules: {
    bufferMinutes: 15,
    minBookingDuration: 60,
    maxBookingDuration: 480,
  },
};

export const mockBooking = {
  title: 'Team Meeting - Q1 Planning',
  notes: 'Need projector and whiteboard',
  purpose: 'internal_meeting',
};

/**
 * Generate booking data with dynamic date (tomorrow)
 */
export function getTestBookingData() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD format

  return {
    ...mockBooking,
    date: dateStr,
    startTime: '10:00',
    endTime: '12:00',
    rentalObjectId: mockRentalObject.id,
  };
}

/**
 * Expected booking states
 */
export const BOOKING_STATES = {
  pending: 'pending',
  approved: 'approved',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  denied: 'denied',
};

/**
 * Test users
 */
export const mockUsers = {
  user: {
    id: 'user-test-1',
    email: 'user@test.com',
    role: 'user',
    capabilities: ['booking:create'],
  },
  admin: {
    id: 'admin-test-1',
    email: 'admin@test.com',
    role: 'admin',
    capabilities: ['booking:create', 'booking:approve', 'booking:deny', 'booking:read'],
  },
};

/**
 * Approval reason for testing
 */
export const APPROVAL_REASON = 'Møterom er ledig. Alt utstyr tilgjengelig. (Room available. All equipment ready.)';
