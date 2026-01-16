# App-Specific Capabilities System

**Last Updated:** 2026-01-16
**Status:** Authoritative

---

## Overview

The capabilities system provides a server-authoritative way to determine what a user can do in each application context. Instead of embedding role checks and business logic in the UI, capabilities are computed server-side and returned as a simple list that the UI can render.

---

## Why Server-Side Capabilities?

### Problems with Client-Side Role Checks

```tsx
// ❌ BAD: Role checks scattered in UI
function AdminPanel() {
  const { user } = useAuth();

  if (user.role === 'admin' || user.role === 'super_admin') {
    return <FullPanel />;
  }

  if (user.role === 'saksbehandler') {
    return <LimitedPanel />;
  }

  return <AccessDenied />;
}
```

**Issues:**
- Role logic duplicated across components
- UI must know role hierarchy
- Adding a role requires updating many files
- No single source of truth

### Benefits of Server-Side Capabilities

```tsx
// ✅ GOOD: Capability-driven UI
function AdminPanel() {
  const { data } = useBackofficeCapabilities();
  const { capabilities } = data?.data ?? {};

  if (!capabilities?.includes('CAP_SETTINGS_VIEW')) {
    return <AccessDenied />;
  }

  return <FullPanel />;
}
```

**Benefits:**
- Single source of truth (API)
- UI is declarative, not imperative
- Adding capabilities doesn't require UI changes
- Feature flags included in response

---

## Capability Endpoints

### Web App (Public)

```
GET /api/web/me/capabilities
```

**Authentication:** Optional (returns different caps for anonymous vs. authenticated)

**Response:**
```json
{
  "data": {
    "role": "anonymous" | "user",
    "capabilities": [
      "CAP_LISTING_VIEW",
      "CAP_LISTING_SEARCH",
      "CAP_BOOKING_CREATE"
    ],
    "featureFlags": {
      "enableReviews": true,
      "enableMap": true
    }
  }
}
```

### Minside (User Portal)

```
GET /api/minside/me/capabilities
```

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "role": "user",
    "capabilities": [
      "CAP_DASHBOARD_VIEW",
      "CAP_BOOKING_VIEW",
      "CAP_BOOKING_CANCEL",
      "CAP_PROFILE_EDIT",
      "CAP_GDPR_DATA_REQUEST"
    ],
    "featureFlags": {},
    "uiHints": {
      "showSettings": true
    }
  }
}
```

### Backoffice (Admin Portal)

```
GET /api/backoffice/me/capabilities
```

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "role": "admin" | "saksbehandler" | "case_handler",
    "capabilities": [
      "CAP_DASHBOARD_VIEW",
      "CAP_RENTAL_OBJECT_VIEW",
      "CAP_RENTAL_OBJECT_CREATE",
      "CAP_BOOKING_APPROVE",
      "CAP_REPORTS_VIEW"
    ],
    "featureFlags": {
      "enableSeasons": true
    },
    "uiHints": {
      "showAdminNav": true,
      "showReports": true,
      "showAudit": false,
      "showIntegrations": false,
      "showSettings": true
    }
  }
}
```

---

## Capability Naming Convention

### Format

```
CAP_{RESOURCE}_{ACTION}
```

### Examples

| Capability | Meaning |
|------------|---------|
| `CAP_LISTING_VIEW` | Can view listings |
| `CAP_LISTING_CREATE` | Can create new listings |
| `CAP_BOOKING_APPROVE` | Can approve bookings |
| `CAP_USER_ADMIN` | Full user management |
| `CAP_REPORTS_EXPORT` | Can export reports |
| `CAP_SYSTEM_CONFIG` | System configuration |

### Hierarchy

Some capabilities imply others:

- `CAP_*_ADMIN` implies `CAP_*_VIEW`
- `CAP_*_CREATE` usually implies `CAP_*_VIEW`
- `CAP_*_DELETE` usually implies `CAP_*_VIEW` and `CAP_*_EDIT`

---

## SDK Hooks

### useWebCapabilities

```tsx
import { useWebCapabilities } from '@digilist/client-sdk/hooks';

function BookingButton() {
  const { data, isLoading } = useWebCapabilities();

  if (isLoading) return <Spinner />;

  const canBook = data?.data.capabilities.includes('CAP_BOOKING_CREATE');

  if (!canBook) return null;
  return <Button>Book Now</Button>;
}
```

