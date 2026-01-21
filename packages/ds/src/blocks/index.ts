/**
 * Blocks
 *
 * Business-logic components composed from primitives and composed components
 */

// =============================================================================
// PLATFORM-NEUTRAL BLOCKS (remain in @xala/ds)
// =============================================================================

// Results Display
export { ResultsSkeleton } from './ResultsSkeleton';
export type { ResultsSkeletonProps } from './ResultsSkeleton';

export { ResultsEmptyState } from './ResultsEmptyState';
export type { ResultsEmptyStateProps } from './ResultsEmptyState';

// Listing Detail Components (platform-neutral)
export { ImageGallery } from './ImageGallery';
export type { ImageGalleryProps } from './ImageGallery';

export { CapacityCard } from './CapacityCard';
export type { CapacityCardProps } from './CapacityCard';

export { AdditionalServicesList } from './AdditionalServicesList';
export type { AdditionalServicesListProps } from './AdditionalServicesList';

export { ContactInfoCard } from './ContactInfoCard';
export type { ContactInfoCardProps } from './ContactInfoCard';

export { LocationCard } from './LocationCard';
export type { LocationCardProps } from './LocationCard';

export { OpeningHoursCard } from './OpeningHoursCard';
export type { OpeningHoursCardProps } from './OpeningHoursCard';

export { GuidelinesTab } from './GuidelinesTab';
export type { GuidelinesTabProps } from './GuidelinesTab';

export { FAQTab } from './FAQTab';
export type { FAQTabProps } from './FAQTab';

export { ImageSlider } from './ImageSlider';
export type { ImageSliderProps } from './ImageSlider';

export { BookingSection } from './BookingSection';
export type { BookingSectionProps } from './BookingSection';

// Auth Gating Modal
export { RequireAuthModal } from './RequireAuthModal';
export type { RequireAuthModalProps } from './RequireAuthModal';

// Login Components
export {
  LoginOption,
  FeatureItem,
  IntegrationBadge,
  LoginFooterLink,
  LoginLayout
} from './LoginComponents';
export type {
  LoginOptionProps,
  FeatureItemProps,
  IntegrationBadgeProps,
  LoginFooterLinkProps,
  LoginLayoutProps
} from './LoginComponents';

// Dashboard Components
export {
  StatCard,
  ActivityItem,
  ActivityFeed,
  QuickActionCard,
  formatTimeAgo,
  mapBookingStatusToActivity,
} from './DashboardComponents';
export type {
  StatCardProps,
  ActivityItemProps,
  ActivityStatus,
  ActivityFeedProps,
  QuickActionProps,
} from './DashboardComponents';

// Status Badge Components
export {
  StatusTag,
  BookingStatusBadge,
  PaymentStatusBadge,
  RentalObjectStatusBadge,
  RequestStatusBadge,
  SeasonalLeaseStatusBadge,
  OrganizationStatusBadge,
  UserStatusBadge,
  GenericStatusBadge,
  statusConfigs,
  // V3 Model Badges
  CategoryBadge,
  TimeModeBadge,
  FeatureBadge,
  InventoryBadge,
  CapacityBadge,
  BlackoutIndicator,
  RequiresApprovalBadge,
  RuleSetBadge,
  // Additional Status Badges (consolidated from apps)
  GdprRequestStatusBadge,
  BlockStatusBadge,
  InvoiceStatusBadge,
  IntegrationStatusBadge,
} from './StatusBadges';
export type {
  StatusTagProps,
  BadgeColor,
  StatusBadgeConfig,
  BookingStatusType,
  BookingStatusBadgeProps,
  PaymentStatusType,
  PaymentStatusBadgeProps,
  RentalObjectStatusType,
  RentalObjectStatusBadgeProps,
  RequestStatusType,
  RequestStatusBadgeProps,
  SeasonalLeaseStatusType,
  SeasonalLeaseStatusBadgeProps,
  OrganizationStatusType,
  OrganizationStatusBadgeProps,
  UserStatusType,
  UserStatusBadgeProps,
  GenericStatusBadgeProps,
  // V3 Model Badge Types
  CategoryKey,
  CategoryBadgeProps,
  TimeMode,
  TimeModeBadgeProps,
  FeatureKey,
  FeatureBadgeProps,
  InventoryBadgeProps,
  CapacityBadgeProps,
  BlackoutIndicatorProps,
  RequiresApprovalBadgeProps,
  RuleSetBadgeProps,
  // Additional Status Badge Types
  GdprRequestStatusType,
  GdprRequestStatusBadgeProps,
  BlockStatusType,
  BlockStatusBadgeProps,
  InvoiceStatusType,
  InvoiceStatusBadgeProps,
  IntegrationStatusType,
  IntegrationStatusBadgeProps,
} from './StatusBadges';

