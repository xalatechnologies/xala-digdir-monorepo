/**
 * Vipps Authentication Service
 * Client-side service for Vipps Login (OIDC) authentication
 *
 * @example
 * import { vippsAuthService } from '@digilist/client-sdk';
 *
 * // Redirect to authorization
 * vippsAuthService.authorize('https://web-test.digilist.no/');
 */

import { getClient, getClientConfig } from '../core/client-factory';

// =============================================================================
// Types
// =============================================================================

export interface VippsAuthConfig {
  authorizeUrl: string;
  callbackUrl: string;
  scopes: string[];
}

export interface VippsAuthUser {
  sub: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  nin?: string;
  birthdate?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  address?: {
    formatted?: string;
    street_address?: string;
    postal_code?: string;
    region?: string;
    country?: string;
  };
}

export interface VippsAuthResult {
  user: VippsAuthUser;
  provider: string;
}

// =============================================================================
// Service
// =============================================================================

class VippsAuthService {
  private basePath = '/api/auth/vipps';

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
   * Get Vipps configuration
   */
  async getConfig(): Promise<{ data: VippsAuthConfig }> {
    return getClient().get<{ data: VippsAuthConfig }>(`${this.basePath}/config`);
  }

  /**
   * Get the authorization URL to start OAuth flow
   * @param redirectPath - Path to redirect after authentication (optional, will be prefixed with current origin)
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
   * Start authorization flow by redirecting to Vipps
   * @param redirectUrl - Where to redirect after authentication
   */
  authorize(redirectUrl?: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = this.getAuthorizeUrl(redirectUrl);
    }
  }

  /**
   * Logout by redirecting to Vipps logout
   */
  async logout(postLogoutRedirectUri?: string): Promise<void> {
    const apiBaseUrl = this.getApiBaseUrl();
    const redirectUri = postLogoutRedirectUri || (typeof window !== 'undefined' ? window.location.origin : '');
    if (typeof window !== 'undefined') {
      window.location.href = `${apiBaseUrl}${this.basePath}/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
  }
}

export const vippsAuthService = new VippsAuthService();
export default vippsAuthService;
