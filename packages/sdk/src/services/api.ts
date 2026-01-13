/**
 * API Services
 * Service functions for API endpoints
 */

import { getApiClient } from '../lib/api-client';
import type {
  Tenant,
  Listing,
  Booking,
  PaginatedResponse,
  SingleResponse,
  ListingQueryParams,
  BookingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
  CreateBookingDTO,
} from '../types/api';

// =============================================================================
// Tenant Services
// =============================================================================

/**
 * Get all tenants
 */
export async function getTenants(): Promise<PaginatedResponse<Tenant>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Tenant>>('/api/tenants');
}

/**
 * Get a single tenant by ID
 */
export async function getTenant(id: string): Promise<SingleResponse<Tenant>> {
  const client = getApiClient();
  return client.get<SingleResponse<Tenant>>(`/api/tenants/${id}`);
}

// =============================================================================
// Listing Services
// =============================================================================

/**
 * Get all listings with optional filtering
 * Note: Public listings don't require tenant header
 */
export async function getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
  const client = getApiClient();
  // Skip tenant header for public listing discovery
  return client.request<PaginatedResponse<Listing>>('/api/listings', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
    skipTenantHeader: true,
  });
}

/**
 * Get a single listing by ID
 */
export async function getListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.get<SingleResponse<Listing>>(`/api/listings/${id}`);
}

/**
 * Create a new listing
 */
export async function createListing(data: CreateListingDTO): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.post<SingleResponse<Listing>>('/api/listings', data);
}

/**
 * Update a listing
 */
export async function updateListing(id: string, data: UpdateListingDTO): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.put<SingleResponse<Listing>>(`/api/listings/${id}`, data);
}

/**
 * Publish a listing
 */
export async function publishListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.put<SingleResponse<Listing>>(`/api/listings/${id}/publish`);
}

/**
 * Archive a listing
 */
export async function archiveListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.put<SingleResponse<Listing>>(`/api/listings/${id}/archive`);
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.delete<{ success: boolean }>(`/api/listings/${id}`);
}

// =============================================================================
// Booking Services
// =============================================================================

/**
 * Get all bookings with optional filtering
 */
export async function getBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Booking>>('/api/bookings', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get a single booking by ID
 */
export async function getBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.get<SingleResponse<Booking>>(`/api/bookings/${id}`);
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingDTO): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.post<SingleResponse<Booking>>('/api/bookings', data);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/cancel`);
}

/**
 * Confirm a booking
 */
export async function confirmBooking(id: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/confirm`);
}

// =============================================================================
// Health Check
// =============================================================================

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const client = getApiClient();
  return client.get<{ status: string; timestamp: string }>('/health');
}

// =============================================================================
// Calendar / Availability Services
// =============================================================================

import type {
  CalendarEvent,
  TimeSlot,
  CalendarQueryParams,
  AvailabilityQueryParams,
  CreateAllocationDTO,
  SeasonalLease,
  SeasonalLeaseQueryParams,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  Conversation,
  Message,
  ConversationQueryParams,
  MessageQueryParams,
  CreateMessageDTO,
  CreateConversationDTO,
  ReportQueryParams,
  UsageReport,
  RevenueReport,
  BookingStats,
  OrganizationReport,
  DashboardKPIs,
  Organization,
  OrganizationMember,
  OrganizationQueryParams,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  BackofficeUser,
  UserQueryParams,
  CreateUserDTO,
  UpdateUserDTO,
} from '../types/api';

/**
 * Get calendar events for a date range
 */
export async function getCalendarEvents(params: CalendarQueryParams): Promise<PaginatedResponse<CalendarEvent>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<CalendarEvent>>('/api/calendar/events', params as unknown as Record<string, string | number | boolean | undefined>);
}

/**
 * Get available time slots for a listing
 */
export async function getAvailableSlots(params: AvailabilityQueryParams): Promise<{ data: TimeSlot[] }> {
  const client = getApiClient();
  return client.get<{ data: TimeSlot[] }>('/api/availability/slots', params as unknown as Record<string, string | number | boolean | undefined>);
}

