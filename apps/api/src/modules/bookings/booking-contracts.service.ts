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
    // TODO: Real pricing calculation
    // For now, return minimal DTO structure
    
    const basePriceCents = 50000; // 500 NOK
    const breakdown = [
      {
        label: 'Basispris (2 timer)',
        amountCents: basePriceCents,
        type: 'BASE' as const,
        description: 'Grunnpris for leie',
      },
    ];

    return {
      rentalObjectId: request.rentalObjectId,
      basePriceCents,
      breakdown,
      totalCents: basePriceCents,
      depositCents: 0,
      currency: 'NOK',
      pricingGroupApplied: request.context === 'MEMBERSHIP_ORG' ? 'ORG_MEMBER' : 'CITIZEN',
      context: request.context,
      contextOrgId: request.contextOrgId,
      discountsApplied: [],
    };
  }

  /**
   * Preview recurring booking with conflict detection
   * Returns RecurringPreviewDTO
   */
  async previewRecurring(request: RecurringPreviewRequest): Promise<any> {
    // TODO: Real conflict detection
    // For now, return minimal DTO structure with sample conflicts
    
    const occurrences = this.generateOccurrences(request);
    
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
    
    let current = new Date(start);
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
