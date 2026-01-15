/**
 * Auth Service
 * Single Responsibility: Handle all authentication operations
 */

import { BaseService } from './base.service';
import type {
  AuthSession,
  LoginCredentials,
  EmailLoginCredentials,
  OAuthProvider,
  FlowContext,
  ReturnToConfig,
} from '../types/auth';
import type { SingleResponse } from '../types/enums';
import {
  createFlowContext,
  saveFlowContextToStorage,
  loadFlowContextFromStorage,
  clearFlowContextFromStorage,
  hasStoredFlowContext,
  isFlowContextExpired,
  validateReturnToUrl,
  sanitizeReturnToUrl,
  createReturnToConfig,
  validateReturnToConfig,
} from '../utils/flow-context';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for requireAuth method
 */
export interface RequireAuthOptions {
  /** URL to return to after authentication */
  returnTo?: string;
  /** Full flow context to preserve (overrides other options) */
  flowContext?: FlowContext;
  /** Tenant ID (required if flowContext not provided) */
  tenantId?: string;
  /** Listing ID for booking flow */
  listingId?: string;
  /** Current booking mode */
  bookingMode?: FlowContext['bookingMode'];
  /** Selected dates (ISO date strings) */
  selectedDates?: string[];
  /** Selected time slots */
  selectedSlots?: FlowContext['selectedSlots'];
  /** Recurring booking rules */
  recurringRules?: FlowContext['recurringRules'];
  /** Partial form data to preserve */
  formData?: Record<string, unknown>;
}

/**
 * Result from requireAuth
 */
export interface RequireAuthResult {
  /** Whether auth is required (context was saved) */
  success: boolean;
  /** Login URL with returnTo encoded */
  loginUrl: string;
  /** The saved flow context */
  flowContext: FlowContext;
}

/**
 * Options for initiateAuthWithContext
 */
export interface InitiateAuthWithContextOptions extends RequireAuthOptions {
  /** OAuth provider to use */
  provider: 'idporten' | 'vipps' | 'microsoft' | 'bankid' | string;
  /** Custom callback URL (optional) */
  callbackUrl?: string;
}

/**
 * Result from resumeFlow
 */
export interface ResumeFlowResult {
  /** Whether there was a flow context to resume */
  hasContext: boolean;
  /** The restored flow context */
  flowContext?: FlowContext;
  /** ReturnTo configuration with validation */
  returnToConfig?: ReturnToConfig;
  /** Whether the context was expired */
  wasExpired?: boolean;
  /** Whether the context was invalid */
  wasInvalid?: boolean;
}

