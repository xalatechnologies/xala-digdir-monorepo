/**
 * Conflict Detection Service
 * 
 * Detects and prevents booking conflicts
 */

import { db } from '../database/connection';
import { bookings, bookingConflicts } from '../database/schema';
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
    const { rentalObjectId, startTime, endTime, excludeBookingId, includeBuffer } = check;

    // Query overlapping bookings
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          lt(bookings.startTime, endTime.toISOString()),
          gt(bookings.endTime, startTime.toISOString()),
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
      bookingTitle: booking.title || 'Untitled booking',
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
   */
  async recordConflict(
    bookingId1: string,
    bookingId2: string,
    rentalObjectId: string,
    conflictType: 'HARD' | 'SOFT' | 'BUFFER' | 'CAPACITY',
    overlapStart: Date,
    overlapEnd: Date
  ): Promise<string> {
    const [conflict] = await db
      .insert(bookingConflicts)
      .values({
        bookingId1,
        bookingId2,
        rentalObjectId,
        conflictType,
        severity: conflictType === 'HARD' ? 'CRITICAL' : 'WARNING',
        overlapStart: overlapStart.toISOString(),
        overlapEnd: overlapEnd.toISOString(),
        status: 'DETECTED',
      })
      .returning();

    // Send real-time alert
    webSocketService.sendConflictAlert(rentalObjectId, 'system', {
      type: 'CONFLICT_DETECTED',
      bookingId: bookingId1,
      conflictId: conflict.id,
      message: `Booking conflict detected: ${conflictType}`,
      severity: conflict.severity as any,
    });

    return conflict.id;
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'CANCEL_NEW' | 'CANCEL_EXISTING' | 'FORCE_ACCEPT' | 'MODIFY_TIME',
    resolvedBy: string,
    notes?: string
  ): Promise<void> {
    await db
      .update(bookingConflicts)
      .set({
        status: 'RESOLVED',
        resolutionAction: resolution,
        resolvedBy,
        resolvedAt: new Date().toISOString(),
        resolutionNotes: notes,
      })
      .where(eq(bookingConflicts.id, conflictId));

    // Broadcast resolution
    const [conflict] = await db
      .select()
      .from(bookingConflicts)
      .where(eq(bookingConflicts.id, conflictId))
      .limit(1);

    if (conflict) {
      webSocketService.sendConflictAlert(conflict.rentalObjectId, 'system', {
        type: 'CONFLICT_RESOLVED',
        bookingId: conflict.bookingId1,
        conflictId: conflict.id,
        message: `Conflict resolved: ${resolution}`,
        severity: 'INFO',
      });
    }
  }

  /**
   * Generate alternative suggestions
   */
  private async generateSuggestions(check: ConflictCheck): Promise<Array<{
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
   */
  async getUnresolvedConflicts(rentalObjectId: string): Promise<any[]> {
    return db
      .select()
      .from(bookingConflicts)
      .where(
        and(
          eq(bookingConflicts.rentalObjectId, rentalObjectId),
          eq(bookingConflicts.status, 'DETECTED')
        )
      );
  }

  /**
   * Get conflict statistics
   */
  async getConflictStats(tenantId?: string): Promise<{
    total: number;
    resolved: number;
    pending: number;
    byType: Record<string, number>;
  }> {
    // TODO: Implement with proper tenant filtering
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        resolved: sql<number>`count(*) filter (where status = 'RESOLVED')`,
        pending: sql<number>`count(*) filter (where status = 'DETECTED')`,
      })
      .from(bookingConflicts);

    return {
      total: stats.total,
      resolved: stats.resolved,
      pending: stats.pending,
      byType: {}, // TODO: Group by type
    };
  }
}

// Singleton instance
export const conflictDetectionService = new ConflictDetectionService();
