/**
 * @digilist/ui - Detail Page Components
 *
 * Components used in rental object detail pages.
 *
 * NOTE: These components are re-exported from @xalatechnologies/platform/ui
 * for backward compatibility. They are domain-agnostic and should be imported
 * directly from the platform package.
 *
 * @deprecated Import these components from @xalatechnologies/platform/ui instead.
 *
 * @example
 * ```tsx
 * // Old import (deprecated)
 * import { FAQTab, ContactInfoCard } from '@digilist/ui/blocks/detail';
 *
 * // New import (recommended)
 * import { FAQTab, ContactInfoCard } from '@xalatechnologies/platform/ui';
 * ```
 */

// Detail page components (re-exports from platform)
export { FAQTab } from './FAQTab';
export type { FAQTabProps } from './FAQTab';

export { GuidelinesTab } from './GuidelinesTab';
export type { GuidelinesTabProps } from './GuidelinesTab';

export { ContactInfoCard } from './ContactInfoCard';
export type { ContactInfoCardProps } from './ContactInfoCard';

export { LocationCard } from './LocationCard';
export type { LocationCardProps } from './LocationCard';

export { OpeningHoursCard } from './OpeningHoursCard';
export type { OpeningHoursCardProps } from './OpeningHoursCard';

export { CapacityCard } from './CapacityCard';
export type { CapacityCardProps } from './CapacityCard';
