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
  usePublicUiListings,
  usePublicListing,
  usePublicUiListing,
  usePublicAvailability,
  usePublicCategories,
  usePublicCities,
  usePublicMunicipalities,
  useFeaturedListings,
  useUploadListingMedia,
  useDeleteListingMedia
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
  useDeleteAllocation,
  usePaymentHistory,
  usePaymentReconciliation,
} from './use-bookings';

// Calendar hooks (config and availability matrix)
export {
  useListingCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from './use-calendar';

// Organization & User hooks
export {
  useOrganizations,
  useOrganization,
  useOrganizationMembers,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useVerifyOrganization,
  useUploadOrganizationLogo,
  useUsers,
  useUser,
  useCurrentUser,
  useCreateUser,
  useUpdateUser,
  useUpdateCurrentUser,
  useDeactivateUser,
  useReactivateUser,
  useUploadUserAvatar,
  useExportData,
  useDeleteAccount,
  useConsents,
  useUpdateConsents,
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
  useVippsPaymentHistory,
  useInitiatePayment,
  useCapturePayment,
  useRefundPayment,
  useCalendarSyncStatus,
  useSyncCalendar,
} from './use-integrations';

// Realtime hooks (WebSocket)
export {
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeBookingConflicts,
  useRealtimeListings,
  useRealtimeCalendar,
  useRealtimeMessages,
  useRealtimeNotifications,
  useRealtimeAudit,
  useRealtimeEvents,
  useNotificationBadge,
  useRealtimeSend
} from './use-realtime';

// Notification hooks
export {
  useNotifications,
  useMyNotifications,
  useNotificationUnreadCount,
  useNotificationTemplates,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification
} from './use-notifications';

// Push Notification hooks
export {
  usePushSubscriptions,
  useNotificationPreferences,
  usePushPermission,
  useRegisterPushSubscription,
  useUnsubscribePush,
  useDeletePushSubscription,
  useUpdateNotificationPreferences,
  useTestPushNotification,
  usePushSubscriptionFlow
} from './use-push-notifications';

// Audit hooks
export {
  useAuditLog,
  useAuditEvent,
  useAuditStats,
  useResourceAudit,
  useUserAudit,
  type AuditLogEntry,
  type AuditQueryParams,
  type AuditStats
} from './use-audit';

// Discount Code hooks
export {
  useDiscountCodes,
  useDiscountCode,
  useCreateDiscountCode,
  useUpdateDiscountCode,
  useDeleteDiscountCode,
  useValidateDiscountCode,
  useToggleDiscountCode,
  type DiscountCodeQueryParams,
  type ValidateCodeResult
} from './use-discount-codes';

// Conversation hooks
export {
  conversationKeys,
  useConversations,
  useConversation,
  useMessages,
  useUnreadCount,
  useCreateConversation,
  useSendMessage,
  useMarkMessagesRead,
  useResolveConversation,
  useReopenConversation,
  useAssignConversation,
} from './use-conversations';

// Block hooks
export {
  blockKeys,
  useBlocks,
  useBlock,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useCheckConflicts,
} from './use-blocks';

// Seasonal Lease hooks
export {
  seasonalLeaseKeys,
  useSeasonalLeases,
  useSeasonalLease,
  useCreateSeasonalLease,
  useUpdateSeasonalLease,
  useApproveSeasonalLease,
  useRejectSeasonalLease,
  useCancelSeasonalLease,
  useDeleteSeasonalLease,
  useGenerateAllocations,
} from './use-seasonal-leases';

// Review hooks
export {
  useReviews,
  useReview,
  useListingReviews,
  useReviewStats,
  useReviewSummary,
  useMyReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useModerateReview,
  useApproveReview,
  useRejectReview,
} from './use-reviews';

// Report & Dashboard hooks
export {
  reportKeys,
  useDashboardKPIs,
  useDashboardStats,
  useDashboardActivity,
  usePendingItems,
  useUpcomingBookings,
  useQuickActions,
  useBookingStats,
  useRevenueReport,
  useUsageReport,
  useTimeSlotHeatmap,
  useSeasonalPatterns,
  useComparisonData,
  useExportReport,
} from './use-reports';

// Geocoding hooks
export {
  useGeocode,
  useGeocodeListings,
  type GeocodedItem,
  type UseGeocodeListingsOptions,
  type UseGeocodeListingsResult,
} from './use-geocode';

// Accessibility Monitoring hooks
export {
  useAccessibilityMonitoring,
  useScreenReaderDetection,
  useKeyboardNavigationDetection,
  type UseAccessibilityMonitoringOptions,
  type AccessibilityMonitoringAPI,
  type AccessibilityMonitoringConfig,
  type AccessibilityMetric,
  type AccessibilityMetricType,
  type AccessibilityReport,
  type KeyboardNavigationMetric,
  type SkipLinkUsageMetric,
  type ScreenReaderDetectionMetric,
  type FocusManagementMetric,
  type AriaAnnouncementMetric,
} from './use-accessibility-monitoring';

// Search hooks
export {
  useGlobalSearch,
  useTypeahead,
  useSavedFilters,
  useSavedFilter,
  useCreateSavedFilter,
  useUpdateSavedFilter,
  useDeleteSavedFilter,
  useRecentSearches,
  useExportResults,
} from './use-search';

// Economy hooks (invoicing, billing, credit notes)
export {
  useInvoiceBases,
  useInvoiceBasis,
  useCreateInvoiceBasis,
  useGenerateFromBookings,
  useUpdateInvoiceBasis,
  useApproveInvoiceBasis,
  useFinalizeInvoiceBasis,
  useDeleteInvoiceBasis,
  useSalesDocuments,
  useSalesDocument,
  useSendSalesDocument,
  useMarkAsPaid,
  useDownloadInvoicePdf,
  useCancelSalesDocument,
  useCreditNotes,
  useCreditNote,
  useCreateCreditNote,
  useApproveCreditNote,
  useProcessCreditNote,
  useDownloadCreditNotePdf,
  useSyncToVisma,
  useVismaInvoiceStatus,
  useExportEconomy,
  useEconomyStatistics,
} from './use-economy';

// Billing hooks (user + org billing for Minside)
export {
  billingKeys,
  useBillingSummary,
  useInvoices,
  useInvoice,
  useDownloadInvoice,
  useInvoiceDownloadUrl,
  useOrgBillingSummary,
  useOrgInvoices,
  useOrgInvoice,
  useDownloadOrgInvoice,
} from './use-billing';

// Season Applications hooks
export {
  seasonApplicationKeys,
  useSeasonApplications,
  useSeasonApplication,
  useCreateSeasonApplication,
  useUpdateSeasonApplication,
  useApproveSeasonApplication,
  useRejectSeasonApplication,
  useAllocateApplication,
  useFinalizeSeasonAllocations,
  useDeleteSeasonApplication,
} from './use-season-applications';

// Seasons hooks
export {
  seasonKeys,
  useSeasons,
  useSeason,
  useSeasonStats,
  useSeasonVenues,
  useCreateSeason,
  useUpdateSeason,
  useOpenSeason,
  useCloseSeason,
  useActivateSeason,
  useCompleteSeason,
  useCancelSeason,
  useDeleteSeason,
  useAddVenueToSeason,
  useRemoveVenueFromSeason,
} from './use-seasons';

// Help & Support hooks
export {
  useFaq,
  useGuides,
  useTraining,
  useTooltips,
  useSubmitContact,
} from './useHelp';
