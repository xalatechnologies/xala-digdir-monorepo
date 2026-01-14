/**
 * Query Keys Factory
 * Single Responsibility: Centralized query key management
 * Enables proper cache invalidation and prefetching
 */

import type { 
  ListingQueryParams, 
  AvailabilityQueryParams,
  PublicListingParams
} from '../types/listing';
import type { BookingQueryParams } from '../types/booking';
import type { ReportQueryParams, AuditQueryParams } from '../types/additional';

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
  // Listing Keys
  // =========================================================================
  listings: {
    all: ['listings'] as const,
    lists: () => [...queryKeys.listings.all, 'list'] as const,
    list: (params?: ListingQueryParams) => [...queryKeys.listings.lists(), params] as const,
    details: () => [...queryKeys.listings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.listings.details(), id] as const,
    slug: (slug: string) => [...queryKeys.listings.all, 'slug', slug] as const,
    availability: (id: string, params: AvailabilityQueryParams) => 
      [...queryKeys.listings.detail(id), 'availability', params] as const,
    stats: (id: string) => [...queryKeys.listings.detail(id), 'stats'] as const,
  },

  // =========================================================================
  // Public Keys (No Auth)
  // =========================================================================
  public: {
    all: ['public'] as const,
    listings: (params?: PublicListingParams) => [...queryKeys.public.all, 'listings', params] as const,
    listing: (id: string) => [...queryKeys.public.all, 'listing', id] as const,
    availability: (listingId: string, params: AvailabilityQueryParams) =>
      [...queryKeys.public.all, 'availability', listingId, params] as const,
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
    pricing: (listingId: string, start: string, end: string) => 
      [...queryKeys.bookings.all, 'pricing', listingId, start, end] as const,
  },

  // =========================================================================
  // Calendar Keys
  // =========================================================================
  calendar: {
    all: ['calendar'] as const,
    events: (params?: { listingId?: string; startDate?: string; endDate?: string }) =>
      [...queryKeys.calendar.all, 'events', params] as const,
    slots: (params: { listingId: string; date: string; duration?: number }) =>
      [...queryKeys.calendar.all, 'slots', params] as const,
  },

  // =========================================================================
  // Allocation Keys
  // =========================================================================
  allocations: {
    all: ['allocations'] as const,
    list: (params?: { listingId?: string; startDate?: string; endDate?: string }) =>
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
    heatmap: (params: ReportQueryParams) => [...queryKeys.reports.all, 'heatmap', params] as const,
    seasonal: (params: ReportQueryParams) => [...queryKeys.reports.all, 'seasonal', params] as const,
    comparison: (params: ReportQueryParams) => [...queryKeys.reports.all, 'comparison', params] as const,
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
  // Discount Code Keys
  // =========================================================================
  discountCodes: {
    all: ['discountCodes'] as const,
    list: () => [...queryKeys.discountCodes.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.discountCodes.all, 'detail', id] as const,
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
} as const;