/**
 * Create an allocation (block time, maintenance, etc.)
 */
export async function createAllocation(data: CreateAllocationDTO): Promise<SingleResponse<CalendarEvent>> {
  const client = getApiClient();
  return client.post<SingleResponse<CalendarEvent>>('/api/allocations', data);
}

/**
 * Delete an allocation
 */
export async function deleteAllocation(id: string): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.delete<{ success: boolean }>(`/api/allocations/${id}`);
}

// =============================================================================
// Seasonal Lease Services
// =============================================================================

/**
 * Get all seasonal leases
 */
export async function getSeasonalLeases(params?: SeasonalLeaseQueryParams): Promise<PaginatedResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<SeasonalLease>>('/api/seasonal-leases', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get a single seasonal lease
 */
export async function getSeasonalLease(id: string): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.get<SingleResponse<SeasonalLease>>(`/api/seasonal-leases/${id}`);
}

/**
 * Create a seasonal lease
 */
export async function createSeasonalLease(data: CreateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.post<SingleResponse<SeasonalLease>>('/api/seasonal-leases', data);
}

/**
 * Update a seasonal lease
 */
export async function updateSeasonalLease(id: string, data: UpdateSeasonalLeaseDTO): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.put<SingleResponse<SeasonalLease>>(`/api/seasonal-leases/${id}`, data);
}

/**
 * Terminate a seasonal lease
 */
export async function terminateSeasonalLease(id: string): Promise<SingleResponse<SeasonalLease>> {
  const client = getApiClient();
  return client.put<SingleResponse<SeasonalLease>>(`/api/seasonal-leases/${id}/terminate`);
}

// =============================================================================
// Messages / Conversations Services
// =============================================================================

/**
 * Get all conversations
 */
export async function getConversations(params?: ConversationQueryParams): Promise<PaginatedResponse<Conversation>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Conversation>>('/api/conversations', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get a single conversation
 */
export async function getConversation(id: string): Promise<SingleResponse<Conversation>> {
  const client = getApiClient();
  return client.get<SingleResponse<Conversation>>(`/api/conversations/${id}`);
}

/**
 * Get messages in a conversation
 */
export async function getMessages(params: MessageQueryParams): Promise<PaginatedResponse<Message>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Message>>(`/api/conversations/${params.conversationId}/messages`, {
    page: params.page,
    limit: params.limit,
  } as Record<string, string | number | boolean | undefined>);
}

/**
 * Create a new conversation
 */
export async function createConversation(data: CreateConversationDTO): Promise<SingleResponse<Conversation>> {
  const client = getApiClient();
  return client.post<SingleResponse<Conversation>>('/api/conversations', data);
}

/**
 * Send a message
 */
export async function sendMessage(data: CreateMessageDTO): Promise<SingleResponse<Message>> {
  const client = getApiClient();
  return client.post<SingleResponse<Message>>(`/api/conversations/${data.conversationId}/messages`, {
    content: data.content,
    attachments: data.attachments,
  });
}

/**
 * Mark conversation as resolved
 */
export async function resolveConversation(id: string): Promise<SingleResponse<Conversation>> {
  const client = getApiClient();
  return client.put<SingleResponse<Conversation>>(`/api/conversations/${id}/resolve`);
}

/**
 * Mark messages as read
 */
export async function markMessagesRead(conversationId: string): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.put<{ success: boolean }>(`/api/conversations/${conversationId}/read`);
}

// =============================================================================
// Reports / Analytics Services
// =============================================================================

/**
 * Get usage report
 */
