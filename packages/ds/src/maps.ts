/**
 * @xala/ds/maps
 *
 * Map components entry point for dynamic imports
 *
 * This module contains map-related components that depend on Mapbox GL (~500KB).
 * Import from '@xala/ds/maps' instead of '@xala/ds' to enable code splitting
 * and lazy loading of map functionality.
 *
 * ## Components
 *
 * - RentalObjectMap - Full map view with location pins and popups for rental objects
 *
 * ## Usage
 *
 * @example
 * ```tsx
 * import { lazy, Suspense } from 'react';
 *
 * // Lazy load the map component
 * const RentalObjectMap = lazy(() => import('@xala/ds/maps').then(m => ({ default: m.RentalObjectMap })));
 *
 * function MyMapView() {
 *   return (
 *     <Suspense fallback={<div>Loading map...</div>}>
 *       <RentalObjectMap
 *         rentalObjects={rentalObjects}
 *         mapboxToken={token}
 *         onRentalObjectClick={handleClick}
 *       />
 *     </Suspense>
 *   );
 * }
 * ```
 */

// =============================================================================
// Map Components - Lazy loadable map functionality
// =============================================================================
export { RentalObjectMap } from './blocks/ListingMap';
export type { RentalObjectMapProps, MapRentalObject } from './blocks/ListingMap';
