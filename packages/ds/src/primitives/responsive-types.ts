/**
 * Responsive Types
 *
 * Shared type definitions for responsive layout components.
 * Follows mobile-first breakpoint system from common-extensions.css.
 *
 * Breakpoints:
 * - base: 0px (mobile-first default)
 * - sm: 640px (large phones, small tablets)
 * - md: 768px (tablets, sidebar collapse point)
 * - lg: 1024px (laptops, small desktops)
 * - xl: 1280px (desktops, large screens)
 *
 * @module @xala-technologies/platform-ui/primitives/responsive-types
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Available responsive breakpoints (mobile-first)
 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Responsive value wrapper - allows specifying different values per breakpoint
 *
 * @example
 * // Responsive columns
 * const cols: Responsive<number> = { base: 1, md: 2, lg: 3 };
 *
 * // Responsive spacing
 * const gap: Responsive<SpacingSize> = { base: 'sm', lg: 'lg' };
 */
export interface Responsive<T> {
  /** Base value (mobile-first, always applies) */
  base?: T;
  /** Small screens (640px+) */
  sm?: T;
  /** Medium screens (768px+) */
  md?: T;
  /** Large screens (1024px+) */
  lg?: T;
  /** Extra large screens (1280px+) */
  xl?: T;
}

// =============================================================================
// Spacing Types
// =============================================================================

/**
 * Token-based spacing sizes matching --ds-spacing-* CSS variables
 */
export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Responsive spacing configuration
 */
export type ResponsiveSpacing = Responsive<SpacingSize>;

/**
 * Gap size type (alias for SpacingSize for semantic clarity)
 */
export type GapSize = SpacingSize;

/**
 * Responsive gap configuration
 */
export type ResponsiveGap = Responsive<GapSize>;

/**
 * Padding size type (alias for SpacingSize for semantic clarity)
 */
export type PaddingSize = SpacingSize;

/**
 * Responsive padding configuration
 */
export type ResponsivePadding = Responsive<PaddingSize>;

// =============================================================================
// Container Types
// =============================================================================

/**
 * Container size presets matching --ds-size-container-* CSS variables
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'max' | 'full';

/**
 * Responsive container size configuration
 */
export type ResponsiveContainerSize = Responsive<ContainerSize>;

// =============================================================================
// Direction Types
// =============================================================================

/**
 * Flex direction values
 */
export type FlexDirection = 'row' | 'column';

/**
 * Stack direction values
 */
export type StackDirection = 'vertical' | 'horizontal';

/**
 * Responsive flex direction configuration
 */
export type ResponsiveFlexDirection = Responsive<FlexDirection>;

/**
 * Responsive stack direction configuration
 */
export type ResponsiveStackDirection = Responsive<StackDirection>;

// =============================================================================
// Alignment Types
// =============================================================================

/**
 * Align items values
 */
export type AlignValue = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Justify content values
 */
export type JustifyValue = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Responsive alignment configuration
 */
export type ResponsiveAlign = Responsive<AlignValue>;

/**
 * Responsive justify configuration
 */
export type ResponsiveJustify = Responsive<JustifyValue>;

// =============================================================================
// Column Types
// =============================================================================

/**
 * Grid column count options
 */
export type ColCount = 1 | 2 | 3 | 4 | 6 | 12;

/**
 * Responsive column count configuration
 */
export type ResponsiveCols = Responsive<ColCount>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Type guard to check if a value is a responsive object
 *
 * @example
 * const value: number | Responsive<number> = { base: 1, md: 2 };
 * if (isResponsive(value)) {
 *   // value is Responsive<number>
 * }
 */
export function isResponsive<T>(value: T | Responsive<T>): value is Responsive<T> {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  // Check if it has any of the breakpoint keys
  const breakpointKeys = ['base', 'sm', 'md', 'lg', 'xl'];
  const keys = Object.keys(value);

  // Must have at least one breakpoint key and no other keys
  return keys.length > 0 && keys.every((key) => breakpointKeys.includes(key));
}

