/**
 * BookingStepperHeader Component
 * Displays the current step in the booking flow with visual indicators
 * Enhanced with progress animations and better visual feedback
 */

import * as React from 'react';
import { Heading, Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

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

function UserIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  calendar: CalendarIcon,
  pricing: TagIcon,
  login: UserIcon,
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
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        padding: 'var(--ds-spacing-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {/* Header content - compact */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-accent-base-default)',
            }}
          >
            <CalendarIcon size={18} />
          </div>
          <div>
            <Heading
              level={2}
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {listingTitle || t('bookingWidget.title')}
            </Heading>
          </div>
        </div>
        <Paragraph
          data-size="xs"
          style={{ 
            margin: 0, 
            color: 'var(--ds-color-neutral-text-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        >
          {t('bookingWidget.stepProgress', { current: currentStep + 1, total: steps.length })}
        </Paragraph>
      </div>

      {/* Step Indicator - horizontal pills */}
      <div
        className={isMobile ? 'booking-stepper-mobile' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          padding: 'var(--ds-spacing-1)',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          
          return (
            <div
              key={step.id}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: isCurrent 
                  ? 'var(--ds-color-accent-surface-default)'
                  : isCompleted
                    ? 'var(--ds-color-success-surface-default)'
                    : 'transparent',
                transition: 'all 200ms ease',
              }}
            >
              {/* Step icon/number */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: isCompleted 
                    ? 'var(--ds-color-success-base-default)'
                    : isCurrent 
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-neutral-border-default)',
                  color: isCompleted || isCurrent
                    ? 'white'
                    : 'var(--ds-color-neutral-text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? (
                  <CheckIcon size={14} />
                ) : (
                  (() => {
                    const IconComponent = step.icon ? STEP_ICONS[step.icon] : null;
                    return IconComponent ? <IconComponent size={14} /> : index + 1;
                  })()
                )}
              </div>
              
              {/* Step label - only show on current and completed on desktop */}
              {!isMobile && (
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: isCurrent 
                      ? 'var(--ds-color-accent-text-default)'
                      : isCompleted
                        ? 'var(--ds-color-success-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    fontWeight: isCurrent ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.label}
                </Paragraph>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
