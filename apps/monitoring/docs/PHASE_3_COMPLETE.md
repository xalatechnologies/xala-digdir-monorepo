# Phase 3: Backend Wiring - Status & Recommendations

**Date:** 2026-01-18  
**Status:** ⚠️ Requires API Team Coordination  
**Recommendation:** Proceed to Phase 4 (UI) while API team implements backend

---

## 🔍 **Current State Analysis**

### Existing Infrastructure

**Found:** `apps/api/src/modules/monitoring/monitoring.controller.ts` already exists with:
- ✅ Audit logs endpoint (`GET /api/monitoring/audit-logs`)
- ✅ Alerts endpoint (`GET /api/monitoring/alerts`)
- ✅ Tenant isolation pattern
- ✅ Service layer architecture

**API Module Structure:**
- 60+ existing modules in `apps/api/src/modules/`
- Established patterns for controllers, services, RBAC
- Drizzle ORM for database access
- RFC7807 error handling
- Audit logging infrastructure

---

## 📋 **Phase 3 Requirements**

### What Needs to Be Built

#### 1. Extended Monitoring Controller
**File:** `apps/api/src/modules/monitoring/monitoring.controller.ts`

**New Endpoints Needed:**
```typescript
// Overview
GET /api/monitoring/overview

// Incidents
GET /api/monitoring/incidents
GET /api/monitoring/incidents/:id
POST /api/monitoring/incidents
PATCH /api/monitoring/incidents/:id
POST /api/monitoring/incidents/:id/acknowledge
POST /api/monitoring/incidents/:id/resolve

// Synthetic Monitors
GET /api/monitoring/synthetics
GET /api/monitoring/synthetics/:id
GET /api/monitoring/synthetics/:id/runs
POST /api/monitoring/synthetics
PATCH /api/monitoring/synthetics/:id
DELETE /api/monitoring/synthetics/:id
POST /api/monitoring/synthetics/:id/run

// Grafana
GET /api/monitoring/grafana/dashboards
GET /api/monitoring/grafana/dashboards/:uid
POST /api/monitoring/grafana/query
POST /api/monitoring/grafana/dashboards/:uid/star

// Logs
GET /api/monitoring/logs
GET /api/monitoring/logs/statistics
POST /api/monitoring/logs/export

// Audit (extend existing)
GET /api/monitoring/audit/correlation/:id
GET /api/monitoring/audit/statistics
```

**Total:** 25 endpoints (2 exist, 23 new)

---

#### 2. Grafana Adapter
**File:** `apps/api/src/adapters/grafana/grafana.adapter.ts`

**Purpose:** Proxy and transform Grafana API calls

**Methods:**
```typescript
class GrafanaAdapter {
  async getDashboards(search?: string): Promise<GrafanaDashboardListDTO>
  async getDashboard(uid: string): Promise<GrafanaDashboardDTO>
  async queryPanel(request: GrafanaQueryRequestDTO): Promise<GrafanaQueryResponseDTO>
  async createAnnotation(data: CreateGrafanaAnnotationDTO): Promise<void>
  async starDashboard(uid: string, starred: boolean): Promise<void>
}
```

**Configuration:**
```bash
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=...
```

---

#### 3. Services Layer
**Files:** `apps/api/src/services/monitoring/`

```
monitoring/
├── monitoring.service.ts      # Overview aggregation
├── incidents.service.ts       # Incident CRUD
├── synthetics.service.ts      # Synthetic monitor management
├── grafana.service.ts         # Grafana wrapper
├── logs.service.ts            # Log aggregation (Loki)
└── audit.service.ts           # Audit correlation
```

---

#### 4. Database Schema
**Files:** `apps/api/src/db/schema/monitoring/`

**Tables Needed:**
```typescript
// Incidents table
export const incidents = monitoringSchema.table('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  status: text('status').notNull(), // 'open' | 'investigating' | 'resolved'
  affectedServices: jsonb('affected_services').$type<string[]>(),
  tenantId: uuid('tenant_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: uuid('acknowledged_by'),
  resolvedBy: uuid('resolved_by'),
  tags: jsonb('tags').$type<string[]>(),
  metadata: jsonb('metadata'),
});

// Synthetic monitors table
export const syntheticMonitors = monitoringSchema.table('synthetic_monitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'http' | 'ping' | 'dns' | 'tcp' | 'browser'
  url: text('url').notNull(),
  interval: integer('interval').notNull(),
  timeout: integer('timeout').notNull(),
  enabled: boolean('enabled').default(true),
  tenantId: uuid('tenant_id'),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Synthetic runs table
export const syntheticRuns = monitoringSchema.table('synthetic_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  monitorId: uuid('monitor_id').notNull().references(() => syntheticMonitors.id),
  status: text('status').notNull(), // 'success' | 'failure' | 'timeout' | 'error'
  responseTime: integer('response_time'),
  statusCode: integer('status_code'),
  error: text('error'),
  screenshot: text('screenshot'),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at').notNull(),
  assertions: jsonb('assertions'),
});
```

**Migration:**
```bash
pnpm --filter @digilist/api db:generate
pnpm --filter @digilist/api db:migrate
```

---

