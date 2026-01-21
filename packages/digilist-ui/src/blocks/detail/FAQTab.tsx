/**
 * FAQTab - Domain stub for backward compatibility
 *
 * This component displays frequently asked questions in an expandable format.
 * It is re-exported from the platform package for backward compatibility.
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { FAQTab } from '@digilist/ui/blocks/detail';
 *
 * // New import (recommended)
 * import { FAQTab } from '@xalatechnologies/platform/ui';
 * ```
 */

// Re-export from platform
export { FAQTab } from '@xalatechnologies/platform/ui';
export type { FAQTabProps } from '@xalatechnologies/platform/ui';

// Log deprecation warning in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] FAQTab imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead. ' +
    'This re-export will be removed in a future version.'
  );
}
