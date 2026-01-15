/**
 * useAuth Hook
 * Provides authentication functionality with OAuth login
 * Supports session-safe return-to-flow authentication with flow context preservation
 */

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  authService,
  FLOW_CONTEXT_KEY,
  hasStoredFlowContext as checkStoredFlowContext,
  loadFlowContextFromStorage,
  clearFlowContextFromStorage,
  getFlowContextTTL,
  validateReturnToUrl,
} from '@digilist/client-sdk';
import type { FlowContext, FlowBookingMode, FlowSelectedSlot, FlowRecurringRules } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Options for login with flow context
 */
export interface LoginWithFlowContextOptions {
  /** OAuth provider to use */
  provider: 'idporten' | 'microsoft' | 'vipps';
  /** URL to return to after authentication */
  returnTo?: string;
  /** Tenant ID (required for flow context) */
  tenantId: string;
  /** Listing ID for booking flow */
  listingId?: string;
  /** Current booking mode */
  bookingMode?: FlowBookingMode;
  /** Selected dates (ISO date strings) */
  selectedDates?: string[];
  /** Selected time slots */
  selectedSlots?: FlowSelectedSlot[];
  /** Recurring booking rules */
  recurringRules?: FlowRecurringRules;
  /** Partial form data to preserve */
  formData?: Record<string, unknown>;
}

/**
 * Result from restoring flow context
 */
export interface RestoreFlowContextResult {
  /** Whether there was a flow context to restore */
  hasContext: boolean;
  /** The restored flow context */
  flowContext?: FlowContext;
  /** Time remaining before context expires (ms) */
  ttl?: number;
  /** Whether the context was expired */
  wasExpired?: boolean;
  /** Whether the context was invalid */
  wasInvalid?: boolean;
}

/**
 * Hook return type
 */
export interface UseAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;
  /** Current user or null */
  user: User | null;
  /** Login with OAuth provider (simple, uses current path as returnTo) */
  login: (provider: 'idporten' | 'microsoft' | 'vipps', returnTo?: string) => void;
  /** Login with full flow context preservation */
  loginWithFlowContext: (options: LoginWithFlowContextOptions) => void;
  /** Logout current user */
  logout: () => void;
  /** Handle OAuth callback with user data */
  handleAuthCallback: (userData: User) => void;
  /** Whether there is a stored flow context */
  hasStoredContext: boolean;
  /** The currently stored flow context (null if none) */
  storedContext: FlowContext | null;
  /** Restore flow context after authentication */
  restoreFlowContext: (clearAfterLoad?: boolean) => RestoreFlowContextResult;
  /** Clear any stored flow context */
  clearFlowContext: () => void;
  /** Validate a returnTo URL */
  validateReturnTo: (url: string, allowedOrigins?: string[]) => boolean;
  /** Get time remaining before stored context expires (ms) */
  getContextTTL: () => number;
}

// =============================================================================
// Storage Event Subscription (for cross-tab sync)
// =============================================================================

/** Subscribers for storage changes */
const subscribers = new Set<() => void>();

