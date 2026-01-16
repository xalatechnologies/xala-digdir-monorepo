/**
 * Calendar Service
 * Business logic for calendar domain - config generation and availability matrix
 */
import { Injectable, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import { NotFoundError, BadRequestError } from '../../core/errors/problem-details';
import { validate } from '../../core/validation/zod-pipe';
import { getAuditService } from '../../core/audit/audit.service';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { rentalObjects, allocations, bookings } from '../../database/schema/index';
import {
  CalendarConfigQuerySchema,
  AvailabilityMatrixQuerySchema,
  type CalendarConfigQueryParams,
  type AvailabilityMatrixQueryParams,
  type ListingCalendarConfigProjection, // Deprecated alias, use RentalObjectCalendarConfigProjection
  type ListingAvailabilityMatrixProjection, // Deprecated alias, use RentalObjectAvailabilityMatrixProjection
  type AvailabilityCell,
  type SlotStatus,
  type CalendarGranularity,
  type OpeningHours,
  type BookingTypeConfig,
  type CalendarUIConfig,
  type CalendarPermissions,
  type Action,
} from '../../schemas/calendar.schema';

/**
 * Default opening hours (9 AM - 5 PM, Monday-Friday)
 */
const DEFAULT_OPENING_HOURS: OpeningHours = {
  weekly: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '10:00', close: '15:00', closed: true },
    sunday: { open: '10:00', close: '15:00', closed: true },
  },
  exceptions: [],
};

/**
 * Default booking types
 */
const DEFAULT_BOOKING_TYPES: BookingTypeConfig[] = [
  {
    code: 'HOURLY',
    labelKey: 'calendar.bookingType.hourly',
    default: true,
    rules: {},
  },
];

/**
 * Slot status legend entries
 */
const SLOT_STATUS_LEGEND = [
  { status: 'AVAILABLE' as SlotStatus, labelKey: 'calendar.status.available' },
  { status: 'RESERVED' as SlotStatus, labelKey: 'calendar.status.reserved' },
  { status: 'BOOKED' as SlotStatus, labelKey: 'calendar.status.booked' },
  { status: 'BLOCKED' as SlotStatus, labelKey: 'calendar.status.blocked' },
  { status: 'BLACKOUT' as SlotStatus, labelKey: 'calendar.status.blackout' },
  { status: 'CLOSED' as SlotStatus, labelKey: 'calendar.status.closed' },
];

