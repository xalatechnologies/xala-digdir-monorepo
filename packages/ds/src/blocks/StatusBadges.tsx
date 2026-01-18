/**
 * StatusBadges
 *
 * Reusable status badge components for various entity types.
 * Norwegian labels with consistent color coding.
 *
 * Uses custom styled tags instead of Digdir Badge (which is designed for numeric counts).
 */
import * as React from 'react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeConfig {
  color: BadgeColor;
  label: string;
}

// =============================================================================
// Base StatusTag Component
// =============================================================================

const colorStyles: Record<BadgeColor, { bg: string; text: string }> = {
  success: {
    bg: 'var(--ds-color-success-surface-default)',
    text: 'var(--ds-color-success-text-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-default)',
    text: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-default)',
    text: 'var(--ds-color-danger-text-default)',
  },
  info: {
    bg: 'var(--ds-color-info-surface-default)',
    text: 'var(--ds-color-info-text-default)',
  },
  neutral: {
    bg: 'var(--ds-color-neutral-surface-hover)',
    text: 'var(--ds-color-neutral-text-subtle)',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', { padding: string; fontSize: string }> = {
  sm: {
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-xs)',
  },
  md: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    fontSize: 'var(--ds-font-size-sm)',
  },
  lg: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
    fontSize: 'var(--ds-font-size-md)',
  },
};

export interface StatusTagProps {
  /** The label text to display */
  children: React.ReactNode;
  /** Color scheme */
  color: BadgeColor;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
}

/**
 * Base StatusTag component for displaying status labels.
 * Use this for custom status displays or when you need more control.
 */
