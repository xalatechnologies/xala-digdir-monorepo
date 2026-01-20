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
} from '@/types/auth';
import type { SingleResponse } from '@/types/enums';

export interface RequireAuthOptions {
  returnUrl?: string;
  returnTo?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
  listingId?: string;
  bookingMode?: string;
  selectedDates?: string[];
  selectedSlots?: { startTime: string; endTime: string; date: string }[];
  recurringRules?: Record<string, unknown>;
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
  flowContext?: Record<string, unknown>;
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

  /**
   * Login with demo token
   * Authenticate using a secure demo token for testing and demo purposes
   *
   * @param token - Secure demo token provided by admin
   * @returns Promise with authenticated session data
   *
   * @example
   * ```typescript
   * const session = await authService.loginWithDemoToken('demo-token-123');
   * if (session.data?.user) {
   *   console.log('Logged in as:', session.data.user.email);
   * }
   * ```
   */
  async loginWithDemoToken(token: string): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/demo-token'), { token });
  }

  /**
   * Demo Exchange - One-click demo login by role
   * Authenticates using a role key without manual token entry.
   * 
   * Security: Only available in demo/staging environments or when explicitly enabled.
   * 
   * @param key - Role key: 'admin' | 'case_handler' | 'org_admin' | 'org_member'
   * @param returnTo - Optional URL to redirect after login
   * @returns Session data with redirectUrl
   * 
   * @example
   * ```typescript
   * const result = await authService.demoExchange('admin');
   * if (result.data?.redirectUrl) {
   *   window.location.href = result.data.redirectUrl;
   * }
   * ```
   */
  async demoExchange(
    key: 'admin' | 'case_handler' | 'org_admin' | 'org_member',
    returnTo?: string
  ): Promise<SingleResponse<AuthSession & { redirectUrl: string }>> {
    return this.client.post(this.buildPath('/demo/exchange'), { key, returnTo });
  }

  /**
   * Handle OAuth callback
   * Exchanges authorization code for session with HTTP-only cookies
   *
   * This method is called after the OAuth provider redirects back to the app
   * with an authorization code. It contacts the API to exchange the code for
   * access tokens, which are set as HTTP-only cookies by the API server.
   *
   * The API validates:
   * - Authorization code validity
   * - State parameter (CSRF protection)
   * - Tenant ID and subscription status
   * - User permissions and feature flags
   *
   * @param code - Authorization code from OAuth provider
   * @param state - State parameter for CSRF protection (optional)
   * @returns Promise with authenticated session including user data, tenant info, and subscription details
   *
   * @example
   * ```typescript
   * // After OAuth redirect with ?code=xxx&state=yyy
   * const urlParams = new URLSearchParams(window.location.search);
   * const code = urlParams.get('code');
   * const state = urlParams.get('state');
   *
   * if (code) {
   *   const session = await authService.handleOAuthCallback(code, state);
   *   console.log('Logged in as:', session.data.user.email);
   *   console.log('Tenant:', session.data.user.tenantId);
   *   console.log('Subscription:', session.data.subscription);
   * }
   * ```
   */
  async handleOAuthCallback(
    code: string,
    state?: string
  ): Promise<SingleResponse<AuthSession>> {
    const params: Record<string, string> = { code };
    if (state) {
      params.state = state;
    }

    // Call the API's OAuth callback endpoint
    // The API will:
    // 1. Exchange authorization code for OAuth tokens
    // 2. Verify ID token and extract user claims
    // 3. Validate tenant ID and subscription status
    // 4. Create session with JWT containing:
    //    - User ID, email, role, permissions
    //    - Tenant ID and subscription details
    //    - Feature flags based on subscription tier
    // 5. Set HTTP-only cookies (access token, refresh token, CSRF token)
    // 6. Return session data to frontend
    return this.client.get(this.buildPath('/idporten-oidc/callback'), { params });
  }

  /**
   * Test Login with National ID (BankID/Vipps simulation)
   *
   * Authenticates a test user using their Norwegian national ID.
   * This is for testing purposes only - simulates BankID/Vipps authentication.
   *
   * @param nationalId - Norwegian national identity number (11 digits)
   * @returns Session data with HTTP-only cookies set
   *
   * @example
   *   const session = await authService.loginWithNationalId('15860771346');
   */
  async loginWithNationalId(nationalId: string): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/callback'), {
      nationalId,
      code: 'test-' + Date.now(),
    });
  }
}

// Singleton instance
export const authService = new AuthService();
