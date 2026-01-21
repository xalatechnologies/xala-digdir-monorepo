/**
 * Flow Context Hook
 * Single Responsibility: React hooks for managing authentication flow state
 * Preserves user navigation and booking state across authentication interruptions
 */

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { authService } from '@/services/auth.service';
import type { RequireAuthResult, ResumeFlowResult } from '@/services/auth.service';
import type { FlowContext } from '@/types/auth';
import {
  FLOW_CONTEXT_KEY,
  hasStoredFlowContext as checkStoredFlowContext,
  loadFlowContextFromStorage,
  clearFlowContextFromStorage,
  getFlowContextTTL,
  validateReturnToUrl,
} from '@/utils/flow-context';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for saving flow context
 */
export interface SaveFlowContextOptions {
  /** URL to return to after authentication */
  returnTo?: string;
  /** Tenant ID for context */
  tenantId?: string;
  /** Rental object ID (formerly listingId) */
  listingId?: string;
  /** Booking mode */
  bookingMode?: string;
  /** Selected dates */
  selectedDates?: string[];
  /** Selected time slots */
  selectedSlots?: Array<{ startTime: string; endTime: string; date: string; [key: string]: unknown }>;
  /** Recurring booking rules */
  recurringRules?: Record<string, unknown>;
  /** Additional form data */
  formData?: Record<string, unknown>;
  /** Custom storage key (optional) */
  storageKey?: string;
}

/**
 * Result from saveFlowContext
 */
export interface SaveFlowContextResult extends RequireAuthResult {
  /** Storage key where context was saved */
  storageKey: string;
}

/**
 * Options for restoring flow context
 */
export interface RestoreFlowContextOptions {
  /** Whether to clear context after loading (default: true) */
  clearAfterLoad?: boolean;
  /** Custom storage key (optional) */
  storageKey?: string;
}

/**
 * Result from restoreFlowContext
 */
export interface RestoreFlowContextResult extends ResumeFlowResult {
  /** Time remaining before context expires (ms) */
  ttl?: number;
}

/**
 * Hook return type for useFlowContext
 */
