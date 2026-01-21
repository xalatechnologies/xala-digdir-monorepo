/**
 * RentalObjectMap - Full map view with location pins and popups
 *
 * Uses dependency injection for map components. The Map, Marker, and NavigationControl
 * components are injected via MapProvider at the app level.
 *
 * Supports dark mode with automatic map style switching.
 *
 * @example
 * ```tsx
 * // In app main.tsx - inject map implementation
 * import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
 * import { MapProvider } from '@xalatechnologies/platform/runtime';
 *
 * <MapProvider
 *   components={{ Map, Marker, NavigationControl }}
 *   accessToken={MAPBOX_TOKEN}
 * >
 *   <App />
 * </MapProvider>
 *
 * // In component - uses injected map
 * <RentalObjectMap rentalObjects={objects} />
 * ```
 */
import * as React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  useMapComponents,
  MapNotConfigured,
  type AbstractMapRef,
} from '../../runtime';
import { RentalObjectCard } from './RentalObjectCard';

// Mapbox style URLs (fallbacks if not provided via context)
const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

export interface MapRentalObject {
  id: string;
  name: string;
  slug?: string;
  location: string;
  image?: string;
  latitude: number;
  longitude: number;
  type?: string;
  category?: string;
  description?: string;
  capacity?: number;
  price?: number;
  priceUnit?: string;
  amenities?: string[];
  available?: boolean;
}

export interface RentalObjectMapProps {
  rentalObjects: MapRentalObject[];
  /** Override access token (uses MapProvider token if not provided) */
  mapboxToken?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  height?: string | number;
  onRentalObjectClick?: (id: string, slug?: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (id: string, slug?: string) => void;
  /** Override map style URL. If not provided, uses automatic light/dark switching */
  mapStyle?: string;
  /** Color scheme: 'light', 'dark', or 'auto' (detects from DOM). Defaults to 'auto' */
  colorScheme?: 'light' | 'dark' | 'auto';
  className?: string;
}

// Pin marker component - uses accent color for visibility in both light/dark modes
function MapPin({ size = 36, isSelected = false }: { size?: number; isSelected?: boolean }) {
  // Use CSS custom properties for theming - these resolve at runtime
  const selectedColor = 'var(--ds-color-accent-base-default, #0066FF)';
  const defaultColor = 'var(--ds-color-danger-base-default, #E53935)';
  const strokeColor = 'var(--ds-color-neutral-background-default, #ffffff)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.3)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        filter: 'var(--ds-shadow-pin, drop-shadow(0 3px 8px rgba(0,0,0,0.5)))',
      }}
    >
      {/* Outer pin shape with stroke for visibility */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={isSelected ? selectedColor : defaultColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Inner circle */}
      <circle
        cx="12"
        cy="9"
        r="2.5"
        fill={strokeColor}
      />
    </svg>
  );
}


// Overlay backdrop
function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--ds-color-neutral-background-backdrop, rgba(0,0,0,0.5))',
        zIndex: 9998,
      }}
    />
  );
}

