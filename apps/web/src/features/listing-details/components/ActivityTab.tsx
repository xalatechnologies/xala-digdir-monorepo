/**
 * ActivityTab Component
 *
 * Displays activity/history based on listing type:
 * - Facilities: Events and arrangements calendar
 * - Equipment: Rental history timeline
 * - Events: Session calendar
 */

import * as React from 'react';
import { Heading, Paragraph, Card, Tag } from '@xala/ds';
import type { ActivityData, ListingEvent, RentalHistoryItem, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';
import { useT } from '@xala/i18n';

// =============================================================================
// Icons
// =============================================================================

function CalendarIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// =============================================================================
// Status colors
// =============================================================================

const eventStatusColors: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  upcoming: 'info',
  ongoing: 'success',
  past: 'neutral',
  cancelled: 'warning',
};

const eventStatusLabels: Record<string, string> = {
  upcoming: 'Kommende',
  ongoing: 'Pågår',
  past: 'Avsluttet',
  cancelled: 'Avlyst',
};

// =============================================================================
// Props
// =============================================================================

export interface ActivityTabProps {
  activityData?: ActivityData;
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Sub-components
// =============================================================================

function EventCard({ event }: { event: ListingEvent }): React.ReactElement {
  const statusColor = eventStatusColors[event.status] || 'neutral';
  const statusLabel = eventStatusLabels[event.status] || event.status;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-2)' }}>
        <Heading level={4} data-size="xs" style={{ margin: 0 }}>
          {event.title}
        </Heading>
        <Tag color={statusColor} data-size="sm">
          {statusLabel}
        </Tag>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
        <CalendarIcon />
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          {formatDate(event.startDate)}
          {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
        </Paragraph>
      </div>

      {(event.startTime || event.endTime) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
          <ClockIcon />
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {event.startTime}{event.endTime && ` - ${event.endTime}`}
          </Paragraph>
        </div>
      )}

      {event.description && (
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {event.description}
        </Paragraph>
      )}

      {event.organizer && (
        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Arrangør: {event.organizer}
        </Paragraph>
      )}
    </Card>
  );
}

function RentalHistoryCard({ rental }: { rental: RentalHistoryItem }): React.ReactElement {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-3)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: rental.status === 'completed'
            ? 'var(--ds-color-success-base-default)'
            : 'var(--ds-color-neutral-base-default)',
        }}
      />
      <div style={{ flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          {formatDate(rental.date)}
          {rental.duration && ` • ${rental.duration}`}
        </Paragraph>
        {rental.purpose && (
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {rental.purpose}
          </Paragraph>
        )}
      </div>
      <Tag color={rental.status === 'completed' ? 'success' : 'neutral'} data-size="sm">
        {rental.status === 'completed' ? t("status.completed") : 'Kansellert'}
      </Tag>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ActivityTab({
  activityData,
  listingType,
  className,
}: ActivityTabProps):
  const t = useT(); React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  // Empty state
  if (!activityData || (activityData.events?.length === 0 && activityData.rentals?.length === 0)) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-8)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <CalendarIcon />
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', fontStyle: 'italic' }}>
          {presenter.getEmptyState('activity')}
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {/* Events list */}
      {activityData.type === 'events' && activityData.events && activityData.events.length > 0 && (
        <>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Arrangementer
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {activityData.events.map((event: ListingEvent) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}

      {/* Rental history */}
      {activityData.type === 'rentals' && activityData.rentals && activityData.rentals.length > 0 && (
        <>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Utleiehistorikk
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {activityData.rentals.map((rental: RentalHistoryItem) => (
              <RentalHistoryCard key={rental.id} rental={rental} />
            ))}
          </div>
        </>
      )}

      {/* Total count */}
      {activityData.totalCount && activityData.totalCount > (activityData.events?.length || activityData.rentals?.length || 0) && (
        <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Viser {activityData.events?.length || activityData.rentals?.length} av {activityData.totalCount} totalt
        </Paragraph>
      )}
    </div>
  );
}

export default ActivityTab;
