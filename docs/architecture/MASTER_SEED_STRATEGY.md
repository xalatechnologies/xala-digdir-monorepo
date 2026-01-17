# 🎯 **MASTER SEED STRATEGY - COMPLETE SCHEMA COVERAGE**

## 📊 **Schema Analysis (217 Tables)**

From complete-database-schema.json:
- **Platform Schema:** 70 tables, 352 columns
- **Domain Schema:** 115 tables, 723 columns  
- **Monitoring Schema:** 12 tables, 107 columns
- **Compliance Schema:** 20 tables, 121 columns

---

## 🗂️ **Complete Entity Catalog (By Priority)**

### **Tier 1: Foundation (Must Seed First)**
Core platform entities required for system operation.

#### Platform Foundation
1. ✅ **Tenants** - Multi-tenant root
2. ✅ **Organizations** - Organizational hierarchy
3. ✅ **Users** - System users
4. ⏳ **Roles** - RBAC roles
5. ⏳ **Permissions** - RBAC permissions
6. ⏳ **Role Permissions** - Role-permission mapping

#### SaaS Administration
7. ⏳ **Subscription Plans** - `saas.plans`
8. ⏳ **Plan Features** - `saas.plan_features`
9. ⏳ **Tenant Subscriptions** - `saas.tenant_subscriptions`
10. ⏳ **Licenses** - `saas.licenses`
11. ⏳ **Feature Flags** - `saas.feature_flags`
12. ⏳ **Tenant Feature Flags** - `saas.tenant_feature_flags`

#### Billing & Payments
13. ⏳ **Payment Methods** - `billing.payment_methods`
14. ⏳ **Invoices** - `billing.invoices`
15. ⏳ **Invoice Line Items** - `billing.invoice_line_items`
16. ⏳ **Payments** - `billing.payments`
17. ⏳ **Credit Notes** - `billing.credit_notes`

---

### **Tier 2: Business Logic (Core Domain)**
Essential domain entities.

#### Catalog & Resources
18. ✅ **Rental Object Categories** - `domain.categories`
19. ✅ **Rental Objects** - `domain.rental_objects`
20. ✅ **Amenities** - `domain.amenities`
21. ✅ **Amenity Groups** - `domain.amenity_groups`
22. ✅ **Add-ons** - `domain.addons`
23. ⏳ **Rental Object Media** - `domain.rental_object_media`
24. ⏳ **Opening Hours** - `domain.opening_hours`

#### Pricing & Availability
25. ✅ **Pricing Groups** - `platform.pricing_groups`
26. ⏳ **Price Rules** - `domain.price_rules`
27. ⏳ **Exception Days** - `domain.exception_days`
28. ⏳ **Time Blocks** - `domain.time_blocks`
29. ⏳ **Rental Object Pricing** - `domain.rental_object_pricing`

#### Bookings & Reservations
30. ✅ **Bookings** - `domain.bookings`
31. ⏳ **Booking Add-ons** - `domain.booking_addons`
32. ⏳ **Recurring Series** - `domain.recurring_series`
33. ⏳ **Recurring Instances** - `domain.recurring_instances`
34. ⏳ **Booking Approvals** - `domain.booking_approvals`

---

### **Tier 3: User Experience (UX Features)**
User-facing features and preferences.

#### User Preferences & Activity
35. ⏳ **User Profiles** - `domain.user_profiles`
36. ⏳ **User Favorites** - `domain.favorites`
37. ⏳ **Recently Viewed** - `domain.recently_viewed`
38. ⏳ **Saved Searches** - `domain.saved_searches`
39. ⏳ **User Preferences** - `platform.user_preferences`

#### Messaging & Communication
40. ⏳ **Conversations** - `domain.conversations`
41. ⏳ **Messages** - `domain.messages`
42. ⏳ **Notifications** - `domain.notifications`
43. ⏳ **Notification Templates** - `domain.notification_templates`
44. ⏳ **Notification Delivery** - `domain.notification_delivery`

#### Reviews & Feedback
45. ⏳ **Reviews** - `domain.reviews`
46. ⏳ **Ratings** - `domain.ratings`
47. ⏳ **Feedback** - `domain.feedback`
48. ⏳ **Support Tickets** - `domain.support_tickets`

---

### **Tier 4: Advanced Features**
Advanced functionality and integrations.

#### Content & SEO
49. ⏳ **SEO Settings** - `domain.seo_settings`
50. ⏳ **Meta Tags** - `domain.meta_tags`
51. ⏳ **Redirects** - `domain.redirects`
52. ⏳ **Sitemaps** - `domain.sitemaps`

#### Documents & Templates
53. ⏳ **Document Templates** - `domain.document_templates`
54. ⏳ **Generated Documents** - `domain.generated_documents`
55. ⏳ **Template Variables** - `domain.template_variables`

