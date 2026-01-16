/**
 * RecurringPatternBuilder Component
 *
 * Form component for building recurring booking patterns.
 * Allows selection of frequency, weekdays, time-of-day, and end condition.
 * Respects RecurringConstraintsDTO for validation rules.
 */

import * as React from 'react';
import { Heading, Paragraph } from '@xala/ds';
import type {
  RecurringFrequency,
  RecurringEndCondition,
  RecurringEndConditionType,
  RecurringConstraintsDTO,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

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
 * Pattern data for recurring bookings.
 * Used as the value and onChange parameter.
 */
export interface RecurringPatternData {
  /** Recurrence frequency (WEEKLY or MONTHLY) */
  frequency: RecurringFrequency;
  /** Selected weekdays for recurring (ISO 1-7, where 1=Monday) */
  weekdays: number[];
  /** Start time for the recurring slot (HH:MM format) */
  startTime: string;
  /** End time for the recurring slot (HH:MM format) */
  endTime: string;
  /** End condition configuration */
  endCondition: RecurringEndCondition;
}

export interface RecurringPatternBuilderProps {
  /** Current pattern data */
  value: RecurringPatternData;
  /** Callback when pattern changes */
  onChange: (pattern: RecurringPatternData) => void;
  /** Constraints from listing calendar config */
  constraints?: RecurringConstraintsDTO;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Weekday options with ISO weekday numbers (1=Monday, 7=Sunday)
 */
const WEEKDAY_OPTIONS: Array<{ value: number; label: string; shortLabel: string }> = [
  { value: 1, label: t('day.monday'), shortLabel: 'Man' },
  { value: 2, label: t('day.tuesday'), shortLabel: 'Tir' },
  { value: 3, label: t('day.wednesday'), shortLabel: 'Ons' },
  { value: 4, label: t('day.thursday'), shortLabel: 'Tor' },
  { value: 5, label: t('day.friday'), shortLabel: 'Fre' },
  { value: 6, label: t('day.saturday'), shortLabel: 'Lør' },
  { value: 7, label: t('day.sunday'), shortLabel: 'Søn' },
];

/**
 * Frequency options with labels
 */
const FREQUENCY_OPTIONS: Array<{ value: RecurringFrequency; label: string }> = [
  { value: 'WEEKLY', label: t('ukentlig') },
  { value: 'MONTHLY', label: t('månedlig') },
];

/**
 * End condition type options with labels
 */
const END_CONDITION_OPTIONS: Array<{ value: RecurringEndConditionType; label: string }> = [
  { value: 'AFTER_OCCURRENCES', label: t('etter.antall.ganger') },
  { value: 'UNTIL_DATE', label: t('til.en.bestemt.dato') },
];

/**
 * Default recurring pattern values
 */
export const DEFAULT_RECURRING_PATTERN: RecurringPatternData = {
  frequency: 'WEEKLY',
  weekdays: [1], // Monday by default
  startTime: '09:00',
  endTime: '10:00',
  endCondition: {
    type: 'AFTER_OCCURRENCES',
    occurrences: 4,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate time options in 30-minute intervals
 */
function generateTimeOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value, label: value });
    }
  }
  return options;
}

/**
 * Get minimum date for date picker (tomorrow)
 */
function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0] ?? '';
}

/**
 * Get maximum date for date picker based on constraints
 */
function getMaxDate(maxRangeDays?: number): string {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (maxRangeDays ?? 365));
  return maxDate.toISOString().split('T')[0] ?? '';
}

/**
 * Get default end date (4 weeks from now)
 */
function getDefaultEndDate(): string {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 28);
  return endDate.toISOString().split('T')[0] ?? '';
}

// =============================================================================
// Component
// =============================================================================