/** Subscribe to storage changes */
function subscribe(callback: () => void): () => void {
  subscribers.add(callback);

  // Listen for storage events from other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === FLOW_CONTEXT_KEY || event.key === null) {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}

/** Get current snapshot of whether context exists */
function getSnapshot(): boolean {
  return checkStoredFlowContext();
}

/** Server snapshot (always false since no sessionStorage) */
function getServerSnapshot(): boolean {
  return false;
}

/** Notify all subscribers of changes */
function notifySubscribers(): void {
  subscribers.forEach((callback) => callback());
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * useAuth Hook
 * Provides authentication functionality with OAuth login and flow context preservation.
 *
 * @example
 * ```typescript
 * function BookingPage({ listingId }) {
 *   const { isAuthenticated, loginWithFlowContext } = useAuth();
 *
 *   const handleReserve = () => {
 *     if (!isAuthenticated) {
 *       loginWithFlowContext({
 *         provider: 'idporten',
 *         tenantId: 'kommune-123',
 *         listingId,
 *         bookingMode: 'SLOTS',
 *         selectedSlots: [{ date: '2024-01-15', startTime: '10:00', endTime: '11:00' }],
 *       });
 *       return;
 *     }
 *     // Continue with booking...
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * function LoginCallback() {
 *   const { restoreFlowContext, handleAuthCallback } = useAuth();
 *   const navigate = useNavigate();
 *
 *   useEffect(() => {
 *     // Handle OAuth callback response...
 *     handleAuthCallback(userData);
 *
 *     // Restore flow context and navigate
 *     const result = restoreFlowContext();
 *     if (result.hasContext && result.flowContext) {
 *       navigate(result.flowContext.returnTo, {
 *         state: { flowContext: result.flowContext }
 *       });
 *     } else {
 *       navigate('/');
 *     }
 *   }, []);
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to storage changes for cross-tab synchronization
  const hasStoredContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('web_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('web_user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Get the currently stored context without removing it
   */
  const storedContext = useMemo(() => {
    if (!hasStoredContext) {
      return null;
    }
    return loadFlowContextFromStorage();
  }, [hasStoredContext]);

  /**
   * Simple login - redirects to OAuth provider with optional returnTo URL
   */
  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps', returnTo?: string) => {
    // OAuth flow - redirect to API
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    // Use current path as return URL so user comes back to the same page
    const currentPath = returnTo || window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(window.location.origin + currentPath);
    window.location.href = `${baseUrl}/auth/${provider}?returnUrl=${returnUrl}`;
  }, []);

  /**
   * Login with flow context preservation
   * Saves complete booking state before OAuth redirect
   */
  const loginWithFlowContext = useCallback((options: LoginWithFlowContextOptions) => {
    // Use authService.requireAuth to save flow context
    const result = authService.requireAuth({
      returnTo: options.returnTo || window.location.pathname + window.location.search,
      tenantId: options.tenantId,
      listingId: options.listingId,
      bookingMode: options.bookingMode,
      selectedDates: options.selectedDates,
      selectedSlots: options.selectedSlots,
      recurringRules: options.recurringRules,
      formData: options.formData,
    });

    // Notify subscribers about the change
    notifySubscribers();

    // Redirect to OAuth provider
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    const returnUrl = encodeURIComponent(window.location.origin + result.flowContext.returnTo);
    window.location.href = `${baseUrl}/auth/${options.provider}?returnUrl=${returnUrl}`;
  }, []);

  /**
   * Logout user and clear flow context
   */
  const logout = useCallback(async () => {
    console.log('========================================');
    console.log('[WEB AUTH] Logging out...');
    console.log('========================================');

    // Clear localStorage
    localStorage.removeItem('web_user');
    setUser(null);

    // Clear any stored flow context
    clearFlowContextFromStorage();
    notifySubscribers();

    try {
      // Call API logout to clear session cookie
      await authService.logout();
      console.log('[WEB AUTH] API logout successful');
    } catch (error) {
      console.error('[WEB AUTH] API logout failed:', error);
      // Continue with logout even if API call fails
    }

    console.log('[WEB AUTH] Redirecting to home page...');
    console.log('========================================');

    // Redirect to home page
    window.location.href = window.location.origin + '/';
  }, []);

  /**
   * Handle OAuth callback - store user from API response
   */
  const handleAuthCallback = useCallback((userData: User) => {
    localStorage.setItem('web_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  /**
   * Restore flow context after authentication
   * Uses authService.resumeFlow internally
   */
  const restoreFlowContext = useCallback((clearAfterLoad: boolean = true): RestoreFlowContextResult => {
    const result = authService.resumeFlow(clearAfterLoad);

    // If we cleared context, notify subscribers
    if (clearAfterLoad && result.hasContext) {
      notifySubscribers();
    }

    // Calculate TTL if we have context
    const ttl = result.flowContext
      ? getFlowContextTTL(result.flowContext)
      : undefined;

    return {
      hasContext: result.hasContext,
      flowContext: result.flowContext,
      ttl,
      wasExpired: result.wasExpired,
      wasInvalid: result.wasInvalid,
    };
  }, []);

  /**
   * Clear any stored flow context
   * Call this after flow completion or on explicit logout
   */
  const clearFlowContext = useCallback((): void => {
    clearFlowContextFromStorage();
    notifySubscribers();
  }, []);

  /**
   * Validate a returnTo URL for security
   * Ensures same-origin and known route patterns only
   */
  const validateReturnTo = useCallback((url: string, allowedOrigins?: string[]): boolean => {
    return validateReturnToUrl(url, allowedOrigins);
  }, []);

  /**
   * Get time remaining before stored context expires
   * Returns 0 if no context or already expired
   */
  const getContextTTL = useCallback((): number => {
    const context = loadFlowContextFromStorage();
    if (!context) {
      return 0;
    }
    return getFlowContextTTL(context);
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    loginWithFlowContext,
    logout,
    handleAuthCallback,
    hasStoredContext,
    storedContext,
    restoreFlowContext,
    clearFlowContext,
    validateReturnTo,
    getContextTTL,
  };
}
