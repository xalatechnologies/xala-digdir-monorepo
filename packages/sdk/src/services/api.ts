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
