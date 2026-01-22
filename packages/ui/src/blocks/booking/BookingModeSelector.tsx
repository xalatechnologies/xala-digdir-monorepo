/**
 * BookingModeSelector Component
 *
 * Unified booking mode selector supporting both tab and button-based UIs.
 * Allows users to select between different booking modes:
 * - SINGLE_SLOT: Standard one-time slot selection
 * - RECURRING: Weekly/monthly recurring bookings
 * - SEASON_RENTAL: Seasonal booking applications
 * - IN_GAME: Short notice / rapid booking
 * - RANGE: Multi-day date range selection
 * - ALL_DAY: Full day booking
 * - ACTIVITY_REGISTRATION: Activity-based registration
 *
 * Supports two visual variants:
 * - `tabs`: Platform Tabs component (cleaner design)
 * - `buttons`: Custom button-based UI (more flexible, shows constraints)
 *
 * @example
 * ```tsx
 * // Tab variant (simpler UI)
 * <BookingModeSelector
 *   selectedMode="SINGLE_SLOT"
 *   modes={[{ mode: 'SINGLE_SLOT', enabled: true }, { mode: 'RECURRING', enabled: true }]}
 *   onModeChange={setMode}
 *   variant="tabs"
 * />
 *
 * // Button variant (with constraints display)
 * <BookingModeSelector
 *   selectedMode="RECURRING"
 *   availableModes={['SINGLE_SLOT', 'RECURRING', 'SEASON_RENTAL']}
 *   onModeChange={setMode}
 *   variant="buttons"
 *   recurringConstraints={{ maxOccurrences: 10 }}
 * />
 * ```
 */

import * as React from 'react';
import { Tabs, Paragraph, Badge } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  CalendarIcon,
  ClockIcon,
  RepeatIcon,
  SunIcon,
} from '../../primitives/icons';

// =============================================================================
// Types
// =============================================================================

/**
 * All supported booking modes.
 * Extended from client-sdk to include all UI-supported modes.
 */
export type BookingModeType =
  | 'SINGLE_SLOT'
  | 'RECURRING'
  | 'SEASON_RENTAL'
  | 'IN_GAME'
  | 'RANGE'
  | 'ALL_DAY'
  | 'ACTIVITY_REGISTRATION';

/**
 * Recurring booking constraints (from client-sdk).
 */
export interface RecurringConstraints {
  enabled?: boolean;
  maxOccurrences?: number;
  maxRangeDays?: number;
}

/**
 * Configuration for a single booking mode option.
 */
export interface BookingModeOption {
  /** The booking mode type */
  mode: BookingModeType;
  /** Whether this mode is enabled */
  enabled: boolean;
  /** Display label (localized) - optional, uses default if not provided */
  label?: string;
  /** Optional description (localized) */
  description?: string;
}

export interface BookingModeSelectorProps {
  /**
   * Currently selected booking mode.
   * Supports both `selectedMode` and `value` prop naming for flexibility.
   */
  selectedMode?: BookingModeType;
  /** Alternative prop name for selectedMode (for backward compatibility) */
  value?: BookingModeType;

  /**
   * Callback when mode selection changes.
   * Supports both `onModeChange` and `onChange` prop naming for flexibility.
   */
  onModeChange?: (mode: BookingModeType) => void;
  /** Alternative prop name for onModeChange (for backward compatibility) */
  onChange?: (mode: BookingModeType) => void;

  /**
   * Available modes configuration.
   * Can be provided as:
   * - `modes`: Array of BookingModeOption with detailed config
   * - `availableModes`: Simple array of mode strings
   */
  modes?: BookingModeOption[];
  /** Alternative prop name for modes (simpler API) */
  availableModes?: BookingModeType[];

  /**
   * Visual variant for the selector.
   * - `tabs`: Uses platform Tabs component (default)
   * - `buttons`: Uses custom button-based UI
   */
  variant?: 'tabs' | 'buttons';

