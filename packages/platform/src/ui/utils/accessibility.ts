/**
 * Accessibility Utilities
 *
 * Utilities for WCAG 2.1 AA compliance and keyboard navigation.
 *
 * @module @xalatechnologies/platform/ui/utils/accessibility
 */

// =============================================================================
// Focus Management
// =============================================================================

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  return Array.from(elements).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('inert')
  );
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function createFocusTrap(container: HTMLElement): {
  activate: () => void;
  deactivate: () => void;
} {
  let previousActiveElement: HTMLElement | null = null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return {
    activate: () => {
      previousActiveElement = document.activeElement as HTMLElement;
      container.addEventListener('keydown', handleKeyDown);

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      }
    },
    deactivate: () => {
      container.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    },
  };
}

// =============================================================================
// ARIA Live Announcements
// =============================================================================

let liveRegion: HTMLElement | null = null;

/**
 * Create or get the live region for screen reader announcements
 */
function getLiveRegion(): HTMLElement {
  if (liveRegion) return liveRegion;

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(liveRegion);
  return liveRegion;
}

/**
 * Announce a message to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const region = getLiveRegion();
  region.setAttribute('aria-live', priority);

  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Announce for assertive messages (interrupts)
 */
export function announceAssertive(message: string): void {
  announce(message, 'assertive');
}

// =============================================================================
// Keyboard Navigation Helpers
// =============================================================================

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/**
 * Handle arrow key navigation in a list of items
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
): number {
  const { orientation = 'vertical', loop = true } = options;
  const { key } = event;

  const isVertical = orientation === 'vertical' || orientation === 'both';
  const isHorizontal = orientation === 'horizontal' || orientation === 'both';

  let newIndex = currentIndex;

  if ((key === 'ArrowUp' && isVertical) || (key === 'ArrowLeft' && isHorizontal)) {
    event.preventDefault();
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = loop ? items.length - 1 : 0;
    }
  } else if ((key === 'ArrowDown' && isVertical) || (key === 'ArrowRight' && isHorizontal)) {
    event.preventDefault();
    newIndex = currentIndex + 1;
    if (newIndex >= items.length) {
      newIndex = loop ? 0 : items.length - 1;
    }
  } else if (key === 'Home') {
    event.preventDefault();
    newIndex = 0;
  } else if (key === 'End') {
    event.preventDefault();
    newIndex = items.length - 1;
  }

  if (newIndex !== currentIndex) {
    const targetItem = items[newIndex];
    if (targetItem) {
      targetItem.focus();
    }
  }

  return newIndex;
}

// =============================================================================
// Color Contrast Utilities
// =============================================================================

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(r: number, g: number, b: number): number {
  const values = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const rs = values[0] ?? 0;
  const gs = values[1] ?? 0;
  const bs = values[2] ?? 0;
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA requirements
 */
export function meetsContrastAA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA requirements
 */
export function meetsContrastAAA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

// =============================================================================
// Reduced Motion
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate animation duration based on user preferences
 */
export function getAnimationDuration(defaultMs: number): number {
  return prefersReducedMotion() ? 0 : defaultMs;
}

// =============================================================================
// Screen Reader Detection (Heuristic)
// =============================================================================

/**
 * Detect if a screen reader might be active (heuristic)
 */
export function mightHaveScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  const hasScreenReaderHints = 
    'speechSynthesis' in window ||
    document.querySelector('[role="application"]') !== null;
  
  const hasForcedColors = typeof window.matchMedia === 'function' 
    ? window.matchMedia('(forced-colors: active)').matches 
    : false;

  return hasScreenReaderHints || hasForcedColors;
}

// =============================================================================
// ID Generation for ARIA
// =============================================================================

let idCounter = 0;

/**
 * Generate unique IDs for ARIA attributes
 */
export function generateAriaId(prefix: string = 'ds'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

// =============================================================================
// Export utility hook for React
// =============================================================================

export const a11yUtils = {
  getFocusableElements,
  createFocusTrap,
  announce,
  announceAssertive,
  handleArrowNavigation,
  getLuminance,
  getContrastRatio,
  meetsContrastAA,
  meetsContrastAAA,
  prefersReducedMotion,
  getAnimationDuration,
  mightHaveScreenReader,
  generateAriaId,
};

export default a11yUtils;
