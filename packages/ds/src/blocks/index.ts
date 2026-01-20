/**
 * Blocks
 *
 * Business-logic components composed from primitives and composed components
 */

export { RentalObjectCard } from './RentalObjectCard';
export type { RentalObjectCardProps, RentalObjectCardVariant } from './RentalObjectCard';

export { RentalObjectListItem } from './RentalObjectListItem';
export type { RentalObjectListItemProps } from './RentalObjectListItem';

export { RentalObjectGrid } from './RentalObjectGrid';
export type { RentalObjectGridProps } from './RentalObjectGrid';

export { RentalObjectToolbar } from './RentalObjectToolbar';
export type { RentalObjectToolbarProps, ViewMode } from './RentalObjectToolbar';

export { RentalObjectMap } from './RentalObjectMap';
export type { RentalObjectMapProps, MapRentalObject } from './RentalObjectMap';

export { RentalObjectTableView } from './RentalObjectTableView';
export type { RentalObjectTableViewProps } from './RentalObjectTableView';

export { ResultsSkeleton } from './ResultsSkeleton';
export type { ResultsSkeletonProps } from './ResultsSkeleton';

export { ResultsEmptyState } from './ResultsEmptyState';
export type { ResultsEmptyStateProps } from './ResultsEmptyState';

// TODO: Create RentalObjectsFilterBar component or remove export
// export { RentalObjectsFilterBar } from './RentalObjectsFilterBar';
// export type { RentalObjectsFilterBarProps } from './RentalObjectsFilterBar';

// Listing Detail Components
export { ImageGallery } from './ImageGallery';
export type { ImageGalleryProps } from './ImageGallery';

export { RentalObjectDetailHeader } from './RentalObjectDetailHeader';
export type { RentalObjectDetailHeaderProps } from './RentalObjectDetailHeader';

export { CapacityCard } from './CapacityCard';
export type { CapacityCardProps } from './CapacityCard';

export { FacilityChips } from './FacilityChips';
export type { FacilityChipsProps } from './FacilityChips';

export { AdditionalServicesList } from './AdditionalServicesList';
export type { AdditionalServicesListProps } from './AdditionalServicesList';

export { ContactInfoCard } from './ContactInfoCard';
export type { ContactInfoCardProps } from './ContactInfoCard';

export { LocationCard } from './LocationCard';
export type { LocationCardProps } from './LocationCard';

export { OpeningHoursCard } from './OpeningHoursCard';
export type { OpeningHoursCardProps } from './OpeningHoursCard';

export { AvailabilityCalendar } from './AvailabilityCalendar';
export type { AvailabilityCalendarProps } from './AvailabilityCalendar';

export { RentalObjectAvailabilityCalendar } from './RentalObjectAvailabilityCalendar';
export type { RentalObjectAvailabilityCalendarProps } from './RentalObjectAvailabilityCalendar';

export { GuidelinesTab } from './GuidelinesTab';
export type { GuidelinesTabProps } from './GuidelinesTab';

export { FAQTab } from './FAQTab';
export type { FAQTabProps } from './FAQTab';

export { ImageSlider } from './ImageSlider';
export type { ImageSliderProps } from './ImageSlider';

export { PriceSummaryCard } from './PriceSummaryCard';
export type { PriceSummaryCardProps, PriceLineItem } from './PriceSummaryCard';

// Booking Flow Components
export { BookingFormModal } from './BookingFormModal';
export type { BookingFormModalProps } from './BookingFormModal';

export { BookingConfirmation } from './BookingConfirmation';
export type { BookingConfirmationProps } from './BookingConfirmation';

export { BookingSuccess } from './BookingSuccess';
export type { BookingSuccessProps } from './BookingSuccess';

export { BookingSection } from './BookingSection';
export type { BookingSectionProps } from './BookingSection';

// Unified Booking Engine - Dynamic booking system for all listing types
// TODO: Create UnifiedBookingEngine component or remove export
// export { UnifiedBookingEngine } from './UnifiedBookingEngine';
// export type { UnifiedBookingEngineProps } from './UnifiedBookingEngine';

// Key Facts Row - Display key listing information
export { KeyFactsRow } from './KeyFactsRow';
export type { KeyFactsRowProps, KeyFact, KeyFactType } from './KeyFactsRow';

// Interactive Action Buttons
export { FavoriteButton } from './FavoriteButton';
export type { FavoriteButtonProps } from './FavoriteButton';

export { ShareButton, ShareSheet } from './ShareButton';
export type { ShareButtonProps, ShareSheetProps, ShareData, SharePlatform } from './ShareButton';

// Tabbed Navigation for Rental Object Details
export { RentalObjectTabs, TabContent, TabEmptyState } from './RentalObjectTabs';
export type { RentalObjectTabsProps, TabConfig, TabContentProps, TabEmptyStateProps } from './RentalObjectTabs';

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
export type { ErrorBoundaryProps, WithErrorBoundaryOptions } from './ErrorBoundary';

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



// Season Blocks
export { SeasonCard } from './seasons';
export type { SeasonCardProps, SeasonCardData, SeasonStatus } from './seasons';

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
