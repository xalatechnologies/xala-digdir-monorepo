/**
 * Auth Service Context
 * ====================
 *
 * Provides dependency injection for auth services, making @xala/auth
 * completely domain-agnostic.
 *
 * This context must be set up by the consuming application to provide
 * its auth service implementation (e.g., @digilist/client-sdk authService).
 *
 * @example
 * ```tsx
 * // In your app's main.tsx
 * import { AuthServiceProvider } from '@xala/auth/providers';
 * import { authService, flowContextUtils } from '@digilist/client-sdk';
 *
 * <AuthServiceProvider
 *   authService={authService}
 *   flowContextUtils={flowContextUtils}
 * >
 *   <App />
 * </AuthServiceProvider>
 * ```
 */

import { createContext, useContext, useMemo } from 'react';
import type {
  AuthServiceContract,
  FlowContextUtilities,
  TokenUtilities,
  FlowResumeResult,
} from '../types/service-contract';

// =============================================================================
// Default Flow Context Utilities
// =============================================================================

const DEFAULT_FLOW_CONTEXT_KEY = 'auth_flow_context';

/**
 * Default flow context utilities for when none are provided.
 * These provide basic localStorage-based flow context management.
 */
export const defaultFlowContextUtils: FlowContextUtilities = {
  FLOW_CONTEXT_KEY: DEFAULT_FLOW_CONTEXT_KEY,
  hasStoredFlowContext: () => {
    try {
      return localStorage.getItem(DEFAULT_FLOW_CONTEXT_KEY) !== null;
    } catch {
      return false;
    }
  },
  clearFlowContextFromStorage: () => {
    try {
      localStorage.removeItem(DEFAULT_FLOW_CONTEXT_KEY);
    } catch {
      // Ignore storage errors
    }
  },
  getFlowContextTTL: (flowContext: FlowResumeResult['flowContext']) => {
    if (!flowContext?.timestamp) return undefined;
    const TTL_MS = 30 * 60 * 1000; // 30 minutes
    const elapsed = Date.now() - flowContext.timestamp;
    return Math.max(0, TTL_MS - elapsed);
  },
};

// =============================================================================
// Default Token Utilities
// =============================================================================

/**
 * Default token utilities for when none are provided.
 */
export const defaultTokenUtils: TokenUtilities = {
  setAuthToken: (_token: string) => {
    console.warn('[XALA/AUTH] No setAuthToken implementation provided');
  },
};

// =============================================================================
// Context Types
// =============================================================================

/**
 * Auth service context value containing all injected services
 */
export interface AuthServiceContextValue {
  /**
   * Auth service implementation (required)
   */
  authService: AuthServiceContract;

  /**
   * Flow context utilities (with defaults)
   */
  flowContextUtils: FlowContextUtilities;

  /**
   * Token utilities (with defaults)
   */
  tokenUtils: TokenUtilities;

  /**
   * Whether the service context is initialized
   */
  isInitialized: boolean;
}

/**
 * Stub auth service that throws helpful errors when no service is provided
 */
const stubAuthService: AuthServiceContract = {
  getSession: async () => {
    throw new Error(
      '@xala/auth: No auth service provided. Wrap your app with AuthServiceProvider ' +
      'and provide an authService implementation.'
    );
  },
  logout: async () => {
    throw new Error('@xala/auth: No auth service provided.');
  },
  initiateOAuth: async () => {
    throw new Error('@xala/auth: No auth service provided.');
  },
  handleOAuthCallback: async () => {
    throw new Error('@xala/auth: No auth service provided.');
  },
  refreshToken: async () => {
    throw new Error('@xala/auth: No auth service provided.');
  },
  resumeFlow: () => ({ hasContext: false }),
};

/**
 * Default context value (not initialized)
 */
const defaultContextValue: AuthServiceContextValue = {
  authService: stubAuthService,
  flowContextUtils: defaultFlowContextUtils,
  tokenUtils: defaultTokenUtils,
  isInitialized: false,
};

// =============================================================================
// Context
// =============================================================================

export const AuthServiceContext = createContext<AuthServiceContextValue>(defaultContextValue);

// =============================================================================
// Provider Props
// =============================================================================

export interface AuthServiceProviderProps {
  /**
   * Auth service implementation (required)
   * Must implement AuthServiceContract interface
   */
  authService: AuthServiceContract;

  /**
   * Flow context utilities (optional)
   * If not provided, uses default localStorage-based utilities
   */
  flowContextUtils?: Partial<FlowContextUtilities>;

  /**
   * Token utilities (optional)
   * If not provided, uses default no-op implementation
   */
  tokenUtils?: TokenUtilities;

  /**
   * Children components
   */
  children: React.ReactNode;
}

// =============================================================================
// Provider Component
// =============================================================================

/**
 * AuthServiceProvider provides dependency injection for auth services.
 *
 * This MUST wrap AuthProvider and be set up by the consuming application.
 *
 * @example
 * ```tsx
 * import { AuthServiceProvider, AuthProvider } from '@xala/auth/providers';
 * import { authService } from '@my-domain/sdk';
 *
 * function App() {
 *   return (
 *     <AuthServiceProvider authService={authService}>
 *       <AuthProvider config={{ appType: 'my-app' }}>
 *         <MyApp />
 *       </AuthProvider>
 *     </AuthServiceProvider>
 *   );
 * }
 * ```
 */
export function AuthServiceProvider({
  authService,
  flowContextUtils: customFlowContextUtils,
  tokenUtils: customTokenUtils,
  children,
}: AuthServiceProviderProps) {
  const value = useMemo<AuthServiceContextValue>(() => ({
    authService,
    flowContextUtils: {
      ...defaultFlowContextUtils,
      ...customFlowContextUtils,
    },
    tokenUtils: customTokenUtils ?? defaultTokenUtils,
    isInitialized: true,
  }), [authService, customFlowContextUtils, customTokenUtils]);

  return (
    <AuthServiceContext.Provider value={value}>
      {children}
    </AuthServiceContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the injected auth service
 *
 * @throws Error if used outside of AuthServiceProvider
 */
export function useAuthService(): AuthServiceContextValue {
  const context = useContext(AuthServiceContext);

  if (!context.isInitialized) {
    throw new Error(
      'useAuthService must be used within an AuthServiceProvider. ' +
      'Make sure to wrap your app with AuthServiceProvider and provide an authService.'
    );
  }

  return context;
}

/**
 * Hook to safely access the auth service (returns null if not initialized)
 * Useful for optional auth service usage
 */
export function useAuthServiceOptional(): AuthServiceContextValue | null {
  const context = useContext(AuthServiceContext);
  return context.isInitialized ? context : null;
}
