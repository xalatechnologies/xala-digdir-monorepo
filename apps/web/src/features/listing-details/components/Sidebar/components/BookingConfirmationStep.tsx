/**
 * BookingConfirmationStep Component
 * Step 2: Login prompt and booking confirmation
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

function CheckCircleIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export interface BookingConfirmationStepProps {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isSubmitting: boolean;
  bookingError: string | null;
  isMobile?: boolean;
  selectedSlots: Set<string>;
  slotDetails: Record<string, {
    duration: number;
    purpose?: string;
    attendees?: string;
    activityType?: string;
  }>;
  weekStart: Date;
  onLoginWithVipps?: () => void;
  onLoginAsEmployee?: () => void;
  onConfirmBooking?: () => void;
  onClearError?: () => void;
}

export function BookingConfirmationStep({
  isAuthenticated,
  isLoggingIn,
  isSubmitting,
  bookingError,
  isMobile = false,
  selectedSlots,
  slotDetails,
  weekStart,
  onLoginWithVipps,
  onLoginAsEmployee,
  onConfirmBooking,
  onClearError,
}: BookingConfirmationStepProps): React.ReactElement {
  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      {!isAuthenticated ? (
        /* Login Prompt */
        <>
          <div
            style={{
              backgroundColor: 'var(--ds-color-accent-base-default)',
              borderRadius: 'var(--ds-border-radius-xl)',
              padding: 'var(--ds-spacing-6)',
              color: 'var(--ds-color-accent-contrast-default)',
            }}
          >
            <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-accent-contrast-default)' }}>
              Logg inn for å fullføre
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-5)', opacity: 0.8 }}>
              For å sende din bookingforespørsel må du være innlogget. Vi bruker sikker autentisering for å verifisere din identitet.
            </Paragraph>

            {/* Login Options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              {/* Vipps Login */}
              <div
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  padding: 'var(--ds-spacing-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-warning-base-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-warning-contrast-default)',
                      fontWeight: 'bold',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    V
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                      Privatperson
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
                      Anbefalt
                    </Paragraph>
                  </div>
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Rask og enkel innlogging med Vipps. Ingen passord nødvendig.
                </Paragraph>
                <button
                  type="button"
                  onClick={onLoginWithVipps}
                  disabled={isLoggingIn}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-warning-base-default)',
                    color: 'var(--ds-color-warning-contrast-default)',
                    border: 'none',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    cursor: isLoggingIn ? 'wait' : 'pointer',
                    transition: 'all 150ms ease',
                    opacity: isLoggingIn ? 0.7 : 1,
                  }}
                >
                  {isLoggingIn ? 'Logger inn...' : 'Logg inn med Vipps'}
                </button>
              </div>

              {/* Employee Login */}
              <div
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  padding: 'var(--ds-spacing-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-neutral-text-default)',
                      fontWeight: 'bold',
                      fontSize: 'var(--ds-font-size-xs)',
                    }}
                  >
                    ID
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                      Organisasjon
                    </Paragraph>
                  </div>
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Logg inn på vegne av din organisasjon med ID-porten.
                </Paragraph>
                <button
                  type="button"
                  onClick={onLoginAsEmployee}
                  disabled={isLoggingIn}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    color: 'var(--ds-color-neutral-text-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    cursor: isLoggingIn ? 'wait' : 'pointer',
                    transition: 'all 150ms ease',
                    opacity: isLoggingIn ? 0.7 : 1,
                  }}
                >
                  {isLoggingIn ? 'Logger inn...' : 'Logg inn med ID-porten'}
                </button>
              </div>
            </div>

            {/* Privacy notice */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-success-base-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <CheckCircleIcon size={10} />
              </div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', opacity: 0.9 }}>
                Din informasjon behandles sikkert og i henhold til personvernlovgivningen. Ved å logge inn godtar du at vi lagrer nødvendige opplysninger for å behandle din booking.
              </Paragraph>
            </div>
          </div>
        </>
      ) : (
        /* Authenticated - Show Confirmation */
        <>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Bekreft booking
          </Heading>

          {/* Error Display */}
          {bookingError && (
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-danger-border-default)',
                marginBottom: 'var(--ds-spacing-4)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-3)',
              }}
            >
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
                  {bookingError}
                </Paragraph>
                {onClearError && (
                  <button
                    type="button"
                    onClick={onClearError}
                    style={{
                      marginTop: 'var(--ds-spacing-2)',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: 'var(--ds-color-danger-text-default)',
                      fontSize: 'var(--ds-font-size-xs)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Lukk
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Booking Summary */}
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
              Vennligst bekreft at følgende informasjon er korrekt:
            </Paragraph>

            {Array.from(selectedSlots).map((slotKey, index) => {
              const parts = slotKey.split('-');
              const dayIdx = parseInt(parts[0] ?? '0', 10);
              const timeStr = parts[1] ?? '';
              const details = slotDetails[slotKey] ?? { duration: 60 };

              const [startH, startM] = timeStr.split(':').map(Number);
              const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
              const endH = Math.floor(endMins / 60);
              const endM = endMins % 60;
              const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

              const slotDate = new Date(weekStart);
              slotDate.setDate(weekStart.getDate() + dayIdx);

              return (
                <div
                  key={slotKey}
                  style={{
                    paddingTop: index > 0 ? 'var(--ds-spacing-3)' : 0,
                    marginTop: index > 0 ? 'var(--ds-spacing-3)' : 0,
                    borderTop: index > 0 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                  }}
                >
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {dayNames[slotDate.getDay()]} {slotDate.getDate()}. {monthNames[slotDate.getMonth()]}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    <span>{timeStr} – {endTime}</span>
                    {details.purpose && <span> • {details.purpose}</span>}
                    {details.attendees && <span> • {details.attendees} personer</span>}
                  </Paragraph>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
