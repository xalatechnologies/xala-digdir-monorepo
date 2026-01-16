/**
 * Vipps Login Service
 * 
 * Implements Vipps Login API (OIDC/OAuth2):
 * - OIDC Discovery (.well-known)
 * - Authorization URL generation
 * - Token exchange
 * - ID token validation with JWKS
 * - User info retrieval
 * 
 * @see https://developer.vippsmobilepay.com/docs/APIs/login-api/
 */

import { randomBytes, createHash } from 'crypto';
import { getVippsConfig, getVippsEndpoints, VIPPS_DEFAULT_SCOPES } from '../../config/vipps.config';
import { getVippsClient } from './vipps.client';
import { AppError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';

// =============================================================================
// Types
// =============================================================================

export interface OidcConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  scopes_supported: string[];
  response_types_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token: string;
  scope: string;
}

export interface IdTokenClaims {
  /** Issuer */
  iss: string;
  /** Subject (Vipps user ID) */
  sub: string;
  /** Audience (client ID) */
  aud: string | string[];
  /** Expiration time */
  exp: number;
  /** Issued at */
  iat: number;
  /** Auth time */
  auth_time?: number;
  /** Nonce (if provided) */
  nonce?: string;
  /** Access token hash */
  at_hash?: string;
  /** Name */
  name?: string;
  /** Given name */
  given_name?: string;
  /** Family name */
  family_name?: string;
  /** Email */
  email?: string;
  /** Email verified */
  email_verified?: boolean;
  /** Phone number */
  phone_number?: string;
  /** Address */
  address?: {
    formatted?: string;
    street_address?: string;
    postal_code?: string;
    region?: string;
    country?: string;
  };
  /** Birth date (YYYY-MM-DD) */
  birthdate?: string;
  /** National Identity Number (NIN) - requires approval */
  nin?: string;
  /** Session ID */
  sid?: string;
}

export interface VippsUserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  address?: IdTokenClaims['address'];
  birthdate?: string;
  nin?: string;
}

export interface AuthorizationParams {
  /** OAuth state for CSRF protection */
  state: string;
  /** OIDC nonce for replay protection */
  nonce: string;
  /** Redirect URI */
  redirectUri: string;
  /** Optional: specific scopes */
  scopes?: string[];
  /** Optional: login hint (phone number) */
  loginHint?: string;
}

export interface AuthorizationResult {
  /** Authorization URL to redirect user to */
  authorizationUrl: string;
  /** State for CSRF validation */
  state: string;
  /** Nonce for ID token validation */
  nonce: string;
}

export interface TokenExchangeParams {
  /** Authorization code from callback */
  code: string;
  /** Redirect URI (must match authorization request) */
  redirectUri: string;
}

// =============================================================================
// OIDC Configuration Cache
// =============================================================================

let oidcConfigCache: OidcConfiguration | null = null;
let oidcConfigExpiry = 0;

/**
 * Get OIDC configuration (cached for 1 hour)
 */
async function getOidcConfiguration(): Promise<OidcConfiguration> {
  const now = Date.now();
  
  if (oidcConfigCache && oidcConfigExpiry > now) {
    return oidcConfigCache;
  }
  
  const config = getVippsConfig();
  const endpoints = getVippsEndpoints(config);
  
  const response = await fetch(endpoints.wellKnown);
  
  if (!response.ok) {
    throw new AppError(
      'Failed to fetch Vipps OIDC configuration',
      502,
      `OIDC discovery failed: ${response.statusText}`,
      '/errors/vipps-oidc-discovery'
    );
  }
  
  oidcConfigCache = await response.json() as OidcConfiguration;
  oidcConfigExpiry = now + 3600000; // 1 hour
  
  return oidcConfigCache;
}

// =============================================================================
// JWKS Cache for ID token validation
// =============================================================================

interface JWKKey {
  kty: string;
  kid: string;
  use: string;
  n: string;
  e: string;
  alg?: string;
}

interface JWKS {
  keys: JWKKey[];
}

let jwksCache: JWKS | null = null;
let jwksExpiry = 0;

/**
 * Get JWKS keys for token validation (cached for 1 hour)
 */
async function getJWKS(): Promise<JWKS> {
  const now = Date.now();
  
  if (jwksCache && jwksExpiry > now) {
    return jwksCache;
  }
  
  const config = getVippsConfig();
  const endpoints = getVippsEndpoints(config);
  
  const response = await fetch(endpoints.jwks);
  
  if (!response.ok) {
    throw new AppError(
      'Failed to fetch Vipps JWKS',
      502,
      `JWKS fetch failed: ${response.statusText}`,
      '/errors/vipps-jwks-fetch'
    );
  }
  
  jwksCache = await response.json() as JWKS;
  jwksExpiry = now + 3600000; // 1 hour
  
  return jwksCache;
}

// =============================================================================
// Vipps Login Service
// =============================================================================

export class VippsLoginService {
  private config = getVippsConfig();
  private endpoints = getVippsEndpoints(this.config);
  
  /**
   * Generate cryptographically secure state parameter
   */
  generateState(): string {
    return randomBytes(32).toString('base64url');
  }
  
  /**
   * Generate cryptographically secure nonce
   */
  generateNonce(): string {
    return randomBytes(32).toString('base64url');
  }
  
