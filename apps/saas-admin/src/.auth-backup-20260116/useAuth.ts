/**
 * SaaS Admin Authentication Hook
 * Provides auth context and types for the SaaS admin application
 */

import { createContext, useContext } from 'react';

// =============================================================================
// SaaS Admin Role Types
// =============================================================================

/**
 * SaaS-level roles for platform-wide administration
 */
export type SaasAdminRole = 'SAAS_SUPER_ADMIN' | 'SAAS_BILLING_ADMIN' | 'SAAS_SUPPORT_AGENT';

/**
 * SaaS Admin user type
 */
export interface SaasAdminUser {
  id: string;
  name: string;
  email: string;
  /**
   * Primary role for the user
   */
  role: SaasAdminRole;
  /**
   * Array of roles the user has been granted
   * Used for multi-role support in future
   */
  grantedRoles?: SaasAdminRole[];
}

// =============================================================================
// Auth Context Type
// =============================================================================

export interface AuthContextType {
  user: SaasAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** User has super admin privileges */
  isSuperAdmin: boolean;
  /** User has billing admin privileges */
  isBillingAdmin: boolean;
  /** User has support agent privileges */
  isSupportAgent: boolean;
  login: (provider?: 'idporten' | 'internal' | 'dev-super' | 'dev-billing' | 'dev-support') => void;
  logout: () => Promise<void>;
  checkRole: (role: SaasAdminRole) => boolean;
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
