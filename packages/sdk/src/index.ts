/**
 * @xala/sdk
 * 
 * Xala SDK - API client, types, and React Query hooks for Digilist platform
 * 
 * @example
 * ```tsx
 * // Initialize SDK in main.tsx
 * import { initializeSdk } from '@xala/sdk';
 * 
 * initializeSdk({
 *   apiUrl: import.meta.env.VITE_API_URL,
 *   tenantId: import.meta.env.VITE_TENANT_ID,
 *   licenseKey: import.meta.env.VITE_LICENSE_KEY,
 * });
 * 
 * // Use in components
 * import { useListings, transformListings } from '@xala/sdk';
 * 
 * function ListingsPage() {
 *   const { data, isLoading } = useListings({ status: 'published' });
 *   const listings = data ? transformListings(data.data) : [];
 *   // ...
 * }
 * ```
 */

// =============================================================================
// API Client
// =============================================================================

export {
  initializeSdk,
  getSdkConfig,
  isUsingMockData,
  ApiClient,
  ApiError,
  getApiClient,
} from './lib/api-client';

export type { SdkConfig, RequestOptions } from './lib/api-client';

// =============================================================================
// Types
// =============================================================================

export type {
  // Enums
  ListingType,
  ListingStatus,
  PricingUnit,
  BookingStatus,
  
  // Response wrappers
  PaginatedResponse,
  SingleResponse,
  
  // Domain types
  Pricing,
  Tenant,
  Listing,
  ListingMetadata,
  Booking,
  User,
  
  // Query params
  ListingQueryParams,
  BookingQueryParams,
  
  // DTOs
  CreateListingDTO,
  UpdateListingDTO,
  CreateBookingDTO,
  
  // UI types
  UiListing,
} from './types/api';

export { transformListing, transformListings } from './types/api';

// =============================================================================
// Services
// =============================================================================

export {
  // Tenants
  getTenants,
  getTenant,
  
  // Listings
  getListings,
  getListing,
  createListing,
  updateListing,
  publishListing,
  archiveListing,
  deleteListing,
  
  // Bookings
  getBookings,
  getBooking,
  createBooking,
  cancelBooking,
  confirmBooking,
  
  // Health
  checkHealth,
} from './services/api';

// =============================================================================
// Hooks
// =============================================================================

export {
  // Listings
  listingKeys,
  useListings,
  useUiListings,
  useListing,
  useUiListing,
  useCreateListing,
  useUpdateListing,
  usePublishListing,
  useArchiveListing,
  useDeleteListing,
} from './hooks/useListings';

export {
  // Bookings
  bookingKeys,
  useBookings,
  useBooking,
  useCreateBooking,
  useCancelBooking,
  useConfirmBooking,
} from './hooks/useBookings';
