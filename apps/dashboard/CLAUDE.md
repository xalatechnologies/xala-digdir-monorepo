# apps/dashboard - User Portal Application

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **dashboard** app is the user portal for the Xala/Digilist Platform. It provides end-users with a personalized dashboard to manage their bookings, profile, and preferences.

**Port:** 5174
**URL (local):** http://localhost:5174
**URL (test):** https://dashboard-test.digilist.no

---

## Key Characteristics

- **User-focused** - Personal dashboard and booking management
- **Authentication required** - All routes require login
- **Mobile-optimized** - Designed for on-the-go access
- **Notification-rich** - In-app notifications and alerts
- **Self-service** - Users manage own bookings and profile
- **GDPR-compliant** - Data export, deletion requests, consent management

---

## Directory Structure

```
apps/dashboard/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── dashboard/      # User dashboard (overview)
│   │   ├── bookings/       # My bookings
│   │   ├── profile/        # User profile management
│   │   ├── notifications/  # Notification center
│   │   ├── favorites/      # Saved listings
│   │   ├── payments/       # Payment methods and history
│   │   └── settings/       # User settings and preferences
│   ├── routes/             # React Router routes
│   ├── components/         # Shared UI components
│   │   └── layout/         # Layout components (Sidebar, Header)
│   ├── providers/          # Context providers (Auth, Theme)
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
pnpm --filter @xala/dashboard dev        # Start dev server
pnpm --filter @xala/dashboard build      # Production build
pnpm --filter @xala/dashboard preview    # Preview production build

# From this directory
pnpm dev                               # Start dev server
pnpm build                             # Production build
pnpm preview                           # Preview build
```

---

## App-Specific Rules

### 1. Authentication Required
- **ALL routes require authentication**
- Redirect unauthenticated users to `/login`
- Use `ProtectedRoute` wrapper for all pages
- Support multiple auth methods (Vipps, Microsoft, Google)

### 2. User-Centric Design
- Personalized dashboard on login
- Quick access to active bookings
- Unread notification badge
- Recent activity timeline
- Favorite listings

### 3. Mobile-First
- Touch-friendly navigation (bottom nav on mobile)
- Responsive sidebar (drawer on mobile)
- Thumb-zone optimization for CTAs
- Offline capability for viewing bookings

### 4. Notification System
- In-app notification center
- Toast notifications for important updates
- Email/SMS notification preferences
- Push notification support (PWA)
- Real-time WebSocket updates

### 5. GDPR Compliance
- Data export functionality (JSON/CSV)
- Data deletion requests
- Consent management
- Privacy settings
- Activity log (user can view own actions)

---

## Key Features

### Dashboard
- **Location:** `src/features/dashboard/`
- Overview of active bookings
- Upcoming events
- Recent notifications
- Quick actions (new booking, view favorites)
- Statistics (total bookings, total spent)

### My Bookings
- **Location:** `src/features/bookings/`
- List of all bookings (past, active, upcoming)
- Filter by status and date
- Booking details view
- Cancel booking with refund tracking
- Modify booking (if allowed)
- Download booking confirmation (PDF)

### User Profile
- **Location:** `src/features/profile/`
- Personal information
- Contact details
- Profile picture upload
- Verify email/phone
- Connected accounts (social login)

### Notification Center
- **Location:** `src/features/notifications/`
- Unread badge count
- Notification list (sortable, filterable)
- Mark as read/unread
- Notification preferences (email, SMS, push)
- Notification history

### Favorites
- **Location:** `src/features/favorites/`
- Saved listings for quick access
- Remove from favorites
- Book directly from favorites

### Payment Methods
- **Location:** `src/features/payments/`
- Saved payment methods (cards, Vipps)
- Add/remove payment methods
- Set default payment method
- Payment history and invoices

### Settings
- **Location:** `src/features/settings/`
- Language preference
- Theme (light/dark/auto)
- Notification preferences
- Privacy settings (GDPR)
- Data export/deletion requests

---

## Integration Points

### SDK Services Used
```tsx
import {
  useAuth,                # User authentication
  useUser,                # User profile
  useBookings,            # User's bookings
  useNotifications,       # Notification center
  useFavorites,           # Saved listings
  usePaymentMethods,      # Payment methods
  useGDPR,                # GDPR operations
} from '@digilist/client-sdk/hooks';
```

### Realtime Events
```tsx
import { realtimeClient } from '@digilist/client-sdk';

// Subscribe to user-specific notifications
realtimeClient.onNotification((notification) => {
  // Show toast
  showNotification(notification);
  // Update unread count
  queryClient.invalidateQueries(['notifications']);
});
```

