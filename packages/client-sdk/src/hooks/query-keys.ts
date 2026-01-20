/**
 * Query Keys Factory
 * Single Responsibility: Centralized query key management
 * Enables proper cache invalidation and prefetching
 */

import type {
  RentalObjectQueryParams,
  AvailabilityQueryParams,
  PublicRentalObjectParams,
} from '../types/rental-object';
import type { BookingQueryParams } from '../types/booking';
import type { ReportQueryParams, AuditQueryParams } from '../types/additional';
import type { ReviewQueryParams } from '../types/review';
import type { EconomyQueryParams } from '../types/economy';
import type { SearchParams, TypeaheadParams, SavedFilterQueryParams, RecentSearchQueryParams } from '../types/search';
import type { DiscountCodeQueryParams, ValidateDiscountCodeDTO } from '../types/additional';

/**
 * Strongly-typed query key factory
 * Follows the pattern: [domain, scope, ...params]
 */
export const queryKeys = {
  // =========================================================================
  // Auth Keys
  // =========================================================================
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    providers: () => [...queryKeys.auth.all, 'providers'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // =========================================================================
  // Economy Keys
  // =========================================================================
  economy: {
    all: ['economy'] as const,
    invoiceBases: {
      all: () => [...queryKeys.economy.all, 'invoiceBases'] as const,
      lists: () => [...queryKeys.economy.invoiceBases.all(), 'list'] as const,
      list: (params?: EconomyQueryParams) => [...queryKeys.economy.invoiceBases.lists(), params] as const,
      detail: (id: string) => [...queryKeys.economy.invoiceBases.all(), 'detail', id] as const,
    },
    salesDocuments: {
      all: () => [...queryKeys.economy.all, 'salesDocuments'] as const,
      lists: () => [...queryKeys.economy.salesDocuments.all(), 'list'] as const,
      list: (params?: EconomyQueryParams) => [...queryKeys.economy.salesDocuments.lists(), params] as const,
      detail: (id: string) => [...queryKeys.economy.salesDocuments.all(), 'detail', id] as const,
      vismaStatus: (salesDocumentId: string) => [...queryKeys.economy.salesDocuments.all(), 'vismaStatus', salesDocumentId] as const,
    },
    creditNotes: {
      all: () => [...queryKeys.economy.all, 'creditNotes'] as const,
      lists: () => [...queryKeys.economy.creditNotes.all(), 'list'] as const,
      list: (params?: EconomyQueryParams) => [...queryKeys.economy.creditNotes.lists(), params] as const,
      detail: (id: string) => [...queryKeys.economy.creditNotes.all(), 'detail', id] as const,
    },
    statistics: (params?: { startDate?: string; endDate?: string }) => [...queryKeys.economy.all, 'statistics', params] as const,
  },

  // =========================================================================
  // Search Keys
  // =========================================================================
  search: {
    all: ['search'] as const,
    results: (params: SearchParams) => [...queryKeys.search.all, 'results', params] as const,
    typeahead: (params: TypeaheadParams) => [...queryKeys.search.all, 'typeahead', params] as const,
    recent: (params?: RecentSearchQueryParams) => [...queryKeys.search.all, 'recent', params] as const,
    savedFilters: {
      all: () => [...queryKeys.search.all, 'savedFilters'] as const,
      lists: () => [...queryKeys.search.savedFilters.all(), 'list'] as const,
      list: (params?: SavedFilterQueryParams) => [...queryKeys.search.savedFilters.lists(), params] as const,
      detail: (id: string) => [...queryKeys.search.savedFilters.all(), 'detail', id] as const,
    },
  },


  // =========================================================================
  // Rental Object Keys (primary)
  // =========================================================================
  rentalObjects: {
    all: ['rental-objects'] as const,
    lists: () => [...queryKeys.rentalObjects.all, 'list'] as const,
    list: (params?: RentalObjectQueryParams) => [...queryKeys.rentalObjects.lists(), params] as const,
    details: () => [...queryKeys.rentalObjects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rentalObjects.details(), id] as const,
    slug: (slug: string) => [...queryKeys.rentalObjects.all, 'slug', slug] as const,
    availability: (id: string, params: AvailabilityQueryParams) => 
      [...queryKeys.rentalObjects.detail(id), 'availability', params] as const,
    stats: (id: string) => [...queryKeys.rentalObjects.detail(id), 'stats'] as const,
    calendarConfig: (id: string) => [...queryKeys.rentalObjects.detail(id), 'calendar-config'] as const,
  },

  // =========================================================================
  // Public Keys (No Auth)
  // =========================================================================
  public: {
    all: ['public'] as const,
    rentalObjects: (params?: PublicRentalObjectParams) => [...queryKeys.public.all, 'rental-objects', params] as const,
    rentalObject: (id: string) => [...queryKeys.public.all, 'rental-object', id] as const,
    availability: (rentalObjectId: string, params: AvailabilityQueryParams) =>
      [...queryKeys.public.all, 'availability', rentalObjectId, params] as const,
    categories: () => [...queryKeys.public.all, 'categories'] as const,
    cities: () => [...queryKeys.public.all, 'cities'] as const,
    municipalities: () => [...queryKeys.public.all, 'municipalities'] as const,
    featured: () => [...queryKeys.public.all, 'featured'] as const,
  },

  // =========================================================================
  // Booking Keys
  // =========================================================================
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (params?: BookingQueryParams) => [...queryKeys.bookings.lists(), params] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    my: (params?: BookingQueryParams) => [...queryKeys.bookings.all, 'my', params] as const,
    recurring: () => [...queryKeys.bookings.all, 'recurring'] as const,
    recurringPreview: (hash: string) => [...queryKeys.bookings.all, 'recurringPreview', hash] as const,
    pricing: (rentalObjectId: string, start: string, end: string) =>
      [...queryKeys.bookings.all, 'pricing', rentalObjectId, start, end] as const,
    paymentReconciliation: (params?: { startDate?: string; endDate?: string; status?: string; provider?: string }) =>
      [...queryKeys.bookings.all, 'paymentReconciliation', params] as const,
    paymentHistory: (bookingId: string) =>
      [...queryKeys.bookings.all, 'paymentHistory', bookingId] as const,
  },

  // =========================================================================
  // Calendar Keys
  // =========================================================================
  calendar: {
    all: ['calendar'] as const,
    events: (params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) =>
      [...queryKeys.calendar.all, 'events', params] as const,
    slots: (params: { rentalObjectId: string; date: string; duration?: number }) =>
      [...queryKeys.calendar.all, 'slots', params] as const,
    config: (rentalObjectId: string, params?: any) =>
      [...queryKeys.calendar.all, 'config', rentalObjectId, params] as const,
    availabilityMatrix: (rentalObjectId: string, params: { from: string; to: string; bookingType?: string }) =>
      [...queryKeys.calendar.all, 'availabilityMatrix', rentalObjectId, params] as const,
  },

  // =========================================================================
  // Allocation Keys
  // =========================================================================
  allocations: {
    all: ['allocations'] as const,
    list: (params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) =>
      [...queryKeys.allocations.all, 'list', params] as const,
  },

  // =========================================================================
  // Organization Keys
  // =========================================================================
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...queryKeys.organizations.all, 'list'] as const,
    list: (params?: { status?: string; search?: string }) => 
      [...queryKeys.organizations.lists(), params] as const,
    details: () => [...queryKeys.organizations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
    members: (id: string) => [...queryKeys.organizations.detail(id), 'members'] as const,
  },

  // =========================================================================
  // User Keys
  // =========================================================================
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params?: { role?: string; status?: string; search?: string }) =>
      [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    consents: () => [...queryKeys.users.me(), 'consents'] as const,
    
    // Admin user management
    byOrganization: (organizationId: string) => [...queryKeys.users.all, 'byOrg', organizationId] as const,
    byTenant: (tenantId: string) => [...queryKeys.users.all, 'byTenant', tenantId] as const,
    stats: () => [...queryKeys.users.all, 'stats'] as const,
    search: (searchTerm: string) => [...queryKeys.users.all, 'search', searchTerm] as const,
  },

  // =========================================================================
  // Favorites Keys
  // =========================================================================
  favorites: {
    all: ['favorites'] as const,
    lists: () => [...queryKeys.favorites.all, 'list'] as const,
    list: (params?: { page?: number; limit?: number; tag?: string; categoryKey?: string }) =>
      [...queryKeys.favorites.lists(), params] as const,
    details: () => [...queryKeys.favorites.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.favorites.details(), id] as const,
    isFavorited: (rentalObjectId: string) => [...queryKeys.favorites.all, 'isFavorited', rentalObjectId] as const,
    count: () => [...queryKeys.favorites.all, 'count'] as const,
  },

  // =========================================================================
  // Pricing Keys
  // =========================================================================
  pricing: {
    all: ['pricing'] as const,
    groups: {
      all: () => [...queryKeys.pricing.all, 'groups'] as const,
      lists: () => [...queryKeys.pricing.groups.all(), 'list'] as const,
      list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
        [...queryKeys.pricing.groups.lists(), params] as const,
      details: () => [...queryKeys.pricing.groups.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.pricing.groups.details(), id] as const,
      active: () => [...queryKeys.pricing.groups.all(), 'active'] as const,
    },
    rentalObject: (rentalObjectId: string) => [...queryKeys.pricing.all, 'rentalObject', rentalObjectId] as const,
    variations: (rentalObjectId: string) => [...queryKeys.pricing.all, 'variations', rentalObjectId] as const,
    userGroup: (userId?: string) => [...queryKeys.pricing.all, 'userGroup', userId] as const,
    groupMembers: (groupId: string) => [...queryKeys.pricing.all, 'groupMembers', groupId] as const,
  },

  // =========================================================================
  // Conversation Keys
  // =========================================================================
  conversations: {
    all: ['conversations'] as const,
    lists: () => [...queryKeys.conversations.all, 'list'] as const,
    list: (params?: { status?: string; unreadOnly?: boolean }) =>
      [...queryKeys.conversations.lists(), params] as const,
    details: () => [...queryKeys.conversations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
    messages: (id: string, params?: { page?: number }) =>
      [...queryKeys.conversations.detail(id), 'messages', params] as const,
  },

  // =========================================================================
  // Dashboard & Report Keys
  // =========================================================================
  dashboard: {
    all: ['dashboard'] as const,
    kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
  },

  reports: {
    all: ['reports'] as const,
    usage: (params: ReportQueryParams) => [...queryKeys.reports.all, 'usage', params] as const,
    revenue: (params: ReportQueryParams) => [...queryKeys.reports.all, 'revenue', params] as const,
    bookings: (params: ReportQueryParams) => [...queryKeys.reports.all, 'bookings', params] as const,
  },

  // =========================================================================
  // Audit Keys
  // =========================================================================
  audit: {
    all: ['audit'] as const,
    lists: () => [...queryKeys.audit.all, 'list'] as const,
    list: (params?: AuditQueryParams) => [...queryKeys.audit.lists(), params] as const,
    detail: (id: string) => [...queryKeys.audit.all, 'detail', id] as const,
    stats: () => [...queryKeys.audit.all, 'stats'] as const,
    resource: (resource: string, params?: Omit<AuditQueryParams, 'resource'>) =>
      [...queryKeys.audit.all, 'resource', resource, params] as const,
    user: (userId: string, params?: Omit<AuditQueryParams, 'userId'>) =>
      [...queryKeys.audit.all, 'user', userId, params] as const,
  },

  // =========================================================================
  // Notification Keys
  // =========================================================================
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
      [...queryKeys.notifications.lists(), params] as const,
    my: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
      [...queryKeys.notifications.all, 'my', params] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    deliveryStatus: (id: string) => [...queryKeys.notifications.all, 'deliveryStatus', id] as const,
    deliveryReports: (params?: any) => [...queryKeys.notifications.all, 'deliveryReports', params] as const,
  },

  // =========================================================================
  // Push Notification Keys
  // =========================================================================
  pushNotifications: {
    all: ['pushNotifications'] as const,
    subscriptions: () => [...queryKeys.pushNotifications.all, 'subscriptions'] as const,
    preferences: () => [...queryKeys.pushNotifications.all, 'preferences'] as const,
  },

  // =========================================================================
  // Discount Code Keys
  // =========================================================================
  discountCodes: {
    all: ['discountCodes'] as const,
    lists: () => [...queryKeys.discountCodes.all, 'list'] as const,
    list: (params?: DiscountCodeQueryParams) =>
      [...queryKeys.discountCodes.lists(), params] as const,
    details: () => [...queryKeys.discountCodes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.discountCodes.details(), id] as const,
    byCode: (code: string) => [...queryKeys.discountCodes.all, 'byCode', code] as const,
    validate: (data: ValidateDiscountCodeDTO) => [...queryKeys.discountCodes.all, 'validate', data] as const,
    stats: (id: string) => [...queryKeys.discountCodes.all, 'stats', id] as const,
  },

  // =========================================================================
  // Review Keys
  // =========================================================================
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (params?: ReviewQueryParams) => [...queryKeys.reviews.lists(), params] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    byRentalObject: (rentalObjectId: string, params?: Omit<ReviewQueryParams, 'rentalObjectId'>) =>
      [...queryKeys.reviews.all, 'byRentalObject', rentalObjectId, params] as const,
    byUser: (userId: string, params?: Omit<ReviewQueryParams, 'userId'>) =>
      [...queryKeys.reviews.all, 'byUser', userId, params] as const,
    stats: (rentalObjectId: string) => [...queryKeys.reviews.all, 'stats', rentalObjectId] as const,
  },

  // =========================================================================
  // RBAC Keys
  // =========================================================================
  rbac: {
    all: ['rbac'] as const,
    capabilities: () => [...queryKeys.rbac.all, 'capabilities'] as const,
    roles: () => [...queryKeys.rbac.all, 'roles'] as const,
    roleMatrix: () => [...queryKeys.rbac.all, 'roleMatrix'] as const,
    userCapabilities: (userId: string) => [...queryKeys.rbac.all, 'userCapabilities', userId] as const,
  },

  // =========================================================================
  // Access Grant Keys
  // =========================================================================
  accessGrants: {
    all: ['accessGrants'] as const,
    lists: () => [...queryKeys.accessGrants.all, 'list'] as const,
    list: (params?: { orgId?: string; rentalObjectId?: string; status?: string }) =>
      [...queryKeys.accessGrants.lists(), params] as const,
    details: () => [...queryKeys.accessGrants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.accessGrants.details(), id] as const,
    byOrganization: (orgId: string) => [...queryKeys.accessGrants.all, 'byOrg', orgId] as const,
    byRentalObject: (rentalObjectId: string) => [...queryKeys.accessGrants.all, 'byRO', rentalObjectId] as const,
  },

  // =========================================================================
  // Permission Assignment Keys
  // =========================================================================
  permissionAssignments: {
    all: ['permissionAssignments'] as const,
    lists: () => [...queryKeys.permissionAssignments.all, 'list'] as const,
    list: (params?: { orgId?: string; userId?: string; rentalObjectId?: string }) =>
      [...queryKeys.permissionAssignments.lists(), params] as const,
    details: () => [...queryKeys.permissionAssignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.permissionAssignments.details(), id] as const,
    byOrganization: (orgId: string) => [...queryKeys.permissionAssignments.all, 'byOrg', orgId] as const,
    byUser: (userId: string) => [...queryKeys.permissionAssignments.all, 'byUser', userId] as const,
    byRentalObject: (orgId: string, rentalObjectId: string) =>
      [...queryKeys.permissionAssignments.all, 'byRO', orgId, rentalObjectId] as const,
    forOrgRentalObject: (orgId: string, rentalObjectId: string, userId?: string) =>
      [...queryKeys.permissionAssignments.all, 'orgRO', orgId, rentalObjectId, userId] as const,
    availablePermissions: () => [...queryKeys.permissionAssignments.all, 'availablePermissions'] as const,
  },

  // =========================================================================
  // Case Handler Scope Keys
  // =========================================================================
  caseHandlerScopes: {
    all: ['caseHandlerScopes'] as const,
    lists: () => [...queryKeys.caseHandlerScopes.all, 'list'] as const,
    list: (params?: { scopeType?: 'COMMUNE' | 'ORG'; orgId?: string; userId?: string }) =>
      [...queryKeys.caseHandlerScopes.lists(), params] as const,
    details: () => [...queryKeys.caseHandlerScopes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.caseHandlerScopes.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.caseHandlerScopes.all, 'byUser', userId] as const,
    byRentalObject: (rentalObjectId: string) => [...queryKeys.caseHandlerScopes.all, 'byRO', rentalObjectId] as const,
  },

  // =========================================================================
  // Organization Membership Keys
  // =========================================================================
  orgMemberships: {
    all: ['orgMemberships'] as const,
    lists: () => [...queryKeys.orgMemberships.all, 'list'] as const,
    list: (params?: { orgId?: string; userId?: string; role?: string; status?: string }) =>
      [...queryKeys.orgMemberships.lists(), params] as const,
    details: () => [...queryKeys.orgMemberships.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orgMemberships.details(), id] as const,
    byOrganization: (orgId: string) => [...queryKeys.orgMemberships.all, 'byOrg', orgId] as const,
    byUser: (userId: string) => [...queryKeys.orgMemberships.all, 'byUser', userId] as const,
    myMemberships: () => [...queryKeys.orgMemberships.all, 'my'] as const,
  },

  // =========================================================================
  // Settings Keys
  // =========================================================================
  settings: {
    all: ['settings'] as const,
    tenant: () => [...queryKeys.settings.all, 'tenant'] as const,
    integrations: () => [...queryKeys.settings.all, 'integrations'] as const,
  },

  // =========================================================================
  // Integration Keys
  // =========================================================================
  integrations: {
    all: ['integrations'] as const,
    rco: {
      status: () => [...queryKeys.integrations.all, 'rco', 'status'] as const,
      locks: () => [...queryKeys.integrations.all, 'rco', 'locks'] as const,
    },
    visma: {
      status: () => [...queryKeys.integrations.all, 'visma', 'status'] as const,
      invoices: () => [...queryKeys.integrations.all, 'visma', 'invoices'] as const,
    },
    vipps: {
      status: () => [...queryKeys.integrations.all, 'vipps', 'status'] as const,
      payment: (orderId: string) => [...queryKeys.integrations.all, 'vipps', 'payment', orderId] as const,
      history: (params?: { startDate?: string; endDate?: string; status?: string }) =>
        [...queryKeys.integrations.all, 'vipps', 'history', params] as const,
    },
    brreg: {
      lookup: (orgNumber: string) => [...queryKeys.integrations.all, 'brreg', orgNumber] as const,
    },
    nif: {
      lookup: (clubId: string) => [...queryKeys.integrations.all, 'nif', clubId] as const,
    },
    calendar: {
      status: () => [...queryKeys.integrations.all, 'calendar', 'status'] as const,
    },
  },

  // =========================================================================
  // SaaS Admin Keys (Platform-wide administration)
  // =========================================================================
  saas: {
    all: ['saas:'] as const,
    me: () => [...queryKeys.saas.all, 'me'] as const,

    // Tenant management
    tenants: {
      all: () => [...queryKeys.saas.all, 'tenants'] as const,
      lists: () => [...queryKeys.saas.tenants.all(), 'list'] as const,
      list: (params?: { page?: number; limit?: number; search?: string; status?: string; planId?: string }) =>
        [...queryKeys.saas.tenants.lists(), params] as const,
      details: () => [...queryKeys.saas.tenants.all(), 'detail'] as const,
      detail: (tenantId: string) => [...queryKeys.saas.tenants.details(), tenantId] as const,
      flags: (tenantId: string) => [...queryKeys.saas.tenants.detail(tenantId), 'flags'] as const,
      billing: (tenantId: string) => [...queryKeys.saas.tenants.detail(tenantId), 'billing'] as const,
      secrets: (tenantId: string) => [...queryKeys.saas.tenants.detail(tenantId), 'secrets'] as const,
      categories: (tenantId: string) => [...queryKeys.saas.tenants.detail(tenantId), 'categories'] as const,
    },

    // Plans management
    plans: {
      all: () => [...queryKeys.saas.all, 'plans'] as const,
      lists: () => [...queryKeys.saas.plans.all(), 'list'] as const,
      list: (params?: { page?: number; limit?: number; status?: string; isPublic?: boolean }) =>
        [...queryKeys.saas.plans.lists(), params] as const,
      details: () => [...queryKeys.saas.plans.all(), 'detail'] as const,
      detail: (planId: string) => [...queryKeys.saas.plans.details(), planId] as const,
    },

    // Feature flags catalog
    featureFlags: {
      all: () => [...queryKeys.saas.all, 'featureFlags'] as const,
      catalog: (params?: { category?: string; status?: string }) =>
        [...queryKeys.saas.featureFlags.all(), 'catalog', params] as const,
    },

    // Platform-wide billing
    billing: {
      all: () => [...queryKeys.saas.all, 'billing'] as const,
      overview: () => [...queryKeys.saas.billing.all(), 'overview'] as const,
    },
  },

  // =========================================================================
  // Tenant Admin Keys (Tenant-scoped administration)
  // =========================================================================
  tenantAdmin: {
    all: ['tenantAdmin:'] as const,
    capabilities: () => [...queryKeys.tenantAdmin.all, 'capabilities'] as const,
    subscription: () => [...queryKeys.tenantAdmin.all, 'subscription'] as const,
    flags: () => [...queryKeys.tenantAdmin.all, 'flags'] as const,
    branding: () => [...queryKeys.tenantAdmin.all, 'branding'] as const,
    integrations: {
      all: () => [...queryKeys.tenantAdmin.all, 'integrations'] as const,
      list: () => [...queryKeys.tenantAdmin.integrations.all(), 'list'] as const,
      provider: (provider: string) => [...queryKeys.tenantAdmin.integrations.all(), provider] as const,
    },
  },

  // =========================================================================
  // Security Dashboard Keys
  // =========================================================================
  security: {
    all: ['security'] as const,
    overview: () => [...queryKeys.security.all, 'overview'] as const,
    threats: (params?: { severity?: string; status?: string }) => 
      [...queryKeys.security.all, 'threats', params] as const,
    auditLog: (params?: { startDate?: string; endDate?: string }) => 
      [...queryKeys.security.all, 'auditLog', params] as const,
    compliance: () => [...queryKeys.security.all, 'compliance'] as const,
    vulnerabilities: () => [...queryKeys.security.all, 'vulnerabilities'] as const,
    accessControl: () => [...queryKeys.security.all, 'accessControl'] as const,
    metrics: () => [...queryKeys.security.all, 'metrics'] as const,
    gdprStatus: () => [...queryKeys.security.all, 'gdprStatus'] as const,
    failedLogins: (params?: { startDate?: string; endDate?: string }) =>
      [...queryKeys.security.all, 'failedLogins', params] as const,
    dataExports: () => [...queryKeys.security.all, 'dataExports'] as const,
  },

  // =========================================================================
  // Widgets Keys
  // =========================================================================
  widgets: {
    all: ['widgets'] as const,
    lists: () => [...queryKeys.widgets.all, 'list'] as const,
    list: (params?: { type?: string; enabled?: boolean }) => 
      [...queryKeys.widgets.lists(), params] as const,
    details: () => [...queryKeys.widgets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.widgets.details(), id] as const,
    config: (id: string) => [...queryKeys.widgets.detail(id), 'config'] as const,
    embedCode: (id: string) => [...queryKeys.widgets.detail(id), 'embedCode'] as const,
    preview: (id: string) => [...queryKeys.widgets.detail(id), 'preview'] as const,
  },

  // =========================================================================
  // Monitoring Keys
  // =========================================================================
  monitoring: {
    all: ['monitoring'] as const,
    metrics: (params?: { period?: string }) => 
      [...queryKeys.monitoring.all, 'metrics', params] as const,
    health: () => [...queryKeys.monitoring.all, 'health'] as const,
    performance: (params?: { startDate?: string; endDate?: string }) => 
      [...queryKeys.monitoring.all, 'performance', params] as const,
    errors: (params?: { severity?: string; limit?: number }) => 
      [...queryKeys.monitoring.all, 'errors', params] as const,
    logs: (params?: { level?: string; limit?: number }) => 
      [...queryKeys.monitoring.all, 'logs', params] as const,
    incidents: (params?: { status?: string; severity?: string }) =>
      [...queryKeys.monitoring.all, 'incidents', params] as const,
    databaseStats: () => [...queryKeys.monitoring.all, 'databaseStats'] as const,
    apiUsage: (params?: string | { startDate?: string; endDate?: string }) =>
      [...queryKeys.monitoring.all, 'apiUsage', params] as const,
  },

  // =========================================================================
  // GDPR Keys
  // =========================================================================
  gdpr: {
    all: ['gdpr'] as const,
    lists: () => [...queryKeys.gdpr.all, 'list'] as const,
    myRequests: (params?: unknown) => [...queryKeys.gdpr.lists(), 'myRequests', params] as const,
    pending: (params?: unknown) => [...queryKeys.gdpr.lists(), 'pending', params] as const,
    detail: (id: string) => [...queryKeys.gdpr.all, 'detail', id] as const,
    export: () => [...queryKeys.gdpr.all, 'export'] as const,
    consents: (userId?: string) => [...queryKeys.gdpr.all, 'consents', userId] as const,
    dataExport: (userId: string) => [...queryKeys.gdpr.all, 'dataExport', userId] as const,
    deletionRequests: () => [...queryKeys.gdpr.all, 'deletionRequests'] as const,
  },

  // =========================================================================
  // Feature Flags Keys
  // =========================================================================
  features: {
    all: ['features'] as const,
    tenant: () => [...queryKeys.features.all, 'tenant'] as const,
  },
} as const;
