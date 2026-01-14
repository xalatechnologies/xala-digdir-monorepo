/**
 * BookingStepperHeader Component
 * Displays the current step in the booking flow with visual indicators
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

// Step Icons
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

function TagIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function CheckCircleIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SendIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  calendar: CalendarIcon,
  pricing: TagIcon,
  confirm: CheckCircleIcon,
  success: SendIcon,
};

export interface BookingStep {
  id: string;
  label: string;
  icon?: 'calendar' | 'pricing' | 'confirm' | 'success';
}

export interface BookingStepperHeaderProps {
  steps: BookingStep[];
  currentStep: number;
  listingTitle?: string;
  isMobile?: boolean;
}

export function BookingStepperHeader({
  steps,
  currentStep,
  listingTitle,
  isMobile = false,
}: BookingStepperHeaderProps): React.ReactElement {
  return (
    <div
      style={{
        backgroundColor: 'var(--ds-color-accent-base-default)',
        padding: 'var(--ds-spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      <div>
        <Heading
          level={2}
          data-size="md"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-accent-contrast-default)',
          }}
        >
          {listingTitle || 'Book tidspunkt'}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', opacity: 0.9 }}
        >
          Følg stegene for å fullføre bookingen
        </Paragraph>
      </div>

      {/* Step Indicator */}
      <div
        className={isMobile ? 'booking-stepper-mobile' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                minWidth: isMobile ? 'auto' : '120px',
              }}
            >
              <div
                className="booking-step-circle"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor:
                    index <= currentStep
                      ? 'var(--ds-color-accent-contrast-default)'
                      : 'var(--ds-color-accent-surface-default)',
                  color:
                    index <= currentStep
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-accent-contrast-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'var(--ds-font-weight-bold)',
                  fontSize: 'var(--ds-font-size-md)',
                  flexShrink: 0,
                  transition: 'all 200ms ease',
                }}
              >
                {(() => {
                  const IconComponent = step.icon ? STEP_ICONS[step.icon] : null;
                  return IconComponent ? <IconComponent size={20} /> : index + 1;
                })()}
              </div>
              <Paragraph
                className="booking-step-label"
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-accent-contrast-default)',
                  fontWeight: index === currentStep ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                  opacity: index === currentStep ? 1 : 0.7,
                  maxWidth: '100px',
                }}
              >
                {step.label}
              </Paragraph>
            </div>
            {index < steps.length - 1 && !isMobile && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: 'var(--ds-color-accent-surface-default)',
                  opacity: 0.5,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
