/**
 * OpeningHoursWidget Component
 *
 * Displays weekly opening hours for facilities.
 * Shows current open/closed status.
 */

import * as React from 'react';
import { Card, Heading, Paragraph, Tag } from '@digdir/designsystemet-react';
import type { OpeningHours, DayHours } from '../../types';
import { isCurrentlyOpen } from '../../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================


// =============================================================================
// Day names
// =============================================================================

const dayNames: Record<number, string> = {
  0: 'Søndag',
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
};

// =============================================================================
// Props
// =============================================================================

export interface OpeningHoursWidgetProps {
  openingHours: OpeningHours;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function OpeningHoursWidget({
  openingHours,
  className,
}: OpeningHoursWidgetProps): React.ReactElement {
  const { isOpen, statusText } = isCurrentlyOpen(openingHours);
  const today = new Date().getDay();

  // Sort days starting from Monday (1)
  const sortedDays = React.useMemo(() => {
    const days = [...openingHours.regular];
    return days.sort((a, b) => {
      // Adjust so Monday is first (0), Sunday is last (6)
      const aIndex = a.dayIndex === 0 ? 7 : a.dayIndex;
      const bIndex = b.dayIndex === 0 ? 7 : b.dayIndex;
      return aIndex - bIndex;
    });
  }, [openingHours.regular]);

  return (
    <Card
      className={className}
      style={{
        padding: 'var(--ds-spacing-5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="xs" style={{ margin: 0 }}>
          Åpningstider
        </Heading>
        <Tag
          color={isOpen ? 'success' : 'danger'}
          data-size="sm"
        >
          {statusText}
        </Tag>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {sortedDays.map((day: DayHours, index: number) => {
          const isToday = day.dayIndex === today;
          const dayName = dayNames[day.dayIndex] || `Dag ${day.dayIndex}`;

          return (
            <div
              key={`${day.dayIndex}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: isToday ? 'var(--ds-color-accent-surface-default)' : 'transparent',
              }}
            >
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: isToday ? 'var(--ds-font-weight-medium)' : 'normal',
                }}
              >
                {dayName}
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: day.isClosed ? 'var(--ds-color-neutral-text-subtle)' : 'inherit',
                }}
              >
                {day.isClosed ? 'Stengt' : `${day.open} - ${day.close}`}
              </Paragraph>
            </div>
          );
        })}
      </div>

      {/* Exceptional days */}
      {openingHours.exceptions && openingHours.exceptions.length > 0 && (
        <div style={{ marginTop: 'var(--ds-spacing-4)', paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Spesielle dager
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
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {exception.isClosed
                  ? 'Stengt'
                  : exception.hours
                  ? `${exception.hours.open} - ${exception.hours.close}`
                  : ''}
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default OpeningHoursWidget;
