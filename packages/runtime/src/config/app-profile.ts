/**
 * @digilist/runtime - App Profile Types
 *
 * Local definition of AppProfile to remove dependency on deleted platform package.
 */

// ============================================================================
// App Profile Types
// ============================================================================

export interface AuthConfig {
  loginPath: string;
  debug: boolean;
  sessionCheckInterval: number;
  requireAuth: boolean;
}

export interface AppProfile {
  appType: string;
  displayName: string;
  description: string;
  defaultPort: number;
  locale: string;
  theme: string;
  colorScheme: 'auto' | 'light' | 'dark';
  authConfig: AuthConfig;
  featureFlags: Record<string, boolean>;
}

// ============================================================================
// Profile Registry
// ============================================================================

const profileRegistry = new Map<string, AppProfile>();

/**
 * Register app profiles with the registry
 */
export function registerAppProfiles(profiles: AppProfile[]): void {
  for (const profile of profiles) {
    profileRegistry.set(profile.appType, profile);
  }
}

/**
 * Get an app profile by type
 */
export function getAppProfile(appType: string): AppProfile | undefined {
  return profileRegistry.get(appType);
}

/**
 * Get all registered profiles
 */
export function getAllProfiles(): AppProfile[] {
  return Array.from(profileRegistry.values());
}
