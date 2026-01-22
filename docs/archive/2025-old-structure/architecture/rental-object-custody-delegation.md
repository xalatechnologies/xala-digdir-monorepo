# Rental Object Custody & Delegation Hierarchy

## Overview

The Rental Object Custody & Delegation system enables **Tenant Admins** to delegate responsibility for rental objects to **Backoffice Organizations** or **Backoffice Users**, with support for hierarchical sub-delegation to organization members. This implements a hybrid RBAC+ABAC authorization model with resource-scoped permissions.

**Key Capabilities:**
- Delegate custody of rental objects to organizations or individual users
- Organization admins can sub-delegate to their members
- Granular permission scopes (view, edit, media, maintenance, booking, pricing, reporting, delegate)
- Time-windowed grants with effective date ranges
- Full audit trail for all delegation actions
- Tenant isolation enforced at all levels

## Architecture

### Authorization Model

The system implements a **Hybrid RBAC + ABAC** model:

1. **RBAC (Role-Based Access Control)**: System roles (SAAS_SUPER_ADMIN, TENANT_ADMIN, ORG_ADMIN, etc.) provide base permissions
2. **ABAC (Attribute-Based Access Control)**: Custody grants provide resource-scoped permissions that layer on top of roles

**Permission Evaluation Flow:**
```
Request → Check System Role → Check Custody Grants → Allow/Deny
```

### Custody Scopes

Eight granular permission scopes control what actions can be performed:

| Scope | Description | Examples |
|-------|-------------|----------|
| `RO_VIEW` | View rental object details | Read name, description, images, pricing |
| `RO_EDIT` | Modify rental object | Update details, change status, archive |
| `RO_MEDIA` | Manage media files | Upload/delete images, manage gallery |
| `RO_MAINTENANCE` | Schedule maintenance | Create blocks, set unavailable periods |
| `RO_BOOKING_MANAGE` | Manage bookings | View, approve, cancel bookings |
| `RO_PRICING` | Update pricing | Modify base price, packages, discounts |
| `RO_REPORTING` | Access reports | View stats, revenue, occupancy reports |
| `RO_DELEGATE` | Sub-delegate permissions | Create subgrants (org admins only) |

### Delegation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKOFFICE ONLY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tenant Admin (BO-TENANT-ADMIN)                            │
│  └─ Rental Object Wizard → Custody Step                    │
│     ├─> Grant to Backoffice Organization                   │
│     │   ├─ Scopes: RO_VIEW, RO_EDIT, RO_DELEGATE, etc.     │
│     │   ├─ canSubdelegate: true/false                      │
│     │   └─ Time window: effectiveFrom/effectiveTo          │
│     │                                                        │
│     └─> Grant to Backoffice User                           │
│         ├─ Scopes: RO_VIEW, RO_EDIT, etc.                  │
│         └─ canSubdelegate: false (always)                  │
│                                                             │
│  Org Admin (BO-ORG-ADMIN)                                  │
│  └─ Organization Management → Custody Tab                  │
│     └─> Sub-delegate to BO-ORG-MEMBER                      │
│         ├─ Scopes must be subset of parent grant           │
│         ├─ User must be member of organization             │
│         └─ Parent grant must allow sub-delegation          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Important:** This system is **Backoffice-only**. No Minside (end-user portal) roles are involved. Only backoffice users (BO-TENANT-ADMIN, BO-ORG-ADMIN, BO-ORG-MEMBER) can participate in custody flows.

## Database Schema

### Tables

#### `domain.rental_object_custody_grants`

Main custody grants from Tenant Admin to Organizations or Users.

```sql
CREATE TABLE domain.rental_object_custody_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  
  grantee_type VARCHAR(20) NOT NULL, -- 'USER' | 'ORG'
  grantee_id UUID NOT NULL,
  
  scopes TEXT[] NOT NULL DEFAULT '{}',
  can_subdelegate BOOLEAN NOT NULL DEFAULT false,
  
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  reason TEXT,
  
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'REVOKED'
  
  created_by_user_id UUID NOT NULL REFERENCES platform.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  revoked_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES platform.users(id),
  
  CONSTRAINT ro_custody_grants_unique_active UNIQUE (tenant_id, rental_object_id, grantee_type, grantee_id)
);

CREATE INDEX ro_custody_grants_tenant_idx ON domain.rental_object_custody_grants(tenant_id);
CREATE INDEX ro_custody_grants_ro_idx ON domain.rental_object_custody_grants(rental_object_id);
CREATE INDEX ro_custody_grants_grantee_idx ON domain.rental_object_custody_grants(grantee_type, grantee_id);
```

