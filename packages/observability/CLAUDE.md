# Observability Package - AI Assistant Instructions

> **For:** Claude AI, Cascade, and other AI assistants  
> **Package:** `@xala/observability`  
> **Purpose:** Guidelines for working with the observability stack

---

## 🎯 Package Overview

This package provides **production-grade observability** for the Digilist platform:
- **36 metrics** across 8 categories
- **11 alert rules** (P0/P1/P2 severity)
- **Complete monitoring stack** (Prometheus, Grafana, Loki, Tempo, Alertmanager)
- **Type-safe TypeScript** metric definitions
- **Auto-provisioned dashboards** and datasources

---

## 🚨 CRITICAL RULES

### **1. Never Break Existing Metrics**
- Metric names are **immutable** once in production
- Changing metric names breaks dashboards and alerts
- To change a metric: deprecate old, add new, migrate over time
- Always check `src/metrics/definitions.ts` before adding metrics

### **2. Follow Prometheus Naming Conventions**
- **Counters:** Must end with `_total` (e.g., `http_request_total`)
- **Gauges:** No suffix (e.g., `active_connections`)
- **Histograms:** End with `_seconds` or `_bytes` (e.g., `http_request_duration_seconds`)
- **Labels:** Use `snake_case` (e.g., `tenant_id`, `status_code`)
- **Units:** Include in metric name (e.g., `_seconds`, `_bytes`, `_percent`)

### **3. Type Safety is Mandatory**
- All metrics must have TypeScript type definitions
- Use proper label types from `src/types/index.ts`
- Never use `any` for metric labels
- Export all new types from `src/types/index.ts`

### **4. Alert Severity Levels**
- **Critical (P0):** Immediate action required, wakes on-call
- **Warning (P1):** Action within 1 hour, Slack notification
- **Info (P2):** Awareness only, batched notifications
- Never create P0 alerts without explicit approval

### **5. Dashboard Organization**
- **Platform:** Infrastructure metrics (API, DB, Auth, WebSocket)
- **Business:** Business logic (Booking, Custody, Entitlements, Policy)
- **Apps:** Application-specific (Web, MinSide, Backoffice, SaaS Admin)
- **Tenants:** Per-tenant health and resource usage

---

## 📝 Common Tasks

### **Adding a New Metric**

**Step 1:** Define in `src/metrics/definitions.ts`
```typescript
export const MY_FEATURE_METRICS: Record<string, MetricDefinition> = {
  MY_COUNTER: {
    name: 'my_feature_operations_total',
    type: 'counter',
    help: 'Total operations performed',
    labelNames: ['operation', 'status', 'tenant_id'],
  },
  MY_DURATION: {
    name: 'my_feature_duration_seconds',
    type: 'histogram',
    help: 'Operation duration in seconds',
    labelNames: ['operation', 'tenant_id'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  },
};

// Add to ALL_METRICS
export const ALL_METRICS = {
  ...EXISTING_METRICS,
  ...MY_FEATURE_METRICS,
} as const;
```

**Step 2:** Create helper file `src/metrics/my-feature.ts`
```typescript
import { prometheusExporter } from '../exporters/prometheus';

export function recordMyFeatureOperation(
  operation: string,
  status: 'success' | 'failure',
  tenantId: string
): void {
  prometheusExporter.incrementCounter('my_feature_operations_total', {
    operation,
    status,
    tenant_id: tenantId,
  });
}

export async function withMyFeatureMetrics<T>(
  operation: string,
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = (Date.now() - startTime) / 1000;
    prometheusExporter.observeHistogram('my_feature_duration_seconds', duration, {
      operation,
      tenant_id: tenantId,
    });
    recordMyFeatureOperation(operation, 'success', tenantId);
    return result;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    prometheusExporter.observeHistogram('my_feature_duration_seconds', duration, {
      operation,
      tenant_id: tenantId,
    });
    recordMyFeatureOperation(operation, 'failure', tenantId);
    throw error;
  }
}
```

**Step 3:** Export from `src/metrics/index.ts`
```typescript
export * from './my-feature';
```

**Step 4:** Update `src/index.ts` if needed
```typescript
export { recordMyFeatureOperation, withMyFeatureMetrics } from './metrics/my-feature';
```

### **Creating a Dashboard**

**Step 1:** Choose correct folder
- Platform infrastructure → `grafana/dashboards/platform/`
- Business logic → `grafana/dashboards/business/`
- Application-specific → `grafana/dashboards/apps/`
- Tenant-specific → `grafana/dashboards/tenants/`

