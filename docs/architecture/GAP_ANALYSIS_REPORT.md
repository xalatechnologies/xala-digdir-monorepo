# Missing Features Gap Analysis Report

**Generated:** 2026-01-17  
**Status:** COMPREHENSIVE AUDIT COMPLETE  
**Cross-Referenced:** Knowledge Items + Codebase + Roadmap

---

## 🚨 CRITICAL INFRASTRUCTURE ISSUE

**Problem:** Multiple migration directories are causing confusion about the source of truth.

**Impact:** Developers may create migrations in the wrong location, leading to:
- Inconsistent database state
- Deployment failures
- Lost migration history

**Directories Found:**
1. ✅ `apps/api/drizzle/` - **PRIMARY** (17 migrations, 0001-0017)
2. ⚠️ `apps/api/src/database/migrations/` - Duplicate/legacy SQL files
3. ⚠️ `apps/api/migrations/` - Orphaned initial schema

**Action Required:** See `MIGRATION_CONSOLIDATION_PLAN.md` for detailed remediation steps.

**Recommendation:** **Consolidate to `apps/api/drizzle/` BEFORE creating new migrations** (0018-0027).

---

## Executive Summary

This report provides a comprehensive gap analysis between the **MISSING_FEATURES_ROADMAP.md** and the actual codebase implementation. 

### Key Findings:

1. **Completed**: 17/27 migrations (63%)
2. **Remaining**: 10/27 migrations (37%)
3. **Schema Coverage**: ~60/120 planned tables exist
4. **Critical Gaps**: Case Management, Templates, Security Hardening, Notifications

---

## ✅ VERIFIED COMPLETIONS (Codebase Evidence)

**Migration Location**: `/apps/api/drizzle/` (0001-0017 complete)  
**Schema Definition**: `/apps/api/src/database/schema/index.ts`  
**Total Migration Files**: 17 (matching roadmap exactly)

### 🎯 100% COMPLETE: Migrations 0001-0017

All migrations listed in the roadmap as "completed" have been **VERIFIED** in the codebase:

#### 0001 - Clean Schema (50,562 bytes)
**Evidence**: `apps/api/drizzle/0001_clean_schema.sql`  
**Schemas Created**: `platform`, `domain`, `monitoring`  
**Key Tables**:
- ✅ **Platform**: `tenants`, `organizations`, `users`, `roles`, `permissions`, `user_roles`
- ✅ **Platform SaaS**: `modules`, `plans`, `subscriptions`, `tenant_entitlements`, `plan_modules`
- ✅ **Platform Config**: `feature_flags`, `i18n_keys`, `i18n_translations`, `themes`, `theme_versions`, `secrets`
- ✅ **Platform Audit**: `audit_events`, `outbox_events`, `notifications`, `notification_templates`, `webhooks`
- ✅ **Domain Core**: `rental_objects`, `rental_object_categories`, `bookings`, `booking_approvals`
- ✅ **Domain Payments**: `payments`, `payment_intents` (basic)
- ✅ **Domain Metadata**: `metadata_definitions`, `rental_object_metadata`, `amenity_groups`, `amenities`
- ✅ **Domain Pricing**: `price_plans`, `pricing_groups`, `rental_object_pricing`, `addons`
- ✅ **Domain Calendar**: `rental_object_time_blocks`, `recurring_series`, `recurring_instances`
- ✅ **Enum Tables**: 28 enum tables (NO PostgreSQL ENUMs, using table pattern)

#### 0002 - Domain Notifications (2,193 bytes)
**Evidence**: `apps/api/drizzle/0002_domain_notifications.sql`  
**Tables**: `domain.user_notifications`, `domain.notification_subscriptions`

#### 0003 - Domain Messaging (2,854 bytes)
**Evidence**: `apps/api/drizzle/0003_domain_messaging.sql`  
**Tables**: `domain.conversations`, `domain.conversation_participants`, `domain.messages`

#### 0004 - Domain Feedback (3,234 bytes)
**Evidence**: `apps/api/drizzle/0004_domain_feedback.sql`  
**Tables**: `domain.ratings`, `domain.favorites`, `domain.likes`, `domain.user_follows`

#### 0005 - Domain Profiles (1,278 bytes)
**Evidence**: `apps/api/drizzle/0005_domain_profiles.sql`  
**Tables**: `domain.user_profiles`, `domain.organization_profiles`

#### 0006 - Domain Support (1,579 bytes)
**Evidence**: `apps/api/drizzle/0006_domain_support.sql`  
**Tables**: `domain.help_articles`, `domain.support_tickets`

#### 0007 - Domain RAG (2,476 bytes)
**Evidence**: `apps/api/drizzle/0007_domain_rag.sql`  
**Tables**: `domain.knowledge_base_docs`, `domain.kb_chunks`, `domain.kb_embeddings`

