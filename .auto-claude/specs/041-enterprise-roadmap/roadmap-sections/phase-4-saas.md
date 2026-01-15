# Phase 4: SaaS & Enterprise Features

**Phase Type:** Enterprise Features / SHOULD-HAVE
**Priority Level:** MEDIUM-HIGH
**Status:** NOT STARTED
**Estimated Duration:** 8-10 weeks
**Last Updated:** 2026-01-15

---

## Overview

Phase 4 delivers SaaS and enterprise capabilities that differentiate the Digilist platform for multi-municipality deployments. This phase focuses on feature flags, licensing models, white-label customization, and multi-tenant enterprise features that enable scalable commercial operations.

**Key Focus Areas:**
- Feature flag management system
- Licensing and subscription tiers
- White-label/theming capabilities
- Multi-municipality management
- Enterprise reporting and analytics
- API rate limiting and quotas

**Dependencies:**
- Phase 1 Core Platform Stability (Tenant Isolation)
- Phase 2 Functional Completion (Payment Integration)
- Phase 3 Role-Specific UX (Super Admin UI)

**Success Criteria:**
- Feature flags controlling tier access
- Multiple subscription tiers functional
- White-label theming operational
- Cross-tenant analytics for platform
- API usage metering in place

---

## 4.1 Feature Flags

### 4.1.1 Feature Flag Infrastructure

- ✅ **Description**: Core feature flag system for controlling feature access across tenants
- 🔍 **Verification**:
  - Feature flag service exists in SDK
  - API endpoint for flag evaluation
  - Flags stored per-tenant with defaults
  - Real-time flag updates via WebSocket
  - SDK `FeatureFlagService` methods
- 📦 **Affected**: api, client-sdk, all apps
- 👤 **Roles**: Tenant Admin (view), Super Admin (manage)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot gate features by subscription tier
- ➡️ **Action**: Implement feature flag infrastructure with tenant overrides

**Feature Flag Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│  Feature Flag Evaluation                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Request Context    Flag Definition    Evaluation Result    │
│  ───────────────    ───────────────    ─────────────────    │
│                                                              │
│  tenantId       ──▶ default: true   ──▶ enabled: true/false │
│  userId         ──▶ tenantOverride  ──▶ reason: "tier_limit"│
│  subscriptionTier──▶ userOverride   ──▶                     │
│  environment    ──▶ percentage      ──▶                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.1.2 Feature Flag SDK Integration

- ✅ **Description**: SDK hooks for evaluating feature flags in frontend applications
- 🔍 **Verification**:
  - `useFeatureFlag(flagKey)` hook exists
  - `useFeatureFlags()` for batch evaluation
  - Flag changes trigger re-render
  - Fallback values supported
  - TypeScript types for flag definitions
- 📦 **Affected**: client-sdk, all apps
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Frontend cannot check feature availability
- ➡️ **Action**: Implement `useFeatureFlag` hook with realtime updates

### 4.1.3 Feature Flag Admin UI

- ✅ **Description**: Super Admin interface for managing feature flag definitions
- 🔍 **Verification**:
  - `/admin/feature-flags` route accessible
  - Create/edit flag definitions
  - Set default values
  - Configure tier-based rules
  - View flag usage analytics
- 📦 **Affected**: apps/backoffice (SuperAdminFeatureFlagsPage)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot manage feature rollouts
- ➡️ **Action**: Create feature flag management UI

### 4.1.4 Tenant Flag Overrides

- ✅ **Description**: Allow per-tenant overrides of feature flag defaults
- 🔍 **Verification**:
  - Tenant settings page shows flag overrides
  - Super Admin can override for specific tenants
  - Override history logged to audit
  - Expiration dates for temporary overrides
  - SDK respects tenant overrides
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot customize features per municipality
- ➡️ **Action**: Add tenant override system to feature flags

### 4.1.5 Percentage Rollouts

- ✅ **Description**: Gradual feature rollout by percentage of users/tenants
- 🔍 **Verification**:
  - Percentage field on flag definition
  - Consistent bucketing (same user always gets same result)
  - Gradual increase capability
  - Monitoring of rollout success
  - Rollback mechanism
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: No safe gradual rollout capability
- ➡️ **Action**: Implement percentage-based feature rollout

---

## 4.2 Licensing & Subscription

