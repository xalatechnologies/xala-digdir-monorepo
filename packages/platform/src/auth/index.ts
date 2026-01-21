/**
 * @xalatechnologies/platform/auth
 *
 * Authentication layer for the platform
 *
 * Provides:
 * - AuthProvider - Context provider for authentication state
 * - useAuth - Hook for accessing auth state and methods
 * - ProtectedRoute - Route guard for authenticated routes
 * - Session management utilities
 * - BankID/ID-porten integration support
 *
 * @example
 * ```tsx
 * import { AuthProvider, useAuth } from '@xalatechnologies/platform/auth';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Routes>
 *         <Route path="/login" element={<LoginPage />} />
 *         <Route path="/dashboard" element={<DashboardPage />} />
 *       </Routes>
 *     </AuthProvider>
 *   );
 * }
 *
 * function DashboardPage() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 *   return <div>Welcome, {user?.name}</div>;
 * }
 * ```
 */

// =============================================================================
// Provider and Hook
// =============================================================================

export {
  AuthProvider,
  useAuth,
  AuthContext,
  type AuthContextValue,
  type AuthProviderProps,
} from './AuthProvider';

export { useOAuthCallback } from './useOAuthCallback';
export type { OAuthCallbackState, UseOAuthCallbackOptions } from './useOAuthCallback';

// =============================================================================
// Re-export SDK Auth Types
// =============================================================================

export type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  EmailLoginCredentials,
  OAuthProvider,
  RequireAuthOptions,
  RequireAuthResult,
  ResumeFlowResult,
} from '../sdk/auth/types';

// =============================================================================
// Legacy Type Aliases (for backwards compatibility)
// =============================================================================

import type { AuthUser } from '../sdk/auth/types';

/** @deprecated Use AuthUser from '@xalatechnologies/platform/auth' */
export type User = AuthUser;

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

/** @deprecated Use AuthSession from '@xalatechnologies/platform/auth' */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: AuthUser;
}

// =============================================================================
// SaaS Admin Types
// =============================================================================

/** Role types for SaaS Admin application */
export type SaasAdminRole = 'super_admin' | 'platform_admin' | 'support' | 'viewer';

// =============================================================================
// Auth Configurations
// =============================================================================

import type { LoginPageAuthConfig } from '../ui/pages/LoginPage';

/** Re-export LoginPageAuthConfig for app auth configs */
export type { LoginPageAuthConfig };

/** Pre-configured auth config for SaaS Admin application */
export const saasAdminAuthConfig: LoginPageAuthConfig = {
  app: 'saas-admin',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      description: 'Logg inn med Microsoft-konto',
      enabled: false,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/',
};

/** Pre-configured auth config for Backoffice application */
export const backofficeAuthConfig: LoginPageAuthConfig = {
  app: 'backoffice',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/dashboard',
};

/** Pre-configured auth config for Minside application */
export const minsideAuthConfig: LoginPageAuthConfig = {
  app: 'minside',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'vipps',
      name: 'Vipps',
      description: 'Logg inn med Vipps',
      enabled: false,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/dashboard',
};

/** Pre-configured auth config for Web application */
export const webAuthConfig: LoginPageAuthConfig = {
  app: 'web',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'vipps',
      name: 'Vipps',
      description: 'Logg inn med Vipps',
      enabled: false,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/',
};

/** Pre-configured auth config for Monitoring Global application */
export const monitoringGlobalAuthConfig: LoginPageAuthConfig = {
  app: 'monitoring-global',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/',
};

/** Pre-configured auth config for Docs Global application */
export const docsGlobalAuthConfig: LoginPageAuthConfig = {
  app: 'docs-global',
  providers: [
    {
      id: 'idporten',
      name: 'ID-porten',
      description: 'Logg inn med BankID via ID-porten',
      enabled: true,
    },
    {
      id: 'demo',
      name: 'Demo innlogging',
      description: 'For testing og demonstrasjon',
      enabled: true,
    },
  ],
  redirectAfterLogin: '/',
};
