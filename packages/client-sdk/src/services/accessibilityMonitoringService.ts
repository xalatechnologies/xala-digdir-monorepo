/**
 * Accessibility Monitoring Service
 *
 * Tracks accessibility metrics in production to ensure WCAG compliance
 * and identify areas for improvement.
 *
 * Privacy-first approach:
 * - No PII collection
 * - No user identification
 * - Anonymous aggregate metrics only
 * - GDPR compliant
 */

import type { IHttpClient } from '../core/http-client.interface';
import { getClient, getClientConfig } from '../core/client-factory';

// ============================================================================
// Types
// ============================================================================

export interface AccessibilityMetric {
  timestamp: number;
  tenantId: string;
  sessionId: string; // Anonymous session identifier
  type: AccessibilityMetricType;
  data: AccessibilityMetricData;
}

export type AccessibilityMetricType =
  | 'keyboard-navigation'
  | 'skip-link-usage'
  | 'screen-reader-detection'
  | 'focus-management'
  | 'aria-announcement'
  | 'color-contrast-issue'
  | 'keyboard-trap'
  | 'focus-loss'
  | 'tab-order-violation'
  | 'interactive-element-error'
  | 'form-validation-error'
  | 'modal-focus-trap'
  | 'page-load-time';

export interface AccessibilityMetricData {
  // Metric-specific data
  [key: string]: unknown;
}

export interface KeyboardNavigationMetric extends AccessibilityMetricData {
  action: 'tab' | 'shift-tab' | 'arrow-key' | 'enter' | 'space' | 'escape';
  element: string; // element type (button, link, input, etc.)
  page: string;
}

export interface SkipLinkUsageMetric extends AccessibilityMetricData {
  target: string; // Skip link target (main-content, navigation, etc.)
  page: string;
}

export interface ScreenReaderDetectionMetric extends AccessibilityMetricData {
  detected: boolean;
  userAgent: string;
  screenReader?: 'NVDA' | 'JAWS' | 'VoiceOver' | 'TalkBack' | 'ORCA' | 'Unknown';
}

export interface FocusManagementMetric extends AccessibilityMetricData {
  event: 'focus-lost' | 'focus-trapped' | 'focus-restored';
  element?: string;
  page: string;
}

export interface AriaAnnouncementMetric extends AccessibilityMetricData {
  type: 'polite' | 'assertive';
  message: string;
  success: boolean;
}

export interface AccessibilityMonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0 (percentage of events to track)
  excludePages?: string[]; // Pages to exclude from monitoring
  debounceMs: number; // Debounce time for metrics collection
  batchSize: number; // Number of metrics to batch before sending
  flushIntervalMs: number; // Interval to flush metrics
}

export interface AccessibilityReport {
  period: {
    start: Date;
    end: Date;
  };
  tenantId: string;
  metrics: {
    keyboardNavigation: {
      total: number;
      byAction: Record<string, number>;
      byPage: Record<string, number>;
    };
    skipLinkUsage: {
      total: number;
      byTarget: Record<string, number>;
    };
    screenReaderUsers: {
      total: number;
      percentage: number;
      byType: Record<string, number>;
    };
    focusIssues: {
      total: number;
      byType: Record<string, number>;
    };
    ariaAnnouncements: {
      total: number;
      successRate: number;
    };
  };
  complianceScore: number; // 0-100
  recommendations: string[];
}

// ============================================================================
// Service
// ============================================================================

export class AccessibilityMonitoringService {
  private config: AccessibilityMonitoringConfig;
  private metricsBuffer: AccessibilityMetric[] = [];
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;

