/**
 * Digilist SDK - API Client
 * Type-safe HTTP client for all API endpoints
 */

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
  // GDPR
  GdprDataExport,
  ConsentSettings,
  // Response types
  PaginatedResponse,
  SingleResponse,
  SuccessResponse,
} from './types';

// =============================================================================
// API Client Configuration
// =============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  tenantId?: string;
  licenseKey?: string;
  token?: string;
  onUnauthorized?: () => void;
  onError?: (error: Error) => void;
}

type RequestParams = Record<string, string | number | boolean | undefined>;

class DigilistApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: RequestParams;
      skipTenantHeader?: boolean;
    }
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.tenantId && !options?.skipTenantHeader) {
      headers['X-Tenant-Id'] = this.config.tenantId;
    }

    if (this.config.licenseKey) {
      headers['X-License-Key'] = this.config.licenseKey;
    }

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      this.config.onUnauthorized?.();
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      const err = new Error(error.message || 'Request failed');
      this.config.onError?.(err);
      throw err;
    }

    return response.json();
  }

  // Helper methods
  get<T>(path: string, params?: RequestParams): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  // Set auth token
  setToken(token: string) {
    this.config.token = token;
  }

  // Set tenant ID
  setTenantId(tenantId: string) {
    this.config.tenantId = tenantId;
  }
}

// Global client instance
let apiClient: DigilistApiClient | null = null;

export function initializeApiClient(config: ApiClientConfig): DigilistApiClient {
  apiClient = new DigilistApiClient(config);
  return apiClient;
}

export function getApiClient(): DigilistApiClient {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initializeApiClient first.');
  }
  return apiClient;
}

// =============================================================================
// Auth API
// =============================================================================

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const client = getApiClient();
  return client.post<AuthSession>('/api/auth/login', credentials);
}

export async function logout(): Promise<void> {
  const client = getApiClient();
  return client.post<void>('/api/auth/logout');
}

export async function getSession(): Promise<SingleResponse<AuthSession>> {
  const client = getApiClient();
  return client.get<SingleResponse<AuthSession>>('/api/auth/session');
}

export async function refreshToken(): Promise<AuthSession> {
  const client = getApiClient();
  return client.post<AuthSession>('/api/auth/refresh');
}

export async function getAuthProviders(): Promise<SingleResponse<OAuthProvider[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<OAuthProvider[]>>('/api/auth/providers');
}

// =============================================================================
// Listings API
// =============================================================================

export async function getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Listing>>('/api/listings', params as RequestParams);
}

export async function getListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing>>(`/api/listings/${id}`);
}

export async function getListingBySlug(slug: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing>>(`/api/listings/slug/${slug}`);
}

export async function createListing(data: CreateListingDTO): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.post<SingleResponse<Listing>>('/api/listings', data);
}

export async function updateListing(id: string, data: UpdateListingDTO): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.put<SingleResponse<Listing>>(`/api/listings/${id}`, data);
}

export async function deleteListing(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/listings/${id}`);
}

export async function publishListing(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/listings/${id}/publish`);
}

export async function archiveListing(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/listings/${id}/archive`);
}

export async function getListingAvailability(
  id: string,
  params: AvailabilityQueryParams
): Promise<SingleResponse<ListingAvailability>> {
  const client = getApiClient();
  return client.get<SingleResponse<ListingAvailability>>(`/api/listings/${id}/availability`, params as RequestParams);
}

export async function getListingStats(id: string): Promise<SingleResponse<ListingStats>> {
  const client = getApiClient();
  return client.get<SingleResponse<ListingStats>>(`/api/listings/${id}/stats`);
}

export async function uploadListingMedia(id: string, urls: string[]): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>(`/api/listings/${id}/media`, { urls });
}

export async function deleteListingMedia(id: string, mediaId: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/listings/${id}/media/${mediaId}`);
}

// =============================================================================
// Categories API
// =============================================================================

export async function getCategories(): Promise<SingleResponse<Category[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<Category[]>>('/api/categories');
}

// =============================================================================
// Bookings API
// =============================================================================

export async function getBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Booking>>('/api/bookings', params as RequestParams);
}

