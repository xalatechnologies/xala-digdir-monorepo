# @xala/observability

Production-grade observability stack for the Digilist platform.

## 🎯 Features

- **📊 Grafana Dashboards** - Pre-built dashboards for all platform components
- **📈 Prometheus Metrics** - Type-safe metric definitions and exporters
- **🚨 Alerting** - Critical, warning, and info alerts with proper escalation
- **🔍 Distributed Tracing** - Tempo integration for request tracing
- **📝 Log Aggregation** - Loki integration for centralized logging
- **🐳 Docker Compose** - Local development stack included

## 📦 Installation

```bash
# Install package
pnpm add @xala/observability

# Install peer dependencies
pnpm add prom-client
```

## 🚀 Quick Start

### 1. Initialize Metrics Exporter

```typescript
import { prometheusExporter } from '@xala/observability';

// Metrics are automatically initialized
// Access at /metrics endpoint
```

### 2. Record API Metrics

```typescript
import { recordHttpRequest, createApiMetricsMiddleware } from '@xala/observability';

// Option 1: Use middleware (recommended)
app.use(createApiMetricsMiddleware());

// Option 2: Manual recording
recordHttpRequest('GET', '/api/listings', 200, 0.123, 'tenant-123');
```

### 3. Record Database Metrics

```typescript
import { withDatabaseMetrics, recordDatabaseQuery } from '@xala/observability';

// Option 1: Wrapper function
const users = await withDatabaseMetrics(
  'SELECT',
  'users',
  () => db.select().from(users).where(eq(users.tenantId, tenantId)),
  tenantId
);

// Option 2: Manual recording
recordDatabaseQuery('SELECT', 0.045, 'users', tenantId);
```

### 4. Record Booking Metrics

```typescript
import { withBookingMetrics, recordBookingConflict } from '@xala/observability';

// Wrapper with automatic conflict detection
const booking = await withBookingMetrics(
  'SINGLE_SLOT',
  tenantId,
  () => createBooking(data)
);

// Manual conflict recording
recordBookingConflict('SINGLE_SLOT', tenantId);
```

## 📊 Dashboards

### Platform Dashboards

Located in `grafana/dashboards/platform/`:

- **api-overview.json** - API performance, errors, latency
- **database.json** - Query performance, connection pool, slow queries
- **auth.json** - Authentication metrics, session management
- **websockets.json** - WebSocket connections, messages, errors

### Business Dashboards

Located in `grafana/dashboards/business/`:

- **booking-engine.json** - Booking creation, conflicts, approvals
- **custody-grants.json** - Permission checks, grants, revocations
- **entitlements.json** - Feature flags, module access
- **domain-policy-engine.json** - Policy evaluations, adapter performance

### App Dashboards

Located in `grafana/dashboards/apps/`:

- **web.json** - Public website metrics
- **minside.json** - User portal metrics
- **backoffice.json** - Admin portal metrics
- **saas-admin.json** - Platform admin metrics

### Tenant Dashboards

Located in `grafana/dashboards/tenants/`:

- **tenant-health.json** - Per-tenant resource usage, API calls, storage

## 🚨 Alerts

### Critical Alerts (P0)

- API error rate > 5%
- Database connection pool exhausted
- Booking conflict rate > 20%
- Authentication failure rate > 10%

### Warning Alerts (P1)

- API latency p95 > 1s
- Database slow queries > 100ms
- WebSocket connection drops
- Tenant storage > 80% quota

### Info Alerts (P2)

- Feature flag evaluation anomalies
- Custody grant patterns
- Unusual tenant activity

## 🐳 Local Development

### Start Observability Stack

```bash
cd packages/observability
pnpm docker:up
```

This starts:
- **Grafana** - http://localhost:3000 (admin/admin)
- **Prometheus** - http://localhost:9090
- **Loki** - http://localhost:3100
- **Tempo** - http://localhost:3200

### Stop Stack

```bash
pnpm docker:down
```

## 📈 Prometheus Configuration

### Recording Rules

Located in `prometheus/rules/`:

- **api.rules.yml** - API aggregation rules
- **database.rules.yml** - Database aggregation rules
- **booking.rules.yml** - Booking aggregation rules
- **tenant.rules.yml** - Tenant aggregation rules

### Alert Rules

Located in `grafana/alerts/`:

- **critical.yml** - P0 alerts
- **warning.yml** - P1 alerts
- **info.yml** - P2 alerts

