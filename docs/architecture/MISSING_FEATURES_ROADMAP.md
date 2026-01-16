# Missing Features Implementation Roadmap

**Status:** Partially Implemented  
**Last Updated:** 2026-01-17

This document tracks the comprehensive feature checklist for enterprise-grade Digilist/Xala platform.

---

## ✅ Completed Migrations (0001-0017)

### Core Foundation
- ✅ **0001** - Clean schema (platform/domain/monitoring/compliance)
- ✅ **0002** - Domain notifications (in-app)
- ✅ **0003** - Domain messaging (conversations)
- ✅ **0004** - Domain feedback (ratings, favourites, likes)
- ✅ **0005** - Domain profiles (user profiles, app settings)
- ✅ **0006** - Domain support (help articles, tickets)
- ✅ **0007** - Domain RAG (knowledge base)
- ✅ **0008** - Domain SEO (meta tags, Open Graph)
- ✅ **0009** - Domain geo (geocoding, areas)
- ✅ **0010** - RLS policies (Row Level Security)
- ✅ **0011** - Enterprise economy (invoicing, ledger, usage metering)

### Platform Extensions
- ✅ **0012** - Platform marketplace (module categories, dependencies, versions, feature flags, runtime config)
- ✅ **0013** - Platform branding (themes, brand assets, design tokens)
- ✅ **0014** - Platform i18n governance (translation workflow, audit)

### Domain Business Logic
- ✅ **0015** - Domain availability (opening hours, exception days, capacity rules, conflict tracking)
- ✅ **0016** - Domain pricing engine (price rules, discounts, taxes, deposits)
- ✅ **0017** - Domain payments complete (intents, transactions, refunds, payouts, receipts)

---

## 🔄 Remaining Migrations (0018-0027)

### 0018 - Domain Case Management (SSA-L Workflow)
**Priority:** HIGH  
**Tables:**
- `domain.cases` - Approval cases, complaints, appeals
- `domain.case_events` - Append-only timeline
- `domain.case_assignments` - Case handler assignments
- `domain.sla_targets` - SLA per case type
- `domain.decision_templates` - Localized decision templates

**Key Features:**
- Booking approval workflow
- Complaint handling
- Appeal process
- SLA tracking
- Decision templating

---

### 0019 - Domain Documents & Templates
**Priority:** HIGH  
**Tables:**
- `domain.templates` - Email/PDF templates per tenant
- `domain.template_versions` - Version control
- `domain.generated_documents` - Booking confirmations, invoices, contracts

**Key Features:**
- Email templates (booking confirmation, cancellation, approval)
- PDF templates (invoices, receipts, contracts)
- Template versioning
- Variable substitution
- Multi-language support

---

### 0020 - Platform Notifications Delivery
**Priority:** MEDIUM  
**Tables:**
- `platform.notification_jobs` - Outbox → provider delivery
- `platform.notification_providers` - Vipps SMS/email gateway config
- `domain.notification_events` - User-visible sent/failed events

**Key Features:**
- Notification queue processing
- Provider integration (Vipps, SendGrid, etc.)
- Delivery tracking
- Retry logic
- Failure handling

---

### 0021 - Domain Search Indexing
**Priority:** MEDIUM  
**Tables:**
- `domain.search_index` - Denormalized search fields
- Add `ts_vector` columns for full-text search
- Add `pg_trgm` indexes for fuzzy matching

**Key Features:**
- Fast rental object search
- Full-text search (PostgreSQL)
- Fuzzy matching (typo tolerance)
- Geo-spatial search (PostGIS optional)
- Search analytics

---

### 0022 - Security Hardening
**Priority:** HIGH  
**Tables:**
- `platform.api_keys` - Service-to-service authentication
- `platform.service_accounts` - Non-human accounts
- `platform.ip_allowlists` - Backoffice/admin IP restrictions
- `platform.mfa_enrollment` - Multi-factor authentication

**Key Features:**
- API key management
- Service account RBAC
- IP whitelisting
- MFA enrollment tracking
- Security audit trail

---

### 0023 - Compliance Governance
**Priority:** HIGH  
**Tables:**
- `compliance.data_classification` - Public/Internal/Restricted
- `compliance.retention_enforcement_hooks` - Per-table/column policies
- `compliance.dpia_records` - Data Protection Impact Assessments