export async function getBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.get<SingleResponse<Booking>>(`/api/bookings/${id}`);
}

export async function createBooking(data: CreateBookingDTO): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.post<SingleResponse<Booking>>('/api/bookings', data);
}

export async function updateBooking(id: string, data: UpdateBookingDTO): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}`, data);
}

export async function updateBookingStatus(id: string, status: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/status`, { status });
}

export async function confirmBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/confirm`);
}

export async function cancelBooking(id: string, data?: CancelBookingDTO): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/cancel`, data);
}

export async function completeBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/complete`);
}

export async function deleteBooking(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/bookings/${id}`);
}

export async function getBookingPricing(
  listingId: string,
  startTime: string,
  endTime: string
): Promise<SingleResponse<BookingPricing>> {
  const client = getApiClient();
  return client.get<SingleResponse<BookingPricing>>('/api/bookings/pricing', { listingId, startTime, endTime });
}

export async function getMyBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Booking>>('/api/bookings/my', params as RequestParams);
}

export async function getRecurringBookings(): Promise<PaginatedResponse<Booking>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Booking>>('/api/bookings/recurring');
}

export async function createRecurringBooking(data: CreateBookingDTO & {
  frequency: string;
  endDate: string;
  weekdays?: number[];
}): Promise<SingleResponse<Booking[]>> {
  const client = getApiClient();
  return client.post<SingleResponse<Booking[]>>('/api/bookings/recurring', data);
}

// =============================================================================
// Calendar API
// =============================================================================

export async function getCalendarEvents(params?: {
  listingId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<SingleResponse<CalendarEvent[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<CalendarEvent[]>>('/api/calendar/events', params);
}

export async function getAvailabilitySlots(params: {
  listingId: string;
  date: string;
  duration?: number;
}): Promise<SingleResponse<TimeSlot[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<TimeSlot[]>>('/api/availability/slots', params);
}

// =============================================================================
// Allocations API
// =============================================================================

export async function getAllocations(params?: {
  listingId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Allocation>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Allocation>>('/api/allocations', params);
}

export async function createAllocation(data: CreateAllocationDTO): Promise<SingleResponse<Allocation>> {
  const client = getApiClient();
  return client.post<SingleResponse<Allocation>>('/api/allocations', data);
}

export async function deleteAllocation(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/allocations/${id}`);
}

// =============================================================================
// Seasonal Leases API
// =============================================================================

export async function getSeasonalLeases(params?: {
  status?: string;
  organizationId?: string;
  listingId?: string;
}): Promise<PaginatedResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<SeasonalLease>>('/api/seasonal-leases', params);
}

export async function getSeasonalLease(id: string): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.get<SingleResponse<SeasonalLease>>(`/api/seasonal-leases/${id}`);
}

export async function createSeasonalLease(data: CreateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.post<SingleResponse<SeasonalLease>>('/api/seasonal-leases', data);
}

export async function updateSeasonalLease(id: string, data: UpdateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.put<SingleResponse<SeasonalLease>>(`/api/seasonal-leases/${id}`, data);
}

export async function terminateSeasonalLease(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/seasonal-leases/${id}/terminate`);
}

// =============================================================================
// Organizations API
// =============================================================================

export async function getOrganizations(params?: {
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Organization>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Organization>>('/api/organizations', params);
}

export async function getOrganization(id: string): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.get<SingleResponse<Organization>>(`/api/organizations/${id}`);
}

export async function createOrganization(data: CreateOrganizationDTO): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.post<SingleResponse<Organization>>('/api/organizations', data);
}

export async function updateOrganization(id: string, data: UpdateOrganizationDTO): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.put<SingleResponse<Organization>>(`/api/organizations/${id}`, data);
}

export async function deleteOrganization(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/organizations/${id}`);
}

export async function verifyOrganization(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>(`/api/organizations/${id}/verify`);
}

export async function getOrganizationMembers(id: string): Promise<SingleResponse<OrganizationMember[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<OrganizationMember[]>>(`/api/organizations/${id}/members`);
}

export async function addOrganizationMember(orgId: string, data: { userId: string; role?: string }): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>(`/api/organizations/${orgId}/members`, data);
}

export async function updateOrganizationMember(
  orgId: string,
  memberId: string,
  data: { role: string }
): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/organizations/${orgId}/members/${memberId}`, data);
}