#### `domain.rental_object_custody_subgrants`

Sub-delegations from Organization Admins to organization members.

```sql
CREATE TABLE domain.rental_object_custody_subgrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  parent_grant_id UUID NOT NULL REFERENCES domain.rental_object_custody_grants(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES platform.organizations(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  
  scopes TEXT[] NOT NULL DEFAULT '{}',
  
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  
  created_by_user_id UUID NOT NULL REFERENCES platform.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  revoked_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES platform.users(id)
);

CREATE INDEX ro_custody_subgrants_tenant_idx ON domain.rental_object_custody_subgrants(tenant_id);
CREATE INDEX ro_custody_subgrants_parent_idx ON domain.rental_object_custody_subgrants(parent_grant_id);
CREATE INDEX ro_custody_subgrants_member_idx ON domain.rental_object_custody_subgrants(member_user_id);
CREATE INDEX ro_custody_subgrants_org_idx ON domain.rental_object_custody_subgrants(org_id);
```

### Drizzle ORM Schema

Located in `apps/api/src/database/schema/custody.ts`:

```typescript
export const rentalObjectCustodyGrants = domainSchema.table('rental_object_custody_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  
  granteeType: varchar('grantee_type', { length: 20 }).notNull(),
  granteeId: uuid('grantee_id').notNull(),
  
  scopes: text('scopes').array().notNull().default([]),
  canSubdelegate: boolean('can_subdelegate').notNull().default(false),
  
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  reason: text('reason'),
  
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedByUserId: uuid('revoked_by_user_id').references(() => users.id),
});
```

## API Endpoints

### Base URL: `/api/custody`

#### Create Custody Grant

**Endpoint:** `POST /api/custody/rental-objects/:id/grants`

**Authorization:** Requires `TENANT_ADMIN` or `SAAS_SUPER_ADMIN` role

**Request Body:**
```typescript
{
  granteeType: 'USER' | 'ORG',
  granteeId: string (UUID),
  scopes: CustodyScope[],
  canSubdelegate?: boolean,      // Only for ORG type
  effectiveFrom?: string (ISO),  // Optional time window start
  effectiveTo?: string (ISO),    // Optional time window end
  reason?: string                // Optional reason/justification
}
```

**Response:** `201 Created`
```typescript
{
  data: {
    id: string,
    tenantId: string,
    rentalObjectId: string,
    granteeType: 'USER' | 'ORG',
    granteeId: string,
    scopes: CustodyScope[],
    canSubdelegate: boolean,
    status: 'ACTIVE',
    createdAt: string,
    // ... other fields
  }
}
```

#### List Custody Grants

**Endpoint:** `GET /api/custody/rental-objects/:id`

**Authorization:** Requires authentication and tenant access

**Response:** `200 OK`
```typescript
{
  data: RentalObjectCustodyGrant[]
}
```

#### Revoke Grant

**Endpoint:** `DELETE /api/custody/grants/:grantId`

**Authorization:** Requires `TENANT_ADMIN` or grant creator

**Response:** `200 OK`
```typescript
{
  data: {
    id: string,
    status: 'REVOKED',
    revokedAt: string,
    revokedByUserId: string
  }
}
```

**Note:** Revoking a grant automatically revokes all child subgrants.

#### Create Subgrant

**Endpoint:** `POST /api/custody/grants/:parentGrantId/subgrants`

**Authorization:** Requires `ORG_ADMIN` role for the organization

**Request Body:**
```typescript
{
  memberUserId: string (UUID),
  scopes: CustodyScope[],       // Must be subset of parent grant scopes
  effectiveFrom?: string (ISO),
  effectiveTo?: string (ISO)
}
```

**Validation Rules:**
1. Parent grant must have `granteeType: 'ORG'`
2. Parent grant must have `canSubdelegate: true`
3. Parent grant must be `ACTIVE`
4. Member user must belong to the organization
5. Requested scopes must be subset of parent scopes
6. Tenant ID must match across all entities

**Response:** `201 Created`