#### 0008 - Domain SEO (1,025 bytes)
**Evidence**: `apps/api/drizzle/0008_domain_seo.sql`  
**Tables**: `domain.seo_metadata`, `domain.open_graph_tags`

#### 0009 - Domain Geo (1,794 bytes)
**Evidence**: `apps/api/drizzle/0009_domain_geo.sql`  
**Tables**: `domain.geo_areas`, `domain.geo_coordinates`

#### 0010 - RLS Policies (15,610 bytes)
**Evidence**: `apps/api/drizzle/0010_rls_policies.sql`  
**Content**: Row-Level Security policies for tenant isolation across all schemas

#### 0011 - Enterprise Economy (9,954 bytes)
**Evidence**: `apps/api/drizzle/0011_enterprise_economy.sql`  
**Tables**: 
- ✅ `platform.invoices`, `platform.invoice_lines`
- ✅ `platform.ledger_entries` - Accounting audit trail
- ✅ `platform.usage_events`, `platform.usage_summary` - Usage metering
- ✅ `platform.permission_sets`, `platform.role_versions`
- ✅ `platform.user_effective_permissions_cache`
- ✅ `platform.user_sessions` - Server-side session tracking
- ✅ Audit hash chaining (tamper-evident)
- ✅ `monitoring.incidents`

#### 0012 - Platform Marketplace (6,501 bytes)
**Evidence**: `apps/api/drizzle/0012_platform_marketplace.sql`  
**Tables**: Module categories, dependencies, versions, feature flags catalog, runtime config

#### 0013 - Platform Branding (3,235 bytes)
**Evidence**: `apps/api/drizzle/0013_platform_branding.sql`  
**Tables**: Themes, brand assets, design tokens, version control

#### 0014 - Platform i18n Governance (4,005 bytes)
**Evidence**: `apps/api/drizzle/0014_platform_i18n_governance.sql`  
**Tables**: Translation workflow, content localization audit, approval system

#### 0015 - Domain Availability (4,405 bytes)
**Evidence**: `apps/api/drizzle/0015_domain_availability.sql`  
**Tables**: Opening hours, exception days, capacity rules, conflict tracking

#### 0016 - Domain Pricing Engine (5,762 bytes)
**Evidence**: `apps/api/drizzle/0016_domain_pricing_engine.sql`  
**Tables**: Price rules, discounts, taxes, deposits, dynamic pricing

#### 0017 - Domain Payments Complete (6,891 bytes)
**Evidence**: `apps/api/drizzle/0017_domain_payments_complete.sql`  
**Tables**:
- ✅ `domain.payment_intents` - Provider intent tracking with idempotency
- ✅ `domain.payment_transactions` - Authorize, Capture, Void, Partial Capture
- ✅ `domain.refunds` - Full/Partial/Deposit refunds
- ✅ `domain.payouts` - Marketplace revenue split
- ✅ `domain.payout_items` - Payout line items
- ✅ `domain.receipts` - PDF receipt generation tracking

### Schema Architecture Summary

**Total Tables**: ~120 (as projected)  
**Schemas**: 3 (`platform`, `domain`, `monitoring`)  
**Enum Pattern**: 28 enum tables (explicit, DB-enforced via CHECK constraints)  
**Tenant Isolation**: RLS policies applied to all multi-tenant tables  
**Audit Trail**: Hash chaining for tamper-evident audit logs

---

## 🔴 CRITICAL GAPS (Not Found in Codebase)

### 0018 - Domain Case Management (SSA-L Workflow)
**Priority**: 🔴 HIGH  
**Status**: ❌ NOT IMPLEMENTED  
**Impact**: No approval workflow, complaint handling, or SLA tracking

**Missing Tables**:
```sql
- domain.cases
- domain.case_events
- domain.case_assignments
- domain.sla_targets
- domain.decision_templates
```

**Required Features**:
- Booking approval workflow
- Complaint handling
- Appeal process
- SLA tracking
- Norwegian decision templating

**KI Reference**: None found - **NEW DOMAIN**

---

### 0019 - Domain Documents & Templates
**Priority**: 🔴 HIGH  
**Status**: ❌ NOT IMPLEMENTED  
**Impact**: No email templates, PDF generation, or contract management

**Missing Tables**:
```sql
- domain.templates
- domain.template_versions
- domain.generated_documents
```

**Required Features**:
- Email templates (booking confirmation, cancellation, approval)
- PDF templates (invoices, receipts, contracts)
- Template versioning
- Variable substitution (Handlebars/Liquid)
- Multi-language support (nb, en)

**KI Reference**: None found - **NEW DOMAIN**

---

### 0020 - Platform Notifications Delivery
**Priority**: 🟡 MEDIUM  
**Status**: ⚠️ PARTIAL (In-App Only)  
**Evidence**: Migration `20260115_add_notification_system.sql` exists

