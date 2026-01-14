/**
 * Projection Registry - Centralized Projection Definitions
 * 
 * Risk Mitigation: Prevents Projection Explosion
 * All projections MUST be registered here with metadata.
 * 
 * Naming Convention: <Entity><Screen><Context>ProjectionDTO
 */

// ==============================================================================
// LAYER 1: Projection Cost Classification
// ==============================================================================

export type ProjectionCost = 'cheap' | 'medium' | 'heavy';

export interface ProjectionMetadata {
  /** Unique identifier for the projection */
  id: string;
  /** Entity this projection is based on */
  entity: string;
  /** Screen(s) where this projection is used */
  screens: string[];
  /** Roles that can access this projection */
  roles: ('public' | 'user' | 'saksbehandler' | 'admin' | 'tenantAdmin')[];
  /** Computational cost (affects cache strategy) */
  cost: ProjectionCost;
  /** Recommended cache TTL class */
  cacheTtl: 'short' | 'medium' | 'long' | 'static';
  /** Whether this projection includes nested relations */
  hasRelations: boolean;
  /** Estimated payload size in KB */
  estimatedSize: number;
}

// ==============================================================================
// LAYER 2: Projection Registry
// ==============================================================================

export const projectionRegistry: Record<string, ProjectionMetadata> = {
  // ============================================================================
  // LISTING PROJECTIONS
  // ============================================================================
  
  'ListingCardProjectionDTO': {
    id: 'ListingCardProjectionDTO',
    entity: 'Listing',
    screens: ['SearchResults', 'FeaturedListings', 'CategoryGrid', 'MapView'],
    roles: ['public', 'user', 'saksbehandler', 'admin', 'tenantAdmin'],
    cost: 'cheap',
    cacheTtl: 'medium',
    hasRelations: false,
    estimatedSize: 2,
  },
  
  'ListingDetailsProjectionDTO': {
    id: 'ListingDetailsProjectionDTO',
    entity: 'Listing',
    screens: ['ListingDetailPage', 'BookingModal'],
    roles: ['public', 'user', 'saksbehandler', 'admin', 'tenantAdmin'],
    cost: 'medium',
    cacheTtl: 'medium',
    hasRelations: true,
    estimatedSize: 15,
  },
  
  'ListingAdminProjectionDTO': {
    id: 'ListingAdminProjectionDTO',
    entity: 'Listing',
    screens: ['ListingWizard', 'ListingEditForm', 'AdminListingList'],
    roles: ['admin', 'tenantAdmin'],
    cost: 'medium',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 20,
  },
  
  'ListingCalendarProjectionDTO': {
    id: 'ListingCalendarProjectionDTO',
    entity: 'Listing',
    screens: ['AvailabilityCalendar', 'AllocationPlanner'],
    roles: ['public', 'user', 'saksbehandler', 'admin'],
    cost: 'heavy',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 50,
  },

  // ============================================================================
  // BOOKING PROJECTIONS
  // ============================================================================
  
  'BookingCardProjectionDTO': {
    id: 'BookingCardProjectionDTO',
    entity: 'Booking',
    screens: ['MyBookings', 'OrgBookings', 'RecentBookings'],
    roles: ['user', 'saksbehandler', 'admin'],
    cost: 'cheap',
    cacheTtl: 'short',
    hasRelations: false,
    estimatedSize: 3,
  },
  
  'BookingDetailsProjectionDTO': {
    id: 'BookingDetailsProjectionDTO',
    entity: 'Booking',
    screens: ['BookingDetailPage', 'BookingModal', 'ApprovalDrawer'],
    roles: ['user', 'saksbehandler', 'admin'],
    cost: 'medium',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 10,
  },
  
  'BookingQuoteProjectionDTO': {
    id: 'BookingQuoteProjectionDTO',
    entity: 'Booking',
    screens: ['BookingCheckout', 'PricePreview'],
    roles: ['public', 'user'],
    cost: 'heavy',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 5,
  },
  
  'ApprovalQueueItemProjectionDTO': {
    id: 'ApprovalQueueItemProjectionDTO',
    entity: 'Booking',
    screens: ['WorkQueue', 'ApprovalDashboard'],
    roles: ['saksbehandler', 'admin'],
    cost: 'medium',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 8,
  },

  // ============================================================================
  // ORGANIZATION PROJECTIONS
  // ============================================================================
  
  'OrganizationCardProjectionDTO': {
    id: 'OrganizationCardProjectionDTO',
    entity: 'Organization',
    screens: ['OrgSelector', 'OrgList'],
    roles: ['user', 'admin'],
    cost: 'cheap',
    cacheTtl: 'medium',
    hasRelations: false,
    estimatedSize: 2,
  },
  
  'OrganizationDetailsProjectionDTO': {
    id: 'OrganizationDetailsProjectionDTO',
    entity: 'Organization',
    screens: ['OrgDashboard', 'OrgSettings'],
    roles: ['user', 'admin'],
    cost: 'medium',
    cacheTtl: 'medium',
    hasRelations: true,
    estimatedSize: 12,
  },
  
  'OrgMemberProjectionDTO': {
    id: 'OrgMemberProjectionDTO',
    entity: 'Organization',
    screens: ['MembersList', 'MemberManagement'],
    roles: ['user', 'admin'],
    cost: 'cheap',
    cacheTtl: 'medium',
    hasRelations: false,
    estimatedSize: 3,
  },

  // ============================================================================
  // CONFIG PROJECTIONS (Admin)
  // ============================================================================
  
  'PriceGroupProjectionDTO': {
    id: 'PriceGroupProjectionDTO',
    entity: 'PriceGroup',
    screens: ['PricingRules', 'UserGroupEditor'],
    roles: ['admin', 'tenantAdmin'],
    cost: 'cheap',
    cacheTtl: 'long',
    hasRelations: false,
    estimatedSize: 5,
  },
  
  'SeasonProjectionDTO': {
    id: 'SeasonProjectionDTO',
    entity: 'Season',
    screens: ['SeasonManager', 'SeasonApplications', 'AllocationPlanner'],
    roles: ['admin', 'saksbehandler'],
    cost: 'medium',
    cacheTtl: 'long',
    hasRelations: true,
    estimatedSize: 10,
  },
  
  'LIAConfigProjectionDTO': {
    id: 'LIAConfigProjectionDTO',
    entity: 'LIAConfig',
    screens: ['IntegrationSettings', 'LIADashboard'],
    roles: ['admin', 'tenantAdmin'],
    cost: 'medium',
    cacheTtl: 'long',
    hasRelations: true,
    estimatedSize: 8,
  },

  // ============================================================================
  // AUDIT PROJECTIONS
  // ============================================================================
  
  'AuditLogProjectionDTO': {
    id: 'AuditLogProjectionDTO',
    entity: 'AuditLog',
    screens: ['AuditLogViewer', 'TenantAuditLog', 'AuditTimeline'],
    roles: ['admin', 'tenantAdmin'],
    cost: 'heavy',
    cacheTtl: 'short',
    hasRelations: false,
    estimatedSize: 100,
  },

  // ============================================================================
  // BILLING PROJECTIONS
  // ============================================================================
  
  'InvoiceProjectionDTO': {
    id: 'InvoiceProjectionDTO',
    entity: 'Invoice',
    screens: ['BillingPage', 'OrgInvoices', 'InvoiceDetail'],
    roles: ['user', 'admin'],
    cost: 'cheap',
    cacheTtl: 'medium',
    hasRelations: false,
    estimatedSize: 4,
  },
  
  'BillingSummaryProjectionDTO': {
    id: 'BillingSummaryProjectionDTO',
    entity: 'Billing',
    screens: ['BillingDashboard', 'OrgBillingOverview'],
    roles: ['user', 'admin'],
    cost: 'medium',
    cacheTtl: 'short',
    hasRelations: true,
    estimatedSize: 6,
  },
};

