/**
 * Audit Provider Adapter
 *
 * Interface and implementation for audit logging.
 * All user actions (favorites, share, booking, contact) must be logged.
 */

import type { AuditEvent, AuditEventType } from '../types';

// =============================================================================
// Adapter Interface
// =============================================================================

export interface AuditProvider {
  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'timestamp' | 'correlationId'>): Promise<void>;

  /**
   * Generate a correlation ID for tracking related events
   */
  generateCorrelationId(): string;
}

// =============================================================================
// Default Implementation
// =============================================================================

/**
 * Generate a UUID v4 for correlation tracking
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Console-based audit provider for development
 * Replace with actual API calls in production
 */
class ConsoleAuditProvider implements AuditProvider {
  async log(event: Omit<AuditEvent, 'timestamp' | 'correlationId'>): Promise<void> {
    const fullEvent: AuditEvent = {
      ...event,
      correlationId: this.generateCorrelationId(),
      timestamp: new Date().toISOString(),
    };

    // In development, log to console
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', fullEvent.type, fullEvent);
    }

    // In production, send to audit API
    // await fetch('/api/audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(fullEvent),
    // });
  }

  generateCorrelationId(): string {
    return generateUUID();
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let auditProviderInstance: AuditProvider | null = null;

export function getAuditProvider(): AuditProvider {
  if (!auditProviderInstance) {
    auditProviderInstance = new ConsoleAuditProvider();
  }
  return auditProviderInstance;
}

export function setAuditProvider(provider: AuditProvider): void {
  auditProviderInstance = provider;
}

// =============================================================================
// Convenience Functions
// =============================================================================

export async function logAuditEvent(
  type: AuditEventType,
  tenantId: string,
  listingId: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const provider = getAuditProvider();
  const event: Omit<AuditEvent, 'timestamp' | 'correlationId'> = {
    type,
    tenantId,
    listingId,
  };
  if (userId) {
    event.userId = userId;
  }
  if (metadata) {
    event.metadata = metadata;
  }
  await provider.log(event);
}

export { generateUUID };
