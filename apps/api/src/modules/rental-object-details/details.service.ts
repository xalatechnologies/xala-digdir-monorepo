/**
 * RENTAL OBJECT DETAILS SERVICE
 * 
 * Unified projection endpoint that replaces 10+ API calls.
 * Returns comprehensive rental object details with opt-in expansions.
 * 
 * Query parameter: ?expand=pricing,amenities,addons,availability,metadata,seo,geo
 * 
 * This is the "Zero Transformer" pattern - server returns everything
 * pre-computed, frontend just renders.
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../database/connection';
import { rentalObjects } from '../../database/schema';
import type {
  RentalObjectDTO,
  RentalObjectDetailsDTO,
  RentalObjectPricingDTO,
  AddOnDTO,
  AmenityDTO,
  MetadataValueDTO,
  OpeningHoursDTO,
  ExceptionDayDTO,
  SeoMetadataDTO,
  GeoAreaDTO,
  GeoCoordinatesDTO,
} from '../../types/dtos';
import { PricingService } from '../pricing/pricing.service';
import { AddOnsService } from '../addons/addons.service';
import { AmenitiesService } from '../amenities/amenities.service';
import { AvailabilityService } from '../availability/availability.service';

export class RentalObjectDetailsService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly addonsService: AddOnsService,
    private readonly amenitiesService: AmenitiesService,
    private readonly availabilityService: AvailabilityService
  ) {}

  /**
   * Get comprehensive rental object details
   * 
   * @param expand - Comma-separated list: pricing,amenities,addons,availability,metadata,seo,geo
   */
  async getDetails(
    rentalObjectId: string,
    tenantId: string,
    expand?: string
  ): Promise<RentalObjectDetailsDTO> {
    const expansions = expand ? expand.split(',').map(e => e.trim()) : [];

    // 1. Get core rental object
    const [rentalObject] = await db
      .select()
      .from(rentalObjects)
      .where(
        and(
          eq(rentalObjects.id, rentalObjectId),
          eq(rentalObjects.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!rentalObject) {
      throw new Error('Rental object not found');
    }

    const core: RentalObjectDTO = {
      id: rentalObject.id,
      tenantId: rentalObject.tenantId,
      categoryKey: rentalObject.typeCode, // Assuming typeCode is category
      categoryName: this.getCategoryName(rentalObject.typeCode),
      typeCode: rentalObject.typeCode,
      timeMode: rentalObject.timeMode || 'PERIOD',
      title: rentalObject.title,
      slug: rentalObject.slug,
      description: rentalObject.description,
      address: rentalObject.address,
      postalCode: rentalObject.postalCode,
      city: rentalObject.city,
      capacity: rentalObject.capacity,
      images: [], // TODO: Load from attachments
      status: rentalObject.status,
      publishedAt: rentalObject.publishedAt?.toISOString(),
      createdAt: rentalObject.createdAt.toISOString(),
      updatedAt: rentalObject.updatedAt.toISOString(),
    };

    // 2. Build response with optional expansions
    const details: RentalObjectDetailsDTO = {
      core,
      _expanded: expansions,
    };

    // 3. Load expanded sections
    if (expansions.includes('pricing')) {
      const pricingData = await this.pricingService.getRentalObjectPricing(
        rentalObjectId,
        tenantId
      );

      details.pricing = {
        groups: pricingData,
        rules: [], // TODO: Load price rules
        deposits: pricingData
          .filter(p => p.requiresDeposit && p.depositAmount)
          .map(p => ({
            amount: p.depositAmount!,
            refundable: true, // TODO: Make configurable
          })),
      };
    }

    if (expansions.includes('addons')) {
      details.addons = await this.addonsService.getAddOnsForRentalObject(
        rentalObjectId,
        tenantId
      );
    }

    if (expansions.includes('amenities')) {
      const amenities = await this.amenitiesService.getAmenitiesForRentalObject(
        rentalObjectId,
        tenantId
      );

      // Group by category
      const grouped: Record<string, AmenityDTO[]> = {};
      amenities.forEach(amenity => {
        const group = amenity.groupCode || 'other';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(amenity);
      });

      details.amenities = {
        grouped,
        flat: amenities,
      };
    }

    if (expansions.includes('availability')) {
      const openingHours = await this.availabilityService.getOpeningHours(
        rentalObjectId,
        tenantId
      );

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const exceptions = await this.availabilityService.getExceptionDays(
        rentalObjectId,
        tenantId,
        now,
        nextMonth
      );

      details.availability = {
        openingHours,
        exceptions,
        nextAvailable: this.calculateNextAvailable(openingHours, exceptions),
      };
    }

    if (expansions.includes('metadata')) {
      details.metadata = await this.loadMetadata(rentalObjectId, tenantId);
    }

    if (expansions.includes('seo')) {
      details.seo = await this.loadSeo(rentalObjectId, tenantId);
    }

    if (expansions.includes('geo')) {
      details.geo = await this.loadGeo(rentalObject);
    }

    return details;
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  private getCategoryName(categoryKey: string): string {
    // TODO: Load from categories table with localization
    const categories: Record<string, string> = {
      CABIN: 'Hytte',
      BOAT: 'Båt',
      SPORTS_FACILITY: 'Idrettsanlegg',
      MEETING_ROOM: 'Møterom',
    };
    return categories[categoryKey] || categoryKey;
  }

  private calculateNextAvailable(
    openingHours: OpeningHoursDTO[],
    exceptions: ExceptionDayDTO[]
  ): string | undefined {
    const now = new Date();
    const today = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Find next open day
    for (let i = 0; i < 7; i++) {
      const checkDay = ((today + i) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const hours = openingHours.find(h => h.dayOfWeek === checkDay);

      if (hours && !hours.isClosed) {
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);
        return nextDate.toISOString().split('T')[0];
      }
    }

    return undefined;
  }

  private async loadMetadata(
    rentalObjectId: string,
    tenantId: string
  ): Promise<Record<string, MetadataValueDTO>> {
    // TODO: Load from rental_object_metadata
    return {};
  }

  private async loadSeo(
    rentalObjectId: string,
    tenantId: string
  ): Promise<SeoMetadataDTO> {
    // TODO: Load from seo_metadata table
    return {
      metaTitle: undefined,
      metaDescription: undefined,
      metaKeywords: [],
      ogImage: undefined,
    };
  }

  private async loadGeo(rentalObject: any): Promise<{
    area?: GeoAreaDTO;
    coordinates?: GeoCoordinatesDTO;
  }> {
    // TODO: Load from geo tables
    return {};
  }
}
