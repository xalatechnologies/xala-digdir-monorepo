/**
 * FeatureChips Component
 *
 * Displays a list of feature/attribute chips with optional icons.
 * Domain-agnostic - receives all data via props.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FeatureChips
 *   features={[
 *     { id: '1', label: 'WiFi', icon: <WifiIcon />, available: true },
 *     { id: '2', label: 'Parking', icon: <CarIcon />, available: false },
 *   ]}
 * />
 *
 * // With layout and size options
 * <FeatureChips
 *   features={features}
 *   layout="vertical"
 *   size="lg"
 *   showUnavailable={true}
 * />
 *
 * // With custom labels (for i18n)
 * import { useT } from '@xalatechnologies/platform/i18n';
 *
 * function MyFeatureChips({ features }) {
 *   const t = useT();
 *   return (
 *     <FeatureChips
 *       features={features}
 *       maxVisible={5}
 *       labels={{
 *         showMore: t('common.showMore'),
 *         showLess: t('common.showLess'),
 *       }}
 *     />
 *   );
 * }
 * ```
 */

import * as React from 'react';
import { useState, useMemo } from 'react';
import type { PatternFeatureItem } from './types';

// =============================================================================
// Types
// =============================================================================

export interface FeatureChipsLabels {
  /** Text for "show more" button (e.g., "+5 more" or "Show 5 more") */
  showMore?: string;
  /** Text for "show less" button */
  showLess?: string;
}

export interface FeatureChipsProps {
  /** Array of features to display */
  features: PatternFeatureItem[];
  /** Layout direction */
  layout?: 'horizontal' | 'vertical' | 'wrap';
  /** Whether to show unavailable features (dimmed) */
  showUnavailable?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum number of chips to display initially */
  maxVisible?: number;
  /** Labels for i18n */
  labels?: FeatureChipsLabels;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: Required<FeatureChipsLabels> = {
  showMore: '+{count} more',
  showLess: 'Show less',
};

// =============================================================================
// Check Icon Component
// =============================================================================

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
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
// Component
// =============================================================================

/**
 * FeatureChips component
 *
 * Displays a list of features/attributes as chips with optional icons.
 * Supports available/unavailable states and expandable overflow.
 */
export function FeatureChips({
  features,
  layout = 'wrap',
  showUnavailable = false,
  size = 'sm',
  maxVisible,
  labels: customLabels,
  className,
  style,
}: FeatureChipsProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  // Filter features based on availability
  const displayFeatures = useMemo(() => {
    if (showUnavailable) {
      return features;
    }
    return features.filter((f) => f.available !== false);
  }, [features, showUnavailable]);

  // Determine visible features based on maxVisible and expanded state
  const { visibleFeatures, hiddenCount } = useMemo(() => {
    if (!maxVisible || isExpanded) {
      return { visibleFeatures: displayFeatures, hiddenCount: 0 };
    }
    const visible = displayFeatures.slice(0, maxVisible);
    const hidden = Math.max(0, displayFeatures.length - maxVisible);
    return { visibleFeatures: visible, hiddenCount: hidden };
  }, [displayFeatures, maxVisible, isExpanded]);

  // Size-based styles
  const sizeStyles = {
    sm: {
      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
      fontSize: 'var(--ds-font-size-xs)',
      gap: 'var(--ds-spacing-1)',
      iconSize: 10,
      containerGap: 'var(--ds-spacing-1)',
    },
    md: {
      padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
      fontSize: 'var(--ds-font-size-sm)',
      gap: 'var(--ds-spacing-2)',
      iconSize: 12,
      containerGap: 'var(--ds-spacing-2)',
    },
    lg: {
      padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
      fontSize: 'var(--ds-font-size-md)',
      gap: 'var(--ds-spacing-2)',
      iconSize: 14,
      containerGap: 'var(--ds-spacing-2)',
    },
  };

  const currentSize = sizeStyles[size];

  // Layout styles
  const layoutStyles: Record<string, React.CSSProperties> = {
    horizontal: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      overflowX: 'auto',
    },
    vertical: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    wrap: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  };

  // Format labels with count
  const showMoreText = labels.showMore.replace('{count}', String(hiddenCount));

  if (displayFeatures.length === 0) {
    return <></>;
  }

  return (
    <div
      className={cn('platform-feature-chips', className)}
      style={{
        ...layoutStyles[layout],
        gap: currentSize.containerGap,
        ...style,
      }}
      role="list"
      aria-label="Features"
    >
      {visibleFeatures.map((feature) => {
        const isAvailable = feature.available !== false;

        return (
          <span
            key={feature.id}
            role="listitem"
            className="platform-feature-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: currentSize.gap,
              padding: currentSize.padding,
              backgroundColor: isAvailable
                ? 'var(--ds-color-neutral-surface-default)'
                : 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-full)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              fontSize: currentSize.fontSize,
              fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
              color: isAvailable
                ? 'var(--ds-color-neutral-text-default)'
                : 'var(--ds-color-neutral-text-subtle)',
              whiteSpace: 'nowrap',
              opacity: isAvailable ? 1 : 0.6,
              transition: 'all 0.15s ease',
            }}
          >
            {/* Status indicator (check icon for available) */}
            {isAvailable && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--ds-color-success-base-default)',
                }}
              >
                <CheckIcon size={currentSize.iconSize} />
              </span>
            )}

            {/* Custom icon if provided */}
            {feature.icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isAvailable
                    ? 'var(--ds-color-neutral-text-subtle)'
                    : 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {feature.icon}
              </span>
            )}

            {/* Label */}
            <span>{feature.label}</span>
          </span>
        );
      })}

      {/* Show more/less toggle */}
      {maxVisible && hiddenCount > 0 && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: currentSize.padding,
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            border: '1px solid var(--ds-color-accent-border-subtle)',
            fontSize: currentSize.fontSize,
            fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
            color: 'var(--ds-color-accent-text-default)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
          aria-expanded={false}
        >
          {showMoreText}
        </button>
      )}

      {maxVisible && isExpanded && displayFeatures.length > maxVisible && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: currentSize.padding,
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-full)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            fontSize: currentSize.fontSize,
            fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
            color: 'var(--ds-color-neutral-text-subtle)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
          aria-expanded={true}
        >
          {labels.showLess}
        </button>
      )}
    </div>
  );
}

export default FeatureChips;
