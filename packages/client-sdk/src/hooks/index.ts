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

// Feature flags hooks
export {
  useTenantFeatures,
  useFeature,
  useCategory,
  useEnabledCategories,
  useFeatureFlags,
  useFeaturesLoading,
  useAnyFeature,
  useAllFeatures,
} from './use-features';

// Rental Object hooks (primary - single source of truth)
export {
  rentalObjectKeys,
  useRentalObjects,
  useRentalObject,
  useRentalObjectBySlug,
  useRentalObjectsByCategory,
  useRentalObjectAvailability,
  useRentalObjectStats,
  useRentalObjectCategories,
  useRentalObjectSubcategories,
  useRentalObjectCalendarConfig,
  useBookingTimeModes,
  useCreateRentalObject,
  useUpdateRentalObject,
  useDeleteRentalObject,
  usePublishRentalObject,
  useUnpublishRentalObject,
  useArchiveRentalObject,
  useRestoreRentalObject,
  useDuplicateRentalObject,
  usePublicRentalObjects,
  usePublicRentalObject,
  usePublicRentalObjectBySlug,
  usePublicRentalObjectAvailability,
  usePublicRentalObjectCategories,
  usePublicRentalObjectsList,
  usePublicCities,
  usePublicMunicipalities,
  useFeaturedRentalObjects,
  useRentalObjectsList,
  useUploadRentalObjectMedia,
  useDeleteRentalObjectMedia,
} from './use-rental-objects';

// Legacy listing hooks removed - use rental object hooks above

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

// Discount Code hooks
export {
  useDiscountCodes,
  useDiscountCode,
  useValidateCode,
  useCreateDiscountCode,
  useUpdateDiscountCode,
  useDeleteDiscountCode,
  useToggleActive,
} from './use-discount-codes';

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
  // Organization settings & branding (TODO: implement backend)
  useOrganizationSettings,
  useUpdateOrganizationSettings,
  useUpdateOrganizationBranding,
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
  useRealtimeRentalObjects,
  useRealtimeCalendar,
  useRealtimeMessages,
  useRealtimeNotifications,
  useRealtimeAudit,
  useRealtimeMonitoring,
  useRealtimeEvents,
  useNotificationBadge,
  useRealtimeSend
} from './use-realtime';

// Legacy alias removed - use useRealtimeRentalObjects directly

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
  // TODO: Add organization hooks when backend service methods are implemented
  // useOrganizationNotificationPreferences,
  // useUpdateOrganizationNotificationPreferences
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
  useCreateSeason,
  useUpdateSeason,
  useOpenSeason,
  useCloseSeason,
  useActivateSeason,
  useCompleteSeason,
  useCancelSeason,
  useDeleteSeason,
  // Season venue management (TODO: implement backend)
  useSeasonVenues,
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

// RBAC hooks (Role-Based Access Control)
export {
  // Capabilities
  useCapabilities,
  usePermissions,
  useCheckPermission,
  useHasPermission,
  useEffectiveRole,
  // Access Grants
  useAccessGrants,
  useAccessGrant,
  useAccessGrantsByOrganization,
  useAccessGrantsByRentalObject,
  useAccessibleRentalObjects,
  useGrantedOrganizations,
  useCheckAccess,
  useGrantAccess,
  useBulkGrantAccess,
  useUpdateAccessGrant,
  useRevokeAccess,
  useDeleteAccessGrant,
  // Permission Assignments
  usePermissionAssignments,
  usePermissionAssignment,
  usePermissionAssignmentsByOrganization,
  usePermissionAssignmentsByUser,
  usePermissionAssignmentsByRentalObject,
  useMemberPermissions,
  useUserPermissionsSummary,
  useAvailablePermissions,
  useAssignPermissions,
  useUpdatePermissionAssignment,
  useRevokePermissions,
  useDeletePermissionAssignment,
  useCheckRentalObjectPermission,
  useBulkAssignPermissions,
  useCopyPermissions,
  // Utility hooks
  useBackofficeRole,
  useMyOrgMemberships,
  useMyAccessibleRentalObjects,
} from './use-rbac';

// GDPR hooks
export {
  useMyGdprRequests,
  useGdprRequest,
  usePendingGdprRequests,
  useGdprDataExport,
  useCreateGdprRequest,
  useCancelGdprRequest,
  useUpdateGdprRequestStatus,
} from './use-gdpr';

// Integration Credentials hooks
export {
  useIntegrationCredentials,
  useIntegrationCredential,
  useCredentialValue,
  useCreateCredential,
  useUpdateCredential,
  useDeleteCredential,
  useRotateCredential,
  useCredentialTypes,
  useIntegrationProviders,
} from './use-integration-credentials';

// Security Dashboard hooks
export {
  useSecurityMetrics,
  useGdprStatus,
  useFailedLogins,
  useDataExports,
  useFailedLoginsByUser,
  useDataExportsByUser,
} from './use-security-dashboard';

// Calendar hooks
export {
  useAvailabilityMatrix,
  useCalendarRealtime,
} from './use-calendar';

// Rental Object Calendar hooks
export {
  calendarKeys,
  useCalendarConfig,
  useCalendarAvailability,
  useRentalObjectCalendar,
} from './use-rental-object-calendar';

// Notification Delivery hooks
export {
  useDeliveryStatus,
  useDeliveryReports,
  useRetryFailed,
} from './use-notification-delivery';

// App-specific Capabilities hooks
export {
  useWebCapabilities,
  useMinsideCapabilities,
  useBackofficeCapabilities,
  useHasCapability,
  useHasAllCapabilities,
  useHasAnyCapability,
  useFeatureFlag,
  capabilitiesKeys,
  type AppCapabilities,
  type CapabilitiesApiResponse,
} from './use-capabilities';

// Utility hooks
export { useDebounced } from './useDebounced';
