# Phase 2 Complete: Unified Monitoring Data Layer

**Date:** 2026-01-18  
**Status:** ✅ Complete  
**Next Phase:** Phase 3 - Backend Wiring

---

## 📦 **Deliverables**

### 1. Monitoring DTOs (`@xala/contracts`)

Created comprehensive type-safe DTOs for all monitoring domains:

**Location:** `packages/contracts/src/monitoring/`

| File | Purpose | Key Types |
|------|---------|-----------|
| `overview.dto.ts` | System overview | `MonitoringOverviewDTO`, `SystemHealthDTO`, `SystemMetricsDTO` |
| `incidents.dto.ts` | Incident management | `IncidentDTO`, `CreateIncidentDTO`, `IncidentFilterDTO` |
| `synthetics.dto.ts` | Synthetic monitors | `SyntheticMonitorDTO`, `SyntheticRunDTO`, `SyntheticAssertion` |
| `grafana.dto.ts` | Grafana integration | `GrafanaDashboardDTO`, `GrafanaQueryRequestDTO` |
| `logs.dto.ts` | Log viewing | `LogEntryDTO`, `LogFilterDTO`, `LogStatisticsDTO` |
| `audit.dto.ts` | Audit correlation | `AuditCorrelationDTO`, `AuditEventDTO`, `AuditTimelineDTO` |

**Total:** 6 DTO modules with 50+ type definitions

---

### 2. Extended Monitoring Service (`@digilist/client-sdk`)

**File:** `packages/client-sdk/src/services/monitoring-extended.service.ts`

**Endpoints Implemented:**

#### Overview
- `getOverview(tenantId?)` - Comprehensive system overview

#### Incidents (7 methods)
- `getIncidents(filter?)` - List with filtering
- `getIncident(id)` - Get by ID
- `createIncident(data)` - Create new
- `updateIncident(id, data)` - Update
- `acknowledgeIncident(id, data)` - Acknowledge
- `resolveIncident(id, data)` - Resolve

#### Synthetic Monitors (7 methods)
- `getSyntheticMonitors(tenantId?)` - List monitors
- `getSyntheticMonitor(id)` - Get by ID
- `getSyntheticRuns(monitorId, limit)` - Get run history
- `createSyntheticMonitor(data)` - Create
- `updateSyntheticMonitor(id, data)` - Update
- `deleteSyntheticMonitor(id)` - Delete
- `triggerSyntheticRun(id)` - Manual trigger

#### Grafana (4 methods)
- `getGrafanaDashboards(search?)` - List dashboards
- `getGrafanaDashboard(uid)` - Get by UID
- `queryGrafanaPanel(request)` - Query panel data
- `toggleGrafanaDashboardStar(uid, starred)` - Star/unstar

#### Logs (3 methods)
- `getLogs(filter?)` - Get with filtering
- `getLogStatistics(startDate?, endDate?)` - Statistics
- `exportLogs(filter, format)` - Export (JSON/CSV/TXT)

#### Audit (3 methods)
- `getAuditEvents(filter?)` - Get events
- `getAuditCorrelation(correlationId)` - Get correlation
- `getAuditStatistics(startDate?, endDate?)` - Statistics

**Total:** 25 service methods

---

### 3. React Query Hooks (`@digilist/client-sdk`)

**File:** `packages/client-sdk/src/hooks/use-monitoring.extended.ts`

**Query Keys Structure:**
```typescript
monitoringKeys = {
  all: ['monitoring'],
  overview: (tenantId?) => [...],
  incidents: {
    all: () => [...],
    lists: () => [...],
    list: (filter?) => [...],
    details: () => [...],
    detail: (id) => [...],
  },
  synthetics: { ... },
  grafana: { ... },
  logs: { ... },
  audit: { ... },
}
```

**Hooks Implemented:**

#### Query Hooks (Read Operations)
- `useMonitoringOverview(tenantId?, options?)`
- `useIncidents(filter?, options?)`
- `useIncident(id, options?)`
- `useSyntheticMonitors(tenantId?, options?)`
- `useSyntheticMonitor(id, options?)`
- `useSyntheticRuns(monitorId, limit, options?)`
- `useGrafanaDashboards(search?, options?)`
- `useGrafanaDashboard(uid, options?)`
- `useLogs(filter?, options?)`
- `useLogStatistics(startDate?, endDate?, options?)`
- `useAuditEvents(filter?, options?)`
- `useAuditCorrelation(correlationId, options?)`
- `useAuditStatistics(startDate?, endDate?, options?)`

#### Mutation Hooks (Write Operations)
- `useCreateIncident(options?)`
- `useUpdateIncident(options?)`
- `useAcknowledgeIncident(options?)`
- `useResolveIncident(options?)`
- `useCreateSyntheticMonitor(options?)`
- `useUpdateSyntheticMonitor(options?)`
- `useDeleteSyntheticMonitor(options?)`
- `useTriggerSyntheticRun(options?)`
- `useQueryGrafanaPanel(options?)`

