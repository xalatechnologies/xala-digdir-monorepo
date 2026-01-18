/**
 * API mock for tests using MSW (Mock Service Worker)
 */

import { http, HttpResponse } from 'msw';
import { mockRentalObjects } from '../fixtures/rental-objects.js';
import { mockBookings } from '../fixtures/bookings.js';
import { mockUsers, mockTenant, mockOrganization } from '../fixtures/index.js';

const API_BASE = 'http://localhost:4000/api';

/**
 * Default API handlers for common endpoints
 */
export const defaultApiHandlers = [
  // Auth
  http.get(`${API_BASE}/auth/session`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUsers.admin,
        tenant: mockTenant,
        permissions: ['*'],
      },
    });
  }),
  
  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),
  
  // Rental Objects
  http.get(`${API_BASE}/rental-objects`, () => {
    return HttpResponse.json({
      success: true,
      data: mockRentalObjects,
      pagination: {
        total: mockRentalObjects.length,
        page: 1,
        pageSize: 20,
      },
    });
  }),
  
  http.get(`${API_BASE}/rental-objects/:id`, ({ params }) => {
    const obj = mockRentalObjects.find(o => o.id === params.id);
    if (!obj) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Rental object not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: obj });
  }),
  
  // Bookings
  http.get(`${API_BASE}/bookings`, () => {
    return HttpResponse.json({
      success: true,
      data: mockBookings,
      pagination: {
        total: mockBookings.length,
        page: 1,
        pageSize: 20,
      },
    });
  }),
  
  // Users
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: Object.values(mockUsers),
    });
  }),
  
  // Organizations
  http.get(`${API_BASE}/organizations`, () => {
    return HttpResponse.json({
      success: true,
      data: [mockOrganization],
    });
  }),
];

/**
 * Create custom API handlers for specific test scenarios
 */
export function createApiHandlers(overrides: Parameters<typeof http.get>[1][] = []) {
  return [...defaultApiHandlers, ...overrides];
}