**Existing Tables** (from migration):
- ✅ `notifications` - In-app notifications
- ✅ `notification_preferences` - User preferences

**Missing Tables**:
```sql
- platform.notification_jobs (Outbox → Provider delivery)
- platform.notification_providers (Vipps SMS, SendGrid config)
- domain.notification_events (Delivery tracking)
```

**Required Features**:
- Queue-based notification processing
- Provider integration (Vipps, SendGrid, Twilio)
- Delivery tracking & retry logic
- Failed delivery handling

**KI Reference**: Xala Core Infrastructure Services - `@xala/scheduler` exists for job processing

---

### 0021 - Domain Search Indexing
**Priority**: 🟡 MEDIUM  
**Status**: ❌ NOT IMPLEMENTED  
**Impact**: Basic filtering only, no full-text search or fuzzy matching

**Missing Tables**:
```sql
- domain.search_index (Denormalized search fields)
- ts_vector columns (PostgreSQL full-text search)
- pg_trgm indexes (Fuzzy matching)
```

**Required Features**:
- Fast rental object search
- Full-text search (PostgreSQL `ts_vector`)
- Fuzzy matching with typo tolerance (`pg_trgm`)
- Geo-spatial search (PostGIS optional)
- Search analytics

**KI Reference**: None found - **NEW DOMAIN**

---

### 0022 - Security Hardening
**Priority**: 🔴 HIGH  
**Status**: ❌ NOT IMPLEMENTED  
**Impact**: No API key management, service accounts, IP restrictions, or MFA

**Missing Tables**:
```sql
- platform.api_keys
- platform.service_accounts
- platform.ip_allowlists
- platform.mfa_enrollment
```

**Required Features**:
- API key management (service-to-service auth)
- Service account RBAC
- IP whitelisting for backoffice/admin
- MFA enrollment tracking
- Security audit trail (extends existing `audit_logs`)

**KI Reference**: Identity and Authentication Standards (covers BankID, not API keys)

---

### 0023 - Compliance Governance
**Priority**: 🔴 HIGH  
**Status**: ⚠️ PARTIAL (GDPR Only)  
**Evidence**: `schema/gdpr-requests.ts` exists

**Existing Tables**:
- ✅ `gdpr_requests` - DSAR workflow

**Missing Tables**:
```sql
- compliance.data_classification
- compliance.retention_enforcement_hooks
- compliance.dpia_records
```

**Required Features**:
- Data classification labels (Public/Internal/Restricted)
- Automated retention enforcement
- DPIA workflow
- Risk assessment tracking
- Compliance reporting

**KI Reference**: Xala Compliance & Accessibility Standard (covers GDPR consent, needs extension)

---

### 0024 - Monitoring & Observability
**Priority**: 🟡 MEDIUM  
**Status**: ⚠️ PARTIAL (Audit Only)  
**Evidence**: `audit_logs`, `alerts`, `incidents` tables exist

**Existing Tables**:
- ✅ `audit_logs` - Basic audit trail
- ✅ `alerts` - Alert definitions
- ✅ `incidents` - Incident tracking

**Missing Tables**:
```sql
- monitoring.request_logs (Endpoint, status, latency)
- monitoring.error_events (RFC7807 error snapshots)
- monitoring.job_runs (Background job tracking)
- monitoring.uptime_checks (Health check results)
```

**Required Features**:
- Request/response logging with latency
- RFC 7807 error tracking
- Background job monitoring
- Uptime monitoring
- SLA reporting dashboard

**KI Reference**: Xala Core Infrastructure Services (`@xala/monitoring` package exists)

---

### 0025 - Domain Moderation
**Priority**: 🟡 MEDIUM  
**Status**: ❌ NOT IMPLEMENTED  
**Impact**: No content moderation, user blocking, or abuse prevention

**Missing Tables**:
```sql
- domain.moderation_flags
- domain.user_blocks
- domain.rate_limit_buckets
- domain.content_reports
```

**Required Features**:
- Content moderation queue
- User blocking/banning
- Rate limiting (per user/IP)
- Abuse prevention
- Moderation workflow with escalation

**KI Reference**: None found - **NEW DOMAIN**

---

### 0026 - Domain SEO Complete
**Priority**: 🟢 LOW  
**Status**: ⚠️ PARTIAL (Basic Only)  
**Evidence**: Migration `20260115_add_notification_system.sql` mentions SEO tables

**Existing**: Basic meta tags support (from 0008)

**Missing Tables**:
```sql
- domain.static_pages (Tenant CMS-lite)
- domain.redirects (URL redirect management)
- domain.sitemaps (Generated sitemap snapshots)
```

**Required Features**:
- Static page management (About, Contact, etc.)
- 301/302 redirect management
- Sitemap.xml generation
- Robots.txt management
- Canonical URL handling

**KI Reference**: Digilist V3 Standard mentions SEO metadata

---

