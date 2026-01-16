/**
 * Content Registry
 *
 * Maps route paths to their corresponding MDX content modules.
 * This allows DocRoutePage to dynamically load the correct MDX content
 * based on the current route.
 */

import type { ComponentType } from 'react';

// Lazy-load MDX content to improve initial load performance
// Roles section
const CitizenContent = () => import('./roles/citizen.mdx');
const OrgMemberContent = () => import('./roles/org-member.mdx');
const CaseworkerContent = () => import('./roles/caseworker.mdx');

// Platform section
const FeatureFlagsContent = () => import('./platform/feature-flags.mdx');
const AuditLoggingContent = () => import('./platform/audit-logging.mdx');

// Seeding section
const DemoSeedsContent = () => import('./seeding/demo-seeds.mdx');

// Integrations section
const VippsContent = () => import('./integrations/vipps.mdx');

/**
 * Content loader type - returns a promise that resolves to an MDX module
 */
type ContentLoader = () => Promise<{ default: ComponentType }>;

/**
 * Route to content mapping
 *
 * Maps URL paths to their MDX content loaders.
 * When adding new MDX pages, add the mapping here.
 */
export const contentRegistry: Record<string, ContentLoader> = {
  // Roles
  '/roles/citizen': CitizenContent,
  '/roles/org-member': OrgMemberContent,
  '/roles/caseworker': CaseworkerContent,

  // Platform
  '/platform/feature-flags': FeatureFlagsContent,
  '/platform/audit-logging': AuditLoggingContent,

  // Seeding
  '/seeding/demo-seeds': DemoSeedsContent,

  // Integrations
  '/integrations/vipps': VippsContent,
};

/**
 * Check if a route has MDX content
 */
export function hasContent(path: string): boolean {
  return path in contentRegistry;
}

/**
 * Get the content loader for a route
 */
export function getContentLoader(path: string): ContentLoader | undefined {
  return contentRegistry[path];
}
