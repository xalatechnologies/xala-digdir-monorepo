# Getting Started - Monitoring App Development

**Welcome!** This guide will help you start developing the Monitoring Dashboard.

---

## 🎯 **What You Have**

### ✅ Complete Foundation
- **App Shell:** Full MinSide structure cloned
- **50+ DTOs:** All types defined and built
- **25 API Methods:** Client SDK service ready
- **22 React Hooks:** React Query hooks ready
- **Documentation:** 6 comprehensive guides

### ⏳ What Needs Building
- **UI Pages:** 7 monitoring pages
- **Backend API:** 23 endpoints
- **Database:** 3 tables
- **Grafana Adapter:** Dashboard integration

---

## 🚀 **Quick Start (5 Minutes)**

### 1. Install Dependencies
```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo
pnpm install
```

### 2. Start Development Server
```bash
pnpm --filter @xala/monitoring dev
```

App runs at: **http://localhost:5175**

### 3. Verify Setup
```bash
# Check if app starts
curl http://localhost:5175

# Check TypeScript
pnpm --filter @xala/monitoring typecheck

# Check linting
pnpm --filter @xala/monitoring lint
```

---

## 📚 **Essential Reading**

### Start Here (30 minutes)
1. **[README.md](README.md)** - Project overview (5 min)
2. **[docs/migration-map.md](docs/migration-map.md)** - UI development guide (15 min)
3. **[docs/PHASE_2_SUMMARY.md](docs/PHASE_2_SUMMARY.md)** - Data layer reference (10 min)

### For Backend Developers
1. **[docs/PHASE_3_COMPLETE.md](docs/PHASE_3_COMPLETE.md)** - API implementation guide
2. **[docs/PHASE_3_PLAN.md](docs/PHASE_3_PLAN.md)** - Backend requirements

