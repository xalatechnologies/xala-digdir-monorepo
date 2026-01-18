/**
 * Auth Provider Definitions
 * Centralized provider configurations used across all apps
 */

import type { AuthProvider } from './types';

/**
 * ID-porten (Norwegian national ID provider)
 * Used for BankID, MinID, etc.
 */
export const idportenProvider: AuthProvider = {
  id: 'idporten',
  name: 'ID-porten',
  description: 'Personlig innlogging med BankID eller MinID',
  enabled: true,
  authorizeEndpoint: '/api/auth/idporten/authorize',
};

/**
 * Vipps (Norwegian payment/auth provider)
 * Currently disabled pending integration
 */
export const vippsProvider: AuthProvider = {
  id: 'vipps',
  name: 'Vipps',
  description: 'Logg inn med Vipps',
  enabled: false,
  authorizeEndpoint: '/api/auth/vipps/authorize',
};

/**
 * Microsoft (Azure AD / Entra ID)
 * For organizational SSO
 */
export const microsoftProvider: AuthProvider = {
  id: 'microsoft',
  name: 'Microsoft',
  description: 'Logg inn med Microsoft-konto',
  enabled: false,
  authorizeEndpoint: '/api/auth/microsoft/authorize',
};

/**
 * Demo login (development/testing)
 * Allows login with demo token
 */
export const demoProvider: AuthProvider = {
  id: 'demo',
  name: 'Demo Innlogging',
  description: 'Logg inn med demo-token (kun for testing)',
  enabled: true,
};

/**
 * All available providers
 */
export const ALL_PROVIDERS: Record<string, AuthProvider> = {
  idporten: idportenProvider,
  vipps: vippsProvider,
  microsoft: microsoftProvider,
  demo: demoProvider,
};

/**
 * Get provider by ID
 */
export function getProvider(id: string): AuthProvider | undefined {
  return ALL_PROVIDERS[id];
}

/**
 * Get enabled providers from list
 */
export function getEnabledProviders(providers: AuthProvider[]): AuthProvider[] {
  return providers.filter(p => p.enabled);
}
