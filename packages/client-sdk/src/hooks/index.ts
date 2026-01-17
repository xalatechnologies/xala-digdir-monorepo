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

// Current User hook (alias for useSession)
export { useCurrentUser } from './use-current-user';

// Auth guard hooks
export {
  useAuthRedirectGuard,
  useSessionRestoration,
  useSessionExpirationCheck
} from './use-auth-guards';

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

// Module flags hooks
export {
  moduleKeys,
  useModuleCatalog,
  useEffectiveModules,
  useModule,
  useIsModuleEnabled,
  // Note: useHasCapability and useCapabilities exported from use-capabilities
  useEnabledModules,
  useToggleModule,
  useModulesManager,
} from './use-modules';

// Navigation hooks (module-aware filtering)
export {
  type NavItem,
  type FilteredNavItem,
  filterNavItemsByCapabilities,
  annotateNavItems,
  useFilteredNavItems,
  useAnnotatedNavItems,
} from './use-navigation';

// Domain Navigation hooks (manifest-driven)
export {
  type DomainNavItem,
  type NavSource,
  type CombinedNavItem,
  PLATFORM_NAV,
  useDomainNavigation,
  useAnnotatedDomainNavigation,
  useDomainGroupStatus,
  useIsDomainGroupEnabled,
} from './use-domain-navigation';

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

// Booking Contracts hooks (Contract-First)
export {
  bookingContractsKeys,
  usePricePreview,
  useRecurringPreview,
  usePreviewPriceMutation,
  usePreviewRecurringMutation,
} from './use-booking-contracts';

// Calendar Contracts hooks (Contract-First)
export {
  calendarContractsKeys,
  useCalendar as useCalendarContracts,
  useBlocks as useBlocksContracts,
  useCreateBlock as useCreateBlockContract,
  useDeleteBlock as useDeleteBlockContract,
} from './use-calendar-contracts';

// Advanced Contracts hooks (Contract-First)
export {
  advancedContractsKeys,
  useHelpTOC,
  useHelpArticle,
  useHelpSearch,
  useGlobalSearch as useGlobalSearchContract,
  useGlobalSearchMutation,
  useCreateDSAR,
  useDSAR,
  useUpdateConsent as useUpdateConsentContract,
  useReportTemplates,
  useGenerateReport,
  useReport,
  useReportsList,
  useSeason as useSeasonContract,
  useApplyForSeason,
  useSeasonAllocations,
  useSeasonsList,
  useOrgContext,
  useSetOrgContext,
} from './use-advanced-contracts';

// Backoffice Organization Management hooks
export {
  backofficeOrgKeys,
  useBackofficeOrganizations,
  useBackofficeOrganization,
  useCreateBackofficeOrganization,
  useUpdateBackofficeOrganization,
  useDeleteBackofficeOrganization,
  useBackofficeOrganizationMembers,
  useAddBackofficeOrganizationMember,
  useRemoveBackofficeOrganizationMember,
  useBackofficeAssignedRentalObjects,
  useAssignRentalObjectToOrg,
  useUnassignRentalObjectFromOrg,
} from './use-backoffice-orgs';

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

// Organization hooks (MinSide) - TEMPORARY STUB
export {
  useOrganizations,
  useOrganization,
  useOrganizationMembers,
  useAddOrganizationMember,
  useRemoveOrganizationMember,
  useUpdateOrganizationMember,
} from './use-organizations';

// Organization hooks (Backoffice aliases for compatibility)
export {
  useDeleteBackofficeOrganization as useDeleteOrganization,
  useCreateBackofficeOrganization as useCreateOrganization,
  useUpdateBackofficeOrganization as useUpdateOrganization,
  useBackofficeOrganization as useOrganizationDetail,
} from './use-backoffice-orgs';

// Organization branding hook (stub)
export function useUpdateOrganizationBranding() {
  const { useMutation } = require('@tanstack/react-query');
  return useMutation({
    mutationFn: async ({ id, branding }: { id: string; branding: { logo?: string; primaryColor?: string } }) => {
      return { id, ...branding };
    },
  });
}

// Verify organization hook (stub for Brreg verification)
export function useVerifyOrganization() {
  const { useMutation } = require('@tanstack/react-query');
  return useMutation({
    mutationFn: async (orgNumber: string) => {
      return { verified: true, name: `Org ${orgNumber}`, orgNumber };
    },
  });
}

// User Management hooks (MinSide) - TEMPORARY STUB
export {
  useUserPreferences,
  useUpdateUserPreferences,
  useUpdateCurrentUser,
  useDeleteAccount,
  useUploadUserAvatar,
  useExportData,
  type UserPreferences,
} from './use-user';