#### List Organization Custody

**Endpoint:** `GET /api/custody/orgs/:orgId/rental-objects`

**Authorization:** Requires `ORG_ADMIN` or `ORG_MEMBER` role for the organization

**Response:** `200 OK`
```typescript
{
  data: Array<{
    grant: RentalObjectCustodyGrant,
    rentalObject: RentalObject,
    subgrants: RentalObjectCustodySubgrant[]
  }>
}
```

## Permission Evaluation

The `CustodyEvaluator` service implements the permission evaluation logic:

```typescript
async can(
  user: UserContext,
  scope: CustodyScope,
  rentalObjectId: string
): Promise<boolean>
```

**Evaluation Algorithm:**

1. **Check System Roles** (highest priority):
   - `SAAS_SUPER_ADMIN` → Always allowed
   - `TENANT_ADMIN` → Always allowed within their tenant
   - `ADMIN` → Always allowed within their tenant

2. **Check Direct User Grant**:
   - Query `rental_object_custody_grants` where:
     - `granteeType = 'USER'`
     - `granteeId = user.userId`
     - `rentalObjectId = rentalObjectId`
     - `status = 'ACTIVE'`
     - Time window is valid (effectiveFrom <= NOW <= effectiveTo)
   - If found and scope is in grant.scopes → Allow

3. **Check Organization Grants**:
   - For each organization the user belongs to:
     - Query grants where `granteeType = 'ORG'` and `granteeId = orgId`
     - If found and active and scope matches → Allow

4. **Check Subgrants**:
   - For each user's organization:
     - Query `rental_object_custody_subgrants` where:
       - `memberUserId = user.userId`
       - Parent grant is ACTIVE
       - Subgrant is ACTIVE
       - Time windows are valid
     - If found and scope matches → Allow

5. **Default**: Deny if no grants found

**Time Window Validation:**
```sql
(effective_from IS NULL OR effective_from <= NOW())
AND
(effective_to IS NULL OR effective_to >= NOW())
```

## SDK Usage

### React Query Hooks

Located in `packages/client-sdk/src/hooks/use-custody.ts`:

#### Fetch Grants for Rental Object

```typescript
import { useRentalObjectCustody } from '@digilist/client-sdk';

const { data, isLoading } = useRentalObjectCustody(rentalObjectId);

// data.grants: RentalObjectCustodyGrant[]
// data.subgrants: RentalObjectCustodySubgrant[]
```

#### Check Permission (Client-side)

```typescript
import { useCanCustody } from '@digilist/client-sdk';

const { data: canEdit } = useCanCustody(rentalObjectId, 'RO_EDIT');

if (canEdit) {
  // Show edit button
}
```

#### Create Grant

```typescript
import { useCreateCustodyGrant } from '@digilist/client-sdk';

const createGrant = useCreateCustodyGrant();

await createGrant.mutateAsync({
  rentalObjectId,
  data: {
    granteeType: 'ORG',
    granteeId: organizationId,
    scopes: ['RO_VIEW', 'RO_EDIT', 'RO_DELEGATE'],
    canSubdelegate: true,
  }
});
```

#### Revoke Grant

```typescript
import { useRevokeCustodyGrant } from '@digilist/client-sdk';

const revokeGrant = useRevokeCustodyGrant();

await revokeGrant.mutateAsync({
  grantId,
  _rentalObjectId: rentalObjectId  // For cache invalidation
});
```

#### List Organization Custody

```typescript
import { useOrgCustody } from '@digilist/client-sdk';

const { data, isLoading } = useOrgCustody(organizationId);

// data: Array of grants with populated rentalObject and subgrants
```

## UI Implementation

### Backoffice Rental Object Wizard

**File:** `apps/backoffice/src/features/rental-objects/components/wizard/steps/CustodyStep.tsx`

The Custody Step is integrated into the rental object creation/editing wizard and appears before the "Review" step in all categories (LOKALER_OG_BANER, UTSTYR_OG_INVENTAR, KJORETOY_OG_TRANSPORT, OPPLEVELSER_OG_ARRANGEMENT).

**Features:**
- Assign custody to backoffice organizations or users during object creation
- Select multiple custody scopes via checkboxes
- Enable/disable sub-delegation for organization grants
- View existing grants with status and scopes
- Revoke grants directly from the wizard

