# apps/monitoring-global - Global Control Plane

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **monitoring-global** app is the Global Control Plane monitoring dashboard for the Xala Platform. It provides platform-wide visibility into system health, infrastructure status, tenant overview, and global alerts.

**Port:** 5178
**URL (local):** http://localhost:5178
**URL (production):** https://control.xala.io

---

## CRITICAL: Platform-Only App

**This app is PLATFORM-ONLY. NO @digilist/* imports are allowed.**

This app monitors the platform infrastructure across ALL domain implementations. It must remain domain-agnostic to serve as the central control plane.

### Allowed Imports

```typescript
// Platform packages - ALLOWED
import { Button, Card } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { validateEnv } from '@xala/config';
import { RuntimeProvider } from '@xala/runtime';
```

### Forbidden Imports

```typescript
// Domain packages - FORBIDDEN
import { useListings } from '@digilist/client-sdk'; // ❌ NEVER
import { BookingCard } from '@digilist/ui'; // ❌ NEVER
import { someService } from '@digilist/runtime'; // ❌ NEVER
```

---

## Key Characteristics

- **Platform operator access** - Super-admin and platform engineers only
- **Cross-tenant visibility** - Monitor all tenants from single dashboard
- **Infrastructure monitoring** - Database, Redis, Network status
- **Global alerts** - Platform-wide incident management
- **Domain-agnostic** - No domain-specific logic or components

---

## Directory Structure

```
apps/monitoring-global/
├── src/
│   ├── routes/                 # React Router routes
│   │   ├── index.tsx          # Dashboard - System health overview
│   │   ├── infrastructure.tsx # Database, Redis, Network status
│   │   ├── tenants.tsx        # Cross-tenant overview
│   │   └── alerts.tsx         # Global alerts
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.tsx  # Main layout wrapper
│   │       ├── Sidebar.tsx    # Navigation sidebar
│   │       └── Header.tsx     # Header with search
│   ├── App.tsx                # Routes only
│   ├── main.tsx               # Entry point with providers
│   └── root.css               # Base styles
├── public/                    # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── CLAUDE.md                 # This file
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/monitoring-global dev        # Start dev server
pnpm --filter @xala/monitoring-global build      # Production build
pnpm --filter @xala/monitoring-global preview    # Preview production build

# From this directory
pnpm dev                                         # Start dev server (port 5178)
pnpm build                                       # Production build
pnpm preview                                     # Preview build
```

---

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | DashboardPage | System health overview |
| `/infrastructure` | InfrastructurePage | Database, Redis, Network status |
| `/tenants` | TenantsPage | Cross-tenant overview |
| `/alerts` | AlertsPage | Global alerts management |

---

## App-Specific Rules

### 1. Platform-Only Architecture

- **NO domain imports** - Never import @digilist/*
- Use only @xala/* platform packages
- No domain-specific terminology in UI
- All text must use platform i18n keys

### 2. Monitoring Data Sources

This app will fetch data from platform-level APIs:
- `/api/platform/health` - System health status
- `/api/platform/infrastructure` - Infrastructure metrics
- `/api/platform/tenants` - Cross-tenant overview
- `/api/platform/alerts` - Global alerts

Currently uses mock data - will be replaced with actual API calls.

### 3. Access Control

- Requires platform operator role
- Not accessible to tenant admins
- Separate from tenant-specific monitoring

---

## Key Features

### Dashboard (/)
- Platform-wide health status
- Service status grid (API, DB, Redis, Storage)
- Recent events feed
- Quick metrics (response time, error rate, connections)

### Infrastructure (/infrastructure)
- Database primary/replica status
- Connection pool monitoring
- Redis cache metrics
- Network endpoint latency
- Recent query analysis

### Tenants (/tenants)
- All tenants overview table
- Status by tenant
- Usage metrics (users, storage, API calls)
- Plan distribution
- Top tenants by usage

### Alerts (/alerts)
- Active alerts list
- Alert severity filtering
- Acknowledge/resolve workflow
- Notification channel configuration
- Escalation policy settings

---

## Component Patterns

### Using Design System Components

```tsx
// Always import from @xala/ds
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Table,
  Button,
  StatCard,
} from '@xala/ds';

// Use design tokens for custom styles
const cardStyle: React.CSSProperties = {
  padding: 'var(--ds-spacing-6)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-md)',
};
```

### Using Internationalization

```tsx
import { useT } from '@xala/i18n';

function MyComponent() {
  const t = useT();

  return (
    <Heading>{t('monitoring.dashboard.title')}</Heading>
  );
}
```

---

## i18n Keys

This app uses keys under the `monitoring.*` namespace:

```typescript
// Navigation
monitoring.nav.dashboard
monitoring.nav.infrastructure
monitoring.nav.tenants
monitoring.nav.alerts

// Dashboard
monitoring.dashboard.title
monitoring.dashboard.description
monitoring.status.allSystemsOperational

// Infrastructure
monitoring.infrastructure.title
monitoring.infrastructure.primaryDatabase
monitoring.infrastructure.connections

// Tenants
monitoring.tenants.title
monitoring.tenants.totalTenants
monitoring.tenants.activeTenants

// Alerts
monitoring.alerts.title
monitoring.alerts.activeAlerts
monitoring.alerts.acknowledge
```

---

## Testing

Tests should be located in `packages/testing/suites/`:

```bash
# Run monitoring-global-specific E2E tests
pnpm test:e2e packages/testing/suites/e2e/monitoring-global/
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to production
pnpm deploy:monitoring-global
```

---

## Thin App Compliance

This app follows the **Thin App Strategy**:
- All UI components imported from `@xala/ds`
- No business logic in UI (data fetching only)
- No hardcoded styles (design tokens only)
- All text localized via `@xala/i18n`
- **NO @digilist/* imports** (platform-only)

---

## Future Enhancements

1. **Real-time Updates** - WebSocket for live metrics
2. **Historical Charts** - Time-series data visualization
3. **Alert Rules Engine** - Configurable alert thresholds
4. **Incident Timeline** - Full incident management
5. **Cost Monitoring** - Infrastructure cost tracking

---

## When in Doubt

1. Is this a platform feature? -> Implement here
2. Is this domain-specific? -> Do NOT implement here
3. Need to import @digilist/*? -> STOP, this is the wrong app
4. Check root CLAUDE.md for architecture rules
5. Import components from `@xala/ds` only
6. Use `t()` for ALL user-facing text

---

**Last Updated:** 2026-01-21
**Status:** Initial Implementation
**Next Review:** After real API integration
