/**
 * BookingVisibilitySelector Component
 *
 * Allows users to select how their booking appears on the public calendar.
 * Options:
 * - PUBLIC_TITLE: Booking title visible to everyone
 * - PRIVATE_TITLE: Title visible only to organizer and admin
 * - ANONYMOUS: Only time blocked, no booking details visible
 *
 * GDPR compliance: Provides users control over their booking visibility.
 */

import * as React from 'react';
import { Paragraph, Radio, Card } from '@xala/ds';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export type BookingVisibility = 'PUBLIC_TITLE' | 'PRIVATE_TITLE' | 'ANONYMOUS';

export interface BookingVisibilitySelectorProps {
  /** Currently selected visibility */
  value: BookingVisibility;
  /** Callback when visibility changes */
  onChange: (visibility: BookingVisibility) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Compact variant without descriptions */
  compact?: boolean;
}

// =============================================================================
// Icons
// =============================================================================

function EyeIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// =============================================================================
// Constants
// =============================================================================

interface VisibilityOption {
  value: BookingVisibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Visibility option configs (icons only - labels/descriptions are translated)
 */
const VISIBILITY_CONFIGS: Array<{ value: BookingVisibility; key: string; icon: React.ReactNode }> = [
  { value: 'PUBLIC_TITLE', key: 'public', icon: <EyeIcon size={20} /> },
  { value: 'PRIVATE_TITLE', key: 'private', icon: <EyeOffIcon size={20} /> },
  { value: 'ANONYMOUS', key: 'anonymous', icon: <LockIcon size={20} /> },
];

// =============================================================================
// Component
// =============================================================================

export function BookingVisibilitySelector({
  value,
  onChange,
  disabled = false,
  className,
  compact = false,
}: BookingVisibilitySelectorProps): React.ReactElement {
  const t = useT();

  // Generate translated visibility options
  const visibilityOptions: VisibilityOption[] = React.useMemo(() =>
    VISIBILITY_CONFIGS.map(({ value: val, key, icon }) => ({
      value: val,
      label: t(`bookingVisibility.${key}.label`),
      description: t(`bookingVisibility.${key}.description`),
      icon,
    })),
    [t]
  );

  return (
    <div className={className}>
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-3)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {t('bookingVisibility.title')}
      </Paragraph>

      <fieldset
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <legend className="sr-only">Velg kalendersynlighet</legend>

        {visibilityOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: compact ? 'center' : 'flex-start',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-surface-default)',
                border: isSelected
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="booking-visibility"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--ds-color-accent-base-default)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  marginTop: compact ? 0 : 'var(--ds-spacing-1)',
                }}
              />

              <div
                style={{
                  color: isSelected
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {option.icon}
              </div>

              <div style={{ flex: 1 }}>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: isSelected
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {option.label}
                </Paragraph>
                {!compact && (
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      marginTop: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {option.description}
                  </Paragraph>
                )}
              </div>
            </label>
          );
        })}
      </fieldset>

      {/* GDPR Info */}
      <Paragraph
        data-size="xs"
        style={{
          margin: 0,
          marginTop: 'var(--ds-spacing-3)',
          color: 'var(--ds-color-neutral-text-subtle)',
          padding: 'var(--ds-spacing-2)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      >
        Du kan endre synlighet etter bookingen er bekreftet.
      </Paragraph>
    </div>
  );
}

export default BookingVisibilitySelector;
