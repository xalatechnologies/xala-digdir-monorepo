import { useState, useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Spinner } from '@xala/ds';
import { useCalendarEvents, useListings, type CalendarEvent } from '@xala/sdk';

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

type ViewType = 'day' | 'week' | 'month';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

function getEventColor(status: CalendarEvent['status']) {
  switch (status) {
    case 'confirmed':
      return { bg: 'var(--ds-color-success-surface-default)', border: 'var(--ds-color-success-border-default)', text: 'var(--ds-color-success-text-default)' };
    case 'pending':
      return { bg: 'var(--ds-color-warning-surface-default)', border: 'var(--ds-color-warning-border-default)', text: 'var(--ds-color-warning-text-default)' };
    case 'blocked':
    case 'maintenance':
      return { bg: 'var(--ds-color-neutral-surface-hover)', border: 'var(--ds-color-neutral-border-default)', text: 'var(--ds-color-neutral-text-subtle)' };
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
  return new Date(d.setDate(diff));
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${weekStart.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function CalendarPage() {
  const [view, setView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedListing, setSelectedListing] = useState<string | undefined>(undefined);

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Fetch listings for filter dropdown
  const { data: listingsData } = useListings({ status: 'published' });
  const listings = listingsData?.data ?? [];

  // Fetch calendar events for the current week
  const { data: eventsData, isLoading } = useCalendarEvents({
    listingId: selectedListing,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
  });
  const events = eventsData?.data ?? [];

  // Transform events to day index
  const eventsByDay = useMemo(() => {
    const byDay: Record<number, CalendarEvent[]> = {};
    events.forEach((event) => {
      const eventDate = new Date(event.startTime);
      const dayOfWeek = eventDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
      if (!byDay[adjustedDay]) byDay[adjustedDay] = [];
      byDay[adjustedDay].push(event);
    });
    return byDay;
  }, [events]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Kalender
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Visuell oversikt over bookinger og tilgjengelighet.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button type="button" variant="primary" data-size="md">
            <PlusIcon />
            Opprett booking
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeftIcon />
            </Button>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRightIcon />
            </Button>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {formatWeekRange(weekStart)}
            </Heading>
            <Button type="button" variant="secondary" data-size="sm" onClick={goToToday}>
              I dag
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            {/* Listing filter */}
            <select
              value={selectedListing ?? ''}
              onChange={(e) => setSelectedListing(e.target.value || undefined)}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                minWidth: '180px',
              }}
            >
              <option value="">Alle lokaler</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.name}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant={view === 'day' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setView('day')}
              >
                Dag
              </Button>
              <Button
                type="button"
                variant={view === 'week' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setView('week')}
              >
                Uke
              </Button>
              <Button
                type="button"
                variant={view === 'month' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setView('month')}
              >
                Måned
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-success-surface-default)', border: '1px solid var(--ds-color-success-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Bekreftet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-warning-surface-default)', border: '1px solid var(--ds-color-warning-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Venter</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', border: '1px solid var(--ds-color-neutral-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Sperret</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Week View Calendar Grid */}
      <Card style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Time column */}
            <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
              <div style={{ height: '48px', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }} />
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    height: '60px',
                    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    textAlign: 'right',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', overflow: 'auto' }}>
              {days.map((day, dayIndex) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + dayIndex);
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const dayEvents = eventsByDay[dayIndex] ?? [];

                return (
                  <div key={day} style={{ borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined, position: 'relative' }}>
                    {/* Day header */}
                    <div
                      style={{
                        height: '48px',
                        padding: 'var(--ds-spacing-2)',
                        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                        textAlign: 'center',
                        backgroundColor: isToday ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <div style={{ fontSize: 'var(--ds-font-size-xs)', color: isToday ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                        {day}
                      </div>
                      <div style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: isToday ? 'var(--ds-font-weight-bold)' : 'var(--ds-font-weight-medium)', color: isToday ? 'var(--ds-color-accent-text-default)' : undefined }}>
                        {dayDate.getDate()}
                      </div>
                    </div>

                    {/* Hour slots */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          height: '60px',
                          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                          position: 'relative',
                        }}
                      />
                    ))}

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const eventStart = new Date(event.startTime);
                      const eventEnd = new Date(event.endTime);
                      const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
                      const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
                      const colors = getEventColor(event.status);
                      const top = 48 + (startHour - 7) * 60;
                      const height = Math.max((endHour - startHour) * 60 - 4, 20);

                      return (
                        <div
                          key={event.id}
                          style={{
                            position: 'absolute',
                            top: `${top}px`,
                            left: '2px',
                            right: '2px',
                            height: `${height}px`,
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 'var(--ds-border-radius-sm)',
                            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 'var(--ds-font-size-xs)',
                              fontWeight: 'var(--ds-font-weight-medium)',
                              color: colors.text,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.title || event.userName || 'Booking'}
                          </div>
                          {height > 40 && (
                            <div
                              style={{
                                fontSize: '10px',
                                color: colors.text,
                                opacity: 0.8,
                              }}
                            >
                              {event.listingName}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {events.length === 0 && !isLoading && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen bookinger denne uken.
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