@Injectable()
export class CalendarService {
  constructor(
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Get calendar configuration for a listing
   * Returns complete calendar behavior configuration based on listing type
   */
  async getCalendarConfig(
    rentalObjectId: string,
    params: CalendarConfigQueryParams = {}
  ): Promise<ListingCalendarConfigProjection> {
    const validated = validate(CalendarConfigQuerySchema, params);
    const db = container.resolve<any>('Database');

    // Fetch listing to determine calendar config
    const [listing] = await db
      .select()
      .from(rentalObjects)
      .where(eq(rentalObjects.id, rentalObjectId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError('Listing', rentalObjectId);
    }

    // Determine granularity based on listing type and metadata
    const granularity = this.determineGranularity(listing);
    const slotConfig = this.determineSlotConfig(listing, granularity);
    const bookingWindow = this.determineBookingWindow(listing);
    const openingHours = this.extractOpeningHours(listing);
    const bookingTypes = this.extractBookingTypes(listing, validated.bookingType);
    const uiConfig = this.determineUIConfig(granularity);
    const permissions = this.determinePermissions(listing);
    const availableActions = this.determineAvailableActions(listing);

    this.adapters?.log?.info('Calendar config generated', { rentalObjectId, granularity });

    return {
      rentalObjectId,
      granularity,
      timezone: 'Europe/Oslo',
      ...slotConfig,
      ...bookingWindow,
      openingHours,
      bookingTypes,
      ui: uiConfig,
      permissions,
      availableActions,
    };
  }

  /**
   * Get availability matrix for a listing within a date range
   * Returns cell-by-cell availability state for the calendar
   */
  async getAvailabilityMatrix(
    rentalObjectId: string,
    params: AvailabilityMatrixQueryParams
  ): Promise<ListingAvailabilityMatrixProjection> {
    const validated = validate(AvailabilityMatrixQuerySchema, params);
    const db = container.resolve<any>('Database');

    // Fetch listing to determine granularity
    const [listing] = await db
      .select()
      .from(rentalObjects)
      .where(eq(rentalObjects.id, rentalObjectId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError('Listing', rentalObjectId);
    }

    const granularity = this.determineGranularity(listing);
    const openingHours = this.extractOpeningHours(listing);

    // Parse date range
    const fromDate = new Date(validated.from);
    const toDate = new Date(validated.to);
    toDate.setHours(23, 59, 59, 999);

    // Fetch allocations (blocks, blackouts)
    const allocationResults = await db
      .select({
        id: allocations.id,
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
        bookingId: allocations.bookingId,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.rentalObjectId, rentalObjectId),
          or(
            and(gte(allocations.startTime, fromDate), lte(allocations.startTime, toDate)),
            and(gte(allocations.endTime, fromDate), lte(allocations.endTime, toDate)),
            and(lte(allocations.startTime, fromDate), gte(allocations.endTime, toDate))
          )
        )
      );

    // Fetch bookings
    const bookingResults = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          or(
            and(gte(bookings.startTime, fromDate), lte(bookings.startTime, toDate)),
            and(gte(bookings.endTime, fromDate), lte(bookings.endTime, toDate)),
            and(lte(bookings.startTime, fromDate), gte(bookings.endTime, toDate))
          )
        )
      );

    // Generate availability cells based on granularity
    const cells = this.generateAvailabilityCells(
      listing,
      granularity,
      fromDate,
      toDate,
      openingHours,
      allocationResults,
      bookingResults
    );

    this.adapters?.log?.info('Availability matrix generated', {
      rentalObjectId,
      from: validated.from,
      to: validated.to,
      cellCount: cells.length,
    });

    return {
      rentalObjectId,
      from: validated.from,
      to: validated.to,
      granularity,
      cells,
      legend: SLOT_STATUS_LEGEND,
    };
  }

  /**
   * Determine calendar granularity based on listing type and metadata
   */
  private determineGranularity(listing: any): CalendarGranularity {
    const listingType = listing.type?.toUpperCase();
    const metadata = listing.metadata || {};

    // Check for explicit granularity override in metadata
    if (metadata.calendarGranularity) {
      return metadata.calendarGranularity as CalendarGranularity;
    }

    // Determine by listing type
    switch (listingType) {
      case 'ACCOMMODATION':
      case 'CABIN':
      case 'RENTAL':
        return 'MULTI_DAY';
      case 'SPACE':
      case 'MEETING_ROOM':
      case 'FACILITY':
      case 'RESOURCE':
        return 'TIME_SLOTS';
      case 'EVENT':
        return 'ALL_DAY';
      default:
        return 'TIME_SLOTS';
    }
  }

  /**
   * Determine slot configuration based on listing and granularity
   */
  private determineSlotConfig(listing: any, granularity: CalendarGranularity): {
    slotSizeMinutes: number;
    selectableUnit: 'slot' | 'day' | 'range';
    minDurationMinutes: number;
    maxDurationMinutes: number | null;
    stepMinutes: number;
    bufferBeforeMinutes?: number;
    bufferAfterMinutes?: number;
  } {
    const metadata = listing.metadata || {};

    switch (granularity) {
      case 'MULTI_DAY':
        return {
          slotSizeMinutes: 1440, // 24 hours
          selectableUnit: 'range',
          minDurationMinutes: 1440, // Minimum 1 day
          maxDurationMinutes: metadata.maxStayDays ? metadata.maxStayDays * 1440 : null,
          stepMinutes: 1440,
          bufferBeforeMinutes: metadata.bufferBeforeMinutes || 0,
          bufferAfterMinutes: metadata.bufferAfterMinutes || 0,
        };
      case 'ALL_DAY':
        return {
          slotSizeMinutes: 1440,
          selectableUnit: 'day',
          minDurationMinutes: 1440,
          maxDurationMinutes: 1440,
          stepMinutes: 1440,
        };
      case 'TIME_SLOTS':
      default:
        return {
          slotSizeMinutes: metadata.slotSizeMinutes || 60,
          selectableUnit: 'slot',
          minDurationMinutes: metadata.minDurationMinutes || 60,
          maxDurationMinutes: metadata.maxDurationMinutes || null,
          stepMinutes: metadata.stepMinutes || 30,
          bufferBeforeMinutes: metadata.bufferBeforeMinutes || 0,
          bufferAfterMinutes: metadata.bufferAfterMinutes || 15,
        };
    }
  }

