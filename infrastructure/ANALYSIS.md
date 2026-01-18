# Infrastructure Directory - Analysis

**Date:** 2026-01-18  
**Status:** Single Grafana Dashboard (Minimal)

---

## 📁 Current Structure

```
infrastructure/
└── grafana/
    └── dashboards/
        └── domain-policy-engine.json
```

---

## 📊 What Exists

### **Grafana Dashboard: Domain Policy Engine**

**Purpose:** Monitors domain module policy engine metrics and adapter performance

**Metrics Tracked:**
1. **Adapter Execution Time (p95)** - Performance monitoring
   - Query: `histogram_quantile(0.95, sum(rate(domain_adapter_execution_time_bucket[5m])) by (le, adapter))`
   - Thresholds: Green (<10ms), Yellow (10-50ms), Red (>50ms)

2. **Adapter Execution Source** - Traffic distribution pie chart
   - Query: `sum(rate(domain_adapter_requests_total[5m])) by (source)`

3. **Policy Evaluations Rate** - Time series of policy evaluation throughput
   - Query: `sum(rate(domain_policy_evaluations_total[5m])) by (policy_type, result)`

4. **Booking Policy Rollout %** - Gauge showing booking policy rollout percentage
   - Query: `domain_policy_rollout_percentage{policy_type="booking"}`

5. **Pricing Policy Rollout %** - Gauge showing pricing policy rollout percentage
   - Query: `domain_policy_rollout_percentage{policy_type="pricing"}`

6. **Total Fallbacks** - Count of policy failures requiring fallback
   - Query: `sum(domain_adapter_fallback_total)`

**Configuration:**
- Refresh: Every 30 seconds
- Time range: Last 1 hour
- Data source: Prometheus (templated variable)
- Tags: `domain`, `policy`, `saas`

---

## 🎯 Assessment

### **What's Good:**
✅ Single focused dashboard for domain policy engine  
✅ Proper Prometheus queries with rate calculations  
✅ Good metric coverage (performance, throughput, rollout, failures)  
✅ Appropriate thresholds and visualization types  
✅ Uses Grafana best practices (templating, tags)

### **What's Missing:**

#### **1. Core Platform Dashboards**
- ❌ API Performance (response times, error rates, throughput)
- ❌ Database Metrics (connections, query performance, locks)
- ❌ Authentication & Authorization (login success/failure, session metrics)
- ❌ Booking Engine (booking flow, conflicts, approvals)
- ❌ Tenant Health (per-tenant metrics, resource usage)
- ❌ Real-time WebSocket (connection count, message throughput)

#### **2. Application-Specific Dashboards**
- ❌ Web App (page loads, user journeys, errors)
- ❌ MinSide (user activity, booking management)
- ❌ Backoffice (admin operations, RBAC checks)
- ❌ SaaS Admin (tenant operations, entitlements)

#### **3. Infrastructure Monitoring**
- ❌ No Terraform/IaC for Grafana provisioning
- ❌ No alert rules defined
- ❌ No dashboard provisioning automation
- ❌ No data source configuration

#### **4. Observability Stack**
- ❌ No Prometheus configuration
- ❌ No Loki (logs) dashboards
- ❌ No Tempo (traces) dashboards
- ❌ No alerting rules (Alertmanager)

---

## 💡 Recommendations

### **Option 1: Minimal Enhancement (Quick Win)**
Create a dedicated monitoring package with essential dashboards:

```
packages/monitoring/
├── grafana/
│   ├── dashboards/
│   │   ├── api-performance.json
│   │   ├── database-health.json
│   │   ├── booking-engine.json
│   │   ├── tenant-health.json
│   │   └── domain-policy-engine.json (move from infrastructure/)
│   ├── provisioning/
│   │   ├── dashboards.yml
│   │   └── datasources.yml
│   └── alerts/
│       └── critical-alerts.yml
├── prometheus/
│   └── rules/
│       ├── api.rules.yml
│       └── booking.rules.yml
└── README.md
```

### **Option 2: Full Observability Stack (Recommended)**
Create comprehensive monitoring infrastructure:

```
packages/observability/
├── grafana/
│   ├── dashboards/
│   │   ├── platform/
│   │   │   ├── api-overview.json
│   │   │   ├── database.json
│   │   │   ├── auth.json
│   │   │   └── websockets.json
│   │   ├── business/
│   │   │   ├── booking-engine.json
│   │   │   ├── custody-grants.json
│   │   │   ├── entitlements.json
│   │   │   └── domain-policy-engine.json
│   │   ├── apps/
│   │   │   ├── web.json
│   │   │   ├── minside.json
│   │   │   ├── backoffice.json
│   │   │   └── saas-admin.json
│   │   └── tenants/
│   │       └── tenant-health.json
│   ├── provisioning/
│   │   ├── dashboards.yml
│   │   ├── datasources.yml
│   │   └── notifiers.yml
│   └── alerts/
│       ├── critical.yml
│       ├── warning.yml
│       └── info.yml
├── prometheus/
│   ├── prometheus.yml
│   ├── rules/
│   │   ├── api.rules.yml
│   │   ├── database.rules.yml
│   │   ├── booking.rules.yml
│   │   └── tenant.rules.yml
│   └── targets/
│       └── services.json
├── loki/
│   ├── loki.yml
│   └── promtail.yml
├── tempo/
│   └── tempo.yml
├── alertmanager/
│   └── alertmanager.yml
├── src/
│   ├── metrics/
│   │   ├── api.metrics.ts
│   │   ├── booking.metrics.ts
│   │   └── policy.metrics.ts
│   ├── exporters/
│   │   └── custom-exporter.ts
│   └── index.ts
├── docker-compose.observability.yml
├── package.json
└── README.md
```

### **Option 3: Move to Infrastructure as Code**
Keep in `infrastructure/` but expand with proper IaC:

```
infrastructure/
├── terraform/
│   ├── grafana/
│   │   ├── main.tf
│   │   ├── dashboards.tf
│   │   └── alerts.tf
│   ├── prometheus/
│   │   └── main.tf
│   └── modules/
│       └── monitoring/
├── grafana/
│   └── dashboards/ (as-is, but expanded)
├── prometheus/
│   └── rules/
├── docker-compose.monitoring.yml
└── README.md
```

---

## 🚀 Recommended Action

**Create `packages/observability`** with:

1. **Immediate (Week 1):**
   - Move existing dashboard to package
   - Add API performance dashboard
   - Add database health dashboard
   - Add basic Prometheus rules
   - Add provisioning configuration

2. **Short-term (Week 2-3):**
   - Add booking engine dashboard
   - Add tenant health dashboard
   - Add critical alerts
   - Add app-specific dashboards

3. **Medium-term (Month 2):**
   - Add Loki for log aggregation
   - Add Tempo for distributed tracing
   - Add custom metrics exporters
   - Add SLO/SLI tracking

---

## 📝 Next Steps

1. **Decision:** Choose between Option 1 (minimal) or Option 2 (full stack)
2. **Create Package:** Set up `packages/observability` or expand `infrastructure/`
3. **Define Metrics:** Document all metrics to be tracked (align with schema-coverage.md)
4. **Provision Dashboards:** Create dashboard JSON files
5. **Set Up Alerts:** Define critical, warning, and info alerts
6. **Automate Deployment:** Add to CI/CD pipeline

---

## 🔗 Related

- **Incident Monitoring:** See `docs/digilist-platform/schema-coverage.md` for incident ingest endpoint
- **Synthetic Monitors:** Playwright-based health checks (see schema-coverage.md)
- **Policy Engine:** Current dashboard tracks domain policy metrics
