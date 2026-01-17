# apps/backoffice - Admin Portal Application

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **backoffice** app is the administrative portal for the Xala/Digilist Platform. It provides kommune administrators and staff with tools to manage listings, bookings, users, and system configuration.

**Port:** 5175
**URL (local):** http://localhost:5175
**URL (test):** https://backoffice-test.digilist.no

---

## Key Characteristics

- **Private application** - All routes require authentication
- **RBAC-enforced** - Role-based access control for all features
- **Multi-tenant admin** - Manage resources for specific kommune
- **Audit-first** - All admin actions are logged
- **Data-intensive** - Tables, forms, bulk operations
- **Real-time updates** - WebSocket for live booking/listing changes

---

## Directory Structure

```
apps/backoffice/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── listings/       # Listing management (CRUD)
│   │   ├── bookings/       # Booking management
│   │   ├── users/          # User management
│   │   ├── rental-objects/ # Rental object wizard
│   │   ├── reports/        # Analytics and reports
│   │   ├── settings/       # System settings
│   │   └── integrations/   # Third-party integrations
│   ├── routes/             # React Router routes
│   ├── components/         # Shared UI components
│   ├── providers/          # Context providers (Auth, Realtime)
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper utilities
│   └── main.tsx            # App entry point
├── public/                 # Static assets
│   └── themes/             # Theme CSS files
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/backoffice dev        # Start dev server
pnpm --filter @xala/backoffice build      # Production build
pnpm --filter @xala/backoffice preview    # Preview production build

# From this directory
pnpm dev                                  # Start dev server
pnpm build                                # Production build
pnpm preview                              # Preview build
```

---

## App-Specific Rules

### 1. Authentication Required
- **ALL routes require authentication**
- Redirect unauthenticated users to login
- Use `ProtectedRoute` wrapper for all pages
- Check user roles before rendering admin features