#### Search & Discovery
56. ⏳ **Search Indexes** - `domain.search_indexes`
57. ⏳ **Search Queries** - `domain.search_queries`
58. ⏳ **Saved Filters** - `domain.saved_filters`
59. ⏳ **Filter Presets** - `domain.filter_presets`

#### Location & Geospatial
60. ⏳ **Locations** - `domain.locations`
61. ⏳ **Coordinates** - `domain.coordinates`
62. ⏳ **Geo Boundaries** - `domain.geo_boundaries`

---

### **Tier 5: Governance & Compliance**
Regulatory and compliance features.

#### GDPR & Privacy
63. ⏳ **Consent Records** - `compliance.consent_records`
64. ⏳ **Data Processing** - `compliance.data_processing_records`
65. ⏳ **Retention Policies** - `compliance.retention_policies`
66. ⏳ **Data Exports** - `compliance.data_exports`
67. ⏳ **Deletion Requests** - `compliance.deletion_requests`

#### Audit & Logging
68. ⏳ **Audit Logs** - `compliance.audit_logs`
69. ⏳ **Activity History** - `compliance.activity_history`
70. ⏳ **Change Logs** - `compliance.change_logs`

---

### **Tier 6: Monitoring & Observability**
System health and performance.

#### Monitoring
71. ⏳ **Request Logs** - `monitoring.request_logs`
72. ⏳ **Error Logs** - `monitoring.error_logs`
73. ⏳ **Job Runs** - `monitoring.job_runs`
74. ⏳ **Incident Logs** - `monitoring.incident_logs`
75. ⏳ **Health Checks** - `monitoring.health_checks`

#### Analytics
76. ⏳ **Page Views** - `monitoring.page_views`
77. ⏳ **User Sessions** - `monitoring.user_sessions`
78. ⏳ **Conversion Events** - `monitoring.conversion_events`

---

## 🎯 **Priority Implementation Plan**

### Phase 1: SaaS Foundation (Week 1)
**Goal:** Complete platform multi-tenancy & billing

```typescript
// New entity types to add:
type SaaSEntity = 
  | 'subscription_plan'
  | 'plan_feature'
  | 'tenant_subscription'
  | 'license'
  | 'feature_flag'
  | 'tenant_feature_flag';
```

**Schemas:**
- Subscription Plan
- Plan Features
- Tenant Subscriptions
- Licenses
- Feature Flags
- Tenant Feature Flags

**Example Seeds:**
- 5 subscription plans (Free, Starter, Professional, Enterprise, Custom)
- 20 plan features (per plan)
- 3 tenant subscriptions (active)
- 10 licenses per tenant

---

### Phase 2: Complete Domain (Week 2)
**Goal:** Full domain coverage

```typescript
// Extended domain entities:
type DomainEntity = 
  | 'price_rule'
  | 'exception_day'
  | 'time_block'
  | 'booking_addon'
  | 'recurring_series'
  | 'booking_approval';
```

**Schemas:**
- Price Rules
- Exception Days (holidays)
- Time Blocks (maintenance)
- Booking Add-ons
- Recurring Series
- Booking Approvals

---

### Phase 3: User Experience (Week 3)
**Goal:** Complete UX features

```typescript
// UX entities:
type UXEntity =
  | 'user_profile'
  | 'favorite'
  | 'recently_viewed'
  | 'saved_search'
  | 'conversation'
  | 'message'
  | 'notification'
  | 'review'
  | 'rating';
```

---

### Phase 4: Governance & Monitoring (Week 4)
**Goal:** Complete compliance & observability

```typescript
// Governance entities:
type GovernanceEntity =
  | 'consent_record'
  | 'data_processing_record'
  | 'retention_policy'
  | 'audit_log'
  | 'request_log'
  | 'error_log';
```

---

## 📋 **Enum Catalog (Auto-Seed)**

All enums should be automatically seeded from schema:

### Platform Enums
- `user_status`: active, inactive, suspended
- `user_role`: admin, manager, staff, member, user
- `tenant_status`: active, suspended, trial
- `subscription_status`: active, cancelled, expired, trial

### Domain Enums
- `rental_object_type`: SPACE, EQUIPMENT, VENUE
- `rental_object_status`: draft, published, archived
- `time_mode`: PERIOD, HOURLY, DAILY
- `booking_status`: PENDING, CONFIRMED, CANCELLED, COMPLETED
- `booking_mode`: SINGLE, RECURRING
- `payment_status`: PENDING, PAID, FAILED, REFUNDED

### Organization Enums
- `organization_type`: MUNICIPALITY, CLUB, NONPROFIT, BUSINESS
- `organization_member_role`: OWNER, ADMIN, MANAGER, MEMBER

### Pricing Enums
- `pricing_model`: PER_BOOKING, PER_HOUR, PER_DAY, PER_UNIT
- `discount_type`: member, student, nonprofit, early_bird

---

## 🤖 **AI Prompt Strategy**

