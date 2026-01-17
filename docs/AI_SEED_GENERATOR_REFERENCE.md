# 🎯 AI SEED GENERATOR - ENTITY REFERENCE

## ✅ **All 9 Supported Entities**

### Quick Reference Table

| # | Entity | Table | Schema | FK Dependencies |
|---|--------|-------|--------|-----------------|
| 1 | **Tenant** | `platform.tenants` | ✅ | None (root) |
| 2 | **Organization** | `platform.organizations` | ✅ | → tenants |
| 3 | **User** | `platform.users` | ✅ | → tenants |
| 4 | **Pricing Group** | `platform.pricing_groups` | ✅ | → tenants |
| 5 | **Org Member** | `platform.organization_members` | ✅ | → tenants, organizations, users |
| 6 | **Rental Object** | `domain.rental_objects` | ✅ | → tenants, organizations |
| 7 | **Amenity** | `domain.amenities` | ✅ | → tenants |
| 8 | **Add-on** | `domain.addons` | ✅ | → tenants |
| 9 | **Booking** | `domain.bookings` | ✅ | → tenants, rental_objects, users, organizations |

---

## 📋 **Schema Definitions Summary**

### 1. Tenant
```json
{
  "id": "uuid",
  "subdomain": "string (a-z0-9-)",
  "name": "string",
  "status": "active|suspended|trial",
  "isActive": "boolean"
}
```

### 2. Organization
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "parentId": "uuid|null",
  "name": "string",
  "type": "MUNICIPALITY|CLUB|NONPROFIT|BUSINESS",
  "status": "active|inactive"
}
```

### 3. User
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "organizationId": "uuid",
  "email": "email",
  "name": "string",
  "role": "admin|manager|staff|member|user",
  "status": "active|inactive|suspended",
  "demoToken": "string"
}
```

### 4. Pricing Group ✨
```json
{
  "tenantId": "uuid",
  "code": "UPPERCASE_SNAKE",
  "name": "string",
  "description": "string",
  "discountPercentage": "number (0-100)",
  "isActive": "boolean",
  "requiresVerification": "boolean",
  "verificationDocumentType": "string"
}
```

**Example codes:** `MEMBER`, `STUDENT`, `NONPROFIT`, `SENIOR`, `PUBLIC`

### 5. Organization Member ✨
```json
{
  "tenantId": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "role": "OWNER|ADMIN|MANAGER|MEMBER",
  "joinedAt": "datetime",
  "isActive": "boolean",
  "permissions": ["string[]"]
}
```

**Common permissions:** `["manage_org", "manage_members", "manage_bookings", "view_bookings", "create_booking"]`

### 6. Rental Object
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "organizationId": "uuid",
  "name": "string",
  "slug": "string",
  "type": "SPACE|EQUIPMENT|VENUE",
  "categoryKey": "string",
  "timeMode": "PERIOD|HOURLY|DAILY",
  "status": "draft|published|archived",
  "description": "string",
  "capacity": "integer",
  "pricing": { ... },
  "images": ["uri[]"],
  "metadata": { ... }
}
```

### 7. Amenity
```json
{
  "tenantId": "uuid",
  "code": "string",
  "name": "string",
  "description": "string",
  "groupCode": "string",
  "iconKey": "string",
  "isActive": "boolean"
}
```

### 8. Add-on
```json
{
  "tenantId": "uuid",
  "code": "string",
  "name": "string",
  "description": "string",
  "pricingModel": "PER_BOOKING|PER_HOUR|PER_DAY|PER_UNIT",
  "basePriceCents": "integer",
  "isRequired": "boolean",
  "maxUnits": "integer",
  "isActive": "boolean"
}
```

### 9. Booking
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "rentalObjectId": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "startTime": "datetime",
  "endTime": "datetime",
  "status": "PENDING|CONFIRMED|CANCELLED|COMPLETED",
  "bookingMode": "SINGLE|RECURRING",
  "totalPriceCents": "integer",
  "depositCents": "integer",
  "paymentStatus": "PENDING|PAID|FAILED|REFUNDED",
  "notes": "string"
}
```

---

## 🎯 **Generation Order (Respects FK Dependencies)**

For complete tenant setup, generate in this order:

```
1. Tenant (root)
   ↓
2. Organizations (→ tenant)
   ↓
3. Users (→ tenant)
   ↓
4. Pricing Groups (→ tenant)
   ↓
5. Organization Members (→ tenant, organizations, users)
   ↓
6. Rental Objects (→ tenant, organizations)
   ↓
7. Amenities (→ tenant)
   ↓
8. Add-ons (→ tenant)
   ↓
9. Bookings (→ rental objects, users, organizations)
```

---

## 📊 **Typical Quantities for Demo Data**

| Entity | Recommended Count | Notes |
|--------|-------------------|-------|
| Tenants | 1-3 | One per municipality |
| Organizations | 5-10 per tenant | Departments, clubs, etc. |
| Users | 20-50 per tenant | Mix of roles |
| Pricing Groups | 5-7 per tenant | MEMBER, STUDENT, etc. |
| Org Members | 3-10 per org | Link users to orgs |
| Rental Objects | 30-50 per tenant | Spaces, equipment |
| Amenities | 20-40 per tenant | Facilities |
| Add-ons | 5-15 per tenant | Services |
| Bookings | 50-200 per tenant | Demo bookings |

---

## 🔗 **Current Implementation Status**

### ✅ Complete (9/9)
- [x] JSON Schemas defined
- [x] All entities documented
- [x] FK dependencies mapped

### ⏳ In Progress
- [ ] AI generator examples updated
- [ ] JSON → SQL converters added
- [ ] UI dropdown updated
- [ ] Service integration complete

---

**Files:**
- Schema: `apps/api/db/seeds/schemas/seed-data-schema.json`
- Docs: `docs/AI_SEED_GENERATOR_COMPLETE.md`
- This Reference: `docs/AI_SEED_GENERATOR_REFERENCE.md`

**Next:** Update services to handle all 9 entity types! 🚀
