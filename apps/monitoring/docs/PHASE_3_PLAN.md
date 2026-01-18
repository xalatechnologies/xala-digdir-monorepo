# Phase 3: Backend Wiring - Implementation Plan

**Status:** In Progress  
**Goal:** Create API controllers and adapters for monitoring endpoints

---

## 📋 **Implementation Checklist**

### 1. API Controllers (apps/api/src/modules/monitoring/)

#### Overview Controller
- [ ] `GET /api/monitoring/overview` - System overview
- [ ] Aggregate health, metrics, incidents, dashboards
- [ ] Support optional `tenantId` query param
- [ ] RBAC: SaaS Admin (all tenants), Tenant Admin (own tenant)

#### Incidents Controller  
- [ ] `GET /api/monitoring/incidents` - List with filters
- [ ] `GET /api/monitoring/incidents/:id` - Get by ID
- [ ] `POST /api/monitoring/incidents` - Create (admin only)
- [ ] `PATCH /api/monitoring/incidents/:id` - Update (admin only)
- [ ] `POST /api/monitoring/incidents/:id/acknowledge` - Acknowledge
- [ ] `POST /api/monitoring/incidents/:id/resolve` - Resolve
- [ ] RBAC: Write operations require admin role

#### Synthetics Controller
- [ ] `GET /api/monitoring/synthetics` - List monitors
- [ ] `GET /api/monitoring/synthetics/:id` - Get by ID
- [ ] `GET /api/monitoring/synthetics/:id/runs` - Get run history
- [ ] `POST /api/monitoring/synthetics` - Create (admin only)
- [ ] `PATCH /api/monitoring/synthetics/:id` - Update (admin only)
- [ ] `DELETE /api/monitoring/synthetics/:id` - Delete (admin only)
- [ ] `POST /api/monitoring/synthetics/:id/run` - Trigger run
- [ ] RBAC: Write operations require admin role

#### Grafana Controller
- [ ] `GET /api/monitoring/grafana/dashboards` - List dashboards
- [ ] `GET /api/monitoring/grafana/dashboards/:uid` - Get dashboard
- [ ] `POST /api/monitoring/grafana/query` - Query panel data
- [ ] `POST /api/monitoring/grafana/dashboards/:uid/star` - Star/unstar
- [ ] Proxy to Grafana API with authentication

#### Logs Controller
- [ ] `GET /api/monitoring/logs` - Get logs with filters
- [ ] `GET /api/monitoring/logs/statistics` - Log statistics
- [ ] `POST /api/monitoring/logs/export` - Export logs
- [ ] Integration with Loki (via observability package)

#### Audit Controller
- [ ] `GET /api/monitoring/audit` - Get audit events
- [ ] `GET /api/monitoring/audit/correlation/:id` - Get correlation
- [ ] `GET /api/monitoring/audit/statistics` - Audit statistics
- [ ] Query compliance schema

---

### 2. Grafana Adapter (apps/api/src/adapters/grafana/)

- [ ] `grafana.adapter.ts` - Main adapter class
- [ ] `getDashboards()` - Fetch dashboard list
- [ ] `getDashboard(uid)` - Fetch single dashboard
- [ ] `queryPanel(request)` - Execute panel query
- [ ] `createAnnotation(data)` - Create annotation
- [ ] Authentication with Grafana API key
- [ ] Error handling and retries
- [ ] Response transformation to DTOs

---

### 3. Services Layer (apps/api/src/services/monitoring/)

- [ ] `monitoring.service.ts` - Business logic orchestration
- [ ] `incidents.service.ts` - Incident management
- [ ] `synthetics.service.ts` - Synthetic monitor management
- [ ] `grafana.service.ts` - Grafana integration wrapper
- [ ] `logs.service.ts` - Log aggregation
- [ ] `audit.service.ts` - Audit correlation

---

### 4. RBAC Integration

#### Roles
- **SaaS Admin**: Full access, cross-tenant queries
- **Tenant Admin**: Tenant-scoped access, can manage incidents/monitors
- **Viewer**: Read-only access

#### Guards
- [ ] `@RequireRole('saas_admin')` for cross-tenant endpoints
- [ ] `@RequireTenantAccess()` for tenant-scoped endpoints
- [ ] `@RequirePermission('monitoring:write')` for mutations

---

### 5. Environment Configuration

```bash
# Grafana
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=...

# Loki
LOKI_URL=http://localhost:3100

# Prometheus
PROMETHEUS_URL=http://localhost:9090
```

---

## 🔄 **Data Flow**

```
Client Request
    ↓
Controller (RBAC check)
    ↓
Service (Business logic)
    ↓
├─→ Database (Drizzle) - Incidents, Synthetics
├─→ Grafana Adapter - Dashboards, Queries
├─→ Loki Client - Logs
└─→ Prometheus Client - Metrics
    ↓
Response (DTO)
```

---

## 📝 **Implementation Notes**

### Existing Monitoring Controller
The file `apps/api/src/modules/monitoring/monitoring.controller.ts` already exists. Need to:
1. Review existing implementation
2. Extend with new endpoints
3. Ensure consistency with new DTOs

### Observability Package Integration
Use `@xala/observability` for:
- Prometheus metric queries
- Grafana dashboard provisioning
- Alert rule management

### Error Handling
- Use RFC7807 ProblemDetails for errors
- Proper HTTP status codes
- Tenant isolation validation

---

## ✅ **Acceptance Criteria**

- [ ] All 25 endpoints implemented
- [ ] RBAC enforced on all endpoints
- [ ] Tenant isolation working correctly
- [ ] Grafana adapter functional
- [ ] Error handling consistent
- [ ] OpenAPI documentation generated
- [ ] Integration tests passing

---

**Next:** Review existing monitoring controller and plan incremental updates.
