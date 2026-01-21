/**
 * MapContext - Abstract Map Provider
 *
 * Provides dependency injection for map components. This allows applications
 * to inject their preferred map library (Mapbox, Google Maps, etc.) without
 * creating direct dependencies in UI components.
 *
 * @example
 * ```tsx
 * // In app main.tsx - inject concrete implementation
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
 * // In component - consume via context
 * import { useMapComponents } from '@xalatechnologies/platform/runtime';
 *
 * function MyMap() {
 *   const { Map, Marker, accessToken, isConfigured } = useMapComponents();
 *   if (!isConfigured) return <div>Map not configured</div>;
 *   return <Map mapboxAccessToken={accessToken}>...</Map>;
 * }
 * ```
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { FC, ComponentType, RefObject } from 'react';

// =============================================================================
// Abstract Map Types (library-agnostic)
// =============================================================================

export interface AbstractMapRef {
  getMap(): unknown;
  getCenter(): { lng: number; lat: number };
  getZoom(): number;
  flyTo(options: { center: [number, number]; zoom?: number; duration?: number }): void;
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: {
      padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
      maxZoom?: number;
      duration?: number;
    }
  ): void;
}

export interface AbstractViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface AbstractMapProps {
  mapboxAccessToken?: string;
  mapStyle?: string;
  initialViewState?: AbstractViewState;
  style?: React.CSSProperties;
  ref?: RefObject<AbstractMapRef>;
  onMove?: (evt: { viewState: AbstractViewState }) => void;
  onLoad?: () => void;
  reuseMaps?: boolean;
  children?: React.ReactNode;
}

export interface AbstractMarkerProps {
  longitude: number;
  latitude: number;
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  onClick?: (e: { originalEvent: MouseEvent }) => void;
  children?: React.ReactNode;
}

export interface AbstractNavigationControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// =============================================================================
// Map Component Types
// =============================================================================

export interface MapComponents {
  /** Map container component */
  Map: ComponentType<AbstractMapProps>;
  /** Marker component */
  Marker?: ComponentType<AbstractMarkerProps>;
  /** Navigation controls component */
  NavigationControl?: ComponentType<AbstractNavigationControlProps>;
}

// =============================================================================
// Context Types
// =============================================================================

export interface MapContextValue {
  /** Whether map is configured */
  isConfigured: boolean;
  /** Map access token (e.g., Mapbox token) */
  accessToken?: string;
  /** Default map style URL */
  defaultMapStyle?: string;
  /** Dark mode map style URL */
  darkModeMapStyle?: string;
  /** Map components */
  components: MapComponents | null;
}

// =============================================================================
// Provider Props
// =============================================================================

export interface MapProviderProps {
  /** Map components to inject */
  components: MapComponents;
  /** Map access token */
  accessToken: string;
  /** Default map style URL */
  defaultMapStyle?: string;
  /** Dark mode map style URL */
  darkModeMapStyle?: string;
  /** Children */
  children: React.ReactNode;
}

// =============================================================================
// Context
// =============================================================================

const MapContext = createContext<MapContextValue>({
  isConfigured: false,
  components: null,
});

MapContext.displayName = 'MapContext';

// =============================================================================
// Provider Component
// =============================================================================

/**
 * MapProvider
 *
 * Provides map component dependencies via context. Applications inject their
 * preferred map library implementation at the root level.
 */
export const MapProvider: FC<MapProviderProps> = ({
  components,
  accessToken,
  defaultMapStyle = 'mapbox://styles/mapbox/streets-v12',
  darkModeMapStyle = 'mapbox://styles/mapbox/dark-v11',
  children,
}) => {
  const value = useMemo<MapContextValue>(
    () => ({
      isConfigured: true,
      accessToken,
      defaultMapStyle,
      darkModeMapStyle,
      components,
    }),
    [accessToken, defaultMapStyle, darkModeMapStyle, components]
  );

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

MapProvider.displayName = 'MapProvider';

// =============================================================================
// Hook
// =============================================================================

/**
 * useMapComponents
 *
 * Access injected map components. Returns null components if not configured,
 * allowing graceful degradation.
 */
export function useMapComponents(): MapContextValue & {
  Map: ComponentType<AbstractMapProps> | null;
  Marker: ComponentType<AbstractMarkerProps> | null;
  NavigationControl: ComponentType<AbstractNavigationControlProps> | null;
} {
  const context = useContext(MapContext);

  return {
    ...context,
    Map: context.components?.Map ?? null,
    Marker: context.components?.Marker ?? null,
    NavigationControl: context.components?.NavigationControl ?? null,
  };
}

// =============================================================================
// Fallback Component
// =============================================================================

/**
 * MapNotConfigured
 *
 * Placeholder component shown when map is not configured.
 */
export const MapNotConfigured: FC<{ height?: string | number }> = ({ height = 400 }) => (
  <div
    style={{
      height: typeof height === 'number' ? `${height}px` : height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
      border: '1px solid var(--ds-color-neutral-border-default)',
      borderRadius: 'var(--ds-border-radius-lg)',
      color: 'var(--ds-color-neutral-text-subtle)',
    }}
  >
    Map not configured. Please wrap your app in a MapProvider.
  </div>
);

MapNotConfigured.displayName = 'MapNotConfigured';

export default MapContext;