export async function removeOrganizationMember(orgId: string, memberId: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/organizations/${orgId}/members/${memberId}`);
}

// =============================================================================
// Users API
// =============================================================================

export async function getUsers(params?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<User>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<User>>('/api/users', params);
}

export async function getUser(id: string): Promise<SingleResponse<User>> {
  const client = getApiClient();
  return client.get<SingleResponse<User>>(`/api/users/${id}`);
}

export async function getCurrentUser(): Promise<SingleResponse<User>> {
  const client = getApiClient();
  return client.get<SingleResponse<User>>('/api/users/me');
}

export async function createUser(data: CreateUserDTO): Promise<SingleResponse<User>> {
  const client = getApiClient();
  return client.post<SingleResponse<User>>('/api/users', data);
}

export async function updateUser(id: string, data: UpdateUserDTO): Promise<SingleResponse<User>> {
  const client = getApiClient();
  return client.put<SingleResponse<User>>(`/api/users/${id}`, data);
}

export async function updateCurrentUser(data: UpdateUserDTO): Promise<SingleResponse<User>> {
  const client = getApiClient();
  return client.put<SingleResponse<User>>('/api/users/me', data);
}

export async function deactivateUser(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/users/${id}/deactivate`);
}

export async function reactivateUser(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/users/${id}/reactivate`);
}

// =============================================================================
// GDPR API
// =============================================================================

export async function exportMyData(): Promise<GdprDataExport> {
  const client = getApiClient();
  return client.get<GdprDataExport>('/api/users/me/data');
}

export async function deleteMyAccount(): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>('/api/users/me');
}

export async function getMyConsents(): Promise<SingleResponse<ConsentSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<ConsentSettings>>('/api/users/me/consents');
}

export async function updateMyConsents(consents: Partial<ConsentSettings>): Promise<SingleResponse<ConsentSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<ConsentSettings>>('/api/users/me/consents', consents);
}

// =============================================================================
// Conversations API
// =============================================================================

export async function getConversations(params?: {
  status?: string;
  unreadOnly?: boolean;
}): Promise<PaginatedResponse<Conversation>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Conversation>>('/api/conversations', params);
}

export async function getConversation(id: string): Promise<SingleResponse<Conversation>> {
  const client = getApiClient();
  return client.get<SingleResponse<Conversation>>(`/api/conversations/${id}`);
}

export async function createConversation(data: CreateConversationDTO): Promise<SingleResponse<Conversation>> {
  const client = getApiClient();
  return client.post<SingleResponse<Conversation>>('/api/conversations', data);
}

export async function getConversationMessages(id: string, params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Message>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Message>>(`/api/conversations/${id}/messages`, params);
}

export async function sendMessage(conversationId: string, data: SendMessageDTO): Promise<SingleResponse<Message>> {
  const client = getApiClient();
  return client.post<SingleResponse<Message>>(`/api/conversations/${conversationId}/messages`, data);
}

export async function markConversationRead(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/conversations/${id}/read`);
}

export async function resolveConversation(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.put<SuccessResponse>(`/api/conversations/${id}/resolve`);
}

// =============================================================================
// Dashboard & Reports API
// =============================================================================

export async function getDashboardKPIs(): Promise<SingleResponse<DashboardKPIs>> {
  const client = getApiClient();
  return client.get<SingleResponse<DashboardKPIs>>('/api/dashboard/kpis');
}

export async function getUsageReport(params: ReportQueryParams): Promise<SingleResponse<UsageReport[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<UsageReport[]>>('/api/reports/usage', params as RequestParams);
}

export async function getRevenueReport(params: ReportQueryParams): Promise<SingleResponse<RevenueReport>> {
  const client = getApiClient();
  return client.get<SingleResponse<RevenueReport>>('/api/reports/revenue', params as RequestParams);
}

