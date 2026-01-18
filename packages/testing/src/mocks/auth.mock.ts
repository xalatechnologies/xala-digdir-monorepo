/**
 * Auth mock for tests
 */

import { vi } from 'vitest';
import { mockUsers, mockTenant } from '../fixtures/index.js';

export interface MockAuthState {
  isAuthenticated: boolean;
  user: typeof mockUsers.admin | null;
  tenantId: string | null;
}

let authState: MockAuthState = {
  isAuthenticated: false,
  user: null,
  tenantId: null,
};

export const mockAuthService = {
  login: vi.fn(async (role: keyof typeof mockUsers = 'citizen') => {
    authState = {
      isAuthenticated: true,
      user: mockUsers[role],
      tenantId: mockTenant.id,
    };
    return { success: true, user: authState.user };
  }),
  
  logout: vi.fn(async () => {
    authState = {
      isAuthenticated: false,
      user: null,
      tenantId: null,
    };
    return { success: true };
  }),
  
  getSession: vi.fn(() => authState),
  
  isAuthenticated: vi.fn(() => authState.isAuthenticated),
  
  getUser: vi.fn(() => authState.user),
  
  hasPermission: vi.fn((permission: string) => {
    if (!authState.user) return false;
    // Admin has all permissions
    if (authState.user.role === 'ADMIN') return true;
    // Add more permission logic as needed
    return false;
  }),
};

export function resetAuthMock() {
  authState = {
    isAuthenticated: false,
    user: null,
    tenantId: null,
  };
  vi.clearAllMocks();
}

export function setAuthenticatedUser(role: keyof typeof mockUsers) {
  authState = {
    isAuthenticated: true,
    user: mockUsers[role],
    tenantId: mockTenant.id,
  };
}
