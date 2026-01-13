/**
 * FacilityChips
 *
 * Horizontal row of facility tags with optional icons.
 * Used to display available facilities for a listing.
 */
import * as React from 'react';
import { Tag } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import {
  ProjectorIcon,
  BoardIcon,
  WifiIcon,
  VideoIcon,
} from '../primitives/icons';
import type { Facility } from '../types/listing-detail';

export interface FacilityChipsProps {
  /** Array of facilities to display */
  facilities: Facility[];
  /** Maximum number of visible facilities */
  maxVisible?: number;
  /** Label for "show more" button */
  showMoreLabel?: string;
  /** Callback when "show more" is clicked */
  onShowMore?: () => void;
  /** Custom class name */
  className?: string;
}

// Map of facility labels to icons
const facilityIconMap: Record<string, React.ReactNode> = {
  projektor: <ProjectorIcon size={14} />,
  tavle: <BoardIcon size={14} />,
  whiteboard: <BoardIcon size={14} />,
  wifi: <WifiIcon size={14} />,
  videokonferanse: <VideoIcon size={14} />,
  video: <VideoIcon size={14} />,
};

/**
 * Get icon for a facility based on its label
 */
function getFacilityIcon(label: string): React.ReactNode | null {
  const normalizedLabel = label.toLowerCase();
  for (const [key, icon] of Object.entries(facilityIconMap)) {
    if (normalizedLabel.includes(key)) {
      return icon;
    }
  }
  return null;
}

/**
 * FacilityChips component
 *
 * @example
 * ```tsx
 * <FacilityChips
 *   facilities={[
 *     { id: '1', label: 'Projektor' },
 *     { id: '2', label: 'WiFi' },
 *   ]}
 * />
 * ```
 */
export function FacilityChips({
  facilities,
  maxVisible,
  showMoreLabel,
  onShowMore,
  className,
}: FacilityChipsProps): React.ReactElement {
  const visibleFacilities = maxVisible
    ? facilities.slice(0, maxVisible)
    : facilities;
  const hiddenCount = maxVisible
    ? Math.max(0, facilities.length - maxVisible)
    : 0;

  return (
    <div
      className={cn('facility-chips', className)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      {visibleFacilities.map((facility) => {
        const icon = getFacilityIcon(facility.label);
        return (
          <Tag
            key={facility.id}
            data-size="sm"
            data-color="neutral"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            {icon}
            {facility.label}
          </Tag>
        );
      })}
      {hiddenCount > 0 && (
        <Tag
          data-size="sm"
          data-color="neutral"
          style={{
            cursor: onShowMore ? 'pointer' : 'default',
          }}
          onClick={onShowMore}
        >
          {showMoreLabel || `+${hiddenCount} mer`}
        </Tag>
      )}
    </div>
  );
}

export default FacilityChips;
