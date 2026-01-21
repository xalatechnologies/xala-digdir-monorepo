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
 * // Then use the generic API from @xala/config
 * import { getAppProfile, createAppConfig } from '@xalatechnologies/platform/config';
 * const profile = getAppProfile('backoffice');
 * ```
 */

import { registerAppProfiles } from '@xalatechnologies/platform/config';
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
