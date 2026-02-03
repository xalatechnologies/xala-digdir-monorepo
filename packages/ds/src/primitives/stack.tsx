/**
 * Stack Primitive
 *
 * Low-level stack component for vertical/horizontal layouts with responsive support.
 * Uses design tokens and CSS classes for responsive behavior.
 *
 * @example
 * ```tsx
 * // Vertical stack with token-based gap
 * <Stack gap="md">
 *   <Item /><Item /><Item />
 * </Stack>
 *
 * // Horizontal stack
 * <Stack direction="horizontal" gap="lg">
 *   <Item /><Item />
 * </Stack>
 *
 * // Responsive gap and direction
 * <Stack
 *   direction={{ base: 'vertical', md: 'horizontal' }}
 *   gap={{ base: 'sm', md: 'lg' }}
 * >
 *   <Item /><Item />
 * </Stack>
 *
 * // Responsive padding
 * <Stack padding={{ base: 'sm', md: 'md', lg: 'lg' }}>
 *   <Item /><Item />
 * </Stack>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import { cn } from '../utils';
import {
  type GapSize,
  type ResponsiveGap,
  type StackDirection,
  type ResponsiveStackDirection,
  type PaddingSize,
  type ResponsivePadding,
  type Breakpoint,
  isResponsive,
  gapTokenMap,
  spacingTokenMap,
} from './responsive-types';

// =============================================================================
// Types
// =============================================================================

type AlignValue = 'start' | 'center' | 'end' | 'stretch' | 'baseline' | 'flex-start' | 'flex-end';
type JustifyValue =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface StackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'ref'> {
  /**
   * Direction of the stack. Can be a simple value or responsive object.
   *
   * @example direction="vertical"
   * @example direction={{ base: 'vertical', md: 'horizontal' }}
   * @default 'vertical'
   */
  direction?: StackDirection | ResponsiveStackDirection;

  /**
   * Spacing between items (alias: gap). Can be a token, responsive object, CSS value, or number.
   *
   * @example spacing="md"
   * @example spacing={{ base: 'sm', md: 'lg' }}
   * @default '0'
   */
  spacing?: GapSize | ResponsiveGap | string | number;

  /**
   * Gap between items (alias for spacing). Can be a token, responsive object, CSS value, or number.
   *
   * @example gap="md"
   * @example gap={{ base: 'sm', md: 'lg' }}
   */
  gap?: GapSize | ResponsiveGap | string | number;

  /**
   * Padding around the stack. Can be a token, responsive object, CSS value, or number.
   *
   * @example padding="md"
   * @example padding={{ base: 'sm', md: 'md', lg: 'lg' }}
   */
  padding?: PaddingSize | ResponsivePadding | string | number;

  /**
   * Horizontal padding (left/right)
   */
  px?: PaddingSize | string | number;

  /**
   * Vertical padding (top/bottom)
   */
  py?: PaddingSize | string | number;

  /**
   * Align items
   */
  align?: AlignValue;

  /**
   * Justify items
   */
  justify?: JustifyValue;

  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: boolean;

  /**
   * Render as a different element (limited to common elements for type safety)
   * @default 'div'
   */
  as?: 'div' | 'span' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'main';
}

// =============================================================================
// Helpers
// =============================================================================

// Map short values to CSS values
const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
};

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

/**
 * Check if a gap value is a token size
 */
function isGapToken(value: unknown): value is GapSize {
  return typeof value === 'string' && value in gapTokenMap;
}

/**
 * Check if a padding value is a token size
 */
function isPaddingToken(value: unknown): value is PaddingSize {
  return typeof value === 'string' && value in spacingTokenMap;
}

/**
 * Resolve a gap value to CSS
 */
function resolveGap(gap: GapSize | string | number | undefined): string | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  if (isGapToken(gap)) return gapTokenMap[gap];
  return gap; // Already a CSS value
}

/**
 * Resolve a padding value to CSS
 */
function resolvePadding(padding: PaddingSize | string | number | undefined): string | undefined {
  if (padding === undefined) return undefined;
  if (typeof padding === 'number') return `${padding}px`;
  if (isPaddingToken(padding)) return spacingTokenMap[padding];
  return padding; // Already a CSS value
}

/**
 * Get CSS class for gap at breakpoint
 */
function getGapClass(breakpoint: Breakpoint, size: GapSize): string {
  if (breakpoint === 'base') {
    return `ds-stack-gap-${size}`;
  }
  // For responsive gaps, use the general ds-gap classes which work for both grid and flex
  return `ds-gap-${breakpoint}-${size}`;
}