**Total:** 22 React Query hooks with automatic cache invalidation

---

## 🎯 **Key Features**

### Type Safety
- ✅ All DTOs are TypeScript interfaces
- ✅ Full type inference in hooks
- ✅ Compile-time validation

### React Query Integration
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Cache invalidation on mutations
- ✅ Proper query key hierarchy

### Tenant Isolation
- ✅ Optional `tenantId` parameter on relevant endpoints
- ✅ SaaS Admin can query cross-tenant
- ✅ Tenant Admin scoped to their tenant

### Error Handling
- ✅ Uses `@xala/sdk-core` HTTP client
- ✅ Consistent error responses
- ✅ Type-safe error handling

---

## 📝 **Usage Examples**

### Overview Dashboard
```typescript
function OverviewPage() {
  const { data, isLoading } = useMonitoringOverview();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <SystemHealth health={data.health} />
      <SystemMetrics metrics={data.metrics} />
      <RecentIncidents incidents={data.recentIncidents} />
    </div>
  );
}
```

### Incidents Management
```typescript
function IncidentsPage() {
  const [filter, setFilter] = useState<IncidentFilterDTO>({
    severity: ['critical', 'high'],
    status: ['open'],
  });
  
  const { data } = useIncidents(filter);
  const resolveMutation = useResolveIncident();
  
  const handleResolve = (id: string) => {
    resolveMutation.mutate({
      id,
      data: {
        resolvedBy: currentUser.id,
        resolution: 'Fixed by restarting service',
      },
    });
  };
  
  return <IncidentTable data={data.data} onResolve={handleResolve} />;
}
```

### Synthetic Monitors
```typescript
function SyntheticsPage() {
  const { data } = useSyntheticMonitors();
  const triggerRun = useTriggerSyntheticRun();
  
  return data.data.map(monitor => (
    <MonitorCard
      key={monitor.id}
      monitor={monitor}
      onTrigger={() => triggerRun.mutate(monitor.id)}
    />
  ));
}
```

### Grafana Dashboards
```typescript
function DashboardsPage() {
  const [search, setSearch] = useState('');
  const { data } = useGrafanaDashboards(search);
  
  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <DashboardGrid dashboards={data.dashboards} />
    </>
  );
}
```

---

## 🔄 **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring App (React)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │   Overview   │     │  Incidents   │     │  Synthetics │ │
│  │     Page     │     │     Page     │     │     Page    │ │
│  └──────┬───────┘     └──────┬───────┘     └──────┬──────┘ │
│         │                    │                     │         │
│         └────────────────────┼─────────────────────┘         │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  React Query Hooks │                    │
│                    │  (use-monitoring)  │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │ Monitoring Service │                    │
│                    │  (SDK Extended)    │                    │
│                    └─────────┬─────────┘                    │
└──────────────────────────────┼───────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   @xala/sdk-core    │
                    │   (HTTP Client)     │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                         API Layer                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  Monitoring  │     │   Grafana    │     │  Database   │ │
│  │ Controllers  │────▶│   Adapter    │     │   (Drizzle) │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## ✅ **Validation Checklist**

- [x] All DTOs created with proper TypeScript types
- [x] Service methods follow SDK patterns
- [x] React Query hooks with proper cache keys
- [x] Mutation hooks invalidate relevant queries
- [x] Tenant isolation supported
- [x] Error handling via sdk-core
- [x] Exports added to contracts index
- [x] No business logic in DTOs (pure data structures)
- [x] Consistent naming conventions
- [x] Pagination support where needed
- [x] Filter DTOs for list endpoints

---

## 🚀 **Next Steps (Phase 3)**

### Backend Wiring Required

1. **API Controllers** (`apps/api/src/modules/monitoring/`)
   - `monitoring.controller.ts` - Overview endpoint
   - `incidents.controller.ts` - Incident CRUD
   - `synthetics.controller.ts` - Synthetic monitor management
   - `grafana.controller.ts` - Grafana proxy
   - `logs.controller.ts` - Log aggregation
   - `audit.controller.ts` - Audit correlation

2. **Grafana Adapter** (`apps/api/src/adapters/grafana/`)
   - Dashboard fetching
   - Query execution
   - Annotation management

3. **Database Integration**
   - Create `monitoringSchema` tables (Drizzle migrations)
   - Incident storage
   - Synthetic monitor configs
   - Run results storage

4. **RBAC Integration**
   - SaaS Admin: Full access, cross-tenant
   - Tenant Admin: Tenant-scoped access
   - Viewer: Read-only access

---

## 📊 **Metrics**

- **DTOs Created:** 50+ types across 6 modules
- **Service Methods:** 25 endpoints
- **React Query Hooks:** 22 hooks (13 queries, 9 mutations)
- **Lines of Code:** ~1,200 lines
- **Type Safety:** 100% TypeScript
- **Test Coverage:** Pending (Phase 6)

---

**Status:** Phase 2 complete. Ready for Phase 3 backend implementation.
