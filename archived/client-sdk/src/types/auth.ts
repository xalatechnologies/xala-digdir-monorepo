/**
 * Auth Types
 * Single Responsibility: Authentication and authorization types
 */

import type { UserRole } from './enums';

// =============================================================================
// Auth Session
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  organizationId?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  permissions: string[];
}

// =============================================================================
// Auth DTOs
// =============================================================================

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export interface OAuthLoginParams {
  provider: 'bankid' | 'vipps' | 'idporten' | 'google' | 'github';
  callbackUrl?: string;
}

// =============================================================================
// Auth Providers
// =============================================================================

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string;
  loginUrl?: string;
}

// =============================================================================
// RBAC Types
// =============================================================================

export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Record<string, string[]>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  role: UserRole;
  reason?: string;
}