// User Admin hooks (Backoffice/Admin)
export {
  useUsers,
  useUser,
  useUsersByOrganization,
  useUsersByTenant,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useReinstateUser,
  useReinstateUser as useReactivateUser,
  useAssignRole,
  useRemoveRole,
  useBulkInviteUsers as useBulkInviteUsersAdmin,
  useUserStats,
  useSearchUsers,
} from './use-users';

// User deactivation alias (useSuspendUser already exported from use-tenant-admin-users)
export { useSuspendUser as useDeactivateUser } from './use-users';

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
  useAssignedBlocks,
  useBlock,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useCheckConflicts,
} from './use-blocks';

// Org Dashboard hooks (for org_admin/org_member)
export {
  orgDashboardKeys,
  useOrgDashboardStats,
  useOrgPendingItems,
  useOrgCalendarPreview,
  useOrgAlerts,
  useAssignedRentalObjects,
} from './use-org-dashboard';

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

// Favorites hooks
export {
  useFavorites,
  useFavorite,
  useIsFavorited,
  useFavoriteCount,
  useAddFavorite,
  useUpdateFavorite,
  useRemoveFavorite,
  useRemoveFavoriteByObjectId,
  useToggleFavorite,
  useBulkAddFavorites,
  useBulkRemoveFavorites,
  useFavoritedIds,
  useAreFavorited,
} from './use-favorites';

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

// SaaS Admin hooks (Platform-wide administration)
export {
  useSaasMe,
  useSaasTenants,
  useSaasTenant,
  useCreateSaasTenant,
  useUpdateSaasTenant,
  useSuspendSaasTenant,
  useReactivateSaasTenant,
  useUpdateSaasSeatLimits,
  useSaasFeatureFlagsCatalog,
  useSaasTenantFlags,
  useUpdateSaasTenantFlags,
  useRotateSaasLicenseKey,
  useValidateSaasLicenseKey,
  useSaasTenantBilling,
  useSaasBillingOverview,
  useSaasTenantSecrets,
  useUpdateSaasTenantSecret,
  useSaasPlans,
  useSaasPlan,
  useCreateSaasPlan,
  useUpdateSaasPlan,
  useSaasTenantCategories,
  useUpdateSaasTenantCategories,
} from './use-saas';

// Tenant Admin hooks (Tenant-scoped administration)
export {
  useTenantCapabilities,
  useTenantSubscription,
  useTenantFlags,
  useTenantBranding,
  useUpdateTenantBranding,
  useTenantIntegrations,
  useUpdateTenantIntegration,
} from './use-tenant-admin';

// Tenant Admin User Management hooks
export {
  tenantAdminUserKeys,
  useTenantAdminUsers,
  useTenantAdminUser,
  useUserEffectivePermissions,
  useUserActivity,
  useUserInvitations,
  useInviteTenantUser,
  useResendInvitation,
  useCancelInvitation,
  useAssignUserRole,
  useAssignUserToOrganization,
  useRemoveUserFromOrganization,
  useAssignUserScopes,
  useDeactivateTenantUser,
  useReactivateTenantUser,
  useSuspendUser,
  useUnsuspendUser,
  useBulkInviteUsers,
  useBulkDeactivateUsers,
  useBulkAssignRole,
} from './use-tenant-admin-users';

// Scope Assignment hooks (Case handler scope delegation)
export {
  scopeAssignmentKeys,
  useScopeAssignments,
  useScopeAssignment,
  useUserScopes,
  useEffectiveScope,
  useScopeDelegationTree,
  useCreateScopeAssignment,
  useUpdateScopeAssignment,
  useDeleteScopeAssignment,
  useAssignScopes,
  useAddRentalObjectScope,
  useRemoveRentalObjectScope,
  useSetOrganizationScope,
  useSetCategoryScope,
  useSetGlobalScope,
  useClearScopes,
  useSuspendScope,
  useReactivateScope,
  useValidateAccess,
  useBulkAssignScopes,
  useBulkRemoveScopes,
} from './use-scope-assignment';

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

// Consent hooks (GDPR) - TEMPORARY STUB
export {
  useConsents,
  useUpdateConsents,
  useHasConsent,
  type Consent,
} from './use-consents';

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

// Metadata hooks
export {
  metadataKeys,
  useCategoriesMetadata,
  useCategoryMetadata,
  useTimeModesMetadata,
  useTimeModeMetadata,
  usePricingUnitsMetadata,
  usePricingUnitMetadata,
  useStatusesMetadata,
  useStatusMetadata,
  useRentalObjectStatuses,
  useBookingStatuses,
} from './use-metadata';

// Utility hooks
export { useDebounced } from './useDebounced';
