# apps/monitoring - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5178)
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

- `src/main.tsx` - App entry point with providers
- `src/routes/` - Route definitions (dashboard, health, metrics, alerts, incidents)
- `src/components/` - Monitoring-specific components
- `vite.config.ts` - Build configuration (port 5178)

## SDK Services Used

- `useAuth()` - Authentication and user context
- `useMonitoringMetrics()` - System metrics data
- `useHealthChecks()` - Service health status
- `useAlerts()` - Alert management
- `useIncidents()` - Incident tracking
- `realtimeClient` - WebSocket for live updates

## Observability Integration

```tsx
import { MetricsCollector, AlertRules } from '@xala/observability';

// 36 predefined metrics available
// 11 configurable alert rules
// Real-time health monitoring
```

## Common Tasks

### Add New Metric Display
1. Create component in `src/components/`
2. Use `useMonitoringMetrics()` hook for data
3. Import chart components from `@xala/ds`
4. Add route if standalone page needed

### Add New Alert Type
1. Define alert rule in observability package
2. Create alert display component
3. Subscribe to alert events via WebSocket
4. Add notification handling

### Add Health Check
1. Configure health endpoint in API
2. Use `useHealthChecks()` hook
3. Display status in health dashboard
4. Add alert threshold if needed

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# E2E tests
pnpm test:e2e tests/e2e/monitoring-*.spec.ts       # Monitoring-specific
pnpm test:e2e tests/e2e/monitoring-health.spec.ts  # Health check tests
pnpm test:e2e tests/e2e/monitoring-alerts.spec.ts  # Alert tests
```

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_PROMETHEUS_URL=https://prometheus.digilist.no
VITE_GRAFANA_URL=https://grafana.digilist.no
```

## Real-Time Monitoring

```tsx
import { realtimeClient } from '@digilist/client-sdk';

// Subscribe to health events
realtimeClient.onHealth((event) => {
  updateDashboard(event);
});

// Subscribe to alerts
realtimeClient.onAlert((alert) => {
  showNotification(alert);
});
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:monitoring      # Deploy to monitoring-test.digilist.no
```

## Common Debugging

```bash
# Check if user is authenticated
# Browser console: localStorage.getItem('monitoring_user')

# Test API connectivity
curl https://api.digilist.no/health

# Check Prometheus connectivity
curl https://prometheus.digilist.no/-/healthy

# Check WebSocket events
# Enable console logging in realtimeClient.ts
```

## Important Notes

- **Staff authentication required** - Operations/admin access only
- **Real-time updates** - WebSocket connection required
- **Observability integration** - Uses @xala/observability package
- **Prometheus metrics** - 36 predefined metrics available
- **Alert rules** - 11 configurable alert thresholds
- **Cross-tenant visibility** - Can view all kommune health status

## Thin App Rules

- Import ALL components from `@xala/ds`
- Use SDK hooks for ALL data operations
- No inline styles (use design tokens)
- All text through `t()` function
