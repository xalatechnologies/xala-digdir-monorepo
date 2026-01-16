/**
 * PRICING SERVICE
 * 
 * Business logic for pricing management and quote calculation.
 * 
 * Features:
 * - Pricing groups (for different user segments)
 * - Rental object pricing (base prices per group)
 * - Quote calculator (booking price estimation)
 * - Discount/markup rules
 * - Tax calculation (25% MVA)
 * - Deposit calculation
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../database/connection';
import {
  pricingGroups,
  rentalObjectPricing,
  addons,
  rentalObjectAddons,
  userPricingGroups,
  organizationPricingGroups,
} from '../../database/schema';
import type {
  PricingGroupDTO,
  RentalObjectPricingDTO,
  BookingQuoteDTO,
  MoneyDTO,
  AddOnLineItemDTO,
  DiscountLineItemDTO,
  TaxLineItemDTO,
  PriceBreakdownDTO,
} from '../../types/dtos';
import { AuditService } from '../../core/audit.service';
import { AddOnsService } from '../addons/addons.service';

export class PricingService {
  constructor(
    private readonly auditService: AuditService,
    private readonly addonsService: AddOnsService
  ) {}

  // =====================================================================
  // PRICING GROUPS
  // =====================================================================

  async listPricingGroups(tenantId: string): Promise<PricingGroupDTO[]> {
    const results = await db
      .select()
      .from(pricingGroups)
      .where(and(eq(pricingGroups.tenantId, tenantId), eq(pricingGroups.isActive, true)))
      .orderBy(pricingGroups.name);

    return results.map(this.toPricingGroupDTO);
  }

  async getPricingGroup(id: string, tenantId: string): Promise<PricingGroupDTO | null> {
    const [result] = await db
      .select()
      .from(pricingGroups)
      .where(and(eq(pricingGroups.id, id), eq(pricingGroups.tenantId, tenantId)))
      .limit(1);

    return result ? this.toPricingGroupDTO(result) : null;
  }

  async createPricingGroup(
    data: { code: string; name: string; description?: string },
    tenantId: string,
    userId: string
  ): Promise<PricingGroupDTO> {
    const [created] = await db
      .insert(pricingGroups)
      .values({ tenantId, ...data, isActive: true })
      .returning();

    await this.auditService.log({
      tenantId,
      userId,
      action: 'pricing_group.created',
      entityType: 'pricing_group',
      entityId: created.id,
      newValue: created,
    });

    return this.toPricingGroupDTO(created);
  }

  async updatePricingGroup(
    id: string,
    data: { name?: string; description?: string; isActive?: boolean },
    tenantId: string,
    userId: string
  ): Promise<PricingGroupDTO> {
    const [existing] = await db
      .select()
      .from(pricingGroups)
      .where(and(eq(pricingGroups.id, id), eq(pricingGroups.tenantId, tenantId)));

    if (!existing) throw new Error('Pricing group not found');

    const [updated] = await db
      .update(pricingGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pricingGroups.id, id))
      .returning();

    await this.auditService.log({
      tenantId,
      userId,
      action: 'pricing_group.updated',
      entityType: 'pricing_group',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toPricingGroupDTO(updated);
  }

  // =====================================================================
  // RENTAL OBJECT PRICING
  // =====================================================================

  async getRentalObjectPricing(
    rentalObjectId: string,
    tenantId: string
  ): Promise<RentalObjectPricingDTO[]> {
    const results = await db
      .select({
        pricing: rentalObjectPricing,
        group: pricingGroups,
      })
      .from(rentalObjectPricing)
      .leftJoin(pricingGroups, eq(rentalObjectPricing.pricingGroupId, pricingGroups.id))
      .where(
        and(
          eq(rentalObjectPricing.rentalObjectId, rentalObjectId),
          eq(rentalObjectPricing.tenantId, tenantId)
        )
      );

    return results.map(r => this.toRentalObjectPricingDTO(r.pricing, r.group));
  }

  async setRentalObjectPricing(
    rentalObjectId: string,
    pricingData: Array<{
      pricingGroupId?: string;
      basePriceCents: number;
      discountPercentage?: number;
      requiresDeposit?: boolean;
      depositCents?: number;
    }>,
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Remove existing
    await db
      .delete(rentalObjectPricing)
      .where(
        and(
          eq(rentalObjectPricing.rentalObjectId, rentalObjectId),
          eq(rentalObjectPricing.tenantId, tenantId)
        )
      );

    // Insert new
    if (pricingData.length > 0) {
      await db.insert(rentalObjectPricing).values(
        pricingData.map(p => ({
          tenantId,
          rentalObjectId,
          pricingGroupId: p.pricingGroupId || null,
          basePriceCents: p.basePriceCents,
          discountPercentage: p.discountPercentage || null,
          requiresDeposit: p.requiresDeposit ?? false,
          depositCents: p.depositCents || null,
        }))
      );
    }

    await this.auditService.log({
      tenantId,
      userId,
      action: 'rental_object.pricing_updated',
      entityType: 'rental_object',
      entityId: rentalObjectId,
      newValue: { pricingData },
    });
  }

  // =====================================================================
  // QUOTE CALCULATOR
  // =====================================================================

  /**
   * Calculate booking quote with full pricing breakdown
   */
  async calculateQuote(
    data: {
      rentalObjectId: string;
      userId: string;
      organizationId?: string;
      startTime: Date;
      endTime: Date;
      addonSelections?: Array<{ addonId: string; quantity: number }>;
    },
    tenantId: string
  ): Promise<BookingQuoteDTO> {
    // 1. Calculate duration
    const durationMinutes = Math.ceil(
      (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
    );

    // 2. Resolve pricing group for user/org
    const pricingGroup = await this.resolvePricingGroup(
      data.userId,
      data.organizationId,
      tenantId
    );

    // 3. Get base price
    const basePriceCents = await this.getBasePriceForPricingGroup(
      data.rentalObjectId,
      pricingGroup?.id || null,
      tenantId
    );

    // 4. Calculate add-ons
    const addonLineItems = data.addonSelections
      ? await this.addonsService.calculateAddOnLineItems(
          data.addonSelections,
          durationMinutes,
          tenantId
        )
      : [];

    // 5. Calculate discounts
    const discounts = await this.calculateDiscounts(
      data.rentalObjectId,
      pricingGroup?.id || null,
      basePriceCents,
      durationMinutes,
      tenantId
    );

    // 6. Calculate subtotal
    const addonTotal = addonLineItems.reduce((sum, item) => sum + item.totalPrice.amount, 0);
    const discountTotal = discounts.reduce((sum, d) => sum + d.amount.amount, 0);
    const subtotalCents = basePriceCents + addonTotal - discountTotal;

    // 7. Calculate taxes (25% MVA)
    const taxRate = 0.25;
    const taxCents = Math.round(subtotalCents * taxRate);
    const taxes: TaxLineItemDTO[] = [
      {
        name: 'MVA 25%',
        rate: taxRate,
        amount: this.formatMoney(taxCents),
      },
    ];

    // 8. Calculate deposit
    const deposit = await this.calculateDeposit(
      data.rentalObjectId,
      pricingGroup?.id || null,
      subtotalCents,
      tenantId
    );

    // 9. Calculate total
    const totalCents = subtotalCents + taxCents;

    // 10. Build breakdown
    const breakdown: PriceBreakdownDTO[] = [
      {
        label: 'Grunnpris',
        amount: this.formatMoney(basePriceCents),
        isDiscount: false,
      },
      ...addonLineItems.map(addon => ({
        label: addon.addOnName,
        amount: addon.totalPrice,
        isDiscount: false,
      })),
      ...discounts.map(d => ({
        label: d.name,
        amount: d.amount,
        isDiscount: true,
      })),
      {
        label: 'MVA 25%',
        amount: this.formatMoney(taxCents),
        isDiscount: false,
      },
    ];

    return {
      rentalObjectId: data.rentalObjectId,
      userId: data.userId,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      durationMinutes,
      pricingGroup: pricingGroup || undefined,
      basePrice: this.formatMoney(basePriceCents),
      addons: addonLineItems,
      discounts,
      taxes,
      deposit: deposit || undefined,
      subtotal: this.formatMoney(subtotalCents),
      total: this.formatMoney(totalCents),
      breakdown,
      currency: 'NOK',
    };
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  private async resolvePricingGroup(
    userId: string,
    organizationId: string | undefined,
    tenantId: string
  ): Promise<PricingGroupDTO | null> {
    // Check org pricing group first
    if (organizationId) {
      const [orgPricing] = await db
        .select({ group: pricingGroups })
        .from(organizationPricingGroups)
        .innerJoin(pricingGroups, eq(organizationPricingGroups.pricingGroupId, pricingGroups.id))
        .where(
          and(
            eq(organizationPricingGroups.organizationId, organizationId),
            eq(organizationPricingGroups.tenantId, tenantId)
          )
        )
        .limit(1);

      if (orgPricing) return this.toPricingGroupDTO(orgPricing.group);
    }

    // Check user pricing group
    const [userPricing] = await db
      .select({ group: pricingGroups })
      .from(userPricingGroups)
      .innerJoin(pricingGroups, eq(userPricingGroups.pricingGroupId, pricingGroups.id))
      .where(and(eq(userPricingGroups.userId, userId), eq(userPricingGroups.tenantId, tenantId)))
      .limit(1);

    return userPricing ? this.toPricingGroupDTO(userPricing.group) : null;
  }

  private async getBasePriceForPricingGroup(
    rentalObjectId: string,
    pricingGroupId: string | null,
    tenantId: string
  ): Promise<number> {
    const [pricing] = await db
      .select()
      .from(rentalObjectPricing)
      .where(
        and(
          eq(rentalObjectPricing.rentalObjectId, rentalObjectId),
          eq(rentalObjectPricing.tenantId, tenantId),
          pricingGroupId
            ? eq(rentalObjectPricing.pricingGroupId, pricingGroupId)
            : eq(rentalObjectPricing.pricingGroupId, null) // Default pricing
        )
      )
      .limit(1);

    return pricing?.basePriceCents || 0;
  }

  private async calculateDiscounts(
    rentalObjectId: string,
    pricingGroupId: string | null,
    basePriceCents: number,
    durationMinutes: number,
    tenantId: string
  ): Promise<DiscountLineItemDTO[]> {
    const discounts: DiscountLineItemDTO[] = [];

    // Get pricing with discount percentage
    const [pricing] = await db
      .select()
      .from(rentalObjectPricing)
      .where(
        and(
          eq(rentalObjectPricing.rentalObjectId, rentalObjectId),
          eq(rentalObjectPricing.tenantId, tenantId),
          pricingGroupId
            ? eq(rentalObjectPricing.pricingGroupId, pricingGroupId)
            : eq(rentalObjectPricing.pricingGroupId, null)
        )
      )
      .limit(1);

    if (pricing?.discountPercentage) {
      const discountCents = Math.round(basePriceCents * (pricing.discountPercentage / 100));
      discounts.push({
        name: `Rabatt ${pricing.discountPercentage}%`,
        percentage: pricing.discountPercentage,
        amount: this.formatMoney(discountCents),
      });
    }

    // TODO: Add time-based discounts, multi-day discounts, etc.

    return discounts;
  }

  private async calculateDeposit(
    rentalObjectId: string,
    pricingGroupId: string | null,
    subtotalCents: number,
    tenantId: string
  ): Promise<MoneyDTO | null> {
    const [pricing] = await db
      .select()
      .from(rentalObjectPricing)
      .where(
        and(
          eq(rentalObjectPricing.rentalObjectId, rentalObjectId),
          eq(rentalObjectPricing.tenantId, tenantId),
          pricingGroupId
            ? eq(rentalObjectPricing.pricingGroupId, pricingGroupId)
            : eq(rentalObjectPricing.pricingGroupId, null)
        )
      )
      .limit(1);

    if (pricing?.requiresDeposit && pricing.depositCents) {
      return this.formatMoney(pricing.depositCents);
    }

    return null;
  }

  // =====================================================================
  // DTO MAP PERS
  // =====================================================================

  private toPricingGroupDTO(group: any): PricingGroupDTO {
    return {
      id: group.id,
      tenantId: group.tenantId,
      code: group.code,
      name: group.name,
      description: group.description,
      memberCount: group.memberCount,
      isActive: group.isActive,
    };
  }

  private toRentalObjectPricingDTO(pricing: any, group: any): RentalObjectPricingDTO {
    return {
      rentalObjectId: pricing.rentalObjectId,
      pricingGroupId: pricing.pricingGroupId,
      pricingGroupName: group?.name,
      basePriceCents: pricing.basePriceCents,
      basePrice: this.formatMoney(pricing.basePriceCents),
      discountPercentage: pricing.discountPercentage,
      requiresDeposit: pricing.requiresDeposit,
      depositAmount: pricing.depositCents ? this.formatMoney(pricing.depositCents) : undefined,
      taxRate: 0.25, // 25% MVA
    };
  }

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
