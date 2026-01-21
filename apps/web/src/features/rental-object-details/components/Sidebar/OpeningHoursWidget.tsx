/**
 * OpeningHoursWidget Component
 *
 * Displays weekly opening hours for facilities.
 * Shows grouped days with same hours (e.g., "Mandag-Fredag: 08:00 - 22:00").
 */

import * as React from 'react';
import { Paragraph } from '@xalatechnologies/platform/ui';
import type { OpeningHours, DayHours } from '../../types';
import { useT } from '@xalatechnologies/platform/i18n';

// =============================================================================
// Icons
// =============================================================================

function ClockIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// =============================================================================
// Day names (i18n keys)
// =============================================================================

const dayNameKeys: Record<number, string> = {
  0: 'days.sunday',
  1: 'days.monday',
  2: 'days.tuesday',
  3: 'days.wednesday',
  4: 'days.thursday',
  5: 'days.friday',
  6: 'days.saturday',
};

// =============================================================================
// Props
// =============================================================================

export interface OpeningHoursWidgetProps {
  openingHours: OpeningHours;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

interface GroupedHours {
  label: string;
  hours: string;
}

function groupConsecutiveDays(days: DayHours[], t: (key: string) => string): GroupedHours[] {
  if (!days || days.length === 0) return [];

  // Sort days: Monday (1) to Sunday (0 treated as 7)
  const sortedDays = [...days].sort((a, b) => {
    const aIndex = a.dayIndex === 0 ? 7 : a.dayIndex;
    const bIndex = b.dayIndex === 0 ? 7 : b.dayIndex;
    return aIndex - bIndex;
  });

  const groups: GroupedHours[] = [];
  let currentGroup: DayHours[] = [];
  let currentHours = '';

  for (const day of sortedDays) {
    const dayHours = day.isClosed ? t('listing.closed') : `${day.open} - ${day.close}`;

    if (currentGroup.length === 0) {
      currentGroup = [day];
      currentHours = dayHours;
    } else {
      const lastDay = currentGroup[currentGroup.length - 1];
      if (!lastDay) {
        currentGroup = [day];
        currentHours = dayHours;
        continue;
      }
      const lastDayIndex = lastDay.dayIndex === 0 ? 7 : lastDay.dayIndex;
      const currentDayIndex = day.dayIndex === 0 ? 7 : day.dayIndex;
      const isConsecutive = currentDayIndex === lastDayIndex + 1;
      const sameHours = dayHours === currentHours;

      if (isConsecutive && sameHours) {
        currentGroup.push(day);
      } else {
        // Save current group and start new one
        groups.push(formatGroup(currentGroup, currentHours, t));
        currentGroup = [day];
        currentHours = dayHours;
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    groups.push(formatGroup(currentGroup, currentHours, t));
  }

  return groups;
}

function formatGroup(days: DayHours[], hours: string, t: (key: string) => string): GroupedHours {
  const first = days[0];
  const last = days[days.length - 1];

  if (!first || !last) {
    return { label: '', hours };
  }

  if (days.length === 1) {
    return {
      label: t(dayNameKeys[first.dayIndex] ?? 'days.day'),
      hours,
    };
  }

  const firstDay = t(dayNameKeys[first.dayIndex] ?? 'days.day');
  const lastDay = t(dayNameKeys[last.dayIndex] ?? 'days.day');

  return {
    label: `${firstDay}-${lastDay}`,
    hours,
  };
}

// =============================================================================
// Component
// =============================================================================

export function OpeningHoursWidget({
  openingHours,
  className,
}: OpeningHoursWidgetProps): React.ReactElement {
  const t = useT();
  const groupedHours = React.useMemo(
    () => groupConsecutiveDays(openingHours.regular, t),
    [openingHours.regular, t]
  );

  // Hide widget if no opening hours
  if (!openingHours.regular || openingHours.regular.length === 0) {
    return <></>;
  }

  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
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
          gap: 'var(--ds-spacing-3)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          <ClockIcon />
        </div>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {t('listing.openingHours')}
        </Paragraph>
      </div>

      {/* Grouped hours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {groupedHours.map((group, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {group.label}
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: group.hours === t('listing.closed')
                  ? 'var(--ds-color-neutral-text-subtle)'
                  : 'var(--ds-color-neutral-text-default)',
              }}
            >
              {group.hours}
            </Paragraph>
          </div>
        ))}
      </div>

      {/* Exceptional days */}
      {openingHours.exceptions && openingHours.exceptions.length > 0 && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t('listing.specialDays')}
          </Paragraph>
          {openingHours.exceptions.map((exception) => (
            <div
              key={exception.date}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--ds-spacing-1) 0',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {exception.label}
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {exception.isClosed
                  ? t('listing.closed')
                  : exception.hours
                  ? `${exception.hours.open} - ${exception.hours.close}`
                  : ''}
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpeningHoursWidget;
