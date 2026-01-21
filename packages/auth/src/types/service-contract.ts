/**
 * Auth Service Contract
 *
 * Generic interface for authentication services.
 * This allows @xala/auth to be platform-agnostic by accepting
 * an injected auth service that implements this contract.
 *
 * Domain-specific implementations (e.g., @digilist/client-sdk/services/authService)
 * must implement this interface.
 */

// NOTE: This file should NOT import from ./index to avoid circular dependencies

// =============================================================================
// Service Response Types
// =============================================================================

/**
 * Generic response wrapper for auth operations
 */
export interface AuthServiceResponse<T> {
  data: T;
  status?: number;
}

/**
 * Session data returned from getSession
 */
export interface SessionData {
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    grantedRoles?: string[];
    tenantId?: string;
  };
  expiresAt?: string;
}

/**
 * OAuth initiation response
 */
export interface OAuthInitResponse {
  redirectUrl: string;
}

/**
 * OAuth callback response
 */
export interface OAuthCallbackResponse {
  user: SessionData['user'];
  expiresAt?: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  expiresAt?: string;
}

/**
 * Flow context resume result
 */
export interface FlowResumeResult {
  hasContext: boolean;
  flowContext?: {
    flow: string;
    returnPath: string;
    metadata?: Record<string, unknown>;
    timestamp: number;
  };
  wasExpired?: boolean;
  wasInvalid?: boolean;
}

// =============================================================================
// Service Contract Interface
// =============================================================================

/**
 * Auth service contract that domain-specific implementations must fulfill.
 *
 * @example
 * ```tsx
 * // In @digilist/client-sdk
 * import type { AuthServiceContract } from '@xala/auth';
 *
 * export const authService: AuthServiceContract = {
 *   getSession: async () => { ... },
 *   logout: async () => { ... },
 *   initiateOAuth: async (provider, callbackUrl) => { ... },
 *   handleOAuthCallback: async (code, state) => { ... },
 *   refreshToken: async () => { ... },
 *   resumeFlow: (clearAfterLoad) => { ... },
 * };
 * ```
 */
export interface AuthServiceContract {
  /**
   * Get current session from HTTP-only cookie
   * @throws Error if session is invalid or expired
   */
  getSession(): Promise<AuthServiceResponse<SessionData>>;

  /**
   * Invalidate current session
   */
  logout(): Promise<void>;

  /**
   * Initiate OAuth flow with provider
   * @param provider - OAuth provider ID
   * @param callbackUrl - URL to redirect after OAuth
   * @returns Redirect URL to OAuth provider
   */
  initiateOAuth(
    provider: string,
    callbackUrl: string
  ): Promise<AuthServiceResponse<OAuthInitResponse>>;

  /**
   * Handle OAuth callback with authorization code
   * @param code - Authorization code from OAuth provider
   * @param state - State parameter for CSRF protection
   * @returns Session data with user info
   */
  handleOAuthCallback(
    code: string,
    state?: string
  ): Promise<AuthServiceResponse<OAuthCallbackResponse>>;

  /**
   * Refresh the current access token
   * @returns New expiration time
   */
  refreshToken(): Promise<AuthServiceResponse<TokenRefreshResponse>>;

  /**
   * Resume a flow context after authentication
   * @param clearAfterLoad - Whether to clear context after loading
   * @returns Flow context if exists
   */
  resumeFlow(clearAfterLoad?: boolean): FlowResumeResult;
}

// =============================================================================
// Flow Context Utilities Contract
// =============================================================================

/**
 * Flow context utilities that can be optionally provided.
 * These handle preservation of user intent across authentication flows.
 */
export interface FlowContextUtilities {
  /**
   * Storage key for flow context
   */
  FLOW_CONTEXT_KEY: string;

  /**
   * Check if there is a stored flow context
   */
  hasStoredFlowContext(): boolean;

  /**
   * Clear flow context from storage
   */
  clearFlowContextFromStorage(): void;

  /**
   * Get TTL for a flow context
   */
  getFlowContextTTL(flowContext: FlowResumeResult['flowContext']): number | undefined;
}

// =============================================================================
// Token Utilities Contract
// =============================================================================

/**
 * Token utilities for OAuth callback handling
 */
export interface TokenUtilities {
  /**
   * Set auth token in SDK client
   */
  setAuthToken(token: string): void;
}

// =============================================================================
// Injected Auth Configuration
// =============================================================================

/**
 * Auth service configuration injected into AuthProvider.
 * This allows the auth package to be domain-agnostic.
 */
export interface InjectedAuthService {
  /**
   * Auth service implementation
   */
  authService: AuthServiceContract;

  /**
   * Flow context utilities (optional)
   */
  flowContextUtils?: FlowContextUtilities;

  /**
   * Token utilities (optional, for OAuth callback)
   */
  tokenUtils?: TokenUtilities;
}
