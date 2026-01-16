/**
 * @xala/auth - Centralized Authentication Package
 * 
 * Single source of truth for authentication across all Xala/Digilist applications.
 * 
 * Features:
 * - HTTP-only cookie-based sessions (.digilist.no domain)
 * - OAuth 2.0 integration (ID-porten, Microsoft, Vipps)
 * - Role-based access control per app type
 * - Cross-tab session synchronization
 * - Flow context preservation (booking flows, etc.)
 * - NO mock authentication (security-first)
 * 
 * @packageDocumentation
 */

export { AuthProvider } from './providers/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useOAuthCallback } from './hooks/useOAuthCallback';
export { ProtectedRoute } from './components/ProtectedRoute';

export type {
  User,
  UserRole,
  AppType,
  AuthConfig,
  AuthContextType,
  RestoreFlowContextResult,
} from './types';
