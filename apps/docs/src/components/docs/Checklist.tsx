/**
 * Checklist Component
 *
 * A styled checklist component for documentation pages to display
 * a list of items with checkmark indicators.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 */

import React, { forwardRef } from 'react';

export interface ChecklistItem {
  /**
   * The text content of the checklist item
   */
  text: React.ReactNode;

  /**
   * Whether this item is checked/completed
   * @default true
   */
  checked?: boolean;
}

export interface ChecklistProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * Array of checklist items to display
   */
  items: ChecklistItem[];

  /**
   * Optional title for the checklist
   */
  title?: string;

  /**
   * Size variant for the checklist
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Icon style for checked items
   * @default 'checkmark'
   */
  iconStyle?: 'checkmark' | 'circle' | 'square';
}

/**
 * Get checkmark icon SVG
 */
const getCheckmarkIcon = (checked: boolean, iconStyle: 'checkmark' | 'circle' | 'square'): React.ReactNode => {
  const iconSize = '20px';
  const baseStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    flexShrink: 0,
  };

  if (!checked) {
    // Empty circle/square for unchecked items
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          ...baseStyle,
          color: 'var(--ds-color-neutral-border-default)',
        }}
        aria-hidden="true"
      >
        {iconStyle === 'square' ? (
          <rect x="3" y="3" width="18" height="18" rx="2" />
        ) : (
          <circle cx="12" cy="12" r="9" />
        )}
      </svg>
    );
  }

  // Checked icons
  switch (iconStyle) {
    case 'circle':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            ...baseStyle,
            color: 'var(--ds-color-success-base-default)',
          }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" fill="var(--ds-color-success-base-default)" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" />
        </svg>
      );
    case 'square':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            ...baseStyle,
            color: 'var(--ds-color-success-base-default)',
          }}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" fill="var(--ds-color-success-base-default)" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" />
        </svg>
      );
    case 'checkmark':
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            ...baseStyle,
            color: 'var(--ds-color-success-base-default)',
          }}
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
  }
};

/**
 * Get size-specific styles
 */
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: {
      fontSize: 'var(--ds-font-size-sm)',
      gap: 'var(--ds-spacing-2)',
      itemGap: 'var(--ds-spacing-2)',
    },
    md: {
      fontSize: 'var(--ds-font-size-md)',
      gap: 'var(--ds-spacing-3)',
      itemGap: 'var(--ds-spacing-3)',
    },
    lg: {
      fontSize: 'var(--ds-font-size-lg)',
      gap: 'var(--ds-spacing-4)',
      itemGap: 'var(--ds-spacing-4)',
    },
  };

  return sizes[size];
};

export const Checklist = forwardRef<HTMLUListElement, ChecklistProps>(
  (
    {
      items,
      title,
      size = 'md',
      iconStyle = 'checkmark',
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles = getSizeStyles(size);

    const containerStyle: React.CSSProperties = {
      marginBlock: 'var(--ds-spacing-4)',
    };

    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-lg)',
      fontWeight: 'var(--ds-font-weight-medium)',
      color: 'var(--ds-color-neutral-text-default)',
      marginBottom: 'var(--ds-spacing-3)',
      margin: 0,
      marginBlockEnd: 'var(--ds-spacing-3)',
    };

    const listStyle: React.CSSProperties = {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: sizeStyles.itemGap,
      ...style,
    };

    const itemStyle = (checked: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: sizeStyles.gap,
      fontSize: sizeStyles.fontSize,
      color: checked
        ? 'var(--ds-color-neutral-text-default)'
        : 'var(--ds-color-neutral-text-subtle)',
      lineHeight: 1.5,
    });

    const textStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
      paddingTop: '2px',
    };

    return (
      <div style={containerStyle}>
        {title && <p style={titleStyle}>{title}</p>}

        <ul
          ref={ref}
          role="list"
          aria-label={title || 'Checklist'}
          style={listStyle}
          {...props}
        >
          {items.map((item, index) => {
            const isChecked = item.checked !== false;

            return (
              <li
                key={index}
                style={itemStyle(isChecked)}
                aria-label={`${isChecked ? 'Completed' : 'Pending'}: ${typeof item.text === 'string' ? item.text : ''}`}
              >
                {getCheckmarkIcon(isChecked, iconStyle)}
                <span style={textStyle}>{item.text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
);

Checklist.displayName = 'Checklist';
