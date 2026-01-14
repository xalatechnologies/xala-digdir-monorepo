/**
 * Digilist SDK - React Query Hooks
 * Type-safe hooks for all API operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';

import * as api from './api';
import type {
  // Auth
  AuthSession,
  LoginCredentials,
  OAuthProvider,
  // Listings
  Listing,
  ListingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
  ListingAvailability,
  ListingStats,
  // Bookings
  Booking,
  BookingQueryParams,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  BookingPricing,
  CalendarEvent,
  // Seasonal Leases
  SeasonalLease,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  // Organizations
  Organization,
  OrganizationMember,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  // Users
  User,
  CreateUserDTO,
  UpdateUserDTO,
  // Conversations
  Conversation,
  Message,
  CreateConversationDTO,
  SendMessageDTO,
  // Allocations
  Allocation,
  CreateAllocationDTO,
  // Dashboard & Reports
  DashboardKPIs,
  UsageReport,
  RevenueReport,
  BookingReport,
  ReportQueryParams,
  // Audit
  AuditEvent,
  AuditQueryParams,
  // Discount Codes
  DiscountCode,
  CreateDiscountCodeDTO,
  ValidateDiscountResult,
  // Public
  PublicListingParams,
  Category,
  City,
  TimeSlot,
  AvailabilityQueryParams,
  // Settings
  TenantSettings,
  IntegrationSettings,
  // GDPR
  GdprDataExport,
  ConsentSettings,
  // Integrations
  RcoAccessCode,
  RcoLock,
  VismaInvoice,
  BrregOrganization,
  NifSportsClub,
  VippsPayment,
  // Share
  ShareLink,
  CreateShareLinkDTO,
} from './types';

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  // Auth
  auth: {
    session: ['auth', 'session'] as const,
    providers: ['auth', 'providers'] as const,
  },
  
  // Listings
  listings: {
    all: ['listings'] as const,
    list: (params?: ListingQueryParams) => ['listings', 'list', params] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    bySlug: (slug: string) => ['listings', 'slug', slug] as const,
    availability: (id: string, params: AvailabilityQueryParams) => ['listings', 'availability', id, params] as const,
    stats: (id: string) => ['listings', 'stats', id] as const,
  },
  
  // Categories
  categories: ['categories'] as const,
  
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    list: (params?: BookingQueryParams) => ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    my: (params?: BookingQueryParams) => ['bookings', 'my', params] as const,
    recurring: ['bookings', 'recurring'] as const,
    pricing: (listingId: string, start: string, end: string) => ['bookings', 'pricing', listingId, start, end] as const,
  },
  
  // Calendar
  calendar: {
    events: (params?: { listingId?: string; startDate?: string; endDate?: string }) => 
      ['calendar', 'events', params] as const,
    slots: (params: { listingId: string; date: string; duration?: number }) =>
      ['calendar', 'slots', params] as const,
  },
  
  // Allocations
  allocations: {
    list: (params?: { listingId?: string; startDate?: string; endDate?: string }) =>
      ['allocations', 'list', params] as const,
  },
  
  // Seasonal Leases
  seasonalLeases: {
    all: ['seasonal-leases'] as const,
    list: (params?: { status?: string; organizationId?: string }) =>
      ['seasonal-leases', 'list', params] as const,
    detail: (id: string) => ['seasonal-leases', 'detail', id] as const,
  },
  
  // Organizations
  organizations: {
    all: ['organizations'] as const,
    list: (params?: { status?: string; search?: string }) => ['organizations', 'list', params] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
    members: (id: string) => ['organizations', 'members', id] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    list: (params?: { role?: string; status?: string; search?: string }) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    me: ['users', 'me'] as const,
    consents: ['users', 'me', 'consents'] as const,
  },
  
  // Conversations
  conversations: {
    all: ['conversations'] as const,
    list: (params?: { status?: string; unreadOnly?: boolean }) => ['conversations', 'list', params] as const,
    detail: (id: string) => ['conversations', 'detail', id] as const,
    messages: (id: string, params?: { page?: number }) => ['conversations', 'messages', id, params] as const,
  },
  
  // Dashboard & Reports
  dashboard: {
    kpis: ['dashboard', 'kpis'] as const,
  },
  reports: {
    usage: (params: ReportQueryParams) => ['reports', 'usage', params] as const,
    revenue: (params: ReportQueryParams) => ['reports', 'revenue', params] as const,
    bookings: (params: ReportQueryParams) => ['reports', 'bookings', params] as const,
  },
  
  // Audit
  audit: {
    list: (params?: AuditQueryParams) => ['audit', 'list', params] as const,
    detail: (id: string) => ['audit', 'detail', id] as const,
  },
  
  // Discount Codes
  discountCodes: {
    all: ['discount-codes'] as const,
    list: () => ['discount-codes', 'list'] as const,
  },
  
  // Settings
  settings: {
    tenant: ['settings', 'tenant'] as const,
    integrations: ['settings', 'integrations'] as const,
  },
  
  // Public
  public: {
    listings: (params?: PublicListingParams) => ['public', 'listings', params] as const,
    listing: (id: string) => ['public', 'listing', id] as const,
    availability: (listingId: string, params: AvailabilityQueryParams) =>
      ['public', 'availability', listingId, params] as const,
    categories: ['public', 'categories'] as const,
    cities: ['public', 'cities'] as const,
    featured: ['public', 'featured'] as const,
  },
  
  // Integrations
  integrations: {
    rco: {
      status: ['integrations', 'rco', 'status'] as const,
      locks: ['integrations', 'rco', 'locks'] as const,
    },
    visma: {
      status: ['integrations', 'visma', 'status'] as const,
      invoices: ['integrations', 'visma', 'invoices'] as const,
    },
    vipps: {
      status: ['integrations', 'vipps', 'status'] as const,
      payment: (orderId: string) => ['integrations', 'vipps', 'payment', orderId] as const,
    },
    brreg: {
      lookup: (orgNumber: string) => ['integrations', 'brreg', orgNumber] as const,
    },
    nif: {
      lookup: (clubId: string) => ['integrations', 'nif', clubId] as const,
    },
    calendar: {
      status: ['integrations', 'calendar', 'status'] as const,
    },
  },
  
  // Share
  share: {
    link: (token: string) => ['share', token] as const,
  },
  
  // Widgets
  widgets: {
    listings: (tenantId?: string) => ['widgets', 'listings', tenantId] as const,
    calendar: (listingId: string, month?: string) => ['widgets', 'calendar', listingId, month] as const,
  },
};

// =============================================================================
// Auth Hooks
// =============================================================================

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => api.getSession(),
    retry: false,
  });
}

export function useAuthProviders() {
  return useQuery({
    queryKey: queryKeys.auth.providers,
    queryFn: () => api.getAuthProviders(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => api.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.session, { data });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

// =============================================================================
// Listing Hooks
// =============================================================================

export function useListings(params?: ListingQueryParams) {
  return useQuery({
    queryKey: queryKeys.listings.list(params),
    queryFn: () => api.getListings(params),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => api.getListing(id),
    enabled: !!id,
  });
}

export function useListingBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.listings.bySlug(slug),
    queryFn: () => api.getListingBySlug(slug),
    enabled: !!slug,
  });
}

export function useListingAvailability(id: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: queryKeys.listings.availability(id, params),
    queryFn: () => api.getListingAvailability(id, params),
    enabled: !!id && !!params.startDate,
  });
}

export function useListingStats(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.stats(id),
    queryFn: () => api.getListingStats(id),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingDTO) => api.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingDTO }) => api.updateListing(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

export function usePublishListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.publishListing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

export function useArchiveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveListing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

// =============================================================================
// Categories Hooks
// =============================================================================

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.getCategories(),
  });
}

// =============================================================================
// Booking Hooks
// =============================================================================

export function useBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => api.getBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => api.getBooking(id),
    enabled: !!id,
  });
}

export function useMyBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: queryKeys.bookings.my(params),
    queryFn: () => api.getMyBookings(params),
  });
}

export function useRecurringBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.recurring,
    queryFn: () => api.getRecurringBookings(),
  });
}

export function useBookingPricing(listingId: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: queryKeys.bookings.pricing(listingId, startTime, endTime),
    queryFn: () => api.getBookingPricing(listingId, startTime, endTime),
    enabled: !!listingId && !!startTime && !!endTime,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingDTO) => api.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.events({}) });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDTO }) => api.updateBooking(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.confirmBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingDTO }) => api.cancelBooking(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.completeBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

// =============================================================================
// Calendar Hooks
// =============================================================================

export function useCalendarEvents(params?: { listingId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.calendar.events(params),
    queryFn: () => api.getCalendarEvents(params),
  });
}

export function useAvailabilitySlots(params: { listingId: string; date: string; duration?: number }) {
  return useQuery({
    queryKey: queryKeys.calendar.slots(params),
    queryFn: () => api.getAvailabilitySlots(params),
    enabled: !!params.listingId && !!params.date,
  });
}

// =============================================================================
// Allocation Hooks
// =============================================================================

export function useAllocations(params?: { listingId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.allocations.list(params),
    queryFn: () => api.getAllocations(params),
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAllocationDTO) => api.createAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeleteAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

// =============================================================================
// Seasonal Lease Hooks
// =============================================================================

export function useSeasonalLeases(params?: { status?: string; organizationId?: string }) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.list(params),
    queryFn: () => api.getSeasonalLeases(params),
  });
}

export function useSeasonalLease(id: string) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.detail(id),
    queryFn: () => api.getSeasonalLease(id),
    enabled: !!id,
  });
}

export function useCreateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSeasonalLeaseDTO) => api.createSeasonalLease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.all });
    },
  });
}

export function useUpdateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonalLeaseDTO }) => api.updateSeasonalLease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.all });
    },
  });
}

export function useTerminateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.terminateSeasonalLease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.all });
    },
  });
}

// =============================================================================
// Organization Hooks
// =============================================================================

export function useOrganizations(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.organizations.list(params),
    queryFn: () => api.getOrganizations(params),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => api.getOrganization(id),
    enabled: !!id,
  });
}

export function useOrganizationMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members(id),
    queryFn: () => api.getOrganizationMembers(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationDTO) => api.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDTO }) => api.updateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });
}

export function useVerifyOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.verifyOrganization(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
    },
  });
}

// =============================================================================
// User Hooks
// =============================================================================

export function useUsers(params?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => api.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => api.getCurrentUser(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDTO) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => api.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserDTO) => api.updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// =============================================================================
// GDPR Hooks
// =============================================================================

export function useGdprExport() {
  return useMutation({
    mutationFn: () => api.exportMyData(),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteMyAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useMyConsents() {
  return useQuery({
    queryKey: queryKeys.users.consents,
    queryFn: () => api.getMyConsents(),
  });
}

export function useUpdateMyConsents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consents: Partial<ConsentSettings>) => api.updateMyConsents(consents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.consents });
    },
  });
}

// =============================================================================
// Conversation Hooks
// =============================================================================

export function useConversations(params?: { status?: string; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.conversations.list(params),
    queryFn: () => api.getConversations(params),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(id),
    queryFn: () => api.getConversation(id),
    enabled: !!id,
  });
}

export function useConversationMessages(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(id, params),
    queryFn: () => api.getConversationMessages(id, params),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConversationDTO) => api.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessageDTO }) =>
      api.sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId, {}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(conversationId) });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markConversationRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(id) });
    },
  });
}

export function useResolveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.resolveConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

// =============================================================================
// Dashboard & Reports Hooks
// =============================================================================

export function useDashboardKPIs() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: () => api.getDashboardKPIs(),
  });
}

export function useUsageReport(params: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.usage(params),
    queryFn: () => api.getUsageReport(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useRevenueReport(params: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.revenue(params),
    queryFn: () => api.getRevenueReport(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useBookingReport(params: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.bookings(params),
    queryFn: () => api.getBookingReport(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

// =============================================================================
// Audit Hooks
// =============================================================================

export function useAuditLogs(params?: AuditQueryParams) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => api.getAuditLogs(params),
  });
}

export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.audit.detail(id),
    queryFn: () => api.getAuditEvent(id),
    enabled: !!id,
  });
}

// =============================================================================
// Discount Code Hooks
// =============================================================================

export function useDiscountCodes() {
  return useQuery({
    queryKey: queryKeys.discountCodes.list(),
    queryFn: () => api.getDiscountCodes(),
  });
}

export function useCreateDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => api.createDiscountCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountCodeDTO> }) =>
      api.updateDiscountCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: ({ code, listingId }: { code: string; listingId?: string }) =>
      api.validateDiscountCode(code, listingId),
  });
}

// =============================================================================
// Settings Hooks
// =============================================================================

export function useTenantSettings() {
  return useQuery({
    queryKey: queryKeys.settings.tenant,
    queryFn: () => api.getTenantSettings(),
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => api.updateTenantSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.tenant });
    },
  });
}

export function useIntegrationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.integrations,
    queryFn: () => api.getIntegrationSettings(),
  });
}

export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: Record<string, unknown> }) =>
      api.updateIntegrationSettings(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.integrations });
    },
  });
}

// =============================================================================
// Public API Hooks (No Auth)
// =============================================================================

export function usePublicListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: queryKeys.public.listings(params),
    queryFn: () => api.getPublicListings(params),
  });
}

export function usePublicListing(id: string) {
  return useQuery({
    queryKey: queryKeys.public.listing(id),
    queryFn: () => api.getPublicListing(id),
    enabled: !!id,
  });
}

export function usePublicAvailability(listingId: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: queryKeys.public.availability(listingId, params),
    queryFn: () => api.getPublicAvailability(listingId, params),
    enabled: !!listingId && !!params.startDate,
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: queryKeys.public.categories,
    queryFn: () => api.getPublicCategories(),
  });
}

export function usePublicCities() {
  return useQuery({
    queryKey: queryKeys.public.cities,
    queryFn: () => api.getPublicCities(),
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: queryKeys.public.featured,
    queryFn: () => api.getFeaturedListings(),
  });
}

// =============================================================================
// Integration Hooks
// =============================================================================

// RCO
export function useRcoStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.status,
    queryFn: () => api.getRcoStatus(),
  });
}

export function useRcoLocks() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.locks,
    queryFn: () => api.getRcoLocks(),
  });
}

export function useGenerateAccessCode() {
  return useMutation({
    mutationFn: (data: { bookingId: string; listingId: string; validFrom: string; validUntil: string }) =>
      api.generateAccessCode(data),
  });
}

export function useRemoteUnlock() {
  return useMutation({
    mutationFn: ({ lockId, duration }: { lockId: string; duration?: number }) =>
      api.remoteUnlock(lockId, duration),
  });
}

// Visma
export function useVismaStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.status,
    queryFn: () => api.getVismaStatus(),
  });
}

export function useVismaInvoices() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.invoices,
    queryFn: () => api.getVismaInvoices(),
  });
}

export function useCreateVismaInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; organizationId: string; amount: number; description?: string }) =>
      api.createVismaInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices });
    },
  });
}

export function useSyncVisma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.syncVisma(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices });
    },
  });
}

// BRREG
export function useBrregLookup(orgNumber: string) {
  return useQuery({
    queryKey: queryKeys.integrations.brreg.lookup(orgNumber),
    queryFn: () => api.lookupBrregOrganization(orgNumber),
    enabled: !!orgNumber && orgNumber.length >= 9,
  });
}

export function useVerifyBrregOrganization() {
  return useMutation({
    mutationFn: (organizationNumber: string) => api.verifyBrregOrganization(organizationNumber),
  });
}

// NIF
export function useNifLookup(clubId: string) {
  return useQuery({
    queryKey: queryKeys.integrations.nif.lookup(clubId),
    queryFn: () => api.lookupNifClub(clubId),
    enabled: !!clubId,
  });
}

// Vipps
export function useVippsStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.status,
    queryFn: () => api.getVippsStatus(),
  });
}

export function useVippsPaymentStatus(orderId: string) {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.payment(orderId),
    queryFn: () => api.getVippsPaymentStatus(orderId),
    enabled: !!orderId,
  });
}

export function useInitiateVippsPayment() {
  return useMutation({
    mutationFn: (data: { bookingId: string; amount: number; description?: string; returnUrl: string }) =>
      api.initiateVippsPayment(data),
  });
}

// Calendar Sync
export function useCalendarSyncStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.calendar.status,
    queryFn: () => api.getCalendarSyncStatus(),
  });
}

export function useSyncExternalCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: 'google' | 'outlook') => api.syncExternalCalendar(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar.status });
    },
  });
}

// =============================================================================
// Share Hooks
// =============================================================================

export function useShareLink(token: string) {
  return useQuery({
    queryKey: queryKeys.share.link(token),
    queryFn: () => api.getShareLink(token),
    enabled: !!token,
  });
}

export function useCreateShareLink() {
  return useMutation({
    mutationFn: (data: CreateShareLinkDTO) => api.createShareLink(data),
  });
}

// =============================================================================
// Widget Hooks
// =============================================================================

export function useWidgetListings(tenantId?: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.widgets.listings(tenantId),
    queryFn: () => api.getWidgetListings(tenantId, limit),
  });
}

export function useWidgetCalendar(listingId: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.widgets.calendar(listingId, month),
    queryFn: () => api.getWidgetCalendar(listingId, month),
    enabled: !!listingId,
  });
}
