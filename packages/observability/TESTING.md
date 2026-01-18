# Observability Package - Testing Guide

**Package:** `@xala/observability`  
**Test Coverage Target:** 80%+

---

## 🧪 Test Suite Overview

### **Test Types**

1. **Unit Tests** - Test individual functions and classes
2. **Integration Tests** - Test Prometheus and Grafana configurations
3. **Validation Tests** - Validate YAML and JSON configurations
4. **Coverage Tests** - Ensure 80%+ code coverage

---

## 🚀 Running Tests

### **Quick Start**

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run integration tests
pnpm test:integration

# Run all tests + validations
pnpm test:all
```

### **Individual Test Suites**

```bash
# Unit tests only
pnpm test src/metrics/definitions.test.ts

# API metrics tests
pnpm test src/metrics/api.test.ts

# Database metrics tests
pnpm test src/metrics/database.test.ts

# Booking metrics tests
pnpm test src/metrics/booking.test.ts

# Prometheus exporter tests
pnpm test src/exporters/prometheus.test.ts
```

---

## 📊 Test Coverage

### **Coverage Thresholds**

| Metric | Threshold | Current |
|--------|-----------|---------|
| **Lines** | 80% | TBD |
| **Functions** | 80% | TBD |
| **Branches** | 75% | TBD |
| **Statements** | 80% | TBD |

### **View Coverage Report**

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

### **Coverage Reports**

- **Text** - Console output
- **JSON** - `coverage/coverage-final.json`
- **HTML** - `coverage/index.html`
- **LCOV** - `coverage/lcov.info` (for CI/CD)

---

## ✅ Validation Tests

### **Prometheus Validation**

```bash
# Validate Prometheus config and rules
pnpm prometheus:validate

# Or manually
bash scripts/validate-prometheus.sh
```

**What's Validated:**
- `prometheus/prometheus.yml` - Main configuration
- `prometheus/rules/*.yml` - All recording and alert rules
- Syntax correctness
- Expression validity

### **Grafana Validation**

```bash
# Validate Grafana dashboards
pnpm grafana:validate

# Or manually
bash scripts/validate-grafana.sh
```

**What's Validated:**
- All `*.json` files in `grafana/dashboards/`
- JSON syntax
- Required fields (uid, title, panels)
- Datasource variables

---

## 🔬 Unit Tests

### **Metric Definitions Tests**

**File:** `src/metrics/definitions.test.ts`

**Tests:**
- ✅ Naming conventions (counters end with `_total`)
- ✅ Histogram suffixes (`_seconds`, `_bytes`)
- ✅ Snake_case naming
- ✅ Required fields (name, type, help)
- ✅ Histogram bucket configuration
- ✅ Metric category completeness

### **Prometheus Exporter Tests**

**File:** `src/exporters/prometheus.test.ts`

**Tests:**
- ✅ Initialization
- ✅ Counter operations
- ✅ Gauge operations (set, increment, decrement)
- ✅ Histogram observations
- ✅ Metrics export (Prometheus format, JSON)
- ✅ Registry operations

### **API Metrics Tests**

**File:** `src/metrics/api.test.ts`

**Tests:**
- ✅ HTTP request recording
- ✅ Request/response size recording
- ✅ Different HTTP methods
- ✅ Error responses
- ✅ Middleware creation

### **Database Metrics Tests**

**File:** `src/metrics/database.test.ts`

**Tests:**
- ✅ Query recording (SELECT, INSERT, UPDATE, DELETE)
- ✅ Error recording
- ✅ Connection pool metrics
- ✅ Transaction recording
- ✅ Wrapper function (`withDatabaseMetrics`)

### **Booking Metrics Tests**

**File:** `src/metrics/booking.test.ts`

**Tests:**
- ✅ Booking creation (success, failure, conflict)
- ✅ Conflict recording
- ✅ Approval/rejection recording
- ✅ Cancellation recording
- ✅ Wrapper function (`withBookingMetrics`)

---

## 🔗 Integration Tests

### **Prometheus Integration**

**File:** `test/integration/prometheus.integration.test.ts`

**Tests:**
- ✅ Configuration validity
- ✅ Alertmanager configuration
- ✅ Rule files configuration
- ✅ Scrape configurations
- ✅ Scrape intervals

### **Running Integration Tests**

```bash
# Start observability stack
pnpm docker:up

# Wait for services to be ready
sleep 10

# Run integration tests
pnpm test:integration

# Stop stack
pnpm docker:down
```

---

## 🎯 Test Best Practices

### **Writing Tests**

1. **Use descriptive test names**
   ```typescript
   it('should record HTTP request with all parameters', () => {
     // Test implementation
   });
   ```

2. **Reset state between tests**
   ```typescript
   beforeEach(() => {
     prometheusExporter.resetMetrics();
   });
   ```

3. **Test both success and failure cases**
   ```typescript
   it('should wrap successful query', async () => { /* ... */ });
   it('should wrap failed query and record error', async () => { /* ... */ });
   ```

4. **Use meaningful assertions**
   ```typescript
   expect(metrics).toBeDefined();
   expect(result).toEqual(expectedValue);
   ```

### **Test Organization**

```
src/
├── metrics/
│   ├── definitions.ts
│   ├── definitions.test.ts      # Co-located with source
│   ├── api.ts
│   ├── api.test.ts
│   └── ...
└── exporters/
    ├── prometheus.ts
    └── prometheus.test.ts