  /**
   * Determine booking window constraints
   */
  private determineBookingWindow(listing: any): {
    minNoticeMinutes?: number;
    bookingHorizonDays?: number;
    allowSameDayBooking: boolean;
  } {
    const metadata = listing.metadata || {};

    return {
      minNoticeMinutes: metadata.minNoticeMinutes || 60,
      bookingHorizonDays: metadata.bookingHorizonDays || 90,
      allowSameDayBooking: metadata.allowSameDayBooking ?? true,
    };
  }

  /**
   * Extract opening hours from listing metadata
   */
  private extractOpeningHours(listing: any): OpeningHours {
    const metadata = listing.metadata || {};

    if (metadata.openingHours) {
      return metadata.openingHours;
    }

    return DEFAULT_OPENING_HOURS;
  }

  /**
   * Extract booking types from listing metadata
   */
  private extractBookingTypes(listing: any, selectedBookingType?: string): BookingTypeConfig[] {
    const metadata = listing.metadata || {};

    if (metadata.bookingTypes && Array.isArray(metadata.bookingTypes)) {
      const types = metadata.bookingTypes as BookingTypeConfig[];
      // If a specific type is selected, mark it as default
      if (selectedBookingType) {
        return types.map(t => ({
          ...t,
          default: t.code === selectedBookingType,
        }));
      }
      return types;
    }

    return DEFAULT_BOOKING_TYPES;
  }

  /**
   * Determine UI configuration based on granularity
   */
  private determineUIConfig(granularity: CalendarGranularity): CalendarUIConfig {
    switch (granularity) {
      case 'MULTI_DAY':
        return {
          showWeekView: false,
          showMonthView: true,
          showDayView: false,
          defaultView: 'month',
          allowMultiSelect: true,
        };
      case 'ALL_DAY':
        return {
          showWeekView: false,
          showMonthView: true,
          showDayView: false,
          defaultView: 'month',
          allowMultiSelect: false,
        };
      case 'TIME_SLOTS':
      default:
        return {
          showWeekView: true,
          showMonthView: true,
          showDayView: true,
          defaultView: 'week',
          allowMultiSelect: true,
        };
    }
  }

  /**
   * Determine permissions (RBAC)
   * In production, this would check user roles and listing-specific permissions
   */
  private determinePermissions(listing: any): CalendarPermissions {
    return {
      canViewCalendar: true,
      canSelectSlot: listing.status === 'published',
      canRequestBooking: listing.status === 'published',
    };
  }

  /**
   * Determine available actions based on listing state
   */
  private determineAvailableActions(listing: any): Action[] {
    const actions: Action[] = [];

    if (listing.status === 'published') {
      actions.push({
        code: 'SELECT_SLOT',
        labelKey: 'calendar.action.selectSlot',
        enabled: true,
      });
      actions.push({
        code: 'REQUEST_BOOKING',
        labelKey: 'calendar.action.requestBooking',
        enabled: true,
      });
    }

    return actions;
  }

