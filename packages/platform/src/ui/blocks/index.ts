/**
 * Blocks
 *
 * Business-logic components composed from primitives and composed components
 */

// =============================================================================
// PLATFORM-NEUTRAL BLOCKS (remain in @xalatechnologies/platform/ui)
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

// Dashboard Components (StatCard exported as BlockStatCard to avoid conflict with composed/StatCard)
export {
  StatCard as BlockStatCard,
  ActivityItem,
  ActivityFeed,
  QuickActionCard,
  formatTimeAgo,
  mapBookingStatusToActivity,
} from './DashboardComponents';
export type {
  StatCardProps as BlockStatCardProps,
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
// NOTE: Domain-specific components are available in @digilist/ui:
// - RentalObject* (Card, Grid, ListItem, Toolbar, Map, TableView, DetailHeader, Tabs)
// - Booking* (FormModal, Confirmation, Success, PriceSummaryCard)
// - Season* (SeasonCard, VenueCard)
// - Amenity/Facility chips and calendars
// 
// The platform/ui package provides the foundational design system.
// @digilist/ui builds on top of it for domain-specific components.
// =============================================================================