export function StatusTag({
  children,
  color,
  size = 'sm',
  className,
}: StatusTagProps): React.ReactElement {
  const colorStyle = colorStyles[color];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={cn('status-tag', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 'var(--ds-line-height-sm)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// Booking Status Badge
// =============================================================================

export type BookingStatusType = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const bookingStatusConfig: Record<BookingStatusType, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  confirmed: { color: 'success', label: 'Bekreftet' },
  cancelled: { color: 'neutral', label: 'Kansellert' },
  completed: { color: 'info', label: 'Fullført' },
};

export interface BookingStatusBadgeProps {
  status: BookingStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function BookingStatusBadge({ status, size = 'sm' }: BookingStatusBadgeProps): React.ReactElement {
  const config = bookingStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Payment Status Badge
// =============================================================================

export type PaymentStatusType = 'paid' | 'unpaid' | 'partial' | 'refunded';

const paymentStatusConfig: Record<PaymentStatusType, StatusBadgeConfig> = {
  paid: { color: 'success', label: 'Betalt' },
  unpaid: { color: 'warning', label: 'Ikke betalt' },
  partial: { color: 'warning', label: 'Delvis betalt' },
  refunded: { color: 'neutral', label: 'Refundert' },
};

export interface PaymentStatusBadgeProps {
  status: PaymentStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function PaymentStatusBadge({ status, size = 'sm' }: PaymentStatusBadgeProps): React.ReactElement {
  const config = paymentStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Rental Object Status Badge
// =============================================================================

export type RentalObjectStatusType = 'published' | 'draft' | 'archived' | 'maintenance';

const rentalObjectStatusConfig: Record<RentalObjectStatusType, StatusBadgeConfig> = {
  published: { color: 'success', label: 'Publisert' },
  draft: { color: 'warning', label: 'Utkast' },
  archived: { color: 'neutral', label: 'Arkivert' },
  maintenance: { color: 'info', label: 'Vedlikehold' },
};

export interface RentalObjectStatusBadgeProps {
  status: RentalObjectStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function RentalObjectStatusBadge({ status, size = 'sm' }: RentalObjectStatusBadgeProps): React.ReactElement {
  const config = rentalObjectStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Request Status Badge
// =============================================================================

export type RequestStatusType = 'pending' | 'needs_info' | 'approved' | 'rejected';

const requestStatusConfig: Record<RequestStatusType, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  needs_info: { color: 'info', label: 'Trenger info' },
  approved: { color: 'success', label: 'Godkjent' },
  rejected: { color: 'danger', label: 'Avslått' },
};

export interface RequestStatusBadgeProps {
  status: RequestStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps): React.ReactElement {
  const config = requestStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Seasonal Lease Status Badge
// =============================================================================

export type SeasonalLeaseStatusType = 'draft' | 'pending' | 'approved' | 'active' | 'upcoming' | 'expired' | 'cancelled' | 'terminated';

const seasonalLeaseStatusConfig: Record<SeasonalLeaseStatusType, StatusBadgeConfig> = {
  draft: { color: 'neutral', label: 'Utkast' },
  pending: { color: 'warning', label: 'Venter' },
  approved: { color: 'info', label: 'Godkjent' },
  active: { color: 'success', label: 'Aktiv' },
  upcoming: { color: 'info', label: 'Kommende' },
  expired: { color: 'neutral', label: 'Utløpt' },
  cancelled: { color: 'neutral', label: 'Kansellert' },
  terminated: { color: 'danger', label: 'Avsluttet' },
};

export interface SeasonalLeaseStatusBadgeProps {
  status: SeasonalLeaseStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function SeasonalLeaseStatusBadge({ status, size = 'sm' }: SeasonalLeaseStatusBadgeProps): React.ReactElement {
  const config = seasonalLeaseStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Organization Status Badge
// =============================================================================

export type OrganizationStatusType = 'active' | 'inactive' | 'suspended';

const organizationStatusConfig: Record<OrganizationStatusType, StatusBadgeConfig> = {
  active: { color: 'success', label: 'Aktiv' },
  inactive: { color: 'neutral', label: 'Inaktiv' },
  suspended: { color: 'danger', label: 'Suspendert' },
};

export interface OrganizationStatusBadgeProps {
  status: OrganizationStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function OrganizationStatusBadge({ status, size = 'sm' }: OrganizationStatusBadgeProps): React.ReactElement {
  const config = organizationStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// User Status Badge
// =============================================================================

export type UserStatusType = 'active' | 'inactive' | 'suspended';

const userStatusConfig: Record<UserStatusType, StatusBadgeConfig> = {
  active: { color: 'success', label: 'Aktiv' },
  inactive: { color: 'neutral', label: 'Inaktiv' },
  suspended: { color: 'danger', label: 'Suspendert' },
};

export interface UserStatusBadgeProps {
  status: UserStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function UserStatusBadge({ status, size = 'sm' }: UserStatusBadgeProps): React.ReactElement {
  const config = userStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Generic Status Badge (for custom statuses)
// =============================================================================

export interface GenericStatusBadgeProps {
  status: string;
  config?: Record<string, StatusBadgeConfig>;
  size?: 'sm' | 'md' | 'lg';
}

export function GenericStatusBadge({ status, config, size = 'sm' }: GenericStatusBadgeProps): React.ReactElement {
  const statusConfig = config?.[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={statusConfig.color} size={size}>{statusConfig.label}</StatusTag>;
}

// =============================================================================
// Export config for customization
// =============================================================================

export const statusConfigs = {
  booking: bookingStatusConfig,
  payment: paymentStatusConfig,
  rentalObject: rentalObjectStatusConfig,
  request: requestStatusConfig,
  seasonalLease: seasonalLeaseStatusConfig,
  organization: organizationStatusConfig,
  user: userStatusConfig,
};

// =============================================================================
// V3 MODEL BADGES: Category, TimeMode, Inventory, Capacity, Feature
// =============================================================================

// Category Badge
export type CategoryKey = 'LOKALER_OG_BANER' | 'UTSTYR_OG_INVENTAR' | 'KJORETOY_OG_TRANSPORT' | 'OPPLEVELSER_OG_ARRANGEMENT';

const categoryConfig: Record<CategoryKey, StatusBadgeConfig & { icon: string }> = {
  LOKALER_OG_BANER: { color: 'info', label: 'Lokaler og baner', icon: '🏢' },
  UTSTYR_OG_INVENTAR: { color: 'warning', label: 'Utstyr og inventar', icon: '🔧' },
  KJORETOY_OG_TRANSPORT: { color: 'neutral', label: 'Kjøretøy og transport', icon: '🚗' },
  OPPLEVELSER_OG_ARRANGEMENT: { color: 'success', label: 'Opplevelser og arrangement', icon: '🎉' },
};

export interface CategoryBadgeProps {
  category: CategoryKey;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CategoryBadge({ category, size = 'sm', showIcon = true }: CategoryBadgeProps): React.ReactElement {
  const config = categoryConfig[category] || { color: 'neutral' as BadgeColor, label: category, icon: '' };
  return (
    <StatusTag color={config.color} size={size}>
      {showIcon && config.icon && <span style={{ marginRight: '4px' }}>{config.icon}</span>}
      {config.label}
    </StatusTag>
  );
}

// Time Mode Badge
export type TimeMode = 'PERIOD' | 'SLOT' | 'ALL_DAY';

const timeModeConfig: Record<TimeMode, StatusBadgeConfig & { icon: string }> = {
  PERIOD: { color: 'info', label: 'Tidsperiode', icon: '📅' },
  SLOT: { color: 'warning', label: 'Tidsluke', icon: '⏰' },
  ALL_DAY: { color: 'success', label: 'Heldags', icon: '☀️' },
};

export interface TimeModeBadgeProps {
  timeMode: TimeMode;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function TimeModeBadge({ timeMode, size = 'sm', showIcon = true }: TimeModeBadgeProps): React.ReactElement {
  const config = timeModeConfig[timeMode] || { color: 'neutral' as BadgeColor, label: timeMode, icon: '' };
  return (
    <StatusTag color={config.color} size={size}>
      {showIcon && config.icon && <span style={{ marginRight: '4px' }}>{config.icon}</span>}
      {config.label}
    </StatusTag>
  );
}

// Feature Badge
export type FeatureKey = 'INVENTORY' | 'SHARED_CAPACITY' | 'PACKAGES';

const featureConfig: Record<FeatureKey, StatusBadgeConfig & { icon: string }> = {
  INVENTORY: { color: 'warning', label: 'Beholdning', icon: '📦' },
  SHARED_CAPACITY: { color: 'info', label: 'Delt kapasitet', icon: '👥' },
  PACKAGES: { color: 'success', label: 'Pakker', icon: '🎁' },
};

export interface FeatureBadgeProps {
  feature: FeatureKey;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function FeatureBadge({ feature, size = 'sm', showIcon = true }: FeatureBadgeProps): React.ReactElement {
  const config = featureConfig[feature] || { color: 'neutral' as BadgeColor, label: feature, icon: '' };
  return (
    <StatusTag color={config.color} size={size}>
      {showIcon && config.icon && <span style={{ marginRight: '4px' }}>{config.icon}</span>}
      {config.label}
    </StatusTag>
  );
}

// Inventory Badge - Shows remaining inventory (x igjen)
export interface InventoryBadgeProps {
  total: number;
  available: number;
  size?: 'sm' | 'md' | 'lg';
}

export function InventoryBadge({ total, available, size = 'sm' }: InventoryBadgeProps): React.ReactElement {
  const color: BadgeColor = available === 0 ? 'danger' : available <= 2 ? 'warning' : 'success';
  const label = available === 0 ? 'Utsolgt' : `${available} igjen`;
  
  return (
    <StatusTag color={color} size={size}>
      📦 {label}
    </StatusTag>
  );
}

// Capacity Badge - Shows remaining capacity (plasser igjen)
export interface CapacityBadgeProps {
  total: number;
  booked: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CapacityBadge({ total, booked, size = 'sm' }: CapacityBadgeProps): React.ReactElement {
  const available = total - booked;
  const color: BadgeColor = available === 0 ? 'danger' : available <= 5 ? 'warning' : 'success';
  const label = available === 0 ? 'Fullt' : `${available} plasser igjen`;
  
  return (
    <StatusTag color={color} size={size}>
      👥 {label}
    </StatusTag>
  );
}

// Blackout Indicator
export interface BlackoutIndicatorProps {
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BlackoutIndicator({ title = 'Utilgjengelig', size = 'sm' }: BlackoutIndicatorProps): React.ReactElement {
  return (
    <StatusTag color="neutral" size={size}>
      🚫 {title}
    </StatusTag>
  );
}

// Requires Approval Badge
export interface RequiresApprovalBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function RequiresApprovalBadge({ size = 'sm' }: RequiresApprovalBadgeProps): React.ReactElement {
  return (
    <StatusTag color="warning" size={size}>
      ⏳ Krever godkjenning
    </StatusTag>
  );
}

// Rule Set Badge
export interface RuleSetBadgeProps {
  ruleSetKey: string;
  size?: 'sm' | 'md' | 'lg';
}

const ruleSetLabels: Record<string, string> = {
  RS_LOKALE_STANDARD: 'Standard lokale',
  RS_BANE_SLOT: 'Bane med luker',
  RS_UTSTYR_HELDAG: 'Utstyr heldags',
  RS_KJORETOY: 'Kjøretøy',
  RS_EVENT_KAPASITET: 'Arrangement',
};

export function RuleSetBadge({ ruleSetKey, size = 'sm' }: RuleSetBadgeProps): React.ReactElement {
  const label = ruleSetLabels[ruleSetKey] || ruleSetKey;
  return (
    <StatusTag color="info" size={size}>
      📋 {label}
    </StatusTag>
  );
}
