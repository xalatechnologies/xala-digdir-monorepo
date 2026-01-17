/**
 * BookingModeSelector Component
 *
 * Allows users to select between different booking modes:
 * - SINGLE_SLOT: Standard one-time slot selection (default)
 * - RECURRING: Weekly/monthly recurring bookings with pattern builder
 * - SEASON_RENTAL: Seasonal booking applications
 *
 * Displayed as tabs above the calendar for easy mode switching.
 */

import * as React from 'react';
import { Paragraph, Badge } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { BookingMode, RecurringConstraintsDTO } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

export interface BookingModeSelectorProps {
  /** Currently selected booking mode */
  value: BookingMode;
  /** Callback when mode changes */
  onChange: (mode: BookingMode) => void;
  /** Available modes (based on rental object config) */
  availableModes: BookingMode[];
  /** Recurring constraints (for showing limits) */
  recurringConstraints?: RecurringConstraintsDTO;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icons
// =============================================================================

function CalendarIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function RepeatIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function LayersIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// =============================================================================
// Constants
// =============================================================================

const MODE_CONFIG: Record<BookingMode, {
  label: string;
  description: string;
  icon: React.ReactElement;
}> = {
  SINGLE_SLOT: {
    label: 'Enkeltbooking',
    description: 'Book ett eller flere enkelttidspunkter',
    icon: <CalendarIcon />,
  },
  RECURRING: {
    label: 'Gjentakende',
    description: 'Fast tidspunkt hver uke eller måned',
    icon: <RepeatIcon />,
  },
  SEASON_RENTAL: {
    label: 'Sesong',
    description: 'Søk om fast tid i en hel sesong',
    icon: <LayersIcon />,
  },
  // These are less common but included for completeness
  IN_GAME: {
    label: 'Hurtigbooking',
    description: 'Book kort tid i forveien',
    icon: <CalendarIcon />,
  },
  RANGE: {
    label: 'Periode',
    description: 'Book en sammenhengende periode',
    icon: <CalendarIcon />,
  },
  ALL_DAY: {
    label: 'Heldag',
    description: 'Book hele dager',
    icon: <CalendarIcon />,
  },
  ACTIVITY_REGISTRATION: {
    label: 'Aktivitet',
    description: 'Meld deg på en aktivitet',
    icon: <CalendarIcon />,
  },
};

// =============================================================================
// Component
// =============================================================================

export function BookingModeSelector({
  value,
  onChange,
  availableModes,
  recurringConstraints,
  disabled = false,
  className,
}: BookingModeSelectorProps): React.ReactElement {
  const t = useT();

  // Only show the main three modes in the tabs
  const displayModes = availableModes.filter(
    (mode) => mode === 'SINGLE_SLOT' || mode === 'RECURRING' || mode === 'SEASON_RENTAL'
  );

  // If only one mode, don't show selector
  if (displayModes.length <= 1) {
    return <></>;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        overflowX: 'auto',
      }}
    >
      {displayModes.map((mode) => {
        const config = MODE_CONFIG[mode];
        const isSelected = value === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => !disabled && onChange(mode)}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: isSelected
                ? '2px solid var(--ds-color-accent-border-default)'
                : '1px solid var(--ds-color-neutral-border-default)',
              backgroundColor: isSelected
                ? 'var(--ds-color-accent-surface-default)'
                : 'var(--ds-color-neutral-background-default)',
              color: isSelected
                ? 'var(--ds-color-accent-text-default)'
                : 'var(--ds-color-neutral-text-default)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
            title={config.description}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color: isSelected
                  ? 'var(--ds-color-accent-base-default)'
                  : 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {config.icon}
            </span>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: isSelected
                  ? 'var(--ds-font-weight-semibold)'
                  : 'var(--ds-font-weight-regular)',
              }}
            >
              {config.label}
            </Paragraph>

            {/* Show constraint hint for recurring */}
            {mode === 'RECURRING' && recurringConstraints?.maxOccurrences && (
              <Badge data-color="info" data-size="sm">
                maks {recurringConstraints.maxOccurrences}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default BookingModeSelector;
