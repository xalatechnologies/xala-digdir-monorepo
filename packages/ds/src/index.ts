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
// Provider
// =============================================================================
export * from './provider';

// =============================================================================
// Component Layers - Import from specific layers
// =============================================================================

// Shells - High-level layout components
export { AppShell } from './shells';
export type { AppShellProps } from './shells';

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
  BookingStepper
} from './composed';
export { mockFilterData } from './composed';
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
  FilterConfig,
  DrawerProps,
  DrawerPosition,
  DrawerSize,
  DrawerSectionProps,
  DrawerItemProps,
  DrawerEmptyStateProps,
  BreadcrumbProps,
  BookingStepperProps
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
} from './primitives';
export type {
  ContainerProps,
  GridProps,
  StackProps,
  IconProps,
  CardProps,
  TextProps,
  BadgeProps,
  LayoutGridProps
} from './primitives';

// Blocks - Business logic components
export {
  ListingCard,
  ListingListItem,
  ListingGrid,
  ListingToolbar,
  ListingMap,
  ImageGallery,
  ImageSlider,
  ListingDetailHeader,
  CapacityCard,
  FacilityChips,
  AdditionalServicesList,
  ContactInfoCard,
  LocationCard,
  OpeningHoursCard,
  AvailabilityCalendar,
  GuidelinesTab,
  FAQTab,
  PriceSummaryCard,
  BookingFormModal,
  BookingConfirmation,
  BookingSuccess
} from './blocks';
export type {
  ListingCardProps,
  ListingCardVariant,
  ListingListItemProps,
  ListingGridProps,
  ListingToolbarProps,
  ListingMapProps,
  MapListing,
  ViewMode,
  ImageGalleryProps,
  ImageSliderProps,
  ListingDetailHeaderProps,
  CapacityCardProps,
  FacilityChipsProps,
  AdditionalServicesListProps,
  ContactInfoCardProps,
  LocationCardProps,
  OpeningHoursCardProps,
  AvailabilityCalendarProps,
  GuidelinesTabProps,
  FAQTabProps,
  PriceSummaryCardProps,
  PriceLineItem,
  BookingFormModalProps,
  BookingConfirmationProps,
  BookingSuccessProps
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
  ActivityType
} from './types/listing-detail';

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
// CSS Import Policy
// =============================================================================
/** 
 * We intentionally do NOT export Digdir CSS from this module. Applications
 * must import '@xala/ds/styles' exactly once in their entry point to ensure
 * proper theme switching and prevent CSS duplication.
 */
