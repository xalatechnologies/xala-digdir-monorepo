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

// Toast Notifications
export { ToastProvider, useToast } from './Toast';
export type {
  ToastOptions,
  Toast,
  ToastVariant,
  ToastPosition,
  ToastContextValue,
  ToastProviderProps,
} from './Toast';

// Alert (inline banners)
export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';

// Modal
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export type {
  ModalProps,
  ModalSize,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from './Modal';

// Table Conditions Filter (advanced filter builder)
export { TableConditionsFilter, useTableConditions } from './TableConditionsFilter';
export type {
  TableConditionsFilterProps,
  Condition,
  ConditionField,
  ConditionFieldOption,
  ConditionOperator,
  FieldType,
  LogicOperator,
  UseTableConditionsReturn,
} from './TableConditionsFilter';

// Filter Chips Bar (active filters display)
export { FilterChipsBar } from './FilterChipsBar';
export type { FilterChipsBarProps, ActiveFilter } from './FilterChipsBar';

// Filter Panel (dropdown filter builder)
export { FilterPanel } from './FilterPanel';
export type {
  FilterPanelProps,
  FilterCondition,
  FilterField,
  FilterFieldOption,
  FilterFieldType,
  FilterLogic,
  FilterOperator,
} from './FilterPanel';

// Action Button Group (consistent table actions)
export { ActionButtonGroup, TableActions } from './ActionButtonGroup';
export type {
  ActionButtonGroupProps,
  TableActionsProps,
  Action,
  ActionType,
} from './ActionButtonGroup';

// Stat Card (dashboard statistics)
export { StatCard, StatCardGrid } from './StatCard';
export type {
  StatCardProps,
  StatCardGridProps,
  StatTrend,
  StatVariant,
} from './StatCard';

// Section Card (page sections)
export { SectionCard, SectionCardHeader, SectionCardContent, SectionCardFooter } from './SectionCard';
export type {
  SectionCardProps,
  SectionCardHeaderProps,
  SectionCardContentProps,
  SectionCardFooterProps,
} from './SectionCard';

// Avatar (user avatars with initials fallback)
export { Avatar, AvatarGroup, UserInfo } from './Avatar';
export type {
  AvatarProps,
  AvatarGroupProps,
  UserInfoProps,
  AvatarSize,
} from './Avatar';

// Accessibility Statement (Norwegian universal design compliance)
export { AccessibilityStatement } from './AccessibilityStatement';
export type {
  AccessibilityStatementProps,
  ConformanceLevel,
  WCAGLevel,
  KnownIssue,
  AccessibilityContact,
} from './AccessibilityStatement';

// Page Shell Components (List, Detail, Form page layouts)
export { 
  PageHeader as ShellPageHeader, 
  ListPageShell, 
  DetailPageShell, 
  FormPageShell 
} from './PageShell';
export type {
  PageHeaderProps as ShellPageHeaderProps,
  ListPageShellProps,
  DetailPageShellProps,
  FormPageShellProps,
} from './PageShell';

// Status Banner (contextual status displays)
export { StatusBanner } from './StatusBanner';
export type { StatusBannerProps, StatusBannerVariant } from './StatusBanner';

// Detail Field Components (labeled data display)
export {
  DetailField,
  DetailFieldGroup,
  DetailCard,
  MonoField,
  LinkField,
} from './DetailField';
export type {
  DetailFieldProps,
  DetailFieldGroupProps,
  DetailCardProps,
  MonoFieldProps,
  LinkFieldProps,
} from './DetailField';

// Page States (Loading, Empty, NotFound, Error)
export {
  LoadingState,
  EmptyState as PageEmptyState,
  NotFoundState,
  ErrorState,
} from './PageStates';
export type {
  LoadingStateProps,
  EmptyStateProps as PageEmptyStateProps,
  NotFoundStateProps,
  ErrorStateProps,
} from './PageStates';

// Table Row Actions (dropdown menu for table actions)
export {
  TableRowActions,
  createViewAction,
  createEditAction,
  createDeleteAction,
  createDuplicateAction,
} from './TableRowActions';
export type {
  TableRowActionsProps,
  RowAction,
  ActionVariant,
} from './TableRowActions';

// Rich Text Editor
export { RichTextEditor } from './RichTextEditor';
export type { RichTextEditorProps, TextFormat } from './RichTextEditor';

// File Uploader
export { FileUploader } from './FileUploader';
export type { FileUploaderProps, UploadedFile } from './FileUploader';

// PDF Preview
export { PDFPreview } from './PDFPreview';
export type { PDFPreviewProps } from './PDFPreview';

// Template Canvas (Email/Invoice template builder)
export { TemplateCanvas, BlockPalette } from './TemplateCanvas';
export type {
  TemplateCanvasProps,
  BlockPaletteProps,
  TemplateBlock,
  TemplatePlaceholder,
  BlockType,
} from './TemplateCanvas';

// Confirm Dialog & Action Dialog (Rich version with async support)
export { 
  ConfirmDialog as RichConfirmDialog, 
  ActionDialog, 
  useConfirmDialog 
} from './ConfirmDialog';
export type {
  ConfirmDialogProps as RichConfirmDialogProps,
  ActionDialogProps,
  DialogVariant as RichDialogVariant,
  UseConfirmDialogOptions,
} from './ConfirmDialog';

// Stepper & Wizard (Multi-step form navigation)
export { 
  Stepper, 
  Wizard as FormWizard, 
  useWizard 
} from './Stepper';
export type {
  StepperProps,
  WizardProps as FormWizardProps,
  Step,
  StepStatus,
} from './Stepper';

// Stats Grid & Mini Stats
export { StatsGrid, StatCardEnhanced, MiniStat } from './StatsGrid';
export type {
  StatsGridProps,
  StatCardEnhancedProps,
  StatItem,
  TrendDirection,
  MiniStatProps,
} from './StatsGrid';

// Timeline & Activity Feed
export { Timeline, CompactTimeline } from './Timeline';
export type {
  TimelineProps,
  TimelineItem,
  TimelineItemType,
  CompactTimelineProps,
} from './Timeline';

// Date Range Picker
export { DateRangePicker } from './DateRangePicker';
export type {
  DateRangePickerProps,
  DateRange,
  DatePreset,
} from './DateRangePicker';

// Searchable Select / Combobox
export { SearchableSelect } from './SearchableSelect';
export type {
  SearchableSelectProps,
  SelectOption,
} from './SearchableSelect';

// Rich Notification Toast (with queue management)
export { 
  ToastProvider as RichToastProvider, 
  useToast as useRichToast, 
  toast as richToast, 
  setGlobalToastHandler 
} from './NotificationToast';
export type {
  ToastProviderProps as RichToastProviderProps,
  Toast as RichToast,
  ToastOptions as RichToastOptions,
  ToastType as RichToastType,
  ToastPosition as RichToastPosition,
  ToastContextValue as RichToastContextValue,
} from './NotificationToast';

// Breadcrumbs
export { Breadcrumbs, useBreadcrumbs } from './Breadcrumbs';
export type {
  BreadcrumbsProps,
  BreadcrumbItem,
  UseBreadcrumbsOptions,
} from './Breadcrumbs';

// Command Palette (Cmd+K)
export { CommandPalette, useCommandPalette } from './CommandPalette';
export type {
  CommandPaletteProps,
  CommandItem,
  CommandGroup,
} from './CommandPalette';

// Form Layout Components
export { FormSection, FormActions, FormRow, FormField, FormDivider } from './FormLayout';
export type {
  FormSectionProps,
  FormActionsProps,
  FormRowProps,
  FormFieldProps,
  FormDividerProps,
} from './FormLayout';