**Key Features:**
- Data classification labels
- Automated retention enforcement
- DPIA workflow
- Risk assessment tracking
- Compliance reporting

---

### 0024 - Monitoring & Observability
**Priority:** MEDIUM  
**Tables:**
- `monitoring.request_logs` - Endpoint, status, latency
- `monitoring.error_events` - RFC7807 error snapshots
- `monitoring.job_runs` - Background job tracking
- `monitoring.uptime_checks` - Health check results
- `monitoring.alerts` - Alert definitions
- `monitoring.alert_rules` - Alert conditions

**Key Features:**
- Request/response logging
- Error tracking
- Job monitoring
- Uptime monitoring
- Alerting system
- SLA reporting

---

### 0025 - Domain Moderation
**Priority:** MEDIUM  
**Tables:**
- `domain.moderation_flags` - Content flagging
- `domain.user_blocks` - User blocking
- `domain.rate_limit_buckets` - Rate limiting state
- `domain.content_reports` - User-reported content

**Key Features:**
- Content moderation queue
- User blocking/banning
- Rate limiting
- Abuse prevention
- Moderation workflow

---

### 0026 - Domain SEO Complete
**Priority:** LOW  
**Tables:**
- `domain.static_pages` - Tenant CMS-lite
- `domain.redirects` - URL redirect management
- `domain.sitemaps` - Generated sitemap snapshots

**Key Features:**
- Static page management
- 301/302 redirects
- Sitemap generation
- Robots.txt management
- Canonical URL handling

---

### 0027 - Domain RAG Maturity
**Priority:** LOW  
**Tables:**
- `domain.kb_ingestion_jobs` - Document ingestion tracking
- `domain.kb_permissions` - Query access control
- `domain.kb_linked_entities` - Link to rental objects/bookings

**Key Features:**
- Automated document ingestion
- Permission-based querying
- Entity linking
- RAG analytics
- Quality metrics

---

## Implementation Priority

### Phase 1 (MVP) - Q1 2026
1. ✅ Core schema (0001-0011)
2. ✅ Platform marketplace (0012)
3. ✅ Platform branding (0013)
4. ✅ Availability model (0015)
5. ✅ Pricing engine (0016)
6. ✅ Payments complete (0017)
7. 🔄 Case management (0018)
8. 🔄 Documents & templates (0019)

### Phase 2 (Production) - Q2 2026
9. 🔄 Security hardening (0022)
10. 🔄 Compliance governance (0023)
11. 🔄 Monitoring & observability (0024)
12. 🔄 Notification delivery (0020)

### Phase 3 (Scale) - Q3 2026
13. 🔄 Search indexing (0021)
14. 🔄 Content moderation (0025)
15. 🔄 SEO complete (0026)
16. 🔄 RAG maturity (0027)

---

## Database Schema Summary

### Total Tables by Schema

**platform:** ~35 tables
- Core: tenants, users, organizations, roles, permissions
- SaaS: modules, plans, subscriptions, entitlements
- Config: feature flags, runtime config, themes, i18n
- Security: api keys, service accounts, MFA
- Economy: invoices, ledger, usage metering

**domain:** ~60 tables
- Core: rental objects, categories, bookings
- Availability: opening hours, capacity, conflicts
- Pricing: price rules, discounts, taxes, deposits
- Payments: intents, transactions, refunds, receipts
- Communication: conversations, messages, notifications
- Content: ratings, feedback, help articles
- Documents: templates, generated docs
- Search: search index, geo areas

**compliance:** ~15 tables
- GDPR: data assets, retention policies, DSAR
- Security: incidents, breach register
- Governance: data classification, DPIA

**monitoring:** ~10 tables
- Observability: request logs, errors, jobs
- Health: uptime checks, alerts
- Auth: auth events, session tracking

**rls:** Helper functions only

**Total:** ~120 tables

---

## Next Steps

1. **Create remaining migration files (0018-0027)**
2. **Update Drizzle schema TypeScript definitions**
3. **Implement API services for new tables**
4. **Add RLS policies for new tables**
5. **Create seed data**
6. **Write integration tests**
7. **Update API documentation**

---

## Notes

- All migrations follow enum table pattern (no PostgreSQL ENUMs)
- All tables include tenant isolation
- All mutations require audit logging
- All sensitive data encrypted at rest
- All APIs follow RFC 7807 error format
- All endpoints have rate limiting
- All features support multi-language (nb, en, fr)
