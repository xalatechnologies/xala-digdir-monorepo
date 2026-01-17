# Runtime Assurance

## Overview

This document describes runtime monitoring, error tracking, and observability for production quality assurance.

---

## Error Monitoring (Sentry)

### Configuration

```typescript
// apps/api/src/observability/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.RELEASE_VERSION,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],
});
```

### Required Tags

| Tag | Source | Purpose |
|-----|--------|---------|
| `environment` | `NODE_ENV` | Env filtering |
| `release` | Git tag | Release tracking |
| `tenantId` | Session | Tenant isolation |
| `app` | Config | App identification |
| `correlationId` | Request | Request tracing |

---

## Structured Logging

### Format

```json
{
  "level": "error",
  "message": "Booking creation failed",
  "timestamp": "2026-01-17T22:00:00.000Z",
  "correlationId": "abc-123",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid-hash",
  "context": {
    "rentalObjectId": "obj-uuid",
    "action": "booking.create"
  }
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Unhandled exceptions, 5xx |
| `warn` | Degraded state, fallbacks |
| `info` | Business events |
| `debug` | Dev-only diagnostics |

---

## Health Endpoints

### Liveness

```
GET /health/live
→ 200 { status: "ok" }
```

### Readiness

```
GET /health/ready
→ 200 { status: "ok", db: "connected", cache: "connected" }
→ 503 { status: "degraded", db: "disconnected" }
```

---

## No-Console Enforcement

### ESLint Rule

```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

### CI Check

```bash
# scripts/check-console.sh
grep -r "console.log" apps/ packages/ --include="*.ts" --include="*.tsx" && exit 1 || exit 0
```

---

## Env Validation

### Schema

```typescript
// apps/api/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

### Fail Fast

```typescript
// Boot-time validation
try {
  const config = envSchema.parse(process.env);
} catch (error) {
  console.error('Invalid environment configuration:', error);
  process.exit(1);
}
```

---

## Synthetic Monitoring

### Smoke Tests

```bash
# Run hourly against staging
npx playwright test tests/synthetic/smoke.spec.ts --project=chromium
```

### Health Checks

| Check | Frequency | Alert |
|-------|-----------|-------|
| API health | 1 min | Slack |
| Login flow | 5 min | PagerDuty |
| Booking flow | 15 min | Email |

---

## Incident Response

### Severity Levels

| Level | Response | Example |
|-------|----------|---------|
| P0 | Immediate | Total outage |
| P1 | < 1 hour | Auth failure |
| P2 | < 4 hours | Feature broken |
| P3 | Next day | Minor bug |

### Runbook

1. Acknowledge incident in Sentry
2. Check logs for correlation ID
3. Identify affected tenants
4. Implement fix or rollback
5. Post-mortem within 24h

---

*Generated: 2026-01-17*