// ==============================================================================
// LAYER 3: Projection Helpers
// ==============================================================================

/**
 * Get all projections for a given entity
 */
export function getProjectionsForEntity(entity: string): ProjectionMetadata[] {
  return Object.values(projectionRegistry).filter(p => p.entity === entity);
}

/**
 * Get all projections for a given screen
 */
export function getProjectionsForScreen(screen: string): ProjectionMetadata[] {
  return Object.values(projectionRegistry).filter(p => p.screens.includes(screen));
}

/**
 * Get all projections accessible by a role
 */
export function getProjectionsForRole(
  role: 'public' | 'user' | 'saksbehandler' | 'admin' | 'tenantAdmin'
): ProjectionMetadata[] {
  return Object.values(projectionRegistry).filter(p => p.roles.includes(role));
}

/**
 * Get recommended cache config based on projection cost
 */
export function getCacheConfigForProjection(projectionId: string): {
  staleTime: number;
  gcTime: number;
} {
  const projection = projectionRegistry[projectionId];
  if (!projection) {
    return { staleTime: 30_000, gcTime: 300_000 };
  }
  
  const configs = {
    short: { staleTime: 10_000, gcTime: 60_000 },
    medium: { staleTime: 60_000, gcTime: 300_000 },
    long: { staleTime: 300_000, gcTime: 600_000 },
    static: { staleTime: 600_000, gcTime: 3600_000 },
  };
  
  return configs[projection.cacheTtl];
}

/**
 * Validate projection payload size
 */
export function isWithinPayloadBudget(
  projectionId: string,
  actualSizeKb: number
): boolean {
  const projection = projectionRegistry[projectionId];
  if (!projection) return true;
  
  // Allow 50% over estimate before warning
  return actualSizeKb <= projection.estimatedSize * 1.5;
}

/**
 * Get projection cost classification
 */
export function getProjectionCost(projectionId: string): ProjectionCost {
  return projectionRegistry[projectionId]?.cost ?? 'medium';
}
