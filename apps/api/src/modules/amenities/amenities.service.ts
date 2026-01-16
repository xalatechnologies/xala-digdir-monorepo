/**
 * AMENITIES SERVICE
 * 
 * Business logic for amenity management.
 * Handles:
 * - Amenity CRUD (admin only)
 * - Amenity groups
 * - Rental object amenity assignment
 * 
 * Authorization:
 * - Read: All authenticated users
 * - Manage: TENANT_ADMIN, SUPER_ADMIN
 */

import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../database/connection';
import { 
  amenities,
  amenityGroups,
  rentalObjectAmenities,
} from '../../database/schema';
import type {
  AmenityDTO,
  AmenityGroupDTO,
} from '../../types/dtos';
import { PERMISSIONS } from '../../core/permissions';
import { AuditService } from '../../core/audit.service';

export class AmenitiesService {
  constructor(
    private readonly auditService: AuditService
  ) {}

  /**
   * List all amenities for tenant
   */
  async listAmenities(tenantId: string, userId: string): Promise<AmenityDTO[]> {
    const results = await db
      .select()
      .from(amenities)
      .where(
        and(
          eq(amenities.tenantId, tenantId),
          eq(amenities.isActive, true)
        )
      )
      .orderBy(amenities.groupCode, amenities.name);

    return results.map(this.toDTO);
  }

  /**
   * Get amenities grouped by category
   */
  async listAmenitiesByGroup(tenantId: string): Promise<AmenityGroupDTO[]> {
    const allAmenities = await db
      .select()
      .from(amenities)
      .where(
        and(
          eq(amenities.tenantId, tenantId),
          eq(amenities.isActive, true)
        )
      )
      .orderBy(amenities.groupCode, amenities.name);

    const groups = await db
      .select()
      .from(amenityGroups)
      .where(eq(amenityGroups.tenantId, tenantId));

    // Group amenities
    const grouped = new Map<string, AmenityDTO[]>();
    
    for (const amenity of allAmenities) {
      const groupCode = amenity.groupCode || 'other';
      if (!grouped.has(groupCode)) {
        grouped.set(groupCode, []);
      }
      grouped.get(groupCode)!.push(this.toDTO(amenity));
    }

    // Build response
    return groups.map(group => ({
      code: group.code,
      name: group.name,
      amenities: grouped.get(group.code) || [],
    }));
  }

  /**
   * Get single amenity
   */
  async getAmenity(id: string, tenantId: string): Promise<AmenityDTO | null> {
    const [result] = await db
      .select()
      .from(amenities)
      .where(
        and(
          eq(amenities.id, id),
          eq(amenities.tenantId, tenantId)
        )
      )
      .limit(1);

    return result ? this.toDTO(result) : null;
  }

  /**
   * Create amenity (admin only)
   */
  async createAmenity(
    data: {
      code: string;
      name: string;
      description?: string;
      groupCode?: string;
      iconKey?: string;
    },
    tenantId: string,
    userId: string
  ): Promise<AmenityDTO> {
    const [created] = await db
      .insert(amenities)
      .values({
        tenantId,
        code: data.code,
        name: data.name,
        description: data.description,
        groupCode: data.groupCode,
        iconKey: data.iconKey,
        isActive: true,
      })
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'amenity.created',
      entityType: 'amenity',
      entityId: created.id,
      newValue: created,
    });

    return this.toDTO(created);
  }

  /**
   * Update amenity (admin only)
   */
  async updateAmenity(
    id: string,
    data: {
      name?: string;
      description?: string;
      groupCode?: string;
      iconKey?: string;
      isActive?: boolean;
    },
    tenantId: string,
    userId: string
  ): Promise<AmenityDTO> {
    const [existing] = await db
      .select()
      .from(amenities)
      .where(
        and(
          eq(amenities.id, id),
          eq(amenities.tenantId, tenantId)
        )
      );

    if (!existing) {
      throw new Error('Amenity not found');
    }

    const [updated] = await db
      .update(amenities)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(amenities.id, id))
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'amenity.updated',
      entityType: 'amenity',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toDTO(updated);
  }

  /**
   * Delete amenity (soft delete)
   */
  async deleteAmenity(
    id: string,
    tenantId: string,
    userId: string
  ): Promise<void> {
    const [existing] = await db
      .select()
      .from(amenities)
      .where(
        and(
          eq(amenities.id, id),
          eq(amenities.tenantId, tenantId)
        )
      );

    if (!existing) {
      throw new Error('Amenity not found');
    }

    await db
      .update(amenities)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(amenities.id, id));

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'amenity.deleted',
      entityType: 'amenity',
      entityId: id,
      oldValue: existing,
    });
  }

  /**
   * Get amenities for rental object
   */
  async getAmenitiesForRentalObject(
    rentalObjectId: string,
    tenantId: string
  ): Promise<AmenityDTO[]> {
    const results = await db
      .select({
        amenity: amenities,
      })
      .from(rentalObjectAmenities)
      .innerJoin(
        amenities,
        eq(rentalObjectAmenities.amenityId, amenities.id)
      )
      .where(
        and(
          eq(rentalObjectAmenities.rentalObjectId, rentalObjectId),
          eq(rentalObjectAmenities.tenantId, tenantId)
        )
      );

    return results.map(r => this.toDTO(r.amenity));
  }

  /**
   * Assign amenities to rental object (bulk)
   */
  async assignAmenitiesToRentalObject(
    rentalObjectId: string,
    amenityIds: string[],
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Remove existing
    await db
      .delete(rentalObjectAmenities)
      .where(
        and(
          eq(rentalObjectAmenities.rentalObjectId, rentalObjectId),
          eq(rentalObjectAmenities.tenantId, tenantId)
        )
      );

    // Insert new
    if (amenityIds.length > 0) {
      await db
        .insert(rentalObjectAmenities)
        .values(
          amenityIds.map(amenityId => ({
            tenantId,
            rentalObjectId,
            amenityId,
          }))
        );
    }

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'rental_object.amenities_updated',
      entityType: 'rental_object',
      entityId: rentalObjectId,
      newValue: { amenityIds },
    });
  }

  /**
   * DTO Mapper
   */
  private toDTO(amenity: any): AmenityDTO {
    return {
      id: amenity.id,
      tenantId: amenity.tenantId,
      code: amenity.code,
      name: amenity.name,
      description: amenity.description,
      groupCode: amenity.groupCode,
      groupName: amenity.groupName, // TODO: Join from amenity_groups
      iconKey: amenity.iconKey,
      isActive: amenity.isActive,
    };
  }
}