### 4.2.1 Subscription Tier Definitions

- ✅ **Description**: Define subscription tiers with feature entitlements
- 🔍 **Verification**:
  - Tier schema in database
  - Tiers: Free, Basic, Professional, Enterprise
  - Feature matrix per tier
  - Usage limits per tier
  - Tier comparison API
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Super Admin (define), Tenant Admin (view)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot differentiate pricing/features
- ➡️ **Action**: Define subscription tier schema and feature matrix

**Proposed Tier Matrix:**
| Feature | Free | Basic | Professional | Enterprise |
|---------|------|-------|--------------|------------|
| Listings limit | 5 | 25 | 100 | Unlimited |
| Users limit | 3 | 10 | 50 | Unlimited |
| Storage (GB) | 1 | 10 | 50 | Unlimited |
| Custom branding | No | Basic | Full | White-label |
| API access | No | Read | Read/Write | Full |
| Support | Community | Email | Priority | Dedicated |
| Integrations | None | Basic | Standard | Custom |
| Analytics | Basic | Standard | Advanced | Custom |
| Seasonal leases | No | No | Yes | Yes |
| Multi-location | No | No | Yes | Yes |

### 4.2.2 Subscription Management API

- ✅ **Description**: API endpoints for subscription management
- 🔍 **Verification**:
  - `GET /api/subscriptions/current` returns active subscription
  - `POST /api/subscriptions/upgrade` initiates upgrade
  - `POST /api/subscriptions/downgrade` initiates downgrade
  - Proration calculation for mid-cycle changes
  - SDK `SubscriptionService` methods
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot manage subscription changes
- ➡️ **Action**: Implement subscription management API

### 4.2.3 Usage Metering

- ✅ **Description**: Track usage metrics against subscription limits
- 🔍 **Verification**:
  - Listings count tracked per tenant
  - Storage usage calculated
  - API call counts metered
  - User count tracked
  - Usage dashboard in backoffice
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Tenant Admin, Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot enforce tier limits
- ➡️ **Action**: Implement usage metering system

### 4.2.4 Usage Limit Enforcement

- ✅ **Description**: Enforce subscription limits with graceful degradation
- 🔍 **Verification**:
  - Soft limits trigger warnings
  - Hard limits block operations
  - Upgrade prompts shown when approaching limits
  - Grace period for overage
  - Email notifications for limit warnings
- 📦 **Affected**: api, all apps
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: No limit enforcement, unlimited usage
- ➡️ **Action**: Implement limit enforcement middleware

### 4.2.5 Trial Management

- ✅ **Description**: Free trial period management for new tenants
- 🔍 **Verification**:
  - Trial duration configurable (default 14 days)
  - Trial includes Professional tier features
  - Trial expiration warnings
  - Conversion to paid tracking
  - Trial extension capability
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Super Admin (configure), Tenant Admin (view)
- 📊 **Status**: MISSING
- 🚨 **Risk**: No trial conversion funnel
- ➡️ **Action**: Implement trial management system

### 4.2.6 Invoice Generation (Platform)

- ✅ **Description**: Generate platform subscription invoices
- 🔍 **Verification**:
  - Monthly invoice generation
  - Usage-based billing items
  - Invoice PDF download
  - Payment status tracking
  - Integration with accounting
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Super Admin, Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot bill tenants for platform usage
- ➡️ **Action**: Implement platform invoicing system

---

## 4.3 White-Label & Theming

### 4.3.1 Theme System Configuration

- ✅ **Description**: Configurable theming system for tenant branding
- 🔍 **Verification**:
  - Theme configuration stored per tenant
  - Primary/secondary color customization
  - Logo URL configuration
  - Font selection (within allowed set)
  - Theme preview before save
- 📦 **Affected**: api, @xala/ds, all apps
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL (basic theme support exists)
- 🚨 **Risk**: Cannot fully brand for municipalities
- ➡️ **Action**: Extend theme configuration options

**Current Theme Support:**
| Feature | Status | Notes |
|---------|--------|-------|
| Theme selection | DONE | digdir, altinn, uutilsynet, portal |
| Color scheme | DONE | Light/dark/auto |
| Primary color | PARTIAL | Limited to theme palettes |
| Custom logo | DONE | Via tenant settings |
| Font selection | MISSING | Fixed to theme default |
| Custom CSS | MISSING | Not supported |