export function RecurringPatternBuilder({
  value,
  onChange,
  constraints,
  className,
  disabled = false,
  size = 'md',
}: RecurringPatternBuilderProps):
  const t = useT(); React.ReactElement {
  const timeOptions = React.useMemo(() => generateTimeOptions(), []);

  // Get allowed frequencies from constraints, or default to all
  const allowedFrequencies = constraints?.allowedFrequencies ?? ['WEEKLY', 'MONTHLY'];
  const filteredFrequencyOptions = FREQUENCY_OPTIONS.filter((opt) =>
    allowedFrequencies.includes(opt.value)
  );

  // Get allowed weekdays from constraints, or default to all
  const allowedWeekdays = constraints?.allowedWeekdays ?? [1, 2, 3, 4, 5, 6, 7];
  const filteredWeekdayOptions = WEEKDAY_OPTIONS.filter((opt) =>
    allowedWeekdays.includes(opt.value)
  );

  // Get max occurrences from constraints
  const maxOccurrences = constraints?.maxOccurrences ?? 52;

  // Handle frequency change
  const handleFrequencyChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const frequency = event.target.value as RecurringFrequency;
    onChange({ ...value, frequency });
  };

  // Handle weekday toggle
  const handleWeekdayToggle = (weekday: number, checked: boolean): void => {
    const newWeekdays = checked
      ? [...value.weekdays, weekday].sort((a, b) => a - b)
      : value.weekdays.filter((w) => w !== weekday);

    // Ensure at least one weekday is selected
    if (newWeekdays.length === 0) return;

    onChange({ ...value, weekdays: newWeekdays });
  };

  // Handle start time change
  const handleStartTimeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const startTime = event.target.value;

    // Auto-adjust end time if start time is after or equal to end time
    let endTime = value.endTime;
    if (startTime >= endTime) {
      const [h, m] = startTime.split(':').map(Number);
      const endMinutes = ((h ?? 0) * 60 + (m ?? 0)) + 60;
      const endH = Math.min(Math.floor(endMinutes / 60), 23);
      const endM = endMinutes % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    onChange({ ...value, startTime, endTime });
  };

  // Handle end time change
  const handleEndTimeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const endTime = event.target.value;

    // Don't allow end time before or equal to start time
    if (endTime <= value.startTime) return;

    onChange({ ...value, endTime });
  };

  // Handle end condition type change
  const handleEndConditionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const type = event.target.value as RecurringEndConditionType;
    const newEndCondition: RecurringEndCondition =
      type === 'AFTER_OCCURRENCES'
        ? { type, occurrences: value.endCondition.occurrences ?? 4 }
        : { type, untilDate: value.endCondition.untilDate ?? getDefaultEndDate() };

    onChange({ ...value, endCondition: newEndCondition });
  };

  // Handle occurrences change
  const handleOccurrencesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const occurrences = Math.min(Math.max(1, parseInt(event.target.value, 10) || 1), maxOccurrences);
    onChange({
      ...value,
      endCondition: { ...value.endCondition, type: 'AFTER_OCCURRENCES', occurrences },
    });
  };

  // Handle until date change
  const handleUntilDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const untilDate = event.target.value;
    onChange({
      ...value,
      endCondition: { ...value.endCondition, type: 'UNTIL_DATE', untilDate },
    });
  };

  // Calculate duration in minutes
  const getDurationMinutes = (): number => {
    const [startH, startM] = value.startTime.split(':').map(Number);
    const [endH, endM] = value.endTime.split(':').map(Number);
    return ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0));
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} time${hours > 1 ? 'r' : ''}`;
    return `${hours} t ${mins} min`;
  };

  // Get padding based on size
  const getPadding = (): string => {
    switch (size) {
      case 'sm':
        return 'var(--ds-spacing-3)';
      case 'lg':
        return 'var(--ds-spacing-5)';
      default:
        return 'var(--ds-spacing-4)';
    }
  };

  return (
    <div
      className={className}
      style={{
        padding: getPadding(),
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            color: 'var(--ds-color-accent-text-default)',
          }}
        >
          <RepeatIcon size={18} />
        </div>
        <Heading
          level={3}
          data-size="xs"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Gjentakende mønster
        </Heading>
      </div>

      {/* Frequency Selection */}
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Frekvens
        </Paragraph>
        <select
          value={value.frequency}
          onChange={handleFrequencyChange}
          disabled={disabled || filteredFrequencyOptions.length <= 1}
          style={{
            width: '100%',
            height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
            padding: '0 var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            color: 'var(--ds-color-neutral-text-default)',
            fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {filteredFrequencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Weekday Selection */}
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Ukedager
        </Paragraph>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {filteredWeekdayOptions.map((day) => {
            const isSelected = value.weekdays.includes(day.value);
            const isDisabled = disabled || (isSelected && value.weekdays.length === 1);

            return (
              <button
                key={day.value}
                type="button"
                onClick={() => !isDisabled && handleWeekdayToggle(day.value, !isSelected)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                aria-label={day.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '48px',
                  height: '40px',
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
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
                  fontWeight: isSelected
                    ? 'var(--ds-font-weight-medium)'
                    : 'var(--ds-font-weight-regular)',
                  fontSize: 'var(--ds-font-size-sm)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isSelected ? 0.5 : 1,
                  transition: 'all 150ms ease',
                }}
              >
                {day.shortLabel}
              </button>
            );
          })}
        </div>
        {value.weekdays.length > 1 && (
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {value.weekdays.length} dager valgt
          </Paragraph>
        )}
      </div>

      {/* Time Selection */}
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
          }}
        >
          <ClockIcon size={14} />
          Tidspunkt
        </Paragraph>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <div>
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Fra
            </Paragraph>
            <select
              value={value.startTime}
              onChange={handleStartTimeChange}
              disabled={disabled}
              style={{
                width: '100%',
                height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
                padding: '0 var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Til
            </Paragraph>
            <select
              value={value.endTime}
              onChange={handleEndTimeChange}
              disabled={disabled}
              style={{
                width: '100%',
                height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
                padding: '0 var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {timeOptions
                .filter((opt) => opt.value > value.startTime)
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Varighet: {formatDuration(getDurationMinutes())}
        </Paragraph>
      </div>

      {/* End Condition Selection */}
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
          }}
        >
          <CalendarIcon size={14} />
          Sluttbetingelse
        </Paragraph>
        <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Avsluttes
          </Paragraph>
          <select
            value={value.endCondition.type}
            onChange={handleEndConditionTypeChange}
            disabled={disabled}
            style={{
              width: '100%',
              height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
              padding: '0 var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-default)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {END_CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Occurrences input */}
        {value.endCondition.type === 'AFTER_OCCURRENCES' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <div style={{ maxWidth: '120px' }}>
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Antall ganger
              </Paragraph>
              <input
                type="number"
                value={value.endCondition.occurrences?.toString() ?? '4'}
                onChange={handleOccurrencesChange}
                disabled={disabled}
                min={1}
                max={maxOccurrences}
                style={{
                  width: '100%',
                  height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
                  padding: '0 var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  color: 'var(--ds-color-neutral-text-default)',
                  fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
                  cursor: disabled ? 'not-allowed' : 'text',
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            </div>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                paddingTop: 'var(--ds-spacing-6)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              (maks {maxOccurrences})
            </Paragraph>
          </div>
        )}

        {/* Until date input */}
        {value.endCondition.type === 'UNTIL_DATE' && (
          <div>
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Sluttdato
            </Paragraph>
            <input
              type="date"
              value={value.endCondition.untilDate ?? getDefaultEndDate()}
              onChange={handleUntilDateChange}
              disabled={disabled}
              min={getMinDate()}
              max={getMaxDate(constraints?.maxRangeDays)}
              style={{
                width: '100%',
                height: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '40px',
                padding: '0 var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: size === 'sm' ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-md)',
                cursor: disabled ? 'not-allowed' : 'text',
                opacity: disabled ? 0.5 : 1,
              }}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div
        style={{
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
            marginBottom: 'var(--ds-spacing-1)',
          }}
        >
          Oppsummering
        </Paragraph>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {value.frequency === 'WEEKLY' ? 'Hver uke' : 'Hver måned'} på{' '}
          {value.weekdays
            .map((w) => WEEKDAY_OPTIONS.find((opt) => opt.value === w)?.shortLabel ?? '')
            .join(', ')}{' '}
          fra {value.startTime} til {value.endTime}
          {value.endCondition.type === 'AFTER_OCCURRENCES'
            ? `, ${value.endCondition.occurrences} gang${(value.endCondition.occurrences ?? 0) > 1 ? 'er' : ''}`
            : `, til ${formatDate(value.endCondition.untilDate ?? '')}`}
        </Paragraph>
      </div>
    </div>
  );
}

/**
 * Format date for display (Norwegian format)
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default RecurringPatternBuilder;
