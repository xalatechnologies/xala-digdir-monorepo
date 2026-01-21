/**
 * Auth Module - Platform SDK
 *
 * Authentication services for the platform.
 * Includes demo login, OAuth, and ID-porten (BankID) authentication.
 *
 * @example
 * import { authService, idportenService } from '@xalatechnologies/platform/sdk';
 *
 * // Demo login
 * const session = await authService.loginWithDemoToken('demo-token-123');
 *
 * // BankID login
 * idportenService.authorize('/dashboard');
 */

// Types
export type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  EmailLoginCredentials,
  OAuthProvider,
  RequireAuthOptions,
  RequireAuthResult,
  ResumeFlowResult,
  IdPortenConfig,
  IdPortenUser,
  IdPortenTokens,
  IdPortenAuthResult,
  IdPortenLogoutResult,
} from './types';

// Services
export { authService } from './auth.service';
export { idportenService } from './idporten.service';
