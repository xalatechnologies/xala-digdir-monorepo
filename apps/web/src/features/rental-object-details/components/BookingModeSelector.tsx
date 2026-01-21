/**
 * BookingModeSelector Component
 *
 * Tab/segment selector for booking modes (SINGLE_SLOT, IN_GAME, RECURRING).
 * Only renders when more than one mode is enabled for a listing.
 * Uses projection data directly from ListingCalendarConfigProjectionDTO.
 */

import * as React from 'react';
import { Tabs, Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';
import type { BookingMode } from '../../types';

// =============================================================================
// Icons
// =============================================================================

function CalendarIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RepeatIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for a booking mode option.
 * Matches BookingModeConfig from SDK but simplified for UI consumption.
 */
export interface BookingModeOption {
  /** The booking mode type */
  mode: BookingMode;
  /** Whether this mode is enabled */
  enabled: boolean;
  /** Display label (localized) */
  label: string;
  /** Optional description (localized) */
  description?: string;
}

export interface BookingModeSelectorProps {
  /** Available booking modes with their configurations */
  modes: BookingModeOption[];
  /** Currently selected mode */
  selectedMode: BookingMode;
  /** Callback when mode selection changes */
  onModeChange: (mode: BookingMode) => void;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'compact';
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default labels for booking modes (Norwegian).
 * Used as fallback when labelKey translation is not available.
 */
const DEFAULT_MODE_LABELS: Record<BookingMode, string> = {
  SINGLE_SLOT: 'Enkeltbooking',
  IN_GAME: 'Hurtigbooking',
  RECURRING: 'Gjentakende',
};

/**
 * Default descriptions for booking modes (Norwegian).
 */
const DEFAULT_MODE_DESCRIPTIONS: Record<BookingMode, string> = {
  SINGLE_SLOT: 'Book ett tidspunkt',
  IN_GAME: 'Rask booking med kort varsel',
  RECURRING: 'Ukentlig eller månedlig mønster',
};

/**
 * Icons for each booking mode.
 */
const MODE_ICONS: Record<BookingMode, React.ReactNode> = {
  SINGLE_SLOT: <CalendarIcon size={16} />,
  IN_GAME: <ClockIcon size={16} />,
  RECURRING: <RepeatIcon size={16} />,
};

// =============================================================================
// Component
// =============================================================================

export function BookingModeSelector({
  modes,
  selectedMode,
  onModeChange,
  className,
  size = 'md',
  variant = 'default',
}: BookingModeSelectorProps): React.ReactElement | null {
  const t = useT();

  // Default labels and descriptions using translations
  const MODE_LABELS: Record<BookingMode, string> = {
    SINGLE_SLOT: t('bookings.mode.single_slot'),
    IN_GAME: t('bookings.mode.in_game'),
    RECURRING: t('bookings.mode.recurring'),
  };

  const MODE_DESCRIPTIONS: Record<BookingMode, string> = {
    SINGLE_SLOT: t('bookings.mode.single_slot.description'),
    IN_GAME: t('bookings.mode.in_game.description'),
    RECURRING: t('bookings.mode.recurring.description'),
  };
  // Filter to only enabled modes
  const enabledModes = modes.filter((m) => m.enabled);

  // Don't render if only one or no modes are enabled
  if (enabledModes.length <= 1) {
    return null;
  }

  // Get display label for a mode
  const getLabel = (mode: BookingModeOption): string => {
    return mode.label || MODE_LABELS[mode.mode] || mode.mode;
  };

  // Get description for a mode
  const getDescription = (mode: BookingModeOption): string | undefined => {
    return mode.description || MODE_DESCRIPTIONS[mode.mode];
  };

  // Get icon for a mode
  const getIcon = (mode: BookingMode): React.ReactNode => {
    return MODE_ICONS[mode];
  };

  // Handle tab change
  const handleTabChange = (value: string): void => {
    const mode = value as BookingMode;
    if (enabledModes.some((m) => m.mode === mode)) {
      onModeChange(mode);
    }
  };

  // Size-based padding
  const getPadding = (): string => {
    switch (size) {
      case 'sm':
        return 'var(--ds-spacing-2)';
      case 'lg':
        return 'var(--ds-spacing-4)';
      default:
        return 'var(--ds-spacing-3)';
    }
  };

  return (
    <div
      className={className}
      style={{
        padding: variant === 'compact' ? 0 : getPadding(),
        backgroundColor: variant === 'compact' ? 'transparent' : 'var(--ds-color-neutral-background-default)',
        borderRadius: variant === 'compact' ? 0 : 'var(--ds-border-radius-md)',
        border: variant === 'compact' ? 'none' : '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {variant === 'default' && (
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Bookingtype
        </Paragraph>
      )}

      <Tabs value={selectedMode} onChange={handleTabChange}>
        <Tabs.List
          style={{
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            padding: 'var(--ds-spacing-1)',
            gap: 'var(--ds-spacing-1)',
          }}
        >
          {enabledModes.map((modeOption) => (
            <Tabs.Tab
              key={modeOption.mode}
              value={modeOption.mode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                padding: size === 'sm' ? 'var(--ds-spacing-1) var(--ds-spacing-2)' : 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-sm)',
                fontSize: size === 'sm' ? 'var(--ds-font-size-xs)' : 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                transition: 'all 150ms ease',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getIcon(modeOption.mode)}
              </span>
              <span>{getLabel(modeOption)}</span>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {/* Show description for selected mode in default variant */}
      {variant === 'default' && (
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {getDescription(enabledModes.find((m) => m.mode === selectedMode) ?? enabledModes[0]!)}
        </Paragraph>
      )}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates BookingModeOption array from BookingModeConfig projection.
 * Use this helper to convert SDK projection data to component props.
 *
 * @example
 * ```tsx
 * import { createBookingModeOptions } from './BookingModeSelector';
import { useT } from '@xala/i18n';
 *
 * const options = createBookingModeOptions(calendarConfig.bookingModes, t);
 * ```
 */
export function createBookingModeOptions(
  configs: Array<{
    mode: BookingMode;
    enabled: boolean;
    labelKey: string;
    descriptionKey?: string;
  }>,
  translate?: (key: string) => string
): BookingModeOption[] {
  return configs.map((config) => ({
    mode: config.mode,
    enabled: config.enabled,
    label: translate ? translate(config.labelKey) : DEFAULT_MODE_LABELS[config.mode],
    description: config.descriptionKey && translate
      ? translate(config.descriptionKey)
      : DEFAULT_MODE_DESCRIPTIONS[config.mode],
  }));
}

export default BookingModeSelector;
