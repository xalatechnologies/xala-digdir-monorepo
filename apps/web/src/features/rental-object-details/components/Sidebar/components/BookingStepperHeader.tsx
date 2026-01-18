/**
 * BookingStepperHeader Component
 * Displays the current step in the booking flow with visual indicators
 * Enhanced with progress animations and better visual feedback
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { useT } from '@xala/i18n';

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

function CheckIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

function SparkleIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
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

// Step descriptions for better guidance
const STEP_DESCRIPTIONS: Record<string, string> = {
  calendar: 'bookingWidget.step.calendarDesc',
  pricing: 'bookingWidget.step.pricingDesc',
  confirm: 'bookingWidget.step.confirmDesc',
  success: 'bookingWidget.step.successDesc',
};

export function BookingStepperHeader({
  steps,
  currentStep,
  listingTitle,
  isMobile = false,
}: BookingStepperHeaderProps): React.ReactElement {
  const t = useT();
  
  // Calculate progress percentage
  const progressPercent = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, var(--ds-color-accent-base-hover) 100%)',
        padding: 'var(--ds-spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Header content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
          <SparkleIcon size={16} />
          <Heading
            level={2}
            data-size="md"
            style={{
              margin: 0,
              color: 'var(--ds-color-accent-contrast-default)',
            }}
          >
            {listingTitle || t('bookingWidget.title')}
          </Heading>
        </div>
        <Paragraph
          data-size="sm"
          style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', opacity: 0.9 }}
        >
          {t('bookingWidget.stepProgress', { current: currentStep + 1, total: steps.length })}
        </Paragraph>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'relative',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 'var(--ds-border-radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--ds-color-accent-contrast-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            transition: 'width 300ms ease-out',
          }}
        />
      </div>

      {/* Step Indicator */}
      <div
        className={isMobile ? 'booking-stepper-mobile' : ''}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-2)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  minWidth: isMobile ? 'auto' : '80px',
                  flex: isMobile ? '0 0 auto' : 1,
                }}
              >
                {/* Step circle */}
                <div
                  className="booking-step-circle"
                  style={{
                    width: isCurrent ? '44px' : '36px',
                    height: isCurrent ? '44px' : '36px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: isCompleted 
                      ? 'var(--ds-color-success-base-default)'
                      : isCurrent 
                        ? 'var(--ds-color-accent-contrast-default)'
                        : 'rgba(255,255,255,0.15)',
                    color: isCompleted || isCurrent
                      ? (isCompleted ? 'white' : 'var(--ds-color-accent-base-default)')
                      : 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--ds-font-weight-bold)',
                    fontSize: 'var(--ds-font-size-sm)',
                    flexShrink: 0,
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isCurrent 
                      ? '0 4px 12px rgba(0,0,0,0.15)' 
                      : isCompleted 
                        ? '0 2px 8px rgba(0,0,0,0.1)'
                        : 'none',
                    border: isCurrent 
                      ? '3px solid rgba(255,255,255,0.3)' 
                      : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon size={18} />
                  ) : (
                    (() => {
                      const IconComponent = step.icon ? STEP_ICONS[step.icon] : null;
                      return IconComponent ? <IconComponent size={18} /> : index + 1;
                    })()
                  )}
                </div>
                
                {/* Step label */}
                <Paragraph
                  className="booking-step-label"
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-accent-contrast-default)',
                    fontWeight: isCurrent ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                    opacity: isPending ? 0.5 : 1,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    transition: 'opacity 200ms ease',
                  }}
                >
                  {step.label}
                </Paragraph>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && !isMobile && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: isCompleted 
                      ? 'var(--ds-color-success-base-default)'
                      : 'rgba(255,255,255,0.2)',
                    marginTop: isCurrent ? '22px' : '18px',
                    transition: 'background-color 300ms ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