**User Flow:**
1. Tenant Admin creates/edits rental object
2. Progresses through wizard steps (Category → Basics → Media → ... → Custody)
3. In Custody step:
   - Click "Assign Custody"
   - Select grantee type (Organization or User)
   - Choose grantee from dropdown
   - Check desired scopes
   - For organizations: Enable "Allow sub-delegation to members"
   - Submit
4. Grant appears in table with status badge
5. Continue to Review and save

### Backoffice Rental Object Detail Tab

**File:** `apps/backoffice/src/features/rental-objects/components/detail/RentalObjectCustodyTab.tsx`

After a rental object is created, the Custody tab provides full grant management:

**Features:**
- View all grants in a sortable table
- Filter by grantee type, status, or scopes
- See subgrants nested under organization grants
- Create new grants with modal form
- Revoke grants with confirmation dialog
- Audit trail showing who created/revoked grants

### Bulk Custody Assignment

**File:** `apps/backoffice/src/features/rental-objects/components/BulkCustodyModal.tsx`

Allows assigning custody to multiple rental objects at once:

```typescript
// Select multiple objects in list view
// Click "Bulk Assign Custody"
// Choose organization/user and scopes
// System creates grants for all selected objects
```

## Security Considerations

### Tenant Isolation

**Critical:** All custody operations enforce strict tenant boundaries:

```typescript
// All queries include tenant_id check
const grant = await db.query.rentalObjectCustodyGrants.findFirst({
  where: and(
    eq(rentalObjectCustodyGrants.id, grantId),
    eq(rentalObjectCustodyGrants.tenantId, user.tenantId) // ✅ Tenant isolation
  )
});
```

**Validation Rules:**
- Rental object must belong to user's tenant
- Grantee (user/org) must belong to same tenant
- All entities in a grant chain must share tenant ID

### IDOR Protection

The system prevents Insecure Direct Object Reference attacks:

```typescript
// ❌ Wrong: Allow access by grant ID alone
DELETE /api/custody/grants/:grantId

// ✅ Correct: Verify tenant ownership
const grant = await service.findGrant(grantId);
if (grant.tenantId !== req.tenantId) {
  throw new ForbiddenError();
}
```

### Audit Logging

Every custody operation emits an audit event:

```typescript
{
  action: 'CUSTODY_GRANT_CREATED',
  actorId: user.id,
  actorRole: user.role,
  tenantId: tenant.id,
  resource: 'rental_object_custody_grant',
  resourceId: grant.id,
  metadata: {
    rentalObjectId,
    granteeType,
    granteeId,
    scopes,
    canSubdelegate
  },
  timestamp: new Date().toISOString()
}
```

**Audited Actions:**
- `CUSTODY_GRANT_CREATED`
- `CUSTODY_GRANT_REVOKED`
- `CUSTODY_SUBGRANT_CREATED`
- `CUSTODY_SUBGRANT_REVOKED`
- `CUSTODY_ACCESS_DENIED` (security event)

### Input Validation

All inputs are validated using Zod schemas from `@xala/contracts`:

```typescript
import { CreateCustodyGrantDTOSchema } from '@xala/contracts';

const validated = CreateCustodyGrantDTOSchema.parse(req.body);
```

**Validation Rules:**
- Grantee type must be 'USER' or 'ORG'
- Grantee ID must be valid UUID
- Scopes must be valid CustodyScope enum values
- Effective dates must be valid ISO strings
- Reason text sanitized to prevent XSS

## Testing

### Unit Tests

**File:** `tests/unit/custody-eval.test.ts`

Tests the permission evaluation engine in isolation:

```typescript
describe('CustodyEvaluator', () => {
  it('should allow TENANT_ADMIN full access', async () => {
    const result = await evaluator.can(
      { userId: 'admin-1', tenantId: 'tenant-1', role: 'TENANT_ADMIN' },
      'RO_EDIT',
      'rental-object-1'
    );
    expect(result).toBe(true);
  });

  it('should allow user with direct grant', async () => {
    // Create grant with RO_VIEW scope
    const result = await evaluator.can(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'USER' },
      'RO_VIEW',
      'rental-object-1'
    );
    expect(result).toBe(true);
  });

  it('should deny user without grant', async () => {
    const result = await evaluator.can(
      { userId: 'user-2', tenantId: 'tenant-1', role: 'USER' },
      'RO_EDIT',
      'rental-object-1'
    );
    expect(result).toBe(false);
  });

  it('should enforce time windows', async () => {
    // Grant effective tomorrow
    const result = await evaluator.can(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'USER' },
      'RO_VIEW',
      'rental-object-1'
    );
    expect(result).toBe(false);
  });
});
```

