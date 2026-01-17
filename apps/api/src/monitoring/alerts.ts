/**
 * Alert Manager
 * Monitors critical metrics and triggers alerts
 */
import { Injectable, Inject } from '../core/decorators';

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  timestamp: number;
  acknowledged?: boolean;
}

interface AlertRule {
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

@Injectable()
export class AlertManager {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];

  constructor(
    @Inject('Adapters') private readonly adapters: any
  ) {
    this.initializeRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeRules(): void {
    this.rules = [
      {
        name: 'high_error_rate',
        metric: 'http_request_errors',
        condition: 'gt',
        threshold: 50,
        severity: 'high',
        message: 'Error rate exceeded 50 requests/minute',
      },
      {
        name: 'slow_api_response',
        metric: 'http_request_duration_ms',
        condition: 'gt',
        threshold: 2000,
        severity: 'medium',
        message: 'API response time exceeded 2 seconds',
      },
      {
        name: 'slow_db_query',
        metric: 'db_query_duration_ms',
        condition: 'gt',
        threshold: 1000,
        severity: 'medium',
        message: 'Database query exceeded 1 second',
      },
      {
        name: 'high_booking_failures',
        metric: 'booking_create',
        condition: 'gt',
        threshold: 10,
        severity: 'high',
        message: 'Booking failure rate is high',
      },
    ];
  }

  /**
   * Evaluate a metric against alert rules
   */
  evaluateMetric(metricName: string, value: number): void {
    this.rules.forEach((rule) => {
      if (rule.metric === metricName) {
        const triggered = this.checkCondition(value, rule.condition, rule.threshold);

        if (triggered) {
          this.triggerAlert(rule, value);
        }
      }
    });
  }

  /**
   * Check if condition is met
   */
  private checkCondition(value: number, condition: 'gt' | 'lt' | 'eq', threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, currentValue: number): void {
    const alert: Alert = {
      id: this.generateId(),
      severity: rule.severity,
      title: rule.name,
      message: rule.message,
      metric: rule.metric,
      threshold: rule.threshold,
      currentValue,
      timestamp: Date.now(),
      acknowledged: false,
    };

    this.alerts.push(alert);

    // Log alert
    const logLevel = rule.severity === 'critical' ? 'error' : 'warn';
    this.adapters?.log?.[logLevel]('Alert triggered', {
      alertId: alert.id,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      currentValue,
      threshold: rule.threshold,
    });

    // Send notification (TODO: Implement notification service)
    this.sendNotification(alert);
  }

  /**
   * Send alert notification
   */
  private sendNotification(alert: Alert): void {
    // TODO: Integrate with notification service (email, Slack, PagerDuty, etc.)
    this.adapters?.log?.info('Alert notification sent', {
      alertId: alert.id,
      severity: alert.severity,
    });
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.adapters?.log?.info('Alert acknowledged', { alertId });
    }
  }

  /**
   * Clear old acknowledged alerts (older than 24 hours)
   */
  clearOldAlerts(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const before = this.alerts.length;

    this.alerts = this.alerts.filter(
      (alert) => !alert.acknowledged || alert.timestamp > oneDayAgo
    );

    const cleared = before - this.alerts.length;
    if (cleared > 0) {
      this.adapters?.log?.info('Old alerts cleared', { count: cleared });
    }

    return cleared;
  }

  /**
   * Add custom alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
    this.adapters?.log?.info('Alert rule added', { name: rule.name });
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): any {
    const stats = {
      total: this.alerts.length,
      active: this.alerts.filter((a) => !a.acknowledged).length,
      bySeverity: {
        low: this.alerts.filter((a) => a.severity === 'low').length,
        medium: this.alerts.filter((a) => a.severity === 'medium').length,
        high: this.alerts.filter((a) => a.severity === 'high').length,
        critical: this.alerts.filter((a) => a.severity === 'critical').length,
      },
    };

    return stats;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
