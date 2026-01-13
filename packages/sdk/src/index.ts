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
  PaymentStatus,
  ActorType,
  DiscountType,
  AuditAction,
  CancellationPolicy,
  PaymentProvider,

  // Response wrappers
  PaginatedResponse,
  SingleResponse,

  // Domain types
  Pricing,
  Tenant,
  Listing,
  ListingMetadata,
  Booking,
  BookingExtended,
  User,

  // Authentication types
  AuthSession,
  AuthUser,
  LoginCredentials,
  OAuthProvider,

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

  // Public API types
  PublicListingParams,
  City,
  Municipality,
  Category,

  // Discount code types
  DiscountCode,
  CreateDiscountCodeDTO,
  ValidateDiscountResult,

  // Audit types
  AuditEvent,
  AuditQueryParams,

  // Settings types
  TenantSettings,
  BookingSettings,
  NotificationSettings,
  PaymentSettings,
  IntegrationSettings,

  // GDPR types
  GdprDataExport,
  ConsentSettings,

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

  // Authentication
  login,
  logout,
  getSession,
  refreshToken,
  getAuthProviders,

  // Public API (no auth required)
  getPublicListings,
  getPublicListing,
  getPublicAvailability,
  getPublicCategories,
  getFeaturedListings,
  getCities,
  getMunicipalities,

  // User's Own Data
  getMyBookings,
  cancelMyBooking,

  // GDPR
  exportMyData,
  deleteMyAccount,
  getMyConsents,
  updateMyConsents,

  // Discount Codes
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,

  // Audit
  getAuditLogs,
  getAuditEvent,

  // Settings
  getTenantSettings,
  updateTenantSettings,
  getIntegrationSettings,
  updateIntegrationSettings,
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

export {
  // Authentication
  authKeys,
  useSession,
  useAuthProviders,
  useLogin,
  useLogout,
  useRefreshToken,
} from './hooks/useAuth';

export {
  // Public API (no auth required)
  publicKeys,
  usePublicListings,
  usePublicUiListings,
  usePublicListing,
  usePublicUiListing,
  usePublicAvailability,
  usePublicCategories,
  useFeaturedListings,
  useCities,
  useMunicipalities,
} from './hooks/usePublic';

export {
  // User's Own Data
  myDataKeys,
  useMyBookings,
  useCancelMyBooking,
  useGdprExport,
  useDeleteAccount,
  useMyConsents,
  useUpdateMyConsents,
} from './hooks/useMyData';

export {
  // Discount Codes
  discountCodeKeys,
  useDiscountCodes,
  useCreateDiscountCode,
  useUpdateDiscountCode,
  useDeleteDiscountCode,
  useValidateDiscountCode,
} from './hooks/useDiscountCodes';

export {
  // Audit Logs
  auditKeys,
  useAuditLogs,
  useAuditEvent,
} from './hooks/useAudit';

export {
  // Settings
  settingsKeys,
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegrationSettings,
} from './hooks/useSettings';
