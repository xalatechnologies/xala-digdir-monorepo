/**
 * CapacityCard - Domain stub for backward compatibility
 *
 * This component displays capacity information (max persons, etc.).
 * It is re-exported from the platform package for backward compatibility.
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { CapacityCard } from '@digilist/ui/blocks/detail';
 *
 * // New import (recommended)
 * import { CapacityCard } from '@xalatechnologies/platform/ui';
 * ```
 */

// Re-export from platform
export { CapacityCard } from '@xalatechnologies/platform/ui';
export type { CapacityCardProps } from '@xalatechnologies/platform/ui';

// Log deprecation warning in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] CapacityCard imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead. ' +
    'This re-export will be removed in a future version.'
  );
}
