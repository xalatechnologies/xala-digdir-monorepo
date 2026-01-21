/**
 * Primitives
 * 
 * Low-level building blocks for the design system
 */

// =============================================================================
// @digdir/designsystemet-react base components (centralized re-export)
// =============================================================================
export * from './components';

export { Container } from './container';
export type { ContainerProps } from './container';

export { Grid } from './grid';
export type { GridProps } from './grid';

export { Stack } from './stack';
export type { StackProps } from './stack';

export { Icon } from './icon';
export type { IconProps } from './icon';

// Note: Card and Badge are provided by @digdir/designsystemet-react
// Custom versions removed to avoid export conflicts

export { Text } from './text';
export type { TextProps } from './text';

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

// Note: FormField, CodeBlock, FilterChip are exported from composed with more features

export { Progress } from './progress';
export type { ProgressProps } from './progress';

export { Logo } from './Logo';
export type { LogoProps } from './Logo';

export { NativeSelect } from './NativeSelect';
export type { NativeSelectProps } from './NativeSelect';

export { SelectOption } from './SelectOption';
export type { SelectOptionProps } from './SelectOption';
