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
   * Get current session from HTTP-only cookie
   *
   * Note: This method relies on HTTP-only cookies for session management.
   * The session cookie is automatically sent by the browser with this request.
   * No manual token handling is required - the backend validates the session
   * from the secure, HTTP-only cookie that was set during OAuth callback.
   *
   * @returns Current auth session if valid cookie exists
   */
  async getSession(): Promise<SingleResponse<AuthSession>> {
    return this.client.get(this.buildPath('/session'));
  }

  /**
   * Logout current user and clear HTTP-only session cookie
   *
   * Note: This endpoint clears the HTTP-only session cookie on the backend.
   * The browser will automatically send the session cookie with this request
   * to identify which session to terminate.
   *
   * @returns Success status
   */
  async logout(): Promise<SingleResponse<{ success: boolean }>> {
    return this.client.post(this.buildPath('/logout'));
  }

  /**
   * Refresh auth session using HTTP-only cookie
   *
   * Note: This endpoint validates the current session cookie and issues
   * a new session cookie with extended expiration. The browser automatically
   * sends the current session cookie with this request.
   *
   * @returns Updated auth session with refreshed expiration
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
  async initiateOAuth(provider: string, callbackUrl?: string): Promise<SingleResponse<{ redirectUrl: string }>> {
    return this.client.post(this.buildPath('/oauth/initiate'), { provider, callbackUrl });
  }

  /**
   * Handle OAuth callback and exchange authorization code for session
   * @param code - OAuth authorization code from callback URL
   * @returns Auth session with HTTP-only cookie set by backend
   */
  async handleOAuthCallback(code: string): Promise<SingleResponse<AuthSession>> {
    return this.client.post(this.buildPath('/callback'), { code });
  }
}

// Singleton instance
export const authService = new AuthService();
