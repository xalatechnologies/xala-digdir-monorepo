/**
 * Rental object test fixtures
 */

import { mockTenant, mockOrganization } from './tenants.js';

export const mockRentalObject = {
  id: 'rental-1',
  tenantId: mockTenant.id,
  organizationId: mockOrganization.id,
  title: 'Test Rental Object',
  description: 'A test rental object for unit testing',
  typeCode: 'SPACE',
  status: 'PUBLISHED',
  capacity: 20,
  bookingMode: 'SINGLE_SLOT',
  approvalRequired: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockRentalObjects = [
  mockRentalObject,
  {
    ...mockRentalObject,
    id: 'rental-2',
    title: 'Meeting Room A',
    capacity: 10,
  },
  {
    ...mockRentalObject,
    id: 'rental-3',
    title: 'Sports Hall',
    typeCode: 'SPACE',
    capacity: 100,
  },
];

export function createMockRentalObject(overrides: Partial<typeof mockRentalObject> = {}) {
  return {
    ...mockRentalObject,
    id: `rental-${Date.now()}`,
    ...overrides,
  };
}
