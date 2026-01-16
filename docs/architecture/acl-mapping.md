# Anti-Corruption Layer (ACL) Mapping Guide

**Last Updated:** 2026-01-16
**Status:** Authoritative

---

## Purpose

The Anti-Corruption Layer (ACL) is a design pattern that isolates domain models from external concerns (database schema, legacy systems, third-party APIs). In this codebase, the ACL provides clean translation between:

```
Persistence (DB) ↔ Domain (Business) ↔ Projection (API/UI)
```

---

## Directory Structure

ACL mappers are co-located with their modules for better discoverability:

```
apps/api/src/modules/
├── rental-objects/
│   ├── rental-object.controller.ts
│   ├── rental-object.projections.ts   # ✅ ACL mapper
│   ├── rental-object.repository.ts
│   └── rental-object.service.ts
│
├── booking/
│   ├── booking.controller.ts
│   ├── booking.mapper.ts              # ✅ ACL mapper (NEW)
│   ├── booking.repository.ts
│   └── booking.service.ts
│
├── organizations/
│   ├── organizations.controller.ts
│   ├── organization.mapper.ts         # ✅ ACL mapper (NEW)
│   ├── organization.repository.ts     # ✅ Repository (NEW)
│   └── organization-setup.service.ts
│
├── user/
│   ├── user.controller.ts
│   ├── user.mapper.ts                 # ✅ ACL mapper (NEW)
│   ├── user.repository.ts
│   └── user.service.ts
│
├── messages/
│   ├── messages.controller.ts
│   └── messages.repository.ts         # ✅ Repository (NEW)
│
├── calendar/
│   ├── calendar.controller.ts
│   ├── calendar.repository.ts         # ✅ Repository (NEW)
│   └── calendar.service.ts
│
└── seasonal-lease/
    ├── seasonal-lease.controller.ts
    └── seasonal-lease.repository.ts   # ✅ Repository (NEW)
```

---

## Mapper Interface

Each mapper provides four transformation functions:

### 1. `toDomain(db: DbEntity): DomainEntity`

Converts raw database records to clean domain models.

**Responsibilities:**
- Normalize column names (snake_case → camelCase)
- Extract JSONB fields into typed structures
- Handle legacy naming
- Provide defaults for optional fields
- Parse enum values

**Example:**

```typescript
export function toDomain(db: DbRentalObject): RentalObject {
  const metadata = parseMetadata(db.metadata);

  return {
    id: db.id,
    tenantId: db.tenantId,

    // Clean naming
    category: {
      key: db.categoryKey,
      label: getCategoryLabel(db.categoryKey),
    },

    // Extract from JSONB
    location: extractLocation(metadata),
    pricing: parsePricing(db.pricing),

    // Parse enums
    timeMode: parseTimeMode(db.timeMode),
    status: parseStatus(db.status),

    // Timestamps
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
}
```

### 2. `toPersistence(domain: DomainEntity): DbEntity`

Converts domain models to database format for INSERT/UPDATE.

**Responsibilities:**
- Reverse field mappings
- Serialize nested objects to JSONB
- Handle nulls properly
- Support Expand/Contract migrations

**Example:**

```typescript
export function toPersistence(domain: RentalObject): Omit<DbRentalObject, 'createdAt' | 'updatedAt'> {
  return {
    id: domain.id,
    tenantId: domain.tenantId,
    categoryKey: domain.category.key,
    timeMode: domain.timeMode,
    status: domain.status.toLowerCase(),

    // Serialize JSONB
    pricing: domain.pricing ? {
      basePrice: domain.pricing.amount,
      currency: domain.pricing.currency,
      unit: domain.pricing.unit.toLowerCase(),
    } : null,

    metadata: serializeMetadata(domain),
  };
}
```

### 3. `toCardProjection(domain: DomainEntity, permissions?): CardProjectionDTO`

Converts domain models to card projections for lists/grids.

**Responsibilities:**
- Format display strings (priceDisplay, locationFormatted)
- Compute i18n keys
- Truncate descriptions
- Select primary image
- Add basic permissions

**Example:**

