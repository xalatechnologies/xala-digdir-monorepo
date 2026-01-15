/**
 * Season Feature Constants
 *
 * Centralized constants for the season booking feature.
 * Note: Labels are now managed via i18n keys. Use useT() hook in components.
 */

import type { SeasonStatus } from '@digilist/client-sdk/types';

// =============================================================================
// Season Status Configuration (Colors only - labels from i18n)
// =============================================================================

export const SEASON_STATUS_CONFIG = {
  draft: {
    labelKey: 'seasons.status.draft',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  open: {
    labelKey: 'seasons.status.open',
    color: 'var(--ds-color-success-text-default)',
    bgColor: 'var(--ds-color-success-surface-default)',
  },
  closed: {
    labelKey: 'seasons.status.closed',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  active: {
    labelKey: 'seasons.status.active',
    color: 'var(--ds-color-accent-text-default)',
    bgColor: 'var(--ds-color-accent-surface-default)',
  },
  completed: {
    labelKey: 'seasons.status.completed',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  cancelled: {
    labelKey: 'seasons.status.cancelled',
    color: 'var(--ds-color-danger-text-default)',
    bgColor: 'var(--ds-color-danger-surface-default)',
  },
} as const;

// =============================================================================
// Application Status Configuration (Colors only - labels from i18n)
// =============================================================================

export const APPLICATION_STATUS_CONFIG = {
  pending: {
    labelKey: 'seasons.application.pending',
    color: 'var(--ds-color-warning-text-default)',
    bgColor: 'var(--ds-color-warning-surface-default)',
  },
  approved: {
    labelKey: 'seasons.application.approved',
    color: 'var(--ds-color-success-text-default)',
    bgColor: 'var(--ds-color-success-surface-default)',
  },
  rejected: {
    labelKey: 'seasons.application.rejected',
    color: 'var(--ds-color-danger-text-default)',
    bgColor: 'var(--ds-color-danger-surface-default)',
  },
  allocated: {
    labelKey: 'seasons.application.allocated',
    color: 'var(--ds-color-accent-text-default)',
    bgColor: 'var(--ds-color-accent-surface-default)',
  },
} as const;

// =============================================================================
// Weekday Configuration (i18n keys only - use with useT() hook)
// =============================================================================

export const WEEKDAY_LABEL_KEYS = [
  'seasons.weekday.sunday',
  'seasons.weekday.monday',
  'seasons.weekday.tuesday',
  'seasons.weekday.wednesday',
  'seasons.weekday.thursday',
  'seasons.weekday.friday',
  'seasons.weekday.saturday',
] as const;

export const WEEKDAY_SHORT_LABEL_KEYS = [
  'seasons.weekday.short.sunday',
  'seasons.weekday.short.monday',
  'seasons.weekday.short.tuesday',
  'seasons.weekday.short.wednesday',
  'seasons.weekday.short.thursday',
  'seasons.weekday.short.friday',
  'seasons.weekday.short.saturday',
] as const;

// =============================================================================
// Time Configuration
// =============================================================================

export const TIME_SLOT_CONFIG = {
  minHour: 6,  // 06:00
  maxHour: 23, // 23:00
  interval: 30, // 30 minutes
} as const;

// =============================================================================
// Filter Options (i18n keys - use with useT() hook)
// =============================================================================

export const SEASON_FILTER_OPTIONS: { labelKey: string; value: SeasonStatus | 'all' }[] = [
  { labelKey: 'seasons.allSeasons', value: 'all' },
  { labelKey: 'seasons.filterOpen', value: 'open' },
  { labelKey: 'seasons.filterActive', value: 'active' },
  { labelKey: 'seasons.filterUpcoming', value: 'draft' },
];

// =============================================================================
// UI Constants
// =============================================================================

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;
