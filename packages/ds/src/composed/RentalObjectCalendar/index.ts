/**
 * RentalObjectCalendar - Shared Calendar Component
 * 
 * XALA Architecture Compliance:
 * - UI renders only from projections
 * - No local rule logic
 * - Mode switches dynamically (TIME, ALL-DAY, RECURRING)
 * - Slot states: AVAILABLE / RESERVED / BOOKED / BLOCKED / BLACKOUT
 * - UI actions rendered only from `availableActions`
 */

export { RentalObjectCalendar } from './RentalObjectCalendar';
export type {
  RentalObjectCalendarProps,
  CalendarSlot,
  CalendarMode,
  SlotStatus,
  CalendarAction,
  CalendarConfig,
  CalendarSelection,
} from './types';
