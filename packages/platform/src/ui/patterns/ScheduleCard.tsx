/**
 * ScheduleCard
 *
 * A generic, domain-neutral schedule display component for showing
 * time-based entries such as operating hours, availability windows,
 * or recurring schedules.
 *
 * This is a platform-level pattern component that can be used by any
 * domain (booking systems, service directories, facility management, etc.)
 * by passing props-based schedule entries rather than domain-specific DTOs.
 *
 * @example
 * ```tsx
 * <ScheduleCard
 *   entries={[
 *     { day: 'Monday', hours: '08:00 - 17:00' },
 *     { day: 'Tuesday', hours: '08:00 - 17:00', isToday: true },
 *     { day: 'Wednesday', hours: '08:00 - 17:00' },
 *     { day: 'Saturday', hours: 'Closed', isClosed: true },
 *     { day: 'Sunday', hours: 'Closed', isClosed: true },
 *   ]}
 *   title="Schedule"
 *   emptyText="No schedule available"
 * />
 * ```
 */
import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import type { ScheduleEntry } from './types';
import { cn } from './utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the ScheduleCard component
 */
export interface ScheduleCardProps {
  /** Array of schedule entries to display */
  entries: ScheduleEntry[];
  /** Optional title for the card */
  title?: string;
  /** Text to display when entries array is empty */
  emptyText?: string;
  /** Additional CSS class name */
  className?: string;
}

// =============================================================================
// Sub-components
// =============================================================================

interface ScheduleRowProps {
  entry: ScheduleEntry;
  isLast: boolean;
}

function ScheduleRow({ entry, isLast }: ScheduleRowProps): React.ReactElement {
  const { day, hours, isToday, isClosed } = entry;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: isLast ? 0 : 'var(--ds-spacing-3)',
        borderBottom: isLast
          ? 'none'
          : '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Day label */}
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          color: isToday
            ? 'var(--ds-color-accent-text-default)'
            : 'var(--ds-color-neutral-text-default)',
          fontWeight: isToday
            ? ('var(--ds-font-weight-medium)' as unknown as number)
            : 'inherit',
        }}
      >
        {day}
      </Paragraph>

      {/* Hours badge */}
      <span
        style={{
          display: 'inline-block',
          padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
          backgroundColor: isClosed
            ? 'var(--ds-color-neutral-surface-hover)'
            : 'var(--ds-color-neutral-surface-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-full)',
          fontSize: 'var(--ds-font-size-sm)',
          color: isClosed
            ? 'var(--ds-color-neutral-text-subtle)'
            : 'var(--ds-color-neutral-text-default)',
          fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
        }}
      >
        {hours}
      </span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * ScheduleCard component
 *
 * A generic schedule display with support for highlighting the current day
 * and visually distinguishing closed/unavailable entries.
 * Domain-neutral design allows use across any scheduling context.
 */
export function ScheduleCard({
  entries,
  title,
  emptyText = 'No schedule available',
  className,
}: ScheduleCardProps): React.ReactElement {
  // Handle empty state
  if (!entries.length) {
    return (
      <div
        className={cn('schedule-card', className)}
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
            textAlign: 'center',
          }}
        >
          {emptyText}
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      className={cn('schedule-card', className)}
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      {/* Optional title */}
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <Heading
            level={3}
            data-size="xs"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </Heading>
        </div>
      )}

      {/* Schedule entries */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {entries.map((entry, index) => (
          <ScheduleRow
            key={entry.day}
            entry={entry}
            isLast={index === entries.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default ScheduleCard;
