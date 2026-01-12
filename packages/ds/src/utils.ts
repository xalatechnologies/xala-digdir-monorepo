/**
 * Utility functions and design tokens for the design system
 */

/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// Design System Tokens - Enhanced spacing and styling
// =============================================================================

/**
 * Enhanced spacing values (use these for padding/margins where Digdir tokens are too small)
 * Digdir tokens should still be used for colors, typography, and border-radius
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
} as const;

/**
 * Interactive element backgrounds
 */
export const interactiveBackgrounds = {
  hover: 'rgba(0, 0, 0, 0.03)',
  active: 'rgba(0, 0, 0, 0.06)',
  selected: 'rgba(0, 0, 0, 0.03)',
  // For dark mode compatibility
  hoverDark: 'rgba(255, 255, 255, 0.05)',
  activeDark: 'rgba(255, 255, 255, 0.1)',
  selectedDark: 'rgba(255, 255, 255, 0.05)',
} as const;

/**
 * Badge/Tag styling presets
 */
export const badgeStyles = {
  meta: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: 'var(--ds-border-radius-full)',
  },
  shortcut: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: 'var(--ds-border-radius-sm)',
  },
  notification: {
    padding: '0 5px',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: 'var(--ds-border-radius-full)',
    minWidth: '18px',
    height: '18px',
  },
} as const;

/**
 * Dropdown/Menu item styling
 */
export const menuItemStyles = {
  padding: '12px 20px',
  gap: '16px',
  marginX: '8px',
  borderRadius: 'var(--ds-border-radius-md)',
  transition: 'all 0.1s ease',
} as const;

/**
 * Empty state styling
 */
export const emptyStateStyles = {
  padding: '48px 32px',
  gap: '16px',
} as const;

/**
 * Button text colors (overrides for proper contrast)
 */
export const buttonTextColors = {
  success: '#ffffff',
  accent: 'var(--ds-color-accent-contrast-default)',
  danger: '#ffffff',
  warning: 'var(--ds-color-warning-contrast-default)',
} as const;

/**
 * Logo text styling
 */
export const logoStyles = {
  title: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.2,
    opacity: 0.55,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  gap: '16px',
} as const;

// =============================================================================
// Brand Colors - DIGILIST
// =============================================================================

/**
 * Brand color palette
 * Use CSS custom properties: var(--brand-navy), var(--brand-blue), etc.
 */
export const brandColors = {
  navy: {
    hex: '#1F2F6E',
    oklch: 'oklch(0.28 0.09 264)',
    usage: 'Core trust color',
  },
  blue: {
    hex: '#2F55A4',
    oklch: 'oklch(0.45 0.12 262)',
    usage: 'Primary interaction',
  },
  aqua: {
    hex: '#9EDBE5',
    oklch: 'oklch(0.82 0.08 205)',
    usage: 'Availability/calm',
  },
  ice: {
    hex: '#D6F3F6',
    oklch: 'oklch(0.94 0.03 205)',
    usage: 'Surfaces/backgrounds',
  },
  green: {
    hex: '#8BC34A',
    oklch: 'oklch(0.72 0.14 130)',
    usage: 'Location/success',
  },
  white: {
    hex: '#FFFFFF',
    oklch: 'oklch(1.0 0 0)',
    usage: 'Contrast',
  },
  charcoal: {
    hex: '#0F172A',
    oklch: 'oklch(0.15 0.02 264)',
    usage: 'Text/dark UI',
  },
} as const;

/**
 * CSS custom properties for brand colors
 * Add to :root in your CSS
 */
export const brandColorsCss = `
:root {
  --brand-navy: #1F2F6E;
  --brand-blue: #2F55A4;
  --brand-aqua: #9EDBE5;
  --brand-ice: #D6F3F6;
  --brand-green: #8BC34A;
  --brand-white: #FFFFFF;
  --brand-charcoal: #0F172A;
}
` as const;
