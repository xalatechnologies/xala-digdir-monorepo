/**
 * SuccessView
 *
 * A domain-neutral success screen pattern.
 * Shows a success icon, title, message, optional details, and action buttons.
 *
 * All text content is pre-localized - this component does not handle i18n internally.
 *
 * @example
 * ```tsx
 * <SuccessView
 *   title="Action completed!"
 *   message="Your request has been processed successfully."
 *   details={[
 *     { label: 'Reference', value: 'REF-12345' },
 *     { label: 'Status', value: 'Confirmed' },
 *   ]}
 *   primaryAction={{
 *     label: 'Continue',
 *     onClick: handleContinue,
 *   }}
 *   secondaryAction={{
 *     label: 'Back to home',
 *     onClick: handleBackToHome,
 *   }}
 * />
 * ```
 */
import * as React from 'react';
import type { ReactNode } from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from './utils';

// ============================================================================
// Types
// ============================================================================

/** Detail item for key-value displays */
export interface SuccessDetail {
  /** Display label */
  label: string;
  /** Display value */
  value: string;
}

/** Action button configuration */
export interface SuccessAction {
  /** Button label (pre-localized) */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon to display before label */
  icon?: ReactNode;
}

/** SuccessView props interface */
export interface SuccessViewProps {
  /** Custom icon to display at the top (defaults to checkmark) */
  icon?: ReactNode;

  /** Main title (pre-localized) */
  title: string;

  /** Optional message/description (pre-localized) */
  message?: string;

  /** Optional array of detail items to display */
  details?: SuccessDetail[];

  /** Primary action button (optional) */
  primaryAction?: SuccessAction;

  /** Secondary action button (optional) */
  secondaryAction?: SuccessAction;

  /** Additional content to render after details */
  children?: ReactNode;

  /** Custom class name */
  className?: string;
}

// ============================================================================
// Icons (inline SVG for portability)
// ============================================================================

const CheckCircleIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ============================================================================
// CSS Keyframes (injected via style tag)
// ============================================================================

const animationStyles = `
  .success-view {
    animation: success-view-fade-in 0.5s ease-out;
  }

  @keyframes success-view-fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .success-view__icon {
    animation: success-view-bounce 0.6s ease-out 0.2s both;
  }

  @keyframes success-view-bounce {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// ============================================================================
// Main Component
// ============================================================================

export function SuccessView({
  icon,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
  children,
  className,
}: SuccessViewProps): React.ReactElement {
  const displayIcon = icon ?? <CheckCircleIcon />;

  return (
    <div
      className={cn('success-view', className)}
      style={{
        textAlign: 'center',
        padding: 'var(--ds-spacing-8)',
      }}
    >
      {/* Animation styles */}
      <style>{animationStyles}</style>

      {/* Success Icon */}
      <div
        className="success-view__icon"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--ds-color-success-surface-default)',
          borderRadius: 'var(--ds-border-radius-full)',
          marginBottom: 'var(--ds-spacing-5)',
          color: 'var(--ds-color-success-base-default)',
        }}
      >
        {displayIcon}
      </div>

      {/* Success Title */}
      <Heading level={2} data-size="lg" style={{ margin: 0 }}>
        {title}
      </Heading>

      {/* Success Message */}
      {message && (
        <Paragraph
          data-size="md"
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-3)',
            color: 'var(--ds-color-neutral-text-subtle)',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {message}
        </Paragraph>
      )}

      {/* Details Card */}
      {details && details.length > 0 && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            textAlign: 'left',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {details.map((detail, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-4)',
                }}
              >
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {detail.label}
                </Paragraph>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    textAlign: 'right',
                  }}
                >
                  {detail.value}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional content */}
      {children}

      {/* Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-8)',
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-4)',
            flexWrap: 'wrap',
          }}
        >
          {secondaryAction && (
            <Button
              type="button"
              variant="secondary"
              onClick={secondaryAction.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              type="button"
              variant="primary"
              data-color="accent"
              onClick={primaryAction.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SuccessView;