// Chart Components
export { BarChart, VerticalBarChart } from './BarChart';
export type {
  BarChartDataItem,
  BarChartProps,
  VerticalBarChartProps,
} from './BarChart';

// Auth UI Components
export {
  LoadingScreen,
  AccessDeniedScreen,
  NotFoundScreen,
  ErrorScreen,
  PermissionGate,
} from './AuthComponents';
export type {
  LoadingScreenProps,
  AccessDeniedScreenProps,
  NotFoundScreenProps,
  ErrorScreenProps,
  PermissionGateProps,
} from './AuthComponents';

// Messaging Components
export {
  NotificationBell,
  ConversationList,
  ConversationListItem,
  MessageBubble,
  ChatThread,
} from './messaging';
export type {
  NotificationBellProps,
  ConversationListProps,
  ConversationListItemProps,
  ConversationItem,
  MessageBubbleProps,
  MessageItem,
  ChatThreadProps,
} from './messaging';

// Error Handling Components
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps, ErrorBoundaryLabels, WithErrorBoundaryOptions } from './ErrorBoundary';

export { GlobalErrorHandler, useGlobalError } from './GlobalErrorHandler';
export type {
  GlobalErrorHandlerProps,
  GlobalError,
  UseGlobalErrorOptions,
} from './GlobalErrorHandler';

// GDPR Components
export {
  ConsentManager,
  ConsentPopup,
  ConsentSettings,
  DataExportCard,
  DeleteAccountCard,
  DataSubjectRequestForm,
  // RequestStatusBadge exported from StatusBadges as GdprRequestStatusBadge
} from './gdpr';

// Help System Components
export { HelpPanel } from './help';
export type {
  HelpPanelProps,
  HelpLevel,
  HelpCategory,
  TooltipContent,
  GuideContent,
  FAQItem,
} from './help';

// Admin Components
export {
  ScopeSelector,
  PermissionMatrix,
  EffectivePermissionsView,
  UserInviteForm,
} from './admin';
export type {
  ScopeSelectorProps,
  ScopeType as AdminScopeType,
  ScopeAssignment,
  RentalObject as ScopeRentalObject,
  Organization as ScopeOrganization,
  PermissionMatrixProps,
  Permission,
  Role as AdminRole,
  EffectivePermissionsViewProps,
  EffectivePermission,
  PermissionSource,
  UserInviteFormProps,
  InviteUserFormData,
} from './admin';

// Settings Blocks
export { SettingsTabLayout, SettingsField, SettingsSection } from './settings';
export type { SettingsTabLayoutProps, SettingsFieldProps, SettingsSectionProps } from './settings';

// Notifications Blocks
export { NotificationItem, NotificationList } from './notifications';
export type { NotificationItemProps, NotificationItemData, NotificationListProps } from './notifications';

// Profile Blocks
export { ProfileCard, QuickStat } from './profile';
export type { ProfileCardProps, ProfileCardData, QuickStatProps } from './profile';