export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
  }

  /**
   * Login with email (mock/demo)
   */
  async login(credentials: LoginCredentials): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/login'), credentials);
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(credentials: EmailLoginCredentials): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/email'), credentials);
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SingleResponse<AuthSession>> {
    return this.client.get(this.buildPath('/session'));
  }

  /**
   * Logout current user
   */
  async logout(): Promise<SingleResponse<{ success: boolean }>> {
    return this.client.post(this.buildPath('/logout'));
  }

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/refresh'));
  }

  /**
   * Get available OAuth providers
   */
  async getProviders(): Promise<SingleResponse<OAuthProvider[]>> {
    return this.client.get(this.buildPath('/providers'));
  }

  /**
   * Get CSRF token
   */
  async getCsrfToken(): Promise<SingleResponse<{ token: string; expiresAt: string }>> {
    return this.client.get(this.buildPath('/csrf'));
  }

  /**
   * Initiate OAuth login
   */
  async initiateOAuth(
    provider: string,
    callbackUrl?: string
  ): Promise<SingleResponse<{ redirectUrl: string }>> {
    return this.client.post(this.buildPath('/oauth/initiate'), {
      provider,
      callbackUrl,
    });
  }

  // ===========================================================================
  // Flow Context Methods (Session-Safe Return-to-Flow)
  // ===========================================================================

  /**
   * Prepare for authentication by saving flow context to sessionStorage.
   * Call this before redirecting unauthenticated users to login.
   *
   * @param options - Configuration for the auth requirement
   * @returns RequireAuthResult with login URL and saved context
   * @throws Error if tenantId is not provided and no flowContext given
   *
   * @example
   * ```typescript
   * // Basic usage with current path
   * const result = authService.requireAuth({
   *   returnTo: window.location.pathname,
   *   tenantId: 'kommune-123'
   * });
   * window.location.href = result.loginUrl;
   *
   * // With booking state
   * const result = authService.requireAuth({
   *   returnTo: `/listings/${listingId}`,
   *   tenantId: 'kommune-123',
   *   listingId,
   *   bookingMode: 'SLOTS',
   *   selectedSlots: [{ date: '2024-01-15', startTime: '10:00', endTime: '11:00' }]
   * });
   * ```
   */
  requireAuth(options: RequireAuthOptions): RequireAuthResult {
    // Use provided flowContext or create a new one
    let flowContext: FlowContext;

    if (options.flowContext) {
      flowContext = options.flowContext;
    } else {
      // Require tenantId if not using existing flowContext
      if (!options.tenantId) {
        throw new Error(
          'tenantId is required when flowContext is not provided'
        );
      }

      // Determine returnTo URL
      const returnTo =
        options.returnTo ||
        (typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/');

      // Create new flow context with booking state
      flowContext = createFlowContext(returnTo, options.tenantId, {
        listingId: options.listingId,
        bookingMode: options.bookingMode,
        selectedDates: options.selectedDates,
        selectedSlots: options.selectedSlots,
        recurringRules: options.recurringRules,
        formData: options.formData,
      });
    }

    // Save to sessionStorage
    const success = saveFlowContextToStorage(flowContext);

    // Build login URL with returnTo parameter
    const loginUrl = this.buildLoginUrl(flowContext.returnTo);

    return {
      success,
      loginUrl,
      flowContext,
    };
  }

  /**
   * Initiate OAuth authentication with preserved flow context.
   * Saves context to sessionStorage before redirecting to OAuth provider.
   *
   * @param options - Configuration including provider and flow context
   * @returns Promise resolving to redirect URL from the API
   *
   * @example
   * ```typescript
   * const { redirectUrl } = await authService.initiateAuthWithContext({
   *   provider: 'vipps',
   *   returnTo: `/listings/${listingId}`,
   *   tenantId: 'kommune-123',
   *   listingId,
   *   selectedSlots: slots
   * });
   * window.location.href = redirectUrl;
   * ```
   */
  async initiateAuthWithContext(
    options: InitiateAuthWithContextOptions
  ): Promise<SingleResponse<{ redirectUrl: string }>> {
    // First save the flow context using requireAuth
    const { flowContext } = this.requireAuth(options);

    // Build callback URL with encoded returnTo
    // The API will redirect here after OAuth completion
    const returnToEncoded = encodeURIComponent(flowContext.returnTo);
    const callbackUrl =
      options.callbackUrl ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?returnTo=${returnToEncoded}`
        : undefined);

    // Initiate OAuth flow via API
    return this.initiateOAuth(options.provider, callbackUrl);
  }

  /**
   * Resume a flow after authentication by loading stored context.
   * Call this on login page after successful authentication.
   *
   * @param clearAfterLoad - Whether to clear stored context after loading (default: true)
   * @returns ResumeFlowResult with context and validation info
   *
   * @example
   * ```typescript
   * // On login success
   * const result = authService.resumeFlow();
   * if (result.hasContext && result.flowContext) {
   *   // Navigate to returnTo with state
   *   navigate(result.flowContext.returnTo, {
   *     state: { flowContext: result.flowContext }
   *   });
   * } else {
   *   // Default navigation
   *   navigate('/');
   * }
   * ```
   */
  resumeFlow(clearAfterLoad: boolean = true): ResumeFlowResult {
    // Check if we have stored context
    if (!hasStoredFlowContext()) {
      return {
        hasContext: false,
      };
    }

    // Load from storage
    const flowContext = loadFlowContextFromStorage();

    // If loading failed, context was invalid
    if (!flowContext) {
      return {
        hasContext: false,
        wasInvalid: true,
      };
    }

    // Check expiration (loadFlowContextFromStorage already checks this, but be explicit)
    if (isFlowContextExpired(flowContext)) {
      if (clearAfterLoad) {
        clearFlowContextFromStorage();
      }
      return {
        hasContext: false,
        wasExpired: true,
      };
    }

    // Clear context after successful load if requested
    if (clearAfterLoad) {
      clearFlowContextFromStorage();
    }

    // Build return config
    const returnToConfig: ReturnToConfig = {
      url: flowContext.returnTo,
      flowContext,
      expiresAt: flowContext.timestamp + 30 * 60 * 1000, // 30 minutes
    };

    return {
      hasContext: true,
      flowContext,
      returnToConfig,
    };
  }

  /**
   * Check if there is a stored flow context without loading it
   * @returns True if valid flow context exists in storage
   */
  hasStoredFlowContext(): boolean {
    return hasStoredFlowContext();
  }

  /**
   * Clear any stored flow context
   * Call this after flow is complete or on explicit logout
   */
  clearFlowContext(): void {
    clearFlowContextFromStorage();
  }

  /**
   * Validate a returnTo URL for security
   * @param url - URL to validate
   * @param allowedOrigins - Optional list of allowed origins
   * @returns True if URL is safe to redirect to
   */
  validateReturnTo(url: string, allowedOrigins?: string[]): boolean {
    return validateReturnToUrl(url, allowedOrigins);
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Build login URL with returnTo parameter
   * @param returnTo - URL to return to after login
   * @returns Full login URL with encoded returnTo
   */
  private buildLoginUrl(returnTo: string): string {
    const sanitizedReturnTo = sanitizeReturnToUrl(returnTo);
    const encodedReturnTo = encodeURIComponent(sanitizedReturnTo);

    // Default login path, can be configured
    const loginPath = '/login';

    return `${loginPath}?returnTo=${encodedReturnTo}`;
  }
}

// Singleton instance
export const authService = new AuthService();