**Step 2:** Create JSON file with required fields
```json
{
  "uid": "my-dashboard",
  "title": "My Dashboard",
  "tags": ["category", "feature"],
  "templating": {
    "list": [
      {
        "name": "DS_PROMETHEUS",
        "type": "datasource",
        "query": "prometheus"
      }
    ]
  },
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "${DS_PROMETHEUS}"
      },
      "targets": [
        {
          "expr": "rate(my_metric_total[5m])",
          "legendFormat": "{{label}}"
        }
      ]
    }
  ]
}
```

**Step 3:** Test locally
```bash
pnpm docker:down
pnpm docker:up
# Access http://localhost:3000
```

### **Adding Alert Rules**

**Step 1:** Choose correct rules file
- API alerts → `prometheus/rules/api.rules.yml`
- Database alerts → `prometheus/rules/database.rules.yml`
- Booking alerts → `prometheus/rules/booking.rules.yml`
- Create new file for new feature

**Step 2:** Define alert with proper severity
```yaml
groups:
  - name: my_feature_alerts
    rules:
      - alert: MyFeatureCritical
        expr: my_metric_total > 1000
        for: 5m
        labels:
          severity: critical
          priority: P0
        annotations:
          summary: "Critical issue in my feature"
          description: "Metric exceeded threshold: {{ $value }}"
      
      - alert: MyFeatureWarning
        expr: my_metric_total > 500
        for: 10m
        labels:
          severity: warning
          priority: P1
        annotations:
          summary: "Warning in my feature"
          description: "Metric is elevated: {{ $value }}"
```

**Step 3:** Validate
```bash
pnpm prometheus:validate
```

---

## 🔍 Debugging Guide

### **Metrics Not Appearing**

1. Check metric is defined in `src/metrics/definitions.ts`
2. Verify metric is in `ALL_METRICS` export
3. Check Prometheus exporter initialized: `prometheusExporter.getMetric('metric_name')`
4. Verify application is calling metric recording function
5. Check `/metrics` endpoint output
6. Review Prometheus scrape config in `prometheus/prometheus.yml`

### **Dashboard Not Loading**

1. Verify JSON syntax is valid
2. Check `uid` is unique
3. Ensure datasource variable `${DS_PROMETHEUS}` is used
4. Verify dashboard is in correct folder
5. Check Grafana provisioning config in `grafana/provisioning/dashboards.yml`
6. Review Grafana logs: `docker-compose logs grafana`

### **Alerts Not Firing**

1. Check alert expression syntax
2. Verify metric exists in Prometheus
3. Test expression in Prometheus UI: http://localhost:9090/graph
4. Check alert evaluation: http://localhost:9090/alerts
5. Verify Alertmanager config
6. Check Alertmanager logs: `docker-compose logs alertmanager`

---

## 📊 Metric Categories

### **API Metrics** (4 metrics)
- `http_request_duration_seconds` - Request latency
- `http_request_total` - Request count
- `http_request_size_bytes` - Request size
- `http_response_size_bytes` - Response size

### **Database Metrics** (5 metrics)
- `db_query_duration_seconds` - Query latency
- `db_query_total` - Query count
- `db_query_errors_total` - Query errors
- `db_connection_pool_size` - Connection pool
- `db_transaction_duration_seconds` - Transaction latency

### **Booking Metrics** (5 metrics)
- `booking_created_total` - Booking creation count
- `booking_creation_duration_seconds` - Creation latency
- `booking_conflicts_total` - Conflict count
- `booking_approvals_total` - Approval count
- `booking_cancellations_total` - Cancellation count

### **Authentication Metrics** (4 metrics)
- `auth_attempts_total` - Auth attempt count
- `auth_session_duration_seconds` - Session duration
- `auth_active_sessions` - Active sessions
- `auth_token_refreshes_total` - Token refresh count

### **Custody Metrics** (3 metrics)
- `custody_checks_total` - Permission check count
- `custody_grants_total` - Grant count
- `custody_revocations_total` - Revocation count

### **Entitlement Metrics** (3 metrics)
- `entitlement_checks_total` - Entitlement check count
- `entitlement_updates_total` - Update count
- `feature_flag_evaluations_total` - Feature flag evaluation count

### **WebSocket Metrics** (4 metrics)
- `websocket_connections` - Active connections
- `websocket_messages_sent_total` - Messages sent
- `websocket_messages_received_total` - Messages received
- `websocket_errors_total` - Error count