// Account Blocks
export { AccountSwitcher, AccountSelector, AccountSelectionModal } from './account';
export type {
  AccountSwitcherProps,
  AccountType,
  ActiveAccount,
  AccountSelectorProps,
  AccountSelectionType,
  AccountSelectionModalProps,
} from './account';

// Activity Blocks

// =============================================================================
// DEPRECATED: Domain-specific components
// These are re-exported from @digilist/ui for backwards compatibility.
// Please update your imports to use @digilist/ui directly.
// =============================================================================

// -----------------------------------------------------------------------------
// Rental Object Components
// -----------------------------------------------------------------------------

/** @deprecated Import from '@digilist/ui' instead */
export {
  RentalObjectCard,
  RentalObjectGrid,
  RentalObjectListItem,
  RentalObjectDetailHeader,
  RentalObjectTableView,
  RentalObjectToolbar,
  RentalObjectMap,
  RentalObjectTabs,
  TabContent,
  TabEmptyState,
  RentalObjectAvailabilityCalendar,
  AvailabilityCalendar,
  KeyFactsRow,
  FavoriteButton,
  ShareButton,
} from '@digilist/ui';

/** @deprecated Import types from '@digilist/ui' instead */
export type {
  RentalObjectCardProps,
  RentalObjectGridProps,
  RentalObjectListItemProps,
  RentalObjectDetailHeaderProps,
  RentalObjectTableViewProps,
  RentalObjectToolbarProps,
  ViewMode,
  RentalObjectMapProps,
  MapRentalObject,
  RentalObjectTabsProps,
  TabConfig,
  TabContentProps,
  TabEmptyStateProps,
  RentalObjectAvailabilityCalendarProps,
  AvailabilityCalendarProps,
  KeyFactsRowProps,
  KeyFact,
  FavoriteButtonProps,
  ShareButtonProps,
  ShareData,
  SharePlatform,
} from '@digilist/ui';

// -----------------------------------------------------------------------------
// Booking Flow Components
// -----------------------------------------------------------------------------

/** @deprecated Import from '@digilist/ui' instead */
export {
  BookingFormModal,
  BookingConfirmation,
  BookingSuccess,
  PriceSummaryCard,
} from '@digilist/ui';

/** @deprecated Import types from '@digilist/ui' instead */
export type {
  BookingFormModalProps,
  BookingConfirmationProps,
  BookingSuccessProps,
  PriceSummaryCardProps,
  PriceLineItem,
} from '@digilist/ui';

// -----------------------------------------------------------------------------
// Season Components
// -----------------------------------------------------------------------------

/** @deprecated Import from '@digilist/ui' instead */
export {
  SeasonCard,
  VenueCard,
} from '@digilist/ui';

/** @deprecated Import types from '@digilist/ui' instead */
export type {
  SeasonCardProps,
  SeasonCardData,
  SeasonStatus,
  VenueCardProps,
  VenueCardData,
} from '@digilist/ui';

// -----------------------------------------------------------------------------
// Amenity/Facility Components (renamed)
// -----------------------------------------------------------------------------

/** @deprecated Import 'AmenityChips' from '@digilist/ui' instead */
export { AmenityChips } from '@digilist/ui';

/** @deprecated Import 'AmenityChips' from '@digilist/ui' instead - renamed from 'FacilityChips' to 'AmenityChips' */
export { AmenityChips as FacilityChips } from '@digilist/ui';

/** @deprecated Import 'AmenityChipsProps' from '@digilist/ui' instead */
export type { AmenityChipsProps } from '@digilist/ui';

/** @deprecated Use 'AmenityChipsProps' from '@digilist/ui' instead */
export type { AmenityChipsProps as FacilityChipsProps } from '@digilist/ui';

/** @deprecated Use 'Amenity' from '@digilist/ui' instead */
export type { Amenity } from '@digilist/ui';

/** @deprecated Use 'Amenity' from '@digilist/ui' instead - renamed from 'Facility' to 'Amenity' */
export type { Amenity as Facility } from '@digilist/ui';
