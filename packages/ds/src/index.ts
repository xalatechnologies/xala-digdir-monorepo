/**
 * @xala/ds
 * 
 * Xala Design System - Production-ready components built on Digdir Designsystemet
 * 
 * ## Component Hierarchy
 * 
 * ### Primitives (Low-level)
 * - Container, Grid, Stack - Layout primitives
 * - Button, Input, Card, etc. - From @digdir/designsystemet-react
 * 
 * ### Composed (Mid-level)
 * - ContentLayout, ContentSection, PageHeader
 * - Built from primitives
 * 
 * ### Blocks (Business logic)
 * - StatsGrid, KPICard, FormBlock (coming soon)
 * - Built from composed components
 * 
 * ### Shells (Application level)
 * - AppShell - Complete application layout
 * - Built from blocks and composed components
 * 
 * @example
 * ```tsx
 * import { AppShell, ContentLayout, ContentSection, Grid } from '@xala/ds';
 * 
 * function MyApp() {
 *   return (
 *     <AppShell title="My App">
 *       <ContentLayout>
 *         <ContentSection title="Dashboard">
 *           <Grid columns="repeat(3, 1fr)" gap={24}>
 *             <Card>Content</Card>
 *           </Grid>
 *         </ContentSection>
 *       </ContentLayout>
 *     </AppShell>
 *   );
 * }
 * ```
 */

// =============================================================================
// Re-export everything from Digdir Designsystemet
// =============================================================================
export * from '@digdir/designsystemet-react';

// =============================================================================
// Custom Primitives
// =============================================================================
export { NativeSelect } from './primitives/NativeSelect';
export type { NativeSelectProps } from './primitives/NativeSelect';

// =============================================================================
// Provider
// =============================================================================
export * from './provider';

// Theme management
export { ThemeProvider, useTheme } from './ThemeProvider';
export type { ThemeProviderProps, ThemeContextValue } from './ThemeProvider';

// =============================================================================
// Component Layers - Import from specific layers
// =============================================================================

// Shells - High-level layout components
export { AppShell, AppLayout, DashboardSidebar, DashboardContent } from './shells';
export type { AppShellProps, AppLayoutProps, DashboardSidebarProps, SidebarNavItem, SidebarSection, DashboardContentProps } from './shells';

// Composed - Mid-level components
export {
  ContentLayout,
  ContentSection,
  PageHeader,
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderActionButton,
  HeaderIconButton,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton,
  Navigation,
  NavigationLink,
  FilterBar,
  Drawer,
  DrawerSection,
  DrawerItem,
  DrawerEmptyState,
  Breadcrumb,
  BookingStepper,
  BottomNavigation,
  // Dialogs
  DialogProvider,
  useDialog,
  ConfirmDialog,
  AlertDialog,
  DemoLoginDialog,
  DemoRoleSwitcher,
  GlobalSearch,
  ProtectedRoute,
  // Data Page Components
  EmptyState,
  StatusTabs,
  BulkActionsBar,
  FilterChips,
  DataPageHeader,
  DataPageToolbar,
  Wizard,
  WizardStepper,
  WizardNavigation,
  // DataTable Components
  DataTable,
  TableFilter,
  // ListToolbar
  ListToolbar,
  // DashboardHeader
  DashboardHeader,
  // DashboardPageHeader
  DashboardPageHeader,
  // LoadingFallback (Suspense fallback)
  LoadingFallback,
  // Form Layout Components
  FormSection,
  FormActions,
  FormRow,
  FormDivider,
} from './composed';
export type {
  ProtectedRouteProps,
  ProtectedRouteLoginState,
  // Data Page Component Types
  EmptyStateProps,
  EmptyStateVariant,
  StatusTabsProps,
  StatusTabItem,
  BulkActionsBarProps,
  BulkAction,
  FilterChipsProps,
  FilterChip,
  DataPageHeaderProps,
  DataPageToolbarProps,
  DataPageFilterConfig,
  ViewMode,
  WizardProps,
  WizardStep,
  WizardStepperProps,
  WizardNavigationProps,
  // DataTable Types
  DataTableProps,
  ColumnDef,
  SortDirection,
  TableFilterProps,
  TableFilterDef,
  TableFilterOption,
  FilterValues,
  // ListToolbar Types
  ListToolbarProps,
  ListToolbarFilter,
  ListToolbarFilterOption,
  ListToolbarSearchConfig,
  ListToolbarSortOption,
  // DashboardHeader Types
  DashboardHeaderProps,
  DashboardHeaderUser,
  // DashboardPageHeader Types
  DashboardPageHeaderProps,
  PageHeaderMetaItem,
  PageHeaderTab,
} from './composed';
export { mockFilterData } from './composed';

