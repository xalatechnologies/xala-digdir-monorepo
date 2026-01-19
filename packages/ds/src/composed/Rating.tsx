/**
 * Rating & StarRating Components
 *
 * Interactive rating inputs with stars, hearts, or custom icons.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Rating
 */

'use client';

import React, { useState, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'gold' | 'red' | 'green';
  icon?: ReactNode;
  emptyIcon?: ReactNode;
  halfIcon?: ReactNode;
  allowHalf?: boolean;
  allowClear?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface RatingDisplayProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function StarIcon({ filled = false, half = false }: { filled?: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfGrad)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// =============================================================================
// Styles
// =============================================================================

const sizeStyles = {
  sm: { icon: '16px', gap: 'var(--ds-spacing-1)' },
  md: { icon: '24px', gap: 'var(--ds-spacing-1)' },
  lg: { icon: '32px', gap: 'var(--ds-spacing-2)' },
};

const colorStyles = {
  default: 'var(--ds-color-accent-base-default)',
  gold: '#fbbf24',
  red: 'var(--ds-color-danger-base-default)',
  green: 'var(--ds-color-success-base-default)',
};

// =============================================================================
// Rating Component
// =============================================================================

export function Rating({
  value: controlledValue,
  defaultValue = 0,
  max = 5,
  onChange,
  readonly = false,
  disabled = false,
  size = 'md',
  color = 'gold',
  icon,
  emptyIcon,
  halfIcon,
  allowHalf = false,
  allowClear = true,
  showValue = false,
  label,
  className,
  style,
}: RatingProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const value = isControlled ? controlledValue : internalValue;
  const displayValue = hoverValue ?? value;
  const styles = sizeStyles[size];
  const activeColor = colorStyles[color];

  const handleClick = useCallback(
    (index: number, isHalf: boolean) => {
      if (readonly || disabled) return;
      let newValue = isHalf ? index + 0.5 : index + 1;
      if (allowClear && newValue === value) {
        newValue = 0;
      }
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [readonly, disabled, allowClear, value, isControlled, onChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (readonly || disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = allowHalf && x < rect.width / 2;
      setHoverValue(isHalf ? index + 0.5 : index + 1);
    },
    [readonly, disabled, allowHalf]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const renderIcon = (index: number) => {
    const filled = displayValue >= index + 1;
    const half = allowHalf && displayValue === index + 0.5;

    if (half && halfIcon) return halfIcon;
    if (half) return <StarIcon half />;
    if (filled && icon) return icon;
    if (filled) return <StarIcon filled />;
    if (emptyIcon) return emptyIcon;
    return <StarIcon />;
  };

  return (
    <div className={className} style={style}>
      {label && (
        <span
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: styles.gap,
        }}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: max }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isHalf = allowHalf && x < rect.width / 2;
              handleClick(index, isHalf);
            }}
            onMouseMove={(e) => handleMouseMove(e, index)}
            disabled={disabled}
            aria-label={`Rate ${index + 1} out of ${max}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: styles.icon,
              height: styles.icon,
              padding: 0,
              backgroundColor: 'transparent',
              borderWidth: '0',
              cursor: readonly || disabled ? 'default' : 'pointer',
              color: displayValue >= index + 0.5 ? activeColor : 'var(--ds-color-neutral-border-default)',
              opacity: disabled ? 0.5 : 1,
              transition: 'color 0.15s ease, transform 0.15s ease',
              transform: hoverValue !== null && hoverValue >= index + 0.5 ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span style={{ width: styles.icon, height: styles.icon }}>{renderIcon(index)}</span>
          </button>
        ))}
        {showValue && (
          <span
            style={{
              marginLeft: 'var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {value.toFixed(allowHalf ? 1 : 0)}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// RatingDisplay Component (Read-only)
// =============================================================================

export function RatingDisplay({
  value,
  max = 5,
  size = 'md',
  showValue = true,
  showCount,
  className,
  style,
}: RatingDisplayProps): React.ReactElement {
  const styles = sizeStyles[size];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: styles.gap,
        ...style,
      }}
    >
      {Array.from({ length: max }).map((_, index) => {
        const filled = value >= index + 1;
        const partial = value > index && value < index + 1;
        const fillPercent = partial ? (value - index) * 100 : 0;

        return (
          <span
            key={index}
            style={{
              position: 'relative',
              width: styles.icon,
              height: styles.icon,
              color: 'var(--ds-color-neutral-border-default)',
            }}
          >
            <StarIcon />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                width: filled ? '100%' : `${fillPercent}%`,
                color: '#fbbf24',
              }}
            >
              <StarIcon filled />
            </span>
          </span>
        );
      })}
      {showValue && (
        <span
          style={{
            marginLeft: 'var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {value.toFixed(1)}
        </span>
      )}
      {showCount !== undefined && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          ({showCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default { Rating, RatingDisplay };
