# Observability Package - Agent Commands

> **Package:** `@xala/observability`  
> **Purpose:** Production monitoring, metrics, dashboards, and alerting

---

## 🚀 Quick Reference

```bash
# Development
pnpm install                # Install dependencies
pnpm build                  # Build TypeScript
pnpm dev                    # Watch mode

# Local Stack
pnpm docker:up              # Start observability stack
pnpm docker:down            # Stop observability stack

# Validation
pnpm prometheus:validate    # Validate Prometheus rules
pnpm grafana:provision      # Provision Grafana dashboards
pnpm test                   # Run tests
```

---

## 📦 Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/observability install
pnpm --filter @xala/observability build
pnpm --filter @xala/observability test
```

---

## 🎯 Key Files

### **TypeScript Metrics**
- `src/types/index.ts` - Type definitions
- `src/metrics/definitions.ts` - All metric definitions (36 metrics)
- `src/metrics/api.ts` - API metric helpers
- `src/metrics/database.ts` - Database metric helpers
- `src/metrics/booking.ts` - Booking metric helpers
- `src/exporters/prometheus.ts` - Prometheus exporter

### **Grafana Dashboards**
- `grafana/dashboards/platform/` - Infrastructure dashboards
- `grafana/dashboards/business/` - Business logic dashboards
- `grafana/dashboards/apps/` - Application dashboards
- `grafana/dashboards/tenants/` - Tenant-specific dashboards

### **Prometheus Configuration**
- `prometheus/prometheus.yml` - Main configuration
- `prometheus/rules/api.rules.yml` - API recording & alert rules
- `prometheus/rules/database.rules.yml` - Database rules
- `prometheus/rules/booking.rules.yml` - Booking rules

### **Observability Stack**
- `docker-compose.observability.yml` - Complete local stack
- `loki/loki.yml` - Log aggregation config
- `tempo/tempo.yml` - Distributed tracing config
- `alertmanager/alertmanager.yml` - Alert routing config

---

## 🔧 Common Tasks

### **Add New Metric**

1. **Define metric in `src/metrics/definitions.ts`:**
```typescript
export const MY_METRICS: Record<string, MetricDefinition> = {
  MY_METRIC: {
    name: 'my_metric_total',
    type: 'counter',
    help: 'Description of my metric',
    labelNames: ['label1', 'label2'],
  },
};
```

2. **Add to ALL_METRICS:**
```typescript
export const ALL_METRICS = {
  ...EXISTING_METRICS,
  ...MY_METRICS,
} as const;
```

3. **Create helper function:**
```typescript
// src/metrics/my-feature.ts
export function recordMyMetric(label1: string, label2: string): void {
  prometheusExporter.incrementCounter('my_metric_total', { label1, label2 });
}
```

4. **Export from index:**
```typescript
// src/metrics/index.ts
export * from './my-feature';
```

### **Add New Dashboard**

1. **Create dashboard JSON in appropriate folder:**
   - Platform: `grafana/dashboards/platform/`
   - Business: `grafana/dashboards/business/`
   - Apps: `grafana/dashboards/apps/`
   - Tenants: `grafana/dashboards/tenants/`

2. **Dashboard must include:**
   - Unique `uid`
   - Descriptive `title`
   - Appropriate `tags`
   - Datasource variable: `${DS_PROMETHEUS}`

3. **Restart Grafana to load:**
```bash
pnpm docker:down
pnpm docker:up
```

### **Add New Alert Rule**

1. **Add to appropriate rules file:**
```yaml
# prometheus/rules/my-feature.rules.yml
groups:
  - name: my_feature_alerts
    rules:
      - alert: MyFeatureAlert
        expr: my_metric_total > 100
        for: 5m
        labels:
          severity: warning
          priority: P1
        annotations:
          summary: "My feature alert"
          description: "Metric exceeded threshold: {{ $value }}"
```

2. **Validate rules:**
```bash
pnpm prometheus:validate
```

3. **Restart Prometheus:**
```bash
docker-compose -f docker-compose.observability.yml restart prometheus
```

### **Integrate with Application**

**API Integration:**
```typescript
// apps/api/src/main.ts
import { createApiMetricsMiddleware, prometheusExporter } from '@xala/observability';

// Add middleware
app.use(createApiMetricsMiddleware());

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheusExporter.getRegistry().contentType);
  res.send(await prometheusExporter.getMetrics());
});
```

**Database Integration:**
```typescript
import { withDatabaseMetrics } from '@xala/observability';