### Integration Tests

**File:** `tests/integration/custody/custody-api.test.ts`

Tests API endpoints with real database operations:

- Grant creation for users and organizations
- Grant listing with subgrants populated
- Grant revocation with cascade
- Subgrant creation with validation
- Bulk grant assignment
- Tenant isolation enforcement
- IDOR attack prevention

### E2E Tests

**File:** `tests/e2e/custody-delegation.spec.ts`

Tests the complete user workflow in Backoffice:

```typescript
test('Tenant Admin assigns custody in wizard', async ({ page }) => {
  // Navigate to rental object wizard
  await page.goto('/backoffice/rental-objects/new');
  
  // Complete wizard steps
  // ... category, basics, media, etc.
  
  // Custody step
  await page.click('button:has-text("Assign Custody")');
  await page.selectOption('select', { label: 'My Organization' });
  await page.check('input[value="RO_VIEW"]');
  await page.check('input[value="RO_EDIT"]');
  await page.check('input#canSubdelegate');
  await page.click('button:has-text("Assign")');
  
  // Verify grant appears
  await expect(page.locator('td:has-text("My Organization")')).toBeVisible();
});
```

## Migration Guide

### Running the Migration

```bash
# Generate migration
cd apps/api
pnpm drizzle-kit generate:pg

# Apply migration
pnpm drizzle-kit push:pg
```

### Migration File

Located at `apps/api/drizzle/0039_rental_object_custody.sql`:

```sql
-- Create custody grants table
CREATE TABLE IF NOT EXISTS domain.rental_object_custody_grants (
  -- ... (see Database Schema section)
);

-- Create custody subgrants table  
CREATE TABLE IF NOT EXISTS domain.rental_object_custody_subgrants (
  -- ... (see Database Schema section)
);
```

### Rollback

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS domain.rental_object_custody_subgrants;
DROP TABLE IF EXISTS domain.rental_object_custody_grants;
```

## Performance Considerations

### Indexing Strategy

Critical indices for performance:

1. **Tenant-based queries**: `(tenant_id)` on both tables
2. **Rental object lookups**: `(rental_object_id)` on grants table
3. **Grantee lookups**: `(grantee_type, grantee_id)` composite index
4. **Parent grant lookups**: `(parent_grant_id)` on subgrants table
5. **Member lookups**: `(member_user_id)` on subgrants table

### Query Optimization

The evaluator uses optimized queries with early returns:

```typescript
// 1. Check system roles first (no DB query)
if (user.role === 'TENANT_ADMIN') return true;

// 2. Single query for user grants
const userGrant = await db.query...findFirst();
if (userGrant && hasScope(userGrant, scope)) return true;

// 3. Organization grants (batch query)
const orgGrants = await db.query...findMany({
  where: inArray(granteeId, user.organizationIds)
});

// 4. Subgrants (single query with join)
const subgrants = await db.query...findMany({
  with: { parentGrant: true }
});
```

### Caching Strategy

Consider caching permission checks for high-traffic scenarios:

```typescript
// Cache key: `custody:${userId}:${rentalObjectId}:${scope}`
// TTL: 5 minutes
// Invalidate on: grant create/revoke, user org membership change
```

## Common Use Cases

### 1. Delegate Rental Object to Facility Management Organization

```typescript
// Tenant Admin creates rental object and assigns custody
await createCustodyGrant({
  rentalObjectId: 'sports-hall-1',
  data: {
    granteeType: 'ORG',
    granteeId: 'facility-mgmt-org',
    scopes: ['RO_VIEW', 'RO_EDIT', 'RO_BOOKING_MANAGE', 'RO_MAINTENANCE', 'RO_DELEGATE'],
    canSubdelegate: true,
    reason: 'Facility management org responsible for day-to-day operations'
  }
});

