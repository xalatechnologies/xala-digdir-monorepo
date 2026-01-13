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
  async initiateOAuth(provider: string, callbackUrl?: string): Promise<SingleResponse<{ redirectUrl: string }>> {
    return this.client.post(this.buildPath('/oauth/initiate'), { provider, callbackUrl });
  }
}

// Singleton instance
export const authService = new AuthService();
