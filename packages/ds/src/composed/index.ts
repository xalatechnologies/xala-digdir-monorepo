/**
 * Composed Components
 * 
 * Higher-level components built from primitives
 */

export { ContentLayout } from './content-layout';
export type { ContentLayoutProps } from './content-layout';

export { ContentSection } from './content-section';
export type { ContentSectionProps } from './content-section';

export { PageHeader } from './page-header';
export type { PageHeaderProps } from './page-header';

// Header Components
export { AppHeader } from './header';
export type { AppHeaderProps } from './header';

export {
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderActionButton,
  HeaderIconButton,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton
} from './header-parts';
export type {
  HeaderLogoProps,
  HeaderSearchProps,
  HeaderActionsProps,
  HeaderIconButtonProps,
  HeaderThemeToggleProps,
  HeaderLanguageSwitchProps,
  HeaderLoginButtonProps,
  SearchResultItem,
  SearchResultGroup
} from './header-parts';

// Navigation
export { Navigation, NavigationLink } from './navigation';
export type { NavigationProps, NavigationLinkProps } from './navigation';

// Filter Bar
export { FilterBar } from './filter-bar';
export type { FilterBarProps } from './filter-bar';

// Filter Types
export type {
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
  FilterConfig
} from '../types/filters';
export { mockFilterData } from '../types/filters';

// Drawer / Slide Panel
export { Drawer, DrawerSection, DrawerItem, DrawerEmptyState } from './Drawer';
export type {
  DrawerProps,
  DrawerPosition,
  DrawerSize,
  DrawerSectionProps,
  DrawerItemProps,
  DrawerEmptyStateProps
} from './Drawer';

// Breadcrumb
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbProps } from './Breadcrumb';

// Booking Stepper
export { BookingStepper } from './BookingStepper';
export type { BookingStepperProps } from './BookingStepper';
export { WizardStepper } from './WizardStepper';
export type { WizardStepperProps, WizardStep } from './WizardStepper';

// Dialogs
export {
  ConfirmDialog,
  AlertDialog,
  DialogProvider,
  useDialog
} from './dialogs';
export type {
  ConfirmDialogProps,
  AlertDialogProps,
  DialogVariant
} from './dialogs';

// Mobile Navigation
export { MobileNav, MobileNavToggle } from './mobile-nav';
export type {
  MobileNavProps,
  MobileNavToggleProps,
  MobileNavItem,
  MobileNavSection
} from './mobile-nav';

export { BottomNavigation } from './bottom-navigation';
export type {
  BottomNavigationProps,
  BottomNavigationItem
} from './bottom-navigation';

// Language Switcher
export { LanguageSwitcher, ConnectedLanguageSwitcher } from './LanguageSwitcher';
export type {
  LanguageSwitcherProps,
  LanguageSwitcherVariant,
  LanguageSwitcherSize,
  LocaleLabels,
  ConnectedLanguageSwitcherProps
} from './LanguageSwitcher';

// RentalObjectCalendar (XALA-compliant shared calendar)
export { RentalObjectCalendar } from './RentalObjectCalendar';
export type {
  RentalObjectCalendarProps,
  CalendarSlot,
  CalendarMode,
  SlotStatus as CalendarSlotStatus,
  CalendarAction,
  CalendarConfig,
  CalendarSelection,
} from './RentalObjectCalendar';

// Demo Login Dialog
export { DemoLoginDialog } from './DemoLoginDialog';
export type {
  DemoLoginDialogProps,
  DemoLoginFormData
} from './DemoLoginDialog';

// Demo Role Switcher (one-click demo login by role)
export { DemoRoleSwitcher } from './DemoRoleSwitcher';
export type {
  DemoRoleSwitcherProps,
  DemoRoleKey,
  DemoRoleOption
} from './DemoRoleSwitcher';

// Global Search
export { GlobalSearch } from './GlobalSearch';

// Protected Route
export { ProtectedRoute } from './ProtectedRoute';
export type {
  ProtectedRouteProps,
  ProtectedRouteLoginState,
} from './ProtectedRoute';

// Data Page Components
export {
  EmptyState,
  StatusTabs,
  BulkActionsBar,
  FilterChips,
  DataPageHeader,
  DataPageToolbar,
  Wizard,
  WizardNavigation,
} from './data-page';
export type {
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
  FilterConfig as DataPageFilterConfig,
  ViewMode,
  WizardProps,
  WizardNavigationProps,
} from './data-page';

// DataTable Components
export { DataTable } from './DataTable';
export type {
  DataTableProps,
  ColumnDef,
  SortDirection,
} from './DataTable';

// TableFilter Component
export { TableFilter } from './TableFilter';
export type {
  TableFilterProps,
  FilterValues,
} from './TableFilter';
export type { FilterConfig as TableFilterDef, FilterOption as TableFilterOption } from './TableFilter';

// UserMenu Component
export { UserMenu } from './UserMenu';
export type { UserMenuProps, UserMenuItem, UserMenuUser } from './UserMenu';

// ListToolbar Component
export {
  ListToolbar,
  type ListToolbarProps,
  type ListToolbarFilter,
  type ListToolbarFilterOption,
  type ListToolbarSearchConfig,
  type ListToolbarSortOption,
} from './ListToolbar';

export { DashboardHeader } from './DashboardHeader';
export type { DashboardHeaderProps, DashboardHeaderUser } from './DashboardHeader';

export { DashboardPageHeader } from './DashboardPageHeader';
export type { DashboardPageHeaderProps, PageHeaderMetaItem, PageHeaderTab } from './DashboardPageHeader';
