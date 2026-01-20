/**
 * Stub exports for API imports that tests depend on
 * These are minimal stubs to allow tests to compile and run
 */

// Type definitions
export interface DbRentalObject {
  id: string;
  tenantId: string;
  organizationId: string | null;
  name: string;
  slug: string;
  description: string | null;
  categoryKey: string;
  timeMode: string;
  features: string[];
  ruleSetKey: string | null;
  status: string;
  requiresApproval: boolean;
  capacity: number | null;
  inventoryTotal: number | null;
  images: string[];
  pricing: { basePrice: number; currency: string; unit: string; taxIncluded?: boolean; taxRate?: number } | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalObject {
  id: string;
  tenantId: string;
  organizationId: string | null;
  name: string;
  slug: string;
  description: string | null;
  category: { key: string; label: string };
  timeMode: string;
  features: string[];
  ruleSet: string | null;
  status: string;
  requiresApproval: boolean;
  capacity: { maximum: number | null; inventoryTotal: number | null };
  images: { url: string }[];
  pricing: { amount: number; currency: string; unit: string } | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Transformer functions
export function toDomain(db: DbRentalObject): RentalObject {
  return {
    id: db.id,
    tenantId: db.tenantId,
    organizationId: db.organizationId,
    name: db.name,
    slug: db.slug,
    description: db.description,
    category: { key: db.categoryKey, label: `sdk.rentalObject.category.${db.categoryKey}` },
    timeMode: db.timeMode,
    features: db.features,
    ruleSet: db.ruleSetKey,
    status: db.status.toUpperCase(),
    requiresApproval: db.requiresApproval,
    capacity: { maximum: db.capacity, inventoryTotal: db.inventoryTotal },
    images: db.images.map(url => ({ url })),
    pricing: db.pricing ? { amount: db.pricing.basePrice, currency: db.pricing.currency, unit: db.pricing.unit } : null,
    metadata: db.metadata,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
}

export function toCardProjection(domain: RentalObject): Record<string, any> {
  const address = domain.metadata?.address || {};
  return {
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
    type: domain.category.key,
    typeLabel: domain.category.label,
    tenantId: domain.tenantId,
    capacity: domain.capacity.maximum,
    priceAmount: domain.pricing?.amount || 0,
    priceDisplay: domain.pricing ? `${domain.pricing.amount} ${domain.pricing.currency}` : '',
    locationFormatted: [address.street, address.postalCode, address.city].filter(Boolean).join(', '),
    image: domain.images[0]?.url || null,
  };
}

export function toDetailsProjection(
  domain: RentalObject,
  permissions?: { canBook?: boolean; canEdit?: boolean; canViewPricing?: boolean; availableActions?: string[] }
): Record<string, any> {
  const contact = domain.metadata?.contact || {};
  const address = domain.metadata?.address || {};
  const openingHours = domain.metadata?.openingHours || [];
  return {
    ...toCardProjection(domain),
    description: domain.description,
    addressStreet: address.street,
    contactName: contact.name,
    contactEmail: contact.email,
    contactPhone: contact.phone,
    openingHours: openingHours.map((h: any) => ({
      day: `sdk.weekday.${h.dayIndex}`,
      open: h.openTime,
      close: h.closeTime,
      isClosed: h.isClosed,
    })),
    canBook: permissions?.canBook ?? false,
    canEdit: permissions?.canEdit ?? false,
    availableActions: permissions?.availableActions || [],
    createdAt: domain.createdAt.toISOString(),
    updatedAt: domain.updatedAt.toISOString(),
  };
}

// Legacy exports
export const RentalObjectProjection = { id: 'stub', title: 'Stub Rental Object' };
export const CommonSchema = { id: { type: 'string' } };
export const RentalObjectMapper = { toDTO: (data: any) => data, fromDTO: (data: any) => data };

export class CustodyService {
  async evaluate() { return { allowed: true }; }
}

export class MetadataController {
  async getMetadata() { return { data: [] }; }
}

export class JwtService {
  async sign() { return 'stub-token'; }
  async verify() { return { userId: 'stub-user' }; }
}

export default {
  RentalObjectProjection, CommonSchema, RentalObjectMapper,
  CustodyService, MetadataController, JwtService,
  toDomain, toCardProjection, toDetailsProjection,
};