```typescript
export function toCardProjection(domain: RentalObject): RentalObjectCardProjectionDTO {
  const primaryImage = domain.images.find(img => img.isPrimary) || domain.images[0];

  return {
    id: domain.id,
    slug: domain.slug,
    name: domain.name,

    // Display-ready
    typeLabel: domain.category.label,
    locationFormatted: formatLocation(domain.location),
    priceDisplay: formatPrice(domain.pricing),
    capacityLabel: `${domain.capacity?.maximum || 0}`,

    // Media
    primaryImageUrl: primaryImage?.url || '',

    // Truncated
    descriptionExcerpt: truncate(domain.description, 120),

    // Computed
    isAvailable: domain.status === 'PUBLISHED',
    isFeatured: domain.isFeatured,
  };
}
```

### 4. `toDetailsProjection(domain: DomainEntity, permissions): DetailsProjectionDTO`

Converts domain models to full details for detail pages.

**Responsibilities:**
- Include all nested structures
- Add full permissions object
- Include available actions
- Format all display strings

**Example:**

```typescript
export function toDetailsProjection(
  domain: RentalObject,
  permissions: { canBook?: boolean; canEdit?: boolean }
): RentalObjectDetailsProjectionDTO {
  const card = toCardProjection(domain);

  return {
    ...card,

    // Full content
    description: domain.description,
    images: domain.images,

    // Nested structures
    openingHours: domain.openingHours.map(oh => ({
      day: getDayLabel(oh.dayOfWeek),
      hoursDisplay: `${oh.openTime} - ${oh.closeTime}`,
      isClosed: oh.isClosed,
    })),

    // Permissions (from RBAC layer)
    canBook: permissions.canBook ?? false,
    canEdit: permissions.canEdit ?? false,
    availableActions: computeActions(domain, permissions),
  };
}
```

---

## Usage in Controllers

Controllers should use the ACL mapper, not direct database access:

```typescript
@Controller('/api/rental-objects')
export class RentalObjectController {
  constructor(
    private readonly service: RentalObjectService,
    private readonly rbac: RbacService
  ) {}

  @Get()
  async findAll(request: TenantRequest) {
    // 1. Service returns domain models
    const { data: domains, meta } = await this.service.findAll(
      request.tenantId,
      request.query
    );

    // 2. Mapper converts to projections
    const projections = domains.map(domain =>
      RentalObjectMapper.toCardProjection(domain)
    );

    // 3. Return standardized response
    return { data: projections, meta };
  }

  @Get('/:id')
  async findOne(request: TenantRequest) {
    // 1. Get domain model
    const domain = await this.service.findById(request.tenantId, request.params.id);

    // 2. Compute permissions
    const permissions = await this.rbac.getPermissions(request.user, domain);

    // 3. Convert to details projection
    const projection = RentalObjectMapper.toDetailsProjection(domain, permissions);

    return { data: projection };
  }
}
```

---

## Testing ACL Mappers

Each mapper should have comprehensive tests:

```typescript
describe('RentalObjectMapper', () => {
  describe('toDomain', () => {
    it('should convert database record to domain model', () => {
      const db = createMockDbRecord();
      const domain = toDomain(db);

      expect(domain.category.key).toBe(db.categoryKey);
      expect(domain.timeMode).toBe('PERIOD');
    });

    it('should handle null JSONB fields', () => {
      const db = { ...createMockDbRecord(), metadata: null };
      const domain = toDomain(db);

      expect(domain.location).toBeNull();
    });
  });

  describe('toCardProjection', () => {
    it('should format price display', () => {
      const domain = createMockDomain({ pricing: { amount: 500, currency: 'NOK', unit: 'HOUR' } });
      const projection = toCardProjection(domain);

      expect(projection.priceDisplay).toBe('500 NOK');
    });

    it('should truncate description', () => {
      const longDesc = 'A'.repeat(200);
      const domain = createMockDomain({ description: longDesc });
      const projection = toCardProjection(domain);

      expect(projection.descriptionExcerpt.length).toBeLessThanOrEqual(123);
      expect(projection.descriptionExcerpt).toEndWith('...');
    });
  });
});
```

---

## Expand/Contract Support

ACL mappers are key to safe schema migrations:

### During Expansion Phase

```typescript
export function toDomain(db: DbRentalObject): RentalObject {
  return {
    // PREFER new field, FALLBACK to old
    title: db.title || db.name,
  };
}

export function toPersistence(domain: RentalObject) {
  return {
    // WRITE TO BOTH during migration
    title: domain.title,
    name: domain.title,
  };
}
```

