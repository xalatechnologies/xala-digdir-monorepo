import { createContext, useContext } from 'react';
import type { FlowContext } from '@digilist/client-sdk';

// Backoffice-specific user type
export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'saksbehandler';
}

export type UserRole = 'admin' | 'saksbehandler';

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
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSaksbehandler: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'vipps') => void;
  logout: () => Promise<void>;
  checkRole: (role: UserRole) => boolean;
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
