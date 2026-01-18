/**
 * Mock API Server for Integration Tests
 * Provides mock responses for API endpoints when real API is not available
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Mock handlers for common API endpoints
export const handlers = [
  // Health endpoint
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
  }),

  // Listings endpoints
  http.get(`${API_BASE_URL}/api/listings`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'mock-listing-1',
          title: 'Mock Listing',
          description: 'Test listing',
          permissions: { canBook: true, canEdit: false },
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/api/listings/:id`, ({ params }) => {
    const { id } = params;
    if (id === 'invalid-id-that-does-not-exist') {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Not Found',
          status: 404,
          detail: 'Listing not found',
          correlationId: 'mock-correlation-id',
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      id,
      title: 'Mock Listing',
      permissions: { canBook: true },
    });
  }),

  // Bookings endpoints
  http.get(`${API_BASE_URL}/api/bookings/mine`, () => {
    return HttpResponse.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        correlationId: 'mock-correlation-id',
      },
      { status: 401 }
    );
  }),

  // Invalid endpoint
  http.get(`${API_BASE_URL}/api/invalid-endpoint`, () => {
    return HttpResponse.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Not Found',
        status: 404,
        detail: 'Endpoint not found',
        correlationId: 'mock-correlation-id',
      },
      { status: 404 }
    );
  }),

  // Users endpoint
  http.get(`${API_BASE_URL}/api/users`, () => {
    return HttpResponse.json({ data: [] });
  }),

  // Organizations endpoint
  http.get(`${API_BASE_URL}/api/organizations`, () => {
    return HttpResponse.json({ data: [] });
  }),

  // Audit endpoint
  http.get(`${API_BASE_URL}/api/audit`, () => {
    return HttpResponse.json({ data: [] });
  }),
];

// Create and export the mock server
export const mockApiServer = setupServer(...handlers);

// Helper to check if real API is available
export async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Setup function for tests
export function setupMockApi() {
  beforeAll(() => mockApiServer.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => mockApiServer.resetHandlers());
  afterAll(() => mockApiServer.close());
}
