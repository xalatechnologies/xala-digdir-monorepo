# apps/saas-admin - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5177)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e tests/e2e/saas-admin-*.spec.ts  # SaaS Admin E2E tests

# Deployment
pnpm deploy:saas-admin      # Deploy to test environment
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/saas-admin dev
pnpm --filter @xala/saas-admin build
pnpm --filter @xala/saas-admin test
```

## Key Files

- `src/main.tsx` - App entry point
- `src/routes/` - Route definitions (plans, entitlements, policies, tenants)
- `src/services/` - API service calls
- `src/components/` - SaaS-specific components
- `vite.config.ts` - Build configuration (port 5177)

## SDK Services Used

- `useAuth()` - Authentication
- `usePlans()` - Plan management
- `useEntitlements()` - Entitlement CRUD
- `useRoutePolicies()` - API route policies
- `useNavPolicies()` - UI navigation policies
- `useTenants()` - Tenant management
- `useSeedData()` - Seed data operations

## Common Tasks

### Add New Plan Feature
1. Define plan in `src/routes/plans/`
2. Map entitlements to plan
3. Configure route policies
4. Configure nav policies
5. Test across all plan tiers

### Add Route Policy
```tsx
import { useRoutePolicies, useCreateRoutePolicy } from '@digilist/client-sdk/hooks';

function AddRoutePolicy() {
  const { mutate: createPolicy } = useCreateRoutePolicy();

  createPolicy({
    path: '/api/feature/*',
    method: 'ALL',
    allowedPlans: ['pro', 'enterprise'],
  });
}
```

### Run Seed Data
```tsx
import { useSeedData } from '@digilist/client-sdk/hooks';

function SeedPanel() {
  const { seedAll, seedRoutePolicies, seedNavPolicies } = useSeedData();

  // Seed all data
  await seedAll();

  // Or specific tables
  await seedRoutePolicies();
  await seedNavPolicies();
}
```

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# E2E tests
pnpm test:e2e tests/e2e/saas-admin-*.spec.ts  # SaaS Admin tests
pnpm test:e2e tests/e2e/saas-admin-plans.spec.ts  # Plan tests
pnpm test:e2e tests/e2e/saas-admin-policies.spec.ts  # Policy tests
```

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_SAAS_MODE=true
```

## Database Schema

```sql
-- SaaS schema tables (saas.*)
saas.plans
saas.plan_entitlements
saas.route_policies
saas.nav_policies
saas.feature_flags
saas.tenant_overrides
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:saas-admin      # Deploy to saas-admin-test.digilist.no
```

## Common Debugging

```bash
# Check database connection
psql -d digilist_dev -c "SELECT * FROM saas.plans LIMIT 5;"

# Check route policies
psql -d digilist_dev -c "SELECT * FROM saas.route_policies;"

# Check nav policies
psql -d digilist_dev -c "SELECT * FROM saas.nav_policies;"

# Test API connectivity
curl https://api.digilist.no/health
```

## Important Notes

- **Super-admin only** - Platform operators only
- **Cross-tenant impact** - Changes affect all kommuner
- **Seed data caution** - Can reset system data
- **Audit everything** - All operations are logged
- **SDK migration needed** - 8 fetch calls to migrate

## Thin App Rules

- Import ALL components from `@xala/ds`
- Use SDK hooks for ALL data operations (migration in progress)
- No inline styles (use design tokens)
- All text through `t()` function
