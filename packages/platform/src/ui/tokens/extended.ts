/**
 * Extended Design Tokens
 *
 * Custom tokens that extend the Designsystemet base tokens.
 * All custom values must be defined here - no raw CSS values in components.
 *
 * @module @xalatechnologies/platform/ui/tokens/extended
 */

// =============================================================================
// Avatar Color Palette
// =============================================================================

/**
 * Extended color palette for avatars when Digdir tokens are exhausted.
 * These complement the base accent/info/success/warning colors.
 */
export const avatarColors = {
  purple: 'var(--ds-extended-avatar-purple, #8B5CF6)',
  pink: 'var(--ds-extended-avatar-pink, #EC4899)',
  teal: 'var(--ds-extended-avatar-teal, #14B8A6)',
  orange: 'var(--ds-extended-avatar-orange, #F97316)',
  indigo: 'var(--ds-extended-avatar-indigo, #6366F1)',
  cyan: 'var(--ds-extended-avatar-cyan, #06B6D4)',
  rose: 'var(--ds-extended-avatar-rose, #F43F5E)',
  emerald: 'var(--ds-extended-avatar-emerald, #10B981)',
} as const;

/**
 * All avatar colors including Digdir base tokens
 */
export const AVATAR_COLOR_PALETTE = [
  'var(--ds-color-accent-base-default)',
  'var(--ds-color-info-base-default)',
  'var(--ds-color-success-base-default)',
  'var(--ds-color-warning-base-default)',
  avatarColors.purple,
  avatarColors.pink,
  avatarColors.teal,
  avatarColors.orange,
] as const;

// =============================================================================
// Size Tokens
// =============================================================================

/**
 * Standard component sizes using Digdir spacing tokens
 */
export const sizes = {
  avatar: {
    xs: 'var(--ds-sizing-6)',   // 24px
    sm: 'var(--ds-sizing-8)',   // 32px
    md: 'var(--ds-sizing-10)',  // 40px
    lg: 'var(--ds-sizing-14)',  // 56px
    xl: 'var(--ds-sizing-20)',  // 80px
  },
  icon: {
    xs: 'var(--ds-sizing-3)',   // 12px
    sm: 'var(--ds-sizing-4)',   // 16px
    md: 'var(--ds-sizing-5)',   // 20px
    lg: 'var(--ds-sizing-6)',   // 24px
    xl: 'var(--ds-sizing-8)',   // 32px
  },
  statusIndicator: {
    xs: 'var(--ds-sizing-2)',   // 8px
    sm: 'var(--ds-sizing-2-5)', // 10px
    md: 'var(--ds-sizing-3)',   // 12px
    lg: 'var(--ds-sizing-3-5)', // 14px
    xl: 'var(--ds-sizing-4)',   // 16px
  },
  touchTarget: {
    minimum: 'var(--ds-sizing-11)', // 44px - WCAG minimum
  },
} as const;

// =============================================================================
// Animation Tokens
// =============================================================================

export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    default: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// =============================================================================
// Z-Index Tokens
// =============================================================================

export const zIndex = {
  dropdown: 'var(--ds-z-index-dropdown, 1000)',
  sticky: 'var(--ds-z-index-sticky, 1020)',
  fixed: 'var(--ds-z-index-fixed, 1030)',
  modalBackdrop: 'var(--ds-z-index-modal-backdrop, 1040)',
  modal: 'var(--ds-z-index-modal, 1050)',
  popover: 'var(--ds-z-index-popover, 1060)',
  tooltip: 'var(--ds-z-index-tooltip, 1070)',
  toast: 'var(--ds-z-index-toast, 1080)',
  skipLink: 'var(--ds-z-index-skip-link, 9999)',
} as const;

// =============================================================================
// Shadow Tokens (extending Digdir)
// =============================================================================

export const shadows = {
  none: 'none',
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
  xl: 'var(--ds-shadow-xl)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: 'var(--ds-shadow-focus)',
} as const;

// =============================================================================
// Export all tokens
// =============================================================================

export const extendedTokens = {
  avatarColors,
  AVATAR_COLOR_PALETTE,
  sizes,
  animation,
  zIndex,
  shadows,
} as const;

export default extendedTokens;