/**
 * Generate responsive CSS class names for a given prefix and responsive value
 *
 * @example
 * getResponsiveClasses('ds-grid-cols', { base: 1, md: 2, lg: 3 })
 * // Returns: ['ds-grid-cols-1', 'ds-grid-cols-md-2', 'ds-grid-cols-lg-3']
 */
export function getResponsiveClasses<T extends string | number>(
  prefix: string,
  value: Responsive<T>
): string[] {
  const classes: string[] = [];
  const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

  for (const bp of breakpoints) {
    const bpValue = value[bp];
    if (bpValue !== undefined) {
      if (bp === 'base') {
        classes.push(`${prefix}-${bpValue}`);
      } else {
        classes.push(`${prefix}-${bp}-${bpValue}`);
      }
    }
  }

  return classes;
}

/**
 * Get a single value from a responsive object or simple value
 *
 * @example
 * getValueAtBreakpoint(3, 'md') // Returns: 3
 * getValueAtBreakpoint({ base: 1, md: 2 }, 'md') // Returns: 2
 * getValueAtBreakpoint({ base: 1 }, 'md') // Returns: 1 (falls back to base)
 */
export function getValueAtBreakpoint<T>(
  value: T | Responsive<T>,
  breakpoint: Breakpoint
): T | undefined {
  if (!isResponsive(value)) {
    return value;
  }

  // Try to get value at requested breakpoint, then fall back through hierarchy
  const fallbackOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'base'];
  const startIndex = fallbackOrder.indexOf(breakpoint);

  for (let i = startIndex; i < fallbackOrder.length; i++) {
    const bp = fallbackOrder[i] as Breakpoint;
    const bpValue = value[bp];
    if (bpValue !== undefined) {
      return bpValue;
    }
  }

  return undefined;
}

/**
 * Convert a simple value or responsive object to inline style for base breakpoint only.
 * Use CSS classes for responsive behavior.
 *
 * @example
 * resolveBaseValue(3, tokenMap) // Returns: tokenMap[3] or '3'
 * resolveBaseValue({ base: 'sm', md: 'lg' }, tokenMap) // Returns: tokenMap['sm']
 */
export function resolveBaseValue<T extends string | number>(
  value: T | Responsive<T>,
  tokenMap?: Record<string, string>
): string | undefined {
  const baseValue = isResponsive(value) ? value.base : value;

  if (baseValue === undefined) return undefined;

  if (typeof baseValue === 'number') {
    return `${baseValue}px`;
  }

  const baseStr = String(baseValue);
  if (tokenMap && baseStr in tokenMap) {
    return tokenMap[baseStr];
  }

  return baseStr;
}

// =============================================================================
// Token Maps (for use with utility functions)
// =============================================================================

/**
 * Map spacing token names to CSS variable values
 */
export const spacingTokenMap: Record<SpacingSize, string> = {
  none: '0',
  xs: 'var(--ds-spacing-1)',
  sm: 'var(--ds-spacing-2)',
  md: 'var(--ds-spacing-4)',
  lg: 'var(--ds-spacing-6)',
  xl: 'var(--ds-spacing-8)',
};

/**
 * Map gap token names to CSS variable values
 */
export const gapTokenMap: Record<GapSize, string> = {
  none: '0',
  xs: 'var(--ds-grid-gap-xs)',
  sm: 'var(--ds-grid-gap-sm)',
  md: 'var(--ds-grid-gap-md)',
  lg: 'var(--ds-grid-gap-lg)',
  xl: 'var(--ds-grid-gap-xl)',
};

/**
 * Map container size names to CSS variable values
 */
export const containerSizeMap: Record<ContainerSize, string> = {
  sm: 'var(--ds-size-container-sm)',
  md: 'var(--ds-size-container-md)',
  lg: 'var(--ds-size-container-lg)',
  max: 'var(--ds-size-container-max)',
  full: '100%',
};