// Org Admin sub-delegates booking management to receptionist
await createCustodySubgrant({
  parentGrantId: 'grant-1',
  memberUserId: 'receptionist-1',
  scopes: ['RO_VIEW', 'RO_BOOKING_MANAGE']
});
```

### 2. Temporary Access for External Contractor

```typescript
// Grant time-limited access for maintenance work
await createCustodyGrant({
  rentalObjectId: 'conference-room-a',
  data: {
    granteeType: 'USER',
    granteeId: 'contractor-1',
    scopes: ['RO_VIEW', 'RO_MAINTENANCE'],
    effectiveFrom: '2025-01-20T00:00:00Z',
    effectiveTo: '2025-01-27T23:59:59Z',
    reason: 'HVAC system maintenance - Week 4'
  }
});
```

### 3. Multi-Department Shared Resource

```typescript
// Sports hall shared between Athletics and Football departments
await createCustodyGrant({
  rentalObjectId: 'sports-hall-1',
  data: {
    granteeType: 'ORG',
    granteeId: 'athletics-dept',
    scopes: ['RO_VIEW', 'RO_BOOKING_MANAGE'],
    canSubdelegate: false
  }
});

await createCustodyGrant({
  rentalObjectId: 'sports-hall-1',
  data: {
    granteeType: 'ORG',
    granteeId: 'football-dept',
    scopes: ['RO_VIEW', 'RO_BOOKING_MANAGE'],
    canSubdelegate: false
  }
});
```

## Troubleshooting

### Grant Not Taking Effect

**Problem:** Created a grant but user still can't access rental object

**Checklist:**
1. Verify grant status is `ACTIVE`
2. Check time window: `effectiveFrom <= NOW <= effectiveTo`
3. Ensure user/org belongs to same tenant as rental object
4. Verify scope is included in grant.scopes array
5. Check API logs for authorization denials
6. Clear client-side cache if using permission hooks

### Subgrant Creation Fails

**Problem:** `403 Forbidden` when creating subgrant

**Common Causes:**
1. Parent grant has `canSubdelegate: false`
2. Parent grant is not for an organization (`granteeType: 'USER'`)
3. User is not a member of the organization
4. Requested scopes exceed parent grant scopes
5. Tenant ID mismatch between entities

**Debug:**
```typescript
// Check parent grant details
const parent = await db.query.rentalObjectCustodyGrants.findFirst({
  where: eq(rentalObjectCustodyGrants.id, parentGrantId)
});

console.log({
  canSubdelegate: parent.canSubdelegate,
  granteeType: parent.granteeType,
  scopes: parent.scopes
});

// Verify user is org member
const membership = await db.query.orgMemberships.findFirst({
  where: and(
    eq(orgMemberships.userId, userId),
    eq(orgMemberships.orgId, parent.granteeId)
  )
});
```

### Performance Issues

**Problem:** Slow permission checks

**Solutions:**
1. Ensure indices are created on both tables
2. Implement Redis caching for hot paths
3. Denormalize frequently accessed data
4. Use batch queries for multiple objects
5. Consider materialized views for reporting

## Future Enhancements

### Planned Features

1. **Grant Templates**: Pre-defined scope combinations for common scenarios
2. **Automatic Expiration**: Background worker to mark expired grants as inactive
3. **Approval Workflow**: Require approval for high-privilege grants
4. **Delegation Limits**: Max depth for subgrant chains
5. **Scope Dependencies**: RO_EDIT requires RO_VIEW automatically
6. **Analytics Dashboard**: Visualize custody distribution across organization

### API Extensions

```typescript
// Proposed endpoints
POST /api/custody/templates - Create reusable grant templates
GET /api/custody/audit/:rentalObjectId - Full custody history
POST /api/custody/bulk-revoke - Revoke multiple grants at once
GET /api/custody/effective-permissions - Calculate all user permissions
```

## References

- [RBAC Role Matrix](../roles/ROLE_MATRIX.md)
- [Database Schema](./database-schema.md)
- [Security Architecture](./05-security.md)
- [API Authentication](./AUTHENTICATION_SYSTEM.md)
- [Audit Logging](../quality/audit-logging.md)

## Support

For questions or issues:
- **API Issues**: Check `apps/api/src/modules/custody/`
- **UI Issues**: Check `apps/backoffice/src/features/rental-objects/`
- **Schema Issues**: Check `apps/api/src/database/schema/custody.ts`
- **Security Concerns**: Review tenant isolation in evaluator logic