export async function getUsageReport(params: Omit<ReportQueryParams, 'type'>): Promise<{ data: UsageReport[] }> {
  const client = getApiClient();
  return client.get<{ data: UsageReport[] }>('/api/reports/usage', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get revenue report
 */
export async function getRevenueReport(params: Omit<ReportQueryParams, 'type'>): Promise<SingleResponse<RevenueReport>> {
  const client = getApiClient();
  return client.get<SingleResponse<RevenueReport>>('/api/reports/revenue', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get booking statistics
 */
export async function getBookingStats(params: Omit<ReportQueryParams, 'type'>): Promise<{ data: BookingStats[] }> {
  const client = getApiClient();
  return client.get<{ data: BookingStats[] }>('/api/reports/bookings', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get organization activity report
 */
export async function getOrganizationReport(params?: { startDate?: string; endDate?: string }): Promise<{ data: OrganizationReport[] }> {
  const client = getApiClient();
  return client.get<{ data: OrganizationReport[] }>('/api/reports/organizations', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get dashboard KPIs
 */
export async function getDashboardKPIs(): Promise<SingleResponse<DashboardKPIs>> {
  const client = getApiClient();
  return client.get<SingleResponse<DashboardKPIs>>('/api/dashboard/kpis');
}

/**
 * Export report
 */
export async function exportReport(params: ReportQueryParams & { format: 'pdf' | 'excel' | 'csv' }): Promise<Blob> {
  const client = getApiClient();
  const response = await client.request<Blob>('/api/reports/export', {
    method: 'GET',
    params: params as unknown as Record<string, string | number | boolean | undefined>,
    headers: {
      Accept: params.format === 'pdf' ? 'application/pdf' : params.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
    },
  });
  return response;
}

// =============================================================================
// Organization Services
// =============================================================================

/**
 * Get all organizations
 */
export async function getOrganizations(params?: OrganizationQueryParams): Promise<PaginatedResponse<Organization>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Organization>>('/api/organizations', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get a single organization
 */
export async function getOrganization(id: string): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.get<SingleResponse<Organization>>(`/api/organizations/${id}`);
}

/**
 * Create an organization
 */
export async function createOrganization(data: CreateOrganizationDTO): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.post<SingleResponse<Organization>>('/api/organizations', data);
}

/**
 * Update an organization
 */
export async function updateOrganization(id: string, data: UpdateOrganizationDTO): Promise<SingleResponse<Organization>> {
  const client = getApiClient();
  return client.put<SingleResponse<Organization>>(`/api/organizations/${id}`, data);
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string): Promise<{ data: OrganizationMember[] }> {
  const client = getApiClient();
  return client.get<{ data: OrganizationMember[] }>(`/api/organizations/${organizationId}/members`);
}

/**
 * Add member to organization
 */
export async function addOrganizationMember(organizationId: string, userId: string, role: 'admin' | 'member'): Promise<SingleResponse<OrganizationMember>> {
  const client = getApiClient();
  return client.post<SingleResponse<OrganizationMember>>(`/api/organizations/${organizationId}/members`, { userId, role });
}

/**
 * Remove member from organization
 */
export async function removeOrganizationMember(organizationId: string, memberId: string): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.delete<{ success: boolean }>(`/api/organizations/${organizationId}/members/${memberId}`);
}

// =============================================================================
// User Management Services
// =============================================================================

/**
 * Get all users
 */
export async function getUsers(params?: UserQueryParams): Promise<PaginatedResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<BackofficeUser>>('/api/users', params as Record<string, string | number | boolean | undefined>);
}

/**
 * Get a single user
 */
export async function getUser(id: string): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.get<SingleResponse<BackofficeUser>>(`/api/users/${id}`);
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.get<SingleResponse<BackofficeUser>>('/api/users/me');
}

/**
 * Create a user
 */
export async function createUser(data: CreateUserDTO): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.post<SingleResponse<BackofficeUser>>('/api/users', data);
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: UpdateUserDTO): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.put<SingleResponse<BackofficeUser>>(`/api/users/${id}`, data);
}

/**
 * Deactivate a user
 */
export async function deactivateUser(id: string): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.put<SingleResponse<BackofficeUser>>(`/api/users/${id}/deactivate`);
}

/**
 * Reactivate a user
 */
export async function reactivateUser(id: string): Promise<SingleResponse<BackofficeUser>> {
  const client = getApiClient();
  return client.put<SingleResponse<BackofficeUser>>(`/api/users/${id}/reactivate`);
}