export async function getBookingReport(params: ReportQueryParams): Promise<SingleResponse<BookingReport>> {
  const client = getApiClient();
  return client.get<SingleResponse<BookingReport>>('/api/reports/bookings', params as RequestParams);
}

export async function exportReport(params: ReportQueryParams & { format: 'pdf' | 'excel' | 'csv' }): Promise<Blob> {
  const client = getApiClient();
  // For file download, we'd handle this differently in practice
  return client.post<Blob>('/api/reports/export', params);
}

// =============================================================================
// Audit API
// =============================================================================

export async function getAuditLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditEvent>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<AuditEvent>>('/api/audit', params as RequestParams);
}

export async function getAuditEvent(id: string): Promise<SingleResponse<AuditEvent>> {
  const client = getApiClient();
  return client.get<SingleResponse<AuditEvent>>(`/api/audit/${id}`);
}

// =============================================================================
// Discount Codes API
// =============================================================================

export async function getDiscountCodes(): Promise<PaginatedResponse<DiscountCode>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<DiscountCode>>('/api/discount-codes');
}

export async function createDiscountCode(data: CreateDiscountCodeDTO): Promise<SingleResponse<DiscountCode>> {
  const client = getApiClient();
  return client.post<SingleResponse<DiscountCode>>('/api/discount-codes', data);
}

export async function updateDiscountCode(
  id: string,
  data: Partial<CreateDiscountCodeDTO>
): Promise<SingleResponse<DiscountCode>> {
  const client = getApiClient();
  return client.put<SingleResponse<DiscountCode>>(`/api/discount-codes/${id}`, data);
}

export async function deleteDiscountCode(id: string): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.delete<SuccessResponse>(`/api/discount-codes/${id}`);
}

export async function validateDiscountCode(code: string, listingId?: string): Promise<ValidateDiscountResult> {
  const client = getApiClient();
  return client.post<ValidateDiscountResult>('/api/discount-codes/validate', { code, listingId });
}

// =============================================================================
// Settings API
// =============================================================================

export async function getTenantSettings(): Promise<SingleResponse<TenantSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<TenantSettings>>('/api/settings');
}

export async function updateTenantSettings(data: Partial<TenantSettings>): Promise<SingleResponse<TenantSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<TenantSettings>>('/api/settings', data);
}

export async function getIntegrationSettings(): Promise<SingleResponse<IntegrationSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<IntegrationSettings>>('/api/settings/integrations');
}

export async function updateIntegrationSettings(
  provider: string,
  data: Record<string, unknown>
): Promise<SingleResponse<IntegrationSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<IntegrationSettings>>(`/api/settings/integrations/${provider}`, data);
}

// =============================================================================
// Public API (No Auth Required)
// =============================================================================

export async function getPublicListings(params?: PublicListingParams): Promise<PaginatedResponse<Listing>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Listing>>('/api/public/listings', params as RequestParams);
}

export async function getPublicListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing>>(`/api/public/listings/${id}`);
}

export async function getPublicAvailability(
  listingId: string,
  params: AvailabilityQueryParams
): Promise<SingleResponse<TimeSlot[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<TimeSlot[]>>(`/api/public/listings/${listingId}/availability`, params as RequestParams);
}

export async function getPublicCategories(): Promise<SingleResponse<Category[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<Category[]>>('/api/public/categories');
}

export async function getPublicCities(): Promise<SingleResponse<City[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<City[]>>('/api/public/cities');
}

export async function getFeaturedListings(): Promise<SingleResponse<Listing[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing[]>>('/api/public/featured');
}

// =============================================================================
// Integrations API
// =============================================================================

// RCO
export async function getRcoStatus(): Promise<SingleResponse<{ connected: boolean; activeAccessCodes: number }>> {
  const client = getApiClient();
  return client.get('/api/integrations/rco/status');
}

export async function generateAccessCode(data: {
  bookingId: string;
  listingId: string;
  validFrom: string;
  validUntil: string;
}): Promise<SingleResponse<RcoAccessCode>> {
  const client = getApiClient();
  return client.post<SingleResponse<RcoAccessCode>>('/api/integrations/rco/access-code', data);
}

