# Feature Flags - Quick Start Guide

## Overview

The feature flags system is now implemented! Here's how to use it:

---

## 1. Frontend Usage

### Check if a feature is enabled

```typescript
import { useFeature, FeatureFlag } from '@digilist/client-sdk';

function ReportsPage() {
  const canViewReports = useFeature(FeatureFlag.BACKOFFICE_REPORTING);
  
  if (!canViewReports) {
    return <AccessDenied />;
  }
  
  return <ReportsContent />;
}
```

### Check if a category is enabled

```typescript
import { useCategory, RentalObjectCategory } from '@digilist/client-sdk';

function CreateRentalObjectForm() {
  const canCreateArrangements = useCategory(RentalObjectCategory.ARRANGEMENT);
  
  return (
    <CategorySelect>
      <option value="LOCALE">Lokaler</option>
      {canCreateArrangements && (
        <option value="ARRANGEMENT">Arrangement</option>
      )}
    </CategorySelect>
  );
}
```

### Get all enabled categories

```typescript
import { useEnabledCategories } from '@digilist/client-sdk';

function CategoryFilter() {
  const categories = useEnabledCategories();
  
  return (
    <div>
      {categories.map(cat => (
        <FilterButton key={cat} value={cat}>
          {cat}
        </FilterButton>
      ))}
    </div>
  );
}
```

### Hide navigation items

```typescript
import { useFeature, FeatureFlag } from '@digilist/client-sdk';

function Navigation() {
  const showReporting = useFeature(FeatureFlag.BACKOFFICE_REPORTING);
  const showMessaging = useFeature(FeatureFlag.BACKOFFICE_MESSAGING);
  
  return (
    <nav>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/rental-objects">Rental Objects</NavLink>
      
      {showReporting && (
        <NavLink to="/reports">Reports</NavLink>
      )}
      
      {showMessaging && (
        <NavLink to="/messages">Messages</NavLink>
      )}
    </nav>
  );
}
```

---

## 2. Available Feature Flags

### Backoffice Modules
- `FeatureFlag.BACKOFFICE_ORG_MANAGEMENT` - Organization management
- `FeatureFlag.BACKOFFICE_REPORTING` - Reports and analytics
- `FeatureFlag.BACKOFFICE_AUDIT_LOG` - Audit log viewer
- `FeatureFlag.BACKOFFICE_MESSAGING` - Internal messaging
- `FeatureFlag.BACKOFFICE_MAINTENANCE_CALENDAR` - Maintenance/blackout calendar

### Web/Public Features
- `FeatureFlag.WEB_RATINGS` - User ratings system
- `FeatureFlag.WEB_FEEDBACK` - Feedback forms
- `FeatureFlag.WEB_PUBLIC_ACTIVITY_CALENDAR` - Public activity calendar
- `FeatureFlag.WEB_PAYMENTS` - Payment processing

### Rental Object Features
- `FeatureFlag.RENTAL_OBJECT_RECURRING_BOOKINGS` - Recurring bookings
- `FeatureFlag.RENTAL_OBJECT_PACKAGES` - Package deals
- `FeatureFlag.RENTAL_OBJECT_DISCOUNTS` - Discount codes

---

## 3. Available Categories

```typescript
enum RentalObjectCategory {
  LOCALE = 'LOCALE',           // Rooms/spaces
  ARRANGEMENT = 'ARRANGEMENT', // Events/activities
  EQUIPMENT = 'EQUIPMENT',     // Equipment (future)
  VEHICLE = 'VEHICLE',         // Vehicles (future)
  OTHER = 'OTHER',             // Other (placeholder)
}
```

---

## 4. Demo Configuration (Cheyenne Kommune)

The demo tenant has these settings:

**Enabled Categories:**
- ✅ LOCALE (Lokaler)
- ✅ ARRANGEMENT (Arrangement)
- ❌ EQUIPMENT (disabled)
- ❌ VEHICLE (disabled)
- ❌ OTHER (disabled)

**Enabled Features:**
- ✅ Organization Management
- ❌ Reporting (hidden for demo)
- ✅ Audit Log
- ✅ Messaging
- ✅ Maintenance Calendar
- ✅ Recurring Bookings
- ❌ Packages (disabled for demo)
- ❌ Discounts (disabled for demo)

---

## 5. API Enforcement (Backend)

The API will automatically enforce these restrictions:

### Example: Protected Route

```typescript
// API route with feature guard
fastify.get('/api/reports', {
  preHandler: [requireAuth, requireFeature('backoffice.reporting')],
  handler: async (request, reply) => {
    // Only accessible if feature is enabled
  },
});
```

### Example: Category Validation

```typescript
// Creating a rental object
fastify.post('/api/rental-objects', {
  preHandler: [requireAuth],
  handler: async (request, reply) => {
    const { category } = request.body;
    
    const isEnabled = await featureFlagsService.isCategoryEnabled(
      request.user.tenantId,
      category
    );
    
    if (!isEnabled) {
      return reply.status(403).send({
        type: 'https://api.digilist.no/errors/category-disabled',
        title: 'Category Disabled',
        status: 403,
        detail: `Category '${category}' is not enabled`,
      });
    }
    
    // Create rental object
  },
});
```

---

## 6. Next Steps

### To Complete Implementation:

1. **Run Migration**
   ```bash
   cd apps/api
   pnpm run db:migrate
   ```

2. **Seed Demo Tenant**
   ```bash
   pnpm run db:seed
   ```

3. **Add API Middleware** (see `docs/FEATURE_FLAGS_IMPLEMENTATION.md`)

4. **Update Frontend Components** to use feature gates

5. **Test Access Control**
   - Try accessing disabled features → should get 403
   - Try creating disabled categories → should get 403

---

## 7. Testing

```typescript
// Test feature access
const { data } = useTenantFeatures();
console.log('Enabled categories:', data.enabledRentalObjectCategories);
console.log('Feature flags:', data.featureFlags);

// Test specific feature
const canReport = useFeature('backoffice.reporting');
console.log('Can view reports:', canReport);

// Test category
const canUseArrangements = useCategory('ARRANGEMENT');
console.log('Can create arrangements:', canUseArrangements);
```

---

**Status**: ✅ SDK Implementation Complete  
**Next**: API middleware + frontend integration
