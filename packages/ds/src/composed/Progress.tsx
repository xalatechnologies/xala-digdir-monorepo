/**
 * Progress Components
 *
 * Progress bars and rings for loading/completion states.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Progress
 */

'use client';

import React from 'react';

// =============================================================================
// Types
// =============================================================================

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  animated?: boolean;
  striped?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  variant?: ProgressVariant;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Variant & Size Styles
// =============================================================================

const variantColors: Record<ProgressVariant, string> = {
  default: 'var(--ds-color-accent-base-default)',
  success: 'var(--ds-color-success-base-default)',
  warning: 'var(--ds-color-warning-base-default)',
  danger: 'var(--ds-color-danger-base-default)',
  info: 'var(--ds-color-info-base-default)',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'var(--ds-sizing-1)',
  md: 'var(--ds-sizing-2)',
  lg: 'var(--ds-sizing-4)',
};

// =============================================================================
// ProgressBar Component
// =============================================================================

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  animated = false,
  striped = false,
  className,
  style,
}: ProgressBarProps): React.ReactElement {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color = variantColors[variant];
  const height = sizeStyles[size];

  const stripedGradient = striped
    ? `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.15) 10px,
        rgba(255,255,255,0.15) 20px
      )`
    : undefined;

  return (
    <div className={className} style={style}>
      {showLabel && labelPosition === 'top' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}>Progress</span>
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          style={{
            flex: 1,
            height,
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: color,
              backgroundImage: stripedGradient,
              backgroundSize: striped ? '40px 40px' : undefined,
              borderRadius: 'var(--ds-border-radius-full)',
              transition: 'width 0.3s ease',
              animation: animated && striped ? 'progress-stripe 1s linear infinite' : undefined,
            }}
          >
            {showLabel && labelPosition === 'inside' && size === 'lg' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'white',
                }}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
        {showLabel && labelPosition === 'outside' && (
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', minWidth: 'var(--ds-sizing-10)', textAlign: 'right' }}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <style>{`@keyframes progress-stripe { 0% { background-position: 40px 0; } 100% { background-position: 0 0; } }`}</style>
    </div>
  );
}

// =============================================================================
// ProgressRing Component
// =============================================================================

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  animated = true,
  className,
  style,
}: ProgressRingProps): React.ReactElement {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color = variantColors[variant];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-color-neutral-surface-subtle)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animated ? 'stroke-dashoffset 0.3s ease' : undefined,
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: size > 80 ? 'var(--ds-font-size-xl)' : 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-bold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ProgressSteps Component
// =============================================================================

export function ProgressSteps({
  steps,
  currentStep,
  variant = 'default',
  className,
  style,
}: ProgressStepsProps): React.ReactElement {
  const color = variantColors[variant];

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', ...style }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--ds-sizing-8)',
                  height: 'var(--ds-sizing-8)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: isCompleted || isCurrent ? color : 'var(--ds-color-neutral-surface-default)',
                  color: isCompleted || isCurrent ? 'white' : 'var(--ds-color-neutral-text-subtle)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  borderWidth: !isCompleted && !isCurrent ? 'var(--ds-border-width-lg)' : 0,
                  borderStyle: 'solid',
                  borderColor: 'var(--ds-color-neutral-border-default)',
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: isCurrent ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: isCurrent ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-normal)',
                  textAlign: 'center',
                  maxWidth: 'var(--ds-sizing-20)',
                }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 'var(--ds-border-width-lg)',
                  marginBottom: 'var(--ds-spacing-6)',
                  backgroundColor: isCompleted ? color : 'var(--ds-color-neutral-border-default)',
                  marginLeft: 'var(--ds-spacing-2)',
                  marginRight: 'var(--ds-spacing-2)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default { ProgressBar, ProgressRing, ProgressSteps };
