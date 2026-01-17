/**
 * Booking Contracts Service
 * Business logic for contract-first booking endpoints
 * 
 * Implements price preview and recurring conflict detection.
 * All UI logic driven by these DTOs (Contract-First).
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { Injectable, Inject } from '../../core/decorators';
import { BadRequestError } from '../../core/errors/problem-details';

interface PricePreviewRequest {
  rentalObjectId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  context: 'PRIVATE' | 'MEMBERSHIP_ORG';
  contextOrgId?: string;
  addonIds?: string[];
}

interface RecurringPreviewRequest {
  rentalObjectId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  daysOfWeek?: number[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxOccurrences?: number;
}

@Injectable()
export class BookingContractsService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Preview booking price with complete breakdown
   * Returns PricePreviewDTO
   */
  async previewPrice(request: PricePreviewRequest): Promise<any> {
    // Validate date range
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    if (end < start) {
      throw new BadRequestError('endDate must be after startDate');
    }
    
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      throw new BadRequestError('Date range cannot exceed 365 days');
    }
    
    // Validate org context
    if (request.context === 'MEMBERSHIP_ORG' && !request.contextOrgId) {
      throw new BadRequestError('contextOrgId is required when context is MEMBERSHIP_ORG');
    }
    
    // TODO: Real pricing calculation with rental object lookup
    // For now, return demo data with proper structure
    
    const basePriceCents = 50000; // 500 NOK
    const discountPercent = request.context === 'MEMBERSHIP_ORG' ? 20 : 0;
    const discountCents = Math.floor(basePriceCents * (discountPercent / 100));
    
    const breakdown = [
      {
        label: 'Basispris (2 timer)',
        amountCents: basePriceCents,
        type: 'BASE' as const,
        description: 'Grunnpris for leie',
      },
    ];
    
    if (discountCents > 0) {
      breakdown.push({
        label: 'Medlemsrabatt (20%)',
        amountCents: -discountCents,
        type: 'DISCOUNT' as any,
        description: 'Organisasjonsmedlem rabatt',
      });
    }

    return {
      rentalObjectId: request.rentalObjectId,
      basePriceCents,
      breakdown,
      totalCents: basePriceCents - discountCents,
      depositCents: 0,
      currency: 'NOK',
      pricingGroupApplied: request.context === 'MEMBERSHIP_ORG' ? 'ORG_MEMBER' : 'CITIZEN',
      context: request.context,
      contextOrgId: request.contextOrgId,
      discountsApplied: discountCents > 0 ? [{
        code: 'ORG_MEMBER',
        name: 'Medlemsrabatt',
        amountCents: discountCents,
        reason: 'Organisasjonsmedlemskap',
      }] : [],
    };
  }

  /**
   * Preview recurring booking with conflict detection
   * Returns RecurringPreviewDTO
   */
  async previewRecurring(request: RecurringPreviewRequest): Promise<any> {
    // Validate date range
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    if (end < start) {
      throw new BadRequestError('endDate must be after startDate');
    }
    
    // Validate time range
    const [startHour, startMin] = request.startTime.split(':').map(Number);
    const [endHour, endMin] = request.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      throw new BadRequestError('endTime must be after startTime');
    }
    
    // Validate weekly frequency has days
    if (request.frequency === 'WEEKLY' && (!request.daysOfWeek || request.daysOfWeek.length === 0)) {
      throw new BadRequestError('daysOfWeek is required for WEEKLY frequency');
    }
    
    // Generate occurrences
    const occurrences = this.generateOccurrences(request);
    
    if (occurrences.length === 0) {
      throw new BadRequestError('No valid occurrences found for the given pattern');
    }
    
    // TODO: Real conflict detection from database
    // For now, simulate some conflicts
    const results = occurrences.map((date, index) => ({
      date,
      startTime: request.startTime,
      endTime: request.endTime,
      status: index % 5 === 0 ? ('CONFLICT' as const) : ('AVAILABLE' as const),
      conflictReason: index % 5 === 0 ? 'Existing booking found' : undefined,
      conflictType: index % 5 === 0 ? ('EXISTING_BOOKING' as const) : undefined,
      alternatives: index % 5 === 0 ? [
        {
          startTime: '14:00',
          endTime: '16:00',
          available: true,
        },
      ] : undefined,
    }));

    const conflicts = results.filter((r) => r.status === 'CONFLICT').length;
    const available = results.filter((r) => r.status === 'AVAILABLE').length;

    return {
      pattern: {
        frequency: request.frequency,
        interval: request.interval,
        daysOfWeek: request.daysOfWeek,
        startDate: request.startDate,
        endDate: request.endDate,
        occurrences: results.length,
      },
      results,
      summary: {
        total: results.length,
        available,
        conflicts,
        blocked: 0,
        canProceedStrict: conflicts === 0,
        canProceedWithSkips: conflicts < results.length / 2,
        wouldSkip: conflicts,
      },
    };
  }

  /**
   * Generate occurrence dates based on recurring pattern
   */
  private generateOccurrences(request: RecurringPreviewRequest): string[] {
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const occurrences: string[] = [];
    
    const current = new Date(start);
    let count = 0;
    const maxOccurrences = request.maxOccurrences || 100;

    while (current <= end && count < maxOccurrences) {
      // Simple weekly frequency for demo
      if (request.frequency === 'WEEKLY') {
        const dayOfWeek = current.getDay();
        if (!request.daysOfWeek || request.daysOfWeek.includes(dayOfWeek)) {
          occurrences.push(current.toISOString().split('T')[0]);
          count++;
        }
      }
      
      // Move to next occurrence
      if (request.frequency === 'DAILY') {
        current.setDate(current.getDate() + request.interval);
      } else if (request.frequency === 'WEEKLY') {
        current.setDate(current.getDate() + 1);
      } else if (request.frequency === 'MONTHLY') {
        current.setMonth(current.getMonth() + request.interval);
      }
    }

    return occurrences;
  }
}
