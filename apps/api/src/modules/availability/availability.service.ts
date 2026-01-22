/**
 * AVAILABILITY SERVICE
 * 
 * Business logic for availability management and checking.
 * 
 * Features:
 * - Opening hours (weekly schedule)
 * - Exception days (holidays, closures)
 * - Availability calendar (monthly view with slots)
 * - Conflict checking (bookings + blocks)
 * - Time slot validation
 */

import { eq, and, between, or, gte, lte } from 'drizzle-orm';
import { db } from '../../database/connection';
import {
  bookings,
  blocks,
} from '../../database/schema';
import type {
  OpeningHoursDTO,
  ExceptionDayDTO,
  AvailabilityCalendarDTO,
  AvailabilityDayDTO,
  BookingSlotDTO,
} from '../../types/dtos';

// AuditService interface for type safety
interface AuditService {
  log(params: {
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
  }): Promise<void>;
}

// Alias for blocks table used in availability checks
const timeBlocks = blocks;

export class AvailabilityService {
  constructor(private readonly auditService: AuditService) {}

  // =====================================================================
  // OPENING HOURS
  // =====================================================================

  /**
   * Get opening hours for rental object
   * TODO: Implement when openingHours table is defined in @digilist/database-schema
   */
  async getOpeningHours(_rentalObjectId: string, _tenantId: string): Promise<OpeningHoursDTO[]> {
    // Return default opening hours (Mon-Fri 8:00-20:00, Sat-Sun closed)
    // until openingHours table is implemented in the schema
    return [
      { rentalObjectId: _rentalObjectId, dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 1, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 2, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 3, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 4, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 5, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { rentalObjectId: _rentalObjectId, dayOfWeek: 6, openTime: '00:00', closeTime: '00:00', isClosed: true },
    ];
  }

  /**
   * Set opening hours (bulk replace)
   * TODO: Implement when openingHours table is defined in @digilist/database-schema
   */
  async setOpeningHours(
    rentalObjectId: string,
    hours: Array<{
      dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>,
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Stub implementation - log the intent but don't persist
    // until openingHours table is implemented in the schema
    await this.auditService.log({
      tenantId,
      userId,
      action: 'rental_object.opening_hours_updated',
      entityType: 'rental_object',
      entityId: rentalObjectId,
      newValue: { hours, _stub: true },
    });
  }

  // =====================================================================
  // EXCEPTION DAYS
  // =====================================================================

  /**
   * Get exception days for rental object
   * TODO: Implement when exceptionDays table is defined in @digilist/database-schema
   */
  async getExceptionDays(
    _rentalObjectId: string,
    _tenantId: string,
    _fromDate?: Date,
    _toDate?: Date
  ): Promise<ExceptionDayDTO[]> {
    // Return empty array until exceptionDays table is implemented in the schema
    return [];
  }

  /**
   * Add exception day
   * TODO: Implement when exceptionDays table is defined in @digilist/database-schema
   */
  async addExceptionDay(
    data: {
      rentalObjectId: string;
      date: string; // YYYY-MM-DD
      reason: string;
      isClosed: boolean;
      openTime?: string;
      closeTime?: string;
    },
    tenantId: string,
    userId: string
  ): Promise<ExceptionDayDTO> {
    // Stub implementation - return the data as if created
    // until exceptionDays table is implemented in the schema
    const stubId = `stub-${Date.now()}`;

    await this.auditService.log({
      tenantId,
      userId,
      action: 'exception_day.created',
      entityType: 'exception_day',
      entityId: stubId,
      newValue: { ...data, _stub: true },
    });

    return {
      id: stubId,
      rentalObjectId: data.rentalObjectId,
      date: data.date,
      reason: data.reason,
      isClosed: data.isClosed,
      openTime: data.openTime,
      closeTime: data.closeTime,
    };
  }

  /**
   * Remove exception day
   * TODO: Implement when exceptionDays table is defined in @digilist/database-schema
   */
  async removeExceptionDay(id: string, tenantId: string, userId: string): Promise<void> {
    // Stub implementation - log the intent but don't persist
    // until exceptionDays table is implemented in the schema
    await this.auditService.log({
      tenantId,
      userId,
      action: 'exception_day.deleted',
      entityType: 'exception_day',
      entityId: id,
      oldValue: { _stub: true },
    });
  }

  // =====================================================================
  // AVAILABILITY CALENDAR
  // =====================================================================

  /**
   * Get availability calendar for month
   */
  async getAvailabilityCalendar(
    rentalObjectId: string,
    month: string, // '2026-01'
    tenantId: string
  ): Promise<AvailabilityCalendarDTO> {
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    // Get opening hours
    const hours = await this.getOpeningHours(rentalObjectId, tenantId);

    // Get exception days for month
    const exceptions = await this.getExceptionDays(rentalObjectId, tenantId, firstDay, lastDay);

    // Get bookings for month
    const monthBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          eq(bookings.tenantId, tenantId),
          or(
            between(bookings.startTime, firstDay, lastDay),
            between(bookings.endTime, firstDay, lastDay)
          ),
          eq(bookings.status, 'CONFIRMED')
        )
      );

    // Get blocks for month
    const monthBlocks = await db
      .select()
      .from(timeBlocks)
      .where(
        and(
          eq(timeBlocks.rentalObjectId, rentalObjectId),
          eq(timeBlocks.tenantId, tenantId),
          or(
            between(timeBlocks.startDate, firstDay, lastDay),
            between(timeBlocks.endDate, firstDay, lastDay)
          )
        )
      );

    // Generate calendar days
    const days: AvailabilityDayDTO[] = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthNum - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

      days.push(
        this.calculateDayAvailability(
          dateStr,
          dayOfWeek,
          hours,
          exceptions,
          monthBookings,
          monthBlocks
        )
      );
    }