## 🔧 Configuration

### Grafana Provisioning

Dashboards and datasources are automatically provisioned from:

- `grafana/provisioning/dashboards.yml`
- `grafana/provisioning/datasources.yml`

### Prometheus Targets

Service discovery configuration in:

- `prometheus/targets/services.json`

## 📝 Metric Definitions

All metrics are defined in `src/metrics/definitions.ts`:

### API Metrics

- `http_request_duration_seconds` - Request latency histogram
- `http_request_total` - Request counter
- `http_request_size_bytes` - Request size histogram
- `http_response_size_bytes` - Response size histogram

### Database Metrics

- `db_query_duration_seconds` - Query latency histogram
- `db_query_total` - Query counter
- `db_query_errors_total` - Query error counter
- `db_connection_pool_size` - Connection pool gauge
- `db_transaction_duration_seconds` - Transaction latency histogram

### Booking Metrics

- `booking_created_total` - Booking creation counter
- `booking_creation_duration_seconds` - Booking creation latency
- `booking_conflicts_total` - Conflict counter
- `booking_approvals_total` - Approval counter
- `booking_cancellations_total` - Cancellation counter

### Authentication Metrics

- `auth_attempts_total` - Authentication attempt counter
- `auth_session_duration_seconds` - Session duration histogram
- `auth_active_sessions` - Active session gauge
- `auth_token_refreshes_total` - Token refresh counter

### WebSocket Metrics

- `websocket_connections` - Active connection gauge
- `websocket_messages_sent_total` - Message sent counter
- `websocket_messages_received_total` - Message received counter
- `websocket_errors_total` - Error counter

### Tenant Metrics

- `tenant_active_users` - Active users per tenant gauge
- `tenant_api_requests_total` - API requests per tenant counter
- `tenant_storage_usage_bytes` - Storage usage per tenant gauge
- `tenant_bookings_total` - Bookings per tenant counter

## 🧪 Testing

```bash
# Run tests
pnpm test

# Validate Prometheus rules
pnpm prometheus:validate

# Provision Grafana dashboards
pnpm grafana:provision
```

## 📚 Documentation

- [Infrastructure Analysis](../../infrastructure/ANALYSIS.md)
- [Schema Coverage](../../docs/digilist-platform/schema-coverage.md)
- [Incident Monitoring](../../docs/digilist-platform/schema-coverage.md#incident-ingest-endpoint)

## 🔗 Integration

### API Integration

```typescript
// apps/api/src/main.ts
import { prometheusExporter, createApiMetricsMiddleware } from '@xala/observability';

// Add metrics middleware
app.use(createApiMetricsMiddleware());

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheusExporter.getRegistry().contentType);
  res.send(await prometheusExporter.getMetrics());
});
```

### Database Integration

```typescript
// Wrap Drizzle queries
import { withDatabaseMetrics } from '@xala/observability';

const listings = await withDatabaseMetrics(
  'SELECT',
  'listings',
  () => db.select().from(listings).where(eq(listings.tenantId, tenantId)),
  tenantId
);
```

### Booking Integration

```typescript
// Wrap booking operations
import { withBookingMetrics } from '@xala/observability';

const booking = await withBookingMetrics(
  bookingMode,
  tenantId,
  () => bookingService.create(data)
);
```

## 🚀 Deployment

### Production Setup

1. **Deploy Prometheus**
   ```bash
   # Use prometheus/prometheus.yml configuration
   prometheus --config.file=prometheus/prometheus.yml
   ```

2. **Deploy Grafana**
   ```bash
   # Mount provisioning directories
   grafana-server \
     --config=/etc/grafana/grafana.ini \
     --homepath=/usr/share/grafana
   ```

3. **Configure Alertmanager**
   ```bash
   # Use alertmanager/alertmanager.yml configuration
   alertmanager --config.file=alertmanager/alertmanager.yml
   ```

### Kubernetes Deployment

Helm charts and manifests coming soon.

## 📊 Dashboard Screenshots

Coming soon - see `grafana/dashboards/` for JSON definitions.

## 🤝 Contributing

When adding new metrics:

1. Define metric in `src/metrics/definitions.ts`
2. Add helper function in appropriate `src/metrics/*.ts` file
3. Create/update Grafana dashboard
4. Add Prometheus recording rule if needed
5. Add alert rule if critical
6. Update documentation

## 📄 License

Internal use only - Xala Technologies AS

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-01-18
