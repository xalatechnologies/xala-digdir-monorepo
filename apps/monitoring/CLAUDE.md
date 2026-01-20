# apps/monitoring - System Monitoring Dashboard

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **monitoring** app is the system monitoring dashboard for the Xala/Digilist Platform. It provides operations staff with real-time visibility into system health, performance metrics, error tracking, and alerting.

**Port:** 5178
**URL (local):** http://localhost:5178
**URL (test):** https://monitoring-test.digilist.no

---

## Key Characteristics

- **Internal application** - Requires staff/admin authentication
- **Real-time monitoring** - Live metrics and health status
- **Alerting system** - Configurable alerts and notifications
- **Multi-tenant visibility** - Cross-kommune health overview
- **Incident management** - Track and resolve system issues
- **Observability** - Integrates with @xala/observability package

---

## Directory Structure

```
apps/monitoring/
├── src/
│   ├── routes/              # React Router routes
│   │   ├── dashboard.tsx    # Main monitoring dashboard
│   │   ├── health.tsx       # Health check overview
│   │   ├── metrics.tsx      # System metrics
│   │   ├── alerts.tsx       # Active alerts
│   │   ├── incidents.tsx    # Incident management
│   │   └── help.tsx         # Help documentation
│   ├── components/          # Monitoring-specific components
│   │   ├── HealthStatus/    # Health check displays
│   │   ├── MetricsChart/    # Performance charts
│   │   ├── AlertList/       # Alert management
│   │   └── IncidentTimeline/# Incident tracking
│   ├── providers/           # Context providers
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper utilities
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
pnpm --filter @xala/monitoring dev        # Start dev server
pnpm --filter @xala/monitoring build      # Production build
pnpm --filter @xala/monitoring preview    # Preview production build

# From this directory
pnpm dev                                  # Start dev server (port 5178)
pnpm build                                # Production build
pnpm preview                              # Preview build
```

---

## App-Specific Rules

### 1. Authentication Required
- **ALL routes require staff authentication**
- Redirect unauthenticated users to login
- Use `ProtectedRoute` wrapper for all pages
- Check admin/ops permissions before showing features

### 2. Real-Time Metrics
- Use WebSocket for live metric updates
- Update dashboard every 5 seconds
- Show connection status indicator
- Handle reconnection gracefully

### 3. Alert Management
- Display critical alerts prominently
- Allow alert acknowledgment
- Track alert history
- Integrate with notification system

### 4. Incident Tracking
- Create incidents from alerts
- Track incident lifecycle (open -> investigating -> resolved)
- Include timeline of events
- Support post-mortem notes

### 5. Observability Integration
- Use `@xala/observability` package for metrics
- Follow Prometheus metric naming conventions
- Support Grafana dashboard links
- Track 36+ predefined metrics

---

## Key Features

### Health Dashboard
- **Location:** `src/routes/dashboard.tsx`
- Overall system health status
- Service-by-service health checks
- Database connection status
- External service availability

### Metrics Visualization
- **Location:** `src/routes/metrics.tsx`
- Real-time performance charts
- Historical metric trends
- Custom metric queries
- Export to CSV

### Alert Management
- **Location:** `src/routes/alerts.tsx`
- Active alert list
- Alert severity levels (critical, warning, info)
- Alert acknowledgment workflow
- Alert rule configuration

### Incident Management
- **Location:** `src/routes/incidents.tsx`
- Incident creation and tracking
- Timeline of events
- Resolution notes
- Post-mortem documentation

---

## Integration Points

### SDK Services Used
```tsx
import {
  useAuth,                # User authentication
  useMonitoringMetrics,   # System metrics
  useHealthChecks,        # Health status
  useAlerts,              # Alert management
  useIncidents,           # Incident tracking
} from '@digilist/client-sdk/hooks';
```

### Observability Package
```tsx
import {
  MetricsCollector,
  AlertRules,
  HealthChecker,
} from '@xala/observability';

// 36 predefined metrics
// 11 alert rules
// Real-time health checks
```

### Realtime Events
```tsx
import { realtimeClient } from '@digilist/client-sdk';

// Subscribe to health events
realtimeClient.onHealth((event) => {
  updateHealthStatus(event);
});

// Subscribe to alert events
realtimeClient.onAlert((alert) => {
  showAlertNotification(alert);
});
```

---

## Routing Structure

```
/                           # Dashboard overview
/login                      # Login page
/health                     # Health check details
/metrics                    # System metrics
/metrics/:category          # Category-specific metrics
/alerts                     # Active alerts
/alerts/:id                 # Alert details
/incidents                  # Incident list
/incidents/new              # Create incident
/incidents/:id              # Incident details
/settings                   # Monitoring settings
/help                       # Help documentation
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_PROMETHEUS_URL=https://prometheus.digilist.no
VITE_GRAFANA_URL=https://grafana.digilist.no
```

---

## Common Patterns

### Health Status Display
```tsx
import { useHealthChecks } from '@digilist/client-sdk/hooks';

export function HealthOverview() {
  const { data: health, isLoading } = useHealthChecks();

  if (isLoading) return <Spinner />;

  return (
    <HealthGrid>
      {health?.services.map(service => (
        <HealthCard
          key={service.name}
          name={service.name}
          status={service.status}
          latency={service.latency}
        />
      ))}
    </HealthGrid>
  );
}
```

### Real-Time Metrics
```tsx
import { useMonitoringMetrics } from '@digilist/client-sdk/hooks';
import { useEffect } from 'react';

export function MetricsChart() {
  const { data, refetch } = useMonitoringMetrics();

  // Refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  return <LineChart data={data?.timeSeries} />;
}
```

### Alert Acknowledgment
```tsx
import { useAcknowledgeAlert } from '@digilist/client-sdk/hooks';

export function AlertRow({ alert }: { alert: Alert }) {
  const { mutate: acknowledge } = useAcknowledgeAlert();

  return (
    <TableRow severity={alert.severity}>
      <TableCell>{alert.message}</TableCell>
      <TableCell>{alert.timestamp}</TableCell>
      <TableCell>
        <Button onClick={() => acknowledge(alert.id)}>
          Acknowledge
        </Button>
      </TableCell>
    </TableRow>
  );
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/monitoring-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)
- **Integration:** `tests/integration/monitoring/`

```bash
# Run monitoring-specific E2E tests
pnpm test:e2e tests/e2e/monitoring-*.spec.ts
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:monitoring

# Preview locally
pnpm preview
```

**Output:** `dist/` directory with static assets.

---

## Common Issues

### 1. Metrics Not Loading
- Check Prometheus URL configuration
- Verify API connection
- Check authentication token

### 2. WebSocket Disconnecting
- Check `VITE_WS_URL` is correct
- Verify network stability
- Check reconnection logic

### 3. Alerts Not Appearing
- Verify alert subscription
- Check alert rule configuration
- Review threshold settings

---

## Thin App Compliance

This app follows the **Thin App Strategy**:
- All UI components imported from `@xala/ds`
- No business logic in UI (SDK-first)
- No hardcoded styles (design tokens only)
- All text localized via `@xala/i18n`

**Current Thin App Score:** Part of ongoing migration

---

## When in Doubt

1. Is user authenticated? -> Check `useAuth()` first
2. Does user have monitoring permission? -> Check capabilities
3. Are metrics real-time? -> Use WebSocket subscription
4. Check root CLAUDE.md for architecture rules
5. Use SDK hooks for ALL data operations
6. Import components from `@xala/ds` only
7. Use `t()` for ALL user-facing text

---

**Last Updated:** 2026-01-20
**Status:** Production Ready
**Next Review:** After significant changes
