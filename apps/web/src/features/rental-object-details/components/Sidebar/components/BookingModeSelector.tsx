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

function DateRangeIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="14" x2="8" y2="18" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  );
}

function SunIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// =============================================================================
// Constants
// =============================================================================

// Mode icons - labels are created dynamically with t()
const MODE_ICONS: Record<BookingMode, React.ReactElement> = {
  SINGLE_SLOT: <CalendarIcon />,
  RECURRING: <RepeatIcon />,
  SEASON_RENTAL: <LayersIcon />,
  IN_GAME: <CalendarIcon />,
  RANGE: <DateRangeIcon />,
  ALL_DAY: <SunIcon />,
  ACTIVITY_REGISTRATION: <CalendarIcon />,
};

// Map mode to translation key
const MODE_TRANSLATION_KEYS: Record<BookingMode, string> = {
  SINGLE_SLOT: 'singleSlot',
  RECURRING: 'recurring',
  SEASON_RENTAL: 'seasonRental',
  IN_GAME: 'inGame',
  RANGE: 'range',
  ALL_DAY: 'allDay',
  ACTIVITY_REGISTRATION: 'activityRegistration',
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

  // Create mode config with translated labels
  const getModeConfig = React.useCallback((mode: BookingMode) => {
    const key = MODE_TRANSLATION_KEYS[mode];
    return {
      label: t(`bookingMode.${key}`),
      description: t(`bookingMode.${key}Desc`),
      icon: MODE_ICONS[mode],
    };
  }, [t]);

  // Show relevant booking modes in the tabs
  const displayModes = availableModes.filter(
    (mode) => 
      mode === 'SINGLE_SLOT' || 
      mode === 'RECURRING' || 
      mode === 'SEASON_RENTAL' ||
      mode === 'RANGE' ||
      mode === 'ALL_DAY'
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
        gap: 'var(--ds-spacing-1)',
        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        margin: 'var(--ds-spacing-3)',
        marginBottom: 0,
      }}
    >
      {displayModes.map((mode) => {
        const config = getModeConfig(mode);
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
              justifyContent: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: 'none',
              backgroundColor: isSelected
                ? 'var(--ds-color-accent-base-default)'
                : 'transparent',
              color: isSelected
                ? 'white'
                : 'var(--ds-color-neutral-text-default)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flex: 1,
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: isSelected
                ? 'var(--ds-font-weight-semibold)'
                : 'var(--ds-font-weight-medium)',
            }}
            title={config.description}
            onMouseEnter={(e) => {
              if (!isSelected && !disabled) {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !disabled) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Icon */}
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {config.icon}
            </span>
            
            {/* Label */}
            <span>{config.label}</span>

            {/* Show constraint hint for recurring */}
            {mode === 'RECURRING' && recurringConstraints?.maxOccurrences && (
              <Badge data-color="info" data-size="sm">
                {recurringConstraints.maxOccurrences}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default BookingModeSelector;