export async function getRcoLocks(): Promise<SingleResponse<RcoLock[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<RcoLock[]>>('/api/integrations/rco/locks');
}

export async function remoteUnlock(lockId: string, duration?: number): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>('/api/integrations/rco/unlock', { lockId, duration });
}

// Visma
export async function getVismaStatus(): Promise<SingleResponse<{ connected: boolean; pendingInvoices: number }>> {
  const client = getApiClient();
  return client.get('/api/integrations/visma/status');
}

export async function createVismaInvoice(data: {
  bookingId: string;
  organizationId: string;
  amount: number;
  description?: string;
}): Promise<SingleResponse<VismaInvoice>> {
  const client = getApiClient();
  return client.post<SingleResponse<VismaInvoice>>('/api/integrations/visma/invoice', data);
}

export async function getVismaInvoices(): Promise<PaginatedResponse<VismaInvoice>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<VismaInvoice>>('/api/integrations/visma/invoices');
}

export async function syncVisma(): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>('/api/integrations/visma/sync');
}

// BRREG
export async function lookupBrregOrganization(orgNumber: string): Promise<SingleResponse<BrregOrganization>> {
  const client = getApiClient();
  return client.get<SingleResponse<BrregOrganization>>(`/api/integrations/brreg/lookup/${orgNumber}`);
}

export async function verifyBrregOrganization(organizationNumber: string): Promise<SingleResponse<{ verified: boolean }>> {
  const client = getApiClient();
  return client.post('/api/integrations/brreg/verify', { organizationNumber });
}

// NIF
export async function lookupNifClub(clubId: string): Promise<SingleResponse<NifSportsClub>> {
  const client = getApiClient();
  return client.get<SingleResponse<NifSportsClub>>(`/api/integrations/nif/lookup/${clubId}`);
}

// Vipps
export async function getVippsStatus(): Promise<SingleResponse<{ connected: boolean; merchantId: string }>> {
  const client = getApiClient();
  return client.get('/api/integrations/vipps/status');
}

export async function initiateVippsPayment(data: {
  bookingId: string;
  amount: number;
  description?: string;
  returnUrl: string;
}): Promise<SingleResponse<VippsPayment>> {
  const client = getApiClient();
  return client.post<SingleResponse<VippsPayment>>('/api/integrations/vipps/initiate', data);
}

export async function getVippsPaymentStatus(orderId: string): Promise<SingleResponse<VippsPayment>> {
  const client = getApiClient();
  return client.get<SingleResponse<VippsPayment>>(`/api/integrations/vipps/payment/${orderId}`);
}

// Calendar Sync
export async function getCalendarSyncStatus(): Promise<SingleResponse<{
  googleCalendar: { connected: boolean };
  outlookCalendar: { connected: boolean; lastSync?: string };
}>> {
  const client = getApiClient();
  return client.get('/api/integrations/calendar/status');
}

export async function syncExternalCalendar(provider: 'google' | 'outlook'): Promise<SuccessResponse> {
  const client = getApiClient();
  return client.post<SuccessResponse>('/api/integrations/calendar/sync', { provider });
}

// =============================================================================
// Share Links API
// =============================================================================

export async function getShareLink(token: string): Promise<SingleResponse<ShareLink>> {
  const client = getApiClient();
  return client.get<SingleResponse<ShareLink>>(`/api/share/${token}`);
}

export async function createShareLink(data: CreateShareLinkDTO): Promise<SingleResponse<ShareLink>> {
  const client = getApiClient();
  return client.post<SingleResponse<ShareLink>>('/api/share', data);
}

// =============================================================================
// Widgets API
// =============================================================================

export async function getWidgetListings(tenantId?: string, limit?: number): Promise<SingleResponse<Listing[]>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing[]>>('/api/widgets/listings', { tenantId, limit });
}

export async function getWidgetCalendar(listingId: string, month?: string): Promise<SingleResponse<{
  listingId: string;
  month: string;
  availableDays: number[];
  blockedDays: number[];
}>> {
  const client = getApiClient();
  return client.get('/api/widgets/calendar', { listingId, month });
}
