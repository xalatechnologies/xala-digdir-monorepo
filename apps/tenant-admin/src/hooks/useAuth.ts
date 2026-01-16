/**
 * Tenant Admin Authentication Hook
 * Provides auth context and types for the Tenant admin application
 */

import { createContext, useContext } from 'react';

// =============================================================================
// Tenant Admin Role Types
// =============================================================================

/**
 * Tenant-level roles for tenant-wide administration
 */
export type TenantAdminRole = 'TENANT_ADMIN' | 'TENANT_BILLING_ADMIN' | 'TENANT_TECH_ADMIN';

/**
 * Tenant Admin user type
 */
export interface TenantAdminUser {
  id: string;
  name: string;
  email: string;
  /**
   * ID of the tenant this user belongs to
   */
  tenantId: string;
  /**
   * Name of the tenant for display purposes
   */
  tenantName: string;
  /**
   * Primary role for the user
   */
  role: TenantAdminRole;
  /**
   * Array of roles the user has been granted
   * Used for multi-role support in future
   */
  grantedRoles?: TenantAdminRole[];
}

// =============================================================================
// Auth Context Type
// =============================================================================

export interface AuthContextType {
  user: TenantAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** User has tenant admin privileges (full access) */
  isTenantAdmin: boolean;
  /** User has billing admin privileges */
  isBillingAdmin: boolean;
  /** User has tech admin privileges */
  isTechAdmin: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-billing' | 'dev-tech') => void;
  logout: () => Promise<void>;
  checkRole: (role: TenantAdminRole) => boolean;
}

// =============================================================================
// Auth Context
// =============================================================================

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
