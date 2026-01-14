/**
 * Availability Tab
 * Calendar view for viewing and managing listing availability
 * Shows bookings, blocks, and allows creating block-out periods
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@xala/ds';
import {
  useCalendarEvents,
  type CalendarEvent,
  formatWeekRange,
} from '@digilist/client-sdk';
import {
  CreateBlockModal,
  EventDrawer,
  useCalendarPermissions,
} from '../../../calendar';

interface AvailabilityTabProps {
  listingId: string;
  listingName?: string;
}

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

type EventColors = { bg: string; border: string; text: string };

function getEventColor(status: CalendarEvent['status']): EventColors {
  const normalizedStatus = status?.toLowerCase() || '';
  switch (normalizedStatus) {
    case 'confirmed':
      return {
        bg: 'var(--ds-color-success-surface-default)',
        border: 'var(--ds-color-success-border-default)',
        text: 'var(--ds-color-success-text-default)',
      };
    case 'pending':
      return {
        bg: 'var(--ds-color-warning-surface-default)',
        border: 'var(--ds-color-warning-border-default)',
        text: 'var(--ds-color-warning-text-default)',
      };
    case 'blocked':
    case 'maintenance':
      return {
        bg: 'var(--ds-color-neutral-surface-hover)',
        border: 'var(--ds-color-neutral-border-default)',
        text: 'var(--ds-color-neutral-text-subtle)',
      };
    default:
      return {
        bg: 'var(--ds-color-accent-surface-default)',
        border: 'var(--ds-color-accent-border-default)',
        text: 'var(--ds-color-accent-text-default)',
      };
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function AvailabilityTab({ listingId, listingName }: AvailabilityTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);

  const permissions = useCalendarPermissions();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Build calendar query params
  const calendarParams = useMemo(() => {
    const start = weekStart.toISOString().split('T')[0] ?? '';
    const end = weekEnd.toISOString().split('T')[0] ?? '';

    return {
      listingId,
      startDate: start,
      endDate: end,
    };
  }, [listingId, weekStart, weekEnd]);

  // Fetch calendar events
  const { data: eventsData, isLoading, refetch } = useCalendarEvents(calendarParams);
  const events = eventsData?.data ?? [];

  // Transform events to day index for week view
  const eventsByDay = useMemo(() => {
    const byDay: Record<number, CalendarEvent[]> = {};
    events.forEach((event: CalendarEvent) => {
      const eventDateStr = event.start || event.startTime;
      if (!eventDateStr) return;
      const eventDate = new Date(eventDateStr);
      const dayOfWeek = eventDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      if (!byDay[adjustedDay]) byDay[adjustedDay] = [];
      byDay[adjustedDay].push(event);
    });
    return byDay;
  }, [events]);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  // Current time indicator position
  const currentTimePosition = useMemo(() => {
    const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
    if (hour < 7 || hour > 21) return null;
    return 48 + (hour - 7) * 60;
  }, [currentTime]);

  const isCurrentDayInView = (dayIndex: number) => {
    const today = new Date();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    return dayDate.toDateString() === today.toDateString();
  };

  // Render event card
  const renderEventCard = (event: CalendarEvent) => {
    const startStr = event.start || event.startTime;
    const endStr = event.end || event.endTime;
    if (!startStr || !endStr) return null;

    const eventStart = new Date(startStr);
    const eventEnd = new Date(endStr);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    const colors = getEventColor(event.status);
    const top = 48 + (startHour - 7) * 60;
    const height = Math.max((endHour - startHour) * 60 - 4, 20);

    return (
      <div
        key={event.id}
        onClick={() => setSelectedEvent(event)}
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
          fontSize: 'var(--ds-font-size-xs)',
          color: colors.text,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.15s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.zIndex = '20';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.zIndex = '10';
        }}
      >
        <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: '2px' }}>
          {event.title || event.userName || 'Booking'}
        </div>
        <div style={{ fontSize: 'var(--ds-font-size-2xs)' }}>
          {eventStart.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })} -{' '}
          {eventEnd.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '400px',
        }}
      >
        <Spinner aria-label="Laster tilgjengelighet..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
            Tilgjengelighet
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Oversikt over bookinger og blokkeringer for {listingName || 'dette lokalet'}
          </Paragraph>
        </div>
        {permissions.canCreateBlocks && (
          <Button type="button" variant="primary" onClick={() => setIsCreateBlockOpen(true)}>
            <PlusIcon size={16} />
            Ny blokkering
          </Button>
        )}
      </div>

      {/* Calendar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <Button type="button" variant="tertiary" onClick={() => navigate('prev')}>
          <ChevronLeftIcon size={16} />
        </Button>
        <Button type="button" variant="secondary" onClick={goToToday}>
          I dag
        </Button>
        <Button type="button" variant="tertiary" onClick={() => navigate('next')}>
          <ChevronRightIcon size={16} />
        </Button>
        <Heading
          level={3}
          data-size="sm"
          style={{ margin: 0, marginLeft: 'var(--ds-spacing-2)' }}
        >
          {formatWeekRange(weekStart)}
        </Heading>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        {[
          { label: 'Bekreftet', color: getEventColor('confirmed') },
          { label: 'Venter godkjenning', color: getEventColor('pending') },
          { label: 'Blokkert', color: getEventColor('blocked') },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: item.color.bg,
                border: `1px solid ${item.color.border}`,
                borderRadius: 'var(--ds-border-radius-sm)',
              }}
            />
            <Paragraph data-size="xs" style={{ margin: 0 }}>
              {item.label}
            </Paragraph>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, 1fr)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <div style={{ padding: 'var(--ds-spacing-2)' }} />
              {days.map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + index);
                const isToday = isCurrentDayInView(index);

                return (
                  <div
                    key={day}
                    style={{
                      padding: 'var(--ds-spacing-2)',
                      textAlign: 'center',
                      fontWeight: isToday ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                      color: isToday ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{day}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', marginTop: '2px' }}>
                      {dayDate.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              {/* Time Labels Column */}
              <div style={{ borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: '60px',
                      padding: 'var(--ds-spacing-1)',
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

              {/* Day Columns */}
              {days.map((_, dayIndex) => {
                const isToday = isCurrentDayInView(dayIndex);
                const dayEvents = eventsByDay[dayIndex] || [];

                return (
                  <div
                    key={dayIndex}
                    style={{
                      position: 'relative',
                      borderRight:
                        dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                      backgroundColor: isToday
                        ? 'var(--ds-color-accent-surface-subtle)'
                        : 'transparent',
                    }}
                  >
                    {/* Hour Slots */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          height: '60px',
                          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                        }}
                      />
                    ))}

                    {/* Current Time Indicator */}
                    {isToday && currentTimePosition && (
                      <div
                        style={{
                          position: 'absolute',
                          top: `${currentTimePosition}px`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: 'var(--ds-color-danger-border-default)',
                          zIndex: 30,
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '-4px',
                            top: '-4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--ds-color-danger-border-default)',
                          }}
                        />
                      </div>
                    )}

                    {/* Events */}
                    {dayEvents.map((event) => renderEventCard(event))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-subtle)',
          border: '1px solid var(--ds-color-info-border-subtle)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          <strong>Tips:</strong> Klikk på en hendelse for å se detaljer eller administrere bookingen.
          {permissions.canCreateBlocks &&
            ' Bruk "Ny blokkering" knappen for å blokkere tidsperioder når lokalet ikke er tilgjengelig.'}
        </Paragraph>
      </Card>

      {/* Modals */}
      <CreateBlockModal
        isOpen={isCreateBlockOpen}
        onClose={() => setIsCreateBlockOpen(false)}
        initialListingId={listingId}
        onSuccess={() => {
          refetch();
        }}
      />

      <EventDrawer
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
