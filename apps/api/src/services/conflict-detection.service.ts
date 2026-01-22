/**
 * Conflict Detection Service
 *
 * Detects and prevents booking conflicts
 */

import { db } from '../database/connection';
import { bookings } from '../database/schema';
import { and, eq, lt, gt, sql } from 'drizzle-orm';
import { webSocketService } from './websocket.service';

export interface ConflictCheck {
  rentalObjectId: string;
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
  includeBuffer?: boolean;
}

export interface Conflict {
  bookingId: string;
  conflictType: 'HARD' | 'SOFT' | 'BUFFER' | 'CAPACITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  overlapStart: Date;
  overlapEnd: Date;
  bookingTitle?: string;
  bookingUser?: string;
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  canOverride: boolean;
  suggestions?: Array<{
    alternativeTime?: Date;
    alternativeObject?: string;
  }>;
}

export class ConflictDetectionService {
  /**
   * Check for booking conflicts
   */
  async checkConflicts(check: ConflictCheck): Promise<ConflictCheckResult> {
    const { rentalObjectId, startTime, endTime, excludeBookingId } = check;

    // Query overlapping bookings - use Date objects directly for timestamp columns
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          lt(bookings.startTime, endTime),
          gt(bookings.endTime, startTime),
          excludeBookingId ? sql`${bookings.id} != ${excludeBookingId}` : sql`true`,
          // Only count confirmed/pending bookings
          sql`${bookings.status} IN ('CONFIRMED', 'PENDING')`
        )
      );

    const conflicts: Conflict[] = overlappingBookings.map(booking => ({
      bookingId: booking.id,
      conflictType: 'HARD' as const,
      severity: 'CRITICAL' as const,
      overlapStart: new Date(Math.max(new Date(booking.startTime).getTime(), startTime.getTime())),
      overlapEnd: new Date(Math.min(new Date(booking.endTime).getTime(), endTime.getTime())),
      bookingTitle: booking.notes || 'Untitled booking', // bookings table uses 'notes' not 'title'
    }));

    // TODO: Check buffer time conflicts if includeBuffer
    // TODO: Check capacity conflicts
    // TODO: Check activity conflicts

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      canOverride: false, // Admin can force book
      suggestions: conflicts.length > 0 ? await this.generateSuggestions(check) : undefined,
    };
  }

  /**
   * Record conflict in database
   * TODO: Implement when bookingConflicts table is defined in @digilist/database-schema
   */
  async recordConflict(
    bookingId1: string,
    bookingId2: string,
    rentalObjectId: string,
    conflictType: 'HARD' | 'SOFT' | 'BUFFER' | 'CAPACITY',
    _overlapStart: Date,
    _overlapEnd: Date
  ): Promise<string> {
    // Stub implementation - generate a stub ID and send WebSocket alert
    const stubId = `conflict-${Date.now()}`;
    const severity = conflictType === 'HARD' ? 'CRITICAL' : 'WARNING';

    // Send real-time alert
    webSocketService.sendConflictAlert(rentalObjectId, 'system', {
      type: 'CONFLICT_DETECTED',
      bookingId: bookingId1,
      conflictId: stubId,
      message: `Booking conflict detected: ${conflictType}`,
      severity: severity as 'INFO' | 'WARNING' | 'CRITICAL',
    });

    return stubId;
  }

  /**
   * Resolve conflict
   * TODO: Implement when bookingConflicts table is defined in @digilist/database-schema
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'CANCEL_NEW' | 'CANCEL_EXISTING' | 'FORCE_ACCEPT' | 'MODIFY_TIME',
    _resolvedBy: string,
    _notes?: string
  ): Promise<void> {
    // Stub implementation - just broadcast resolution
    webSocketService.sendConflictAlert('unknown', 'system', {
      type: 'CONFLICT_RESOLVED',
      bookingId: 'unknown',
      conflictId: conflictId,
      message: `Conflict resolved: ${resolution}`,
      severity: 'INFO',
    });
  }

  /**
   * Generate alternative suggestions
   */
  private async generateSuggestions(_check: ConflictCheck): Promise<Array<{
    alternativeTime?: Date;
    alternativeObject?: string;
  }>> {
    // TODO: Implement smart suggestions
    // - Find next available slot
    // - Suggest similar rental objects
    // - Optimize based on user preferences

    return [];
  }

  /**
   * Get unresolved conflicts for rental object
   * TODO: Implement when bookingConflicts table is defined in @digilist/database-schema
   */
  async getUnresolvedConflicts(_rentalObjectId: string): Promise<any[]> {
    // Stub implementation - return empty array
    return [];
  }

  /**
   * Get conflict statistics
   * TODO: Implement when bookingConflicts table is defined in @digilist/database-schema
   */
  async getConflictStats(_tenantId?: string): Promise<{
    total: number;
    resolved: number;
    pending: number;
    byType: Record<string, number>;
  }> {
    // Stub implementation - return zeros
    return {
      total: 0,
      resolved: 0,
      pending: 0,
      byType: {},
    };
  }
}

// Singleton instance
export const conflictDetectionService = new ConflictDetectionService();
