/**
 * @digilist/runtime - Config Types
 *
 * Domain-specific type definitions for Digilist applications.
 * These types are specific to the Digilist rental booking platform.
 */

// ============================================================================
// Digilist-Specific App Types
// ============================================================================

/**
 * Digilist application types
 *
 * - web: Public booking portal (port 5173)
 * - minside: Citizen self-service portal (port 5174)
 * - backoffice: Tenant admin panel (port 5175)
 * - saas-admin: Platform administration (port 5177)
 * - monitoring: Observability dashboard (port 5178)
 * - docs-learning: Documentation portal (port 5179)
 */
export type DigilistAppType =
  | 'web'
  | 'minside'
  | 'backoffice'
  | 'saas-admin'
  | 'monitoring'
  | 'docs-learning';

/**
 * Digilist theme identifiers
 */
export type DigilistThemeId = 'digilist' | 'altinn';

/**
 * Type guard to check if a string is a valid DigilistAppType
 */
export function isDigilistAppType(appType: string): appType is DigilistAppType {
  return [
    'web',
    'minside',
    'backoffice',
    'saas-admin',
    'monitoring',
    'docs-learning',
  ].includes(appType);
}

/**
 * Type guard to check if a string is a valid DigilistThemeId
 */
export function isDigilistThemeId(themeId: string): themeId is DigilistThemeId {
  return ['digilist', 'altinn'].includes(themeId);
}
