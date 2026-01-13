/**
 * Hooks Index
 * Exports all React Query hooks
 */

// Query keys factory
export { queryKeys } from './query-keys';

// Auth hooks
export {
  useSession,
  useAuthProviders,
  useLogin,
  useEmailLogin,
  useLogout,
  useRefreshToken
} from './use-auth';

// Listing hooks
export {
  useListings,
  useListing,
  useListingBySlug,
  useListingAvailability,
  useListingStats,
  useCreateListing,
  useUpdateListing,
  useDeleteListing,
  usePublishListing,
  useUnpublishListing,
  useArchiveListing,
  useRestoreListing,
  useDuplicateListing,
  usePublicListings,
  usePublicListing,
  usePublicAvailability,
  usePublicCategories,
  usePublicCities,
  usePublicMunicipalities,
  useFeaturedListings
} from './use-listings';

// Booking hooks
export {
  useBookings,
  useBooking,
  useMyBookings,
  useRecurringBookings,
  useBookingPricing,
  useCreateBooking,
  useUpdateBooking,
  useConfirmBooking,
  useCancelBooking,
  useCompleteBooking,
  useDeleteBooking,
  useCalendarEvents,
  useAvailabilitySlots,
  useAllocations,
  useCreateAllocation,
  useDeleteAllocation
} from './use-bookings';

// Organization & User hooks
export {
  useOrganizations,
  useOrganization,
  useOrganizationMembers,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useVerifyOrganization,
  useUsers,
  useUser,
  useCurrentUser,
  useCreateUser,
  useUpdateUser,
  useUpdateCurrentUser,
  useDeactivateUser,
  useReactivateUser,
  useExportData,
  useDeleteAccount,
  useConsents,
  useUpdateConsents
} from './use-organizations';

// Integration hooks
export {
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegration,
  useRcoStatus,
  useRcoLocks,
  useGenerateAccessCode,
  useRemoteUnlock,
  useVismaStatus,
  useVismaInvoices,
  useCreateInvoice,
  useSyncVisma,
  useBrregLookup,
  useVerifyBrreg,
  useNifLookup,
  useVippsStatus,
  useVippsPayment,
  useInitiatePayment,
  useCalendarSyncStatus,
  useSyncCalendar
} from './use-integrations';
