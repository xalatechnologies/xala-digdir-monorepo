/**
 * OverviewTab Component
 *
 * Displays listing description, amenities, and included facilities.
 */

import * as React from 'react';
import { Heading, Paragraph, Tag } from '@digdir/designsystemet-react';
import type { ListingMetadata, Amenity, IncludedFacility, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function CheckIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Amenity icons
function WifiIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function ProjectorIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 12h.01" />
      <path d="M17 12h.01" />
      <path d="M20 12h.01" />
    </svg>
  );
}

function WhiteboardIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 6" />
      <path d="M15 9l-6 6" />
    </svg>
  );
}

function CoffeeIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="8" />
      <line x1="10" y1="2" x2="10" y2="8" />
    </svg>
  );
}

function ParkingIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
    </svg>
  );
}

function ElevatorIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="12" y1="4" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function AccessibilityIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M10.5 13.5L12 7l1.5 6.5" />
      <path d="M12 7v13" />
      <path d="M8 21h8" />
      <circle cx="12" cy="21" r="1" />
    </svg>
  );
}

// Map amenity names to icons
function getAmenityIcon(name: string): React.ReactElement {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('wifi') || lowerName.includes('internet')) return <WifiIcon />;
  if (lowerName.includes('projektor') || lowerName.includes('projector') || lowerName.includes('skjerm')) return <ProjectorIcon />;
  if (lowerName.includes('whiteboard') || lowerName.includes('tavle')) return <WhiteboardIcon />;
  if (lowerName.includes('kaffe') || lowerName.includes('coffee') || lowerName.includes('kjøkken')) return <CoffeeIcon />;
  if (lowerName.includes('parkering') || lowerName.includes('parking')) return <ParkingIcon />;
  if (lowerName.includes('heis') || lowerName.includes('elevator') || lowerName.includes('trapp')) return <ElevatorIcon />;
  if (lowerName.includes('rullestol') || lowerName.includes('handicap') || lowerName.includes('tilgjengelig')) return <AccessibilityIcon />;
  return <CheckIcon />;
}

// =============================================================================
// Props
// =============================================================================

export interface OverviewTabProps {
  metadata: ListingMetadata;
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function OverviewTab({
  metadata,
  listingType,
  className,
}: OverviewTabProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-8)',
      }}
    >
      {/* Description */}
      <section>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Beskrivelse
        </Heading>
        {metadata.description ? (
          <Paragraph
            data-size="md"
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              lineHeight: 'var(--ds-font-line-height-default)',
            }}
          >
            {metadata.description}
          </Paragraph>
        ) : (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
            {presenter.getEmptyState('description')}
          </Paragraph>
        )}
      </section>

      {/* Highlights */}
      {metadata.highlights && metadata.highlights.length > 0 && (
        <section>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Høydepunkter
          </Heading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
            {metadata.highlights.map((highlight, index) => (
              <Tag key={index} color="success" data-size="sm">
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <CheckIcon />
                  {highlight}
                </span>
              </Tag>
            ))}
          </div>
        </section>
      )}

      {/* Amenities */}
      {metadata.amenities.length > 0 && (
        <section>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Fasiliteter
          </Heading>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {metadata.amenities.map((amenity: Amenity) => (
              <div
                key={amenity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                }}
              >
                <span style={{ color: 'var(--ds-color-accent-base-default)' }}>
                  {getAmenityIcon(amenity.name)}
                </span>
                <div>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {amenity.name}
                  </Paragraph>
                  {amenity.description && (
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {amenity.description}
                    </Paragraph>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Included Facilities */}
      {metadata.includedFacilities.length > 0 && (
        <section>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Inkludert utstyr
          </Heading>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {metadata.includedFacilities.map((facility: IncludedFacility) => (
              <div
                key={facility.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <CheckIcon />
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {facility.name}
                  {facility.quantity && facility.quantity > 1 && ` (${facility.quantity})`}
                </Paragraph>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state if no content */}
      {!metadata.description && metadata.amenities.length === 0 && metadata.includedFacilities.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--ds-spacing-8)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, fontStyle: 'italic' }}>
            Ingen detaljert informasjon er tilgjengelig for dette lokalet.
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default OverviewTab;
