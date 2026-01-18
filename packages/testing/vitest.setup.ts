/**
 * Global Vitest Setup
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';
import { mockApiServer, isApiAvailable } from './mocks/api-server.mock';

// Check if real API is available and start mock server if needed
let useMockServer = false;

beforeAll(async () => {
  // Environment setup for tests - use Docker services
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_test';
  process.env.API_URL = process.env.API_URL || 'http://localhost:4000'; // Docker API
  useMockServer = false;
});

// Reset handlers after each test
afterAll(() => {
  if (useMockServer) {
    mockApiServer.close();
    console.log('🛑 Mock API server stopped');
  }
});

// Mock browser APIs for tests that need them
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Suppress console errors in tests (optional)
const originalError = console.error;
console.error = (...args: any[]) => {
  // Filter out known non-critical errors
  const msg = args[0]?.toString() || '';
  if (
    msg.includes('Not implemented: HTMLFormElement.prototype.submit') ||
    msg.includes('Not implemented: navigation') ||
    msg.includes('Could not parse CSS stylesheet')
  ) {
    return;
  }
  originalError(...args);
};