const result = await withDatabaseMetrics(
  'SELECT',
  'users',
  () => db.select().from(users).where(eq(users.tenantId, tenantId)),
  tenantId
);
```

**Booking Integration:**
```typescript
import { withBookingMetrics } from '@xala/observability';

const booking = await withBookingMetrics(
  'SINGLE_SLOT',
  tenantId,
  () => bookingService.create(data)
);
```

---

## 🐳 Docker Commands

### **Start Stack**
```bash
pnpm docker:up
# or
docker-compose -f docker-compose.observability.yml up -d
```

### **Stop Stack**
```bash
pnpm docker:down
# or
docker-compose -f docker-compose.observability.yml down
```

### **View Logs**
```bash
docker-compose -f docker-compose.observability.yml logs -f prometheus
docker-compose -f docker-compose.observability.yml logs -f grafana
docker-compose -f docker-compose.observability.yml logs -f loki
```

### **Restart Service**
```bash
docker-compose -f docker-compose.observability.yml restart prometheus
docker-compose -f docker-compose.observability.yml restart grafana
```

---

## 🌐 Access URLs

When running locally:

- **Grafana:** http://localhost:3000 (admin/admin)
- **Prometheus:** http://localhost:9090
- **Alertmanager:** http://localhost:9093
- **Loki:** http://localhost:3100
- **Tempo:** http://localhost:3200

---

## 🚨 Alert Severity Levels

### **Critical (P0)**
- Requires immediate action
- Wakes up on-call engineer
- Examples: API down, database connection pool exhausted

### **Warning (P1)**
- Requires attention within 1 hour
- Sent to Slack #alerts-warning
- Examples: High latency, slow queries

### **Info (P2)**
- For awareness only
- Batched notifications
- Examples: Unusual patterns, anomalies

---

## 📊 Metric Naming Conventions

Follow Prometheus best practices:

- **Counters:** `*_total` suffix (e.g., `http_request_total`)
- **Gauges:** No suffix (e.g., `active_connections`)
- **Histograms:** `*_seconds` or `*_bytes` (e.g., `http_request_duration_seconds`)
- **Labels:** Use snake_case (e.g., `tenant_id`, `status_code`)

---

## 🧪 Testing

### **Unit Tests**
```bash
pnpm test
```

### **Validate Prometheus Rules**
```bash
pnpm prometheus:validate
```

### **Test Metrics Endpoint**
```bash
# Start API with metrics
curl http://localhost:4000/metrics
```

### **Test Alert Rules**
```bash
# Check Prometheus rules
curl http://localhost:9090/api/v1/rules

# Check Alertmanager
curl http://localhost:9093/api/v2/alerts
```

---

## 📚 Documentation

- **README.md** - Complete usage guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **CLAUDE.md** - AI assistant instructions
- **../../infrastructure/ANALYSIS.md** - Infrastructure analysis

---

## 🔐 Security Notes

- **Never commit secrets** to Alertmanager config
- Use environment variables for sensitive data
- Restrict Grafana access in production
- Enable authentication on Prometheus in production

---

## 🚀 Deployment

### **Production Checklist**

- [ ] Set proper retention periods
- [ ] Configure external storage (S3, GCS)
- [ ] Set up high availability
- [ ] Configure TLS/SSL
- [ ] Set up authentication
- [ ] Configure backup strategy
- [ ] Test alert routing
- [ ] Document runbooks

### **Environment Variables**

```bash
# Alertmanager
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SENDGRID_API_KEY=SG.xxx
PAGERDUTY_SERVICE_KEY=xxx

# Grafana
GF_SECURITY_ADMIN_PASSWORD=secure-password
GF_SERVER_ROOT_URL=https://grafana.digilist.no

# Prometheus
PROMETHEUS_RETENTION=30d
PROMETHEUS_STORAGE_PATH=/prometheus
```

---

## 🐛 Troubleshooting

### **Metrics Not Appearing**

1. Check API /metrics endpoint is accessible
2. Verify Prometheus scrape config
3. Check Prometheus targets: http://localhost:9090/targets
4. Review Prometheus logs

### **Dashboards Not Loading**

1. Verify Grafana provisioning config
2. Check dashboard JSON syntax
3. Ensure datasource is configured
4. Review Grafana logs

### **Alerts Not Firing**

1. Check alert rule syntax
2. Verify Prometheus is evaluating rules
3. Check Alertmanager config
4. Test webhook endpoints

---

## 📞 Support

For issues or questions:
1. Check documentation in this directory
2. Review Prometheus/Grafana official docs
3. Check platform logs
4. Contact DevOps team

---

**Last Updated:** 2026-01-18  
**Package Version:** 1.0.0  
**Status:** Production Ready
