/**
 * MetadataRow Component
 *
 * Displays key-value metadata items in a horizontal row with optional icons.
 * Domain-agnostic - receives all data via props.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MetadataRow
 *   items={[
 *     { id: '1', label: 'Capacity', value: '25 people', icon: <UsersIcon /> },
 *     { id: '2', label: 'Area', value: '120 m²', icon: <AreaIcon /> },
 *     { id: '3', label: 'Duration', value: '2 hours', icon: <ClockIcon /> },
 *   ]}
 * />
 *
 * // With custom separator
 * <MetadataRow
 *   items={items}
 *   separator={<span style={{ color: 'gray' }}>|</span>}
 *   size="lg"
 * />
 *
 * // Compact variant with dot separator
 * <MetadataRow
 *   items={items}
 *   separator="•"
 *   size="sm"
 * />
 * ```
 */

import * as React from 'react';
import type { ReactNode } from 'react';
import type { MetadataItem } from './types';

// =============================================================================
// Types
// =============================================================================

export interface MetadataRowProps {
  /** Array of metadata items to display */
  items: MetadataItem[];
  /** Separator between items (string or ReactNode) */
  separator?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Whether to show labels alongside values */
  showLabels?: boolean;
  /** Maximum items to display before overflow */
  maxVisible?: number;
  /** Text for overflow indicator */
  overflowText?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Merge class names
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// Default Separator
// =============================================================================

function DefaultSeparator({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: 'var(--ds-color-neutral-border-default)',
        flexShrink: 0,
      }}
    />
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * MetadataRow component
 *
 * Displays a horizontal row of key-value metadata items with icons and separators.
 * Ideal for displaying resource attributes, statistics, or summary information.
 */
export function MetadataRow({
  items,
  separator,
  size = 'md',
  className,
  style,
  showLabels = false,
  maxVisible,
  overflowText = '+{count} more',
}: MetadataRowProps): React.ReactElement | null {
  if (!items || items.length === 0) {
    return null;
  }

  // Calculate visible items
  const visibleItems = maxVisible ? items.slice(0, maxVisible) : items;
  const hiddenCount = maxVisible ? Math.max(0, items.length - maxVisible) : 0;

  // Size-based styles
  const sizeStyles = {
    sm: {
      fontSize: 'var(--ds-font-size-xs)',
      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
      gap: 'var(--ds-spacing-2)',
      itemGap: 'var(--ds-spacing-1)',
      iconSize: 12,
    },
    md: {
      fontSize: 'var(--ds-font-size-sm)',
      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
      gap: 'var(--ds-spacing-3)',
      itemGap: 'var(--ds-spacing-2)',
      iconSize: 14,
    },
    lg: {
      fontSize: 'var(--ds-font-size-md)',
      padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
      gap: 'var(--ds-spacing-4)',
      itemGap: 'var(--ds-spacing-2)',
      iconSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  // Render separator
  const renderSeparator = (index: number) => {
    if (index === visibleItems.length - 1 && hiddenCount === 0) {
      return null;
    }

    if (separator !== undefined) {
      if (typeof separator === 'string') {
        return (
          <span
            aria-hidden="true"
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              flexShrink: 0,
            }}
          >
            {separator}
          </span>
        );
      }
      return <>{separator}</>;
    }

    return <DefaultSeparator size={size} />;
  };

  // Format overflow text
  const formattedOverflowText = overflowText.replace('{count}', String(hiddenCount));

  return (
    <div
      className={cn('platform-metadata-row', className)}
      role="list"
      aria-label="Metadata"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: currentSize.gap,
        ...style,
      }}
    >
      {visibleItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <div
            role="listitem"
            className="platform-metadata-item"
            title={`${item.label}: ${item.value}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: currentSize.itemGap,
              padding: currentSize.padding,
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-full)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              fontSize: currentSize.fontSize,
              fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
              color: 'var(--ds-color-neutral-text-default)',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Icon */}
            {item.icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
            )}

            {/* Label (optional) */}
            {showLabels && (
              <span
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {item.label}:
              </span>
            )}

            {/* Value */}
            <span>{item.value}</span>
          </div>

          {/* Separator */}
          {renderSeparator(index)}
        </React.Fragment>
      ))}

      {/* Overflow indicator */}
      {hiddenCount > 0 && (
        <div
          role="listitem"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: currentSize.padding,
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-full)',
            fontSize: currentSize.fontSize,
            color: 'var(--ds-color-neutral-text-subtle)',
            whiteSpace: 'nowrap',
          }}
        >
          {formattedOverflowText}
        </div>
      )}
    </div>
  );
}

/**
 * MetadataRowInline component
 *
 * A more compact variant that displays items inline without chips/badges.
 * Suitable for inline text contexts.
 */
export function MetadataRowInline({
  items,
  separator = '•',
  size = 'md',
  className,
  style,
  showLabels = false,
  maxVisible,
  overflowText = '+{count}',
}: MetadataRowProps): React.ReactElement | null {
  if (!items || items.length === 0) {
    return null;
  }

  // Calculate visible items
  const visibleItems = maxVisible ? items.slice(0, maxVisible) : items;
  const hiddenCount = maxVisible ? Math.max(0, items.length - maxVisible) : 0;

  // Size-based styles
  const sizeStyles = {
    sm: {
      fontSize: 'var(--ds-font-size-xs)',
      gap: 'var(--ds-spacing-2)',
      iconSize: 12,
    },
    md: {
      fontSize: 'var(--ds-font-size-sm)',
      gap: 'var(--ds-spacing-3)',
      iconSize: 14,
    },
    lg: {
      fontSize: 'var(--ds-font-size-md)',
      gap: 'var(--ds-spacing-4)',
      iconSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  // Format overflow text
  const formattedOverflowText = overflowText.replace('{count}', String(hiddenCount));

  return (
    <div
      className={cn('platform-metadata-row-inline', className)}
      role="list"
      aria-label="Metadata"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: currentSize.gap,
        fontSize: currentSize.fontSize,
        color: 'var(--ds-color-neutral-text-default)',
        ...style,
      }}
    >
      {visibleItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <span
            role="listitem"
            className="platform-metadata-item-inline"
            title={`${item.label}: ${item.value}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            {/* Icon */}
            {item.icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {item.icon}
              </span>
            )}

            {/* Label (optional) */}
            {showLabels && (
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {item.label}:
              </span>
            )}

            {/* Value */}
            <span style={{ fontWeight: 'var(--ds-font-weight-medium)' as unknown as number }}>
              {item.value}
            </span>
          </span>

          {/* Separator */}
          {(index < visibleItems.length - 1 || hiddenCount > 0) && (
            <span
              aria-hidden="true"
              style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}

      {/* Overflow indicator */}
      {hiddenCount > 0 && (
        <span
          role="listitem"
          style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          {formattedOverflowText}
        </span>
      )}
    </div>
  );
}

export default MetadataRow;