### Comprehensive Prompt Template
```
You are a seed data generator for a Norwegian SaaS booking platform.

CONTEXT:
- Platform: Digilist (multi-tenant booking system)
- Target: {entity_type}
- Count: {count}
- Tenant: {tenant_name}
- Norwegian-first (Norwegian text, addresses, names)

DATABASE SCHEMA:
- 217 tables
- 4 schemas (platform, domain, monitoring, compliance)
- Full schema available in complete-database-schema.json

ENTITY SCHEMA:
{json_schema}

REQUIREMENTS:
- Valid UUIDs for all IDs
- Norwegian text (names, descriptions, addresses)
- Real Norwegian cities, postal codes
- Referential integrity (valid FK IDs)
- Realistic data (pricing, dates, quantities)
- Enum compliance (use exact values from schema)

EXAMPLES:
{example_data}

${custom_instructions}

OUTPUT: Return ONLY valid JSON array matching the schema.
```

---

## 🎨 **Updated UI Architecture**

### Grouped Entity Selection
```tsx
<select value={entityType}>
  <optgroup label="🏢 Platform Foundation">
    <option value="tenant">Tenants</option>
    <option value="organization">Organizations</option>
    <option value="user">Users</option>
    <option value="role">Roles (RBAC)</option>
    <option value="permission">Permissions</option>
  </optgroup>

  <optgroup label="💰 SaaS & Billing">
    <option value="subscription_plan">Subscription Plans</option>
    <option value="plan_feature">Plan Features</option>
    <option value="tenant_subscription">Tenant Subscriptions</option>
    <option value="license">Licenses</option>
    <option value="feature_flag">Feature Flags</option>
    <option value="invoice">Invoices</option>
    <option value="payment">Payments</option>
  </optgroup>

  <optgroup label="🏠 Domain Resources">
    <option value="rental_object">Rental Objects</option>
    <option value="amenity">Amenities</option>
    <option value="addon">Add-ons</option>
    <option value="category">Categories</option>
  </optgroup>

  <optgroup label="📅 Bookings & Pricing">
    <option value="booking">Bookings</option>
    <option value="pricing_group">Pricing Groups</option>
    <option value="price_rule">Price Rules</option>
    <option value="exception_day">Exception Days</option>
  </optgroup>

  <optgroup label="👥 Users & Social">
    <option value="user_profile">User Profiles</option>
    <option value="favorite">Favorites</option>
    <option value="review">Reviews</option>
    <option value="conversation">Conversations</option>
  </optgroup>

  <optgroup label="🔒 Compliance & Audit">
    <option value="consent_record">Consent Records</option>
    <option value="audit_log">Audit Logs</option>
    <option value="retention_policy">Retention Policies</option>
  </optgroup>

  <optgroup label="📊 Monitoring">
    <option value="request_log">Request Logs</option>
    <option value="error_log">Error Logs</option>
    <option value="job_run">Job Runs</option>
  </optgroup>
</select>
```

---

## 📦 **Batch Seeding Workflows**

### Complete Tenant Setup
```typescript
async function seedCompleteTenant(tenantName: string) {
  // 1. Foundation
  const tenant = await generateSeeds('tenant', 1, { name: tenantName });
  const orgs = await generateSeeds('organization', 5, { tenantId: tenant[0].id });
  const users = await generateSeeds('user', 20, { tenantId: tenant[0].id });
  
  // 2. SaaS
  const subscription = await generateSeeds('tenant_subscription', 1, { 
    tenantId: tenant[0].id,
    planId: 'professional' 
  });
  const flags = await generateSeeds('tenant_feature_flag', 10, { tenantId: tenant[0].id });
  
  // 3. Domain
  const objects = await generateSeeds('rental_object', 40, { tenantId: tenant[0].id });
  const amenities = await generateSeeds('amenity', 30, { tenantId: tenant[0].id });
  
  // 4. Bookings
  const bookings = await generateSeeds('booking', 100, { tenantId: tenant[0].id });
  
  // 5. Compliance
  const consents = await generateSeeds('consent_record', 20, { tenantId: tenant[0].id });
  
  return { tenant, orgs, users, objects, bookings };
}
```

---

## ✅ **Success Metrics**

- **Coverage:** 80+ entity types (from 217 tables)
- **Speed:** Generate complete tenant in < 5 minutes
- **Quality:** 95%+ schema validation pass rate
- **Realism:** Norwegian-first, production-quality data
- **Completeness:** All FK relationships satisfied

---

**Next Steps:**
1. ✅ Schema analysis complete
2. ⏳ Add SaaS entity schemas
3. ⏳ Add billing entity schemas
4. ⏳ Add compliance entity schemas
5. ⏳ Update AI generator service
6. ⏳ Update JSON→SQL converters
7. ⏳ Implement batch workflows

**Target:** 80+ seedable entities by end of month! 🚀
