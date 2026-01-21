/**
 * Seasons Service (GAP-015)
 * Business logic for season rentals
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Injectable, Inject } from '../../core/decorators';

interface ApplyForSeasonRequest {
  orgId?: string;
  preferredSlots: Array<{
    dayOfWeek: number;
    startTime: string;
    rank: number;
  }>;
  notes?: string;
}

@Injectable()
export class SeasonsService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Get season by ID
   * Returns SeasonDTO
   */
  async getSeason(seasonId: string): Promise<any> {
    // TODO: Load from database
    
    return {
      id: seasonId,
      rentalObjectId: 'rental-object-id',
      name: { nb: 'Sesongutleie Vår 2026', en: 'Season Rental Spring 2026' },
      description: { nb: 'Sesongutleie for våren 2026', en: 'Season rental for spring 2026' },
      startDate: '2026-03-01',
      endDate: '2026-06-30',
      totalSlots: 10,
      slotsAvailable: 3,
      slotDuration: {
        frequency: 'WEEKLY',
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        startTime: '18:00',
        endTime: '20:00',
      },
      applicationOpenDate: '2026-01-15',
      applicationCloseDate: '2026-02-15',
      applicationsCount: 7,
      priceCents: 500000, // 5000 NOK
      currency: 'NOK',
      paymentSchedule: 'UPFRONT',
      status: 'OPEN',
      eligibility: {
        requiresOrgMembership: true,
        allowedOrgTypes: ['IDRETT'],
        residencyRequired: true,
      },
    };
  }

  /**
   * Apply for season
   * Returns SeasonApplicationDTO
   */
  async apply(seasonId: string, userId: string, request: ApplyForSeasonRequest): Promise<any> {
    const applicationId = `app_${Date.now()}`;
    
    // TODO: Validate eligibility and create application
    
    this.adapters?.log?.info('Season application created', { applicationId, seasonId, userId });
    
    return {
      id: applicationId,
      seasonId,
      userId,
      orgId: request.orgId,
      preferredSlots: request.preferredSlots,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
  }

  /**
   * Get season allocations
   * Returns SeasonAllocationDTO
   */
  async getAllocations(seasonId: string): Promise<any> {
    // TODO: Load allocations from database
    
    return {
      seasonId,
      stats: {
        totalSlots: 10,
        allocatedSlots: 7,
        pendingApplications: 3,
        waitlistedApplications: 0,
      },
      allocations: [
        {
          slotId: 'slot-1',
          dayOfWeek: 1, // Monday
          startTime: '18:00',
          endTime: '20:00',
          userId: 'user-1',
          userName: 'John Doe',
          orgId: 'org-1',
          orgName: 'Sports Club A',
          allocatedAt: '2026-02-16',
        },
      ],
    };
  }

  /**
   * List seasons for rental object
   * Returns SeasonDTO[]
   */
  async listSeasons(rentalObjectId: string): Promise<any[]> {
    // TODO: Load from database with rental object filter
    
    return [];
  }

  // ==========================================================================
  // Season Venue Management
  // ==========================================================================

  /**
   * List venues (rental objects) linked to a season
   */
  async listVenues(seasonId: string): Promise<any[]> {
    // Query season_venues join table with rental object details
    const result = await this.db.query.seasonVenues?.findMany({
      where: (sv: any, { eq }: any) => eq(sv.seasonId, seasonId),
      with: {
        rentalObject: {
          columns: { id: true, name: true },
        },
      },
    });
    
    return result ?? [];
  }

  /**
   * Add venue to season
   */
  async addVenue(seasonId: string, rentalObjectId: string): Promise<any> {
    const id = `sv_${Date.now()}`;
    
    // Check if already exists
    const existing = await this.db.query.seasonVenues?.findFirst({
      where: (sv: any, { and, eq }: any) => 
        and(eq(sv.seasonId, seasonId), eq(sv.rentalObjectId, rentalObjectId)),
    });
    
    if (existing) {
      return existing;
    }
    
    // Insert new season venue link
    const inserted = await this.db.insert?.(this.db.schema?.seasonVenues).values({
      id,
      seasonId,
      rentalObjectId,
      createdAt: new Date(),
    }).returning?.();
    
    return inserted?.[0] ?? { id, seasonId, rentalObjectId, createdAt: new Date().toISOString() };
  }

  /**
   * Remove venue from season
   */
  async removeVenue(seasonId: string, rentalObjectId: string): Promise<void> {
    await this.db.delete?.(this.db.schema?.seasonVenues).where(
      (sv: any, { and, eq }: any) => 
        and(eq(sv.seasonId, seasonId), eq(sv.rentalObjectId, rentalObjectId))
    );
  }
}

