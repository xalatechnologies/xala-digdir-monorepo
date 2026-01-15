/**
 * Signicat Authentication Service
 * Client-side service for Signicat eID Hub authentication
 * 
 * @example
 * import { signicatService } from '@digilist/client-sdk';
 * 
 * // Get auth config
 * const config = await signicatService.getConfig();
 * 
 * // Redirect to authorization
 * window.location.href = signicatService.getAuthorizeUrl();
 */

import { getClient, getClientConfig } from '../core/client-factory';

// =============================================================================
// Types
// =============================================================================

export interface SignicatConfig {
  authorizeUrl: string;
  callbackUrl: string;
  identityProvider: string;
  scopes: string[];
  domain: string;
}

export interface SignicatUser {
  sub: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  nin?: string;
  birthdate?: string;
  email?: string;
  locale?: string;
}

export interface SignicatTokens {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SignicatAuthResult {
  user: SignicatUser;
  tokens: SignicatTokens;
  provider: string;
  identityMethod: string;
}

export interface SignicatLogoutResult {
  logoutUrl: string;
}

// =============================================================================
// Service
// =============================================================================

class SignicatService {
  private basePath = '/api/auth/signicat';

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
   * Get Signicat configuration
   */
  async getConfig(): Promise<{ data: SignicatConfig }> {
    return getClient().get<{ data: SignicatConfig }>(`${this.basePath}/config`);
  }

  /**
   * Get the authorization URL to start OAuth flow
   * @param redirectUrl - Where to redirect after authentication (optional)
   */
  getAuthorizeUrl(redirectUrl?: string): string {
    const baseUrl = this.getApiBaseUrl();
    let url = `${baseUrl}${this.basePath}/authorize`;
    if (redirectUrl) {
      url += `?returnTo=${encodeURIComponent(redirectUrl)}`;
    }
    return url;
  }


  /**
   * Start authorization flow by redirecting to Signicat
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
  ): Promise<{ data: SignicatLogoutResult }> {
    return getClient().post<{ data: SignicatLogoutResult }>(
      `${this.basePath}/logout`,
      {
        id_token: idToken,
        post_logout_redirect_uri: postLogoutRedirectUri,
      }
    );
  }

  /**
   * Logout by redirecting to Signicat logout
   */
  async logout(idToken?: string, postLogoutRedirectUri?: string): Promise<void> {
    const result = await this.getLogoutUrl(idToken, postLogoutRedirectUri);
    if (typeof window !== 'undefined') {
      window.location.href = result.data.logoutUrl;
    }
  }
}

export const signicatService = new SignicatService();
export default signicatService;
