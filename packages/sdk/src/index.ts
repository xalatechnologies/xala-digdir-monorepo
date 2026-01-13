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
  AllocationStatus,
  SeasonalLeaseStatus,
  ConversationStatus,
  MessageSender,
  ReportPeriod,
  ReportType,
  ExportFormat,
  OrganizationStatus,
  UserRole,
  UserStatus,

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

  // Calendar types
  CalendarEvent,
  TimeSlot,

  // Seasonal lease types
  SeasonalLease,

  // Conversation types
  Conversation,
  Message,

  // Report types
  UsageReport,
  RevenueReport,
  BookingStats,
  OrganizationReport,
  DashboardKPIs,

  // Organization types
  Organization,
  OrganizationMember,

  // User types
  BackofficeUser,

  // Query params
  ListingQueryParams,
  BookingQueryParams,
  CalendarQueryParams,
  AvailabilityQueryParams,
  SeasonalLeaseQueryParams,
  ConversationQueryParams,
  MessageQueryParams,
  ReportQueryParams,
  OrganizationQueryParams,
  UserQueryParams,

  // DTOs
  CreateListingDTO,
  UpdateListingDTO,
  CreateBookingDTO,
  CreateAllocationDTO,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  CreateMessageDTO,
  CreateConversationDTO,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  CreateUserDTO,
  UpdateUserDTO,

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

  // Calendar
  getCalendarEvents,
  getAvailableSlots,
  createAllocation,
  deleteAllocation,

  // Seasonal Leases
  getSeasonalLeases,
  getSeasonalLease,
  createSeasonalLease,
  updateSeasonalLease,
  terminateSeasonalLease,

  // Conversations
  getConversations,
  getConversation,
  getMessages,
  createConversation,
  sendMessage,
  resolveConversation,
  markMessagesRead,

  // Reports
  getUsageReport,
  getRevenueReport,
  getBookingStats,
  getOrganizationReport,
  getDashboardKPIs,
  exportReport,

  // Organizations
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,

  // Users
  getUsers,
  getUser,
  getCurrentUser,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
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

export {
  // Calendar
  calendarKeys,
  useCalendarEvents,
  useAvailableSlots,
  useCreateAllocation,
  useDeleteAllocation,
} from './hooks/useCalendar';

export {
  // Seasonal Leases
  seasonalLeaseKeys,
  useSeasonalLeases,
  useSeasonalLease,
  useCreateSeasonalLease,
  useUpdateSeasonalLease,
  useTerminateSeasonalLease,
} from './hooks/useSeasonalLeases';

export {
  // Conversations
  conversationKeys,
  useConversations,
  useConversation,
  useMessages,
  useCreateConversation,
  useSendMessage,
  useResolveConversation,
  useMarkMessagesRead,
} from './hooks/useConversations';

export {
  // Reports
  reportKeys,
  useDashboardKPIs,
  useUsageReport,
  useRevenueReport,
  useBookingStats,
  useOrganizationReport,
  useExportReport,
} from './hooks/useReports';

export {
  // Organizations
  organizationKeys,
  useOrganizations,
  useOrganization,
  useOrganizationMembers,
  useCreateOrganization,
  useUpdateOrganization,
  useAddOrganizationMember,
  useRemoveOrganizationMember,
} from './hooks/useOrganizations';

export {
  // Users
  userKeys,
  useUsers,
  useUser,
  useCurrentUser,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
} from './hooks/useUsers';
