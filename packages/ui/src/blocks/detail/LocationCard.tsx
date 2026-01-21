/**
 * LocationCard - Domain stub for backward compatibility
 *
 * This component displays location information with an optional map preview.
 * It is re-exported from the platform package for backward compatibility.
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { LocationCard } from '@digilist/ui/blocks/detail';
 *
 * // New import (recommended)
 * import { LocationCard } from '@xalatechnologies/platform/ui';
 * ```
 */

// Re-export from platform
export { LocationCard } from '@xalatechnologies/platform/ui';
export type { LocationCardProps } from '@xalatechnologies/platform/ui';

// Log deprecation warning in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] LocationCard imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead. ' +
    'This re-export will be removed in a future version.'
  );
}