---

## Routing Structure

```
/                           # Dashboard (protected)
/login                      # Login page
/bookings                   # My bookings
/bookings/:id               # Booking details
/profile                    # User profile
/notifications              # Notification center
/favorites                  # Saved listings
/payments                   # Payment methods
/settings                   # User settings
/settings/privacy           # Privacy settings
/settings/notifications     # Notification preferences
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_TENANT_ID=default
VITE_VIPPS_CLIENT_ID=...
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

### Notification Badge
```tsx
import { useNotifications } from '@digilist/client-sdk/hooks';
import { Badge } from '@xala/ds';

export function NotificationBadge() {
  const { data: notifications } = useNotifications({ unreadOnly: true });
  const unreadCount = notifications?.length ?? 0;

  return (
    <Badge count={unreadCount} max={99}>
      <NotificationIcon />
    </Badge>
  );
}
```

### Mobile Navigation
```tsx
import { Drawer, Navigation } from '@xala/ds';
import { useMediaQuery } from '@xala/ds/hooks';

export function AppNavigation() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
        <Navigation items={navItems} />
      </Drawer>
    );
  }

  return <Sidebar><Navigation items={navItems} /></Sidebar>;
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/dashboard-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)

```bash
# Run dashboard-specific E2E tests
pnpm test:e2e tests/e2e/dashboard-*.spec.ts

# Run unit tests
pnpm test
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:dashboard

# Preview locally
pnpm preview
```

**Output:** `dist/` directory with static assets.

---

## Common Issues

### 1. Login Not Working
- Check `useAuth()` hook is properly configured
- Verify API URL is correct
- Check authentication flow (Vipps/Microsoft/Google)
- Inspect browser console for auth errors

### 2. Notifications Not Appearing
- Check WebSocket connection is active
- Verify `onNotification` subscription
- Check notification permissions (browser/device)
- Ensure user has notifications enabled in settings

### 3. Mobile Navigation Issues
- Verify media query breakpoints
- Check sidebar/drawer component state
- Test on actual mobile devices (not just browser resize)
- Validate touch event handlers

---

## Performance Considerations

- Lazy load heavy features (booking calendar, payment forms)
- Cache user profile and bookings
- Optimize images (profile pictures, listing images)
- Use service worker for offline capability

---

## GDPR Features

### Data Export
```tsx
import { useGDPR } from '@digilist/client-sdk/hooks';

function PrivacySettings() {
  const { exportData } = useGDPR();

  const handleExport = async () => {
    const data = await exportData();
    downloadFile(data, 'my-data.json');
  };

  return <Button onClick={handleExport}>Export My Data</Button>;
}
```

### Data Deletion
```tsx
import { useGDPR } from '@digilist/client-sdk/hooks';

function DeleteAccount() {
  const { requestDeletion } = useGDPR();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await requestDeletion();
      // User will be logged out
    }
  };

  return <Button variant="danger" onClick={handleDelete}>Delete My Account</Button>;
}
```

---

## When in Doubt

1. Is user authenticated? → Check `useAuth()` first
2. Should this be mobile-optimized? → Yes, always
3. Should this update in real-time? → Subscribe to WebSocket events
4. Does user need to control this? → Add to settings
5. Check root CLAUDE.md for architecture rules
6. Use SDK hooks for ALL data operations
7. Import components from `@xala/ds` only
8. Use `t()` for ALL user-facing text

---

## 🔒 CRITICAL LESSONS LEARNED (2026-01-17)

> **⚠️ MANDATORY READING**
> 
> These lessons come from a 4-hour production debugging session that fixed critical authentication issues.
> **ALL developers working on apps/dashboard MUST read these.**

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

### Recommended AI Skill for apps/dashboard

When working on apps/dashboard, use: **frontend-developer**

Available in: `.claude/skills/frontend-developer/`

### Critical Rules for apps/dashboard

1. **Database Schema:** Tables MUST be in named schemas (platform, domain, compliance)
2. **Authentication:** System is LOCKED - no changes without approval
3. **Deployment:** Follow mandatory checklist in AI_RULES.md
4. **Testing:** Test authentication after ANY deployment
5. **Documentation:** Update docs when making significant changes

### Quick Validation

Before deploying changes to apps/dashboard:

```bash
# 1. Verify database schemas
psql -d digilist_prod -c "\dn"

# 2. Rebuild if SDK changed
pnpm -F apps/dashboard build

# 3. Test locally
pnpm -F apps/dashboard dev

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
