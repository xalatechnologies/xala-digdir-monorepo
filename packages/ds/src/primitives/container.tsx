/**
 * Container Primitive
 *
 * Low-level container component for consistent layouts with responsive padding.
 * Uses CSS classes from common-extensions.css for consistent behavior.
 *
 * @example
 * ```tsx
 * // Default container (1440px max-width)
 * <Container>Content</Container>
 *
 * // Size preset
 * <Container size="md">Narrower content</Container>
 *
 * // Responsive size (different max-width at breakpoints)
 * <Container size={{ base: 'full', md: 'lg', xl: 'max' }}>
 *   Responsive width content
 * </Container>
 *
 * // Responsive padding
 * <Container padding={{ base: 'sm', md: 'md', lg: 'lg' }}>
 *   Responsive padding content
 * </Container>
 *
 * // Fluid container (full width)
 * <Container fluid>Full width content</Container>
 *
 * // Custom max-width
 * <Container maxWidth="800px">Custom width</Container>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import { cn } from '../utils';
import {
  type ContainerSize,
  type ResponsiveContainerSize,
  type PaddingSize,
  type ResponsivePadding,
  type Breakpoint,
  isResponsive,
  containerSizeMap,
  spacingTokenMap,
} from './responsive-types';

// =============================================================================
// Types
// =============================================================================

// Re-export for backward compatibility
export type { ContainerSize } from './responsive-types';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container size preset. Can be a single value or responsive object.
   * - 'sm': 600px
   * - 'md': 960px
   * - 'lg': 1200px
   * - 'max': 1440px (default)
   * - 'full': 100%
   *
   * @example size="md"
   * @example size={{ base: 'full', md: 'lg', xl: 'max' }}
   */
  size?: ContainerSize | ResponsiveContainerSize;

  /**
   * Maximum width of the container (overrides size preset)
   * @default '1440px' (or size preset value)
   */
  maxWidth?: string;

  /**
   * Whether to use fluid layout (no max-width)
   * @default false
   */
  fluid?: boolean;

  /**
   * Padding - can be a token name, responsive object, or CSS value.
   * Uses responsive defaults for sensible spacing at all breakpoints.
   *
   * @example padding="md"
   * @example padding={{ base: 'sm', md: 'md', lg: 'lg' }}
   * @example padding="2rem"
   * @example padding="none" // or padding={{ base: 'none' }}
   * @default { base: 'md', md: 'lg' } (16px mobile, 20px desktop)
   */
  padding?: PaddingSize | ResponsivePadding | string | number;

  /**
   * Horizontal padding only
   */
  px?: PaddingSize | string | number;

  /**
   * Vertical padding only
   */
  py?: PaddingSize | string | number;

  /**
   * Center the container
   * @default true
   */
  centered?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Check if a padding value is a token size
 */
function isPaddingToken(value: unknown): value is PaddingSize {
  return typeof value === 'string' && value in spacingTokenMap;
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
 * Get CSS class for container size at breakpoint
 */
function getContainerSizeClass(breakpoint: Breakpoint, size: ContainerSize): string {
  if (breakpoint === 'base') {
    return `ds-container-${size}`;
  }
  return `ds-container-${breakpoint}-${size}`;
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

// =============================================================================
// Component
// =============================================================================

/** Default responsive padding: 16px mobile, 20px desktop */
const defaultPadding: ResponsivePadding = { base: 'md', md: 'lg' };

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size,
      maxWidth,
      fluid = false,
      padding = defaultPadding,
      px,
      py,
      centered = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Build responsive size classes
    const sizeClasses = useMemo(() => {
      if (fluid || maxWidth || !size) return [];

      // Simple size value - use CSS class
      if (!isResponsive(size)) {
        return [`ds-container-${size}`];
      }

      // Responsive size object - build classes for each breakpoint
      const classes: string[] = [];
      const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

      for (const bp of breakpoints) {
        const bpSize = size[bp];
        if (bpSize) {
          classes.push(getContainerSizeClass(bp, bpSize));
        }
      }

      return classes;
    }, [size, fluid, maxWidth]);

    // Build responsive padding classes
    const paddingClasses = useMemo(() => {
      // Skip if using custom CSS value or number
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

    // Build style object
    const containerStyle = useMemo<React.CSSProperties>(() => {
      // Determine if we should use inline styles for max-width
      const useInlineMaxWidth = fluid || maxWidth || (!size && !fluid);

      // Determine max-width value for inline style
      let resolvedMaxWidth: string | undefined;
      if (fluid) {
        resolvedMaxWidth = 'none';
      } else if (maxWidth) {
        resolvedMaxWidth = maxWidth;
      } else if (!size) {
        resolvedMaxWidth = containerSizeMap.max; // Default to 1440px
      } else if (!isResponsive(size)) {
        // Simple size - could use inline or class, prefer class
        resolvedMaxWidth = undefined; // Let CSS class handle it
      }

      // Determine if we should use inline styles for padding
      const useInlinePadding =
        padding !== undefined && !isResponsive(padding) && !isPaddingToken(padding);

      // Resolve px and py
      const resolvedPx = resolvePadding(px);
      const resolvedPy = resolvePadding(py);

      return {
        containerType: 'inline-size',
        containerName: 'ds-container',
        maxWidth: useInlineMaxWidth ? resolvedMaxWidth : undefined,
        width: '100%',
        margin: centered ? '0 auto' : undefined,
        padding: useInlinePadding
          ? typeof padding === 'number'
            ? `${padding}px`
            : (padding as string)
          : undefined,
        paddingLeft: resolvedPx,
        paddingRight: resolvedPx,
        paddingTop: resolvedPy,
        paddingBottom: resolvedPy,
        ...style,
      } as React.CSSProperties;
    }, [fluid, maxWidth, size, padding, px, py, centered, style]);

    // Build class name
    const containerClassName = cn(
      'ds-container',
      sizeClasses.join(' '),
      paddingClasses.join(' '),
      className
    );

    return (
      <div ref={ref} className={containerClassName} style={containerStyle} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