### 0027 - Domain RAG Maturity
**Priority**: 🟢 LOW  
**Status**: ⚠️ PARTIAL (Basic RAG Exists)  
**Evidence**: Roadmap mentions basic RAG in 0007

**Missing Tables**:
```sql
- domain.kb_ingestion_jobs
- domain.kb_permissions
- domain.kb_linked_entities
```

**Required Features**:
- Automated document ingestion
- Permission-based querying
- Entity linking (rental objects, bookings)
- RAG analytics
- Quality metrics

**KI Reference**: Xala SaaS Ecosystem Blueprint mentions RAG module

---

## 📊 Implementation Priority Matrix

### Phase 1 (MVP) - Q1 2026 🔴 URGENT
| Migration | Status | Priority | Blocking Factors |
|-----------|--------|----------|------------------|
| 0018 - Case Management | ❌ | HIGH | Booking approvals blocked |
| 0019 - Documents & Templates | ❌ | HIGH | Confirmation emails blocked |
| 0022 - Security Hardening | ❌ | HIGH | Production security gaps |

**Est. Effort**: 4-6 weeks  
**Deployment**: Must complete before production launch

---

### Phase 2 (Production) - Q2 2026 🟡 IMPORTANT
| Migration | Status | Priority | Blocking Factors |
|-----------|--------|----------|------------------|
| 0020 - Notification Delivery | ⚠️ | MEDIUM | SMS/Email providers needed |
| 0023 - Compliance Governance | ⚠️ | HIGH | DPIA/Retention required for EU |
| 0024 - Monitoring & Observability | ⚠️ | MEDIUM | Production issue diagnosis |

**Est. Effort**: 3-4 weeks  
**Deployment**: Production stability dependent

---

### Phase 3 (Scale) - Q3 2026 🟢 ENHANCEMENT
| Migration | Status | Priority | Blocking Factors |
|-----------|--------|----------|------------------|
| 0021 - Search Indexing | ❌ | MEDIUM | Performance optimization |
| 0025 - Content Moderation | ❌ | MEDIUM | Community features |
| 0026 - SEO Complete | ⚠️ | LOW | Marketing needs |
| 0027 - RAG Maturity | ⚠️ | LOW | AI features |

**Est. Effort**: 4-5 weeks  
**Deployment**: Growth and optimization phase

---

## 🎯 Recommended Next Steps

### Immediate Actions (This Sprint):

1. **Create Migration Files** for Phase 1:
   ```bash
   # Generate migration skeletons
   apps/api/src/database/migrations/
   ├── 20260117_001_case_management.sql
   ├── 20260117_002_document_templates.sql
   └── 20260117_003_security_hardening.sql
   ```

2. **Update Drizzle Schema** (`schema/index.ts`):
   - Add case management tables
   - Add template system tables
   - Add security hardening tables

3. **Create API Services**:
   ```
   apps/api/src/services/
   ├── cases.service.ts
   ├── templates.service.ts
   └── api-keys.service.ts
   ```

4. **Implement RLS Policies**:
   - Tenant isolation for all new tables
   - Case handler scope enforcement
   - Template access control

5. **Seed Data**:
   - Decision templates (Norwegian + English)
   - Default SLA targets
   - Email/PDF template defaults

### Week 2-3:
- Integration tests for case workflow
- Template rendering engine (Handlebars)
- API key rotation workflow

### Week 4:
- Frontend UI for case management
- Template editor in Backoffice
- Security dashboard

---

## 📋 Technical Debt Items

1. **Notification System**: Migration exists but missing delivery layer
2. **Monitoring**: Basic tables exist, needs request logging and error tracking
3. **Compliance**: GDPR requests exist, needs classification and retention
4. **SEO**: Meta tags exist, needs CMS-lite and redirects

---

## 🔗 Cross-References

### Related Knowledge Items:
- **Identity and Authentication Standards**: Session management foundation
- **Xala Core Infrastructure Services**: Scheduler, monitoring packages
- **Xala Compliance & Accessibility Standard**: GDPR baseline
- **Digilist V3 Standard**: Domain model reference
- **Xala Platform Verification Protocol**: Testing standards

### Related Files:
- `/docs/architecture/MISSING_FEATURES_ROADMAP.md` - Master roadmap
- `/apps/api/src/database/schema/index.ts` - Current schema
- `/apps/api/src/database/migrations/` - Migration history
- `/tests/unit/demo-readiness/` - Test coverage baseline

---

## 📈 Metrics

- **Total Tables Planned**: 120
- **Tables Implemented**: ~60 (50%)
- **Critical Gap Count**: 3 (Case Management, Templates, Security)
- **Partial Implementations**: 4 (Notifications, Compliance, Monitoring, SEO)
- **Est. Time to MVP**: 4-6 weeks (Phase 1 only)
- **Est. Time to Production**: 8-10 weeks (Phase 1 + 2)

