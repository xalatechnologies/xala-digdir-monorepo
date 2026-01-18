/**
 * RecurringBuilder Component
 *
 * Pattern builder for recurring bookings.
 * Allows users to configure:
 * - Frequency (WEEKLY, MONTHLY)
 * - Selected weekdays (for weekly)
 * - End condition (after N occurrences or until date)
 *
 * Respects RecurringConstraintsDTO from the rental object configuration.
 */

import * as React from 'react';
import { Heading, Paragraph, Button, Badge, Select, Radio, Textfield } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { RecurringConstraintsDTO, RecurringFrequency, RecurringEndCondition } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

export interface RecurringPattern {
  /** Recurrence frequency */
  frequency: RecurringFrequency;
  /** Interval between occurrences (e.g., every 2 weeks) */
  interval: number;
  /** Selected weekdays (ISO 1-7, where 1=Monday) */
  weekdays: number[];
  /** End condition */
  endCondition: RecurringEndCondition;
}

export interface RecurringBuilderProps {
  /** Initial time slot selected (startTime, endTime) */
  baseSlot: {
    startTime: string;
    endTime: string;
    date: string;
  };
  /** Recurring constraints from rental object */
  constraints?: RecurringConstraintsDTO;
  /** Current pattern configuration */
  value: RecurringPattern;
  /** Callback when pattern changes */
  onChange: (pattern: RecurringPattern) => void;
  /** Whether the builder is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Man',
  2: 'Tir',
  3: 'Ons',
  4: 'Tor',
  5: 'Fre',
  6: 'Lør',
  7: 'Søn',
};

const WEEKDAY_FULL_LABELS: Record<number, string> = {
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
  7: 'Søndag',
};

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  WEEKLY: 'Ukentlig',
  MONTHLY: 'Månedlig',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the ISO weekday (1-7) from a date string
 */
function getISOWeekday(dateStr: string): number {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 ? 7 : day; // Convert Sunday (0) to 7
}

/**
 * Calculate max date based on constraints
 */
function getMaxDate(constraints?: RecurringConstraintsDTO): string {
  const maxDays = constraints?.maxRangeDays ?? 365;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  return maxDate.toISOString().split('T')[0] ?? '';
}

// =============================================================================
// Component
// =============================================================================

export function RecurringBuilder({
  baseSlot,
  constraints,
  value,
  onChange,
  disabled = false,
  className,
}: RecurringBuilderProps): React.ReactElement {
  const t = useT();

  // Get allowed frequencies from constraints, default to WEEKLY only
  const allowedFrequencies = constraints?.allowedFrequencies ?? ['WEEKLY'];
  const maxOccurrences = constraints?.maxOccurrences ?? 52;
  const allowedWeekdays = constraints?.allowedWeekdays ?? [1, 2, 3, 4, 5, 6, 7];

  // Get the weekday of the base slot
  const baseWeekday = getISOWeekday(baseSlot.date);

  // Ensure base weekday is always selected
  React.useEffect(() => {
    if (!value.weekdays.includes(baseWeekday)) {
      onChange({
        ...value,
        weekdays: [...value.weekdays, baseWeekday].sort((a, b) => a - b),
      });
    }
  }, [baseWeekday, value, onChange]);

  const handleFrequencyChange = (frequency: RecurringFrequency) => {
    onChange({
      ...value,
      frequency,
      // Reset weekdays when switching to monthly
      weekdays: frequency === 'MONTHLY' ? [baseWeekday] : value.weekdays,
    });
  };

  const handleWeekdayToggle = (weekday: number) => {
    // Cannot deselect the base weekday
    if (weekday === baseWeekday) return;

    const newWeekdays = value.weekdays.includes(weekday)
      ? value.weekdays.filter((w) => w !== weekday)
      : [...value.weekdays, weekday].sort((a, b) => a - b);

    onChange({
      ...value,
      weekdays: newWeekdays,
    });
  };

  const handleEndConditionTypeChange = (type: 'AFTER_OCCURRENCES' | 'UNTIL_DATE') => {
    onChange({
      ...value,
      endCondition: {
        type,
        occurrences: type === 'AFTER_OCCURRENCES' ? 10 : undefined,
        untilDate: type === 'UNTIL_DATE' ? getMaxDate(constraints) : undefined,
      },
    });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({
      ...value,
      endCondition: {
        type: 'AFTER_OCCURRENCES',
        occurrences: Math.min(occurrences, maxOccurrences),
      },
    });
  };

  const handleUntilDateChange = (untilDate: string) => {
    onChange({
      ...value,
      endCondition: {
        type: 'UNTIL_DATE',
        untilDate,
      },
    });
  };

  return (
    <div className={className}>
      <Heading
        level={3}
        data-size="sm"
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-4)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        Gjentakelse
      </Heading>

      {/* Base slot info */}
      <div
        style={{
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
          Basert på: {WEEKDAY_FULL_LABELS[baseWeekday]} {baseSlot.date}, kl. {baseSlot.startTime} - {baseSlot.endTime}
        </Paragraph>
      </div>

      {/* Frequency selection */}
      <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Frekvens
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
          {allowedFrequencies.map((freq) => (
            <Button
              key={freq}
              type="button"
              variant={value.frequency === freq ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => handleFrequencyChange(freq)}
              disabled={disabled}
            >
              {FREQUENCY_LABELS[freq]}
            </Button>
          ))}
        </div>
      </div>

      {/* Weekday selection (for weekly only) */}
      {value.frequency === 'WEEKLY' && (
        <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2)',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            Ukedager
          </Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
              const isSelected = value.weekdays.includes(weekday);
              const isBaseDay = weekday === baseWeekday;
              const isAllowed = allowedWeekdays.includes(weekday);

              return (
                <button
                  key={weekday}
                  type="button"
                  onClick={() => handleWeekdayToggle(weekday)}
                  disabled={disabled || isBaseDay || !isAllowed}
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: isSelected
                      ? '2px solid var(--ds-color-accent-base-default)'
                      : '1px solid var(--ds-color-neutral-border-default)',
                    backgroundColor: isSelected
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'var(--ds-color-neutral-surface-default)',
                    color: isSelected
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                    fontWeight: isSelected ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                    fontSize: 'var(--ds-font-size-sm)',
                    cursor: isBaseDay || !isAllowed ? 'not-allowed' : 'pointer',
                    opacity: !isAllowed ? 0.4 : 1,
                    position: 'relative',
                  }}
                  title={
                    isBaseDay
                      ? t('common.basisdag_kan_ikke_fjernes')
                      : !isAllowed
                        ? t('common.ikke_tillatt_for_dette')
                        : WEEKDAY_FULL_LABELS[weekday]
                  }
                >
                  {WEEKDAY_LABELS[weekday]}
                  {isBaseDay && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--ds-color-success-base-default)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {value.weekdays.length} dag{value.weekdays.length !== 1 ? 'er' : ''} valgt per uke
          </Paragraph>
        </div>
      )}

      {/* End condition */}
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-3)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Avslutt gjentakelse
        </Paragraph>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Velg avslutningstype</legend>

