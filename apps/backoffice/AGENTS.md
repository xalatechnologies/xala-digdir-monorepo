# apps/backoffice - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5175)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e tests/e2e/backoffice-*.spec.ts  # Backoffice E2E tests
pnpm test:rental-objects    # Rental objects tests
pnpm test:rental-objects:all  # All rental objects tests

# Deployment
pnpm deploy:backoffice      # Deploy to test environment
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/backoffice dev
pnpm --filter @xala/backoffice build
pnpm --filter @xala/backoffice test
```

## Key Files

- `src/main.tsx` - App entry point with RealtimeProvider
- `src/routes/` - Protected route definitions
- `src/features/` - Feature modules (listings, bookings, users, etc.)
- `src/features/rental-objects/` - Rental object wizard
- `vite.config.ts` - Build configuration

## SDK Services Used

- `useAuth()` - Authentication and user context
- `useListings()` - Listing CRUD operations
- `useBookings()` - Booking management
- `useUsers()` - User management
- `useOrganization()` - Kommune settings
- `useReports()` - Analytics data
- `useIntegrations()` - Integration management
- `useAuditLog()` - Audit trail viewing
- `realtimeClient` - WebSocket events

## Common Tasks

### Add New Admin Feature
1. Create feature directory in `src/features/`
2. Implement with RBAC guards
3. Add route with `ProtectedRoute` wrapper
4. Subscribe to relevant WebSocket events if needed
5. Add audit logging for mutations

### Add RBAC Check
```tsx
import { useAuth } from '@digilist/client-sdk/hooks';

function MyFeature() {
  const { user } = useAuth();

  if (!user?.permissions.includes('feature:write')) {
    return <AccessDenied />;
  }

  return <FeatureContent />;
}
```

### Subscribe to Real-Time Events
```tsx
import { realtimeClient } from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    realtimeClient.onBooking(() => {
      queryClient.invalidateQueries(['bookings']);
    });
  }, [queryClient]);
}
```

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# Rental objects tests (comprehensive test suite)
pnpm test:rental-objects              # Basic tests
pnpm test:rental-objects:performance  # Performance tests
pnpm test:rental-objects:security     # Security tests
pnpm test:rental-objects:scenarios    # Scenario tests
pnpm test:rental-objects:e2e          # E2E tests
pnpm test:rental-objects:all          # All rental objects tests

# E2E tests
pnpm test:e2e tests/e2e/backoffice-*.spec.ts  # Backoffice-specific
pnpm test:e2e tests/e2e/rental-objects.spec.ts  # Rental objects E2E
```

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_TENANT_ID=default
```

## Debugging Real-Time

```bash
# Check WebSocket connection
# In browser console:
# - Look for "WebSocket connected" message
# - Check Network tab → WS filter
# - Verify events are being received
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:backoffice     # Deploy to backoffice-test.digilist.no
```

## Common Debugging

```bash
# Check if user is authenticated
# Browser console: localStorage.getItem('backoffice_mock_user')

# Test API connectivity
curl https://api.digilist.no/health

# Check realtime events
# Enable console logging in realtimeClient.ts
```

## Important Notes

- **All routes are protected** - Require authentication
- **RBAC enforced** - Check permissions before rendering features
- **WebSocket required** - RealtimeProvider must wrap app
- **Audit logging automatic** - SDK handles logging for all mutations
- **Multi-tenant** - All operations scoped to user's kommune
