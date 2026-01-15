/**
 * Hooks Index
 * Exports all React Query hooks
 */

// Query keys factory
export { queryKeys } from './query-keys';

// Utility hooks
export { useDebounced } from './useDebounced';

// Auth hooks
export {
  useSession,
  useAuthProviders,
  useLogin,
  useEmailLogin,
  useLogout,
  useRefreshToken,
  useVippsLogin,
  useVippsCallback,
} from './use-auth';

// Flow Context hooks (Session-Safe Return-to-Flow)
export {
  useFlowContext,
  useHasFlowContext,
  useFlowContextReturnTo,
  useRentalObjectFlowContext,
  useListingFlowContext, // Deprecated alias
  type SaveFlowContextOptions,
  type SaveFlowContextResult,
  type RestoreFlowContextOptions,
  type RestoreFlowContextResult,
  type UseFlowContextReturn,
} from './use-flow-context';

// Rental Object hooks (Utleieobjekter) - Primary hooks for rental object operations
export {
  rentalObjectKeys,
  // List hooks
  useRentalObjects,
  useRentalObjectsByCategory,
  useRentalObjectsList,
  // Detail hooks
  useRentalObject,
  useRentalObjectBySlug,
  // Category hooks
  useRentalObjectCategories,
  useRentalObjectSubcategories,
  useBookingTimeModes,
  // Mutation hooks
  useCreateRentalObject,
  useUpdateRentalObject,
  useDeleteRentalObject,
  usePublishRentalObject,
  useArchiveRentalObject,
  useUnpublishRentalObject,
  useRestoreRentalObject,
  useDuplicateRentalObject,
  // Availability & Stats hooks
  useRentalObjectAvailability,
  useRentalObjectStats,
  useRentalObjectCalendarConfig,
  // Public hooks (no auth)
  usePublicRentalObjects,
  usePublicRentalObjectsList,
  usePublicRentalObject,
  usePublicRentalObjectBySlug,
  usePublicRentalObjectAvailability,
  usePublicRentalObjectCategories,
  usePublicCities,
  usePublicMunicipalities,
  useFeaturedRentalObjects,
  // Media hooks
  useUploadRentalObjectMedia,
  useDeleteRentalObjectMedia,
} from './use-rental-objects';

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
// Note: useRentalObjectCalendarConfig is exported from use-rental-objects
export {
  useListingCalendarConfig, // @deprecated - use useRentalObjectCalendarConfig from use-rental-objects
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
  // Integration Configuration hooks
  useIntegrationConfigs,
  useIntegrationConfig,
  useUpdateIntegrationConfig,
  useTestIntegrationConfig,
} from './use-integrations';

// Realtime hooks (WebSocket)
export {
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeBookingConflicts,
  useRealtimeRentalObjects,
  useRealtimeListings, // Deprecated alias
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
  usePushSubscriptionFlow,
  // Organization notification preferences
  useOrganizationNotificationPreferences,
  useUpdateOrganizationNotificationPreferences,
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
  useRentalObjectReviews,
  useListingReviews, // Deprecated alias
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

// Integration Credentials hooks (super admin only)
export {
  CREDENTIAL_KEYS,
  useIntegrationCredentials,
  useIntegrationCredential,
  useCredentialValue,
  useCreateCredential,
  useUpdateCredential,
  useDeleteCredential,
  useRotateCredential,
  useCredentialTypes,
  useIntegrationProviders,
  type CredentialInfo,
  type CreateCredentialInput,
  type UpdateCredentialInput,
} from './use-integration-credentials';

// GDPR Consent hooks
export {
  gdprKeys,
  useConsentTypes,
  useMyConsents,
  useConsentStatus,
  useConsentAuditLog,
  useMyDataRequests,
  usePendingDataRequests,
  useGrantConsent,
  useGrantMultipleConsents,
  useCreateDataSubjectRequest,
  useUpdateDataRequestStatus,
  useShowConsentPopup,
  usePendingRequiredConsents,
} from './use-gdpr';

// Notification System hooks (complete notification system)
export {
  notificationSystemKeys,
  // User notifications
  useNotifications as useNotificationSystemNotifications,
  useNotification as useNotificationSystemNotification,
  useUnreadNotificationCount,
  useNotificationStats,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDismissNotification,
  useDeleteNotification as useDeleteNotificationSystem,
  // Admin - send notifications
  useSendNotification,
  useBroadcastNotification,
  // Templates
  useNotificationTemplates as useNotificationSystemTemplates,
  useNotificationTemplate,
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  useDeleteNotificationTemplate,
  usePreviewNotificationTemplate,
  // Channel configuration
  useAvailableNotificationChannels,
  useNotificationRateLimits,
} from './use-notification-system';

// Booking Quote hooks (XALA-compliant projection-only)
export {
  bookingQuoteKeys,
  useBookingQuote,
  useRecurringPreview,
  useCreateBookingFromQuote,
} from './use-booking-quote';

// Rental Object Calendar hooks (XALA-compliant)
export {
  calendarKeys,
  useCalendarConfig,
  useCalendarAvailability,
  useRentalObjectCalendar,
  useCalendarRealtime as useRentalObjectCalendarRealtime,
} from './use-rental-object-calendar';

// Authorization (RBAC) hooks
export {
  authzKeys,
  usePermissions,
  useCheckPermission,
  useCan,
  useRole,
  useHasAnyPermission,
  useHasAllPermissions,
  useInvalidatePermissions,
} from './use-authz';

// Profile hooks
export {
  profileKeys,
  useProfile,
  useUpdateProfile,
} from './use-profile';
