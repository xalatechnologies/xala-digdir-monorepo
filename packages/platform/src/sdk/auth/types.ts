/**
 * Auth Types for Platform SDK
 *
 * Types for authentication services used across all platform applications.
 */

// =============================================================================
// Auth Session Types
// =============================================================================

export interface AuthSession {
  user: AuthUser;
  token?: string;
  expiresAt?: string;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
  };
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  tenantId?: string;
  organizationId?: string;
  permissions?: string[];
  avatarUrl?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
}

export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'oidc' | 'oauth2' | 'saml';
  enabled: boolean;
}

// =============================================================================
// RequireAuth Types
// =============================================================================

export interface RequireAuthOptions {
  returnUrl?: string;
  returnTo?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
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

// =============================================================================
// ID-porten Types
// =============================================================================

export interface IdPortenConfig {
  authorizeUrl: string;
  callbackUrl: string;
  identityProvider: string;
  scopes: string[];
  domain: string;
}

export interface IdPortenUser {
  sub: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  nin?: string;
  birthdate?: string;
  email?: string;
  locale?: string;
}

export interface IdPortenTokens {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface IdPortenAuthResult {
  user: IdPortenUser;
  tokens: IdPortenTokens;
  provider: string;
  identityMethod: string;
}

export interface IdPortenLogoutResult {
  logoutUrl: string;
}

// =============================================================================
// Response Types
// =============================================================================

export interface SingleResponse<T> {
  data: T;
}
