/**
 * Auth Service - Platform SDK
 *
 * Handles all authentication operations including demo login, email login,
 * session management, and OAuth flows.
 *
 * @example
 * import { authService } from '@xalatechnologies/platform/sdk';
 *
 * // Demo login
 * const session = await authService.loginWithDemoToken('demo-token-123');
 *
 * // Get session
 * const currentSession = await authService.getSession();
 */

import { getClient } from '../http';
import type {
  AuthSession,
  LoginCredentials,
  EmailLoginCredentials,
  OAuthProvider,
  RequireAuthOptions,
  RequireAuthResult,
  ResumeFlowResult,
  SingleResponse,
} from './types';

class AuthService {
  private basePath = '/api/auth';

  /**
   * Login with email (mock/demo)
   * Use this for development and testing purposes
   */
  async login(credentials: LoginCredentials): Promise<SingleResponse<AuthSession>> {
    return getClient().post<SingleResponse<AuthSession>>(
      `${this.basePath}/login`,
      credentials
    );
  }

  /**
   * Login with email and password
   * Primary authentication method for standard email/password credentials
   */
  async loginWithEmail(credentials: EmailLoginCredentials): Promise<SingleResponse<AuthSession>> {
    return getClient().post<SingleResponse<AuthSession>>(
      `${this.basePath}/email`,
      credentials
    );
  }

  /**
   * Get current session
   * Retrieves active authentication session with user data and permissions
   */
  async getSession(): Promise<SingleResponse<AuthSession>> {
    return getClient().get<SingleResponse<AuthSession>>(`${this.basePath}/session`);
  }

  /**
   * Logout current user
   * Terminates the current session and invalidates the auth token
   */
  async logout(): Promise<SingleResponse<{ success: boolean }>> {
    return getClient().post<SingleResponse<{ success: boolean }>>(`${this.basePath}/logout`);
  }

  /**
   * Refresh auth token
   * Obtains a new authentication token before the current one expires
   */
  async refreshToken(): Promise<SingleResponse<AuthSession>> {
    return getClient().post<SingleResponse<AuthSession>>(`${this.basePath}/refresh`);
  }

  /**
   * Get available OAuth providers
   * Returns list of configured OAuth/OIDC providers for social login
   */
  async getProviders(): Promise<SingleResponse<OAuthProvider[]>> {
    return getClient().get<SingleResponse<OAuthProvider[]>>(`${this.basePath}/providers`);
  }

  /**
   * Get CSRF token
   * Retrieves a CSRF token for form submissions requiring CSRF protection
   */
  async getCsrfToken(): Promise<SingleResponse<{ token: string; expiresAt: string }>> {
    return getClient().get<SingleResponse<{ token: string; expiresAt: string }>>(
      `${this.basePath}/csrf`
    );
  }

  /**
   * Initiate OAuth login
   * Starts OAuth authentication flow and returns redirect URL
   */
  async initiateOAuth(
    provider: string,
    callbackUrl?: string
  ): Promise<SingleResponse<{ redirectUrl: string }>> {
    return getClient().post<SingleResponse<{ redirectUrl: string }>>(
      `${this.basePath}/oauth/initiate`,
      { provider, callbackUrl }
    );
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
        redirectUrl: `/login?returnUrl=${encodeURIComponent(
          options?.returnUrl || (typeof window !== 'undefined' ? window.location.pathname : '/')
        )}`,
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
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
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
   */
  async loginWithDemoToken(token: string): Promise<SingleResponse<AuthSession>> {
    return getClient().post<SingleResponse<AuthSession>>(`${this.basePath}/demo-token`, {
      token,
    });
  }

  /**
   * Demo Exchange - One-click demo login by role
   * Authenticates using a role key without manual token entry.
   */
  async demoExchange(
    key: 'admin' | 'case_handler' | 'org_admin' | 'org_member',
    returnTo?: string
  ): Promise<SingleResponse<AuthSession & { redirectUrl: string }>> {
    return getClient().post<SingleResponse<AuthSession & { redirectUrl: string }>>(
      `${this.basePath}/demo/exchange`,
      { key, returnTo }
    );
  }

  /**
   * Handle OAuth callback
   * Exchanges authorization code for session with HTTP-only cookies
   */
  async handleOAuthCallback(
    code: string,
    state?: string
  ): Promise<SingleResponse<AuthSession>> {
    const params: Record<string, string> = { code };
    if (state) {
      params.state = state;
    }

    return getClient().get<SingleResponse<AuthSession>>(
      `${this.basePath}/idporten-oidc/callback`,
      { params }
    );
  }

  /**
   * Test Login with National ID (BankID/Vipps simulation)
   */
  async loginWithNationalId(nationalId: string): Promise<SingleResponse<AuthSession>> {
    return getClient().post<SingleResponse<AuthSession>>(`${this.basePath}/callback`, {
      nationalId,
      code: 'test-' + Date.now(),
    });
  }
}

// Singleton instance
export const authService = new AuthService();
