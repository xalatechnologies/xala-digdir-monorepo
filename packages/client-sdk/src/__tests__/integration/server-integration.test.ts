/**
 * Integration Test Setup
 * 
 * Provides utilities for running integration tests against a running API server
 * These tests require: pnpm --filter @digilist/api dev
 */

import { describe, it, expect, beforeAll } from 'vitest';

// ==============================================================================
// Test Configuration
// ==============================================================================

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TENANT_ID = 'test-tenant';

// ==============================================================================
// API Client for Integration Tests
// ==============================================================================

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TEST_TENANT_ID,
      ...options.headers,
    },
  });

  const data = await response.json();
  return { data, status: response.status };
}

// ==============================================================================
// Health Check
// ==============================================================================

async function waitForServer(maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// ==============================================================================
// Integration Tests
// ==============================================================================

describe('API Integration Tests', () => {
  let serverReady = false;

  beforeAll(async () => {
    serverReady = await waitForServer(3); // Quick check
    if (!serverReady) {
      console.warn('⚠️ API server not running - skipping integration tests');
      console.warn('  To run: pnpm --filter @digilist/api dev && pnpm test');
    }
  });

  describe('Health Endpoint', () => {
    it.skipIf(!serverReady)('should return healthy status', async () => {
      const { data, status } = await apiRequest<{ status: string }>('/health');

      expect(status).toBe(200);
      expect(data.status).toBe('healthy');
    });
  });

  describe('Listings API', () => {
    it.skipIf(!serverReady)('should return listings with projection DTO structure', async () => {
      const { data, status } = await apiRequest<{ data: unknown[] }>('/api/listings');

      expect(status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const listing = data.data[0] as Record<string, unknown>;
        // Verify projection structure
        expect(listing).toHaveProperty('id');
        expect(listing).toHaveProperty('title');
        expect(listing).toHaveProperty('permissions');
        expect(listing).toHaveProperty('availableActions');
      }
    });

    it.skipIf(!serverReady)('should include permissions in listing response', async () => {
      const { data } = await apiRequest<{ data: unknown[] }>('/api/listings');

      if (data.data.length > 0) {
        const listing = data.data[0] as Record<string, unknown>;
        const permissions = listing.permissions as Record<string, boolean>;

        expect(permissions).toHaveProperty('canView');
        expect(typeof permissions.canView).toBe('boolean');
      }
    });
  });

  describe('RFC7807 Error Contract', () => {
    it.skipIf(!serverReady)('should return RFC7807 error for invalid request', async () => {
      const { data, status } = await apiRequest<Record<string, unknown>>(
        '/api/listings/invalid-id-that-does-not-exist'
      );

      expect(status).toBe(404);
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('detail');
    });

    it.skipIf(!serverReady)('should include correlationId in error response', async () => {
      const { data } = await apiRequest<Record<string, unknown>>(
        '/api/invalid-endpoint'
      );

      // Should have either correlationId or traceId
      expect(
        data.correlationId || data.traceId
      ).toBeDefined();
    });
  });

  describe('Auth Endpoints', () => {
    it.skipIf(!serverReady)('should require authentication for protected routes', async () => {
      const { status } = await apiRequest('/api/bookings/mine');

      expect(status).toBe(401);
    });
  });
});

// ==============================================================================
// Test Utilities Export
// ==============================================================================

export { apiRequest, waitForServer, API_BASE_URL, TEST_TENANT_ID };

console.log('✅ Integration test setup loaded');