---

## ✅ Quality Gates

Before marking any migration as "complete":

1. ✅ Migration SQL file exists and runs successfully
2. ✅ Drizzle schema types generated
3. ✅ API service implements CRUD + business logic
4. ✅ RLS policies enforce tenant isolation
5. ✅ Seed data provides realistic demo
6. ✅ Integration tests achieve 80%+ coverage
7. ✅ OpenAPI documentation generated
8. ✅ Frontend UI implemented (where applicable)

---

## 🏗️ FULL-STACK GAPS (API + SDK + UI)

### Gap Category Breakdown

Based on the DTO Expansion Strategy, here are gaps across **all architectural layers**:

---

### 🔴 Layer 1: API Endpoints (Backend)

#### Missing Core Resource Endpoints

**Amenities Module**:
```typescript
❌ GET    /api/amenities
❌ GET    /api/amenities/:id
❌ POST   /api/amenities                    // Admin only
❌ PUT    /api/amenities/:id                // Admin only
❌ DELETE /api/amenities/:id                // Admin only
❌ GET    /api/rental-objects/:id/amenities
❌ PUT    /api/rental-objects/:id/amenities // Bulk assign
❌ GET    /api/amenity-groups
```

**Add-ons Module**:
```typescript
❌ GET    /api/addons
❌ GET    /api/addons/:id
❌ POST   /api/addons                       // Admin only
❌ PUT    /api/addons/:id
❌ DELETE /api/addons/:id
❌ GET    /api/rental-objects/:id/addons
❌ PUT    /api/rental-objects/:id/addons
```

**Pricing Module**:
```typescript
❌ GET    /api/pricing-groups
❌ GET    /api/pricing-groups/:id
❌ POST   /api/pricing-groups
❌ GET    /api/pricing-groups/:id/members
❌ POST   /api/pricing-groups/:id/members
❌ GET    /api/rental-objects/:id/pricing
❌ PUT    /api/rental-objects/:id/pricing
❌ POST   /api/bookings/quote               // Calculate pricing
```

**Availability Module**:
```typescript
❌ GET    /api/rental-objects/:id/availability/calendar
❌ POST   /api/rental-objects/:id/availability/check
❌ GET    /api/rental-objects/:id/opening-hours
❌ PUT    /api/rental-objects/:id/opening-hours
❌ GET    /api/rental-objects/:id/exceptions
❌ POST   /api/rental-objects/:id/exceptions
```

**Metadata Module**:
```typescript
❌ GET    /api/metadata-definitions
❌ POST   /api/metadata-definitions          // Admin only
❌ GET    /api/rental-objects/:id/metadata
❌ PUT    /api/rental-objects/:id/metadata
```

**Conversations Module**:
```typescript
❌ GET    /api/conversations
❌ GET    /api/conversations/:id
❌ POST   /api/conversations
❌ PUT    /api/conversations/:id/archive
❌ GET    /api/conversations/:id/messages
❌ POST   /api/conversations/:id/messages
❌ PUT    /api/messages/:id/read
```

**Notifications Module**:
```typescript
❌ GET    /api/notifications
❌ PUT    /api/notifications/:id/read
❌ PUT    /api/notifications/mark-all-read
❌ GET    /api/notifications/preferences
❌ PUT    /api/notifications/preferences
```

**Support Module**:
```typescript
❌ GET    /api/support/help-articles
❌ GET    /api/support/help-articles/:id
❌ POST   /api/support/help-articles         // Admin only
❌ GET    /api/support/tickets
❌ GET    /api/support/tickets/:id
❌ POST   /api/support/tickets
❌ POST   /api/support/tickets/:id/messages
```

**SEO Module** (Admin only):
```typescript
❌ GET    /api/rental-objects/:id/seo
❌ PUT    /api/rental-objects/:id/seo
❌ GET    /api/seo/static-pages
❌ POST   /api/seo/static-pages
❌ GET    /api/seo/redirects
❌ POST   /api/seo/redirects
```

**Geo Module**:
```typescript
❌ GET    /api/geo-areas
❌ GET    /api/geo-areas/:id
❌ GET    /api/geo-areas/:id/rental-objects
```

**Knowledge Base (RAG) Module**:
```typescript
❌ GET    /api/kb/search?q=query
❌ POST   /api/kb/ask                        // AI-powered Q&A
❌ GET    /api/kb/documents
❌ POST   /api/kb/documents                  // Admin only
```

#### Missing Projection Endpoints (Read Models)

**Unified Details Projection**:
```typescript
❌ GET /api/rental-objects/:id/details?expand=pricing,amenities,addons,metadata,availability,seo
```

**Dashboard Projections**:
```typescript
❌ GET /api/users/me/dashboard
❌ GET /api/organizations/:id/dashboard
```

