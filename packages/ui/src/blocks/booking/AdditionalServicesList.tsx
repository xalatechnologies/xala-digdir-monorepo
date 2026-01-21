/**
 * AdditionalServicesList - Domain stub for backward compatibility
 *
 * This component displays a list of add-on services that can be selected
 * during the booking process. It is re-exported from the platform package
 * for backward compatibility.
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { AdditionalServicesList } from '@digilist/ui/blocks/booking';
 *
 * // New import (recommended)
 * import { AdditionalServicesList } from '@xalatechnologies/platform/ui';
 * ```
 */

// Re-export from platform
export { AdditionalServicesList } from '@xalatechnologies/platform/ui';
export type { AdditionalServicesListProps } from '@xalatechnologies/platform/ui';

// Log deprecation warning in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] AdditionalServicesList imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead. ' +
    'This re-export will be removed in a future version.'
  );
}
