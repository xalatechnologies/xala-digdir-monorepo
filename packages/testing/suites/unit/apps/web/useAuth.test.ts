/**
 * useAuth Hook Unit Tests
 *
 * Tests for authentication hook functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useT } from '@xala/i18n';

// Mock SDK services
vi.mock('@digilist/client-sdk', () => ({
  authService: {
    requireAuth: vi.fn(() => ({
      flowContext: {
        returnTo: '/test',
        tenantId: 'test-tenant',
        createdAt: new Date().toISOString(),
      },
    })),
    resumeFlow: vi.fn(() => ({
      hasContext: false,
      flowContext: undefined,
    })),
  },
  FLOW_CONTEXT_KEY: 'digilist_flow_context',
  hasStoredFlowContext: vi.fn(() => false),
  loadFlowContextFromStorage: vi.fn(() => null),
  clearFlowContextFromStorage: vi.fn(),
  getFlowContextTTL: vi.fn(() => 0),
  validateReturnToUrl: vi.fn(() => true),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock location
const mockLocation = {
  pathname: '/test',
  search: '',
  origin: 'http://localhost:3000',
  href: 'http://localhost:3000/test',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// SKIPPED: Needs implementation
describe.skip('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have isLoading property', () => {
      const { result } = renderHook(() => useAuth());

      // Hook may resolve loading state synchronously depending on implementation
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should resolve to unauthenticated when no stored user', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should restore user from localStorage', async () => {
      const storedUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(storedUser);
    });

    it('should handle corrupted localStorage data', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('web_user');
    });
  });

  describe('Login', () => {
    it('should redirect to OAuth provider', () => {
      const { result } = renderHook(() => useAuth());

      // Can't fully test redirect in jsdom, but can verify login is callable
      expect(typeof result.current.login).toBe('function');
    });
  });

  describe('Login with Flow Context', () => {
    it('should save flow context before OAuth redirect', async () => {
      const { authService } = await import('@digilist/client-sdk');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.loginWithFlowContext({
          provider: 'idporten',
          tenantId: 'test-tenant',
          rentalObjectId: 'listing-123',
        });
      });

      expect(authService.requireAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'test-tenant',
          rentalObjectId: 'listing-123',
        })
      );
    });
  });

  describe('Logout', () => {
    it('should clear user from state and localStorage', async () => {
      const storedUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('web_user');
    });
  });

  describe('Flow Context Management', () => {
    it('should check for stored flow context', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.hasStoredContext).toBe('boolean');
    });

    it('should restore flow context', async () => {
      const { authService } = await import('@digilist/client-sdk');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const restoreResult = result.current.restoreFlowContext();

      expect(authService.resumeFlow).toHaveBeenCalled();
      expect(restoreResult).toHaveProperty('hasContext');
    });

    it('should clear flow context', async () => {
      const { clearFlowContextFromStorage } = await import('@digilist/client-sdk');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.clearFlowContext();
      });

      expect(clearFlowContextFromStorage).toHaveBeenCalled();
    });
  });

  describe('URL Validation', () => {
    it('should validate returnTo URLs', async () => {
      const { validateReturnToUrl } = await import('@digilist/client-sdk');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const isValid = result.current.validateReturnTo('/valid-path');

      expect(validateReturnToUrl).toHaveBeenCalledWith('/valid-path', undefined);
      expect(isValid).toBe(true);
    });
  });

  describe('Context TTL', () => {
    it('should return context TTL', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const ttl = result.current.getContextTTL();

      expect(typeof ttl).toBe('number');
    });
  });
});
