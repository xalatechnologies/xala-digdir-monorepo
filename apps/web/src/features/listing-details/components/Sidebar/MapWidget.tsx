/**
 * MapWidget Component
 *
 * Displays a map preview with the listing location.
 * Uses Mapbox static image API for the preview.
 */

import * as React from 'react';
import { Card, Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { MapPinIcon } from '@xala/ds';
import type { Address } from '../../types';

// =============================================================================
// Icons
// =============================================================================

function ExternalLinkIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface MapWidgetProps {
  address: Address;
  mapboxToken?: string;
  height?: number;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MapWidget({
  address,
  mapboxToken,
  height = 180,
  className,
}: MapWidgetProps): React.ReactElement {
  const hasCoordinates = address.coordinates?.latitude && address.coordinates?.longitude;

  // Build Mapbox static image URL
  const mapUrl = React.useMemo(() => {
    if (!hasCoordinates || !mapboxToken) return null;

    const { latitude, longitude } = address.coordinates!;
    const zoom = 14;
    const width = 400;
    const mapHeight = height;
    const style = 'mapbox/streets-v12';
    const marker = `pin-s+ef4444(${longitude},${latitude})`;

    return `https://api.mapbox.com/styles/v1/${style}/static/${marker}/${longitude},${latitude},${zoom}/${width}x${mapHeight}@2x?access_token=${mapboxToken}`;
  }, [address.coordinates, mapboxToken, height, hasCoordinates]);

  // Google Maps link
  const googleMapsUrl = React.useMemo(() => {
    if (hasCoordinates) {
      const { latitude, longitude } = address.coordinates!;
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(address.formatted)}`;
  }, [address, hasCoordinates]);

  return (
    <Card
      className={className}
      style={{
        padding: 'var(--ds-spacing-5)',
        overflow: 'hidden',
      }}
    >
      <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
        Lokasjon
      </Heading>

      {/* Map preview */}
      {mapUrl ? (
        <div
          style={{
            borderRadius: 'var(--ds-border-radius-md)',
            overflow: 'hidden',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <img
            src={mapUrl}
            alt={`Kart som viser ${address.formatted}`}
            style={{
              width: '100%',
              height: `${height}px`,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: `${height}px`,
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <MapPinIcon size={32} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
        </div>
      )}

      {/* Address text */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
        <MapPinIcon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          {address.formatted}
        </Paragraph>
      </div>

      {/* Open in maps button */}
      <Button
        type="button"
        variant="secondary"
        data-size="sm"
        onClick={() => window.open(googleMapsUrl, '_blank')}
        style={{ width: '100%' }}
      >
        <ExternalLinkIcon />
        Åpne i kart
      </Button>
    </Card>
  );
}

export default MapWidget;
