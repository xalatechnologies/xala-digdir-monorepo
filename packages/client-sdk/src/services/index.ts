/**
 * Services Index
 * Exports all service instances and classes
 * Types are exported from ./types folder
 *
 * This file maintains backward compatibility by re-exporting from both:
 * - platform-services (domain-agnostic infrastructure services)
 * - domain-services (Digilist-specific business domain services)
 *
 * For new code, prefer importing directly from:
 * - @digilist/client-sdk/platform-services (or @xalatechnologies/platform/sdk)
 * - @digilist/client-sdk/domain-services (or @digilist/sdk)
 */

// =============================================================================
// Base Service (shared)
// =============================================================================
export { BaseService } from './base.service';

// =============================================================================
// Re-export Platform Services (domain-agnostic)
// =============================================================================
export * from '../platform-services';

// =============================================================================
// Re-export Domain Services (Digilist-specific)
// =============================================================================
export * from '../domain-services';

// =============================================================================
// Additional Services not in platform or domain split
// =============================================================================

// Profile Service (user profile management - could be platform)
export { profileService } from './profile.service';

// User Groups (organization-level groups - could be platform)
export { userGroupService } from './user-group.service';
export { userGroupsService } from './user-groups.service';

// Simple Integrations service (legacy)
export { integrationsService } from './integrations.service';
export type { Integration, IntegrationUpdate, IntegrationTestResult } from './integrations.service';

// Accessibility Monitoring (could be platform)
export { accessibilityMonitoringService } from './accessibilityMonitoringService';

// =============================================================================
// Legacy Re-exports for Backward Compatibility
// =============================================================================

// These are re-exported with original names for existing code that imports them
// New code should use the platform-services or domain-services exports

// Integration service re-exports (already in platform-services but with aliases)
export {
  SettingsService as IntegrationSettingsService,
  RcoService,
  VismaService,
  BrregService,
  NifService,
  VippsService,
  CalendarSyncService,
  settingsService as integrationSettingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService,
} from './integration.service';
