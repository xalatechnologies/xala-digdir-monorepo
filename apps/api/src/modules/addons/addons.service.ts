/**
 * ADD-ONS SERVICE
 * 
 * Business logic for add-on management.
 * Add-ons are optional extras for rental objects (e.g., cleaning, equipment).
 * 
 * Pricing models:
 * - PER_BOOKING: Flat fee per booking
 * - PER_HOUR: Hourly rate
 * - PER_DAY: Daily rate
 * - PER_UNIT: Quantity-based (e.g., chairs, tables)
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../database/connection';
import { 
  addons,
  rentalObjectAddons,
  bookingAddons,
} from '../../database/schema';
import type { AddOnDTO, AddOnLineItemDTO, MoneyDTO } from '../../types/dtos';
import { AuditService } from '../../core/audit.service';

export class AddOnsService {
  constructor(private readonly auditService: AuditService) {}

  /**
   * List all add-ons for tenant
   */
  async listAddOns(tenantId: string): Promise<AddOnDTO[]> {
    const results = await db
      .select()
      .from(addons)
      .where(
        and(
          eq(addons.tenantId, tenantId),
          eq(addons.isActive, true)
        )
      )
      .orderBy(addons.name);

    return results.map(this.toDTO);
  }

  /**
   * Get single add-on
   */
  async getAddOn(id: string, tenantId: string): Promise<AddOnDTO | null> {
    const [result] = await db
      .select()
      .from(addons)
      .where(and(eq(addons.id, id), eq(addons.tenantId, tenantId)))
      .limit(1);

    return result ? this.toDTO(result) : null;
  }

  /**
   * Create add-on (admin only)
   */
  async createAddOn(
    data: {
      code: string;
      name: string;
      description?: string;
      pricingModel: 'PER_BOOKING' | 'PER_HOUR' | 'PER_DAY' | 'PER_UNIT';
      basePriceCents: number;
      isRequired?: boolean;
      maxUnits?: number;
    },
    tenantId: string,
    userId: string
  ): Promise<AddOnDTO> {
    const [created] = await db
      .insert(addons)
      .values({
        tenantId,
        code: data.code,
        name: data.name,
        description: data.description,
        pricingModel: data.pricingModel,
        basePriceCents: data.basePriceCents,
        isRequired: data.isRequired ?? false,
        maxUnits: data.maxUnits,
        isActive: true,
      })
      .returning();

    await this.auditService.log({
      tenantId,
      userId,
      action: 'addon.created',
      entityType: 'addon',
      entityId: created.id,
      newValue: created,
    });

    return this.toDTO(created);
  }

  /**
   * Update add-on (admin only)
   */
  async updateAddOn(
    id: string,
    data: {
      name?: string;
      description?: string;
      basePriceCents?: number;
      isRequired?: boolean;
      maxUnits?: number;
      isActive?: boolean;
    },
    tenantId: string,
    userId: string
  ): Promise<AddOnDTO> {
    const [existing] = await db
      .select()
      .from(addons)
      .where(and(eq(addons.id, id), eq(addons.tenantId, tenantId)));

    if (!existing) {
      throw new Error('Add-on not found');
    }

    const [updated] = await db
      .update(addons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addons.id, id))
      .returning();

    await this.auditService.log({
      tenantId,
      userId,
      action: 'addon.updated',
      entityType: 'addon',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toDTO(updated);
  }

  /**
   * Delete add-on (soft delete)
   */
  async deleteAddOn(id: string, tenantId: string, userId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(addons)
      .where(and(eq(addons.id, id), eq(addons.tenantId, tenantId)));

    if (!existing) {
      throw new Error('Add-on not found');
    }

    await db
      .update(addons)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(addons.id, id));

    await this.auditService.log({
      tenantId,
      userId,
      action: 'addon.deleted',
      entityType: 'addon',
      entityId: id,
      oldValue: existing,
    });
  }

  /**
   * Get add-ons for rental object
   */
  async getAddOnsForRentalObject(
    rentalObjectId: string,
    tenantId: string
  ): Promise<AddOnDTO[]> {
    const results = await db
      .select({ addon: addons })
      .from(rentalObjectAddons)
      .innerJoin(addons, eq(rentalObjectAddons.addonId, addons.id))
      .where(
        and(
          eq(rentalObjectAddons.rentalObjectId, rentalObjectId),
          eq(rentalObjectAddons.tenantId, tenantId)
        )
      );

    return results.map(r => this.toDTO(r.addon));
  }

  /**
   * Assign add-ons to rental object (bulk)
   */
  async assignAddOnsToRentalObject(
    rentalObjectId: string,
    addonIds: string[],
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Remove existing
    await db
      .delete(rentalObjectAddons)
      .where(
        and(
          eq(rentalObjectAddons.rentalObjectId, rentalObjectId),
          eq(rentalObjectAddons.tenantId, tenantId)
        )
      );

    // Insert new
    if (addonIds.length > 0) {
      await db.insert(rentalObjectAddons).values(
        addonIds.map(addonId => ({
          tenantId,
          rentalObjectId,
          addonId,
        }))
      );
    }

    await this.auditService.log({
      tenantId,
      userId,
      action: 'rental_object.addons_updated',
      entityType: 'rental_object',
      entityId: rentalObjectId,
      newValue: { addonIds },
    });
  }

  /**
   * Calculate add-on line items for booking
   */
  async calculateAddOnLineItems(
    addonSelections: Array<{ addonId: string; quantity: number }>,
    durationMinutes: number,
    tenantId: string
  ): Promise<AddOnLineItemDTO[]> {
    const lineItems: AddOnLineItemDTO[] = [];

    for (const selection of addonSelections) {
      const addon = await this.getAddOn(selection.addonId, tenantId);
      if (!addon) continue;

      const quantity = selection.quantity;
      let unitPrice = addon.basePrice.amount;

      // Calculate based on pricing model
      switch (addon.pricingModel) {
        case 'PER_HOUR':
          unitPrice = Math.ceil(durationMinutes / 60) * addon.basePrice.amount;
          break;
        case 'PER_DAY':
          unitPrice = Math.ceil(durationMinutes / (24 * 60)) * addon.basePrice.amount;
          break;
        case 'PER_BOOKING':
        case 'PER_UNIT':
        default:
          // Use base price as-is
          break;
      }

      const totalPrice = unitPrice * quantity;

      lineItems.push({
        addOnId: addon.id,
        addOnName: addon.name,
        quantity,
        unitPrice: this.formatMoney(unitPrice),
        totalPrice: this.formatMoney(totalPrice),
      });
    }

    return lineItems;
  }

  /**
   * DTO Mapper
   */
  private toDTO(addon: any): AddOnDTO {
    return {
      id: addon.id,
      tenantId: addon.tenantId,
      code: addon.code,
      name: addon.name,
      description: addon.description,
      pricingModel: addon.pricingModel,
      basePrice: this.formatMoney(addon.basePriceCents),
      isRequired: addon.isRequired,
      maxUnits: addon.maxUnits,
      isActive: addon.isActive,
    };
  }

  /**
   * Format money (Norwegian format)
   */
  private formatMoney(cents: number): MoneyDTO {
    const amount = cents / 100;
    return {
      amount: cents,
      currency: 'NOK',
      formatted: new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK',
      }).format(amount),
    };
  }
}
