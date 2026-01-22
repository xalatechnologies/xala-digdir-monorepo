/**
 * @digilist/ui/compat
 *
 * Platform UI compatibility components.
 * Re-exports Designsystemet components + custom platform components.
 */

// =============================================================================
// Re-export Designsystemet React Components
// =============================================================================

export {
  // Layout
  Card,
  Divider,
  // Typography
  Heading,
  Paragraph,
  Label,
  // Form elements
  Button,
  Checkbox,
  Radio,
  Select,
  Textfield,
  Textarea,
  Switch,
  Input,
  // Feedback
  Alert,
  Badge,
  Spinner,
  // Navigation
  Tabs,
  Breadcrumbs,
  Link,
  Pagination,
  // Overlays
  Dialog,
  Popover,
  Tooltip,
  // Data display
  Table,
  Tag,
  Chip,
  Avatar,
  // Utilities
  ValidationMessage,
  Field,
  FieldDescription,
  Combobox,
  Search,
  Skeleton,
  ToggleGroup,
} from '@digdir/designsystemet-react';

// Backwards compatibility aliases
export { Dialog as Modal } from '@digdir/designsystemet-react';
export { ValidationMessage as ErrorMessage } from '@digdir/designsystemet-react';
export { FieldDescription as HelpText } from '@digdir/designsystemet-react';

// Re-export types (only those that exist)
export type {
  ButtonProps,
  CardProps,
  HeadingProps,
  ParagraphProps,
  AlertProps,
  BadgeProps,
  CheckboxProps,
  RadioProps,
  SelectProps,
  TextfieldProps,
  DialogProps,
} from '@digdir/designsystemet-react';

// Backwards compatibility type alias
export type { DialogProps as ModalProps } from '@digdir/designsystemet-react';

// =============================================================================
// Custom Platform Components
// =============================================================================

export * from './components';

// cn utility function
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// =============================================================================
// Icons
// =============================================================================

export {
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  MessageIcon,
  SettingsIcon,
  RepeatIcon,
  UsersIcon,
  UserIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  StarIcon,
  LogOutIcon,
  CloseIcon,
  CheckIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon,
  CopyIcon,
  ShieldCheckIcon,
  ClipboardListIcon,
  DownloadIcon,
  FilterIcon,
  ArrowLeftIcon,
  SearchIcon,
  LockIcon,
  CreditCardIcon,
  TableIcon,
  BuildingIcon,
  MenuIcon,
  BarChartIcon,
  BarChart,
  DropdownIcon,
} from './icons';

// =============================================================================
// Hooks
// =============================================================================

export { useTheme } from './hooks/useTheme';
export { useMediaQuery } from './hooks/useMediaQuery';
export { useBreakpoint } from './hooks/useBreakpoint';

// =============================================================================
// Types
// =============================================================================

export type { CalendarSelection, CalendarCell, CalendarSlot, CalendarMode, CalendarConfig } from './types/calendar';
export type { NavItem, NavGroup, SidebarNavItem, SidebarSection, BottomNavigationItem } from './types/navigation';
export type { ThemeConfig, ColorScheme } from './types/theme';
