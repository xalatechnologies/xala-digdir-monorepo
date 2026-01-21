/**
 * Progress Component
 *
 * A simple progress bar component for displaying completion status.
 * Supports different colors (success, warning, danger, neutral).
 */

import React from 'react';

export interface ProgressProps {
  /**
   * Progress value from 0 to 100
   */
  value: number;
  /**
   * Color variant of the progress bar
   */
  'data-color'?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'accent';
  /**
   * Height of the progress bar
   */
  'data-size'?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS properties
   */
  style?: React.CSSProperties;
  /**
   * Class name for the container
   */
  className?: string;
  /**
   * Accessible label
   */
  'aria-label'?: string;
}

/**
 * Get CSS variable for progress bar fill color based on color prop
 */
function getProgressColor(color?: string): string {
  switch (color) {
    case 'success':
      return 'var(--ds-color-success-base-default)';
    case 'warning':
      return 'var(--ds-color-warning-base-default)';
    case 'danger':
      return 'var(--ds-color-danger-base-default)';
    case 'info':
      return 'var(--ds-color-info-base-default)';
    case 'accent':
      return 'var(--ds-color-accent-base-default)';
    case 'neutral':
    default:
      return 'var(--ds-color-neutral-base-default)';
  }
}

/**
 * Get height based on size prop
 */
function getProgressHeight(size?: string): string {
  switch (size) {
    case 'sm':
      return '4px';
    case 'lg':
      return '12px';
    case 'md':
    default:
      return '8px';
  }
}

export function Progress({
  value,
  'data-color': color,
  'data-size': size,
  style,
  className,
  'aria-label': ariaLabel,
}: ProgressProps): React.ReactElement {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  const height = getProgressHeight(size);
  const fillColor = getProgressColor(color);

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `Progress: ${clampedValue}%`}
      className={className}
      style={{
        width: '100%',
        height,
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-full)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${clampedValue}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: 'var(--ds-border-radius-full)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}
