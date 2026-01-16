/**
 * Callout Component
 *
 * A styled callout/admonition component for documentation pages
 * to highlight important information, warnings, or tips.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 */

import React, { forwardRef } from 'react';

export type CalloutVariant = 'info' | 'warning' | 'danger' | 'success';

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The visual variant of the callout
   * @default 'info'
   */
  variant?: CalloutVariant;

  /**
   * Optional title for the callout
   */
  title?: string;

  /**
   * Whether to show an icon based on the variant
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Get icon SVG based on variant
 */
const getIcon = (variant: CalloutVariant): React.ReactNode => {
  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  };

  switch (variant) {
    case 'info':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
    case 'warning':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'danger':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6" />
          <path d="M9 9l6 6" />
        </svg>
      );
    case 'success':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      );
  }
};

/**
 * Get styles based on variant using design tokens
 */
const getVariantStyles = (
  variant: CalloutVariant
): {
  container: React.CSSProperties;
  icon: React.CSSProperties;
  title: React.CSSProperties;
} => {
  const baseContainer: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--ds-spacing-3)',
    padding: 'var(--ds-spacing-4)',
    borderRadius: 'var(--ds-border-radius-md)',
    marginBlock: 'var(--ds-spacing-4)',
    borderLeft: '4px solid',
  };

  const baseTitle: React.CSSProperties = {
    fontWeight: 'var(--ds-font-weight-medium)',
    marginBottom: 'var(--ds-spacing-2)',
  };

  switch (variant) {
    case 'info':
      return {
        container: {
          ...baseContainer,
          backgroundColor: 'var(--ds-color-info-background-subtle)',
          borderLeftColor: 'var(--ds-color-info-base-default)',
        },
        icon: {
          color: 'var(--ds-color-info-base-default)',
        },
        title: {
          ...baseTitle,
          color: 'var(--ds-color-info-text-default)',
        },
      };
    case 'warning':
      return {
        container: {
          ...baseContainer,
          backgroundColor: 'var(--ds-color-warning-background-subtle)',
          borderLeftColor: 'var(--ds-color-warning-base-default)',
        },
        icon: {
          color: 'var(--ds-color-warning-base-default)',
        },
        title: {
          ...baseTitle,
          color: 'var(--ds-color-warning-text-default)',
        },
      };
    case 'danger':
      return {
        container: {
          ...baseContainer,
          backgroundColor: 'var(--ds-color-danger-background-subtle)',
          borderLeftColor: 'var(--ds-color-danger-base-default)',
        },
        icon: {
          color: 'var(--ds-color-danger-base-default)',
        },
        title: {
          ...baseTitle,
          color: 'var(--ds-color-danger-text-default)',
        },
      };
    case 'success':
      return {
        container: {
          ...baseContainer,
          backgroundColor: 'var(--ds-color-success-background-subtle)',
          borderLeftColor: 'var(--ds-color-success-base-default)',
        },
        icon: {
          color: 'var(--ds-color-success-base-default)',
        },
        title: {
          ...baseTitle,
          color: 'var(--ds-color-success-text-default)',
        },
      };
  }
};

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  (
    { variant = 'info', title, showIcon = true, children, style, ...props },
    ref
  ) => {
    const styles = getVariantStyles(variant);
    const icon = getIcon(variant);

    const contentStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    return (
      <div
        ref={ref}
        role="note"
        style={{ ...styles.container, ...style }}
        {...props}
      >
        {showIcon && <div style={styles.icon}>{icon}</div>}

        <div style={contentStyle}>
          {title && <div style={styles.title}>{title}</div>}
          <div>{children}</div>
        </div>
      </div>
    );
  }
);

Callout.displayName = 'Callout';