export interface UseFlowContextReturn {
  /** Whether there is a stored flow context */
  hasStoredContext: boolean;
  /** The currently stored context (null if none) */
  storedContext: FlowContext | null;
  /** Save flow context before authentication redirect */
  saveFlowContext: (options: SaveFlowContextOptions) => Promise<SaveFlowContextResult>;
  /** Restore flow context after authentication */
  restoreFlowContext: (options?: RestoreFlowContextOptions) => Promise<RestoreFlowContextResult>;
  /** Clear any stored flow context */
  clearFlowContext: (storageKey?: string) => void;
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
 * React hook for managing authentication flow context.
 * Provides methods to save, restore, and clear flow state across auth interruptions.
 *
 * @example
 * ```typescript
 * function BookingConfirmation({ listingId, selectedSlots }) {
 *   const { saveFlowContext, hasStoredContext } = useFlowContext();
 *   const navigate = useNavigate();
 *
 *   const handleLoginRequired = () => {
 *     const result = saveFlowContext({
 *       returnTo: `/listings/${listingId}`,
 *       tenantId: 'kommune-123',
 *       listingId,
 *       bookingMode: 'SLOTS',
 *       selectedSlots,
 *     });
 *
 *     // Redirect to login with returnTo
 *     navigate(result.loginUrl);
 *   };
 *
 *   return (
 *     <Button onClick={handleLoginRequired}>
 *       Login to Complete Booking
 *     </Button>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * function LoginPage() {
 *   const { restoreFlowContext, hasStoredContext } = useFlowContext();
 *   const navigate = useNavigate();
 *   const { isAuthenticated } = useSession();
 *
 *   useEffect(() => {
 *     if (isAuthenticated) {
 *       const result = restoreFlowContext();
 *       if (result.hasContext && result.flowContext) {
 *         // Navigate to saved destination with booking state
 *         navigate(result.flowContext.returnTo, {
 *           state: { flowContext: result.flowContext }
 *         });
 *       } else {
 *         // No saved context, go to default
 *         navigate('/');
 *       }
 *     }
 *   }, [isAuthenticated, navigate]);
 * }
 * ```
 */
export function useFlowContext(): UseFlowContextReturn {
  // Subscribe to storage changes for cross-tab synchronization
  const hasStoredContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

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
   * Save flow context before redirecting to authentication.
   * Uses authService.requireAuth internally.
   */
  const saveFlowContext = useCallback(async (options: SaveFlowContextOptions): Promise<SaveFlowContextResult> => {
    const storageKey = options.storageKey ?? FLOW_CONTEXT_KEY;

    // Use authService.requireAuth which handles all the logic
    const result = await authService.requireAuth({
      returnTo: options.returnTo,
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

    return {
      ...result,
      storageKey,
    };
  }, []);

  /**
   * Restore flow context after authentication completes.
   * Uses authService.resumeFlow internally.
   */
  const restoreFlowContext = useCallback(async (
    options: RestoreFlowContextOptions = {}
  ): Promise<RestoreFlowContextResult> => {
    const { clearAfterLoad = true } = options;

    // Use authService.resumeFlow which handles all the logic
    const result = await authService.resumeFlow();

    // If we cleared context, notify subscribers
    if (clearAfterLoad && result.hasContext) {
      notifySubscribers();
    }

    // Calculate TTL if we have context
    const ttl = result.flowContext
      ? getFlowContextTTL(result.flowContext as unknown as FlowContext)
      : undefined;

    return {
      ...result,
      ttl,
    };
  }, []);

  /**
   * Clear any stored flow context.
   * Call this after flow completion or on logout.
   */
  const clearFlowContext = useCallback((storageKey?: string): void => {
    clearFlowContextFromStorage(storageKey);
    notifySubscribers();
  }, []);

  /**
   * Validate a returnTo URL for security.
   * Ensures same-origin and known route patterns only.
   */
  const validateReturnTo = useCallback((
    url: string,
    allowedOrigins?: string[]
  ): boolean => {
    return validateReturnToUrl(url, allowedOrigins);
  }, []);

  /**
   * Get time remaining before stored context expires.
   * Returns 0 if no context or already expired.
   */
  const getContextTTL = useCallback((): number => {
    const context = loadFlowContextFromStorage();
    if (!context) {
      return 0;
    }
    return getFlowContextTTL(context);
  }, []);

  return {
    hasStoredContext,
    storedContext,
    saveFlowContext,
    restoreFlowContext,
    clearFlowContext,
    validateReturnTo,
    getContextTTL,
  };
}

/**
 * Hook to check if there is a pending flow context to restore.
 * Lightweight check without loading the full context.
 *
 * @example
 * ```typescript
 * function LoginButton() {
 *   const hasPendingFlow = useHasFlowContext();
 *
 *   if (hasPendingFlow) {
 *     return <Badge>Continue booking after login</Badge>;
 *   }
 *   return null;
 * }
 * ```
 */
export function useHasFlowContext(): boolean {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}

/**
 * Hook to get the returnTo URL from stored context.
 * Returns undefined if no valid context exists.
 *
 * @example
 * ```typescript
 * function LoginForm() {
 *   const returnTo = useFlowContextReturnTo();
 *
 *   const handleSuccess = () => {
 *     if (returnTo) {
 *       navigate(returnTo);
 *     } else {
 *       navigate('/');
 *     }
 *   };
 * }
 * ```
 */
export function useFlowContextReturnTo(): string | undefined {
  const hasContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    if (!hasContext) {
      return undefined;
    }
    const context = loadFlowContextFromStorage();
    return context?.returnTo;
  }, [hasContext]);
}

/**
 * Hook to get flow context information for a specific rental object.
 * Returns the context only if it matches the given rentalObjectId.
 *
 * @param rentalObjectId - The rental object ID to match
 * @returns FlowContext if it matches, undefined otherwise
 *
 * @example
 * ```typescript
 * function RentalObjectDetail({ rentalObjectId }) {
 *   const savedContext = useRentalObjectFlowContext(rentalObjectId);
 *
 *   // If we have saved state for this rental object, restore it
 *   useEffect(() => {
 *     if (savedContext?.selectedSlots) {
 *       setSelectedSlots(savedContext.selectedSlots);
 *     }
 *   }, [savedContext]);
 * }
 * ```
 */
export function useRentalObjectFlowContext(rentalObjectId: string): FlowContext | undefined {
  const hasContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    if (!hasContext) {
      return undefined;
    }
    const context = loadFlowContextFromStorage();
    // Only return if rentalObjectId matches the provided parameter
    if (context?.rentalObjectId === rentalObjectId) {
      return context;
    }
    return undefined;
  }, [hasContext, rentalObjectId]);
}
