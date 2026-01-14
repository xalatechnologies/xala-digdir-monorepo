/**
 * Accessibility Monitoring Hooks
 * React hooks for tracking accessibility metrics throughout the application
 */

import { useEffect, useMemo, useState } from 'react';
import {
  accessibilityMonitoringService,
  detectScreenReader,
  type AccessibilityMonitoringConfig,
  type KeyboardNavigationMetric,
  type FocusManagementMetric,
  type AriaAnnouncementMetric,
} from '../services/accessibilityMonitoringService';

// ============================================================================
// Types
// ============================================================================

export interface UseAccessibilityMonitoringOptions {
  enabled?: boolean;
  trackKeyboardNav?: boolean;
  trackSkipLinks?: boolean;
  trackFocusManagement?: boolean;
  trackScreenReader?: boolean;
  trackPagePerformance?: boolean;
  config?: Partial<AccessibilityMonitoringConfig>;
}

export interface AccessibilityMonitoringAPI {
  trackKeyboardNavigation: (
    action: KeyboardNavigationMetric['action'],
    element: string,
    page: string
  ) => void;
  trackSkipLinkUsage: (target: string, page?: string) => void;
  trackScreenReaderDetection: (detected: boolean, userAgent: string, screenReader?: string) => void;
  trackFocusManagement: (
    event: FocusManagementMetric['event'],
    element: string | undefined,
    page: string
  ) => void;
  trackAriaAnnouncement: (
    type: AriaAnnouncementMetric['type'],
    message: string,
    success: boolean
  ) => void;
  trackPageLoadTime: (page: string, loadTime: number) => void;
  flush: () => Promise<void>;
  enable: () => void;
  disable: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for accessibility monitoring
 *
 * Provides methods to track accessibility metrics throughout the application.
 * Automatically manages service lifecycle and event listeners.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const monitoring = useAccessibilityMonitoring({
 *     enabled: true,
 *     trackKeyboardNav: true,
 *     trackSkipLinks: true,
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAccessibilityMonitoring(
  options: UseAccessibilityMonitoringOptions = {}
): AccessibilityMonitoringAPI {
  const {
    enabled = true,
    trackKeyboardNav = false,
    // trackSkipLinks = false,
    trackFocusManagement = false,
    trackScreenReader = false,
    trackPagePerformance = false,
    config,
  } = options;

  // Configure service on mount or when config changes
  useEffect(() => {
    if (config) {
      accessibilityMonitoringService.configure({ ...config, enabled });
    } else if (enabled) {
      accessibilityMonitoringService.enable();
    } else {
      accessibilityMonitoringService.disable();
    }

    return () => {
      // Flush any remaining metrics on unmount
      void accessibilityMonitoringService.flush();
    };
  }, [enabled, config]);

  // Track keyboard navigation
  useEffect(() => {
    if (!trackKeyboardNav || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const element = (event.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown';
      const page = window.location.pathname;

      let action: KeyboardNavigationMetric['action'] = 'tab';

      if (event.key === 'Tab') {
        action = event.shiftKey ? 'shift-tab' : 'tab';
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        action = 'arrow-key';
      } else if (event.key === 'Enter') {
        action = 'enter';
      } else if (event.key === ' ' || event.key === 'Space') {
        action = 'space';
      } else if (event.key === 'Escape') {
        action = 'escape';
      } else {
        return; // Don't track other keys
      }

      accessibilityMonitoringService.trackKeyboardNavigation(action, element, page);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackKeyboardNav, enabled]);

  // Track screen reader detection on mount
  useEffect(() => {
    if (!trackScreenReader || !enabled) return;

    const detection = detectScreenReader();
    accessibilityMonitoringService.trackScreenReaderDetection(
      detection.detected,
      navigator.userAgent,
      detection.type
    );
  }, [trackScreenReader, enabled]);

  // Track focus management
  useEffect(() => {
    if (!trackFocusManagement || !enabled) return;

    let lastFocusedElement: HTMLElement | null = null;

    const handleFocusIn = (event: FocusEvent) => {
      lastFocusedElement = event.target as HTMLElement;
    };

    const handleFocusOut = (_event: FocusEvent) => {
      // Check if focus was lost (not moving to another element)
      setTimeout(() => {
        if (document.activeElement === document.body) {
          accessibilityMonitoringService.trackFocusManagement(
            'focus-lost',
            lastFocusedElement?.tagName?.toLowerCase(),
            window.location.pathname
          );
        }
      }, 0);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, [trackFocusManagement, enabled]);

  // Track page performance
  useEffect(() => {
    if (!trackPagePerformance || !enabled) return;

    // Track initial page load
    if (typeof window !== 'undefined' && window.performance) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        accessibilityMonitoringService.trackPageLoadTime(window.location.pathname, loadTime);
      }
    }
  }, [trackPagePerformance, enabled]);

  // Create stable API object
  const api = useMemo<AccessibilityMonitoringAPI>(
    () => ({
      trackKeyboardNavigation: (action, element, page) => {
        accessibilityMonitoringService.trackKeyboardNavigation(action, element, page);
      },
      trackSkipLinkUsage: (target, page = window.location.pathname) => {
        accessibilityMonitoringService.trackSkipLinkUsage(target, page);
      },
      trackScreenReaderDetection: (detected, userAgent, screenReader) => {
        accessibilityMonitoringService.trackScreenReaderDetection(detected, userAgent, screenReader);
      },
      trackFocusManagement: (event, element, page) => {
        accessibilityMonitoringService.trackFocusManagement(event, element, page);
      },
      trackAriaAnnouncement: (type, message, success) => {
        accessibilityMonitoringService.trackAriaAnnouncement(type, message, success);
      },
      trackPageLoadTime: (page, loadTime) => {
        accessibilityMonitoringService.trackPageLoadTime(page, loadTime);
      },
      flush: () => accessibilityMonitoringService.flush(),
      enable: () => accessibilityMonitoringService.enable(),
      disable: () => accessibilityMonitoringService.disable(),
    }),
    []
  );

  return api;
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to detect if user is using a screen reader
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const screenReader = useScreenReaderDetection();
 *
 *   if (screenReader.detected) {
 *     return <div aria-live="polite">Using {screenReader.type}</div>;
 *   }
 * }
 * ```
 */
export function useScreenReaderDetection() {
  return useMemo(() => detectScreenReader(), []);
}

/**
 * Hook to detect if user is navigating with keyboard
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isKeyboardNav = useKeyboardNavigationDetection();
 *
 *   return (
 *     <button className={isKeyboardNav ? 'keyboard-focus' : ''}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useKeyboardNavigationDetection() {
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => {
      setIsKeyboardNav(true);
    };

    const handleMouseDown = () => {
      setIsKeyboardNav(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardNav;
}

// Re-export types
export type {
  AccessibilityMonitoringConfig,
  AccessibilityMetric,
  AccessibilityMetricType,
  AccessibilityReport,
  KeyboardNavigationMetric,
  SkipLinkUsageMetric,
  ScreenReaderDetectionMetric,
  FocusManagementMetric,
  AriaAnnouncementMetric,
} from '../services/accessibilityMonitoringService';