// Pages - Full-page layouts
export { LoginPage } from './pages';
export type { LoginPageProps } from './pages';

export type {
  ContentLayoutProps,
  ContentSectionProps,
  PageHeaderProps,
  AppHeaderProps,
  HeaderLogoProps,
  HeaderSearchProps,
  HeaderActionsProps,
  HeaderIconButtonProps,
  HeaderThemeToggleProps,
  HeaderLanguageSwitchProps,
  HeaderLoginButtonProps,
  NavigationProps,
  NavigationLinkProps,
  FilterBarProps,
  SearchResultItem,
  SearchResultGroup,
  ListingType,
  VenueType,
  PriceUnit,
  AvailabilityStatus,
  FilterOption,
  PriceRangeFilter,
  CapacityRangeFilter,
  RatingFilter,
  LocationFilter,
  FacilitiesFilter,
  DateTimeFilter,
  FilterState,
  DrawerProps,
  DrawerPosition,
  DrawerSize,
  DrawerSectionProps,
  DrawerItemProps,
  DrawerEmptyStateProps,
  BreadcrumbProps,
  BookingStepperProps,
  BottomNavigationProps,
  BottomNavigationItem,
  // Dialog Types
  ConfirmDialogProps,
  AlertDialogProps,
  DialogVariant,
  DemoLoginDialogProps,
  DemoLoginFormData,
  DemoRoleSwitcherProps,
  DemoRoleKey,
  DemoRoleOption,
} from './composed';

// Primitives - Low-level building blocks
export {
  Container,
  Grid,
  Stack,
  Icon,
  Card,
  Text,
  Badge,
  SunIcon,
  MoonIcon,
  SearchIcon,
  GlobeIcon,
  UserIcon,
  UserMinusIcon,
  UserCheckIcon,
  LogOutIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  MapIcon,
  MapPinIcon,
  CalendarIcon,
  PeopleIcon,
  ShoppingCartIcon,
  BellIcon,
  HeartIcon,
  SettingsIcon,
  LayoutGrid, // For backward compatibility
  CheckIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ProjectorIcon,
  WifiIcon,
  BoardIcon,
  VideoIcon,
  InfoIcon,
  CloseIcon,
  SparklesIcon,
  UsersIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldIcon,
  ShieldCheckIcon,
  PlatformIcon,
  AutomationIcon,
  TrendUpIcon,
  TrendDownIcon,
  DownloadIcon,
  MoreVerticalIcon,
  HomeIcon,
  BuildingIcon,
  InboxIcon,
  BookOpenIcon,
  RepeatIcon,
  MessageIcon,
  ChartIcon,
  ArrowRightIcon,
  XCircleIcon,
  PlusIcon,
  MessageSquareIcon,
  IdPortenIcon,
  MicrosoftIcon,
  GoogleIcon,
  BankIdIcon,
  VippsIcon,
  SendIcon,
  OrganizationIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon,
  PaperclipIcon,
  XIcon,
  SaveIcon,
  CopyIcon,
  EyeIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  FileTextIcon,
  ClipboardListIcon,
  PlayIcon,
  PauseIcon,
  LockIcon,
  UnlockIcon,
  UploadIcon,
  CameraIcon,
  ImageIcon,
  TableIcon,
  KeyIcon,
  RefreshCwIcon,
  DatabaseIcon,
  ToggleLeftIcon,
  CreditCardIcon,
  StorageIcon,
  FormField,
  Progress,
  CodeBlock,
} from './primitives';
export type {
  ContainerProps,
  GridProps,
  StackProps,
  IconProps,
  CardProps,
  TextProps,
  BadgeProps,
  LayoutGridProps,
  FormFieldProps,
  ProgressProps,
  CodeBlockProps,
} from './primitives';