test/
└── integration/
    └── prometheus.integration.test.ts
```

---

## 🔧 CI/CD Integration

### **GitHub Actions**

**File:** `.github/workflows/test.yml`

**Workflow:**
1. Install dependencies
2. Run unit tests
3. Generate coverage report
4. Upload to Codecov
5. Build TypeScript
6. Validate Prometheus config
7. Validate Grafana dashboards
8. Run integration tests (with Docker)

### **Running Locally**

```bash
# Simulate CI environment
pnpm test:all
```

---

## 📈 Coverage Goals

### **Current Coverage**

```bash
# Check current coverage
pnpm test:coverage
```

### **Improving Coverage**

1. **Identify uncovered code**
   ```bash
   pnpm test:coverage
   open coverage/index.html
   ```

2. **Add tests for uncovered lines**
   - Focus on critical paths first
   - Test error handling
   - Test edge cases

3. **Verify improvement**
   ```bash
   pnpm test:coverage
   ```

---

## 🐛 Debugging Tests

### **Run Single Test**

```bash
# Run specific test file
pnpm test src/metrics/api.test.ts

# Run specific test case
pnpm test -t "should record HTTP request"
```

### **Debug Mode**

```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run with debugging
node --inspect-brk node_modules/.bin/vitest
```

### **Common Issues**

**Issue:** Tests fail with "Cannot find module"
**Solution:** Run `pnpm install` to install dependencies

**Issue:** Integration tests timeout
**Solution:** Ensure Docker services are running: `pnpm docker:up`

**Issue:** Coverage below threshold
**Solution:** Add tests for uncovered code paths

---

## 📝 Test Checklist

Before committing:

- [ ] All unit tests pass: `pnpm test`
- [ ] Coverage meets threshold: `pnpm test:coverage`
- [ ] Prometheus config valid: `pnpm prometheus:validate`
- [ ] Grafana dashboards valid: `pnpm grafana:validate`
- [ ] TypeScript compiles: `pnpm build`
- [ ] No linting errors: `pnpm lint`

---

## 🚀 Quick Commands

```bash
# Full test suite
pnpm test:all

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage

# Validate configs
pnpm validate

# Integration tests
pnpm docker:up && pnpm test:integration && pnpm docker:down
```

---

## 📚 Resources

- **Vitest Documentation:** https://vitest.dev/
- **Prometheus Testing:** https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/
- **Grafana Dashboard JSON:** https://grafana.com/docs/grafana/latest/dashboards/json-model/

---

**Last Updated:** 2026-01-18  
**Test Framework:** Vitest 2.1.8  
**Coverage Tool:** v8