// Hook to detect color scheme from DOM or system preference
function useColorScheme(colorScheme: 'light' | 'dark' | 'auto'): 'light' | 'dark' {
  const [detectedScheme, setDetectedScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (colorScheme !== 'auto') {
      setDetectedScheme(colorScheme);
      return;
    }

    // Function to detect current color scheme
    const detectScheme = () => {
      // First check data-color-scheme attribute on any parent element
      const dsProvider = document.querySelector('[data-color-scheme]');
      const dataScheme = dsProvider?.getAttribute('data-color-scheme');

      if (dataScheme === 'dark') {
        return 'dark';
      }
      if (dataScheme === 'light') {
        return 'light';
      }

      // If 'auto', check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }

      return 'light';
    };

    setDetectedScheme(detectScheme());

    // Listen for changes to data-color-scheme attribute
    const observer = new MutationObserver(() => {
      setDetectedScheme(detectScheme());
    });

    const dsProvider = document.querySelector('[data-color-scheme]');
    if (dsProvider) {
      observer.observe(dsProvider, { attributes: true, attributeFilter: ['data-color-scheme'] });
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setDetectedScheme(detectScheme());
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [colorScheme]);

  return detectedScheme;
}

export function RentalObjectMap({
  rentalObjects,
  mapboxToken: propToken,
  initialZoom: _initialZoom = 12,
  height = '600px',
  onRentalObjectClick,
  onFavorite,
  onShare,
  mapStyle,
  colorScheme = 'auto',
  className,
}: RentalObjectMapProps): React.ReactElement {
  // Get injected map components from context
  const {
    isConfigured,
    accessToken: contextToken,
    defaultMapStyle,
    darkModeMapStyle,
    Map,
    Marker,
    NavigationControl,
  } = useMapComponents();

  const mapRef = useRef<AbstractMapRef>(null);
  const [selectedRentalObject, setSelectedRentalObject] = useState<MapRentalObject | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Use prop token or context token
  const mapboxToken = propToken || contextToken;

  // Detect color scheme for map style
  const detectedColorScheme = useColorScheme(colorScheme);
  const effectiveMapStyle = mapStyle ||
    (detectedColorScheme === 'dark' ? (darkModeMapStyle || MAP_STYLES.dark) : (defaultMapStyle || MAP_STYLES.light));

  // Calculate bounds for all rental objects
  const bounds = useMemo(() => {
    if (!rentalObjects.length) return null;

    const lats = rentalObjects.map(ro => ro.latitude);
    const lngs = rentalObjects.map(ro => ro.longitude);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [rentalObjects]);

  // Initial view state (fallback before fitBounds)
  const initialViewState = useMemo(() => {
    if (!rentalObjects.length) {
      // Default to Norway center
      return { latitude: 62.0, longitude: 10.0, zoom: 5 };
    }

    if (rentalObjects.length === 1) {
      const first = rentalObjects[0]!;
      return {
        latitude: first.latitude,
        longitude: first.longitude,
        zoom: 14,
      };
    }

    // Center point for initial load
    const centerLat = bounds ? (bounds.minLat + bounds.maxLat) / 2 : 62.0;
    const centerLng = bounds ? (bounds.minLng + bounds.maxLng) / 2 : 10.0;

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom: 6, // Start zoomed out, fitBounds will adjust
    };
  }, [rentalObjects, bounds]);

  // Fit bounds when map loads or rental objects change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !bounds || rentalObjects.length <= 1) return;

    // Use fitBounds for accurate zoom to show all markers
    mapRef.current.fitBounds(
      [
        [bounds.minLng, bounds.minLat], // Southwest
        [bounds.maxLng, bounds.maxLat], // Northeast
      ],
      {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14,
        duration: 1000,
      }
    );
  }, [mapLoaded, bounds, rentalObjects.length]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleMarkerClick = useCallback((rentalObject: MapRentalObject) => {
    setSelectedRentalObject(rentalObject);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedRentalObject(null);
  }, []);

  const heightValue = typeof height === 'number' ? `${height}px` : height;

  // CSS for dark mode navigation controls - uses token fallbacks
  const darkModeControlStyles = detectedColorScheme === 'dark' ? `
    .mapboxgl-ctrl-group {
      background: var(--ds-color-neutral-surface-default, rgba(30, 30, 30, 0.95)) !important;
      border: 1px solid var(--ds-color-neutral-border-subtle, rgba(255, 255, 255, 0.1)) !important;
    }
    .mapboxgl-ctrl-group button {
      background-color: transparent !important;
    }
    .mapboxgl-ctrl-group button + button {
      border-top: var(--ds-border-width-default, 1px) solid var(--ds-color-neutral-border-subtle, rgba(255, 255, 255, 0.1)) !important;
    }
    .mapboxgl-ctrl-group button:hover {
      background-color: var(--ds-color-neutral-surface-hover, rgba(255, 255, 255, 0.1)) !important;
    }
    .mapboxgl-ctrl-icon {
      filter: invert(1) !important;
    }
    .mapboxgl-ctrl-attrib {
      background: var(--ds-color-neutral-background-default, rgba(30, 30, 30, 0.8)) !important;
      color: var(--ds-color-neutral-text-subtle, rgba(255, 255, 255, 0.7)) !important;
    }
    .mapboxgl-ctrl-attrib a {
      color: var(--ds-color-neutral-text-subtle, rgba(255, 255, 255, 0.7)) !important;
    }
  ` : '';

  // If map not configured or missing token, show fallback
  if (!isConfigured || !Map || !mapboxToken) {
    return <MapNotConfigured height={heightValue} />;
  }

  // Create markers using injected Marker component
  const markers = Marker ? rentalObjects.map((rentalObject) => (
    <Marker
      key={rentalObject.id}
      latitude={rentalObject.latitude}
      longitude={rentalObject.longitude}
      anchor="bottom"
      onClick={(e: { originalEvent: MouseEvent }) => {
        e.originalEvent.stopPropagation();
        handleMarkerClick(rentalObject);
      }}
    >
      <MapPin isSelected={selectedRentalObject?.id === rentalObject.id} />
    </Marker>
  )) : null;

  return (
    <div
      className={className}
      style={{
        height: heightValue,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Inject dark mode styles for Mapbox controls */}
      {darkModeControlStyles && (
        <style dangerouslySetInnerHTML={{ __html: darkModeControlStyles }} />
      )}
      <Map
        ref={mapRef as React.RefObject<AbstractMapRef>}
        initialViewState={initialViewState}
        mapStyle={effectiveMapStyle}
        mapboxAccessToken={mapboxToken}
        onLoad={handleMapLoad}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-default)',
        }}
        reuseMaps
      >
        {NavigationControl && <NavigationControl position="top-right" />}
        {markers}
      </Map>


      {/* Custom popup rendered outside map container */}
      {selectedRentalObject && (
        <>
          <Overlay onClick={handlePopupClose} />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            <RentalObjectCard
              id={selectedRentalObject.id}
              name={selectedRentalObject.name}
              type={selectedRentalObject.type || ''}
              location={selectedRentalObject.location}
              description={selectedRentalObject.description || ''}
              image={selectedRentalObject.image || ''}
              variant="grid"
              onClose={handlePopupClose}
              showFavoriteButton={!!onFavorite}
              showShareButton={!!onShare}
              showDescription={true}
              showPrice={true}
              {...(selectedRentalObject.category && {
                category: selectedRentalObject.category as 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER'
              })}
              {...(selectedRentalObject.capacity !== undefined && { capacity: selectedRentalObject.capacity })}
              {...(selectedRentalObject.price !== undefined && { price: selectedRentalObject.price })}
              {...(selectedRentalObject.priceUnit && { priceUnit: selectedRentalObject.priceUnit })}
              {...(selectedRentalObject.amenities && { amenities: selectedRentalObject.amenities })}
              {...(selectedRentalObject.available !== undefined && { available: selectedRentalObject.available })}
              {...(onRentalObjectClick && { onClick: () => onRentalObjectClick(selectedRentalObject.id, selectedRentalObject.slug) })}
              {...(onFavorite && { onFavorite: () => onFavorite(selectedRentalObject.id) })}
              {...(onShare && { onShare: () => onShare(selectedRentalObject.id, selectedRentalObject.slug) })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RentalObjectMap;
