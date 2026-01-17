# Seeding Strategy & Schema Audit

**Date:** 2026-01-17  
**Purpose:** Production-grade seed data for 31-migration Digilist/Xala schema

---

## Schema Structure (Discovered)

### Platform Schema
```
✅ Enums (16 enum tables with CHECK constraints - self-seeding in migrations)
✅ Core tables:
   - tenants
   - organizations
   - users
   - organization_members
   - roles
   - permissions
   - role_permissions
   - user_roles
   - sessions
   - plans
   - subscriptions
   - feature_flags
   - integrations
```

### Domain Schema  
```
✅ Rental Objects:
   - rental_objects
   - categories
   - amenities
   - rental_object_amenities
   
✅ Pricing:
   - pricing_groups
   - rental_object_pricing
   
✅ Bookings:
   - bookings
   - booking_conflicts
   - time_blocks
   
✅ Activities:
   - activities
   - activity_registrations
   
✅ Social:
   - favorites
   - reviews
   
✅ Notifications & Messages
```

### Monitoring Schema
```
✅ audit_logs (activity_history)
✅ system_metrics
```

### Compliance Schema (from 0023)
```
✅ gdpr_consents
✅ data_access_requests  
✅ data_retention_policies
```

---

## Seed Order (FK-Safe)

### Phase 1: Platform Foundation
```
1.  platform.enum_* tables (auto-seeded in migration)
2.  platform.tenants
3.  platform.organizations
4.  platform.users
5.  platform.organization_members
6.  platform.roles  
7.  platform.permissions
8.  platform.role_permissions
9.  platform.user_roles
10. platform.plans
11. platform.subscriptions
```

### Phase 2: Domain Catalog
```
12. domain.categories
13. domain.amenities
14. domain.pricing_groups
```

### Phase 3: Rental Objects
```
15. domain.rental_objects
16. domain.rental_object_amenities
17. domain.rental_object_pricing
18. domain.rental_object_media (if exists)
```

### Phase 4: Calendar & Bookings
```
19. domain.time_blocks
20. domain.bookings
21. domain.booking_conflicts
```

### Phase 5: Activities
```
22. domain.activities
23. domain.activity_registrations
```

### Phase 6: User Features
```
24. domain.favorites
25. domain.reviews
```

### Phase 7: Monitoring
```
26. monitoring.audit_logs
27. monitoring.system_metrics
```

### Phase 8: Compliance
```
28. compliance.gdpr_consents
29. compliance.data_access_requests
30. compliance.data_retention_policies
```

---

## ID Strategy: UUIDv5 (Deterministic)

```typescript
import { v5 as uuidv5 } from 'uuid';

const NAMESPACES = {
  TENANT:         '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  ORGANIZATION:   '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  USER:           '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  ROLE:           '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  PERMISSION:     '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  CATEGORY:       '6ba7b815-9dad-11d1-80b4-00c04fd430c8',
  AMENITY:        '6ba7b816-9dad-11d1-80b4-00c04fd430c8',
  PRICING_GROUP:  '6ba7b817-9dad-11d1-80b4-00c04fd430c8',
  RENTAL_OBJECT:  '6ba7b818-9dad-11d1-80b4-00c04fd430c8',
  ACTIVITY:       '6ba7b819-9dad-11d1-80b4-00c04fd430c8',
};

function stableId(namespace: string, key: string): string {
  return uuidv5(key, namespace);
}

// Usage:
const tenantId = stableId(NAMESPACES.TENANT, 'SKIEN');
const adminUserId = stableId(NAMESPACES.USER, 'admin@skien.kommune.no');
```

**Benefits:**
- Same input → same UUID (idempotent)
- No random UUIDs across runs
- Predictable for tests
- FK relationships stable

---

## Enum Mappings

### User Status
```
ACTIVE, INVITED, SUSPENDED, DELETED
```

### Tenant Status
```
ACTIVE, SUSPENDED, DELETED
```

