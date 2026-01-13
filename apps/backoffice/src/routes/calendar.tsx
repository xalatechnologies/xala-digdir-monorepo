import { useState } from 'react';
import { Card, Heading, Paragraph, Button } from '@xala/ds';

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

// Mock calendar events
interface CalendarEvent {
  id: string;
  title: string;
  listingName: string;
  startHour: number;
  endHour: number;
  day: number;
  status: 'confirmed' | 'pending' | 'blocked';
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Nordre Follo IL', listingName: 'Storhallen A', startHour: 17, endHour: 20, day: 1, status: 'confirmed' },
  { id: '2', title: 'Ski Håndball', listingName: 'Storhallen A', startHour: 10, endHour: 12, day: 2, status: 'confirmed' },
  { id: '3', title: 'Vedlikehold', listingName: 'Storhallen A', startHour: 8, endHour: 10, day: 3, status: 'blocked' },
  { id: '4', title: 'Ås Turnforening', listingName: 'Gymsalen', startHour: 16, endHour: 19, day: 2, status: 'pending' },
  { id: '5', title: 'Erik Hansen', listingName: 'Møterom 3B', startHour: 9, endHour: 11, day: 4, status: 'confirmed' },
  { id: '6', title: 'Langhus Fotball', listingName: 'Kunstgressbanen', startHour: 17, endHour: 19, day: 5, status: 'confirmed' },
];

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

function getEventColor(status: CalendarEvent['status']) {
  switch (status) {
    case 'confirmed':
      return { bg: 'var(--ds-color-success-surface-default)', border: 'var(--ds-color-success-border-default)', text: 'var(--ds-color-success-text-default)' };
    case 'pending':
      return { bg: 'var(--ds-color-warning-surface-default)', border: 'var(--ds-color-warning-border-default)', text: 'var(--ds-color-warning-text-default)' };
    case 'blocked':
      return { bg: 'var(--ds-color-neutral-surface-hover)', border: 'var(--ds-color-neutral-border-default)', text: 'var(--ds-color-neutral-text-subtle)' };
  }
}

export function CalendarPage() {
  const [view, setView] = useState<ViewType>('week');
  const [currentDate] = useState(new Date());

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
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
            <Button type="button" variant="tertiary" data-size="sm">
              <ChevronLeftIcon />
            </Button>
            <Button type="button" variant="tertiary" data-size="sm">
              <ChevronRightIcon />
            </Button>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {formatWeekRange()}
            </Heading>
          </div>

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
            {days.map((day, dayIndex) => (
              <div key={day} style={{ borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined, position: 'relative' }}>
                {/* Day header */}
                <div
                  style={{
                    height: '48px',
                    padding: 'var(--ds-spacing-2)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    textAlign: 'center',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {day}
                  </div>
                  <div style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {weekStart.getDate() + dayIndex}
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
                {mockEvents
                  .filter((e) => e.day === dayIndex + 1)
                  .map((event) => {
                    const colors = getEventColor(event.status);
                    const top = 48 + (event.startHour - 7) * 60;
                    const height = (event.endHour - event.startHour) * 60 - 4;
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
                          {event.title}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: colors.text,
                            opacity: 0.8,
                          }}
                        >
                          {event.listingName}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