// Blocks - Business logic components
export {
  RentalObjectCard,
  RentalObjectListItem,
  RentalObjectGrid,
  RentalObjectToolbar,
  RentalObjectMap,
  RentalObjectTableView,
  // TODO: RentalObjectsFilterBar - component not yet implemented
  ImageGallery,
  ImageSlider,
  RentalObjectDetailHeader,
  CapacityCard,
  FacilityChips,
  AdditionalServicesList,
  ContactInfoCard,
  LocationCard,
  OpeningHoursCard,
  AvailabilityCalendar,
  RentalObjectAvailabilityCalendar,
  GuidelinesTab,
  FAQTab,
  PriceSummaryCard,
  BookingFormModal,
  BookingConfirmation,
  BookingSuccess,
  BookingSection,
  // TODO: UnifiedBookingEngine - component not yet implemented
  // New listing detail components
  KeyFactsRow,
  FavoriteButton,
  ShareButton,
  ShareSheet,
  RentalObjectTabs,
  TabContent,
  TabEmptyState,
  RequireAuthModal,
  LoginOption,
  FeatureItem,
  IntegrationBadge,
  LoginFooterLink,
  LoginLayout,
  StatCard,
  ActivityItem,
  ActivityFeed,
  QuickActionCard,
  formatTimeAgo,
  mapBookingStatusToActivity,
  // Status Badge Components
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
  // Chart Components
  BarChart,
  VerticalBarChart,
  // Auth UI Components
  LoadingScreen,
  AccessDeniedScreen,
  NotFoundScreen,
  ErrorScreen,
  PermissionGate,
  // Messaging Components
  NotificationBell,
  ConversationList,
  ConversationListItem,
  MessageBubble,
  ChatThread,
  // Error Handling Components
  ErrorBoundary,
  withErrorBoundary,
  GlobalErrorHandler,
  useGlobalError,
  // GDPR Components
  ConsentPopup,
  ConsentSettings,
  DataSubjectRequestForm,
  // Account Management Components
  AccountSwitcher,
  AccountSelector,
  AccountSelectionModal,
} from './blocks';
export type {
  RentalObjectCardProps,
  RentalObjectCardVariant,
  RentalObjectListItemProps,
  RentalObjectGridProps,
  RentalObjectToolbarProps,
  RentalObjectMapProps,
  MapRentalObject,
  RentalObjectTableViewProps,
  // ViewMode already exported from composed at line 140
  ImageGalleryProps,
  ImageSliderProps,
  RentalObjectDetailHeaderProps,
  CapacityCardProps,
  FacilityChipsProps,
  AdditionalServicesListProps,
  ContactInfoCardProps,
  LocationCardProps,
  OpeningHoursCardProps,
  AvailabilityCalendarProps,
  RentalObjectAvailabilityCalendarProps,
  GuidelinesTabProps,
  FAQTabProps,
  PriceSummaryCardProps,
  PriceLineItem,
  BookingFormModalProps,
  BookingConfirmationProps,
  BookingSuccessProps,
  BookingSectionProps,
  // TODO: UnifiedBookingEngineProps - type not yet implemented
  // New listing detail types
  KeyFactsRowProps,
  KeyFact,
  KeyFactType,
  FavoriteButtonProps,
  ShareButtonProps,
  ShareSheetProps,
  ShareData,
  SharePlatform,
  RentalObjectTabsProps,
  TabConfig,
  TabContentProps,
  TabEmptyStateProps,
  RequireAuthModalProps,
  LoginOptionProps,
  FeatureItemProps,
  IntegrationBadgeProps,
  LoginFooterLinkProps,
  LoginLayoutProps,
  StatCardProps,
  ActivityItemProps,
  ActivityStatus,
  ActivityFeedProps,
  QuickActionProps,
  // Status Badge Types
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
  // Chart Types
  BarChartDataItem,
  BarChartProps,
  VerticalBarChartProps,
  // Auth UI Types
  LoadingScreenProps,
  AccessDeniedScreenProps,
  NotFoundScreenProps,
  ErrorScreenProps,
  PermissionGateProps,
  // Messaging Types
  NotificationBellProps,
  ConversationListProps,
  ConversationListItemProps,
  ConversationItem,
  MessageBubbleProps,
  MessageItem,
  ChatThreadProps,
  // Error Handling Types
  ErrorBoundaryProps,
  WithErrorBoundaryOptions,
  GlobalErrorHandlerProps,
  GlobalError,
  UseGlobalErrorOptions,
} from './blocks';

