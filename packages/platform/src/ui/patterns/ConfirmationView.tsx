/**
 * ConfirmationView
 *
 * A domain-neutral confirmation screen pattern.
 * Shows a summary of an action to be confirmed with action buttons.
 *
 * All text content is pre-localized - this component does not handle i18n internally.
 *
 * @example
 * ```tsx
 * <ConfirmationView
 *   title="Confirm your action"
 *   message="Please review the details before confirming."
 *   details={[
 *     { label: 'Item', value: 'Premium Package' },
 *     { label: 'Date', value: '2026-01-21' },
 *   ]}
 *   confirmLabel="Confirm"
 *   cancelLabel="Cancel"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
import * as React from 'react';
import type { ReactNode } from 'react';
import { Heading, Paragraph, Button, Spinner } from '@digdir/designsystemet-react';
import { cn } from './utils';

// ============================================================================
// Types
// ============================================================================

/** Variant for different confirmation contexts */
export type ConfirmationVariant = 'default' | 'warning' | 'danger';

/** Detail item for key-value displays */
export interface ConfirmationDetail {
  /** Display label */
  label: string;
  /** Display value */
  value: string;
}

/** ConfirmationView props interface */
export interface ConfirmationViewProps {
  /** Custom icon to display at the top */
  icon?: ReactNode;

  /** Main title (pre-localized) */
  title: string;

  /** Optional message/description (pre-localized) */
  message?: string;

  /** Optional array of detail items to display */
  details?: ConfirmationDetail[];

  /** Label for the confirm button (pre-localized) */
  confirmLabel: string;

  /** Label for the cancel button (pre-localized, optional) */
  cancelLabel?: string;

  /** Whether the confirmation is in progress (shows loading state) */
  isConfirming?: boolean;

  /** Visual variant for the confirmation (affects colors) */
  variant?: ConfirmationVariant;

  /** Callback when confirm is clicked */
  onConfirm: () => void;

  /** Callback when cancel is clicked (optional) */
  onCancel?: () => void;

  /** Additional content to render after details */
  children?: ReactNode;

  /** Custom class name */
  className?: string;
}

// ============================================================================
// Icons (inline SVG for portability)
// ============================================================================

const QuestionIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ============================================================================
// Utility Functions
// ============================================================================

/** Get variant colors based on type */
function getVariantColors(variant: ConfirmationVariant): {
  iconBg: string;
  iconColor: string;
  buttonColor: 'accent' | 'danger' | 'neutral';
} {
  const colors: Record<
    ConfirmationVariant,
    { iconBg: string; iconColor: string; buttonColor: 'accent' | 'danger' | 'neutral' }
  > = {
    default: {
      iconBg: 'var(--ds-color-accent-surface-default)',
      iconColor: 'var(--ds-color-accent-base-default)',
      buttonColor: 'accent',
    },
    warning: {
      iconBg: 'var(--ds-color-warning-surface-default)',
      iconColor: 'var(--ds-color-warning-base-default)',
      buttonColor: 'accent',
    },
    danger: {
      iconBg: 'var(--ds-color-danger-surface-default)',
      iconColor: 'var(--ds-color-danger-base-default)',
      buttonColor: 'danger',
    },
  };
  return colors[variant];
}

/** Get default icon for variant */
function getDefaultIcon(variant: ConfirmationVariant): ReactNode {
  if (variant === 'warning' || variant === 'danger') {
    return <AlertTriangleIcon />;
  }
  return <QuestionIcon />;
}

// ============================================================================
// Main Component
// ============================================================================

export function ConfirmationView({
  icon,
  title,
  message,
  details,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  variant = 'default',
  onConfirm,
  onCancel,
  children,
  className,
}: ConfirmationViewProps): React.ReactElement {
  const colors = getVariantColors(variant);
  const displayIcon = icon ?? getDefaultIcon(variant);

  return (
    <div
      className={cn('confirmation-view', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
      }}
    >
      {/* Header with icon */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Icon container */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: colors.iconBg,
            borderRadius: 'var(--ds-border-radius-full)',
            color: colors.iconColor,
          }}
        >
          {displayIcon}
        </div>

        {/* Title */}
        <Heading level={2} data-size="md" style={{ margin: 0 }}>
          {title}
        </Heading>

        {/* Message */}
        {message && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
              maxWidth: '480px',
            }}
          >
            {message}
          </Paragraph>
        )}
      </div>

      {/* Details section */}
      {details && details.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
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

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: onCancel ? 'space-between' : 'center',
          alignItems: 'center',
          gap: 'var(--ds-spacing-4)',
          marginTop: 'var(--ds-spacing-2)',
        }}
      >
        {onCancel && cancelLabel && (
          <Button
            type="button"
            variant="tertiary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          data-color={colors.buttonColor}
          onClick={onConfirm}
          disabled={isConfirming}
          aria-busy={isConfirming}
          style={{
            minWidth: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {isConfirming && <Spinner data-size="sm" aria-label="Loading" />}
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmationView;