/**
 * Get CSS class for padding at breakpoint
 */
function getPaddingClass(breakpoint: Breakpoint, size: PaddingSize): string {
  if (breakpoint === 'base') {
    return `ds-p-${size}`;
  }
  return `ds-p-${breakpoint}-${size}`;
}

/**
 * Get CSS class for stack direction at breakpoint
 */
function getDirectionClass(breakpoint: Breakpoint, direction: StackDirection): string {
  const dirClass = direction === 'horizontal' ? 'horizontal' : 'vertical';
  if (breakpoint === 'base') {
    return `ds-stack--${dirClass}`;
  }
  return `ds-stack-${breakpoint}-${dirClass}`;
}

// =============================================================================
// Component
// =============================================================================

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      children,
      direction = 'vertical',
      spacing = 0,
      gap,
      padding,
      px,
      py,
      align,
      justify,
      wrap = false,
      as = 'div',
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Use gap if provided, otherwise fall back to spacing
    const gapValue = gap ?? spacing;

    // Build responsive gap classes
    const gapClasses = useMemo(() => {
      if (gapValue === undefined || gapValue === 0 || gapValue === '0') return [];

      // Responsive gap object - use CSS classes
      if (isResponsive(gapValue)) {
        const classes: string[] = [];
        const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

        for (const bp of breakpoints) {
          const bpGap = gapValue[bp];
          if (bpGap) {
            classes.push(getGapClass(bp, bpGap));
          }
        }

        return classes;
      }

      // Token gap - use CSS class
      if (isGapToken(gapValue)) {
        return [`ds-stack-gap-${gapValue}`];
      }

      return [];
    }, [gapValue]);

    // Build responsive direction classes
    const directionClasses = useMemo(() => {
      // Responsive direction object - use CSS classes
      if (isResponsive(direction)) {
        const classes: string[] = [];
        const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

        for (const bp of breakpoints) {
          const bpDirection = direction[bp];
          if (bpDirection) {
            classes.push(getDirectionClass(bp, bpDirection));
          }
        }

        return classes;
      }

      // Simple direction - handled by component class naming
      return [];
    }, [direction]);

    // Build responsive padding classes
    const paddingClasses = useMemo(() => {
      if (padding === undefined) return [];

      // Responsive padding object - use CSS classes
      if (isResponsive(padding)) {
        const classes: string[] = [];
        const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

        for (const bp of breakpoints) {
          const bpPadding = padding[bp];
          if (bpPadding) {
            classes.push(getPaddingClass(bp, bpPadding));
          }
        }

        return classes;
      }

      // Token padding - use CSS class
      if (isPaddingToken(padding)) {
        return [`ds-p-${padding}`];
      }

      return [];
    }, [padding]);

    // Determine if we should use inline styles
    const useInlineGap =
      gapValue !== undefined &&
      gapValue !== 0 &&
      gapValue !== '0' &&
      !isResponsive(gapValue) &&
      !isGapToken(gapValue);

    const useInlineDirection = !isResponsive(direction);

    const useInlinePadding =
      padding !== undefined && !isResponsive(padding) && !isPaddingToken(padding);

    // Resolve px and py
    const resolvedPx = resolvePadding(px);
    const resolvedPy = resolvePadding(py);

    // Build style object
    const stackStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: useInlineDirection
        ? direction === 'horizontal'
          ? 'row'
          : 'column'
        : undefined,
      gap: useInlineGap ? resolveGap(gapValue) : undefined,
      padding: useInlinePadding
        ? typeof padding === 'number'
          ? `${padding}px`
          : (padding as string)
        : undefined,
      paddingLeft: resolvedPx,
      paddingRight: resolvedPx,
      paddingTop: resolvedPy,
      paddingBottom: resolvedPy,
      alignItems: align ? alignMap[align] || align : undefined,
      justifyContent: justify ? justifyMap[justify] || justify : undefined,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...style,
    };

    // Build class name
    const baseDirection = isResponsive(direction) ? (direction.base ?? 'vertical') : direction;
    const stackClassName = cn(
      'ds-stack',
      `ds-stack--${baseDirection}`,
      gapClasses.join(' '),
      directionClasses.join(' '),
      paddingClasses.join(' '),
      className
    );

    // Using createElement to avoid complex union types
    return React.createElement(
      as,
      {
        ref,
        className: stackClassName,
        style: stackStyle,
        ...props,
      },
      children
    );
  }
);

Stack.displayName = 'Stack';