### **Tenant Metrics** (4 metrics)
- `tenant_active_users` - Active users per tenant
- `tenant_api_requests_total` - API requests per tenant
- `tenant_storage_usage_bytes` - Storage usage per tenant
- `tenant_bookings_total` - Bookings per tenant

---

## 🎨 Best Practices

### **Metric Design**

1. **Use labels wisely** - Don't create high-cardinality labels (e.g., user IDs)
2. **Keep it simple** - Start with counters and histograms
3. **Think about queries** - Design metrics for the queries you'll run
4. **Document everything** - Add clear `help` text to all metrics
5. **Consider retention** - High-cardinality metrics are expensive

### **Dashboard Design**

1. **Start with overview** - Show most important metrics first
2. **Use appropriate visualizations** - Time series for trends, gauges for current state
3. **Add legends** - Make it clear what each line represents
4. **Set proper units** - Use seconds, bytes, percentages correctly
5. **Test with real data** - Don't just test with empty metrics

### **Alert Design**

1. **Alert on symptoms, not causes** - Alert on user impact, not internal state
2. **Use appropriate thresholds** - Based on SLOs, not arbitrary numbers
3. **Include context** - Add helpful annotations with troubleshooting steps
4. **Test alerts** - Verify they fire when expected
5. **Avoid alert fatigue** - Too many alerts = ignored alerts

---

## 🔗 Integration Examples

### **Fastify Middleware**
```typescript
import { createApiMetricsMiddleware } from '@xala/observability';

app.use(createApiMetricsMiddleware());
```

### **Drizzle ORM Wrapper**
```typescript
import { withDatabaseMetrics } from '@xala/observability';

const users = await withDatabaseMetrics(
  'SELECT',
  'users',
  () => db.select().from(users).where(eq(users.tenantId, tenantId)),
  tenantId
);
```

### **Booking Service**
```typescript
import { withBookingMetrics } from '@xala/observability';

const booking = await withBookingMetrics(
  'SINGLE_SLOT',
  tenantId,
  () => bookingService.create(data)
);
```

---

## 📚 References

- **Prometheus Best Practices:** https://prometheus.io/docs/practices/naming/
- **Grafana Documentation:** https://grafana.com/docs/
- **OpenTelemetry:** https://opentelemetry.io/
- **Package README:** `./README.md`
- **Implementation Summary:** `./IMPLEMENTATION_SUMMARY.md`
- **Agent Commands:** `./AGENTS.md`

---

## ⚠️ Common Mistakes to Avoid

1. **Don't use high-cardinality labels** (e.g., email addresses, UUIDs)
2. **Don't change metric names** without deprecation period
3. **Don't create P0 alerts** without proper justification
4. **Don't hardcode thresholds** - use recording rules
5. **Don't ignore TypeScript errors** - they prevent runtime issues
6. **Don't skip validation** - always run `pnpm prometheus:validate`
7. **Don't forget tenant_id labels** - required for multi-tenancy
8. **Don't mix metric types** - counter vs gauge vs histogram
9. **Don't create duplicate metrics** - check existing metrics first
10. **Don't skip documentation** - update README when adding features

---

## 🎯 Decision Tree

**When adding monitoring:**

1. **Is it a new feature?**
   - Yes → Create new metric category
   - No → Use existing category

2. **What type of metric?**
   - Counting events → Counter (`_total`)
   - Current state → Gauge
   - Measuring duration → Histogram (`_seconds`)
   - Statistical distribution → Summary

3. **What labels needed?**
   - Always include: `tenant_id` (for multi-tenancy)
   - Operation type: `operation`, `action`, `method`
   - Status: `status`, `result`
   - Resource: `table`, `endpoint`, `service`

4. **What severity for alerts?**
   - User-facing outage → P0 (Critical)
   - Degraded performance → P1 (Warning)
   - Unusual pattern → P2 (Info)

5. **Which dashboard?**
   - Infrastructure → Platform
   - Business logic → Business
   - App-specific → Apps
   - Per-tenant → Tenants

---

## 🚀 Quick Commands

```bash
# Development
pnpm install && pnpm build

# Local stack
pnpm docker:up

# Validation
pnpm prometheus:validate

# Access services
open http://localhost:3000  # Grafana
open http://localhost:9090  # Prometheus
```

---

**Last Updated:** 2026-01-18  
**Package Version:** 1.0.0  
**Status:** Production Ready
