/**
 * Booking test fixtures
 */

import { mockTenant, mockUsers } from './index.js';
import { mockRentalObject } from './rental-objects.js';

export const mockBooking = {
  id: 'booking-1',
  tenantId: mockTenant.id,
  rentalObjectId: mockRentalObject.id,
  bookedByUserId: mockUsers.citizen.id,
  startAt: new Date('2026-01-15T10:00:00'),
  endAt: new Date('2026-01-15T12:00:00'),
  status: 'APPROVED',
  bookingMode: 'SINGLE_SLOT',
  approvalStatus: 'NOT_REQUIRED',
  currency: 'NOK',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockBookings = [
  mockBooking,
  {
    ...mockBooking,
    id: 'booking-2',
    startAt: new Date('2026-01-16T14:00:00'),
    endAt: new Date('2026-01-16T16:00:00'),
    status: 'PENDING',
  },
  {
    ...mockBooking,
    id: 'booking-3',
    startAt: new Date('2026-01-17T09:00:00'),
    endAt: new Date('2026-01-17T11:00:00'),
    status: 'CANCELLED',
  },
];

export function createMockBooking(overrides: Partial<typeof mockBooking> = {}) {
  return {
    ...mockBooking,
    id: `booking-${Date.now()}`,
    ...overrides,
  };
}
