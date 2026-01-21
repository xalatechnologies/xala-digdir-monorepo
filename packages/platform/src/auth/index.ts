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
 * import { AuthProvider, useAuth, ProtectedRoute } from '@xalatechnologies/platform/auth';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Routes>
 *         <Route path="/login" element={<LoginPage />} />
 *         <Route
 *           path="/dashboard"
 *           element={
 *             <ProtectedRoute>
 *               <DashboardPage />
 *             </ProtectedRoute>
 *           }
 *         />
 *       </Routes>
 *     </AuthProvider>
 *   );
 * }
 * ```
 */

// Auth types
export interface User {
  id: string;
  email?: string;
  name?: string;
  roles?: string[];
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials?: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Session types
export interface Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

// TODO: Migrate from @xala/auth
// export { AuthProvider, useAuth } from './AuthProvider';
// export { ProtectedRoute } from './ProtectedRoute';
// export { useSession } from './useSession';
// export { useOAuthCallback } from './useOAuthCallback';
