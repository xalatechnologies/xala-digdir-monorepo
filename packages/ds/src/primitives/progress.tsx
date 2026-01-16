/**
 * Progress Component
 *
 * A simple progress bar component for displaying percentages
 */

import * as React from 'react';

export interface ProgressProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Color variant for the progress bar */
  'data-color'?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Size variant */
  'data-size'?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Get background color based on data-color prop
 */
function getBarColor(color?: string): string {
  switch (color) {
    case 'success':
      return 'var(--ds-color-success-base-default)';
    case 'warning':
      return 'var(--ds-color-warning-base-default)';
    case 'danger':
      return 'var(--ds-color-danger-base-default)';
    case 'info':
      return 'var(--ds-color-info-base-default)';
    default:
      return 'var(--ds-color-accent-base-default)';
  }
}

/**
 * Get height based on size prop
 */
function getBarHeight(size?: string): string {
  switch (size) {
    case 'sm':
      return '4px';
    case 'lg':
      return '12px';
    default:
      return '8px';
  }
}

export function Progress({
  value,
  'data-color': color,
  'data-size': size,
  className,
  'aria-label': ariaLabel,
}: ProgressProps): React.ReactElement {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `${clampedValue}% complete`}
      className={className}
      style={{
        width: '100%',
        height: getBarHeight(size),
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        borderRadius: 'var(--ds-border-radius-full)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clampedValue}%`,
          height: '100%',
          backgroundColor: getBarColor(color),
          borderRadius: 'var(--ds-border-radius-full)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}
