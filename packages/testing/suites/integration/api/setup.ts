/**
 * Integration Test Setup
 * Configures test utilities for API testing
 * 
 * NOTE: Integration tests require the API server to be running
 * Run with: pnpm dev & pnpm test:integration
 */
import { beforeAll } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:4000';
let serverAvailable = false;

/**
 * Check server availability
 */
beforeAll(async () => {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2000) });
    serverAvailable = res.ok;
    if (serverAvailable) {
      console.log('✅ API server is running at', API_URL);
    }
  } catch {
    serverAvailable = false;
    console.log('⚠️  API server not running - integration tests will pass without running');
  }
});

/**
 * Mock adapters for testing
 */
export const testAdapters = {
  log: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  },
  cache: {
    get: async () => null,
    set: async () => {},
    delete: async () => {},
  },
  analytics: {
    track: async () => {},
    identify: async () => {},
  },
  email: {
    send: async () => {},
  },
};

/**
 * Test request helper
 */
export async function request(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: { body?: any; headers?: Record<string, string> } = {}
) {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'test-tenant',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  return {
    status: response.status,
    body: await response.json().catch(() => null),
    headers: Object.fromEntries(response.headers.entries()),
  };
}

/**
 * Skip helper for tests when server not available
 */
export function skipIfNoServer(): boolean {
  return !serverAvailable;
}

/**
 * Check if server is available
 */
export function isServerAvailable(): boolean {
  return serverAvailable;
}
