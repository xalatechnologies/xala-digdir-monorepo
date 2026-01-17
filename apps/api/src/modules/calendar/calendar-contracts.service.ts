/**
 * Calendar Contracts Service
 * Business logic for calendar views and blocks management
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { Injectable, Inject } from '../../core/decorators';
import { eq, and, gte, lte } from 'drizzle-orm';
import { blocks } from '../../database/schema/index';
import { BadRequestError, NotFoundError } from '../../core/errors/problem-details';

interface CreateBlockRequest {
  rentalObjectId: string;
  type: 'MAINTENANCE' | 'EVENT_PRIORITY' | 'CLOSED_DAY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  recurring?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    daysOfWeek?: number[];
    endDate?: string;
  };
  reason: string;
  notes?: string;
}

@Injectable()
export class CalendarContractsService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Get calendar data with availability status
   * Returns CalendarDataDTO
   */
  async getCalendar(
    rentalObjectId: string,
    view: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      throw new BadRequestError('endDate must be after startDate');
    }
    
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (view === 'DAY' && daysDiff > 1) {
      throw new BadRequestError('DAY view requires single day range');
    }
    if (view === 'WEEK' && daysDiff > 7) {
      throw new BadRequestError('WEEK view requires max 7 days range');
    }
    if (view === 'MONTH' && daysDiff > 31) {
      throw new BadRequestError('MONTH view requires max 31 days range');
    }

    // Load blocks for this period
    const rentalBlocks = await this.db
      .select()
      .from(blocks)
      .where(
        and(
          eq(blocks.rentalObjectId, rentalObjectId),
          gte(blocks.startDate, new Date(startDate)),
          lte(blocks.endDate, new Date(endDate)),
          eq(blocks.status, 'ACTIVE')
        )
      );
    
    const slots = this.generateTimeSlots(startDate, endDate);
    
    // Annotate slots with block information
    const annotatedSlots = slots.map((date) => {
      const dayBlocks = rentalBlocks.filter((block: any) => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);
        const slotDate = new Date(date);
        return slotDate >= blockStart && slotDate <= blockEnd;
      });

      if (dayBlocks.length > 0) {
        const block = dayBlocks[0];
        return {
          date,
          startTime: block.startTime || '00:00',
          endTime: block.endTime || '23:59',
          status: 'BLOCKED' as const,
          reason: block.reason,
          entityId: block.id,
          entityType: 'BLOCK' as const,
        };
      }

      return {
        date,
        startTime: '09:00',
        endTime: '17:00',
        status: 'AVAILABLE' as const,
      };
    });
    
    return {
      rentalObjectId,
      view,
      startDate,
      endDate,
      slots: annotatedSlots,
    };
  }

  /**
   * Create a maintenance or closure block
   * Returns BlockDTO
   */
  async createBlock(request: CreateBlockRequest): Promise<any> {
    // Validate date range
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    if (end < start) {
      throw new BadRequestError('endDate must be after startDate');
    }
    
    if (!request.reason || request.reason.trim().length === 0) {
      throw new BadRequestError('reason is required');
    }
    
    const [block] = await this.db
      .insert(blocks)
      .values({
        rentalObjectId: request.rentalObjectId,
        type: request.type,
        startDate: new Date(request.startDate),
        endDate: new Date(request.endDate),
        startTime: request.startTime,
        endTime: request.endTime,
        reason: request.reason,
        notes: request.notes,
        status: 'ACTIVE',
        metadata: request.recurring ? { recurring: request.recurring } : {},
      })
      .returning();
    
    this.adapters?.log?.info('Block created', { blockId: block.id, rentalObjectId: request.rentalObjectId });
    
    return {
      id: block.id,
      rentalObjectId: block.rentalObjectId,
      type: block.type,
      startDate: block.startDate.toISOString().split('T')[0],
      endDate: block.endDate.toISOString().split('T')[0],
      startTime: block.startTime,
      endTime: block.endTime,
      recurring: request.recurring,
      reason: block.reason,
      notes: block.notes,
      createdBy: 'system',
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    };
  }

  /**
   * List blocks for rental object
   */
  async listBlocks(
    rentalObjectId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const rentalBlocks = await this.db
      .select()
      .from(blocks)
      .where(
        and(
          eq(blocks.rentalObjectId, rentalObjectId),
          gte(blocks.startDate, new Date(startDate)),
          lte(blocks.endDate, new Date(endDate))
        )
      );
    
    return rentalBlocks.map((block: any) => ({
      id: block.id,
      rentalObjectId: block.rentalObjectId,
      type: block.type,
      startDate: block.startDate.toISOString().split('T')[0],
      endDate: block.endDate.toISOString().split('T')[0],
      startTime: block.startTime,
      endTime: block.endTime,
      reason: block.reason,
      notes: block.notes,
      createdBy: 'system',
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    }));
  }

  /**
   * Delete a block
   */
  async deleteBlock(id: string): Promise<void> {
    const result = await this.db
      .update(blocks)
      .set({ status: 'CANCELLED' })
      .where(eq(blocks.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new NotFoundError(`Block ${id} not found`);
    }
    
    this.adapters?.log?.info('Block deleted', { id });
  }

  /**
   * Generate date slots between start and end
   */
  private generateTimeSlots(startDate: string, endDate: string): string[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: string[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      slots.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return slots;
  }
}
