/**
 * Docs Feature Flag Registry
 *
 * Feature flags for controlling documentation visibility per tenant.
 * These flags should be registered in the SaaS Admin control plane.
 */

/** Feature flag keys for docs app */
export const DOCS_FEATURE_FLAGS = {
  // Master switch for entire docs app
  'docs.enabled': true,

  // Section toggles
  'docs.section.booking.enabled': true,
  'docs.section.rbac.enabled': true,
  'docs.section.payments.enabled': true,
  'docs.section.admin.enabled': true,
  'docs.section.api.enabled': true,
  'docs.section.integrations.enabled': true,
  'docs.section.faq.enabled': true,

  // Feature toggles
  'docs.search.enabled': true,
  'docs.roleGuides.enabled': true,
  'docs.releases.enabled': false, // Placeholder, initially hidden
} as const;

export type DocsFeatureFlagKey = keyof typeof DOCS_FEATURE_FLAGS;

/** Map section ID to feature flag key */
export const SECTION_FLAG_MAP: Record<string, DocsFeatureFlagKey> = {
  booking: 'docs.section.booking.enabled',
  rbac: 'docs.section.rbac.enabled',
  payments: 'docs.section.payments.enabled',
  admin: 'docs.section.admin.enabled',
  api: 'docs.section.api.enabled',
  integrations: 'docs.section.integrations.enabled',
  faq: 'docs.section.faq.enabled',
};

/**
 * Check if a section is enabled based on feature flags
 * @param sectionId - The section identifier
 * @param flags - Feature flags object from SDK
 */
export function isSectionEnabled(
  sectionId: string,
  flags: Record<string, boolean>
): boolean {
  // First check if docs app is enabled
  if (!flags['docs.enabled']) {
    return false;
  }

  // Then check section-specific flag
  const flagKey = SECTION_FLAG_MAP[sectionId];
  if (!flagKey) {
    return true; // Unknown sections are visible by default
  }

  return flags[flagKey] !== false;
}