          {/* After N occurrences */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor:
                value.endCondition.type === 'AFTER_OCCURRENCES'
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-surface-default)',
              border:
                value.endCondition.type === 'AFTER_OCCURRENCES'
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-2)',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="end-condition"
              checked={value.endCondition.type === 'AFTER_OCCURRENCES'}
              onChange={() => handleEndConditionTypeChange('AFTER_OCCURRENCES')}
              disabled={disabled}
              style={{ width: '18px', height: '18px', accentColor: 'var(--ds-color-accent-base-default)' }}
            />
            <span style={{ flex: 1 }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Etter antall ganger
              </Paragraph>
            </span>
            {value.endCondition.type === 'AFTER_OCCURRENCES' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <input
                  type="number"
                  min={1}
                  max={maxOccurrences}
                  value={value.endCondition.occurrences ?? 10}
                  onChange={(e) => handleOccurrencesChange(parseInt(e.target.value, 10) || 1)}
                  disabled={disabled}
                  style={{
                    width: '70px',
                    padding: 'var(--ds-spacing-2)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    textAlign: 'center',
                  }}
                />
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  ganger
                </Paragraph>
              </div>
            )}
          </label>

          {/* Until date */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor:
                value.endCondition.type === 'UNTIL_DATE'
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-surface-default)',
              border:
                value.endCondition.type === 'UNTIL_DATE'
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="end-condition"
              checked={value.endCondition.type === 'UNTIL_DATE'}
              onChange={() => handleEndConditionTypeChange('UNTIL_DATE')}
              disabled={disabled}
              style={{ width: '18px', height: '18px', accentColor: 'var(--ds-color-accent-base-default)' }}
            />
            <span style={{ flex: 1 }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Frem til dato
              </Paragraph>
            </span>
            {value.endCondition.type === 'UNTIL_DATE' && (
              <input
                type="date"
                value={value.endCondition.untilDate ?? ''}
                min={baseSlot.date}
                max={getMaxDate(constraints)}
                onChange={(e) => handleUntilDateChange(e.target.value)}
                disabled={disabled}
                style={{
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              />
            )}
          </label>
        </fieldset>
      </div>

      {/* Summary */}
      <div
        style={{
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
          Oppsummering
        </Paragraph>
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {value.frequency === 'WEEKLY'
            ? `Hver uke på ${value.weekdays.map((w) => WEEKDAY_LABELS[w]).join(', ')}`
            : `Hver måned på samme dag`}
          {value.endCondition.type === 'AFTER_OCCURRENCES'
            ? `, ${value.endCondition.occurrences} ganger totalt`
            : `, frem til ${value.endCondition.untilDate}`}
        </Paragraph>
      </div>
    </div>
  );
}

export default RecurringBuilder;