### 4.3.2 Tenant Logo Management

- ✅ **Description**: Upload and manage tenant logo for branded experience
- 🔍 **Verification**:
  - Logo upload in tenant settings
  - Multiple sizes generated (favicon, header, full)
  - Logo displayed in public apps
  - Fallback to default logo
  - SDK `TenantService.uploadLogo()` method
- 📦 **Affected**: api, apps/backoffice, apps/web
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Branding incomplete
- ➡️ **Action**: Complete logo management with size variants

### 4.3.3 Custom Domain Support

- ✅ **Description**: Allow tenants to use custom domains for public site
- 🔍 **Verification**:
  - Domain configuration in tenant settings
  - SSL certificate provisioning (Let's Encrypt)
  - DNS verification workflow
  - Domain-to-tenant routing
  - Wildcard subdomain support
- 📦 **Affected**: api, infrastructure
- 👤 **Roles**: Tenant Admin, Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot offer white-label URLs
- ➡️ **Action**: Implement custom domain routing

### 4.3.4 Email Branding

- ✅ **Description**: Customize email templates with tenant branding
- 🔍 **Verification**:
  - Email templates include tenant logo
  - From address uses tenant domain
  - Footer text customizable
  - Template preview
  - Brand colors in email design
- 📦 **Affected**: api
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Emails not branded to municipality
- ➡️ **Action**: Add branding variables to email templates

### 4.3.5 Public Site Customization

- ✅ **Description**: Customize public-facing elements per tenant
- 🔍 **Verification**:
  - Custom welcome text
  - Featured categories selection
  - Hero image customization
  - Footer links configuration
  - Privacy policy URL customization
- 📦 **Affected**: apps/web, api
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: All tenants look identical
- ➡️ **Action**: Implement public site customization settings

### 4.3.6 White-Label Mobile App

- ✅ **Description**: Configurable mobile app experience per tenant
- 🔍 **Verification**:
  - App icon customization
  - Splash screen branding
  - In-app color theme
  - Push notification customization
  - App store listing variations
- 📦 **Affected**: apps/minside (PWA)
- 👤 **Roles**: Super Admin (configure)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Mobile experience not branded
- ➡️ **Action**: Implement PWA branding configuration

---

## 4.4 Multi-Municipality Management

### 4.4.1 Tenant Provisioning Automation

- ✅ **Description**: Automated tenant creation and setup
- 🔍 **Verification**:
  - Tenant creation API endpoint
  - Default configuration templates
  - Database schema provisioning
  - Initial admin user creation
  - Welcome email automation
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Manual tenant setup is error-prone
- ➡️ **Action**: Implement tenant provisioning automation

### 4.4.2 Tenant Templates

- ✅ **Description**: Pre-configured templates for quick tenant setup
- 🔍 **Verification**:
  - Template schema with default settings
  - Template selection during provisioning
  - Categories, rules pre-populated
  - Sample listings option
  - Template versioning
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Inconsistent tenant setups
- ➡️ **Action**: Create tenant template system

### 4.4.3 Cross-Tenant Data Sharing

- ✅ **Description**: Controlled sharing of data between tenants (listings, organizations)
- 🔍 **Verification**:
  - Sharing configuration per tenant
  - Shared listing visibility rules
  - Cross-tenant booking (with approval)
  - Shared category definitions
  - Data isolation maintained
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin, Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot support regional cooperation
- ➡️ **Action**: Design cross-tenant sharing model

### 4.4.4 Multi-Tenant Analytics

- ✅ **Description**: Aggregated analytics across all tenants for platform insights
- 🔍 **Verification**:
  - Platform-wide KPIs
  - Tenant comparison dashboards
  - Growth metrics tracking
  - Revenue analytics
  - Usage trend analysis
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: No visibility into platform health
- ➡️ **Action**: Implement platform analytics service

### 4.4.5 Tenant Health Monitoring

- ✅ **Description**: Monitor tenant activity and health indicators
- 🔍 **Verification**:
  - Active user metrics
  - Booking volume tracking
  - Error rate per tenant
  - Performance metrics
  - Churn risk indicators
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot proactively address tenant issues
- ➡️ **Action**: Implement tenant health monitoring

### 4.4.6 Tenant Data Migration

- ✅ **Description**: Tools for migrating data between tenants or from external systems
- 🔍 **Verification**:
  - Import/export formats (CSV, JSON)
  - Listing migration tool
  - User migration with invite
  - Booking history migration
  - Validation and error reporting
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot onboard tenants with existing data
- ➡️ **Action**: Implement data migration tools

---

## 4.5 Enterprise Reporting

### 4.5.1 Custom Report Builder

- ✅ **Description**: Build custom reports with flexible data selection
- 🔍 **Verification**:
  - Report builder UI
  - Data source selection
  - Filter configuration
  - Column/metric selection
  - Save report templates
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot create municipality-specific reports
- ➡️ **Action**: Implement report builder

### 4.5.2 Scheduled Reports

- ✅ **Description**: Automated report generation and delivery on schedule
- 🔍 **Verification**:
  - Cron-based scheduling
  - Email delivery
  - PDF/Excel export
  - Report history
  - SDK `ReportsService.schedule()` method
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Manual reporting effort
- ➡️ **Action**: Implement report scheduling

### 4.5.3 KPI Dashboards

- ✅ **Description**: Configurable KPI dashboards for different stakeholders
- 🔍 **Verification**:
  - Dashboard widget library
  - Drag-and-drop layout
  - Real-time data refresh
  - Multiple dashboard views
  - Dashboard sharing
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: PARTIAL (basic dashboard exists)
- 🚨 **Risk**: Limited dashboard customization
- ➡️ **Action**: Add configurable KPI widgets

### 4.5.4 Data Export APIs

- ✅ **Description**: Programmatic access to reporting data
- 🔍 **Verification**:
  - `/api/reports/bookings` with filters
  - `/api/reports/revenue` endpoint
  - `/api/reports/utilization` endpoint
  - Rate limiting per tier
  - SDK `ReportsService` coverage
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Admin, Tenant Admin (tier-dependent)
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Enterprises cannot integrate data
- ➡️ **Action**: Expand reporting API coverage

### 4.5.5 Compliance Reporting

- ✅ **Description**: Pre-built reports for regulatory compliance
- 🔍 **Verification**:
  - GDPR access report
  - Audit log export
  - Financial reconciliation report
  - Usage statistics report
  - Data retention report
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Manual compliance effort
- ➡️ **Action**: Implement compliance report templates

---

## 4.6 API Management

### 4.6.1 API Key Management

- ✅ **Description**: Create and manage API keys for external integrations
- 🔍 **Verification**:
  - `POST /api/api-keys` creates key
  - Key rotation capability
  - Scope restrictions
  - Usage tracking
  - Revocation with audit
- 📦 **Affected**: api
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot enable third-party integrations
- ➡️ **Action**: Implement API key management

### 4.6.2 Rate Limiting

- ✅ **Description**: API rate limiting by tier and endpoint
- 🔍 **Verification**:
  - Rate limits enforced per API key
  - Tier-based limits (Free: 1000/day, Enterprise: unlimited)
  - 429 responses with retry-after header
  - Rate limit headers in responses
  - Dashboard showing usage
- 📦 **Affected**: api
- 👤 **Roles**: All API consumers
- 📊 **Status**: MISSING
- 🚨 **Risk**: No protection against API abuse
- ➡️ **Action**: Implement rate limiting middleware

### 4.6.3 API Documentation Portal

- ✅ **Description**: Interactive API documentation for developers
- 🔍 **Verification**:
  - OpenAPI/Swagger documentation
  - Interactive "try it" functionality
  - Code samples in multiple languages
  - Authentication guide
  - Rate limit documentation
- 📦 **Affected**: api
- 👤 **Roles**: Developers (external)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Poor developer experience
- ➡️ **Action**: Generate and host API documentation

### 4.6.4 Webhook Management

- ✅ **Description**: Configure webhooks for event notifications
- 🔍 **Verification**:
  - Webhook URL configuration
  - Event type selection
  - Signature verification
  - Retry logic
  - Delivery logs
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot push events to external systems
- ➡️ **Action**: Implement webhook delivery system

### 4.6.5 API Usage Analytics

- ✅ **Description**: Detailed analytics of API usage by endpoint and consumer
- 🔍 **Verification**:
  - Endpoint usage counts
  - Response time percentiles
  - Error rate by endpoint
  - Consumer usage breakdown
  - Export to analytics tools
- 📦 **Affected**: api, apps/backoffice
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: No visibility into API performance
- ➡️ **Action**: Implement API analytics collection

---

## Phase 4 Summary

### Status Matrix

| Category | Items | DONE | PARTIAL | MISSING |
|----------|-------|------|---------|---------|
| Feature Flags (4.1) | 5 | 0 | 0 | 5 |
| Licensing & Subscription (4.2) | 6 | 0 | 0 | 6 |
| White-Label & Theming (4.3) | 6 | 0 | 2 | 4 |
| Multi-Municipality (4.4) | 6 | 0 | 0 | 6 |
| Enterprise Reporting (4.5) | 5 | 0 | 2 | 3 |
| API Management (4.6) | 5 | 0 | 0 | 5 |
| **TOTAL** | **33** | **0 (0%)** | **4 (12%)** | **29 (88%)** |

### Priority Order

Based on commercial value and dependency chains:

**Week 1-2: Foundation**
1. 4.1.1 Feature Flag Infrastructure
2. 4.1.2 Feature Flag SDK Integration
3. 4.2.1 Subscription Tier Definitions
4. 4.2.3 Usage Metering

**Week 3-4: Subscription Management**
5. 4.2.2 Subscription Management API
6. 4.2.4 Usage Limit Enforcement
7. 4.2.5 Trial Management
8. 4.1.3 Feature Flag Admin UI

**Week 5-6: White-Label**
9. 4.3.1 Theme System Configuration
10. 4.3.2 Tenant Logo Management
11. 4.3.3 Custom Domain Support
12. 4.3.4 Email Branding

**Week 7-8: Multi-Tenant**
13. 4.4.1 Tenant Provisioning Automation
14. 4.4.2 Tenant Templates
15. 4.4.4 Multi-Tenant Analytics
16. 4.4.5 Tenant Health Monitoring

**Week 9-10: API & Reporting**
17. 4.6.1 API Key Management
18. 4.6.2 Rate Limiting
19. 4.5.1 Custom Report Builder
20. 4.5.2 Scheduled Reports

### Critical Blockers

| # | Blocker | Impact | Required By |
|---|---------|--------|-------------|
| 1 | Feature Flags | Cannot differentiate tiers | Commercial launch |
| 2 | Usage Metering | Cannot enforce limits | Commercial launch |
| 3 | Subscription API | Cannot manage billing | Commercial launch |
| 4 | Tenant Provisioning | Manual onboarding | Scale operations |
| 5 | Rate Limiting | API abuse risk | API launch |

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Feature flag coverage | 0% | 100% | Core features flagged |
| Subscription tiers | 0 | 4 | Tiers defined |
| White-label options | 25% | 100% | Branding configurable |
| Tenant automation | 0% | 100% | Automated provisioning |
| API management | 0% | 100% | Keys, limits, docs |

### Dependencies on Later Phases

| This Phase Item | Required By |
|-----------------|-------------|
| Feature Flags | Phase 6 (AI feature gating) |
| Usage Metering | Phase 5 (Observability metrics) |
| Multi-Tenant Analytics | Phase 6 (AI anomaly detection) |
| API Management | External integrations |

### Commercial Tier Feature Matrix

| KRAV ID | Requirement | Free | Basic | Pro | Enterprise |
|---------|-------------|------|-------|-----|------------|
| KRAV-SYS-01 | Multi-tenant | Yes | Yes | Yes | Yes |
| KRAV-ADM-05 | Seasonal leases | No | No | Yes | Yes |
| KRAV-INT-01 | Vipps payment | Yes | Yes | Yes | Yes |
| KRAV-INT-02 | Visma ERP | No | No | Yes | Yes |
| KRAV-RPT-01 | Basic reports | Yes | Yes | Yes | Yes |
| KRAV-RPT-02 | Custom reports | No | No | Yes | Yes |
| KRAV-API-01 | API access | No | Read | Full | Full |
| KRAV-WHL-01 | White-label | No | No | Yes | Full |

---

*Document generated as part of Enterprise Platform Roadmap (Task 041)*
*Based on analysis files: sdk-services.md, api-routes.md, app-backoffice.md*