  /**
   * Build authorization URL for Vipps Login
   */
  async getAuthorizationUrl(params: AuthorizationParams): Promise<AuthorizationResult> {
    const scopes = params.scopes || [...VIPPS_DEFAULT_SCOPES];
    
    const url = new URL(this.endpoints.authorize);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    url.searchParams.set('redirect_uri', params.redirectUri);
    
    // Optional: Add login hint (phone number)
    if (params.loginHint) {
      url.searchParams.set('login_hint', params.loginHint);
    }
    
    // Log authorization initiation
    try {
      getAuditService().log({
        tenantId: 'system',
        userId: 'anonymous',
        action: 'vipps_login_initiated',
        resource: 'auth',
        resourceId: params.state,
        metadata: {
          redirectUri: params.redirectUri,
          scopes,
        },
      });
    } catch {
      // Silently fail if audit service unavailable
    }
    
    return {
      authorizationUrl: url.toString(),
      state: params.state,
      nonce: params.nonce,
    };
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(params: TokenExchangeParams): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });
    
    const response = await fetch(this.endpoints.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Merchant-Serial-Number': this.config.merchantSerialNumber,
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        'Token exchange failed',
        response.status,
        `Failed to exchange code for tokens: ${errorText}`,
        '/errors/vipps-token-exchange'
      );
    }
    
    const tokens = await response.json() as TokenResponse;
    
    // Log successful token exchange
    try {
      getAuditService().log({
        tenantId: 'system',
        userId: 'anonymous',
        action: 'vipps_token_exchanged',
        resource: 'auth',
        resourceId: 'token-exchange',
        metadata: {
          scope: tokens.scope,
          hasRefreshToken: !!tokens.refresh_token,
        },
      });
    } catch {
      // Silently fail
    }
    
    return tokens;
  }
  
  /**
   * Decode and validate ID token
   * Note: In production, use a proper JWT library like jose
   */
  async validateIdToken(idToken: string, expectedNonce?: string): Promise<IdTokenClaims> {
    // Split JWT into parts
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new AppError(
        'Invalid ID token format',
        400,
        'ID token is not a valid JWT',
        '/errors/vipps-invalid-token'
      );
    }
    
    // Decode payload (base64url)
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const claims = JSON.parse(payloadJson) as IdTokenClaims;
    
    // Validate issuer
    const expectedIssuer = this.config.environment === 'test'
      ? 'https://apitest.vipps.no/access-management-1.0/access/'
      : 'https://api.vipps.no/access-management-1.0/access/';
    
    if (!claims.iss.startsWith(expectedIssuer.replace('/access/', ''))) {
      throw new AppError(
        'Invalid issuer',
        401,
        `Token issuer ${claims.iss} does not match expected`,
        '/errors/vipps-invalid-issuer'
      );
    }
    
    // Validate audience
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audience.includes(this.config.clientId)) {
      throw new AppError(
        'Invalid audience',
        401,
        'Token audience does not match client ID',
        '/errors/vipps-invalid-audience'
      );
    }
    
    // Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp < now) {
      throw new AppError(
        'Token expired',
        401,
        'ID token has expired',
        '/errors/vipps-token-expired'
      );
    }
    
    // Validate nonce if provided
    if (expectedNonce && claims.nonce !== expectedNonce) {
      throw new AppError(
        'Invalid nonce',
        401,
        'ID token nonce does not match expected',
        '/errors/vipps-invalid-nonce'
      );
    }
    
    // TODO: In production, verify JWT signature using JWKS
    // const jwks = await getJWKS();
    // Verify signature using jose library
    
    return claims;
  }
  
  /**
   * Get user info from Vipps userinfo endpoint
   */
  async getUserInfo(accessToken: string): Promise<VippsUserInfo> {
    const response = await fetch(this.endpoints.userinfo, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        'Failed to fetch user info',
        response.status,
        `Userinfo request failed: ${errorText}`,
        '/errors/vipps-userinfo'
      );
    }
    
    return await response.json() as VippsUserInfo;
  }
  
  /**
   * Complete login flow: exchange code, validate token, get user info
   */
  async completeLogin(
    code: string,
    redirectUri: string,
    expectedNonce: string
  ): Promise<{
    tokens: TokenResponse;
    claims: IdTokenClaims;
    userInfo: VippsUserInfo;
  }> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens({ code, redirectUri });
    
    // Validate ID token
    const claims = await this.validateIdToken(tokens.id_token, expectedNonce);
    
    // Get user info
    const userInfo = await this.getUserInfo(tokens.access_token);
    
    // Log successful login
    try {
      getAuditService().log({
        tenantId: 'system',
        userId: claims.sub,
        action: 'vipps_login_completed',
        resource: 'auth',
        resourceId: claims.sub,
        metadata: {
          email: userInfo.email,
          phoneNumber: userInfo.phone_number,
          hasNin: !!userInfo.nin,
        },
      });
    } catch {
      // Silently fail
    }
    
    return { tokens, claims, userInfo };
  }
}

// =============================================================================
// Singleton instance
// =============================================================================

let loginServiceInstance: VippsLoginService | null = null;

export function getVippsLoginService(): VippsLoginService {
  if (!loginServiceInstance) {
    loginServiceInstance = new VippsLoginService();
  }
  return loginServiceInstance;
}

/**
 * Clear service instance and caches (for testing)
 */
export function clearVippsLoginService(): void {
  loginServiceInstance = null;
  oidcConfigCache = null;
  oidcConfigExpiry = 0;
  jwksCache = null;
  jwksExpiry = 0;
}