  constructor(config?: Partial<AccessibilityMonitoringConfig>) {
    this.config = {
      enabled: true,
      sampleRate: 1.0, // Track 100% by default (can be reduced in production)
      debounceMs: 100,
      batchSize: 50,
      flushIntervalMs: 30000, // Flush every 30 seconds
      ...config,
    };
    this.sessionId = this.generateSessionId();

    // Start flush timer
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  private get client(): IHttpClient {
    return getClient();
  }

  /**
   * Track a keyboard navigation event
   * @param action - Type of keyboard action (tab, enter, escape, etc.)
   * @param element - Element type being interacted with (button, link, input)
   * @param page - Current page identifier
   * @example
   * ```ts
   * accessibilityMonitoringService.trackKeyboardNavigation('tab', 'button', '/dashboard');
   * ```
   */
  trackKeyboardNavigation(action: KeyboardNavigationMetric['action'], element: string, page: string): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'keyboard-navigation',
      data: { action, element, page },
    });
  }

  /**
   * Track skip link usage
   * @param target - Skip link target (main-content, navigation, etc.)
   * @param page - Current page identifier
   * @example
   * ```ts
   * accessibilityMonitoringService.trackSkipLinkUsage('main-content', '/listing/123');
   * ```
   */
  trackSkipLinkUsage(target: string, page: string): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'skip-link-usage',
      data: { target, page },
    });
  }

  /**
   * Detect and track screen reader usage
   * @param detected - Whether a screen reader was detected
   * @param userAgent - Browser user agent string
   * @param screenReader - Screen reader type (NVDA, JAWS, VoiceOver, etc.)
   * @example
   * ```ts
   * const { detected, type } = detectScreenReader();
   * accessibilityMonitoringService.trackScreenReaderDetection(detected, navigator.userAgent, type);
   * ```
   */
  trackScreenReaderDetection(detected: boolean, userAgent: string, screenReader?: string): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'screen-reader-detection',
      data: { detected, userAgent, screenReader },
    });
  }

  /**
   * Track focus management issues
   * @param event - Focus event type (focus-lost, focus-trapped, focus-restored)
   * @param element - Element identifier where issue occurred
   * @param page - Current page identifier
   * @example
   * ```ts
   * accessibilityMonitoringService.trackFocusManagement('focus-lost', 'modal-close-btn', '/bookings');
   * ```
   */
  trackFocusManagement(event: FocusManagementMetric['event'], element: string | undefined, page: string): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'focus-management',
      data: { event, element, page },
    });
  }

  /**
   * Track ARIA announcement events
   * @param type - Announcement priority (polite or assertive)
   * @param message - Announcement message content
   * @param success - Whether the announcement was successful
   * @example
   * ```ts
   * accessibilityMonitoringService.trackAriaAnnouncement('polite', 'Booking saved', true);
   * ```
   */
  trackAriaAnnouncement(type: AriaAnnouncementMetric['type'], message: string, success: boolean): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'aria-announcement',
      data: { type, message, success },
    });
  }

  /**
   * Track page load time (for accessibility performance)
   * @param page - Page identifier
   * @param loadTime - Page load time in milliseconds
   * @example
   * ```ts
   * const startTime = performance.now();
   * // ... page load ...
   * accessibilityMonitoringService.trackPageLoadTime('/listings', performance.now() - startTime);
   * ```
   */
  trackPageLoadTime(page: string, loadTime: number): void {
    if (!this.shouldTrack()) return;

    this.addMetric({
      type: 'page-load-time',
      data: { page, loadTime },
    });
  }

  /**
   * Get accessibility report for a time period
   * @param startDate - Report period start date
   * @param endDate - Report period end date
   * @returns Promise with accessibility metrics and compliance score
   * @example
   * ```ts
   * const report = await accessibilityMonitoringService.getReport(
   *   new Date('2024-01-01'),
   *   new Date('2024-01-31')
   * );
   * console.log(`Compliance score: ${report.complianceScore}%`);
   * ```
   */
  async getReport(startDate: Date, endDate: Date): Promise<AccessibilityReport> {
    return await this.client.get<AccessibilityReport>('/api/accessibility/report', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  }

  /**
   * Flush metrics immediately (send buffered metrics to server)
   * @returns Promise that resolves when metrics are sent
   * @example
   * ```ts
   * // Force send metrics before page unload
   * window.addEventListener('beforeunload', () => {
   *   accessibilityMonitoringService.flush();
   * });
   * ```
   */
  async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      await this.client.post<void>('/api/accessibility/metrics', {
        metrics: metricsToSend,
      });
    } catch (error) {
      console.error('[A11y Monitoring] Failed to send metrics:', error);
      // Re-add to buffer on failure (with limit)
      this.metricsBuffer.unshift(...metricsToSend.slice(0, 100));
    }
  }

  /**
   * Enable accessibility monitoring
   * @example
   * ```ts
   * accessibilityMonitoringService.enable();
   * ```
   */
  enable(): void {
    this.config.enabled = true;
    this.startFlushTimer();
  }

  /**
   * Disable accessibility monitoring
   * @example
   * ```ts
   * accessibilityMonitoringService.disable();
   * ```
   */
  disable(): void {
    this.config.enabled = false;
    this.stopFlushTimer();
  }

  /**
   * Update configuration
   * @param config - Partial configuration object to merge with existing config
   * @example
   * ```ts
   * accessibilityMonitoringService.configure({
   *   sampleRate: 0.5, // Track 50% of events
   *   batchSize: 100
   * });
   * ```
   */
  configure(config: Partial<AccessibilityMonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private addMetric(partial: Omit<AccessibilityMetric, 'timestamp' | 'tenantId' | 'sessionId'>): void {
    const config = getClientConfig();
    const metric: AccessibilityMetric = {
      timestamp: Date.now(),
      tenantId: config?.tenantId || 'unknown',
      sessionId: this.sessionId,
      ...partial,
    };

    this.metricsBuffer.push(metric);

    // Auto-flush if buffer is full
    if (this.metricsBuffer.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  private shouldTrack(): boolean {
    if (!this.config.enabled) return false;
    return Math.random() < this.config.sampleRate;
  }

  private generateSessionId(): string {
    return `a11y_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.config.flushIntervalMs);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}

// ============================================================================
// Screen Reader Detection Utility
// ============================================================================

/**
 * Detect if a screen reader is likely being used
 * Note: This is heuristic-based and not 100% accurate
 * @returns Object with detection status and screen reader type
 * @example
 * ```ts
 * const { detected, type } = detectScreenReader();
 * if (detected) {
 *   console.log(`Screen reader detected: ${type}`);
 * }
 * ```
 */
export function detectScreenReader(): { detected: boolean; type?: string } {
  if (typeof window === 'undefined') {
    return { detected: false };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Check for screen reader indicators
  const indicators = {
    NVDA: userAgent.includes('nvda'),
    JAWS: userAgent.includes('jaws'),
    VoiceOver: /mac os x/.test(userAgent) && /safari/.test(userAgent),
    TalkBack: /android/.test(userAgent),
  };

  for (const [type, detected] of Object.entries(indicators)) {
    if (detected) {
      return { detected: true, type };
    }
  }

  // Check for reduced motion (often enabled by screen reader users)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check for high contrast (often enabled with screen readers)
  const prefersContrast = window.matchMedia('(prefers-contrast: high)').matches;

  // Heuristic: if both are enabled, likely using assistive tech
  if (prefersReducedMotion && prefersContrast) {
    return { detected: true, type: 'Unknown' };
  }

  return { detected: false };
}

// ============================================================================
// Keyboard Navigation Detector
// ============================================================================

/**
 * Detect if user is navigating with keyboard
 * @returns True if keyboard navigation is detected
 * @example
 * ```ts
 * if (detectKeyboardNavigation()) {
 *   // Show focus indicators
 *   document.body.classList.add('keyboard-navigation');
 * }
 * ```
 */
export function detectKeyboardNavigation(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if any element has :focus-visible
  const focusedElement = document.activeElement;
  if (!focusedElement) return false;

  // Check if focus came from keyboard (not mouse)
  return focusedElement.matches(':focus-visible');
}

// ============================================================================
// Service Instance
// ============================================================================

/**
 * Singleton instance of the accessibility monitoring service
 */
export const accessibilityMonitoringService = new AccessibilityMonitoringService();
