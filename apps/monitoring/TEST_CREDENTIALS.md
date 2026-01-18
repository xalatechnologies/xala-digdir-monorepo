# Monitoring App - Test Credentials

**Purpose:** Internal monitoring tool for SaaS administrators

---

## 🔐 **Test User Credentials**

### **SaaS Admin (Full Access)**
```
Email: monitoring@digilist.no
Password: Monitoring2026!
User ID: test-user-monitoring-001
Tenant ID: monitoring-tenant-001
Role: SAAS_ADMIN
```

**Permissions:**
- `monitoring:read` - View all monitoring data
- `monitoring:write` - Create/update incidents and monitors
- `monitoring:admin` - Full administrative access
- Cross-tenant access (can view all tenants)

---

## 🗄️ **Database Seed Data**

### **SQL Script to Create Test User**

```sql
-- Insert test user for monitoring
INSERT INTO platform.users (
  id,
  email,
  name,
  role,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'test-user-monitoring-001',
  'monitoring@digilist.no',
  'Monitoring Admin',
  'SAAS_ADMIN',
  'monitoring-tenant-001',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert tenant
INSERT INTO platform.tenants (
  id,
  name,
  slug,
  created_at,
  updated_at
) VALUES (
  'monitoring-tenant-001',
  'Monitoring Team',
  'monitoring',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Grant monitoring permissions
INSERT INTO platform.user_permissions (
  user_id,
  permission,
  created_at
) VALUES
  ('test-user-monitoring-001', 'monitoring:read', NOW()),
  ('test-user-monitoring-001', 'monitoring:write', NOW()),
  ('test-user-monitoring-001', 'monitoring:admin', NOW())
ON CONFLICT DO NOTHING;

-- Create sample incidents
INSERT INTO monitoring.incidents (
  id,
  title,
  description,
  severity,
  status,
  affected_services,
  tenant_id,
  created_at,
  updated_at
) VALUES
  (
    'incident-001',
    'API Latency Spike',
    'Response times increased to 2s average',
    'high',
    'investigating',
    '["API", "Database"]'::jsonb,
    'monitoring-tenant-001',
    NOW(),
    NOW()
  ),
  (
    'incident-002',
    'Database Connection Pool Exhausted',
    'All connections in use, queries queuing',
    'critical',
    'open',
    '["Database"]'::jsonb,
    'monitoring-tenant-001',
    NOW() - INTERVAL '1 hour',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Create sample synthetic monitors
INSERT INTO monitoring.synthetic_monitors (
  id,
  name,
  type,
  url,
  interval,
  timeout,
  enabled,
  tenant_id,
  created_at,
  updated_at
) VALUES
  (
    'monitor-001',
    'API Health Check',
    'http',
    'https://api.digilist.no/health',
    60,
    5000,
    true,
    'monitoring-tenant-001',
    NOW(),
    NOW()
  ),
  (
    'monitor-002',
    'Login Page Load',
    'browser',
    'https://digilist.no/login',
    300,
    10000,
    true,
    'monitoring-tenant-001',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
```

---

## 🧪 **Testing Configuration**

### **Environment Variables (.env.test)**

```bash
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000/ws

# Test User
VITE_TEST_USER_ID=test-user-monitoring-001
VITE_TENANT_ID=monitoring-tenant-001

# Auth (for testing)
VITE_SKIP_AUTH=false
VITE_MOCK_AUTH=true
```

### **Playwright Test Configuration**

```typescript
// playwright.config.ts
export default {
  use: {
    baseURL: 'http://localhost:5175',
    extraHTTPHeaders: {
      'X-User-Id': 'test-user-monitoring-001',
      'X-Tenant-Id': 'monitoring-tenant-001',
    },
  },
};
```

---

## 🔧 **Quick Setup**

### **1. Run Database Seed**
```bash
# From monorepo root
psql -d digilist_dev -f apps/monitoring/TEST_CREDENTIALS.sql
```

### **2. Start Monitoring App**
```bash
pnpm --filter @xala/monitoring dev
# Opens at http://localhost:5175
```

### **3. Login**
- Navigate to http://localhost:5175
- Use credentials above
- Should redirect to monitoring overview

---

## 📊 **Test Data Available**

### **Incidents**
- 2 sample incidents (1 critical, 1 high severity)
- Various statuses (open, investigating)

### **Synthetic Monitors**
- 2 sample monitors (HTTP and browser)
- Enabled and running

### **Grafana Dashboards**
- Platform Overview
- API Metrics
- (Requires Grafana connection)

### **Logs**
- Sample error and warning logs
- (Requires Loki connection)

### **Audit Events**
- Sample incident creation/resolution events
- (Requires audit schema)

---

## 🎯 **Testing Scenarios**

### **Scenario 1: View System Overview**
1. Login with test credentials
2. Navigate to `/overview`
3. Verify system health cards display
4. Check metrics are visible

### **Scenario 2: Manage Incidents**
1. Navigate to `/incidents`
2. View incident list
3. Click incident to view details
4. Update incident status
5. Verify audit log created

### **Scenario 3: Monitor Synthetics**
1. Navigate to `/synthetics`
2. View monitor list
3. Trigger manual run
4. View run history

### **Scenario 4: View Logs**
1. Navigate to `/logs`
2. Apply filters (level, service, date)
3. Search logs
4. Export logs

---

## 🔒 **Security Notes**

- **These credentials are for testing only**
- **Never use in production**
- **Change passwords before deployment**
- **Revoke test user access in production**

---

## 📝 **Notes**

- Test user has full SaaS Admin permissions
- Can access all monitoring features
- Cross-tenant access enabled
- All test data is scoped to `monitoring-tenant-001`

---

**Last Updated:** 2026-01-18  
**Status:** Ready for testing