**Search Projection**:
```typescript
❌ GET /api/rental-objects/search?category=LOKALER&amenities=wifi,parking&expand=pricing
```

**Availability Calendar Projection**:
```typescript
❌ GET /api/rental-objects/:id/availability/calendar?month=2026-01
```

---

### 🟡 Layer 2: DTOs / Contracts (OpenAPI)

#### Missing Response DTOs

**Core Read Models**:
```typescript
❌ RentalObjectDetailsDTO         // Composite projection
❌ RentalObjectSearchCardDTO       // Optimized for lists
❌ AvailabilityCalendarDTO         // Calendar projection
❌ AvailabilityDayDTO              // Day-level detail
❌ BookingQuoteDTO                 // Pricing calculation
❌ UserDashboardDTO                // User dashboard
❌ OrgDashboardDTO                 // Org dashboard
❌ SearchResultsDTO                // Search results
❌ SearchFacetsDTO                 // Filter facets
```

**Resource DTOs**:
```typescript
❌ AmenityDTO
❌ AmenityGroupDTO
❌ AddOnDTO
❌ AddOnLineItemDTO                // In quotes
❌ PricingGroupDTO
❌ PriceRuleDTO
❌ DiscountLineItemDTO             // In quotes
❌ TaxLineItemDTO                  // In quotes
❌ OpeningHoursDTO
❌ ExceptionDayDTO
❌ MetadataDefinitionDTO
❌ MetadataValueDTO
❌ ConversationDTO
❌ ConversationParticipantDTO
❌ MessageDTO
❌ MessagePreviewDTO
❌ NotificationDTO
❌ NotificationPreferenceDTO
❌ SupportTicketDTO
❌ HelpArticleDTO
❌ SeoMetadataDTO
❌ OpenGraphTagDTO
❌ GeoAreaDTO
❌ GeoCoordinatesDTO
❌ KbDocumentDTO
❌ KbSearchResultDTO
```

**Supporting DTOs**:
```typescript
❌ MoneyDTO                        // Norwegian formatting
❌ DistanceDTO                     // Geo distance
❌ PriceBreakdownDTO               // Quote breakdown
❌ BookingSlotDTO                  // Calendar slot
❌ ActivityDTO                     // Activity feed
❌ UserBaseDTO                     // Minimal user info
```

---

### 🟠 Layer 3: Client SDK Services

#### Missing Services

```typescript
// packages/client-sdk/src/services/

❌ amenities.service.ts
   - list()
   - get(id)
   - create(data)            // Admin
   - update(id, data)        // Admin
   - delete(id)              // Admin
   - forRentalObject(rentalObjectId)

❌ addons.service.ts
   - list()
   - get(id)
   - create(data)
   - update(id, data)
   - delete(id)
   - forRentalObject(rentalObjectId)

❌ pricing.service.ts
   - listGroups()
   - getGroup(id)
   - createGroup(data)
   - getMembers(groupId)
   - addMember(groupId, userId)
   - calculateQuote(bookingInput)
   - getRentalObjectPricing(rentalObjectId)
   - updateRentalObjectPricing(rentalObjectId, data)

❌ availability.service.ts
   - getCalendar(rentalObjectId, params)
   - checkAvailability(rentalObjectId, timeRange)
   - getOpeningHours(rentalObjectId)
   - updateOpeningHours(rentalObjectId, data)
   - getExceptions(rentalObjectId)
   - addException(rentalObjectId, data)

❌ metadata.service.ts
   - listDefinitions()
   - createDefinition(data)   // Admin
   - getRentalObjectMetadata(rentalObjectId)
   - updateRentalObjectMetadata(rentalObjectId, data)

❌ conversations.service.ts
   - list()
   - get(id)
   - create(data)
   - archive(id)
   - getMessages(conversationId)
   - sendMessage(conversationId, data)
   - markAsRead(messageId)

❌ notifications.service.ts
   - list()
   - markAsRead(id)
   - markAllAsRead()
   - getPreferences()
   - updatePreferences(data)

❌ support.service.ts
   - listArticles()
   - getArticle(id)
   - searchArticles(query)
   - listTickets()
   - getTicket(id)
   - createTicket(data)
   - replyToTicket(ticketId, message)

❌ seo.service.ts
   - getSeoMetadata(rentalObjectId)
   - updateSeoMetadata(rentalObjectId, data)
   - listStaticPages()
   - createStaticPage(data)
   - listRedirects()
   - createRedirect(data)

❌ geo.service.ts
   - listAreas()
   - getArea(id)
   - getAreaRentalObjects(areaId)

❌ kb.service.ts
   - search(query)
   - ask(question)          // AI-powered
   - listDocuments()
   - uploadDocument(file)

❌ rentalObjectDetails.service.ts
   - get(id, { expand: string[] })

❌ dashboard.service.ts
   - getUserDashboard()
   - getOrgDashboard(orgId)
```

