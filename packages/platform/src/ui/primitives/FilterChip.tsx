/**
 * FilterChip
 *
 * A removable chip component for displaying active filters.
 * Supports keyboard navigation and animations.
 *
 * @example
 * ```tsx
 * <FilterChip
 *   label="Oslo"
 *   onRemove={() => removeFilter('city', 'oslo')}
 *   data-testid="filter-chip-city"
 * />
 * ```
 */

import * as React from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '../utils';

export interface FilterChipProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Chip label text
   */
  label: string;

  /**
   * Called when chip is removed
   */
  onRemove: () => void;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'accent';

  /**
   * Chip size
   * @default 'md'
   */
  size?: 'sm' | 'md';

  /**
   * Whether the chip is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Test ID for E2E testing
   */
  'data-testid'?: string;
}

// Close icon component
const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * FilterChip Component
 *
 * Displays an active filter with a remove button.
 * Fully keyboard accessible - press Enter, Backspace, or Delete to remove.
 */
export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      label,
      onRemove,
      variant = 'default',
      size = 'md',
      disabled = false,
      className,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onRemove();
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!disabled) {
        onRemove();
      }
    };

    // Size-based styles
    const sizeStyles = {
      sm: {
        padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
        fontSize: 'var(--ds-font-size-xs)',
        height: '28px',
        iconSize: 12,
      },
      md: {
        padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
        fontSize: 'var(--ds-font-size-sm)',
        height: '36px',
        iconSize: 16,
      },
    };

    // Variant-based styles
    const variantStyles = {
      default: {
        backgroundColor: isHovered && !disabled
          ? 'var(--ds-color-neutral-surface-hover)'
          : 'var(--ds-color-neutral-surface-default)',
        borderColor: isFocused
          ? 'var(--ds-color-accent-border-default)'
          : 'var(--ds-color-neutral-border-default)',
        color: 'var(--ds-color-neutral-text-default)',
        iconColor: 'var(--ds-color-neutral-text-subtle)',
      },
      accent: {
        backgroundColor: isHovered && !disabled
          ? 'var(--ds-color-accent-surface-hover)'
          : 'var(--ds-color-accent-surface-default)',
        borderColor: isFocused
          ? 'var(--ds-color-accent-border-strong)'
          : 'var(--ds-color-accent-border-default)',
        color: 'var(--ds-color-accent-text-default)',
        iconColor: 'var(--ds-color-accent-text-subtle)',
      },
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        aria-label={`Fjern filter: ${label}`}
        className={cn('ds-filter-chip', className)}
        data-testid={testId}
        data-variant={variant}
        data-size={size}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          padding: currentSize.padding,
          height: currentSize.height,
          minHeight: currentSize.height,
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: currentVariant.backgroundColor,
          border: `1px solid ${currentVariant.borderColor}`,
          fontSize: currentSize.fontSize,
          fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
          lineHeight: 'var(--ds-line-height-md)',
          color: currentVariant.color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--ds-shadow-sm)',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          outline: 'none',
        }}
        {...props}
      >
        <span>{label}</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentVariant.iconColor,
            transition: 'color 0.15s ease',
          }}
        >
          <CloseIcon size={currentSize.iconSize} />
        </span>
      </button>
    );
  }
);

FilterChip.displayName = 'FilterChip';

export default FilterChip;