### useMinsideCapabilities

```tsx
import { useMinsideCapabilities } from '@digilist/client-sdk/hooks';

function ProfilePage() {
  const { data, error } = useMinsideCapabilities();

  if (error?.status === 401) {
    return <Navigate to="/login" />;
  }

  const canEdit = data?.data.capabilities.includes('CAP_PROFILE_EDIT');

  return <Profile editable={canEdit} />;
}
```

### useBackofficeCapabilities

```tsx
import { useBackofficeCapabilities } from '@digilist/client-sdk/hooks';

function BackofficeNav() {
  const { data } = useBackofficeCapabilities();
  const { uiHints } = data?.data ?? {};

  return (
    <Nav>
      <NavLink to="/dashboard">Dashboard</NavLink>
      {uiHints?.showReports && <NavLink to="/reports">Reports</NavLink>}
      {uiHints?.showAudit && <NavLink to="/audit">Audit</NavLink>}
      {uiHints?.showSettings && <NavLink to="/settings">Settings</NavLink>}
    </Nav>
  );
}
```

### Helper Hooks

```tsx
import {
  useHasCapability,
  useHasAllCapabilities,
  useHasAnyCapability,
  useFeatureFlag,
} from '@digilist/client-sdk/hooks';

function AdminFeature() {
  const canManage = useHasCapability('CAP_USER_ADMIN', 'backoffice');
  const hasFullAccess = useHasAllCapabilities(
    ['CAP_USER_ADMIN', 'CAP_SETTINGS_ADMIN'],
    'backoffice'
  );
  const canView = useHasAnyCapability(
    ['CAP_REPORTS_VIEW', 'CAP_AUDIT_VIEW'],
    'backoffice'
  );
  const seasonsEnabled = useFeatureFlag('enableSeasons', 'backoffice');

  // Use these booleans for rendering
}
```

---

## UI Hints

UI hints are pre-computed server-side to avoid capability checks for common patterns:

| Hint | Computed From |
|------|---------------|
| `showAdminNav` | Has any user management capability |
| `showReports` | `CAP_REPORTS_VIEW` |
| `showAudit` | `CAP_AUDIT_VIEW` |
| `showIntegrations` | `CAP_INTEGRATIONS_VIEW` |
| `showSettings` | `CAP_SETTINGS_VIEW` |

---

## Migration from Client-Side Roles

### Before (Client-Side)

```tsx
// apps/backoffice/src/lib/capabilities.ts
export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  admin: ['CAP_BOOKING_READ', ...],
  case_handler: ['CAP_BOOKING_READ', ...],
};

// Component
import { ROLE_CAPABILITIES } from '../lib/capabilities';

function Component() {
  const { user } = useAuth();
  const caps = ROLE_CAPABILITIES[user.role];
  // ...
}
```

### After (Server-Side)

```tsx
// Component
import { useBackofficeCapabilities } from '@digilist/client-sdk/hooks';

function Component() {
  const { data } = useBackofficeCapabilities();
  const caps = data?.data.capabilities ?? [];
  // ...
}
```

### Migration Steps

1. Deploy capabilities endpoints to API
2. Add SDK hooks
3. Update components to use hooks
4. Remove client-side capability mapping
5. Clean up deprecated code

---

## Feature Flags Integration

Feature flags are included in the capabilities response:

```json
{
  "featureFlags": {
    "enableSeasons": true,
    "enableReviews": true,
    "enableMap": false
  }
}
```

Use in components:

```tsx
const { data } = useBackofficeCapabilities();
const { featureFlags } = data?.data ?? {};

if (featureFlags?.enableSeasons) {
  return <SeasonsFeature />;
}
```

---

## Best Practices

1. **Check capabilities, not roles** - Roles are implementation details
2. **Use server response** - Don't compute capabilities in UI
3. **Cache responses** - 5-minute staleTime is reasonable
4. **Handle loading states** - Show skeleton/spinner while loading
5. **Graceful degradation** - Assume no capabilities if fetch fails

---

## References

- `apps/api/src/modules/capabilities/capabilities.controller.ts` - Endpoint implementation
- `packages/client-sdk/src/hooks/use-capabilities.ts` - SDK hooks
- `tests/unit/capabilities.test.ts` - Test coverage
