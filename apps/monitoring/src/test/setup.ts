/**
 * Test Setup and Configuration
 * Provides mock authentication and test utilities
 */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock authentication for tests
export const mockAuthUser = {
  id: 'test-user-monitoring-001',
  email: 'monitoring@digilist.no',
  name: 'Monitoring Admin',
  role: 'SAAS_ADMIN',
  tenantId: 'monitoring-tenant-001',
  permissions: ['monitoring:read', 'monitoring:write', 'monitoring:admin'],
};

// Mock @xala/auth module
vi.mock('@xala/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useOAuthCallback: () => null,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @digilist/client-sdk realtime
vi.mock('@digilist/client-sdk', async () => {
  const actual = await vi.importActual('@digilist/client-sdk');
  return {
    ...actual,
    RealtimeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
