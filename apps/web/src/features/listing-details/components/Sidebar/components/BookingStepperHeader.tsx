/**
 * BookingStepperHeader Component
 * Displays the current step in the booking flow with visual indicators
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface BookingStep {
  id: string;
  label: string;
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
                {index + 1}
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
