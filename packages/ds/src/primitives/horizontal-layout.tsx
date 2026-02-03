/**
 * HorizontalLayout Primitive
 *
 * Flexible horizontal layout component for row-based layouts with responsive stacking.
 * Uses design tokens and CSS classes for responsive behavior.
 *
 * @example
 * ```tsx
 * // Basic horizontal layout
 * <HorizontalLayout gap="md">
 *   <Item /><Item /><Item />
 * </HorizontalLayout>
 *
 * // Stack on mobile (column on mobile, row on md+)
 * <HorizontalLayout stackOn="md" gap="md">
 *   <Item /><Item />
 * </HorizontalLayout>
 *
 * // Responsive direction
 * <HorizontalLayout direction={{ base: 'column', md: 'row' }} gap={{ base: 'sm', md: 'lg' }}>
 *   <Item /><Item />
 * </HorizontalLayout>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import { cn } from '../utils';
import {
  type GapSize,
  type ResponsiveGap,
  type FlexDirection,
  type ResponsiveFlexDirection,
  type Breakpoint,
  isResponsive,
  gapTokenMap,
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

export interface HorizontalLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the layout should fill the viewport height
   * @default false
   */
  fullHeight?: boolean;

  /**
   * Background color preset
   */
  background?: 'default' | 'subtle' | 'surface';

  /**
   * Gap between items. Can be a token name, responsive object, CSS value, or number.
   *
   * @example gap="md"
   * @example gap={{ base: 'sm', md: 'lg' }}
   * @example gap="1rem"
   * @example gap={16}
   */
  gap?: GapSize | ResponsiveGap | string | number;

  /**
   * Align items vertically
   */
  align?: AlignValue;

  /**
   * Justify items horizontally
   */
  justify?: JustifyValue;

  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: boolean;

  /**
   * Flex direction. Can be a simple value or responsive object.
   *
   * @example direction="row"
   * @example direction={{ base: 'column', md: 'row' }}
   * @default 'row'
   */
  direction?: FlexDirection | ResponsiveFlexDirection;

  /**
   * Shorthand for responsive stacking: column on mobile, row at specified breakpoint+
   * - 'sm': Stack until 640px, row at 640px+
   * - 'md': Stack until 768px, row at 768px+
   * - 'lg': Stack until 1024px, row at 1024px+
   *
   * @example stackOn="md"
   */
  stackOn?: 'sm' | 'md' | 'lg';

  children: React.ReactNode;
}

// =============================================================================
// Helpers
// =============================================================================

const backgroundMap: Record<string, string> = {
  default: 'var(--ds-color-neutral-background-default)',
  subtle: 'var(--ds-color-neutral-background-subtle)',
  surface: 'var(--ds-color-neutral-surface-default)',
};

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
 * Resolve a gap value to CSS
 */
function resolveGap(gap: GapSize | string | number | undefined): string | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  if (isGapToken(gap)) return gapTokenMap[gap];
  return gap; // Already a CSS value
}

/**
 * Get CSS class for gap at breakpoint
 */
function getGapClass(breakpoint: Breakpoint, size: GapSize): string {
  if (breakpoint === 'base') {
    return `ds-gap-${size}`;
  }
  return `ds-gap-${breakpoint}-${size}`;
}

/**
 * Get CSS class for flex direction at breakpoint
 */
function getDirectionClass(breakpoint: Breakpoint, direction: FlexDirection): string {
  const dirClass = direction === 'row' ? 'row' : 'col';
  if (breakpoint === 'base') {
    return `ds-flex-${dirClass}`;
  }
  return `ds-flex-${breakpoint}-${dirClass}`;
}

// =============================================================================
// Component
// =============================================================================

export const HorizontalLayout = forwardRef<HTMLDivElement, HorizontalLayoutProps>(
  (
    {
      fullHeight = false,
      background,
      gap,
      align,
      justify,
      wrap = false,
      direction,
      stackOn,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Build responsive gap classes
    const gapClasses = useMemo(() => {
      if (gap === undefined) return [];

      // Responsive gap object - use CSS classes
      if (isResponsive(gap)) {
        const classes: string[] = [];
        const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

        for (const bp of breakpoints) {
          const bpGap = gap[bp];
          if (bpGap) {
            classes.push(getGapClass(bp, bpGap));
          }
        }

        return classes;
      }

      // Token gap - use CSS class
      if (isGapToken(gap)) {
        return [`ds-gap-${gap}`];
      }

      return [];
    }, [gap]);

    // Build responsive direction classes
    const directionClasses = useMemo(() => {
      // stackOn takes precedence over direction
      if (stackOn) {
        return [`ds-horizontal-layout--stack-${stackOn}`];
      }

      if (!direction) return [];

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

      // Simple direction - use CSS class
      const dirClass = direction === 'row' ? 'row' : 'col';
      return [`ds-flex-${dirClass}`];
    }, [direction, stackOn]);

    // Determine if we should use inline styles for gap
    const useInlineGap = gap !== undefined && !isResponsive(gap) && !isGapToken(gap);

    // Determine if we should use inline styles for direction
    const useInlineDirection = !stackOn && !isResponsive(direction);

    // Build style object
    const layoutStyle = useMemo<React.CSSProperties>(
      () => ({
        display: 'flex',
        flexDirection: useInlineDirection ? (direction === 'column' ? 'column' : 'row') : undefined,
        height: fullHeight ? '100vh' : undefined,
        backgroundColor: background ? backgroundMap[background] : undefined,
        gap: useInlineGap ? resolveGap(gap) : undefined,
        alignItems: align ? alignMap[align] || align : undefined,
        justifyContent: justify ? justifyMap[justify] || justify : undefined,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }),
      [
        useInlineDirection,
        direction,
        fullHeight,
        background,
        useInlineGap,
        gap,
        align,
        justify,
        wrap,
        style,
      ]
    );

    // Build class name
    const layoutClassName = cn(
      'ds-horizontal-layout',
      gapClasses.join(' '),
      directionClasses.join(' '),
      className
    );

    return (
      <div ref={ref} className={layoutClassName} style={layoutStyle} {...props}>
        {children}
      </div>
    );
  }
);

HorizontalLayout.displayName = 'HorizontalLayout';

export default HorizontalLayout;