### Reference
- **[docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Complete project summary
- **[AGENTS.md](AGENTS.md)** - Development commands

---

## 🎨 **Frontend Development Path**

### Option A: With Mock Data (Recommended)

**Setup MSW (Mock Service Worker):**
```bash
cd apps/monitoring
pnpm add -D msw
```

**Create mock handlers:**
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/monitoring/overview', () => {
    return HttpResponse.json({
      health: {
        status: 'healthy',
        services: [
          { name: 'API', status: 'healthy', responseTime: 45 },
          { name: 'Database', status: 'healthy', responseTime: 12 },
        ],
        uptime: 99.98,
        lastCheck: new Date().toISOString(),
      },
      metrics: {
        cpu: 45,
        memory: 60,
        disk: 35,
        uptime: 86400,
        requestsPerMinute: 1250,
        avgResponseTime: 120,
        errorRate: 0.02,
        activeConnections: 450,
      },
      recentIncidents: [
        {
          id: '1',
          title: 'API Latency Spike',
          severity: 'high',
          status: 'investigating',
          affectedServices: ['API', 'Database'],
          createdAt: new Date().toISOString(),
        },
      ],
      dashboardSummary: {
        totalDashboards: 12,
        recentlyViewed: ['platform-overview', 'api-metrics'],
        favorites: ['system-health'],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.get('/api/monitoring/incidents', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          title: 'API Latency Spike',
          description: 'Response times increased to 2s average',
          severity: 'high',
          status: 'investigating',
          affectedServices: ['API', 'Database'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['performance', 'api'],
        },
        {
          id: '2',
          title: 'Database Connection Pool Exhausted',
          description: 'All connections in use, queries queuing',
          severity: 'critical',
          status: 'open',
          affectedServices: ['Database'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['database', 'critical'],
        },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });
  }),
];
```

**Enable mocks:**
```typescript
// src/main.tsx
import { worker } from './mocks/browser';

if (import.meta.env.DEV) {
  worker.start();
}
```

### Option B: Wait for Backend
- Backend team implements API first
- Then build UI with real data
- Slower overall timeline

---

## 🏗️ **Pages to Build**

### 1. Overview Dashboard (`/overview`)
**Priority:** High  
**Complexity:** Medium

**Features:**
- System health cards
- Performance metrics
- Recent incidents list
- Quick actions

**Hooks:**
```typescript
const { data } = useMonitoringOverview();
```

**Reference:** MinSide Dashboard (`apps/minside/src/routes/dashboard.tsx`)

---

### 2. Incidents Management (`/incidents`)
**Priority:** High  
**Complexity:** Medium

**Features:**
- Incident table with filters
- Detail drawer
- Create/update/resolve actions
- Severity badges

**Hooks:**
```typescript
const { data } = useIncidents(filter);
const createMutation = useCreateIncident();
const resolveMutation = useResolveIncident();
```

**Reference:** MinSide Bookings (`apps/minside/src/routes/bookings.tsx`)

---

### 3. Synthetic Monitors (`/synthetics`)
**Priority:** Medium  
**Complexity:** High

**Features:**
- Monitor list
- Run history timeline
- Create/edit monitors
- Trigger manual runs

**Hooks:**
```typescript
const { data } = useSyntheticMonitors();
const { data: runs } = useSyntheticRuns(monitorId);
const triggerMutation = useTriggerSyntheticRun();
```

**Reference:** MinSide Calendar (`apps/minside/src/routes/calendar.tsx`)

---

### 4. Grafana Dashboards (`/dashboards`)
**Priority:** Medium  
**Complexity:** Low

**Features:**
- Dashboard grid
- Search
- Quick access
- Star/favorite

**Hooks:**
```typescript
const { data } = useGrafanaDashboards(search);
```

**Reference:** MinSide Favorites (`apps/minside/src/routes/favorites.tsx`)

---

### 5. Logs Viewer (`/logs`)
**Priority:** Medium  
**Complexity:** High

**Features:**
- Log stream
- Filters (level, service, date)
- Search
- Export

**Hooks:**
```typescript
const { data } = useLogs(filter);
const { data: stats } = useLogStatistics();
```

**Reference:** MinSide Messages (`apps/minside/src/routes/messages.tsx`)

---

### 6. Audit Correlation (`/audit`)
**Priority:** Low  
**Complexity:** Medium

**Features:**
- Event timeline
- Correlation view
- Filter by user/action
- Export

**Hooks:**
```typescript
const { data } = useAuditEvents(filter);
const { data: correlation } = useAuditCorrelation(id);
```

**Reference:** MinSide Privacy (`apps/minside/src/routes/privacy.tsx`)

---

### 7. Settings (`/settings`)
**Priority:** Low  
**Complexity:** Low

**Features:**
- Grafana connection
- Alert routing
- Retention policies

**Reference:** MinSide Settings (`apps/minside/src/routes/settings.tsx`)

---

## 🔧 **Development Workflow**

### Daily Workflow
```bash
# 1. Start dev server
pnpm --filter @xala/monitoring dev

# 2. Make changes to src/

# 3. Check types
pnpm --filter @xala/monitoring typecheck

# 4. Run tests
pnpm --filter @xala/monitoring test

# 5. Commit
git add .
git commit -m "feat(monitoring): add overview page"
```

### Code Style
- Follow MinSide patterns exactly
- Use design system components (`@xala/ds`)
- All strings via i18n keys
- No business logic in components
- Mobile-first responsive design

---

## 🧪 **Testing Strategy**

### Unit Tests
```typescript
// src/routes/__tests__/overview.test.tsx
import { render, screen } from '@testing-library/react';
import { OverviewPage } from '../overview';

test('renders system health', () => {
  render(<OverviewPage />);
  expect(screen.getByText(/system health/i)).toBeInTheDocument();
});
```

### E2E Tests
```typescript
// tests/e2e/monitoring-overview.spec.ts
import { test, expect } from '@playwright/test';

test('overview page loads', async ({ page }) => {
  await page.goto('http://localhost:5175/overview');
  await expect(page.getByTestId('page-monitoring-overview')).toBeVisible();
});
```

---

## 🐛 **Common Issues**

### Issue: Types not found
```bash
# Rebuild contracts package
pnpm --filter @xala/contracts build
```

### Issue: Hooks not working
```bash
# Rebuild client-sdk
pnpm --filter @digilist/client-sdk build
```

### Issue: Port already in use
```bash
# Kill process on port 5175
lsof -ti:5175 | xargs kill -9
```

---

## 📞 **Getting Help**

### Questions?
1. Check documentation in `docs/`
2. Reference MinSide implementation
3. Review React Query hooks in client-sdk
4. Check contracts for DTO types

### Stuck?
- **UI Patterns:** See `docs/migration-map.md`
- **Data Layer:** See `docs/PHASE_2_SUMMARY.md`
- **Backend:** See `docs/PHASE_3_COMPLETE.md`

---

## ✅ **Checklist Before Starting**

- [ ] Read README.md
- [ ] Read migration-map.md
- [ ] Verified dev server runs (port 5175)
- [ ] Checked TypeScript compiles
- [ ] Reviewed available hooks
- [ ] Decided on mock vs real API approach
- [ ] Set up MSW if using mocks
- [ ] Reviewed MinSide reference pages

---

## 🎯 **Success Criteria**

Your monitoring app is complete when:

1. ✅ All 7 pages functional
2. ✅ Mobile responsive
3. ✅ i18n keys used (no hardcoded strings)
4. ✅ RBAC enforced
5. ✅ Tenant isolation working
6. ✅ All tests passing
7. ✅ Design system compliant
8. ✅ Accessible (WCAG)

---

**Ready to start?** Run `pnpm --filter @xala/monitoring dev` and open `http://localhost:5175`

Good luck! 🚀