    return {
      rentalObjectId,
      month,
      days,
      blocks: monthBlocks.map(this.toTimeBlockDTO),
      bookings: monthBookings.map(this.toBookingSlotDTO),
    };
  }

  /**
   * Check if time slot is available
   */
  async checkAvailability(
    rentalObjectId: string,
    startTime: Date,
    endTime: Date,
    tenantId: string
  ): Promise<{ available: boolean; reason?: string }> {
    // 1. Check opening hours
    const dayOfWeek = startTime.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const dateStr = startTime.toISOString().split('T')[0];

    const hours = await this.getOpeningHours(rentalObjectId, tenantId);
    const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek);

    if (!dayHours || dayHours.isClosed) {
      return { available: false, reason: 'Stengt denne dagen' };
    }

    // 2. Check exceptions
    const exceptions = await this.getExceptionDays(rentalObjectId, tenantId, startTime, endTime);
    const exception = exceptions.find(e => e.date === dateStr);

    if (exception && exception.isClosed) {
      return { available: false, reason: exception.reason };
    }

    // 3. Check booking conflicts
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          eq(bookings.tenantId, tenantId),
          or(
            and(gte(bookings.startTime, startTime), lte(bookings.startTime, endTime)),
            and(gte(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
            and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
          ),
          eq(bookings.status, 'CONFIRMED')
        )
      );

    if (conflictingBookings.length > 0) {
      return { available: false, reason: 'Allerede booket' };
    }

    // 4. Check time blocks
    const conflictingBlocks = await db
      .select()
      .from(timeBlocks)
      .where(
        and(
          eq(timeBlocks.rentalObjectId, rentalObjectId),
          eq(timeBlocks.tenantId, tenantId),
          or(
            and(gte(timeBlocks.startDate, startTime), lte(timeBlocks.startDate, endTime)),
            and(gte(timeBlocks.endDate, startTime), lte(timeBlocks.endDate, endTime)),
            and(lte(timeBlocks.startDate, startTime), gte(timeBlocks.endDate, endTime))
          )
        )
      );

    if (conflictingBlocks.length > 0) {
      return { available: false, reason: conflictingBlocks[0].reason || 'Blokkert' };
    }

    return { available: true };
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  private calculateDayAvailability(
    dateStr: string,
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    hours: OpeningHoursDTO[],
    exceptions: ExceptionDayDTO[],
    bookings: any[],
    blocks: any[]
  ): AvailabilityDayDTO {
    const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek);
    const exception = exceptions.find(e => e.date === dateStr);

    // Check if closed
    if (exception?.isClosed || dayHours?.isClosed) {
      return {
        date: dateStr,
        status: 'blocked',
        isBookable: false,
        reason: exception?.reason || 'Stengt',
      };
    }

    // Get opening hours (use exception override if exists)
    const openingHoursList = exception
      ? [{ start: exception.openTime!, end: exception.closeTime! }]
      : dayHours
      ? [{ start: dayHours.openTime, end: dayHours.closeTime }]
      : [];

    // Count bookings/blocks for this day
    const dayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });

    const dayBlocks = blocks.filter(b => {
      const blockDate = new Date(b.startDate).toISOString().split('T')[0];
      return blockDate === dateStr;
    });

    const totalConflicts = dayBookings.length + dayBlocks.length;

    // Determine status
    let status: 'available' | 'partial' | 'booked' | 'blocked' = 'available';
    if (totalConflicts > 0) {
      status = dayBlocks.length > 0 ? 'blocked' : totalConflicts >= 3 ? 'booked' : 'partial';
    }

    return {
      date: dateStr,
      status,
      openingHours: openingHoursList,
      availableSlots: Math.max(0, 10 - totalConflicts), // Simplified
      isBookable: status === 'available' || status === 'partial',
      reason: status === 'blocked' ? 'Blokkert av admin' : undefined,
    };
  }

  // =====================================================================
  // DTO MAPPERS
  // =====================================================================

  private toOpeningHoursDTO(hours: any): OpeningHoursDTO {
    return {
      rentalObjectId: hours.rentalObjectId,
      dayOfWeek: hours.dayOfWeek,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isClosed: hours.isClosed,
    };
  }

  private toExceptionDayDTO(exception: any): ExceptionDayDTO {
    return {
      id: exception.id,
      rentalObjectId: exception.rentalObjectId,
      date: exception.date,
      reason: exception.reason,
      isClosed: exception.isClosed,
      openTime: exception.openTime,
      closeTime: exception.closeTime,
    };
  }

  private toTimeBlockDTO(block: any) {
    return {
      id: block.id,
      tenantId: block.tenantId,
      rentalObjectId: block.rentalObjectId,
      blockType: block.visibility, // blocks table uses 'visibility' not 'blockType'
      startAt: block.startDate.toISOString(),
      endAt: block.endDate.toISOString(),
      reason: block.reason,
      createdBy: block.createdBy,
      createdAt: block.createdAt.toISOString(),
    };
  }

  private toBookingSlotDTO(booking: any): BookingSlotDTO {
    return {
      bookingId: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
      userName: undefined, // Privacy - don't expose
    };
  }
}
