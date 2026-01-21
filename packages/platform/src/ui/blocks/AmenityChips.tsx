/**
 * AmenityChips Component
 *
 * Displays a list of amenities as chips.
 * Domain-agnostic - receives all data via props.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AmenityChips
 *   amenities={[
 *     { id: '1', name: 'WiFi', icon: <WifiIcon /> },
 *     { id: '2', name: 'Parking', icon: <CarIcon /> },
 *   ]}
 * />
 *
 * // With custom labels
 * import { useT } from '@xala/i18n';
 *
 * function MyAmenityChips({ amenities }) {
 *   const t = useT();
 *   return (
 *     <AmenityChips
 *       amenities={amenities}
 *       labels={{
 *         moreLabel: t('common.andMoreItems'),
 *       }}
 *     />
 *   );
 * }
 * ```
 */

import * as React from 'react';
import { Chip } from '../primitives';

// =============================================================================
// Types
// =============================================================================

export interface Amenity {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Whether the amenity is available/enabled */
  available?: boolean;
}

export interface AmenityChipsLabels {
  /** Text for "and X more" indicator */
  moreLabel: string;
}

export interface AmenityChipsProps {
  /** Array of amenities to display */
  amenities: Amenity[];
  /** Maximum number of chips to display */
  maxVisible?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show icons with labels */
  showIcons?: boolean;
  /** Labels for i18n */
  labels?: Partial<AmenityChipsLabels>;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: AmenityChipsLabels = {
  moreLabel: '+{count} mer',
};

// =============================================================================
// Component
// =============================================================================

/**
 * AmenityChips component
 *
 * Displays a list of amenities as chips with optional icons.
 */
export function AmenityChips({
  amenities,
  maxVisible = 5,
  size = 'sm',
  showIcons = true,
  labels: customLabels,
  className,
  style,
}: AmenityChipsProps): React.ReactElement {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  // Filter to available amenities if availability is specified
  const availableAmenities = amenities.filter(a => a.available !== false);

  // Determine visible and hidden amenities
  const visibleAmenities = availableAmenities.slice(0, maxVisible);
  const hiddenCount = Math.max(0, availableAmenities.length - maxVisible);

  // Format "more" label with count
  const moreText = labels.moreLabel.replace('{count}', String(hiddenCount));

  if (visibleAmenities.length === 0) {
    return <></>;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-2)',
        ...style,
      }}
    >
      {visibleAmenities.map((amenity) => (
        <Chip.Button key={amenity.id} data-size={size}>
          {showIcons && amenity.icon && (
            <span style={{ marginRight: 'var(--ds-spacing-1)', display: 'flex', alignItems: 'center' }}>
              {amenity.icon}
            </span>
          )}
          {amenity.name}
        </Chip.Button>
      ))}

      {hiddenCount > 0 && (
        <Chip.Button data-size={size}>
          {moreText}
        </Chip.Button>
      )}
    </div>
  );
}

export default AmenityChips;