### After Contraction Phase

```typescript
export function toDomain(db: DbRentalObject): RentalObject {
  return {
    title: db.title, // Only new field
  };
}

export function toPersistence(domain: RentalObject) {
  return {
    title: domain.title, // Only new field
  };
}
```

---

## Best Practices

1. **Keep mappers pure** - No side effects, no database calls
2. **Test extensively** - Cover edge cases, null handling, type coercion
3. **Document legacy mappings** - Comment on why certain transformations exist
4. **Use helper functions** - Extract parsing/formatting to reusable functions
5. **Version projections** - When breaking changes needed, create new projection type

---

## Implemented Mappers

### Rental Objects Mapper

**File:** `apps/api/src/modules/rental-objects/rental-object.projections.ts`

**Projection DTOs:**
- `RentalObjectCardProjectionDTO` - For list views
- `RentalObjectDetailsProjectionDTO` - For detail pages

**Functions:**
- `toCardProjection(obj)` - Convert to card projection
- `toDetailsProjection(obj, options)` - Convert to details projection
- `toCardProjections(objects)` - Batch conversion

---

### Booking Mapper

**File:** `apps/api/src/modules/booking/booking.mapper.ts`

**Projection DTOs:**
- `BookingCardProjectionDTO` - For booking lists
- `BookingDetailsProjectionDTO` - For booking details
- `BookingReceiptProjectionDTO` - For receipts (KRAV-ADM-07)
- `CalendarEventProjectionDTO` - For calendar views

**Functions:**
- `toBookingCardProjection(booking, options)` - Convert to card
- `toBookingDetailsProjection(booking, options)` - Convert to details
- `toBookingReceiptProjection(booking, tenantInfo)` - Convert to receipt
- `toCalendarEventProjection(booking, options)` - Convert to calendar event

**Features:**
- Status labels with i18n keys
- Status colors for UI badges
- Permission computation (canCancel, canModify, etc.)
- Available actions based on booking state
- Duration formatting
- Price formatting

---

### Organization Mapper

**File:** `apps/api/src/modules/organizations/organization.mapper.ts`

**Projection DTOs:**
- `OrganizationCardProjectionDTO` - For org lists
- `OrganizationDetailsProjectionDTO` - For org details
- `MemberProjectionDTO` - For member lists
- `BrandingProjectionDTO` - For branding management

**Functions:**
- `toOrganizationCardProjection(org, options)` - Convert to card
- `toOrganizationDetailsProjection(org, options)` - Convert to details
- `toMemberProjection(member)` - Convert member
- `toBrandingProjection(org)` - Convert branding

**Features:**
- Type labels (organization, municipality, company, etc.)
- Member count labels
- Initials computation
- Branding extraction from settings
- Permission computation

---

### User Mapper

**File:** `apps/api/src/modules/user/user.mapper.ts`

**Projection DTOs:**
- `UserCardProjectionDTO` - For user lists
- `UserDetailsProjectionDTO` - For user profiles
- `CurrentUserProjectionDTO` - For `/me` endpoints
- `UserConsentProjectionDTO` - For GDPR consent management

**Functions:**
- `toUserCardProjection(user, options)` - Convert to card
- `toUserDetailsProjection(user, options)` - Convert to details
- `toCurrentUserProjection(user, options)` - Convert for `/me`
- `toUserConsentProjection(user, consents)` - Convert consents

**Features:**
- Role labels and colors
- Status labels and colors
- Online status detection
- National ID masking
- Consent management (GDPR)
- Preference extraction
- Activity stats

---

## References

- `apps/api/src/modules/rental-objects/rental-object.projections.ts` - Reference implementation
- `apps/api/src/modules/booking/booking.mapper.ts` - Booking mapper
- `apps/api/src/modules/organizations/organization.mapper.ts` - Organization mapper
- `apps/api/src/modules/user/user.mapper.ts` - User mapper
- `packages/client-sdk/src/types/projection-dtos.ts` - Projection DTOs
- `docs/EXPAND_CONTRACT_WORKFLOW.md` - Migration guide
- `docs/ARCHITECTURE_REFACTORING_PROGRESS.md` - Progress tracking
