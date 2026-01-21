/**
 * @digilist/ui - Domain Blocks
 *
 * Domain-specific business components for the Digilist rental booking platform.
 */

// Export all domain block categories
export * from './rental-objects';
export * from './booking';
export * from './seasons';

// =============================================================================
// Detail Page Components (Re-exports from Platform)
// =============================================================================
// These components are domain-agnostic but commonly used in rental object
// detail pages. They are re-exported here for backward compatibility.
//
// @deprecated Import from @xalatechnologies/platform/ui instead.

export * from './detail';

// Note: Additional domain-specific block categories can be added:
// - notifications (Digilist-specific notification components)
// - admin (Digilist-specific admin components)
// - dashboard (Digilist-specific dashboard components)
