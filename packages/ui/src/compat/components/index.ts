/**
 * Compat Components
 *
 * IMPORTANT: This module contains ONLY domain-specific components.
 * Platform components should be imported directly from @xalatechnologies/platform:
 *
 * @example
 * // Platform UI components
 * import { Stack, Grid, Container } from '@xalatechnologies/platform/ui/primitives';
 * import { AppHeader, PageHeader, WizardStepper } from '@xalatechnologies/platform/ui/composed';
 * import { DashboardSidebar, DashboardContent } from '@xalatechnologies/platform/ui/shells';
 * import { StatusTag, GenericStatusBadge } from '@xalatechnologies/platform/ui/blocks';
 *
 * // Domain-specific components (this module)
 * import { BookingStatusBadge, RentalObjectCalendar } from '@digilist/ui/compat';
 */

// =============================================================================
// DOMAIN-SPECIFIC COMPONENTS (Digilist only)
// =============================================================================

export { BookingStatusBadge } from './BookingStatusBadge';
export type { BookingStatusBadgeProps } from './BookingStatusBadge';

export { RentalObjectCalendar } from './RentalObjectCalendar';
export type { RentalObjectCalendarProps } from './RentalObjectCalendar';
