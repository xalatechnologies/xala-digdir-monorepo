/**
 * LazyRentalObjectMap - Lazy-loaded map component wrapper
 *
 * Dynamically imports the RentalObjectMap component from @xalatechnologies/platform/ui/maps to reduce initial bundle size.
 * The map component and its dependencies (mapbox-gl ~500KB) are only loaded when needed.
 *
 * @example
 * ```tsx
 * <LazyRentalObjectMap
 *   rentalObjects={rentalObjects}
 *   mapboxToken={token}
 *   onRentalObjectClick={handleClick}
 * />
 * ```
 */

import React, { Suspense } from 'react';
import { Stack, Spinner, Text } from '@xalatechnologies/platform/ui';
import type { RentalObjectMapProps } from '@xalatechnologies/platform/ui/maps';
import { useT } from '@xalatechnologies/platform/i18n';

// Lazy load the map component - only loads when this component is rendered
const RentalObjectMap = React.lazy(() =>
  import('@xalatechnologies/platform/ui/maps').then((module) => ({
    default: module.RentalObjectMap,
  }))
);

/**
 * Loading fallback component
 * Displays while the map component is being loaded
 */
function MapLoadingFallback() {
  return (
    <Stack
      direction="column"
      align="center"
      justify="center"
      style={{
        height: '100%',
        minHeight: '400px',
        width: '100%',
      }}
    >
      <Spinner size="lg" />
      <Text size="md" style={{ marginTop: '16px' }}>
        Laster kart...
      </Text>
    </Stack>
  );
}

/**
 * LazyRentalObjectMap Component
 *
 * A lazy-loaded wrapper for the RentalObjectMap component. This component enables
 * code splitting by dynamically importing the map functionality only when needed.
 *
 * The underlying map component and its dependencies (mapbox-gl) will be loaded
 * on first render, reducing the initial bundle size by ~150KB gzipped.
 */
export function LazyRentalObjectMap(props: RentalObjectMapProps): React.ReactElement {
  const t = useT();
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <RentalObjectMap {...props} />
    </Suspense>
  );
}