---

### 🔵 Layer 4: React Query Hooks

#### Missing Hooks

```typescript
// packages/client-sdk/src/hooks/

// Rental Object Details
❌ useRentalObjectDetails(id, expand)

// Availability
❌ useAvailabilityCalendar(rentalObjectId, params)
❌ useAvailabilityCheck(rentalObjectId, timeRange)
❌ useOpeningHours(rentalObjectId)
❌ useExceptions(rentalObjectId)

// Pricing
❌ useBookingQuote(bookingInput)
❌ usePricingGroups()
❌ usePricingGroup(id)
❌ useRentalObjectPricing(rentalObjectId)

// Amenities
❌ useAmenities()
❌ useAmenity(id)
❌ useRentalObjectAmenities(rentalObjectId)

// Add-ons
❌ useAddons()
❌ useAddon(id)
❌ useRentalObjectAddons(rentalObjectId)

// Metadata
❌ useMetadataDefinitions()
❌ useRentalObjectMetadata(rentalObjectId)

// Conversations
❌ useConversations()
❌ useConversation(id)
❌ useConversationMessages(conversationId)

// Notifications
❌ useNotifications()
❌ useNotificationPreferences()

// Support
❌ useHelpArticles()
❌ useHelpArticle(id)
❌ useSupportTickets()
❌ useSupportTicket(id)

// Dashboards
❌ useUserDashboard()
❌ useOrgDashboard(orgId)

// Search
❌ useRentalObjectSearch(params)

// Mutations
❌ useCreateAmenity()
❌ useUpdateAmenity()
❌ useDeleteAmenity()
❌ useCreateAddon()
❌ useUpdateAddon()
❌ useDeleteAddon()
❌ useUpdatePricing()
❌ useUpdateOpeningHours()
❌ useCreateException()
❌ useUpdateMetadata()
❌ useCreateConversation()
❌ useSendMessage()
❌ useMarkNotificationAsRead()
❌ useMarkAllNotificationsAsRead()
❌ useUpdateNotificationPreferences()
❌ useCreateSupportTicket()
❌ useReplyToTicket()
❌ useUpdateSeo()
❌ useCreateStaticPage()
❌ useCreateRedirect()
```

---

### 🟣 Layer 5: UI Components (Frontend)

#### Missing Page Components

**Web App**:
```typescript
❌ /rental-objects/:id/details      // Full details with all expansions
❌ /rental-objects/:id/availability // Calendar view
❌ /rental-objects/:id/booking      // Booking flow with quote
❌ /search                          // Advanced search with facets
❌ /support                         // Help articles
❌ /support/tickets                 // User tickets
❌ /support/tickets/:id             // Ticket detail
```

**Minside (User Portal)**:
```typescript
❌ /dashboard                       // User dashboard projection
❌ /bookings                        // My bookings
❌ /bookings/:id                    // Booking details
❌ /conversations                   // Messages inbox
❌ /conversations/:id               // Conversation thread
❌ /notifications                   // Notification center
❌ /profile/preferences             // Notification preferences
❌ /favorites                       // Saved rental objects
```

**Backoffice (Admin Portal)**:
```typescript
❌ /dashboard                       // Org dashboard projection
❌ /rental-objects/:id/details      // Full admin view
❌ /rental-objects/:id/pricing      // Pricing management
❌ /rental-objects/:id/amenities    // Amenity assignment
❌ /rental-objects/:id/addons       // Add-on assignment
❌ /rental-objects/:id/metadata     // Metadata editor
❌ /rental-objects/:id/availability // Availability management
❌ /rental-objects/:id/seo          // SEO editor
❌ /pricing-groups                  // Pricing groups management
❌ /amenities                       // Amenities catalog
❌ /addons                          // Add-ons catalog
❌ /metadata-definitions            // Metadata definitions
❌ /bookings/approvals              // Approval queue
❌ /support/tickets                 // Support queue
❌ /conversations                   // Admin inbox
```

#### Missing UI Components

**Rental Object Components**:
```typescript
❌ <RentalObjectDetailsPanel />     // Tabbed details view
❌ <AvailabilityCalendar />         // Calendar with bookings/blocks
❌ <BookingQuoteCard />             // Price breakdown
❌ <AmenityList />                  // Grouped amenities display
❌ <AddOnSelector />                // Add-on checkbox list
❌ <PricingGroupBadge />            // User pricing tier
❌ <MetadataDisplay />              // Key-value metadata
❌ <SeoPreview />                   // Google preview card
```

**Booking Components**:
```typescript
❌ <BookingWizard />                // Multi-step booking flow
❌ <DateTimePicker />               // Time slot selection
❌ <PriceBreakdown />               // Itemized quote
❌ <AddOnCheckbox />                // Individual add-on
❌ <TermsAndConditions />           // T&C acceptance
❌ <PaymentMethodSelector />        // Payment options
```

