/**
 * Auth Service
 * Single Responsibility: Handle all authentication operations
 */

import { BaseService } from './base.service';
import type { 
  AuthSession, 
  LoginCredentials, 
  EmailLoginCredentials,
  OAuthProvider 
} from '../types/auth';
import type { SingleResponse } from '../types/enums';

export interface RequireAuthOptions {
  returnUrl?: string;
  returnTo?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
  listingId?: string;
  bookingMode?: string;
  selectedDates?: any[];
  selectedSlots?: any[];
  recurringRules?: any;
  formData?: Record<string, unknown>;
}

export interface RequireAuthResult {
  authenticated: boolean;
  redirectUrl?: string;
  session?: AuthSession;
}

export interface ResumeFlowResult {
  success: boolean;
  returnUrl?: string;
  session?: AuthSession;
  hasContext?: boolean;
  flowContext?: any;
}

export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
  }

  /**
   * Login with email (mock/demo)
   * Use this for development and testing purposes
   *
   * @param credentials - Login credentials containing user identifier
   * @returns Promise with authenticated session data
   *
   * @example
   * ```typescript
   * const session = await authService.login({
   *   email: 'user@example.com'
   * });
   * console.log('Session token:', session.data.token);
   * ```
   */
  async login(credentials: LoginCredentials): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/login'), credentials);
  }

  /**
   * Login with email and password
   * Primary authentication method for standard email/password credentials
   *
   * @param credentials - Email and password credentials
   * @returns Promise with authenticated session including user data and token
   *
   * @example
   * ```typescript
   * const session = await authService.loginWithEmail({
   *   email: 'user@kommune.no',
   *   password: 'secure-password'
   * });
   * // Store token for subsequent requests
   * localStorage.setItem('authToken', session.data.token);
   * ```
   */
  async loginWithEmail(credentials: EmailLoginCredentials): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/email'), credentials);
  }

  /**
   * Get current session
   * Retrieves active authentication session with user data and permissions
   *
   * @returns Promise with current session data or error if not authenticated
   *
   * @example
   * ```typescript
   * const session = await authService.getSession();
   * if (session.data.user) {
   *   console.log('Logged in as:', session.data.user.email);
   *   console.log('Role:', session.data.user.role);
   * }
   * ```
   */
  async getSession(): Promise<SingleResponse<AuthSession>> {
    return this.client.get(this.buildPath('/session'));
  }

  /**
   * Logout current user
   * Terminates the current session and invalidates the auth token
   *
   * @returns Promise with success status
   *
   * @example
   * ```typescript
   * await authService.logout();
   * // Clear local storage
   * localStorage.removeItem('authToken');
   * // Redirect to login page
   * window.location.href = '/login';
   * ```
   */
  async logout(): Promise<SingleResponse<{ success: boolean }>> {
    return this.client.post(this.buildPath('/logout'));
  }

  /**
   * Refresh auth token
   * Obtains a new authentication token before the current one expires
   * Call this periodically to maintain long-lived sessions
   *
   * @returns Promise with new session data including refreshed token
   *
   * @example
   * ```typescript
   * // Refresh token every 15 minutes
   * setInterval(async () => {
   *   try {
   *     const session = await authService.refreshToken();
   *     localStorage.setItem('authToken', session.data.token);
   *   } catch (error) {
   *     console.error('Token refresh failed:', error);
   *   }
   * }, 15 * 60 * 1000);
   * ```
   */
  async refreshToken(): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/refresh'));
  }

  /**
   * Get available OAuth providers
   * Returns list of configured OAuth/OIDC providers for social login
   *
   * @returns Promise with array of available OAuth providers (e.g., ID-porten, Google, Microsoft)
   *
   * @example
   * ```typescript
   * const providers = await authService.getProviders();
   * providers.data.forEach(provider => {
   *   console.log(`${provider.name}: ${provider.displayName}`);
   * });
   * ```
   */
  async getProviders(): Promise<SingleResponse<OAuthProvider[]>> {
    return this.client.get(this.buildPath('/providers'));
  }

  /**
   * Get CSRF token
   * Retrieves a CSRF token for form submissions requiring CSRF protection
   *
   * @returns Promise with CSRF token and expiration timestamp
   *
   * @example
   * ```typescript
   * const csrf = await authService.getCsrfToken();
   * // Include in form submission
   * formData.append('_csrf', csrf.data.token);
   * ```
   */
  async getCsrfToken(): Promise<SingleResponse<{ token: string; expiresAt: string }>> {
    return this.client.get(this.buildPath('/csrf'));
  }

  /**
   * Initiate OAuth login
   * Starts OAuth authentication flow and returns redirect URL
   *
   * @param provider - OAuth provider identifier (e.g., 'idporten', 'google', 'microsoft')
   * @param callbackUrl - Optional callback URL after authentication (defaults to current origin)
   * @returns Promise with OAuth redirect URL to send user to
   *
   * @example
   * ```typescript
   * // Initiate ID-porten login
   * const result = await authService.initiateOAuth('idporten', '/dashboard');
   * // Redirect user to OAuth provider
   * window.location.href = result.data.redirectUrl;
   * ```
   */
  async initiateOAuth(provider: string, callbackUrl?: string): Promise<SingleResponse<{ redirectUrl: string }>> {
    return this.client.post(this.buildPath('/oauth/initiate'), { provider, callbackUrl });
  }

  /**
   * Require authentication for a protected action
   * Checks if user is authenticated and initiates auth flow if needed
   */
  async requireAuth(options?: RequireAuthOptions): Promise<RequireAuthResult> {
    try {
      const session = await this.getSession();
      return {
        authenticated: true,
        session: session.data,
      };
    } catch {
      return {
        authenticated: false,
        redirectUrl: `/login?returnUrl=${encodeURIComponent(options?.returnUrl || window.location.pathname)}`,
      };
    }
  }

  /**
   * Resume flow after authentication
   * Restores user state and redirects to original destination
   */
  async resumeFlow(): Promise<ResumeFlowResult> {
    try {
      const session = await this.getSession();
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl') || '/';
      
      return {
        success: true,
        returnUrl,
        session: session.data,
      };
    } catch {
      return {
        success: false,
      };
    }
  }
}

// Singleton instance
export const authService = new AuthService();
