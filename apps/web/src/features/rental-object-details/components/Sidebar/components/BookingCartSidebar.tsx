/**
 * BookingCartSidebar Component
 * Displays a sidebar with selected booking slots and their details.
 * Shows: time slots, attendees, activity type (as cards), and description.
 * Pricing is handled in a later step.
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { useT } from '@xala/i18n';

// Icons
function ShoppingCartIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Activity type configuration with icons
const ACTIVITY_TYPES = [
  { id: 'meeting', label: 'Møte', icon: '👥', description: 'Styremøte, workshop' },
  { id: 'event', label: 'Arrangement', icon: '🎉', description: 'Fest, feiring, konsert' },
  { id: 'training', label: 'Trening', icon: '⚽', description: 'Sport, idrett' },
  { id: 'class', label: 'Kurs/Undervisning', icon: '📚', description: 'Opplæring, foredrag' },
  { id: 'rehearsal', label: 'Øving', icon: '🎭', description: 'Korøving, teater' },
  { id: 'other', label: 'Annet', icon: '📌', description: 'Annen aktivitet' },
];

export interface SlotDetail {
  duration: number;
  purpose?: string;
  attendees?: string;
  activityType?: string;
}

export interface BookingCartSidebarProps {
  selectedSlots: Set<string>;
  slotDetails: Record<string, SlotDetail>;
  weekStart: Date;
  onRemoveSlot: (slotKey: string) => void;
  onChangeDuration?: (slotKey: string, duration: number) => void;
  onChangeAttendees?: (slotKey: string, attendees: string) => void;
  onChangeActivityType?: (slotKey: string, activityType: string) => void;
  onChangePurpose?: (slotKey: string, purpose: string) => void;
  lastUpdated?: Date;
}

export function BookingCartSidebar({
  selectedSlots,
  slotDetails,
  weekStart,
  onRemoveSlot,
  onChangeDuration,
  onChangeAttendees,
  onChangeActivityType,
  onChangePurpose,
  lastUpdated,
}: BookingCartSidebarProps): React.ReactElement {
  const t = useT();
  const [expandedSlot, setExpandedSlot] = React.useState<string | null>(null);

  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

  // Format last updated timestamp
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 10) {
      return 'Akkurat nå';
    } else if (diffSeconds < 60) {
      return `${diffSeconds} sekunder siden`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minutt' : 'minutter'} siden`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`;
    } else {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${date.getDate()}. ${monthNames[date.getMonth()]} kl. ${hours}:${minutes}`;
    }
  };

  const slotCount = selectedSlots.size;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Cart Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-1)',
          padding: 'var(--ds-spacing-3) 0',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            minHeight: '32px',
          }}
        >
          <ShoppingCartIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Valgte tidspunkter
          </Heading>
          {slotCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                borderRadius: 'var(--ds-border-radius-full)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {slotCount}
            </span>
          )}
        </div>
        {lastUpdated && (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
            Oppdatert: {formatLastUpdated(lastUpdated)}
          </Paragraph>
        )}
      </div>

      {/* Scrollable Content - List of selected slots */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)', minWidth: 0 }}>
        {slotCount === 0 ? (
          <div
            style={{
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px dashed var(--ds-color-neutral-border-default)',
            }}
          >
            <CalendarIcon size={32} />
            <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
              Ingen tidspunkter valgt
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
              Klikk på et tidspunkt i kalenderen for å legge til
            </Paragraph>
          </div>
        ) : (
          Array.from(selectedSlots).map(slotKey => {
            const parts = slotKey.split('-');
            const dayIdx = parseInt(parts[0] ?? '0', 10);
            const timeStr = parts[1] ?? '';
            const details = slotDetails[slotKey] ?? { duration: 60 };
            const isExpanded = expandedSlot === slotKey;

            const [startH, startM] = timeStr.split(':').map(Number);
            const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
            const endH = Math.floor(endMins / 60);
            const endM = endMins % 60;
            const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            const slotDate = new Date(weekStart);
            slotDate.setDate(weekStart.getDate() + dayIdx);

            const selectedActivity = ACTIVITY_TYPES.find(a => a.id === details.activityType);

            return (
              <div
                key={slotKey}
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  overflow: 'hidden',
                }}
              >
                {/* Slot Header - Always Visible */}
                <button
                  type="button"
                  onClick={() => setExpandedSlot(isExpanded ? null : slotKey)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    backgroundColor: isExpanded ? 'var(--ds-color-accent-surface-default)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <CalendarIcon size={16} />
                      <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {slotDate.getDate()}. {monthNames[slotDate.getMonth()]}
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                      <ClockIcon size={14} />
                      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                        {timeStr} - {endTime} ({details.duration / 60}t)
                      </Paragraph>
                    </div>
                    {selectedActivity && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', marginTop: 'var(--ds-spacing-1)' }}>
                        <span style={{ fontSize: '14px' }}>{selectedActivity.icon}</span>
                        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {selectedActivity.label}
                        </Paragraph>
                      </div>
                    )}
                  </div>
                  <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
                    <ChevronDownIcon size={16} />
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                    {/* Duration Selector */}
                    {onChangeDuration && (
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                          Varighet
                        </Paragraph>
                        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                          {[60, 90, 120, 180].map(dur => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => onChangeDuration(slotKey, dur)}
                              style={{
                                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                                backgroundColor: details.duration === dur ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-surface-default)',
                                color: details.duration === dur ? 'var(--ds-color-accent-contrast-default)' : 'var(--ds-color-neutral-text-default)',
                                border: details.duration === dur ? 'none' : '1px solid var(--ds-color-neutral-border-default)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                cursor: 'pointer',
                                fontSize: 'var(--ds-font-size-sm)',
                                fontWeight: details.duration === dur ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                              }}
                            >
                              {dur / 60} time{dur > 60 ? 'r' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attendees Input */}
                    {onChangeAttendees && (
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                          <UsersIcon size={16} />
                          Antall personer
                        </Paragraph>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={details.attendees || ''}
                          onChange={(e) => onChangeAttendees(slotKey, e.target.value)}
                          placeholder="Antall deltakere"
                          style={{
                            width: '100%',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            border: '1px solid var(--ds-color-neutral-border-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            fontSize: 'var(--ds-font-size-md)',
                            backgroundColor: 'var(--ds-color-neutral-background-default)',
                          }}
                        />
                      </div>
                    )}

                    {/* Activity Type Cards (2 per row) */}
                    {onChangeActivityType && (
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                          Type aktivitet
                        </Paragraph>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-2)' }}>
                          {ACTIVITY_TYPES.map(activity => (
                            <button
                              key={activity.id}
                              type="button"
                              onClick={() => onChangeActivityType(slotKey, activity.id)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 'var(--ds-spacing-3)',
                                backgroundColor: details.activityType === activity.id ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                                border: details.activityType === activity.id ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-default)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                              }}
                            >
                              <span style={{ fontSize: '24px', marginBottom: 'var(--ds-spacing-1)' }}>{activity.icon}</span>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'center' }}>
                                {activity.label}
                              </Paragraph>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Purpose/Description */}
                    {onChangePurpose && (
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                          Beskrivelse (valgfritt)
                        </Paragraph>
                        <textarea
                          value={details.purpose || ''}
                          onChange={(e) => onChangePurpose(slotKey, e.target.value)}
                          placeholder="Beskriv kort hva lokalet skal brukes til..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            border: '1px solid var(--ds-color-neutral-border-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            fontSize: 'var(--ds-font-size-md)',
                            backgroundColor: 'var(--ds-color-neutral-background-default)',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slotKey)}
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        backgroundColor: 'transparent',
                        color: 'var(--ds-color-danger-text-default)',
                        border: '1px solid var(--ds-color-danger-border-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--ds-font-size-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--ds-spacing-1)',
                      }}
                    >
                      <span>✕</span>
                      Fjern tidspunkt
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