**Communication Components**:
```typescript
❌ <ConversationList />             // Inbox list
❌ <ConversationThread />           // Message thread
❌ <MessageComposer />              // Rich text editor
❌ <NotificationBell />             // Notification icon + dropdown
❌ <NotificationList />             // Scrollable notifications
❌ <NotificationItem />             // Single notification card
```

**Dashboard Components**:
```typescript
❌ <UserDashboard />                // User overview
❌ <OrgDashboard />                 // Org overview
❌ <StatsCard />                    // Metric card
❌ <RecentActivityFeed />           // Activity timeline
❌ <UpcomingBookingsList />         // Booking list
❌ <RevenueChart />                 // Revenue visualization
❌ <OccupancyChart />               // Occupancy rate
```

**Search Components**:
```typescript
❌ <SearchBar />                    // Advanced search input
❌ <SearchFilters />                // Faceted search sidebar
❌ <SearchResults />                // Grid/List view
❌ <RentalObjectCard />             // Search result card
❌ <FilterChips />                  // Active filter chips
❌ <SortDropdown />                 // Sort options
```

**Admin Components**:
```typescript
❌ <AmenityCatalog />               // CRUD table
❌ <AmenityForm />                  // Create/Edit form
❌ <AddOnCatalog />                 // CRUD table
❌ <AddOnForm />                    // Create/Edit form
❌ <PricingGroupManager />          // Pricing groups
❌ <PricingRuleEditor />            // Price rule builder
❌ <MetadataDefinitionEditor />     // Metadata schema
❌ <OpeningHoursEditor />           // Weekly schedule
❌ <ExceptionDayForm />             // Exception date picker
❌ <SeoMetadataForm />              // SEO fields
❌ <StaticPageEditor />             // CMS editor
❌ <RedirectManager />              // 301/302 rules
```

**Support Components**:
```typescript
❌ <HelpArticleList />              // Searchable articles
❌ <HelpArticleView />              // Article display
❌ <SupportTicketForm />            // Create ticket
❌ <SupportTicketList />            // Ticket queue
❌ <TicketThread />                 // Ticket conversation
```

---

## 📊 Gap Summary by Layer

| Layer | Total Items | Missing | Percentage |
|-------|-------------|---------|------------|
| **Database** (Tables) | 120 | 60 | 50% ❌ |
| **API Endpoints** | ~150 | ~90 | 60% ❌ |
| **DTOs/Contracts** | ~80 | ~55 | 69% ❌ |
| **SDK Services** | ~20 | ~15 | 75% ❌ |
| **React Hooks** | ~50 | ~45 | 90% ❌ |
| **UI Components** | ~60 | ~55 | 92% ❌ |

**Overall Completion**: ~30% ✅

---

## 🎯 Implementation Roadmap (All Layers)

### Week 1-2: Database + API Foundation
1. ✅ Consolidate migrations to `apps/api/drizzle/`
2. Create migrations 0018-0021
3. Implement API services (amenities, addons, pricing, etc.)
4. Generate OpenAPI schemas for all new endpoints
5. RLS policies for all new tables

### Week 3-4: DTOs + SDK Services
1. Generate TypeScript types from OpenAPI
2. Implement client SDK services (15 services)
3. Implement React Query hooks (45 hooks)
4. Write integration tests for SDK

### Week 5-6: UI Components (Backoffice First)
1. Implement admin catalog pages (amenities, addons, pricing)
2. Implement metadata editor
3. Implement pricing group manager
4. Test in Backoffice app

### Week 7-8: UI Components (Web + Minside)
1. Implement rental object details panel
2. Implement availability calendar
3. Implement booking wizard with quote
4. Implement conversation/notification UI

### Week 9-10: Dashboard Projections + Search
1. Implement user dashboard
2. Implement org dashboard
3. Implement advanced search with facets
4. Performance optimization

---

## 🚀 Prioritized Implementation Order

### 🔴 P0 (Critical Path - Blocking Demo)
1. **Amenities Module** (API + SDK + UI)
2. **Add-ons Module** (API + SDK + UI)
3. **Pricing Module** (API + SDK + Quote UI)
4. **Availability Calendar** (API + SDK + UI)
5. **Booking Quote** (API + SDK + UI)

### 🟡 P1 (High Value - Demo Enhancement)
6. **Rental Object Details Projection** (Unified API)
7. **Notifications** (API + SDK + UI)
8. **Conversations** (API + SDK + UI)
9. **User Dashboard** (Projection + UI)
10. **Org Dashboard** (Projection + UI)

### 🟢 P2 (Growth - Post-Demo)
11. **Metadata System** (Admin UI)
12. **Support Tickets** (Full flow)
13. **Help Articles** (CMS-lite)
14. **Search Facets** (Advanced filtering)
15. **SEO Module** (Admin only)

---



**End of Report**
