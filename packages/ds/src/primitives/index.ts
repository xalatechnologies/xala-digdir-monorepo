/**
 * Primitives
 * 
 * Low-level building blocks for the design system
 */

// Responsive types (must be first for Grid/Stack)
export * from './responsive-types';

export { Container } from './container';
export type { ContainerProps, ContainerSize } from './container';

export { Grid } from './grid';
export type { GridProps, GridGapSize, GridColCount, ResponsiveCols, GridPaddingSize, ResponsivePadding } from './grid';

// New primitives from platform-ui
export { Box } from './box';
export { Center } from './center';
export type { CenterProps } from './center';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';

export {
  SimpleSidebar,
  SidebarHeaderArea,
  SidebarPanel,
  SidebarScrollArea,
} from './sidebar';
export type {
  SimpleSidebarProps,
  SidebarHeaderAreaProps,
  SidebarPanelProps,
  SidebarScrollAreaProps,
} from './sidebar';

export { HorizontalLayout } from './horizontal-layout';
export type { HorizontalLayoutProps } from './horizontal-layout';

export { Stack } from './stack';
export type { StackProps } from './stack';

export { Icon } from './icon';
export type { IconProps } from './icon';

export { Card } from './card';
export type { CardProps } from './card';

export { Text } from './text';
export type { TextProps } from './text';

export { Badge } from './badge';
export type { BadgeProps } from './badge';

export {
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
} from './icons';

// Re-export from layout-grid for backward compatibility
export { LayoutGrid } from './layout-grid';
export type { LayoutGridProps } from './layout-grid';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { Progress } from './progress';
export type { ProgressProps } from './progress';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { FilterChip } from './FilterChip';
export type { FilterChipProps } from './FilterChip';

export { Logo } from './Logo';
export type { LogoProps } from './Logo';
