/**
 * Auth Configuration Module
 * Centralized authentication configuration for all apps
 */

export type { AuthProvider, AuthProviderId, AppAuthConfig, ProviderAvailability } from './types';

export {
  idportenProvider,
  vippsProvider,
  microsoftProvider,
  demoProvider,
  ALL_PROVIDERS,
  getProvider,
  getEnabledProviders,
} from './providers';

export {
  webAuthConfig,
  minsideAuthConfig,
  backofficeAuthConfig,
  saasAdminAuthConfig,
  getAppAuthConfig,
} from './apps';