// Listing Detail Types
export type {
  TimeSlotStatus,
  GalleryImage,
  Facility,
  AdditionalService,
  ContactInfo,
  Coordinates,
  OpeningHoursDay,
  TimeSlot,
  BreadcrumbItem,
  BookingStep,
  BookingDetails,
  BookingState,
  GuidelineSection,
  FAQItem,
  ListingDetail,
  ActivityType,
  CalendarSelection,
  CalendarCell,
  CalendarSelectionType,
  CalendarSelectionRange
} from './types/listing-detail';

// Booking Engine Types
export type {
  BookingMode,
  BookingPriceUnit,
  SlotStatus,
  AvailabilitySlot,
  DayAvailability,
  BookingPricing,
  BookingRules,
  DaySchedule,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  PriceItem,
  BookingPriceCalculation,
  BookingStepConfig
} from './types/booking';

export {
  getBookingSteps,
  determineBookingMode,
  formatPrice,
  formatPriceUnit
} from './types/booking';

// Rental Object Management Types
export type {
  RentalObjectQueryFilters,
  // ViewMode already exported from composed
  RentalObjectFilterState,
  ListingStatus,
  // ListingType already exported from composed
  RentalObjectStatus,
  RentalObjectType
} from './types/rental-objects';

// Rental Object Management Constants
export {
  TYPE_TABS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  CAPACITY_OPTIONS
} from './constants/rental-objects';

// =============================================================================
// Design System Utilities & Tokens
// =============================================================================
export {
  cn,
  spacing,
  interactiveBackgrounds,
  badgeStyles,
  menuItemStyles,
  emptyStateStyles,
  buttonTextColors,
  logoStyles,
  brandColors,
  brandColorsCss,
} from './utils';

// =============================================================================
// API Error Utilities (RFC 7807 Problem Details)
// =============================================================================
export {
  parseApiError,
  parseErrorObject,
  getStatusMessage,
  formatFieldErrors,
  shouldOfferRetry,
  createProblemDetails,
} from './utils/api-error';
export type {
  ProblemDetails,
  ParsedApiError,
  ApiErrorCategory,
} from './utils/api-error';

// =============================================================================
// CSS Import Policy
// =============================================================================
/** 
 * We intentionally do NOT export Digdir CSS from this module. Applications
 * must import '@xala/ds/styles' exactly once in their entry point to ensure
 * proper theme switching and prevent CSS duplication.
 */

// Season Blocks
export { SeasonCard } from './blocks/seasons';
export type { SeasonCardProps, SeasonCardData, SeasonStatus } from './blocks/seasons';

export { VenueCard } from './blocks/seasons';
export type { VenueCardProps, VenueCardData } from './blocks/seasons';

export { SettingsTabLayout, SettingsField, SettingsSection, PreferencesTab, ProfileTab } from './blocks/settings';
export type { SettingsTabLayoutProps, SettingsFieldProps, SettingsSectionProps, PreferencesTabProps, ProfileTabProps, ProfileData } from './blocks/settings';

export { NotificationItem, NotificationList } from './blocks/notifications';
export type { NotificationItemProps, NotificationItemData, NotificationListProps } from './blocks/notifications';

export { ProfileCard, QuickStat } from './blocks/profile';
export type { ProfileCardProps, ProfileCardData, QuickStatProps } from './blocks/profile';

