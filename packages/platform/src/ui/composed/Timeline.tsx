/**
 * Timeline Component
 *
 * Activity feed and history timeline for audit logs, notifications, etc.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/Timeline
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type TimelineItemType = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: ReactNode;
  type?: TimelineItemType;
  actor?: { name: string; avatar?: string };
  metadata?: Record<string, string>;
  actions?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  loading?: boolean;
  emptyMessage?: string;
  showConnector?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Type Styles
// =============================================================================

const typeStyles: Record<TimelineItemType, { dot: string; border: string }> = {
  default: { dot: 'var(--ds-color-neutral-text-subtle)', border: 'var(--ds-color-neutral-border-default)' },
  success: { dot: 'var(--ds-color-success-base-default)', border: 'var(--ds-color-success-border-default)' },
  warning: { dot: 'var(--ds-color-warning-base-default)', border: 'var(--ds-color-warning-border-default)' },
  danger: { dot: 'var(--ds-color-danger-base-default)', border: 'var(--ds-color-danger-border-default)' },
  info: { dot: 'var(--ds-color-info-base-default)', border: 'var(--ds-color-info-border-default)' },
};

// =============================================================================
// Helpers
// =============================================================================

function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// =============================================================================
// TimelineEntry Component
// =============================================================================

interface TimelineEntryProps {
  item: TimelineItem;
  isLast: boolean;
  showConnector: boolean;
}

function TimelineEntry({ item, isLast, showConnector }: TimelineEntryProps): React.ReactElement {
  const styles = typeStyles[item.type || 'default'];

  return (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'var(--ds-sizing-8)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--ds-sizing-8)',
            height: 'var(--ds-sizing-8)',
            backgroundColor: item.icon ? styles.dot : 'var(--ds-color-neutral-background-default)',
            borderWidth: item.icon ? '0' : 'var(--ds-border-width-lg)',
            borderStyle: 'solid',
            borderColor: styles.border,
            borderRadius: 'var(--ds-border-radius-full)',
            color: item.icon ? 'white' : styles.dot,
            flexShrink: 0,
          }}
        >
          {item.icon || (
            <div
              style={{
                width: 'var(--ds-sizing-2)',
                height: 'var(--ds-sizing-2)',
                backgroundColor: styles.dot,
                borderRadius: 'var(--ds-border-radius-full)',
              }}
            />
          )}
        </div>
        {showConnector && !isLast && (
          <div
            style={{
              flex: 1,
              width: 'var(--ds-border-width-lg)',
              backgroundColor: 'var(--ds-color-neutral-border-subtle)',
              marginTop: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-2)',
              minHeight: 'var(--ds-spacing-4)',
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--ds-spacing-3)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
              {item.actor && (
                <>
                  {item.actor.avatar ? (
                    <img
                      src={item.actor.avatar}
                      alt={item.actor.name}
                      style={{
                        width: 'var(--ds-sizing-5)',
                        height: 'var(--ds-sizing-5)',
                        borderRadius: 'var(--ds-border-radius-full)',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 'var(--ds-sizing-5)',
                        height: 'var(--ds-sizing-5)',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-accent-surface-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--ds-font-size-xs)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                        color: 'var(--ds-color-accent-text-default)',
                      }}
                    >
                      {item.actor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}>
                    {item.actor.name}
                  </span>
                </>
              )}
              <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}>
                {item.title}
              </span>
            </div>
            {item.description && (
              <p style={{ margin: 'var(--ds-spacing-1) 0 0 0', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {item.description}
              </p>
            )}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                {Object.entries(item.metadata).map(([key, value]) => (
                  <span
                    key={key}
                    style={{
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-xs)',
                      backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', flexShrink: 0 }}>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
              {formatTimestamp(item.timestamp)}
            </span>
            {item.actions}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Timeline Component
// =============================================================================

export function Timeline({
  items,
  loading = false,
  emptyMessage = 'No activity yet',
  showConnector = true,
  className,
  style,
}: TimelineProps): React.ReactElement {
  if (loading) {
    return (
      <div className={className} style={style}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-5)' }}>
            <div
              style={{
                width: 'var(--ds-sizing-8)',
                height: 'var(--ds-sizing-8)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-full)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ height: 'var(--ds-sizing-4)', width: '60%', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-sm)', marginBottom: 'var(--ds-spacing-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 'var(--ds-sizing-3)', width: '40%', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-sm)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-8)',
          textAlign: 'center',
          color: 'var(--ds-color-neutral-text-subtle)',
          ...style,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {items.map((item, index) => (
        <TimelineEntry key={item.id} item={item} isLast={index === items.length - 1} showConnector={showConnector} />
      ))}
    </div>
  );
}

// =============================================================================
// CompactTimeline Component
// =============================================================================

export interface CompactTimelineProps {
  items: Array<{ id: string; label: string; timestamp: string | Date; type?: TimelineItemType }>;
  maxItems?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CompactTimeline({ items, maxItems = 5, className, style }: CompactTimelineProps): React.ReactElement {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', ...style }}>
      {displayItems.map((item) => {
        const styles = typeStyles[item.type || 'default'];
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <div style={{ width: 'var(--ds-sizing-2)', height: 'var(--ds-sizing-2)', backgroundColor: styles.dot, borderRadius: 'var(--ds-border-radius-full)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }}>
              {formatTimestamp(item.timestamp)}
            </span>
          </div>
        );
      })}
      {items.length > maxItems && (
        <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', paddingLeft: 'var(--ds-spacing-4)' }}>
          +{items.length - maxItems} more
        </span>
      )}
    </div>
  );
}

export default { Timeline, CompactTimeline };
