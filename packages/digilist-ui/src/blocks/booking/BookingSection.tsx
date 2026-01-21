/**
 * BookingSection - Domain stub for backward compatibility
 *
 * This component provides a complete booking section with calendar,
 * stepper, and slot selection. It is re-exported from the platform
 * package for backward compatibility.
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { BookingSection } from '@digilist/ui/blocks/booking';
 *
 * // New import (recommended)
 * import { BookingSection } from '@xalatechnologies/platform/ui';
 * ```
 */

// Re-export from platform
export { BookingSection } from '@xalatechnologies/platform/ui';
export type { BookingSectionProps } from '@xalatechnologies/platform/ui';

// Log deprecation warning in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] BookingSection imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead. ' +
    'This re-export will be removed in a future version.'
  );
}
