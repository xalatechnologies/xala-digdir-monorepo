# apps/saas-admin - SaaS Administration Portal

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **saas-admin** app is the SaaS administration portal for the Xala/Digilist Platform. It provides platform operators with tools to manage billing, subscriptions, feature entitlements, plans, and route/navigation policies across all tenants.

**Port:** 5177
**URL (local):** http://localhost:5177
**URL (test):** https://saas-admin-test.digilist.no

---

## Key Characteristics

- **Super-admin only** - Platform operator access
- **Cross-tenant management** - View and configure all kommuner
- **Billing & subscriptions** - Plan management, entitlements
- **Feature flags** - Enable/disable features per tenant
- **Route policies** - Configure API route access per plan
- **Navigation policies** - Configure UI navigation per plan
- **Seed data management** - Initialize and reset system data

---

## Directory Structure

```
apps/saas-admin/
├── src/
│   ├── routes/              # React Router routes
│   │   ├── dashboard.tsx    # Overview dashboard
│   │   ├── plans/           # Plan management
│   │   ├── entitlements/    # Entitlement configuration
│   │   ├── route-policies/  # API route policies
│   │   ├── nav-policies/    # Navigation policies
│   │   ├── tenants/         # Tenant management
│   │   ├── seed-data/       # Seed data management
│   │   └── settings/        # System settings
│   ├── components/          # SaaS-specific components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service calls
│   ├── providers/           # Context providers
│   └── main.tsx             # App entry point
├── public/                  # Static assets
│   └── themes/              # Theme CSS files
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/saas-admin dev        # Start dev server
pnpm --filter @xala/saas-admin build      # Production build
pnpm --filter @xala/saas-admin preview    # Preview production build

# From this directory
pnpm dev                                  # Start dev server (port 5177)
pnpm build                                # Production build
pnpm preview                              # Preview build
```

---

## App-Specific Rules

### 1. Super-Admin Authentication
- **Requires platform operator role**
- Not accessible to kommune admins
- Separate authentication context
- MFA recommended

### 2. Cross-Tenant Operations
- Can view all tenants/kommuner
- Can modify global settings
- Changes affect all tenants
- Audit logging is critical

### 3. Plan & Entitlement Management
- Plans define feature bundles
- Entitlements define specific permissions
- Route policies control API access
- Nav policies control UI visibility

### 4. Seed Data Safety
- Seed operations are dangerous
- Require confirmation dialogs
- Log all seed operations
- Never run in production without backup

---

## Key Features

### Plan Management
- **Location:** `src/routes/plans/`
- Create and edit subscription plans
- Define plan tiers (Free, Basic, Pro, Enterprise)
- Set pricing and billing cycles
- Map entitlements to plans

### Entitlement Configuration
- **Location:** `src/routes/entitlements/`
- Define feature entitlements
- Map entitlements to capabilities
- Configure limits and quotas
- Enable/disable features globally

### Route Policies
- **Location:** `src/routes/route-policies/`
- Configure API endpoint access
- Set per-plan route permissions
- Define rate limits per plan
- Manage route wildcards

### Navigation Policies
- **Location:** `src/routes/nav-policies/`
- Configure UI navigation items
- Set visibility per plan/role
- Define menu structure
- Control feature discoverability

### Tenant Management
- **Location:** `src/routes/tenants/`
- View all kommuner
- Modify tenant plans
- Override entitlements
- View tenant usage

### Seed Data Management
- **Location:** `src/routes/seed-data/`
- Initialize system data
- Reset specific tables
- Import/export configurations
- Manage test data

---

## Integration Points

### SDK Services Used
```tsx
import {
  useAuth,                # Authentication
  usePlans,               # Plan management
  useEntitlements,        # Entitlement CRUD
  useRoutePolicies,       # Route policy config
  useNavPolicies,         # Nav policy config
  useTenants,             # Tenant management
  useSeedData,            # Seed data operations
} from '@digilist/client-sdk/hooks';
```

### SaaS Schema Tables
```sql
-- saas.* schema tables
saas.plans
saas.plan_entitlements
saas.route_policies
saas.nav_policies
saas.feature_flags
saas.tenant_overrides
```

---

## Routing Structure

```
/                           # Dashboard
/login                      # Login page
/plans                      # Plan list
/plans/new                  # Create plan
/plans/:id                  # Edit plan
/entitlements               # Entitlement list
/entitlements/:id           # Edit entitlement
/route-policies             # Route policies
/nav-policies               # Nav policies
/tenants                    # Tenant list
/tenants/:id                # Tenant details
/seed-data                  # Seed data management
/settings                   # System settings
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_SAAS_MODE=true
```

---

## Common Patterns

### Plan Configuration
```tsx
import { usePlans, useCreatePlan } from '@digilist/client-sdk/hooks';

export function PlanEditor() {
  const { data: plans } = usePlans();
  const { mutate: createPlan } = useCreatePlan();

  const handleCreate = (planData: CreatePlanInput) => {
    createPlan(planData, {
      onSuccess: () => toast.success('Plan created'),
    });
  };

  return <PlanForm plans={plans} onSubmit={handleCreate} />;
}
```

### Route Policy Management
```tsx
import { useRoutePolicies } from '@digilist/client-sdk/hooks';

export function RoutePolicyList() {
  const { data: policies } = useRoutePolicies();

  return (
    <DataTable
      data={policies}
      columns={[
        { key: 'path', label: 'API Path' },
        { key: 'method', label: 'Method' },
        { key: 'plans', label: 'Allowed Plans' },
      ]}
    />
  );
}
```

### Seed Data Operations
```tsx
import { useSeedData } from '@digilist/client-sdk/hooks';

export function SeedDataPanel() {
  const { seedRoutePolicies, seedNavPolicies } = useSeedData();

  const handleSeed = async () => {
    if (confirm('This will reset seed data. Continue?')) {
      await seedRoutePolicies();
      await seedNavPolicies();
      toast.success('Seed data applied');
    }
  };

  return <Button onClick={handleSeed}>Apply Seed Data</Button>;
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/saas-admin-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)

```bash
# Run saas-admin-specific E2E tests
pnpm test:e2e tests/e2e/saas-admin-*.spec.ts
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:saas-admin

# Preview locally
pnpm preview
```

---

## Common Issues

### 1. Seed Data Failing
- Check database connection
- Verify saas schema exists
- Check table permissions
- Review seed script logs

### 2. Route Policies Not Applied
- Clear policy cache
- Verify policy syntax
- Check plan mappings
- Review API logs

### 3. Nav Policies Not Showing
- Verify policy is active
- Check plan entitlements
- Clear browser cache
- Verify user plan

---

## Thin App Compliance

This app follows the **Thin App Strategy**:
- All UI components imported from `@xala/ds`
- No business logic in UI (SDK-first)
- No hardcoded styles (design tokens only)
- All text localized via `@xala/i18n`

**Note:** This app has 8 direct fetch() calls that need migration to SDK hooks.

---

## When in Doubt

1. Is user a platform operator? -> Verify super-admin role
2. Will this affect all tenants? -> Add confirmation dialog
3. Is this a destructive operation? -> Log and confirm
4. Check root CLAUDE.md for architecture rules
5. Use SDK hooks for ALL data operations
6. Import components from `@xala/ds` only
7. Use `t()` for ALL user-facing text

---

**Last Updated:** 2026-01-20
**Status:** Production Ready
**Next Review:** After significant changes