  /**
   * Size variant (for tabs variant).
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Visual sub-variant for tabs.
   * - `default`: With label and description
   * - `compact`: Minimal styling
   */
  tabsVariant?: 'default' | 'compact';

  /**
   * Recurring constraints to display (for buttons variant).
   * Shows badge with max occurrences when provided.
   */
  recurringConstraints?: RecurringConstraints;

  /** Whether the selector is disabled */
  disabled?: boolean;

  /** Custom class name */
  className?: string;

  /**
   * Whether to hide selector when only one mode is available.
   * Default: true for tabs variant, false for buttons variant
   */
  hideWhenSingleMode?: boolean;

  /**
   * Filter to specific modes for display (buttons variant).
   * If not provided, shows all modes in availableModes.
   */
  displayModes?: BookingModeType[];
}

// =============================================================================
// Icons - Domain-specific icons not available in platform
// =============================================================================

function LayersIcon({ size = 18 }: { size?: number }): React.ReactElement {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function DateRangeIcon({ size = 18 }: { size?: number }): React.ReactElement {
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
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="14" x2="8" y2="18" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  );
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Icon for each booking mode.
 */
const MODE_ICONS: Record<BookingModeType, React.ReactElement> = {
  SINGLE_SLOT: <CalendarIcon data-size="sm" />,
  RECURRING: <RepeatIcon data-size="sm" />,
  SEASON_RENTAL: <LayersIcon size={18} />,
  IN_GAME: <ClockIcon data-size="sm" />,
  RANGE: <DateRangeIcon size={18} />,
  ALL_DAY: <SunIcon data-size="sm" />,
  ACTIVITY_REGISTRATION: <CalendarIcon data-size="sm" />,
};

/**
 * Translation keys for each mode.
 */
const MODE_TRANSLATION_KEYS: Record<BookingModeType, string> = {
  SINGLE_SLOT: 'singleSlot',
  RECURRING: 'recurring',
  SEASON_RENTAL: 'seasonRental',
  IN_GAME: 'inGame',
  RANGE: 'range',
  ALL_DAY: 'allDay',
  ACTIVITY_REGISTRATION: 'activityRegistration',
};

/**
 * Default modes filter for buttons variant.
 */
const DEFAULT_DISPLAY_MODES: BookingModeType[] = [
  'SINGLE_SLOT',
  'RECURRING',
  'SEASON_RENTAL',
  'RANGE',
  'ALL_DAY',
];

// =============================================================================
// Component
// =============================================================================

export function BookingModeSelector({
  selectedMode,
  value,
  onModeChange,
  onChange,
  modes,
  availableModes,
  variant = 'tabs',
  size = 'md',
  tabsVariant = 'default',
  recurringConstraints,
  disabled = false,
  className,
  hideWhenSingleMode,
  displayModes = DEFAULT_DISPLAY_MODES,
}: BookingModeSelectorProps): React.ReactElement | null {
  const t = useT();

  // Normalize props (support both naming conventions)
  const currentMode = selectedMode ?? value ?? 'SINGLE_SLOT';
  const handleModeChange = onModeChange ?? onChange ?? (() => {});

  // Build enabled modes list from either prop
  const enabledModes = React.useMemo(() => {
    if (modes) {
      return modes.filter((m) => m.enabled);
    }
    if (availableModes) {
      return availableModes.map((mode) => ({
        mode,
        enabled: true,
      }));
    }
    return [];
  }, [modes, availableModes]);

  // Get translated label for a mode
  const getModeLabel = React.useCallback(
    (mode: BookingModeType, option?: BookingModeOption): string => {
      if (option?.label) return option.label;
      const key = MODE_TRANSLATION_KEYS[mode];
      return t(`bookingMode.${key}`);
    },
    [t]
  );

  // Get translated description for a mode
  const getModeDescription = React.useCallback(
    (mode: BookingModeType, option?: BookingModeOption): string => {
      if (option?.description) return option.description;
      const key = MODE_TRANSLATION_KEYS[mode];
      return t(`bookingMode.${key}Desc`);
    },
    [t]
  );

  // Determine if selector should be hidden
  const shouldHide = hideWhenSingleMode ?? variant === 'tabs';
  if (shouldHide && enabledModes.length <= 1) {
    return null;
  }

  // For buttons variant, filter to display modes
  const displayedModes =
    variant === 'buttons'
      ? enabledModes.filter((m) => displayModes.includes(m.mode))
      : enabledModes;

  if (displayedModes.length === 0) {
    return null;
  }

  // Render tabs variant
  if (variant === 'tabs') {
    return (
      <div
        className={className}
        style={{
          padding: tabsVariant === 'compact' ? 0 : getPadding(size),
          backgroundColor:
            tabsVariant === 'compact'
              ? 'transparent'
              : 'var(--ds-color-neutral-background-default)',
          borderRadius:
            tabsVariant === 'compact' ? 0 : 'var(--ds-border-radius-md)',
          border:
            tabsVariant === 'compact'
              ? 'none'
              : '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        {tabsVariant === 'default' && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t('booking.selectType')}
          </Paragraph>
        )}

        <Tabs
          value={currentMode}
          onChange={(newValue) => handleModeChange(newValue as BookingModeType)}
        >
          <Tabs.List
            style={{
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-1)',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            {displayedModes.map((modeOption) => (
              <Tabs.Tab
                key={modeOption.mode}
                value={modeOption.mode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  padding:
                    size === 'sm'
                      ? 'var(--ds-spacing-1) var(--ds-spacing-2)'
                      : 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontSize:
                    size === 'sm'
                      ? 'var(--ds-font-size-xs)'
                      : 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  transition: 'all 150ms ease',
                  pointerEvents: disabled ? 'none' : undefined,
                  opacity: disabled ? 0.5 : undefined,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {MODE_ICONS[modeOption.mode]}
                </span>
                <span>{getModeLabel(modeOption.mode, modeOption)}</span>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        {tabsVariant === 'default' && (
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {getModeDescription(
              displayedModes.find((m) => m.mode === currentMode)?.mode ??
                displayedModes[0]!.mode,
              displayedModes.find((m) => m.mode === currentMode) ??
                displayedModes[0]
            )}
          </Paragraph>
        )}
      </div>
    );
  }

  // Render buttons variant
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
      {displayedModes.map((modeOption) => {
        const isSelected = currentMode === modeOption.mode;
        const description = getModeDescription(modeOption.mode, modeOption);

        return (
          <button
            key={modeOption.mode}
            type="button"
            onClick={() => !disabled && handleModeChange(modeOption.mode)}
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
            title={description}
            onMouseEnter={(e) => {
              if (!isSelected && !disabled) {
                e.currentTarget.style.backgroundColor =
                  'var(--ds-color-neutral-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !disabled) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {MODE_ICONS[modeOption.mode]}
            </span>

            <span>{getModeLabel(modeOption.mode, modeOption)}</span>

            {modeOption.mode === 'RECURRING' &&
              recurringConstraints?.maxOccurrences && (
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

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get padding based on size.
 */
function getPadding(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'var(--ds-spacing-2)';
    case 'lg':
      return 'var(--ds-spacing-4)';
    default:
      return 'var(--ds-spacing-3)';
  }
}

/**
 * Creates BookingModeOption array from projection config.
 * Use this helper to convert SDK projection data to component props.
 *
 * @example
 * ```tsx
 * const options = createBookingModeOptions(calendarConfig.bookingModes, t);
 * <BookingModeSelector modes={options} />
 * ```
 */
export function createBookingModeOptions(
  configs: Array<{
    mode: BookingModeType;
    enabled: boolean;
    labelKey?: string;
    descriptionKey?: string;
  }>,
  translate?: (key: string) => string
): BookingModeOption[] {
  return configs.map((config) => ({
    mode: config.mode,
    enabled: config.enabled,
    label: config.labelKey && translate ? translate(config.labelKey) : undefined,
    description:
      config.descriptionKey && translate
        ? translate(config.descriptionKey)
        : undefined,
  }));
}

export default BookingModeSelector;
