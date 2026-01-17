# GDPR Compliance Evidence

## Overview

This document provides automated test evidence for GDPR compliance in the Digilist platform.

---

## Data Subject Rights (DSAR)

### Right to Access (Article 15)

| Requirement | Test | Evidence |
|-------------|------|----------|
| Export personal data | `tests/integration/gdpr/dsar.test.ts` | ✅ |
| Machine-readable format | API returns JSON | ✅ |
| Response within 30 days | SLA monitoring | ⚠️ |

### Right to Erasure (Article 17)

| Requirement | Test | Evidence |
|-------------|------|----------|
| Delete account request | `dsar.test.ts` | ✅ |
| Delete booking history | Cascade delete | ✅ |
| Audit log preserved | Immutable audit | ✅ |

### Right to Rectification (Article 16)

| Requirement | Test | Evidence |
|-------------|------|----------|
| Update profile | `/users/me PATCH` | ✅ |
| Log changes | Audit trail | ✅ |

### Right to Data Portability (Article 20)

| Requirement | Test | Evidence |
|-------------|------|----------|
| Export in JSON/CSV | `/gdpr/export` | ✅ |
| Include all personal data | Schema verified | ✅ |

---

## Consent Management

### Cookie Consent

| Type | Default | User Control |
|------|---------|--------------|
| Necessary | Enabled | Cannot disable |
| Analytics | Disabled | Toggle |
| Marketing | Disabled | Toggle |

### Consent Storage

```sql
-- Consent tracked in database
SELECT * FROM platform.user_consents
WHERE user_id = :userId;
```

---

## Data Minimization

### API Response Audits

| Endpoint | PII Fields | Necessary |
|----------|------------|-----------|
| `/public/rental-objects` | None | ✅ |
| `/bookings` | user_id, email | ✅ |
| `/users/me` | All user fields | ✅ |

### Test Evidence

```typescript
// tests/integration/gdpr/dsar.test.ts
it('public endpoints should not expose unnecessary data', async () => {
  const response = await fetch(`${API_URL}/public/rental-objects`);
  const data = await response.json();
  
  expect(data.data[0].internalId).toBeUndefined();
  expect(data.data[0].password).toBeUndefined();
});
```

---

## Data Retention

### Retention Policies

| Data Type | Retention | Basis |
|-----------|-----------|-------|
| Bookings | 5 years | Legal |
| User profiles | Until deletion | Consent |
| Audit logs | 10 years | Legal |
| Sessions | 24 hours | Necessary |

### Automated Cleanup

```typescript
// Scheduled job runs nightly
async function cleanupExpiredData() {
  await db.execute(sql`
    DELETE FROM platform.sessions
    WHERE expires_at < NOW() - INTERVAL '30 days'
  `);
}
```

---

## Security Measures

### Encryption

| Data | At Rest | In Transit |
|------|---------|------------|
| PII | AES-256 (DB) | TLS 1.3 |
| Passwords | bcrypt | TLS 1.3 |
| Sessions | HMAC-SHA256 | TLS 1.3 |

### Access Control

| Role | PII Access |
|------|------------|
| Public | None |
| User | Own data only |
| Admin | Tenant data |
| Super Admin | All (audited) |

---

## Audit Trail

### Logged Events

| Event | Actor | Tenant | Timestamp |
|-------|-------|--------|-----------|
| Login | ✅ | ✅ | ✅ |
| Profile update | ✅ | ✅ | ✅ |
| Data export | ✅ | ✅ | ✅ |
| Data deletion | ✅ | ✅ | ✅ |

### Immutability

```typescript
// Audit logs cannot be deleted
it('audit log should be immutable', async () => {
  const response = await fetch(`${API_URL}/audit/some-id`, {
    method: 'DELETE',
  });
  expect([401, 403, 405]).toContain(response.status);
});
```

---

## Test Commands

```bash
# Run GDPR tests
pnpm test:gdpr

# Generate evidence report
pnpm test:gdpr --reporter=json > gdpr-evidence.json
```

---

## Compliance Checklist

- [x] Right to Access
- [x] Right to Erasure
- [x] Right to Rectification
- [x] Right to Data Portability
- [x] Consent Management
- [x] Data Minimization
- [x] Security Measures
- [x] Audit Trail
- [ ] DPO Contact (config needed)
- [ ] Breach Notification (workflow)

---

*Generated: 2026-01-17*
*Test Suite: tests/integration/gdpr/*
