# apps/monitoring - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5175)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e tests/e2e/monitoring-*.spec.ts  # Monitoring E2E tests

# Deployment
pnpm deploy:monitoring      # Deploy to test environment
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/monitoring dev
pnpm --filter @xala/monitoring build
pnpm --filter @xala/monitoring test
```

## Key Files

- `src/main.tsx` - App entry point
- `src/routes/` - Protected route definitions
- `src/components/layout/Sidebar.tsx` - Main navigation
- `src/routes/overview.tsx` - System overview dashboard
- `src/routes/incidents.tsx` - Incident management
- `src/routes/synthetics.tsx` - Synthetic monitors
- `vite.config.ts` - Build configuration

## SDK Services Used

- `useAuth()` - Authentication
- `monitoringService` - System monitoring data
- `useHealth()` - System health status
- `useMetrics()` - Performance metrics
- `useIncidents()` - Incident management
- `useLogs()` - System logs
- Observability package - Grafana integration

## Common Tasks

### Add New User Feature
1. Create feature directory in `src/features/`
2. Add route with `ProtectedRoute` wrapper
3. Add navigation item to Sidebar
4. Implement with user-centric design
5. Test on mobile viewport

### Add Notification Type
1. Define notification type in SDK
2. Subscribe to WebSocket event
3. Update notification center UI
4. Add notification preference setting

### Add GDPR Feature
```tsx
import { useGDPR } from '@digilist/client-sdk/hooks';

function GDPRFeature() {
  const { exportData, requestDeletion } = useGDPR();

  // Export user data
  const handleExport = async () => {
    const data = await exportData();
    downloadFile(data, 'my-data.json');
  };

  // Request account deletion
  const handleDelete = async () => {
    await requestDeletion();
  };
}
```

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# E2E tests
pnpm test:e2e tests/e2e/minside-*.spec.ts          # Minside-specific
pnpm test:e2e tests/e2e/minside-mobile.spec.ts     # Mobile tests
pnpm test:e2e tests/e2e/minside-offline.spec.ts    # Offline tests
pnpm test:e2e tests/e2e/minside-protected-route.spec.ts  # Auth tests
```

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_TENANT_ID=default
VITE_VIPPS_CLIENT_ID=...
```

## Debugging

```bash
# Check auth status
# Browser console: localStorage.getItem('minside_user')

# Test API connectivity
curl https://api.digilist.no/health

# Check WebSocket connection
# Browser console → Network tab → WS filter
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:minside        # Deploy to minside-test.digilist.no
```

## Mobile Testing

```bash
# Test responsive design
# Chrome DevTools → Device toolbar (Cmd+Shift+M)

# Test on actual devices
# Use ngrok or similar to expose local dev server
npx ngrok http 5174
```

## Important Notes

- **All routes are protected** - Require authentication
- **Mobile-first** - Test on mobile viewport first
- **Real-time notifications** - WebSocket required
- **GDPR compliant** - Data export/deletion available
- **Multi-auth** - Supports Vipps, Microsoft, Google
