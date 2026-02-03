/**
 * Divider Component
 *
 * A visual separator for content, following Designsystemet patterns.
 * Supports horizontal and vertical orientations with multiple styles.
 *
 * @see https://designsystemet.no/en/components/docs/divider/overview
 * @module @xala-technologies/platform-ui/primitives/Divider
 */

import React, { forwardRef } from 'react';

// =============================================================================
// Types
// =============================================================================

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'default' | 'subtle' | 'strong';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Visual variant of the divider
   * @default 'default'
   */
  variant?: DividerVariant;

  /**
   * Spacing (margin) around the divider
   * @default 'md'
   */
  spacing?: DividerSpacing;

  /**
   * Whether the divider is decorative (aria-hidden)
   * @default true
   */
  decorative?: boolean;

  /**
   * Optional label text to display in the middle of the divider
   */
  label?: string;

  /**
   * Position of the label
   * @default 'center'
   */
  labelPosition?: 'start' | 'center' | 'end';
}

// =============================================================================
// Style Maps
// =============================================================================

const variantColors: Record<DividerVariant, string> = {
  default: 'var(--ds-color-neutral-border-default)',
  subtle: 'var(--ds-color-neutral-border-subtle)',
  strong: 'var(--ds-color-neutral-border-strong)',
};

const spacingMap: Record<DividerSpacing, string> = {
  none: '0',
  sm: 'var(--ds-spacing-2)',
  md: 'var(--ds-spacing-4)',
  lg: 'var(--ds-spacing-6)',
  xl: 'var(--ds-spacing-8)',
};

// =============================================================================
// Component
// =============================================================================

/**
 * Divider Component
 *
 * A visual separator for content sections.
 *
 * @example Basic horizontal divider
 * ```tsx
 * <Divider />
 * ```
 *
 * @example Vertical divider in a flex container
 * ```tsx
 * <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
 *   <span>Left</span>
 *   <Divider orientation="vertical" />
 *   <span>Right</span>
 * </div>
 * ```
 *
 * @example Divider with label
 * ```tsx
 * <Divider label="Or continue with" />
 * ```
 *
 * @example Strong divider with large spacing
 * ```tsx
 * <Divider variant="strong" spacing="lg" />
 * ```
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    variant = 'default',
    spacing = 'md',
    decorative = true,
    label,
    labelPosition = 'center',
    className,
    style,
    ...props
  },
  ref
): React.ReactElement {
  const isHorizontal = orientation === 'horizontal';
  const color = variantColors[variant];
  const margin = spacingMap[spacing];

  // Base styles for the divider line
  const lineStyles: React.CSSProperties = isHorizontal
    ? {
        width: '100%',
        height: '1px',
        backgroundColor: color,
        border: 'none',
        margin: 0,
      }
    : {
        width: '1px',
        height: '100%',
        minHeight: 'var(--ds-sizing-6)',
        backgroundColor: color,
        border: 'none',
        margin: 0,
      };

  // If there's a label, render as a container with lines on each side
  if (label && isHorizontal) {
    const labelStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ds-spacing-3)',
      marginTop: margin,
      marginBottom: margin,
    };

    const textStyles: React.CSSProperties = {
      flexShrink: 0,
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-color-neutral-text-subtle)',
      fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
      whiteSpace: 'nowrap',
    };

    const lineFlexStyles: React.CSSProperties = {
      ...lineStyles,
      flex: 1,
    };

    return (
      <div
        className={className}
        style={{ ...labelStyles, ...style }}
        role={decorative ? 'none' : 'separator'}
        aria-hidden={decorative}
        aria-orientation={orientation}
      >
        {labelPosition !== 'start' && <span style={lineFlexStyles} />}
        <span style={textStyles}>{label}</span>
        {labelPosition !== 'end' && <span style={lineFlexStyles} />}
      </div>
    );
  }

  // Standard divider without label
  const containerStyles: React.CSSProperties = isHorizontal
    ? {
        ...lineStyles,
        marginTop: margin,
        marginBottom: margin,
      }
    : {
        ...lineStyles,
        marginLeft: margin,
        marginRight: margin,
        alignSelf: 'stretch',
      };

  return (
    <hr
      ref={ref}
      className={className}
      style={{ ...containerStyles, ...style }}
      role={decorative ? 'none' : 'separator'}
      aria-hidden={decorative}
      aria-orientation={orientation}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';

export default Divider;
