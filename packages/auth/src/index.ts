/**
 * @xala/auth - Centralized Authentication Package
 *
 * Single source of truth for authentication across all Xala/Digilist applications.
 * Now domain-agnostic with dependency injection support.
 *
 * Features:
 * - HTTP-only cookie-based sessions
 * - OAuth 2.0 integration (ID-porten, Microsoft, Vipps)
 * - Role-based access control per app type
 * - Cross-tab session synchronization
 * - Flow context preservation (booking flows, etc.)
 * - NO mock authentication (security-first)
 * - Domain-agnostic via dependency injection
 *
 * Usage (recommended - with dependency injection):
 * ```tsx
 * import { AuthServiceProvider, AuthProvider } from '@xala/auth/providers';
 * import { authService } from '@my-domain/sdk';
 *
 * <AuthServiceProvider authService={authService}>
 *   <AuthProvider config={{ appType: 'my-app' }}>
 *     <App />
 *   </AuthProvider>
 * </AuthServiceProvider>
 * ```
 *
 * @packageDocumentation
 */

// Core providers
export { AuthProvider } from './providers/AuthProvider';
export {
  AuthServiceProvider,
  useAuthService,
  useAuthServiceOptional,
  defaultFlowContextUtils,
  defaultTokenUtils,
} from './providers/AuthServiceContext';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useOAuthCallback } from './hooks/useOAuthCallback';

// Components
export { ProtectedRoute } from './components/ProtectedRoute';

// Types - User and Auth
export type {
  User,
  UserRole,
  AppType,
  AuthConfig,
  AuthContextType,
  RestoreFlowContextResult,
  FlowContext,
  EffectiveBackofficeRole,
} from './types';

// Types - Service Contract (for implementing auth services)
export type {
  AuthServiceContract,
  AuthServiceResponse,
  SessionData,
  OAuthInitResponse,
  OAuthCallbackResponse,
  TokenRefreshResponse,
  FlowResumeResult,
  FlowContextUtilities,
  TokenUtilities,
  InjectedAuthService,
} from './types/service-contract';

// Types - Provider Context
export type {
  AuthServiceContextValue,
  AuthServiceProviderProps,
} from './providers/AuthServiceContext';

// Auth configuration exports
export type {
  AuthProvider as AuthProviderConfig,
  AuthProviderId,
  AppAuthConfig,
  ProviderAvailability,
} from './config';

export {
  idportenProvider,
  vippsProvider,
  microsoftProvider,
  demoProvider,
  getProvider,
  getEnabledProviders,
  webAuthConfig,
  minsideAuthConfig,
  backofficeAuthConfig,
  saasAdminAuthConfig,
  getAppAuthConfig,
} from './config';
