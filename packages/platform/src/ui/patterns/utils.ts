/**
 * Utility functions for Platform UI Patterns
 */

/**
 * Concatenate class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * CSS spacing values matching design system tokens
 */
export const spacingValues = {
  sm: 'var(--ds-spacing-3, 12px)',
  md: 'var(--ds-spacing-4, 16px)',
  lg: 'var(--ds-spacing-6, 24px)',
} as const;

/**
 * Get CSS gap value from spacing size
 */
export function getGapValue(gap: 'sm' | 'md' | 'lg' = 'md'): string {
  return spacingValues[gap];
}
