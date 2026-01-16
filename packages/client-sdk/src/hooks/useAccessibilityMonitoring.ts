/**
 * useAccessibilityMonitoring Hook
 *
 * React hook for monitoring accessibility metrics in production
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { getClient } from '../core/client-factory';
import {
  AccessibilityMonitoringService,
  detectScreenReader,
  type KeyboardNavigationMetric,
  type FocusManagementMetric,
} from '../services/accessibilityMonitoringService';

export interface UseAccessibilityMonitoringOptions {
  enabled?: boolean;
  trackKeyboardNav?: boolean;
  trackSkipLinks?: boolean;
  trackFocusManagement?: boolean;
  trackScreenReader?: boolean;
  trackPagePerformance?: boolean;
}

export interface AccessibilityMonitoringAPI {
  trackKeyboardNavigation: (action: KeyboardNavigationMetric['action'], element: string) => void;
  trackSkipLinkUsage: (target: string) => void;
  trackFocusIssue: (event: FocusManagementMetric['event'], element?: string) => void;
  isEnabled: boolean;
}

/**
 * Hook to enable accessibility monitoring in a React component
 */
export function useAccessibilityMonitoring(
  options: UseAccessibilityMonitoringOptions = {}
): AccessibilityMonitoringAPI {
  const {
    enabled = true,
    trackKeyboardNav = true,
    trackSkipLinks = true,
    trackFocusManagement = true,
    trackScreenReader = true,
    trackPagePerformance = true,
  } = options;

  // Use window.location.pathname instead of react-router's useLocation
  // This makes the hook work without react-router-dom dependency
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const serviceRef = useRef<AccessibilityMonitoringService | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const lastFocusedElementRef = useRef<Element | null>(null);

  // Track pathname changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleLocationChange);

    // For SPAs using pushState/replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Get client instance - NOTE: Currently unused but kept for future server-side reporting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _client = useMemo(() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  }, []);

  // Initialize service
  useEffect(() => {
    if (!enabled) return;

    serviceRef.current = new AccessibilityMonitoringService({
      enabled: true,
      sampleRate: 1.0,
    });

    return () => {
      // Flush metrics on unmount
      void serviceRef.current?.flush();
    };
  }, [enabled]);

  // Track screen reader detection on mount
  useEffect(() => {
    if (!enabled || !trackScreenReader || !serviceRef.current) return;

    const { detected, type } = detectScreenReader();
    serviceRef.current.trackScreenReaderDetection(
      detected,
      window.navigator.userAgent,
      type
    );
  }, [enabled, trackScreenReader]);

  // Track page load performance
  useEffect(() => {
    if (!enabled || !trackPagePerformance || !serviceRef.current) return;

    const loadTime = Date.now() - pageLoadTimeRef.current;
    serviceRef.current.trackPageLoadTime(pathname, loadTime);

    // Reset for next page
    pageLoadTimeRef.current = Date.now();
  }, [pathname, enabled, trackPagePerformance]);

  // Track keyboard navigation
  useEffect(() => {
    if (!enabled || !trackKeyboardNav || !serviceRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!serviceRef.current) return;

      const action = getKeyboardAction(event);
      if (!action) return;

      const element = getElementType(event.target as Element);
      serviceRef.current.trackKeyboardNavigation(action, element, pathname);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, trackKeyboardNav, pathname]);

  // Track focus management
  useEffect(() => {
    if (!enabled || !trackFocusManagement || !serviceRef.current) return;

    const handleFocusIn = (event: FocusEvent) => {
      lastFocusedElementRef.current = event.target as Element;
    };

    const handleFocusOut = (_event: FocusEvent) => {
      // Check if focus was lost to body or null (focus loss)
      setTimeout(() => {
        const newFocus = document.activeElement;
        if (!newFocus || newFocus === document.body) {
          serviceRef.current?.trackFocusManagement(
            'focus-lost',
            getElementType(lastFocusedElementRef.current),
            pathname
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
  }, [enabled, trackFocusManagement, pathname]);

  // Track keyboard traps (user pressing Tab many times without focus moving)
  useEffect(() => {
    if (!enabled || !trackFocusManagement || !serviceRef.current) return;

    let tabPressCount = 0;
    let lastFocusedElement: Element | null = null;
    let trapTimer: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        tabPressCount = 0;
        return;
      }

      const currentFocus = document.activeElement;

      if (currentFocus === lastFocusedElement) {
        tabPressCount++;

        if (tabPressCount >= 3) {
          // Likely a keyboard trap
          serviceRef.current?.trackFocusManagement(
            'focus-trapped',
            getElementType(currentFocus),
            pathname
          );
          tabPressCount = 0;
        }
      } else {
        tabPressCount = 0;
      }

      lastFocusedElement = currentFocus;

      // Reset counter after 2 seconds
      clearTimeout(trapTimer);
      trapTimer = setTimeout(() => {
        tabPressCount = 0;
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(trapTimer);
    };
  }, [enabled, trackFocusManagement, pathname]);

  // API methods
  const trackKeyboardNavigationManual = useCallback(
    (action: KeyboardNavigationMetric['action'], element: string) => {
      if (!enabled || !serviceRef.current) return;
      serviceRef.current.trackKeyboardNavigation(action, element, pathname);
    },
    [enabled, pathname]
  );

  const trackSkipLinkUsageManual = useCallback(
    (target: string) => {
      if (!enabled || !trackSkipLinks || !serviceRef.current) return;
      serviceRef.current.trackSkipLinkUsage(target, pathname);
    },
    [enabled, trackSkipLinks, pathname]
  );

  const trackFocusIssueManual = useCallback(
    (event: FocusManagementMetric['event'], element?: string) => {
      if (!enabled || !trackFocusManagement || !serviceRef.current) return;
      serviceRef.current.trackFocusManagement(event, element, pathname);
    },
    [enabled, trackFocusManagement, pathname]
  );

  return {
    trackKeyboardNavigation: trackKeyboardNavigationManual,
    trackSkipLinkUsage: trackSkipLinkUsageManual,
    trackFocusIssue: trackFocusIssueManual,
    isEnabled: enabled,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getKeyboardAction(event: KeyboardEvent): KeyboardNavigationMetric['action'] | null {
  switch (event.key) {
    case 'Tab':
      return event.shiftKey ? 'shift-tab' : 'tab';
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      return 'arrow-key';
    case 'Enter':
      return 'enter';
    case ' ':
      return 'space';
    case 'Escape':
      return 'escape';
    default:
      return null;
  }
}

function getElementType(element: Element | null): string {
  if (!element) return 'unknown';

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  if (role) return role;
  if (tagName === 'a') return 'link';
  if (tagName === 'button') return 'button';
  if (tagName === 'input') return `input-${(element as HTMLInputElement).type || 'text'}`;
  if (tagName === 'select') return 'select';
  if (tagName === 'textarea') return 'textarea';

  return tagName;
}
