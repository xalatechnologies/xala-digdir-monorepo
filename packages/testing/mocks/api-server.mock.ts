/**
 * Mock API Server for Integration Tests
 * Provides mock responses for API endpoints when real API is not available
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const WS_BASE_URL = process.env.WS_URL || 'http://localhost:3002';

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

  // RBAC endpoints
  http.get(`${API_BASE_URL}/api/rbac/matrix`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_BASE_URL}/api/rbac/roles`, () => {
    return HttpResponse.json({ data: [] });
  }),

  // Feature flags
  http.get(`${API_BASE_URL}/api/feature-flags`, () => {
    return HttpResponse.json({ data: [] });
  }),

  // I18n endpoints
  http.get(`${API_BASE_URL}/api/i18n/:lang`, () => {
    return HttpResponse.json({ data: {} });
  }),

  // Metadata
  http.get(`${API_BASE_URL}/api/metadata`, () => {
    return HttpResponse.json({ data: {} });
  }),

  // WebSocket health (mock as HTTP for testing)
  http.get(`${WS_BASE_URL}/health`, () => {
    return HttpResponse.json({ status: 'healthy' });
  }),

  // GDPR/DSAR endpoints
  http.get(`${API_BASE_URL}/api/gdpr/export`, () => {
    return HttpResponse.json({ data: {} });
  }),

  // Vipps endpoints
  http.post(`${API_BASE_URL}/api/vipps/login`, () => {
    return HttpResponse.json({ redirectUrl: 'https://mock-vipps.no' });
  }),

  http.post(`${API_BASE_URL}/api/vipps/payment`, () => {
    return HttpResponse.json({ orderId: 'mock-order' });
  }),

  // Catch-all for unhandled requests
  http.get(`${API_BASE_URL}/*`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/*`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
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
