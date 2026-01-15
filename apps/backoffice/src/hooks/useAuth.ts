import { createContext, useContext } from 'react';
import type { FlowContext } from '@digilist/client-sdk';
import type { EffectiveBackofficeRole } from '../lib/capabilities';

/**
 * Re-export EffectiveBackofficeRole for convenience
 */
export type { EffectiveBackofficeRole } from '../lib/capabilities';

/**
 * Legacy role type for backward compatibility.
 * Use EffectiveBackofficeRole for new implementations.
 */
export type BackofficeRole = 'super_admin' | 'admin' | 'saksbehandler';

/**
 * Backoffice-specific user type.
 * Supports both legacy single role and new multi-role grant system.
 */
export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  /**
   * Legacy role field for backward compatibility.
   * @deprecated Use grantedRoles for new implementations.
   */
  role: BackofficeRole;
  /**
   * Array of roles the user has been granted.
   * Dual-role users will have both 'admin' and 'case_handler'.
   * Single-role users will have one entry.
   */
  grantedRoles?: EffectiveBackofficeRole[];
}

/**
 * Result from restoring flow context after authentication
 */
export interface RestoreFlowContextResult {
  /** Whether there was a flow context to restore */
  hasContext: boolean;
  /** The restored flow context */
  flowContext?: FlowContext;
  /** Time remaining before context expires (ms) */
  ttl?: number;
  /** Whether the context was expired */
  wasExpired?: boolean;
  /** Whether the context was invalid */
  wasInvalid?: boolean;
}

export interface AuthContextType {
  user: BackofficeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSaksbehandler: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-dual') => void;
  logout: () => Promise<void>;
  checkRole: (role: BackofficeRole) => boolean;
  /** Whether there is a stored flow context */
  hasStoredContext: boolean;
  /** Restore flow context after authentication */
  restoreFlowContext: (clearAfterLoad?: boolean) => RestoreFlowContextResult;
  /** Clear any stored flow context */
  clearFlowContext: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