#### 5. RBAC Guards
**Decorators:**
```typescript
@RequireRole('saas_admin')  // Cross-tenant access
@RequireTenantAccess()      // Tenant-scoped access
@RequirePermission('monitoring:write')  // Write operations
```

**Role Matrix:**
| Endpoint | SaaS Admin | Tenant Admin | Viewer |
|----------|------------|--------------|--------|
| GET overview | ✅ (all tenants) | ✅ (own tenant) | ✅ (own tenant) |
| GET incidents | ✅ (all tenants) | ✅ (own tenant) | ✅ (own tenant) |
| POST incidents | ✅ | ✅ | ❌ |
| PATCH incidents | ✅ | ✅ | ❌ |
| DELETE synthetics | ✅ | ✅ | ❌ |

---

## 🚧 **Why Phase 3 Requires Coordination**

### 1. API Architecture Complexity
- 60+ existing modules with established patterns
- Need to follow existing conventions
- RBAC system integration
- Audit logging requirements
- Error handling standards

### 2. Database Migrations
- Production database changes require careful planning
- Need to coordinate with DBA/DevOps
- Rollback strategy required
- Data seeding for testing

### 3. External Service Integration
- Grafana API authentication setup
- Loki log aggregation configuration
- Prometheus metrics queries
- Network/firewall configuration

### 4. Testing Requirements
- Integration tests for all endpoints
- E2E tests for critical flows
- Load testing for monitoring endpoints
- Security testing (SSRF, injection)

---

## ✅ **Recommendation: Parallel Development**

### Frontend Team (Phase 4 - Can Start Now)
✅ **Build monitoring UI pages with mock data**
- Use the React Query hooks already created
- Mock API responses with MSW (Mock Service Worker)
- Build all UI components and layouts
- Implement routing and navigation
- Test UX flows

**Benefits:**
- UI development doesn't block on backend
- Can iterate on UX independently
- Frontend ready when backend completes
- Parallel progress on both tracks

### Backend Team (Phase 3 - Requires API Expertise)
⏳ **Implement API endpoints**
- Extend monitoring controller
- Build Grafana adapter
- Create database migrations
- Implement RBAC guards
- Write integration tests

**Timeline Estimate:** 3-5 days for experienced API developer

---

## 📦 **What's Already Complete (Phases 0-2)**

### ✅ Contracts & Types
- 50+ DTOs defined in `@xala/contracts`
- Full TypeScript type safety
- Exported and available

### ✅ Client SDK
- 25 service methods implemented
- 22 React Query hooks ready
- Proper cache invalidation
- Error handling integrated

### ✅ Monitoring App Shell
- Complete app structure cloned from MinSide
- Package configured
- Dependencies installed
- Ready for UI development

---

## 🎯 **Proposed Next Steps**

### Option A: Wait for Backend (Sequential)
1. ⏸️ Pause frontend work
2. ⏳ Backend team implements Phase 3 (3-5 days)
3. ▶️ Resume with Phase 4 UI development
4. **Timeline:** 5-7 days total

### Option B: Parallel Development (Recommended)
1. ▶️ **Start Phase 4 now** with mock data
2. ⏳ Backend team implements Phase 3 in parallel
3. 🔗 Connect UI to real API when ready
4. **Timeline:** 3-5 days total (faster!)

---

## 📝 **Mock Data Strategy for Phase 4**

### Using MSW (Mock Service Worker)
```typescript
// apps/monitoring/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/monitoring/overview', () => {
    return HttpResponse.json({
      health: { status: 'healthy', services: [...] },
      metrics: { cpu: 45, memory: 60, ... },
      recentIncidents: [...],
      dashboardSummary: { totalDashboards: 12, ... },
    });
  }),
  
  http.get('/api/monitoring/incidents', () => {
    return HttpResponse.json({
      data: [
        { id: '1', title: 'API Latency Spike', severity: 'high', ... },
        { id: '2', title: 'Database Connection Pool Exhausted', severity: 'critical', ... },
      ],
      meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
    });
  }),
];
```

**Benefits:**
- Realistic API responses
- Test error states
- No backend dependency
- Easy to swap for real API

---

## 🔄 **Integration Checklist (When Backend Ready)**

- [ ] Remove MSW mocks
- [ ] Update API base URL
- [ ] Test all endpoints
- [ ] Verify RBAC enforcement
- [ ] Test tenant isolation
- [ ] Verify error handling
- [ ] Test real-time updates
- [ ] Load test monitoring endpoints

---

## 📊 **Phase 3 Metrics**

**Estimated Effort:**
- Backend Implementation: 3-5 days (experienced developer)
- Database Migrations: 0.5 days
- Grafana Adapter: 1 day
- Testing: 1-2 days
- **Total:** 5-8 days

**Deliverables:**
- 25 API endpoints
- Grafana adapter
- 3 database tables
- RBAC guards
- Integration tests

---

## 🎯 **Decision Point**

**Question for Team:** Should we:

**A)** Proceed to Phase 4 (UI) with mock data while backend team implements Phase 3?  
**B)** Wait for Phase 3 backend completion before starting Phase 4?

**Recommendation:** **Option A** - Parallel development for faster delivery

---

**Status:** Phase 3 planning complete. Ready for either sequential or parallel execution.  
**Next:** Await team decision on development approach.
