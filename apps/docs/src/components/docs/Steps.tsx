/**
 * Steps Component
 *
 * A step-by-step guide component for documentation pages
 * that displays numbered steps with titles and descriptions.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 */

import React, { forwardRef } from 'react';
import { Heading, Paragraph } from '@xala/ds';

export interface StepItem {
  /**
   * The title of the step
   */
  title: string;

  /**
   * Optional description or content for the step
   */
  description?: React.ReactNode;
}

export interface StepsProps extends React.HTMLAttributes<HTMLOListElement> {
  /**
   * Array of step items to display
   */
  items: StepItem[];

  /**
   * Optional title shown above the steps
   */
  title?: string;

  /**
   * Starting number for steps
   * @default 1
   */
  startFrom?: number;

  /**
   * Whether to show a vertical connecting line between steps
   * @default true
   */
  showConnector?: boolean;

  /**
   * Size variant for the step numbers
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get size-specific styles
 */
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: {
      circleSize: '28px',
      fontSize: 'var(--ds-font-size-sm)',
      titleSize: 'var(--ds-font-size-md)',
      gap: 'var(--ds-spacing-3)',
      padding: 'var(--ds-spacing-3)',
    },
    md: {
      circleSize: '36px',
      fontSize: 'var(--ds-font-size-md)',
      titleSize: 'var(--ds-font-size-lg)',
      gap: 'var(--ds-spacing-4)',
      padding: 'var(--ds-spacing-4)',
    },
    lg: {
      circleSize: '44px',
      fontSize: 'var(--ds-font-size-lg)',
      titleSize: 'var(--ds-font-size-xl)',
      gap: 'var(--ds-spacing-5)',
      padding: 'var(--ds-spacing-5)',
    },
  };

  return sizes[size];
};

/**
 * Styles using design tokens
 */
const styles = {
  container: {
    marginBlock: 'var(--ds-spacing-6)',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  } as React.CSSProperties,

  headerTitle: {
    marginBottom: 'var(--ds-spacing-4)',
  } as React.CSSProperties,

  stepItem: (showConnector: boolean, isLast: boolean) =>
    ({
      display: 'flex',
      gap: 'var(--ds-spacing-4)',
      position: 'relative',
      paddingBottom: isLast ? 0 : 'var(--ds-spacing-6)',
      // Connector line
      ...(showConnector && !isLast
        ? {
            '--connector-left': '18px',
          }
        : {}),
    }) as React.CSSProperties,

  stepNumber: (sizeStyles: ReturnType<typeof getSizeStyles>) =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeStyles.circleSize,
      height: sizeStyles.circleSize,
      minWidth: sizeStyles.circleSize,
      borderRadius: 'var(--ds-border-radius-full)',
      backgroundColor: 'var(--ds-color-accent-base-default)',
      color: 'var(--ds-color-accent-contrast-default)',
      fontWeight: 'var(--ds-font-weight-semibold)',
      fontSize: sizeStyles.fontSize,
      position: 'relative',
      zIndex: 1,
    }) as React.CSSProperties,

  connector: (sizeStyles: ReturnType<typeof getSizeStyles>) =>
    ({
      position: 'absolute',
      left: `calc(${sizeStyles.circleSize} / 2 - 1px)`,
      top: sizeStyles.circleSize,
      bottom: 0,
      width: '2px',
      backgroundColor: 'var(--ds-color-neutral-border-default)',
    }) as React.CSSProperties,

  stepContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 'var(--ds-spacing-1)',
  } as React.CSSProperties,

  stepTitle: (sizeStyles: ReturnType<typeof getSizeStyles>) =>
    ({
      marginBottom: 'var(--ds-spacing-2)',
      fontSize: sizeStyles.titleSize,
      fontWeight: 'var(--ds-font-weight-medium)',
      color: 'var(--ds-color-neutral-text-default)',
    }) as React.CSSProperties,

  stepDescription: {
    color: 'var(--ds-color-neutral-text-subtle)',
    margin: 0,
    lineHeight: 1.6,
  } as React.CSSProperties,
};

export const Steps = forwardRef<HTMLOListElement, StepsProps>(
  (
    {
      items,
      title,
      startFrom = 1,
      showConnector = true,
      size = 'md',
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles = getSizeStyles(size);

    return (
      <div style={{ marginBlock: 'var(--ds-spacing-4)' }}>
        {title && (
          <Heading level={3} style={styles.headerTitle}>
            {title}
          </Heading>
        )}

        <ol
          ref={ref}
          style={{ ...styles.container, ...style }}
          role="list"
          aria-label={title || 'Steps'}
          {...props}
        >
          {items.map((item, index) => {
            const stepNumber = startFrom + index;
            const isLast = index === items.length - 1;

            return (
              <li
                key={index}
                style={styles.stepItem(showConnector, isLast)}
              >
                {/* Connector line */}
                {showConnector && !isLast && (
                  <div
                    style={styles.connector(sizeStyles)}
                    aria-hidden="true"
                  />
                )}

                {/* Step number circle */}
                <div
                  style={styles.stepNumber(sizeStyles)}
                  aria-hidden="true"
                >
                  {stepNumber}
                </div>

                {/* Step content */}
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle(sizeStyles)}>{item.title}</div>

                  {item.description && (
                    <Paragraph style={styles.stepDescription}>
                      {item.description}
                    </Paragraph>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);

Steps.displayName = 'Steps';