### 2. RBAC Enforcement
- Check `user.role` and `user.permissions` before showing features
- Use capability-based guards (not hardcoded role checks)
- Disable/hide UI for unauthorized actions
- Server-side validation is always enforced (don't bypass)

### 3. Audit Logging
- All mutations (create, update, delete) are automatically logged
- Display audit trail in UI where relevant
- Include user context in all operations
- Use SDK methods (they handle audit logging)

### 4. Multi-Tenant Context
- All operations scoped to user's kommune (tenant)
- No cross-tenant data access
- Tenant ID automatically included in API calls via SDK
- Display tenant branding (logo, colors, name)

### 5. Real-Time Updates
- Use `RealtimeProvider` for WebSocket connection
- Subscribe to relevant channels (bookings, listings, audit events)
- Update UI automatically on server events
- Show toast notifications for important changes

---

## Key Features

### Listing Management
- **Location:** `src/features/listings/`
- CRUD operations for listings
- Bulk import/export
- Image gallery management
- Availability calendar configuration
- Pricing rules and discounts

### Booking Management
- **Location:** `src/features/bookings/`
- View all bookings (table view with filters)
- Approve/reject bookings
- Modify booking details
- Cancel bookings with refund options
- Booking conflict resolution

### Rental Objects Wizard
- **Location:** `src/features/rental-objects/`
- Multi-step form for creating rental objects
- Drag-and-drop image uploads
- Availability configuration
- Pricing setup
- Preview before publishing

### User Management
- **Location:** `src/features/users/`
- Invite new users
- Manage user roles and permissions
- View user activity
- Deactivate/reactivate users

### Reports & Analytics
- **Location:** `src/features/reports/`
- Booking statistics
- Revenue reports
- Usage metrics
- Export to CSV/PDF

### Settings & Configuration
- **Location:** `src/features/settings/`
- Kommune profile
- Integrations (Vipps, accounting systems)
- Email templates
- Notification preferences

---

## Integration Points

### SDK Services Used
```tsx
import {
  useAuth,                # User authentication
  useListings,            # Listing CRUD
  useBookings,            # Booking management
  useUsers,               # User management
  useOrganization,        # Kommune settings
  useReports,             # Analytics data
  useIntegrations,        # Integration management
  useAuditLog,            # Audit trail
  useNotifications,       # Notification system
} from '@digilist/client-sdk/hooks';
```

### Realtime Events
```tsx
import { realtimeClient } from '@digilist/client-sdk';

// Subscribe to booking events
realtimeClient.onBooking((event) => {
  // Refresh bookings table
  queryClient.invalidateQueries(['bookings']);
});

// Subscribe to rental object events
realtimeClient.onRentalObject((event) => {
  // Update UI
});
```

---

## Routing Structure

```
/                           # Dashboard (protected)
/login                      # Login page
/listings                   # Listing management
/listings/new               # Create listing
/listings/:id               # Edit listing
/bookings                   # Booking management
/bookings/:id               # Booking details
/rental-objects             # Rental objects
/rental-objects/new         # Rental object wizard
/rental-objects/:id         # Edit rental object
/users                      # User management
/users/invite               # Invite user
/reports                    # Reports dashboard
/reports/bookings           # Booking reports
/reports/revenue            # Revenue reports
/settings                   # Settings
/settings/profile           # Kommune profile
/settings/integrations      # Integrations
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_TENANT_ID=default
```

---

## Common Patterns

### Protected Route
```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@digilist/client-sdk/hooks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

### RBAC Guard
```tsx
import { useAuth } from '@digilist/client-sdk/hooks';

export function AdminOnlyFeature() {
  const { user } = useAuth();

  // Check capabilities, not hardcoded roles
  if (!user?.permissions.includes('admin:write')) {
    return <AccessDenied />;
  }

  return <AdminContent />;
}
```

### Audit Trail Display
```tsx
import { useAuditLog } from '@digilist/client-sdk/hooks';

export function AuditTrail({ resourceId }: { resourceId: string }) {
  const { data: auditLogs } = useAuditLog({ resourceId });

  return (
    <Table>
      {auditLogs?.map(log => (
        <TableRow key={log.id}>
          <TableCell>{log.action}</TableCell>
          <TableCell>{log.user.name}</TableCell>
          <TableCell>{formatDate(log.timestamp)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/backoffice-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)
- **Integration:** `tests/integration/backoffice/`

```bash
# Run backoffice-specific E2E tests
pnpm test:e2e tests/e2e/backoffice-*.spec.ts

# Run rental objects tests
pnpm test:rental-objects
pnpm test:rental-objects:all
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:backoffice

# Preview locally
pnpm preview
```

**Output:** `dist/` directory with static assets.

---

## Common Issues

### 1. WebSocket Connection Failing
- Check `VITE_WS_URL` is correct
- Verify realtime client is initialized in `main.tsx`
- Check `RealtimeProvider` wraps app
- Inspect browser console for connection errors

### 2. RBAC Not Working
- Verify user has correct role and permissions
- Check backend permissions match frontend checks
- Ensure capability-based guards (not role strings)
- Check audit logs for authorization errors

### 3. Real-Time Updates Not Appearing
- Verify WebSocket connection is active
- Check event subscription matches backend event names
- Ensure React Query cache is invalidated on events
- Check realtime client is connected to correct tenant channel

---

## Performance Considerations

- Tables can have 1000+ rows → use virtualization
- Bulk operations should show progress indicators
- Image uploads should show upload progress
- Use optimistic updates for better UX

---

## When in Doubt

1. Is user authenticated? → Check `useAuth()` first
2. Does user have permission? → Check capabilities
3. Will this mutation be logged? → Yes, SDK handles it
4. Should this update in real-time? → Subscribe to WebSocket events
5. Check root CLAUDE.md for architecture rules
6. Use SDK hooks for ALL data operations
7. Import components from `@xala/ds` only
8. Use `t()` for ALL user-facing text

---

## 🔒 CRITICAL LESSONS LEARNED (2026-01-17)

> **⚠️ MANDATORY READING**
> 
> These lessons come from a 4-hour production debugging session that fixed critical authentication issues.
> **ALL developers working on apps/backoffice MUST read these.**

### Required Reading

1. **`docs/architecture/AUTHENTICATION_SYSTEM.md`** (comprehensive)
   - Complete authentication flow
   - Cookie architecture
   - Database schema requirements
   - Troubleshooting guide

2. **`docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`** (detailed)
   - Root cause analysis
   - 10 critical lessons learned
   - Anti-patterns to avoid
   - Process improvements

3. **Root `CLAUDE.md`** → Critical Lessons Learned section

4. **Root `AI_RULES.md`** → Hard Lines section

### Recommended AI Skill for apps/backoffice

When working on apps/backoffice, use: **frontend-developer**

Available in: `.claude/skills/frontend-developer/`

### Critical Rules for apps/backoffice

1. **Database Schema:** Tables MUST be in named schemas (platform, domain, compliance)
2. **Authentication:** System is LOCKED - no changes without approval
3. **Deployment:** Follow mandatory checklist in AI_RULES.md
4. **Testing:** Test authentication after ANY deployment
5. **Documentation:** Update docs when making significant changes

### Quick Validation

Before deploying changes to apps/backoffice:

```bash
# 1. Verify database schemas
psql -d digilist_prod -c "\dn"

# 2. Rebuild if SDK changed
pnpm -F apps/backoffice build

# 3. Test locally
pnpm -F apps/backoffice dev

# 4. Deploy
# (Follow deployment checklist)

# 5. Test authentication
# - BankID login → Dashboard
# - Demo login → Dashboard
# - Check browser cookies
```

---

**Last Updated:** 2026-01-17
**Status:** Production Stable
**Next Review:** After significant changes
