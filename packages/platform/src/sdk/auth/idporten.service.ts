/**
 * ID-porten Authentication Service - Platform SDK
 *
 * Client-side service for ID-porten (BankID) authentication.
 * Used for Norwegian national ID authentication flows.
 *
 * @example
 * import { idportenService } from '@xalatechnologies/platform/sdk';
 *
 * // Get auth config
 * const config = await idportenService.getConfig();
 *
 * // Redirect to authorization
 * idportenService.authorize('/dashboard');
 */

import { getClient, getClientConfig } from '../http';
import type { IdPortenConfig, IdPortenLogoutResult } from './types';

class IdPortenService {
  private basePath = '/api/auth/idporten';

  /**
   * Get the API base URL from SDK config
   */
  private getApiBaseUrl(): string {
    const config = getClientConfig();
    if (config?.baseUrl) {
      return config.baseUrl;
    }
    // Fallback to window.location.origin if SDK not configured
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Get ID-porten configuration
   */
  async getConfig(): Promise<{ data: IdPortenConfig }> {
    return getClient().get<{ data: IdPortenConfig }>(`${this.basePath}/config`);
  }

  /**
   * Get the authorization URL to start OAuth flow
   * @param redirectPath - Path to redirect after authentication (optional)
   */
  getAuthorizeUrl(redirectPath?: string): string {
    const apiBaseUrl = this.getApiBaseUrl();
    let url = `${apiBaseUrl}${this.basePath}/authorize`;
    if (redirectPath) {
      // Build full absolute URL using current origin + path
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullRedirectUrl = redirectPath.startsWith('http')
        ? redirectPath
        : `${origin}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`;
      url += `?returnTo=${encodeURIComponent(fullRedirectUrl)}`;
    }
    return url;
  }

  /**
   * Start authorization flow by redirecting to ID-porten
   * @param redirectUrl - Where to redirect after authentication
   */
  authorize(redirectUrl?: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = this.getAuthorizeUrl(redirectUrl);
    }
  }

  /**
   * Get logout URL
   * @param idToken - ID token from authentication
   * @param postLogoutRedirectUri - Where to redirect after logout
   */
  async getLogoutUrl(
    idToken?: string,
    postLogoutRedirectUri?: string
  ): Promise<{ data: IdPortenLogoutResult }> {
    return getClient().post<{ data: IdPortenLogoutResult }>(`${this.basePath}/logout`, {
      id_token: idToken,
      post_logout_redirect_uri: postLogoutRedirectUri,
    });
  }

  /**
   * Logout by redirecting to ID-porten logout
   */
  async logout(idToken?: string, postLogoutRedirectUri?: string): Promise<void> {
    const result = await this.getLogoutUrl(idToken, postLogoutRedirectUri);
    if (typeof window !== 'undefined') {
      window.location.href = result.data.logoutUrl;
    }
  }
}

export const idportenService = new IdPortenService();