### Role Codes
```
PUBLIC, USER, SAKSBEHANDLER, ADMIN, TENANT_ADMIN, SUPER_ADMIN
```

### Booking Status (from domain enums)
```
PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
```

### Rental Object Status
```
DRAFT, PUBLISHED, ARCHIVED, DELETED
```

### Rental Object Type
```
HALL, FIELD, ROOM, FACILITY, EQUIPMENT, VEHICLE, OTHER
```

---

## Demo Users (Minimal Set)

```typescript
const demoUsers = [
  {
    email: 'admin@skien.kommune.no',
    name: 'Admin Skien',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    email: 'saksbehandler@skien.kommune.no',
    name: 'Saksbehandler',
    role: 'SAKSBEHANDLER',
    status: 'ACTIVE',
  },
  {
    email: 'bruker@example.com',
    name: 'Test Bruker',
    role: 'USER',
    status: 'ACTIVE',
  },
];
```

---

## RLS Verification Queries

```sql
-- Verify tenant isolation
SET LOCAL claims.tenant_id = '<tenant-a-id>';
SELECT count(*) FROM domain.rental_objects; -- Should see only tenant A

SET LOCAL claims.tenant_id = '<tenant-b-id>';
SELECT count(*) FROM domain.rental_objects; -- Should see only tenant B (or 0)

-- Verify user-scoped bookings
SET LOCAL claims.user_id = '<user-id>';
SET LOCAL claims.tenant_id = '<tenant-id>';
SELECT * FROM domain.bookings; -- Should see only own bookings or all if admin

-- Verify favorites privacy
SELECT * FROM domain.favorites; -- Should see only own favorites
```

---

## Seed Manifest Schema

```json
{
  "seedDate": "2026-01-17T03:08:19+01:00",
  "version": "1.0.0",
  "inputFiles": [
    "rental-objects-40-full.json",
    "other-categories-10.json",
    "users-demo.json"
  ],
  "inputHash": "sha256:...",
  "counts": {
    "platform.tenants": 1,
    "platform.organizations": 3,
    "platform.users": 10,
    "platform.roles": 6,
    "platform.permissions": 50,
    "domain.categories": 15,
    "domain.rental_objects": 50,
    "domain.bookings": 25,
    "domain.favorites": 30,
    "domain.activities": 10,
    "monitoring.audit_logs": 100
  },
  "verificationPassed": true
}
```

---

## Implementation Plan

### Files to Create
```
apps/api/scripts/seed/
├── run-seed.ts              (Main runner)
├── helpers/
│   ├── stable-id.ts         (UUIDv5 generator)
│   ├── enums.ts             (Enum mappings)
│   └── validators.ts        (JSON → DB validation)
├── phases/
│   ├── 01-platform.ts       (Tenants, users, RBAC)
│   ├── 02-catalog.ts        (Categories, pricing, amenities)
│   ├── 03-rental-objects.ts (50 objects + pricing)
│   ├── 04-calendar.ts       (Bookings, blocks, conflicts)
│   ├── 05-activities.ts     (Activities + registrations)
│   ├── 06-social.ts         (Favorites, reviews)
│   ├── 07-monitoring.ts     (Audit logs, metrics)
│   └── 08-compliance.ts     (GDPR consents, DSARs)
└── data/
    ├── rental-objects-40-full.json
    ├── other-categories-10.json
    └── users-demo.json

db/seeds/
└── 99_verify.sql            (RLS + sanity checks)

docs/seeding/
├── schema-audit.md          (This file)
├── seed-manifest.json       (Generated output)
└── seed-report.md           (Human-readable summary)
```

---

## Next Steps

1. ✅ Schema

 audit complete
2. ⏳ Implement stable ID helper
3. ⏳ Create seed runner
4. ⏳ Implement all 8 phases
5. ⏳ Create verification SQL
6. ⏳ Generate manifest + report
7. ⏳ Test: `pnpm seed` + verify

---

**Status:** Schema mapped, ready for implementation