  /**
   * Generate availability cells for the date range
   */
  private generateAvailabilityCells(
    listing: any,
    granularity: CalendarGranularity,
    fromDate: Date,
    toDate: Date,
    openingHours: OpeningHours,
    allocationResults: any[],
    bookingResults: any[]
  ): AvailabilityCell[] {
    const cells: AvailabilityCell[] = [];
    const metadata = listing.metadata || {};
    const slotSizeMinutes = granularity === 'TIME_SLOTS'
      ? (metadata.slotSizeMinutes || 60)
      : 1440;

    // Iterate through each day in the range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dayOfWeek = this.getDayOfWeek(currentDate);
      const dayHours = openingHours.weekly[dayOfWeek];

      // Check for exceptions (holidays, etc.)
      const dateStr = currentDate.toISOString().split('T')[0];
      const exception = openingHours.exceptions?.find((e: { date: string; closed: boolean; reasonKey?: string }) => e.date === dateStr);

      if (exception?.closed || dayHours?.closed) {
        // Entire day is closed
        cells.push({
          start: new Date(currentDate).toISOString(),
          end: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'CLOSED',
          reasonKey: exception?.reasonKey || 'calendar.reason.closed',
        });
      } else if (granularity === 'MULTI_DAY' || granularity === 'ALL_DAY') {
        // Generate day-level cells
        const dayStart = new Date(currentDate);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const status = this.determineCellStatus(
          dayStart,
          dayEnd,
          allocationResults,
          bookingResults
        );

        cells.push({
          start: dayStart.toISOString(),
          end: dayEnd.toISOString(),
          ...status,
        });
      } else {
        // Generate time slot cells
        const [openHour, openMin] = (dayHours?.open || '09:00').split(':').map(Number);
        const [closeHour, closeMin] = (dayHours?.close || '17:00').split(':').map(Number);

        const slotStart = new Date(currentDate);
        slotStart.setHours(openHour, openMin, 0, 0);

        const dayClose = new Date(currentDate);
        dayClose.setHours(closeHour, closeMin, 0, 0);

        while (slotStart < dayClose) {
          const slotEnd = new Date(slotStart.getTime() + slotSizeMinutes * 60 * 1000);

          if (slotEnd > dayClose) break;

          const status = this.determineCellStatus(
            slotStart,
            slotEnd,
            allocationResults,
            bookingResults
          );

          cells.push({
            start: new Date(slotStart).toISOString(),
            end: slotEnd.toISOString(),
            ...status,
          });

          slotStart.setTime(slotStart.getTime() + slotSizeMinutes * 60 * 1000);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return cells;
  }

  /**
   * Determine the status of a cell based on allocations and bookings
   */
  private determineCellStatus(
    start: Date,
    end: Date,
    allocationResults: any[],
    bookingResults: any[]
  ): Omit<AvailabilityCell, 'start' | 'end'> {
    // Check allocations first (blocks, blackouts have priority)
    for (const allocation of allocationResults) {
      const allocStart = new Date(allocation.startTime);
      const allocEnd = new Date(allocation.endTime);

      if (this.timeRangesOverlap(start, end, allocStart, allocEnd)) {
        const status = allocation.status?.toUpperCase();

        if (status === 'BLOCKED' || status === 'BLOCK') {
          return {
            status: 'BLOCKED',
            reasonKey: 'calendar.reason.blocked',
            blockId: allocation.id,
          };
        }

        if (status === 'BLACKOUT') {
          return {
            status: 'BLACKOUT',
            reasonKey: 'calendar.reason.blackout',
            blockId: allocation.id,
          };
        }
      }
    }

    // Check bookings
    for (const booking of bookingResults) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      if (this.timeRangesOverlap(start, end, bookingStart, bookingEnd)) {
        const status = booking.status?.toLowerCase();

        if (status === 'pending' || status === 'reserved') {
          return {
            status: 'RESERVED',
            reasonKey: 'calendar.reason.reserved',
            bookingId: booking.id,
          };
        }

        if (status === 'confirmed' || status === 'completed') {
          return {
            status: 'BOOKED',
            reasonKey: 'calendar.reason.booked',
            bookingId: booking.id,
          };
        }
      }
    }

    // Default to available
    return {
      status: 'AVAILABLE',
      reasonKey: null,
    };
  }

  /**
   * Check if two time ranges overlap
   */
  private timeRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Get day of week name from Date
   */
  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }
}
