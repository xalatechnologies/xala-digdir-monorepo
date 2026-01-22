/**
 * @digilist/runtime - Config Module
 *
 * Domain-specific configuration for the Digilist rental booking platform.
 * This module automatically registers Digilist app profiles on import.
 *
 * @example
 * ```typescript
 * // Option 1: Import entire package (triggers registration)
 * import '@digilist/runtime';
 *
 * // Option 2: Import config submodule directly
 * import '@digilist/runtime/config';
 *
 * // Then use the config API
 * import { getAppProfile, createAppConfig, validateEnv } from '@digilist/runtime';
 * const env = validateEnv(import.meta.env);
 * const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
 * ```
 */

import { registerAppProfiles } from './app-profile';
import { digilistProfiles } from './digilist-profiles';

// ============================================================================
// Auto-Registration (Side Effect)
// ============================================================================

/**
 * Register Digilist profiles on module load.
 * This is a side-effect import - just importing this module registers profiles.
 */
registerAppProfiles(digilistProfiles);

// ============================================================================
// Exports
// ============================================================================

// App Profile types and registry
export type { AppProfile, AuthConfig } from './app-profile';
export { registerAppProfiles, getAppProfile, getAllProfiles } from './app-profile';

// Environment validation
export type { ValidatedEnv } from './env-validation';
export { validateEnv } from './env-validation';

// App config factory
export type { SDKConfig, RuntimeConfig, AppConfig } from './app-config';
export { createAppConfig } from './app-config';

// Types
export type { DigilistAppType, DigilistThemeId } from './types';
export { isDigilistAppType, isDigilistThemeId } from './types';

// Profiles (for direct access if needed)
export {
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
  digilistProfiles,
  digilistProfilesRecord,
} from './digilist-profiles';
